/* =========================================================================
 * 模組：Say It Better 說好話 AI 語氣教練（v0.5 必做第 1 項）
 * 路由：#/saybetter
 * 資料：App.content.saybetter（data/saybetter/*.js）
 * 儲存：saybetter.ctx（上次選的情境）；練習次數記在 App.virtue
 * 流程：選情境 → 說出或打出一句英文 → AI 分析 → 跟讀更好的說法 → Try Again → 前後對照
 * ========================================================================= */
(function () {
  const { $, esc } = App;
  const ICON = App.ui.ICON;
  const TAB_ICON = `<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round" aria-hidden="true"><path d="M4 5h16v11H9l-5 4z"/><path d="M12 13.5s-3-1.8-3-3.6a1.6 1.6 0 0 1 3-.8 1.6 1.6 0 0 1 3 .8c0 1.8-3 3.6-3 3.6z" fill="currentColor" stroke="none"/></svg>`;
  const SOURCE = "saybetter";
  const TONE_CLASS = { 直接: "near", 中性: "plain", 禮貌: "ok", 溫暖: "ok", 可能冒犯: "miss", 無法分析: "plain" };

  let st = null; // { ctx, first, result, demo, demoNote, retry, retryResult }

  const contexts = () => (App.content.saybetter || []).flatMap((p) => p.contexts);
  const ctxOf = (id) => contexts().find((c) => c.id === id) || contexts()[0];
  const keySet = (keys) => new Set((keys || []).map((k) => App.dict.lookup(k).key));

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

  /* ---------- 共用：麥克風＋打字輸入（沿用口說模組的操作方式） ---------- */
  function askBlock(id, placeholder) {
    const S = App.speech, micOK = S.canListen && !S.micBlocked;
    return `
      ${micOK ? `<button class="mic" id="${id}Mic" aria-label="開始說">${ICON.mic}</button><div class="heard" id="${id}Heard">按麥克風說一句英文，說完會自動分析</div>`
              : `<div class="notice">${S.canListen ? "麥克風無法使用，" : "這個瀏覽器不支援語音辨識，"}先用打字。</div>`}
      <div class="typein" id="${id}TypeRow" ${micOK ? "hidden" : ""}>
        <input id="${id}In" maxlength="300" placeholder="${esc(placeholder)}" autocomplete="off" enterkeyhint="send">
        <button class="btn btn-dark" id="${id}Send" style="padding:10px 14px">送出</button>
      </div>
      ${micOK ? `<button class="linkbtn" id="${id}ShowType" style="align-self:center">改用打字</button>` : ""}
      <div class="sb-error" id="${id}Err" hidden></div>`;
  }

  function wireAsk(id, onSubmit) {
    const S = App.speech;
    const on = (sel, fn) => { const el = $(sel); if (el) el.onclick = fn; };
    const send = () => { const v = $(`#${id}In`).value.trim(); if (v) onSubmit(v); else err(id, "請先輸入一句英文。"); };
    on(`#${id}Send`, send);
    $(`#${id}In`).onkeydown = (e) => { if (e.key === "Enter") { e.preventDefault(); send(); } };
    on(`#${id}ShowType`, (e) => { $(`#${id}TypeRow`).hidden = false; e.currentTarget.hidden = true; $(`#${id}In`).focus(); });
    on(`#${id}Mic`, () => {
      const mic = $(`#${id}Mic`), heard = $(`#${id}Heard`);
      if (S.listening) { S.finishListening(); return; }
      if (window.speechSynthesis) speechSynthesis.cancel();
      mic.classList.add("on"); mic.innerHTML = ICON.micBig; heard.textContent = "聆聽中…";
      const reset = () => { mic.classList.remove("on"); mic.innerHTML = ICON.mic; };
      try {
        S.listen(
          (t) => { heard.textContent = t.trim() || "聆聽中…"; },
          (alts) => {
            reset();
            if (!alts.length) { if (!heard.dataset.err) heard.textContent = "沒有聽到聲音，再按一次試試"; return; }
            const text = alts[0].trim();
            heard.textContent = `系統聽到：「${text}」`;
            $(`#${id}In`).value = text;
            onSubmit(text);
          },
          (e) => {
            heard.dataset.err = 1;
            if (e === "not-allowed" || e === "service-not-allowed") { heard.textContent = "麥克風權限被拒絕，已切換成打字"; $(`#${id}TypeRow`).hidden = false; }
            else if (e === "no-speech") heard.textContent = "沒有聽到聲音，靠近手機再試一次";
            else if (e === "network") heard.textContent = "語音辨識需要網路連線";
            else heard.textContent = "辨識出錯（" + e + "），再試一次";
            setTimeout(() => delete heard.dataset.err, 50);
          },
        );
      } catch (e) { reset(); heard.textContent = "無法啟動麥克風"; }
    });
  }

  function err(id, msg) { const el = $(`#${id}Err`); if (el) { el.textContent = msg; el.hidden = !msg; } }

  function busy(id, on, label) {
    const send = $(`#${id}Send`), mic = $(`#${id}Mic`), heard = $(`#${id}Heard`);
    if (send) { send.disabled = on; send.textContent = on ? "分析中…" : "送出"; }
    if (mic) mic.disabled = on;
    if (on && heard) heard.textContent = label;
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
    if (r.ok) return { data: r.data, demo: r.demo };
    if (r.quota || r.offline) return { data: offline(text, Boolean(previous)), demo: true, note: r.message };
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
      <div class="sb-examples"><span class="muted">試試看：</span>${ctx.examples.map((x) => `<button class="sb-example" data-ex="${esc(x)}">${esc(x)}</button>`).join("")}</div>
      ${askBlock("sbA", "例如：" + ctx.examples[0])}`;
    $("#sbAsk").querySelector(".sb-examples").onclick = (e) => {
      const b = e.target.closest("[data-ex]"); if (!b) return;
      const row = $("#sbATypeRow"); if (row) row.hidden = false;
      const show = $("#sbAShowType"); if (show) show.hidden = true;
      $("#sbAIn").value = b.dataset.ex;
    };
    wireAsk("sbA", submitFirst);
    const n = App.virtue.stats().sources[SOURCE] || 0;
    $("#sbPassport").hidden = !n;
    $("#sbPassport").textContent = `你已經完成 ${n} 次說好話練習`;
    App.setHeader("Say It Better", "說好話 AI 語氣教練");
    show("sbInput");
  }

  async function submitFirst(text) {
    err("sbA", "");
    busy("sbA", true, "AI 分析中…");
    const r = await analyze(text);
    busy("sbA", false);
    if (r.error) return err("sbA", r.error);
    Object.assign(st, { first: text, result: r.data, demo: r.demo, demoNote: r.note, retry: "", retryResult: null });
    renderResult();
  }

  /* ---------- 結果畫面 ---------- */
  const demoNotice = () => st.demo
    ? `<div class="notice">示範模式：${esc(st.demoNote || "目前顯示的是預先準備的示範結果，不是 AI 即時分析。")}</div>` : "";

  function goodPanel(res) {
    const items = [...res.acts, ...res.givings];
    if (!items.length) return "";
    return `<div class="panel sb-good"><div class="label">What you gave</div><h2>這句話做得好的地方</h2>
      ${items.map((x) => `<div class="sb-point">${App.virtue.badge(x.name)}<p>${esc(x.evidence)}</p></div>`).join("")}</div>`;
  }

  function renderResult() {
    const r = st.result, keys = keySet(r.keys);
    const micOK = App.speech.canListen && !App.speech.micBlocked;
    $("#sbResult").innerHTML = `
      <div class="section-head"><div><div class="label">Say It Better</div><h2>${esc(ctxOf(st.ctx).zh)}</h2></div>
        <button class="linkbtn" data-act="restart">換一句</button></div>
      ${demoNotice()}
      <div class="panel">
        <div class="label">你說的</div>
        <div class="en">${esc(st.first)}</div>
        <div class="sb-tone"><span class="sb-tag ${TONE_CLASS[r.tone.label] || "plain"}">${esc(r.tone.label)}</span><p>${esc(r.tone.note)}</p></div>
        ${r.fixes.length ? `<div>${r.fixes.map((f) => `<div class="sumrow"><span><s class="muted">${esc(f.from)}</s> → <b>${esc(f.to)}</b><br><small class="muted">${esc(f.note)}</small></span></div>`).join("")}</div>` : ""}
      </div>
      ${goodPanel(r)}
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
                ${micOK ? `<button class="btn btn-ghost sb-sm" data-shadow="${i}">${ICON.speak}跟讀</button>` : ""}
              </div>
              <div class="sb-shadow" id="sbS${i}" hidden></div>
            </div>
          </div>`).join("")}
      </div>
      <div class="panel sb-try">
        <div class="label">Try again</div><h2>換你再說一次</h2>
        <p class="muted" style="margin:0">不用照抄，用你自己的話，把剛剛那句說得更好。</p>
        ${askBlock("sbR", "用說的或打字")}
      </div>` : ""}`;
    if (r.better.length) wireAsk("sbR", submitRetry);
    $("#sbResult").onclick = onResultClick;
    show("sbResult");
  }

  function onResultClick(e) {
    const t = e.target.closest("button"); if (!t) return;
    if (t.dataset.act === "restart") return restart();
    if (t.dataset.play) return App.speech.speak(st.result.better[+t.dataset.play].en, 0.9);
    if (t.dataset.shadow) return shadow(t, +t.dataset.shadow);
  }

  // 跟讀：用 App.speech 的逐字評分（和口說模組相同）
  function shadow(btn, i) {
    const S = App.speech, out = $("#sbS" + i);
    if (S.listening) { S.finishListening(); return; }
    const words = S.parse(st.result.better[i].en);
    out.hidden = false; out.innerHTML = `<div class="heard">聆聽中…</div>`;
    btn.classList.add("sb-rec");
    S.listen(
      (t) => { out.innerHTML = `<div class="heard">${esc(t.trim() || "聆聽中…")}</div>`; },
      (alts) => {
        btn.classList.remove("sb-rec");
        if (!alts.length) { out.innerHTML = `<div class="heard">沒有聽到聲音，再按一次試試</div>`; return; }
        let best = null;
        alts.forEach((a) => { const g = S.grade(words, a); if (!best || g.pct > best.pct) best = g; });
        out.innerHTML = `
          <div class="score ${best.pct >= 85 ? "good" : best.pct >= 60 ? "mid" : "low"}" style="justify-content:flex-start"><b>${best.pct}%</b><span class="muted">發音準確度</span></div>
          <div class="words">${words.map((w, k) => `<button class="w ${best.state[k]}" data-w="${esc(w.text)}">${esc(w.text)}</button>`).join("")}</div>`;
      },
      (e) => { btn.classList.remove("sb-rec"); out.innerHTML = `<div class="heard">${e === "no-speech" ? "沒有聽到聲音，再試一次" : "辨識出錯，再試一次"}</div>`; },
    );
  }

  async function submitRetry(text) {
    err("sbR", "");
    busy("sbR", true, "比較兩次說法…");
    const r = await analyze(text, st.first);
    busy("sbR", false);
    if (r.error) return err("sbR", r.error);
    st.retry = text; st.retryResult = r.data;
    if (r.demo) { st.demo = true; st.demoNote = st.demoNote || r.note; }
    App.virtue.log("說好話", SOURCE);
    [...r.data.acts, ...r.data.givings].forEach((x) => x.name !== "說好話" && App.virtue.log(x.name));
    renderCompare();
  }

  /* ---------- 前後對照 ---------- */
  function renderCompare() {
    const r = st.retryResult, c = r.compare || { improved: false, note: "" };
    $("#sbCompare").innerHTML = `
      ${demoNotice()}
      <div class="panel ${c.improved ? "sb-up" : ""}">
        <div class="label">Before · After</div>
        <h2>${c.improved ? "你進步了！" : "再接再厲"}</h2>
        <div class="sb-pair">
          <div><span class="label">第一次</span><div class="en">${esc(st.first)}</div><span class="sb-tag ${TONE_CLASS[st.result.tone.label] || "plain"}">${esc(st.result.tone.label)}</span></div>
          <div class="after"><span class="label">第二次</span><div class="en">${esc(st.retry)}</div><span class="sb-tag ${TONE_CLASS[r.tone.label] || "plain"}">${esc(r.tone.label)}</span></div>
        </div>
        <p style="margin:0">${esc(c.note)}</p>
      </div>
      ${goodPanel(r)}
      <div class="row">
        <button class="btn btn-ghost" data-act="again">再試一次</button>
        <button class="btn btn-primary" data-act="restart">練習下一句</button>
      </div>`;
    $("#sbCompare").onclick = (e) => {
      const t = e.target.closest("[data-act]"); if (!t) return;
      if (t.dataset.act === "again") renderResult();
      else restart();
    };
    show("sbCompare");
  }

  function restart() {
    Object.assign(st, { first: "", result: null, demo: false, demoNote: "", retry: "", retryResult: null });
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
