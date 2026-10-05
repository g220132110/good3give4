// 執行：node --test worker/test/*.mjs
import test from "node:test";
import assert from "node:assert/strict";
import worker from "../src/index.js";
import { cleanRewrite, parseJSON } from "../src/schema.js";

const call = (path, body, env = {}, headers = {}) =>
  worker.fetch(
    new Request(`http://x${path}`, {
      method: body === undefined ? "GET" : "POST",
      headers: { "content-type": "application/json", ...headers },
      body: body === undefined ? undefined : JSON.stringify(body),
    }),
    env,
  );

const fakeKV = () => {
  const m = new Map();
  return { get: async (k) => m.get(k) ?? null, put: async (k, v) => void m.set(k, v) };
};

test("health 回報示範模式", async () => {
  const r = await (await call("/api/health")).json();
  assert.equal(r.provider, "demo");
});

test("沒有金鑰時回傳示範結果", async () => {
  const r = await (await call("/api/rewrite", { text: "Give me the menu.", level: "A2", context: "restaurant" })).json();
  assert.equal(r.ok, true);
  assert.equal(r.demo, true);
  assert.equal(r.data.tone.label, "直接");
  assert.ok(r.data.better.length >= 2);
});

test("Try Again 有 compare", async () => {
  const r = await (await call("/api/rewrite", { text: "Could I have the menu, please?", previous: "Give me the menu." })).json();
  assert.equal(r.data.compare.improved, true);
});

test("空白與過長輸入被擋下", async () => {
  assert.equal((await call("/api/rewrite", { text: "  " })).status, 400);
  assert.equal((await call("/api/rewrite", { text: "a".repeat(301) })).status, 400);
});

test("不允許的來源被擋下", async () => {
  const res = await call("/api/rewrite", { text: "hi" }, { ALLOWED_ORIGINS: "https://good.example" }, { origin: "https://evil.example" });
  assert.equal(res.status, 403);
});

test("用量上限", async () => {
  const env = { QUOTA: fakeKV(), DEVICE_DAILY_LIMIT: "2" };
  const h = { "x-ep-device": "abc" };
  assert.equal((await call("/api/rewrite", { text: "hi" }, env, h)).status, 200);
  assert.equal((await call("/api/rewrite", { text: "hi" }, env, h)).status, 200);
  assert.equal((await call("/api/rewrite", { text: "hi" }, env, h)).status, 429);
});

test("清理模型輸出：去掉未知名稱、補上限制", () => {
  const raw = parseJSON('```json\n{"tone":{"label":"直接","note":"n"},"fixes":[{"from":"a","to":"b","note":"c"}],"better":[{"en":"Could you?","zh":"可以嗎","why":"w","giving":"給人快樂"}],"acts":[{"name":"說好話","evidence":"e"},{"name":"很善良","evidence":"x"}],"givings":[],"keys":["could"]}\n```');
  const out = cleanRewrite(raw);
  assert.equal(out.better[0].giving, "");
  assert.deepEqual(out.acts.map((a) => a.name), ["說好話"]);
});

test("格式錯誤時重試，兩次都錯就改回示範", async () => {
  const realFetch = globalThis.fetch;
  let n = 0;
  globalThis.fetch = async () => {
    n++;
    return new Response(JSON.stringify({ content: [{ type: "text", text: n === 1 ? "not json" : '{"tone":{"label":"禮貌","note":"好"},"fixes":[],"better":[{"en":"Thanks!","zh":"謝謝","why":"w","giving":"給人歡喜"}],"acts":[],"givings":[],"keys":[]}' }] }));
  };
  try {
    const r = await (await call("/api/rewrite", { text: "Thanks" }, { ANTHROPIC_API_KEY: "k" })).json();
    assert.equal(n, 2);
    assert.equal(r.demo, false);
    assert.equal(r.data.tone.label, "禮貌");

    n = -10; // 一直回傳錯誤格式
    globalThis.fetch = async () => new Response(JSON.stringify({ content: [{ type: "text", text: "oops" }] }));
    const r2 = await (await call("/api/rewrite", { text: "Thanks" }, { ANTHROPIC_API_KEY: "k" })).json();
    assert.equal(r2.demo, true);
  } finally {
    globalThis.fetch = realFetch;
  }
});

