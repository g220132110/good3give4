// Good English, Good Life — 後端代理（Cloudflare Workers）
//
// 前端只送「任務名稱＋使用者文字」，提示詞、金鑰、用量上限都在這裡。
// 路由：POST /api/rewrite  /api/chat  /api/analyze  /api/describe   GET /api/health

import { LEVELS } from "./rubric.js";
import { REWRITE_CONTEXTS, rewriteSystem, retrySystem, rewriteUser, chatSystem, analyzeSystem, transcript, describeSystem } from "./prompts.js";
import { parseJSON, cleanRewrite, cleanChat, cleanAnalyze, cleanDescribe } from "./schema.js";
import { PICTURES } from "./pictures.js";
import { SCENARIOS } from "./scenarios.js";
import { pickProvider } from "./providers.js";
import { mockRewrite } from "./mock.js";

const MAX_TEXT = 300;

// ---------- 共用 ----------

function corsHeaders(req, env) {
  const origin = req.headers.get("origin") || "";
  const allowed = (env.ALLOWED_ORIGINS || "").split(",").map((s) => s.trim()).filter(Boolean);
  const ok = allowed.length === 0 || allowed.includes(origin);
  return {
    ok,
    headers: {
      "access-control-allow-origin": ok && origin ? origin : allowed[0] || "*",
      "access-control-allow-methods": "POST, GET, OPTIONS",
      "access-control-allow-headers": "content-type, x-ep-device",
      "access-control-max-age": "86400",
      vary: "origin",
    },
  };
}

const json = (body, status, headers) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { "content-type": "application/json; charset=utf-8", ...headers },
  });

const fail = (code, message, status, headers) => json({ ok: false, error: code, message }, status, headers);

// 台灣時間的日期，用量每天 00:00 重算
const today = () => new Date(Date.now() + 8 * 3600e3).toISOString().slice(0, 10);

// ---------- 用量上限（需綁定 KV：QUOTA；沒綁定就不限制，方便本機開發） ----------

async function checkQuota(req, env) {
  if (!env.QUOTA) return { ok: true, used: 0, limit: 0 };
  const day = today();
  const device = (req.headers.get("x-ep-device") || "anon").replace(/[^\w-]/g, "").slice(0, 40) || "anon";
  const ip = req.headers.get("cf-connecting-ip") || "0";
  const limits = [
    [`q:${day}:d:${device}`, Number(env.DEVICE_DAILY_LIMIT || 60)],
    [`q:${day}:ip:${ip}`, Number(env.IP_DAILY_LIMIT || 200)],
    [`q:${day}:all`, Number(env.GLOBAL_DAILY_LIMIT || 3000)],
  ];
  // KV 免費方案每天只能寫 1,000 次；計數出錯時寧可不限制，也不讓 AI 功能壞掉
  try {
    const counts = await Promise.all(limits.map(([k]) => env.QUOTA.get(k).then((v) => Number(v || 0))));
    const over = counts.findIndex((c, i) => c >= limits[i][1]);
    if (over >= 0) return { ok: false, scope: ["device", "ip", "global"][over] };
    await Promise.all(
      limits.map(([k], i) => env.QUOTA.put(k, String(counts[i] + 1), { expirationTtl: 2 * 86400 })),
    );
    return { ok: true, used: counts[0] + 1, limit: limits[0][1] };
  } catch (err) {
    console.error("quota skipped:", err.message);
    return { ok: true, used: 0, limit: 0 };
  }
}

// ---------- 呼叫模型：格式錯誤重試一次 ----------

async function runModel(provider, env, system, user, clean) {
  let lastErr;
  for (let attempt = 0; attempt < 2; attempt++) {
    try {
      const text = await provider.complete({ system, user, env });
      return clean(parseJSON(text));
    } catch (err) {
      lastErr = err;
      if (err.provider) break; // 連線問題已由備用模型處理；只有格式錯誤才重試
    }
  }
  throw lastErr;
}

// ---------- 任務：rewrite（Say It Better） ----------

