import { ACTS, GIVINGS, TONES } from "./rubric.js";

// 把模型回傳的文字整理成固定格式。格式不對就丟出錯誤，讓呼叫端重試一次。

export function parseJSON(text) {
  if (typeof text !== "string") throw new Error("empty model output");
  const s = text.indexOf("{"), e = text.lastIndexOf("}");
  if (s < 0 || e <= s) throw new Error("no JSON object in model output");
  return JSON.parse(text.slice(s, e + 1));
}

const str = (v, max = 200) => (typeof v === "string" ? v.trim().slice(0, max) : "");
const arr = (v, max) => (Array.isArray(v) ? v.slice(0, max) : []);

const named = (list, allowed, max = 4) =>
  arr(list, max)
    .map((x) => ({ name: str(x?.name, 10), evidence: str(x?.evidence, 160) }))
    .filter((x) => allowed.includes(x.name) && x.evidence)
    .filter((x, i, a) => a.findIndex((y) => y.name === x.name) === i);

// 只差大小寫、標點、引號的「修正」不算錯（語音轉文字決定的），直接丟掉
const bare = (t) => t.toLowerCase().replace(/[^a-z0-9\u4e00-\u9fff]+/g, "");
const realFix = (f) => f.from && f.to && bare(f.from) !== bare(f.to);

export function cleanRewrite(raw, { retry = false } = {}) {
  if (!raw || typeof raw !== "object") throw new Error("not an object");
  const label = str(raw.tone?.label, 10);
  if (!TONES.includes(label)) throw new Error(`bad tone label: ${label}`);

  const out = {
    tone: { label, note: str(raw.tone?.note, 200) },
    fixes: arr(raw.fixes, 3)
      .map((f) => ({ from: str(f?.from, 80), to: str(f?.to, 80), note: str(f?.note, 120) }))
      .filter(realFix),
    better: arr(raw.better, 3)
      .map((b) => ({
        en: str(b?.en, 200),
        zh: str(b?.zh, 120),
        why: str(b?.why, 120),
        giving: GIVINGS.includes(b?.giving) ? b.giving : "",
      }))
      .filter((b) => b.en),
    acts: named(raw.acts, ACTS, 2),
    givings: named(raw.givings, GIVINGS, 2),
    // 重點字只留單字（前端用字典原形標示）；若 AI 給了片語就拆開取較長的字
    keys: [...new Set(arr(raw.keys, 3).flatMap((k) => str(k, 40).split(/\s+/)).filter((w) => /^[A-Za-z][A-Za-z'-]{2,}$/.test(w)))].slice(0, 3),
  };
  if (label !== "無法分析" && out.better.length === 0) throw new Error("no better versions");
  if (retry) {
    out.compare = {
      improved: raw.compare?.improved === true,
      note: str(raw.compare?.note, 240),
    };
    if (!out.compare.note) throw new Error("missing compare note");
  }
  return out;
}

export function cleanChat(raw) {
  const reply = str(raw?.reply, 300);
  if (!reply) throw new Error("empty reply");
  return { reply, zh: str(raw?.zh, 200), hint: str(raw?.hint, 120), done: raw?.done === true };
}

export function cleanAnalyze(raw, userTurns) {
  if (!raw || typeof raw !== "object") throw new Error("not an object");
  const summary = str(raw.summary, 300);
  if (!summary) throw new Error("missing summary");
  let turn = Number.isInteger(raw.retry?.turn) ? raw.retry.turn : userTurns - 1;
  if (turn < 0 || turn >= userTurns) turn = Math.max(0, userTurns - 1);
  return {
    summary,
    level: /^(A1|A2|B1|B2|C1|C2)$/.test(raw.level) ? raw.level : "",
    fixes: arr(raw.fixes, 3)
      .map((f) => ({ from: str(f?.from, 80), to: str(f?.to, 80), note: str(f?.note, 120) }))
      .filter(realFix),
    acts: named(raw.acts, ACTS),
    givings: named(raw.givings, GIVINGS),
    better: arr(raw.better, 2)
      .map((b) => ({
        you: str(b?.you, 300),
        en: str(b?.en, 200),
        zh: str(b?.zh, 120),
        why: str(b?.why, 120),
        giving: GIVINGS.includes(b?.giving) ? b.giving : "",
      }))
      .filter((b) => b.en),
    retry: { turn, tip: str(raw.retry?.tip, 120) },
  };
}

export function cleanDescribe(raw, { retry = false, story = false } = {}) {
  if (!raw || typeof raw !== "object") throw new Error("not an object");
  const summary = str(raw.summary, 300);
  if (!summary) throw new Error("missing summary");
  const list = (v, n) => arr(v, n).map((x) => str(x, 60)).filter(Boolean);
  const out = {
    summary,
    level: /^(A1|A2|B1|B2|C1|C2)$/.test(raw.level) ? raw.level : "",
    saw: list(raw.saw ?? raw.seen, 4),
    understood: list(raw.understood, 3),
    notice: list(raw.notice ?? raw.missed, 3),
    fixes: arr(raw.fixes, 3)
      .map((f) => ({ from: str(f?.from, 80), to: str(f?.to, 80), note: str(f?.note, 120) }))
      .filter(realFix),
    acts: named(raw.acts, ACTS, 2),
    givings: named(raw.givings, GIVINGS, 2),
    better: arr(raw.better, 2)
      .map((b) => ({ en: str(b?.en, 200), zh: str(b?.zh, 120), why: str(b?.why, 120), giving: GIVINGS.includes(b?.giving) ? b.giving : "" }))
      .filter((b) => b.en),
  };
  if (story) {
    const words = (v) => arr(v, 4).map((x) => str(x, 24)).filter((x) => /^[A-Za-z][A-Za-z ,'-]*$/.test(x));
    out.story = { order: str(raw.story?.order, 160), tense: str(raw.story?.tense, 160), used: words(raw.story?.used), try: words(raw.story?.try).slice(0, 3) };
  }
  if (retry) out.compare = { improved: raw.compare?.improved === true, note: str(raw.compare?.note, 240) };
  return out;
}