test("KV 寫入失敗時不影響 AI 功能", async () => {
  const env = { QUOTA: { get: async () => null, put: async () => { throw new Error("KV put() limit exceeded"); } } };
  const res = await call("/api/rewrite", { text: "hi" }, env, { "x-ep-device": "abc" });
  assert.equal(res.status, 200);
});

test("Gemini：關閉思考、截斷時報錯、deep 健康檢查回報錯誤", async () => {
  const realFetch = globalThis.fetch;
  let sent;
  globalThis.fetch = async (url, init) => {
    sent = JSON.parse(init.body);
    return new Response(JSON.stringify({ candidates: [{ finishReason: "MAX_TOKENS", content: { parts: [{ text: '{"tone":' }] } }] }));
  };
  try {
    const r = await (await call("/api/health?deep=1", undefined, { GEMINI_API_KEY: "k", AI_MODEL: "gemini-2.5-flash" })).json();
    assert.equal(sent.generationConfig.thinkingConfig.thinkingBudget, 0);
    assert.equal(r.test, "failed");
    assert.match(r.error, /MAX_TOKENS/);
  } finally {
    globalThis.fetch = realFetch;
  }
});

test("Gemini 太忙時改用備用模型；全部失敗時回報 busy", async () => {
  const realFetch = globalThis.fetch;
  const tried = [];
  const good = '{"tone":{"label":"禮貌","note":"好"},"fixes":[],"better":[{"en":"Thanks!","zh":"謝謝","why":"w","giving":""}],"acts":[],"givings":[],"keys":[]}';
  globalThis.fetch = async (url) => {
    const m = String(url).match(/models\/([^:]+)/)[1];
    tried.push(m);
    if (m === "gemini-3.8-flash") return new Response("busy", { status: 503 });
    if (m === "gemini-3.8-flash-lite") return new Response("nope", { status: 404 });
    return new Response(JSON.stringify({ candidates: [{ finishReason: "STOP", content: { parts: [{ text: good }] } }] }));
  };
  try {
    const r = await (await call("/api/rewrite", { text: "Thanks" }, { GEMINI_API_KEY: "k", AI_PROVIDER: "gemini" })).json();
    assert.equal(r.demo, false);
    assert.deepEqual(tried, ["gemini-3.8-flash", "gemini-3.8-flash-lite", "gemini-3.7-flash"]);

    globalThis.fetch = async () => new Response("busy", { status: 503 });
    const r2 = await (await call("/api/rewrite", { text: "Thanks" }, { GEMINI_API_KEY: "k", AI_PROVIDER: "gemini" })).json();
    assert.equal(r2.demo, true);
    assert.equal(r2.reason, "busy");
  } finally {
    globalThis.fetch = realFetch;
  }
});

// ---------- 對話引擎 ----------
const gem = (text) => async () => new Response(JSON.stringify({ candidates: [{ finishReason: "STOP", content: { parts: [{ text }] } }] }));
const GEM = { GEMINI_API_KEY: "k", AI_PROVIDER: "gemini" };

test("chat：情境與輸入檢查", async () => {
  assert.equal((await call("/api/chat", { scenario: "nope", history: [] })).status, 400);
  assert.equal((await call("/api/chat", { scenario: "toString", history: [] })).status, 400);
  assert.equal((await call("/api/chat", { scenario: "exam-fail", history: [] })).status, 400);
  assert.equal((await call("/api/chat", { scenario: "exam-fail", history: [{ role: "user", text: "x".repeat(301) }] })).status, 400);
  // 沒有金鑰：回報 busy，讓前端改用示範
  const r = await call("/api/chat", { scenario: "exam-fail", history: [{ role: "user", text: "Don't give up." }] });
  assert.equal(r.status, 503);
  assert.equal((await r.json()).error, "busy");
});

test("chat：角色回話；最後一輪強制結束", async () => {
  const realFetch = globalThis.fetch;
  let sentSystem = "";
  globalThis.fetch = async (url, init) => {
    sentSystem = JSON.parse(init.body).systemInstruction.parts[0].text;
    return gem('{"reply":"Thanks, that helps.","hint":"可以約他一起讀書","done":false}')();
  };
  try {
    const h1 = [{ role: "user", text: "Don't give up." }];
    const r1 = await (await call("/api/chat", { scenario: "exam-fail", level: "A2", history: h1 }, GEM)).json();
    assert.equal(r1.data.reply, "Thanks, that helps.");
    assert.equal(r1.data.done, false);
    assert.match(sentSystem, /Jamie/);
    const h4 = [];
    for (let i = 0; i < 4; i++) h4.push({ role: "user", text: "ok" }, { role: "ai", text: "ok" });
    h4.pop();
    const r4 = await (await call("/api/chat", { scenario: "exam-fail", history: h4 }, GEM)).json();
    assert.equal(r4.data.done, true);
    assert.match(sentSystem, /last turn/);
  } finally {
    globalThis.fetch = realFetch;
  }
});