async function handleRewrite(body, env) {
  const text = typeof body.text === "string" ? body.text.trim() : "";
  const previous = typeof body.previous === "string" ? body.previous.trim() : "";
  const level = LEVELS.includes(body.level) ? body.level : "B1";
  const context = Object.hasOwn(REWRITE_CONTEXTS, body.context || "") ? body.context : "free";
  // 對話的 Try Again：帶情境與對方說的話，讓分析有上下文
  const scenario = Object.hasOwn(SCENARIOS, body.scenario || "") ? SCENARIOS[body.scenario] : null;
  const prompt = typeof body.prompt === "string" ? body.prompt.trim().slice(0, MAX_TEXT) : "";
  if (!text) return { status: 400, error: "empty", message: "請先輸入或說出一句英文。" };
  if (text.length > MAX_TEXT || previous.length > MAX_TEXT)
    return { status: 400, error: "too_long", message: `一次最多 ${MAX_TEXT} 個字元。` };

  const retry = Boolean(previous);
  const provider = pickProvider(env);
  if (!provider) return { data: mockRewrite({ text, previous }), demo: true };

  try {
    const data = await runModel(
      provider,
      env,
      retry ? retrySystem(level) : rewriteSystem(level),
      rewriteUser({ text, context, previous, scenario, prompt }),
      (raw) => cleanRewrite(raw, { retry }),
    );
    return { data, demo: false };
  } catch (err) {
    console.error("rewrite failed:", err.message);
    return { data: mockRewrite({ text, previous }), demo: true, reason: err.busy ? "busy" : "error" };
  }
}

// ---------- 任務：chat、analyze（對話引擎） ----------
// 失敗時回傳 busy，由前端決定改用內容包示範或請使用者再送一次（對話內容無法用固定示範接續）。

function readDialogue(body) {
  if (!Object.hasOwn(SCENARIOS, body.scenario || "")) return { error: { status: 400, error: "scenario", message: "找不到這個情境。" } };
  const scenario = SCENARIOS[body.scenario];
  const raw = Array.isArray(body.history) ? body.history : [];
  if (raw.length > scenario.maxTurns * 2) return { error: { status: 400, error: "too_long", message: "對話太長了。" } };
  const history = [];
  for (const h of raw) {
    const text = typeof h?.text === "string" ? h.text.trim() : "";
    if (!text || text.length > MAX_TEXT || !["user", "ai"].includes(h.role))
      return { error: { status: 400, error: "bad_history", message: `每句最多 ${MAX_TEXT} 個字元。` } };
    history.push({ role: h.role, text });
  }
  const level = LEVELS.includes(body.level) ? body.level : "B1";
  return { scenario, history, level, userTurns: history.filter((h) => h.role === "user").length };
}

const busy = (err) => ({
  status: 503,
  error: "busy",
  message: err && err.status === 404 ? "AI 模型設定有誤，請通知管理者。" : "AI 目前使用的人太多，稍等幾秒再送出一次就好。",
});

async function handleChat(body, env) {
  const d = readDialogue(body);
  if (d.error) return d.error;
  if (!d.history.length || d.history.at(-1).role !== "user")
    return { status: 400, error: "bad_history", message: "請先說一句話。" };
  const provider = pickProvider(env);
  if (!provider) return busy();
  const lastTurn = d.userTurns >= d.scenario.maxTurns;
  try {
    const data = await runModel(
      provider,
      env,
      chatSystem(d.scenario, d.level, lastTurn),
      `Conversation so far:\n${transcript(d.scenario, d.history)}\n\nReply as the other person.`,
      cleanChat,
    );
    if (lastTurn) data.done = true;
    return { data, demo: false };
  } catch (err) {
    console.error("chat failed:", err.message);
    return busy(err);
  }
}

async function handleAnalyze(body, env) {
  const d = readDialogue(body);
  if (d.error) return d.error;
  if (!d.userTurns) return { status: 400, error: "bad_history", message: "對話裡還沒有你的回答。" };
  const provider = pickProvider(env);
  if (!provider) return busy();
  try {
    const data = await runModel(
      provider,
      env,
      analyzeSystem(d.scenario, d.level),
      `Transcript:\n${transcript(d.scenario, d.history)}`,
      (raw) => cleanAnalyze(raw, d.userTurns),
    );
    return { data, demo: false };
  } catch (err) {
    console.error("analyze failed:", err.message);
    return busy(err);
  }
}

