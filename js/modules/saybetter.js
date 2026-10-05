/* =========================================================================
 * 模組：Say It Better 說好話 AI 語氣教練（v0.5 必做第 1 項）
 * 路由：#/saybetter
 * 資料：App.content.saybetter（data/saybetter/*.js）
 * 儲存：saybetter.ctx（上次選的情境）；練習次數記在 App.virtue
 * 共用：App.ask（輸入、跟讀、示範提示）、App.virtue.panel
 * 流程：選情境 → 說出或打出一句英文 → AI 分析 → 跟讀更好的說法 → Try Again → 前後對照
 * ========================================================================= */
(function () {
  const { $, esc } = App;
  const ICON = App.ui.ICON;
  const TAB_ICON = `<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round" aria-hidden="true"><path d="M4 5h16v11H9l-5 4z"/><path d="M12 13.5s-3-1.8-3-3.6a1.6 1.6 0 0 1 3-.8 1.6 1.6 0 0 1 3 .8c0 1.8-3 3.6-3 3.6z" fill="currentColor" stroke="none"/></svg>`;
  const SOURCE = "saybetter";
  const TONE_CLASS = { 直接: "near", 中性: "plain", 禮貌: "ok", 溫暖: "ok", 可能冒犯: "miss", 無法分析: "plain" };

  let st = null; // { ctx, first, result, demo, demoNote, retry, retryResult, retryDemo, retryNote }

  const contexts = () => (App.content.saybetter || []).flatMap((p) => p.contexts);
  const ctxOf = (id) => contexts().find((c) => c.id === id) || contexts()[0];
  const keySet = (keys) => new Set((keys || []).map((k) => App.dict.lookup(k).key));
  const tag = (label) => `<span class="sb-tag ${TONE_CLASS[label] || "plain"}">${esc(label)}</span>`;

  const TEMPLATE = `
  <section id="sbInput" class="stack" hidden>
    <div class="panel">
      <div class="label">Speak Well · 說好話</div>
      <h2>英文不只要說得對，也要說得好</h2>
      <p class="muted" style="margin:0">說出或打出一句英文，AI 會告訴你聽起來的感覺，再示範更好的說法。</p>
    </div>
    <div class="panel"><div class="label">Step 1</div><h2>選一個情境</h2><div class="chips" id="sbCtx"></div></div>
    <div class="panel" id="sbAsk"></div>
    <p class="muted sb-passport" id="sbPassport" hidden></p>
  </section>
  <section id="sbResult" class="stack" style="gap:14px" hidden></section>
  <section id="sbCompare" class="stack" style="gap:14px" hidden></section>`;

  function show(id) {
    ["sbInput", "sbResult", "sbCompare"].forEach((s) => ($("#" + s).hidden = s !== id));
    window.scrollTo(0, 0);
  }

  /* ---------- 呼叫 AI；連不到時改用內容包示範 ---------- */
  function offline(text, retry) {
    const r = structuredClone(ctxOf(st.ctx).demo.result);
    if (retry) {
      const kind = /\b(please|could|would|thank|thanks|sorry|excuse me|let me|i can help|that must be)\b/i.test(text);
      r.compare = kind ? { improved: true, note: "進步了！這次的說法更禮貌、更體貼。" }
                       : { improved: false, note: "再試試看，可以參考上面任何一句更好的說法。" };
    }
    return r;
  }

  async function analyze(text, previous) {
    const r = await App.ai.call("rewrite", { text, context: st.ctx, previous: previous || undefined });
    if (r.ok) return { data: r.data, demo: r.demo, note: r.reason === "busy" ? App.ask.BUSY : "" };
    if (r.quota || r.offline) return { data: offline(text, Boolean(previous)), demo: true, note: r.offline && App.ai.endpoint() ? App.ask.BUSY : r.message };
    return { error: r.message };
  }

  /* ---------- 輸入畫面 ---------- */
  function renderInput() {
    const ctx = ctxOf(st.ctx);
    const el = $("#sbCtx");
    el.innerHTML = App.ui.chips(contexts().map((c) => ({ id: c.id, zh: c.zh, sub: c.en })), (id) => id === st.ctx);
    el.onclick = (e) => {
      const b = e.target.closest(".chip"); if (!b) return;
      st.ctx = b.dataset.id; App.store.set("saybetter.ctx", st.ctx); renderInput();
    };
    $("#sbAsk").innerHTML = `
      <div class="label">Step 2</div><h2>你會怎麼說？</h2>
      <div class="sb-examples"><span class="muted">不知道說什麼？常見的說法：</span>${ctx.examples.map((x) => `<button class="sb-example" data-ex="${esc(x)}">${esc(x)}</button>`).join("")}</div>
      <p class="muted sb-exhint" id="sbExHint" hidden>這是範例句，已放進下方框裡：可以直接按「送出」看 AI 怎麼改，也可以先改成你自己的話。</p>
      ${App.ask.block("sbA", "例如：" + ctx.examples[0], "按麥克風說一句英文，說完會自動分析")}`;
    $("#sbAsk").querySelector(".sb-examples").onclick = (e) => {
      const b = e.target.closest("[data-ex]"); if (!b) return;
      App.ask.showType("sbA");
      const box = $("#sbAIn");
      box.value = b.dataset.ex; box.focus(); box.select();
      $("#sbExHint").hidden = false;
    };
    App.ask.wire("sbA", submitFirst);
    const n = App.virtue.stats().sources[SOURCE] || 0;
    $("#sbPassport").hidden = !n;
    $("#sbPassport").textContent = `你已經完成 ${n} 次說好話練習`;
    App.setHeader("Say It Better", "說好話 AI 語氣教練");
    show("sbInput");
  }

  async function submitFirst(text) {
    App.ask.error("sbA", "");
    App.ask.busy("sbA", true, "AI 分析中…");
    const r = await analyze(text);
    App.ask.busy("sbA", false);
    if (r.error) return App.ask.error("sbA", r.error);
    Object.assign(st, { first: text, result: r.data, demo: r.demo, demoNote: r.note, retry: "", retryResult: null });
    renderResult();
  }

  /* ---------- 結果畫面 ---------- */
  function renderResult() {
    const r = st.result, keys = keySet(r.keys);
    $("#sbResult").innerHTML = `
      <div class="section-head"><div><div class="label">Say It Better</div><h2>${esc(ctxOf(st.ctx).zh)}</h2></div>
        <button class="linkbtn" data-act="restart">換一句</button></div>
      ${App.ask.notice(st.demo, st.demoNote, 'data-act="resend"')}
      <div class="panel">
        <div class="label">你說的</div>
        <div class="en">${esc(st.first)}</div>
        <div class="sb-tone">${tag(r.tone.label)}<p>${esc(r.tone.note)}</p></div>
        ${r.fixes.length ? `<div>${r.fixes.map((f) => `<div class="sumrow"><span><s class="muted">${esc(f.from)}</s> → <b>${esc(f.to)}</b><br><small class="muted">${esc(f.note)}</small></span></div>`).join("")}</div>` : ""}
      </div>
      ${App.virtue.panel(r)}
      ${r.better.length ? `
      <div class="panel" data-from="說好話">
        <div class="label">Better ways to say it</div><h2>更好的說法</h2>
        <div class="tip">點任一個單字看意思；按「跟讀」練發音</div>
        ${r.better.map((b, i) => `
          <div class="sb-better">
            <span class="no">${String(i + 1).padStart(2, "0")}</span>
            <div class="sb-b-body">
              <div class="en">${App.ui.tokens(b.en, { keys })}</div>
              <div class="sb-b-zh">${esc(b.zh)}</div>
              <div class="muted sb-b-why">${esc(b.why)} ${b.giving ? App.virtue.badge(b.giving) : ""}</div>
              <div class="row">
                <button class="btn btn-ghost sb-sm" data-play="${i}">${ICON.play}聽</button>
                ${App.ask.micOK() ? `<button class="btn btn-ghost sb-sm" data-shadow="${i}">${ICON.speak}跟讀</button>` : ""}
              </div>
              <div class="sb-shadow" id="sbS${i}" hidden></div>
            </div>
          </div>`).join("")}
      </div>
      <div class="panel sb-try">
        <div class="label">Try again</div><h2>換你再說一次</h2>
        <p class="muted" style="margin:0">不用照抄，用你自己的話，把剛剛那句說得更好。</p>
        ${App.ask.block("sbR", "用說的或打字")}
      </div>` : ""}`;
    if (r.better.length) App.ask.wire("sbR", submitRetry);
    $("#sbResult").onclick = (e) => {
      const t = e.target.closest("button"); if (!t) return;
      if (t.dataset.act === "restart") return restart();
      if (t.dataset.act === "resend") { t.disabled = true; t.textContent = "分析中…"; return submitFirst(st.first); }
      if (t.dataset.play) return App.speech.speak(st.result.better[+t.dataset.play].en, 0.9);
      if (t.dataset.shadow) return App.ask.shadow(t, st.result.better[+t.dataset.shadow].en, $("#sbS" + t.dataset.shadow));
    };
    show("sbResult");
  }

  async function submitRetry(text) {
    App.ask.error("sbR", "");
    App.ask.busy("sbR", true, "比較兩次說法…");
    const r = await analyze(text, st.first);
    App.ask.busy("sbR", false);
    if (r.error) return App.ask.error("sbR", r.error);
    const first = !st.retryResult;
    Object.assign(st, { retry: text, retryResult: r.data, retryDemo: r.demo, retryNote: r.note });
    if (first) App.virtue.logResult(r.demo ? {} : r.data, SOURCE); // 示範結果只記練習次數
    renderCompare();
  }

  /* ---------- 前後對照 ---------- */
  function renderCompare() {
    const r = st.retryResult, c = r.compare || { improved: false, note: "" };
    $("#sbCompare").innerHTML = `
      ${App.ask.notice(st.retryDemo, st.retryNote, 'data-act="resend"')}
      <div class="panel ${c.improved ? "sb-up" : ""}">
        <div class="label">Before · After</div>
        <h2>${c.improved ? "你進步了！" : "再接再厲"}</h2>
        <div class="sb-pair">
          <div><span class="label">第一次</span><div class="en">${esc(st.first)}</div>${tag(st.result.tone.label)}</div>
          <div class="after"><span class="label">第二次</span><div class="en">${esc(st.retry)}</div>${tag(r.tone.label)}</div>
        </div>
        <p style="margin:0">${esc(c.note)}</p>
      </div>
      ${App.virtue.panel(r)}
      <div class="row">
        <button class="btn btn-ghost" data-act="again">再試一次</button>
        <button class="btn btn-primary" data-act="restart">練習下一句</button>
      </div>`;
    $("#sbCompare").onclick = (e) => {
      const t = e.target.closest("[data-act]"); if (!t) return;
      if (t.dataset.act === "again") renderResult();
      else if (t.dataset.act === "resend") { t.disabled = true; t.textContent = "分析中…"; submitRetry(st.retry); }
      else restart();
    };
    show("sbCompare");
  }

  function restart() {
    Object.assign(st, { first: "", result: null, demo: false, demoNote: "", retry: "", retryResult: null, retryDemo: false, retryNote: "" });
    renderInput();
  }

  /* ---------- 模組介面 ---------- */
  App.registerModule({
    id: "saybetter", title: "Say It Better", tab: "說好話", icon: TAB_ICON, order: 0.5, // 注意：order: 0 會被 App 當成 99
    mount(el) {
      el.innerHTML = TEMPLATE;
      st = st || { ctx: App.store.get("saybetter.ctx", contexts()[0].id) };
      if (!contexts().some((c) => c.id === st.ctx)) st.ctx = contexts()[0].id;
      if (st.retryResult) renderCompare();
      else if (st.result) renderResult();
      else renderInput();
    },
    unmount() { App.speech.stop(); },
  });
})();