test("analyze：清理輸出、retry 索引限制在範圍內", async () => {
  const realFetch = globalThis.fetch;
  globalThis.fetch = gem(JSON.stringify({
    summary: "你主動鼓勵朋友，很溫暖。", level: "B1", fixes: [],
    acts: [{ name: "說好話", evidence: "你說 Don't give up" }, { name: "很棒", evidence: "x" }],
    givings: [{ name: "給人信心", evidence: "你肯定他的努力" }],
    better: [{ you: "Don't give up.", en: "Don't give up. You worked so hard.", zh: "別放棄，你很努力了。", why: "肯定努力", giving: "給人信心" }],
    retry: { turn: 9, tip: "加一句具體的協助" },
  }));
  try {
    const history = [{ role: "user", text: "Don't give up." }, { role: "ai", text: "Thanks." }, { role: "user", text: "Bye." }];
    const r = await (await call("/api/analyze", { scenario: "exam-fail", history }, GEM)).json();
    assert.equal(r.ok, true);
    assert.deepEqual(r.data.acts.map((a) => a.name), ["說好話"]);
    assert.equal(r.data.retry.turn, 1);
  } finally {
    globalThis.fetch = realFetch;
  }
});

test("rewrite：對話 Try Again 帶情境上下文", async () => {
  const realFetch = globalThis.fetch;
  let userMsg = "";
  globalThis.fetch = async (url, init) => {
    userMsg = JSON.parse(init.body).contents[0].parts[0].text;
    return gem('{"tone":{"label":"溫暖","note":"好"},"fixes":[],"better":[{"en":"You can do it.","zh":"你可以的","why":"w","giving":""}],"acts":[],"givings":[],"keys":[],"compare":{"improved":true,"note":"進步了"}}')();
  };
  try {
    const r = await (await call("/api/rewrite", { text: "You can do it!", previous: "Bye.", scenario: "exam-fail", prompt: "I failed again." }, GEM)).json();
    assert.equal(r.data.compare.improved, true);
    assert.match(userMsg, /Jamie/);
    assert.match(userMsg, /I failed again/);
  } finally {
    globalThis.fetch = realFetch;
  }
});

test("chat：回傳中文翻譯", async () => {
  const realFetch = globalThis.fetch;
  globalThis.fetch = gem('{"reply":"Thank you!","zh":"謝謝你！","hint":"h","done":false}');
  try {
    const r = await (await call("/api/chat", { scenario: "good-news", history: [{ role: "user", text: "Congratulations!" }] }, GEM)).json();
    assert.equal(r.data.zh, "謝謝你！");
  } finally {
    globalThis.fetch = realFetch;
  }
});