// ---------- 任務：describe（看圖說好話） ----------

async function handleDescribe(body, env) {
  if (!Object.hasOwn(PICTURES, body.picture || "")) return { status: 400, error: "picture", message: "找不到這張圖。" };
  const text = typeof body.text === "string" ? body.text.trim() : "";
  const previous = typeof body.previous === "string" ? body.previous.trim() : "";
  if (!text) return { status: 400, error: "empty", message: "請先用英文說說看圖裡發生什麼事。" };
  if (text.length > MAX_TEXT * 2 || previous.length > MAX_TEXT * 2)
    return { status: 400, error: "too_long", message: `一次最多 ${MAX_TEXT * 2} 個字元。` };
  const picture = PICTURES[body.picture];
  const level = LEVELS.includes(body.level) ? body.level : picture.level || "B1";
  const story = Array.isArray(picture.panels);
  const provider = pickProvider(env);
  if (!provider) return busy();
  const retry = Boolean(previous);
  try {
    const data = await runModel(
      provider,
      env,
      describeSystem(picture, level, retry),
      `Learner's ${story ? "story" : "description"}: """${text}"""${retry ? `\nPrevious attempt: """${previous}"""` : ""}`,
      (raw) => cleanDescribe(raw, { retry, story }),
    );
    return { data, demo: false };
  } catch (err) {
    console.error("describe failed:", err.message);
    return busy(err);
  }
}

const TASKS = { rewrite: handleRewrite, chat: handleChat, analyze: handleAnalyze, describe: handleDescribe };

// ---------- 入口 ----------

export default {
  async fetch(req, env) {
    const url = new URL(req.url);
    const cors = corsHeaders(req, env);

    if (req.method === "OPTIONS") return new Response(null, { status: 204, headers: cors.headers });
    if (!cors.ok) return fail("origin", "不允許的來源。", 403, cors.headers);

    if (url.pathname === "/api/health") {
      const p = pickProvider(env);
      const out = { ok: true, provider: p ? p.name : "demo", model: p ? env.AI_MODEL || p.defaultModel : "" };
      // /api/health?deep=1：真的呼叫一次模型並回報結果，用來排查設定問題（會消耗 1 次額度）
      if (p && url.searchParams.get("deep") === "1") {
        try {
          const text = await p.complete({ system: rewriteSystem("A2"), user: rewriteUser({ text: "Give me the menu.", context: "restaurant" }), env });
          cleanRewrite(parseJSON(text));
          out.test = "ok";
          if (p.lastModel) out.answeredBy = p.lastModel;
        } catch (err) {
          out.ok = false;
          out.test = "failed";
          out.error = String(err.message || err).replace(/key=[^&\s]+/g, "key=***").slice(0, 400);
        }
      }
      return json(out, 200, cors.headers);
    }

    const task = url.pathname.match(/^\/api\/(\w+)$/)?.[1];
    if (!task || !TASKS[task]) return fail("not_found", "找不到這個功能。", 404, cors.headers);
    if (req.method !== "POST") return fail("method", "只接受 POST。", 405, cors.headers);

    let body;
    try {
      body = await req.json();
    } catch {
      return fail("bad_json", "資料格式錯誤。", 400, cors.headers);
    }

    const quota = await checkQuota(req, env);
    if (!quota.ok)
      return fail("quota", "今天的 AI 練習次數已用完，明天再來，或先用示範內容練習。", 429, cors.headers);

    const r = await TASKS[task](body, env);
    if (r.error) return fail(r.error, r.message, r.status, cors.headers);
    return json(
      { ok: true, demo: r.demo, reason: r.reason, data: r.data, quota: { used: quota.used, limit: quota.limit } },
      200,
      cors.headers,
    );
  },
};
