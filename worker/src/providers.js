// 模型轉接層：同一個介面，可切換 Claude 或 Gemini。
// complete({ system, user, env }) → 模型回傳的純文字。

const TIMEOUT_MS = 20000;

async function post(url, headers, body) {
  const ctrl = new AbortController();
  const t = setTimeout(() => ctrl.abort(), TIMEOUT_MS);
  try {
    const res = await fetch(url, {
      method: "POST",
      headers: { "content-type": "application/json", ...headers },
      body: JSON.stringify(body),
      signal: ctrl.signal,
    });
    if (!res.ok) {
      const err = new Error(`provider HTTP ${res.status}: ${(await res.text()).slice(0, 200)}`);
      err.status = res.status;
      err.provider = true;
      throw err;
    }
    return await res.json();
  } finally {
    clearTimeout(t);
  }
}

const anthropic = {
  name: "anthropic",
  defaultModel: "claude-sonnet-5-5",
  async complete({ system, user, env }) {
    const data = await post(
      "https://api.anthropic.com/v1/messages",
      { "x-api-key": env.ANTHROPIC_API_KEY, "anthropic-version": "2023-06-01" },
      {
        model: env.AI_MODEL || this.defaultModel,
        max_tokens: 1200,
        temperature: 0.3,
        system,
        messages: [{ role: "user", content: user }],
      },
    );
    return (data.content || []).filter((c) => c.type === "text").map((c) => c.text).join("");
  },
};

// Gemini 太忙（503／429）或模型不存在（404）時，依序改用備用模型。
// 備用清單可用 AI_FALLBACK_MODELS（逗號分隔）覆寫；不存在的模型名稱會自動跳過。
const GEMINI_FALLBACKS = "gemini-3.8-flash-lite,gemini-3.7-flash,gemini-3.5-flash";
const RETRYABLE = new Set([404, 429, 500, 503]);

const gemini = {
  name: "gemini",
  defaultModel: "gemini-3.8-flash",
  lastModel: "",
  models(env) {
    const list = [env.AI_MODEL || this.defaultModel, ...(env.AI_FALLBACK_MODELS || GEMINI_FALLBACKS).split(",")];
    return [...new Set(list.map((m) => m.trim()).filter(Boolean))].slice(0, 4);
  },
  async complete({ system, user, env }) {
    let lastErr;
    for (const model of this.models(env)) {
      try {
        const text = await this.once(model, system, user, env);
        this.lastModel = model;
        return text;
      } catch (err) {
        lastErr = err;
        if (!RETRYABLE.has(err.status)) throw err;
        console.error(`gemini ${model} unavailable (${err.status}), trying next`);
      }
    }
    lastErr.busy = lastErr.status !== 404;
    throw lastErr;
  },
  async once(model, system, user, env) {
    // 2.5 Flash 預設會先「思考」，思考也算輸出字數；關掉思考，並把上限放寬，避免 JSON 被截斷
    const generationConfig = { temperature: 0.3, responseMimeType: "application/json", maxOutputTokens: 4096 };
    if (/^gemini-2\.5-flash/.test(model)) generationConfig.thinkingConfig = { thinkingBudget: 0 };
    const data = await post(
      `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`,
      { "x-goog-api-key": env.GEMINI_API_KEY },
      {
        systemInstruction: { parts: [{ text: system }] },
        contents: [{ role: "user", parts: [{ text: user }] }],
        generationConfig,
      },
    );
    const cand = data.candidates?.[0];
    const text = cand?.content?.parts?.map((p) => p.text || "").join("") || "";
    if (!text) throw new Error(`gemini empty (finishReason: ${cand?.finishReason || data.promptFeedback?.blockReason || "unknown"})`);
    if (cand.finishReason === "MAX_TOKENS") throw new Error("gemini output cut off (MAX_TOKENS)");
    return text;
  },
};

// 沒有設定金鑰時回傳 null，由呼叫端改走示範模式。
export function pickProvider(env) {
  const want = (env.AI_PROVIDER || "anthropic").toLowerCase();
  if (want === "gemini" && env.GEMINI_API_KEY) return gemini;
  if (want === "anthropic" && env.ANTHROPIC_API_KEY) return anthropic;
  if (env.ANTHROPIC_API_KEY) return anthropic;
  if (env.GEMINI_API_KEY) return gemini;
  return null;
}