test("Think Well／文化大使：角色指示、事實限制、5 輪上限", async () => {
  const realFetch = globalThis.fetch;
  let sys = "";
  globalThis.fetch = async (url, init) => {
    sys = JSON.parse(init.body).systemInstruction.parts[0].text;
    return gem('{"reply":"Oh, I see!","zh":"喔，我懂了！","hint":"h","done":false}')();
  };
  try {
    await call("/api/chat", { scenario: "teammate-mistake", history: [{ role: "user", text: "Ken ruined everything." }] }, GEM);
    assert.match(sys, /Coach Lee/);
    assert.match(sys, /imagine the other person's side/);
    assert.doesNotMatch(sys, /Never teach or correct/);
    await call("/api/chat", { scenario: "ambassador-three-acts", history: [{ role: "user", text: "It means doing good." }] }, GEM);
    assert.match(sys, /Venerable Master Hsing Yun/);
    assert.match(sys, /Never add facts/);
    const h = [];
    for (let i = 0; i < 5; i++) h.push({ role: "user", text: "ok" }, { role: "ai", text: "ok" });
    h.pop();
    const r = await (await call("/api/chat", { scenario: "ambassador-three-acts", history: h }, GEM)).json();
    assert.equal(r.data.done, true);
    const r2 = await call("/api/analyze", { scenario: "ambassador-three-acts", history: [{ role: "user", text: "Good deeds." }] }, GEM);
    assert.match(sys, /matched these facts/);
    assert.equal(r2.status, 503); // 假回應不是分析格式 → 回報 busy
  } finally {
    globalThis.fetch = realFetch;
  }
});

test("Gemini：逾時視為忙碌並改用備用模型", async () => {
  const realFetch = globalThis.fetch;
  const tried = [];
  globalThis.fetch = async (url) => {
    const m = String(url).match(/models\/([^:]+)/)[1];
    tried.push(m);
    if (m === "gemini-3.8-flash") { const e = new Error("aborted"); e.name = "AbortError"; throw e; }
    return gem('{"reply":"Hi!","zh":"嗨！","hint":"h","done":false}')();
  };
  try {
    const r = await (await call("/api/chat", { scenario: "good-news", history: [{ role: "user", text: "Wow!" }] }, GEM)).json();
    assert.equal(r.data.reply, "Hi!");
    assert.deepEqual(tried.slice(0, 2), ["gemini-3.8-flash", "gemini-3.8-flash-lite"]);
  } finally {
    globalThis.fetch = realFetch;
  }
});

test("describe：圖片檢查、說明送給 AI、清理輸出", async () => {
  assert.equal((await call("/api/describe", { picture: "nope", text: "hi" })).status, 400);
  assert.equal((await call("/api/describe", { picture: "pt-stairs", text: " " })).status, 400);
  assert.equal((await call("/api/describe", { picture: "pt-stairs", text: "An old woman." })).status, 503); // 沒金鑰 → busy
  const realFetch = globalThis.fetch;
  let sys = "";
  globalThis.fetch = async (url, init) => {
    sys = JSON.parse(init.body).systemInstruction.parts[0].text;
    return gem(JSON.stringify({ summary: "很好", level: "A2", saw: ["長輩爬樓梯"], understood: ["她很累"], notice: ["她在流汗", "x", "y", "z"], fixes: [],
      acts: [{ name: "做好事", evidence: "你說 I can help" }], givings: [], better: [{ en: "Can I carry your bags?", zh: "我可以幫你提袋子嗎？", why: "w", giving: "給人方便" }],
      compare: { improved: true, note: "進步了" } }))();
  };
  try {
    const r = await (await call("/api/describe", { picture: "pt-stairs", text: "An old woman carry bags. I can help.", previous: "Old woman." }, GEM)).json();
    assert.match(sys, /elderly woman/);
    assert.match(sys, /compare/);
    assert.equal(r.data.notice.length, 3);
    assert.deepEqual(r.data.understood, ["她很累"]);
    assert.match(sys, /CEFR A2/); // 沒送 level 時用圖的建議程度
    assert.equal(r.data.story, undefined);
    assert.equal(r.data.compare.improved, true);
  } finally {
    globalThis.fetch = realFetch;
  }
});

test("describe：三格故事與 B2 推想圖", async () => {
  const realFetch = globalThis.fetch;
  let sys = "";
  globalThis.fetch = async (url, init) => {
    sys = JSON.parse(init.body).systemInstruction.parts[0].text;
    return gem(JSON.stringify({ summary: "很好", level: "A2", saw: ["a"], understood: [], notice: [], fixes: [], acts: [], givings: [], better: [],
      story: { order: "順序對", tense: "時態一致", used: ["First", "Then", "<b>x</b>"], try: ["After that", "Finally", "Next", "Later"] } }))();
  };
  try {
    const r = await (await call("/api/describe", { picture: "story-rain", text: "First it rained. Then she shared her umbrella." }, GEM)).json();
    assert.match(sys, /Panel 3/);
    assert.match(sys, /"story"/);
    assert.deepEqual(r.data.story.used, ["First", "Then"]);
    assert.equal(r.data.story.try.length, 3);
    await call("/api/describe", { picture: "pt-cut-line", text: "A man cut the line." }, GEM);
    assert.match(sys, /thinking picture/);
    assert.match(sys, /CEFR B2/);
  } finally {
    globalThis.fetch = realFetch;
  }
});
