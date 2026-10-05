/* =========================================================================
 * 模組：看圖說好話（Picture Talk）
 * 路由：#/picturetalk
 * 資料：App.content.picturetalk（data/picturetalk/*.js）；圖片來自 App.art；圖片說明在後端
 * 儲存：picturetalk.done（各圖完成次數）；三好四給記在 App.virtue
 * AI：/api/describe（比對學習者的描述與圖片說明，給回饋）
 * 流程：選一張圖 → 用英文說：看到什麼、感受、可以怎麼幫 → AI 回饋 → 示範說法 → 再說一次
 * ========================================================================= */
(function () {
  const { $, esc } = App;
  const ICON = App.ui.ICON;
  const SOURCE = "picturetalk";
  const TAB_ICON = `<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round" aria-hidden="true"><rect x="3" y="5" width="18" height="14" rx="2"/><circle cx="9" cy="10" r="2"/><path d="M3 17l5-4 4 3 3-2 6 4"/></svg>`;

  let st = { id: null, result: null, demo: false, note: "", text: "", prev: "", hintOn: false };

  const pack = () => (App.content.picturetalk || [])[0] || { questions: [], pictures: [] };
  const pics = () => (App.content.picturetalk || []).flatMap((p) => p.pictures);
  const picOf = (id) => pics().find((p) => p.id === id);

  /* ---------- 選圖 ---------- */
  function renderList() {
    const done = App.store.get("picturetalk.done", {});
    $("#ptView").innerHTML = `
      <div class="panel">
        <div class="label">Picture Talk · 看圖說好話</div>
        <h2>看見需要幫忙的人，用英文說出來</h2>
        <p class="muted" style="margin:0">選一張圖，用英文說說：你看到什麼、圖裡的人感覺怎樣、你可以怎麼幫忙。AI 會給你回饋。</p>
      </div>
      <div class="pt-grid">
        ${pics().map((p) => `
          <button class="pt-card" data-id="${p.id}">
            ${App.art.scene(p.id)}
            <span class="pt-card-body"><b>${esc(p.zh)}</b><small class="muted">${esc(p.en)}</small>
              <span class="badge ${done[p.id] ? "done" : ""}">${done[p.id] ? `完成 ${done[p.id]} 次` : "未開始"}</span></span>
          </button>`).join("")}
      </div>`;
    $("#ptView").onclick = (e) => { const b = e.target.closest("[data-id]"); if (b) open(b.dataset.id); };
    App.setHeader("看圖說好話", "Picture Talk");
    window.scrollTo(0, 0);
  }

  /* ---------- 看圖、說說看 ---------- */
  function open(id) {
    st = { id, result: null, demo: false, note: "", text: "", prev: "", hintOn: false, counted: false };
    renderPicture();
  }

  function renderPicture() {
    const p = picOf(st.id), q = pack().questions;
    const again = Boolean(st.result);
    $("#ptView").innerHTML = `
      <div class="section-head"><div><div class="label">Picture Talk · ${esc(p.en)}</div><h2>${esc(p.zh)}</h2></div>
        <button class="linkbtn" data-act="list">換一張圖</button></div>
      <div class="pt-figure">${App.art.scene(p.id)}</div>
      <div class="panel">
        <div class="label">${again ? "Try again" : "Say it"}</div>
        <h2>${again ? "參考回饋，再說一次" : "用英文說說這張圖"}</h2>
        <ol class="pt-q">${q.map((x) => `<li><span class="en">${esc(x.en)}</span> <small class="muted">${esc(x.zh)}</small></li>`).join("")}</ol>
        <button class="linkbtn" data-act="hint" style="align-self:flex-start">${st.hintOn ? "收起提示字" : "給我提示字"}</button>
        <div class="pt-words" ${st.hintOn ? "" : "hidden"}>${p.words.map((w) => `<button class="sb-example" data-say="${esc(w.en)}">${esc(w.en)} <small class="muted">${esc(w.zh)}</small></button>`).join("")}</div>
        ${App.ask.block("ptA", "例如：An old woman is ...", "按麥克風說說這張圖，說完會自動送出")}
      </div>`;
    App.ask.wire("ptA", submit);
    $("#ptView").onclick = (e) => {
      const b = e.target.closest("button"); if (!b) return;
      if (b.dataset.say) return App.speech.speak(b.dataset.say, 0.85);
      if (b.dataset.act === "list") renderList();
      else if (b.dataset.act === "hint") { st.hintOn = !st.hintOn; renderPicture(); }
    };
    App.setHeader("看圖說好話", p.zh);
  }

  async function submit(text) {
    App.ask.error("ptA", "");
    App.ask.busy("ptA", true, "AI 正在看你的描述…");
    const prev = st.result && !st.demo ? st.text : "";
    const r = await App.ai.call("describe", { picture: st.id, text, previous: prev || undefined });
    App.ask.busy("ptA", false);
    if (!r.ok && !(r.offline || r.quota)) return App.ask.error("ptA", r.message);
    st.prev = prev; st.text = text;
    if (r.ok) Object.assign(st, { result: r.data, demo: false, note: "" });
    else Object.assign(st, { result: null, demo: true, note: App.ai.endpoint() ? App.ask.BUSY : r.message });
    if (!st.counted) { // 每次打開一張圖只算一次練習
      st.counted = true;
      App.virtue.logResult({}, SOURCE);
      const d = App.store.get("picturetalk.done", {}); d[st.id] = (d[st.id] || 0) + 1; App.store.set("picturetalk.done", d);
    }
    if (r.ok) App.virtue.logResult(r.data);
    renderResult();
  }

  /* ---------- 回饋 ---------- */
  function renderResult() {
    const p = picOf(st.id), r = st.result;
    const c = r && r.compare;
    $("#ptView").innerHTML = `
      <div class="section-head"><div><div class="label">Picture Talk · ${esc(p.en)}</div><h2>${esc(p.zh)}</h2></div>
        <button class="linkbtn" data-act="list">換一張圖</button></div>
      <div class="pt-figure pt-small">${App.art.scene(p.id)}</div>
      ${App.ask.notice(st.demo, st.note, 'data-act="resend"')}
      <div class="panel">
        <div class="label">你說的</div>
        <div class="gt-msg gt-me" style="max-width:100%;align-self:flex-start"><div class="gt-text">${esc(st.text)}</div></div>
        ${c ? `<div class="sb-tone"><span class="sb-tag ${c.improved ? "ok" : "plain"}">${c.improved ? "進步了" : "再接再厲"}</span><p>${esc(c.note)}</p></div>` : ""}
        ${r ? `<p style="margin:0">${esc(r.summary)}</p>${r.level ? `<div class="muted" style="font-size:.85rem">英文程度 ${esc(r.level)}</div>` : ""}` : ""}
      </div>
      ${r && (r.seen.length || r.missed.length) ? `<div class="panel">
        <div class="label">What you noticed</div><h2>你看見了什麼</h2>
        ${r.seen.map((x) => `<div class="pt-li ok">✓ ${esc(x)}</div>`).join("")}
        ${r.missed.length ? `<div class="muted" style="font-size:.9rem;margin-top:4px">還可以說說：</div>${r.missed.map((x) => `<div class="pt-li">＋ ${esc(x)}</div>`).join("")}` : ""}
      </div>` : ""}
      ${r ? App.virtue.panel(r, "你的描述展現了") : ""}
      ${r && r.fixes.length ? `<div class="panel"><div class="label">English</div><h2>英文可以更好的地方</h2>
        ${r.fixes.map((f) => `<div class="sumrow"><span><s class="muted">${esc(f.from)}</s> → <b>${esc(f.to)}</b><br><small class="muted">${esc(f.note)}</small></span></div>`).join("")}</div>` : ""}
      ${r && r.better.length ? sentences("Better ways to say it", "更好的說法", r.better.map((b) => ({ en: b.en, zh: `${b.zh}・${b.why}`, giving: b.giving })), "b") : ""}
      ${sentences("Model answer", "示範說法", p.model, "m")}
      <div class="row">
        <button class="btn btn-ghost" data-act="list">換一張圖</button>
        <button class="btn btn-primary" data-act="again">再說一次</button>
      </div>`;
    $("#ptView").onclick = (e) => {
      const b = e.target.closest("button"); if (!b) return;
      if (b.dataset.play) return App.speech.speak(b.dataset.play, 0.9);
      if (b.dataset.shadow) return App.ask.shadow(b, b.dataset.shadow, $("#" + b.dataset.out));
      const act = b.dataset.act;
      if (act === "list") renderList();
      else if (act === "again") renderPicture();
      else if (act === "resend") { b.disabled = true; b.textContent = "分析中…"; st.result = null; submit(st.text); }
    };
    window.scrollTo(0, 0);
  }

  function sentences(label, title, list, key) {
    const micOK = App.ask.micOK();
    return `<div class="panel" data-from="看圖說好話"><div class="label">${esc(label)}</div><h2>${esc(title)}</h2>
      ${list.map((s, i) => `
        <div class="sb-better">
          <span class="no">${String(i + 1).padStart(2, "0")}</span>
          <div class="sb-b-body">
            <div class="en">${App.ui.tokens(s.en)}</div>
            <div class="muted sb-b-why">${esc(s.zh)} ${s.giving ? App.virtue.badge(s.giving) : ""}</div>
            <div class="row">
              <button class="btn btn-ghost sb-sm" data-play="${esc(s.en)}">${ICON.play}聽</button>
              ${micOK ? `<button class="btn btn-ghost sb-sm" data-shadow="${esc(s.en)}" data-out="pt${key}${i}">${ICON.speak}跟讀</button>` : ""}
            </div>
            <div class="sb-shadow" id="pt${key}${i}" hidden></div>
          </div>
        </div>`).join("")}</div>`;
  }

  /* ---------- 模組介面 ---------- */
  App.registerModule({
    id: "picturetalk", title: "看圖說好話", tab: "看圖", icon: TAB_ICON, order: 0.65, // order: 0 會被 App 當成 99
    mount(el) {
      el.innerHTML = `<section id="ptView" class="stack" style="gap:14px"></section>`;
      if (!st.id) renderList(); else if (st.result || st.demo) renderResult(); else renderPicture();
    },
    unmount() { App.speech.stop(); },
  });
})();
