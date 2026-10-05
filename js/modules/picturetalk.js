/* =========================================================================
 * 模組：看圖說好話（Picture Talk）
 * 路由：#/picturetalk
 * 資料：App.content.picturetalk（data/picturetalk/*.js）；圖片來自 App.art；圖片說明在後端
 * 儲存：picturetalk.done（各圖完成次數）；三好四給記在 App.virtue
 * AI：/api/describe（比對學習者的描述與圖片說明，給回饋）
 * 流程：選一張圖 → 用英文說：看到什麼、感受、可以怎麼幫 → AI 回饋 → 示範說法 → 再說一次
 * 兩種模式：看圖描述（單張，分 A2／B1／B2，B2 是推想圖）、三格故事（panels，練順序與時態）
 * 回饋分三層：你看到的（觀察）、你理解到的（推想）、你還可以注意到；示範說法預設收起
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
  const MODES = [{ id: "all", zh: "全部" }, { id: "describe", zh: "看圖描述" }, { id: "story", zh: "三格故事" }];
  const LEVELS = [{ id: "all", zh: "全部程度" }, { id: "A2", zh: "A2", sub: "入門" }, { id: "B1", zh: "B1", sub: "進階" }, { id: "B2", zh: "B2", sub: "推想" }];
  const isStory = (p) => Array.isArray(p.panels);
  const cover = (p) => (isStory(p) ? p.panels[0] : p.id);
  const levelTag = (p) => `<span class="pt-lv pt-lv-${esc(p.level || "B1")}">${esc(p.level || "B1")}</span>`;
  const questionsOf = (p) => (isStory(p) ? pack().storyQuestions : p.level === "B2" ? pack().thinkQuestions : pack().questions) || pack().questions;

  function renderList() {
    const done = App.store.get("picturetalk.done", {});
    const f = App.store.get("picturetalk.filter", { mode: "all", level: "all" });
    const list = pics().filter((p) => (f.mode === "all" || (f.mode === "story") === isStory(p)) && (f.level === "all" || p.level === f.level));
    $("#ptView").innerHTML = `
      <div class="panel">
        <div class="label">Picture Talk · 看圖說好話</div>
        <h2>看見需要幫忙的人，用英文說出來</h2>
        <p class="muted" style="margin:0">選一張圖，用英文說說：你看到什麼、圖裡的人感覺怎樣、你可以怎麼幫忙。三格故事練習把事情依序說完。AI 會給你回饋。</p>
        <div class="chips" data-f="mode">${App.ui.chips(MODES, (id) => id === f.mode)}</div>
        <div class="chips" data-f="level">${App.ui.chips(LEVELS, (id) => id === f.level)}</div>
      </div>
      <div class="pt-grid">
        ${list.map((p) => `
          <button class="pt-card" data-id="${p.id}">
            ${App.art.scene(cover(p))}
            <span class="pt-card-body"><span class="pt-tags">${levelTag(p)}${isStory(p) ? `<span class="pt-lv pt-story">3 格故事</span>` : ""}</span>
              <b>${esc(p.zh)}</b><small class="muted">${esc(p.en)}</small>
              <span class="badge ${done[p.id] ? "done" : ""}">${done[p.id] ? `完成 ${done[p.id]} 次` : "未開始"}</span></span>
          </button>`).join("") || `<p class="muted">這個組合還沒有圖，換個篩選看看。</p>`}
      </div>`;
    $("#ptView").onclick = (e) => {
      const c = e.target.closest(".chip");
      if (c) { f[c.parentElement.dataset.f] = c.dataset.id; App.store.set("picturetalk.filter", f); return renderList(); }
      const b = e.target.closest("[data-id]"); if (b) open(b.dataset.id);
    };
    App.setHeader("看圖說好話", "Picture Talk");
    window.scrollTo(0, 0);
  }

  function figure(p, small) {
    if (!isStory(p)) return `<div class="pt-figure ${small ? "pt-small" : ""}">${App.art.scene(p.id)}</div>`;
    return `<div class="pt-panels ${small ? "pt-panels-sm" : ""}">${p.panels.map((id, i) => `<div class="pt-figure pt-panel"><span class="pt-no">${i + 1}</span>${App.art.scene(id)}</div>`).join("")}</div>`;
  }

  /* ---------- 看圖、說說看 ---------- */
  function open(id) {
    st = { id, result: null, demo: false, note: "", text: "", prev: "", hintOn: false, counted: false };
    renderPicture();
  }

  function renderPicture() {
    const p = picOf(st.id), q = questionsOf(p);
    const again = Boolean(st.result);
    const story = isStory(p);
    $("#ptView").innerHTML = `
      <div class="section-head"><div><div class="label">Picture Talk · ${esc(p.en)} ${levelTag(p)}</div><h2>${esc(p.zh)}</h2></div>
        <button class="linkbtn" data-act="list">換一張圖</button></div>
      ${figure(p)}
      <div class="panel">
        <div class="label">${again ? "Try again" : story ? "Tell the story" : "Say it"}</div>
        <h2>${again ? "參考回饋，再說一次" : story ? "用英文把三格故事說完" : p.level === "B2" ? "想一想，再用英文說" : "用英文說說這張圖"}</h2>
        <ol class="pt-q">${q.map((x) => `<li><span class="en">${esc(x.en)}</span> <small class="muted">${esc(x.zh)}</small></li>`).join("")}</ol>
        <button class="linkbtn" data-act="hint" style="align-self:flex-start">${st.hintOn ? "收起提示字" : "給我提示字"}</button>
        <div class="pt-words" ${st.hintOn ? "" : "hidden"}>${p.words.map((w) => `<button class="sb-example" data-say="${esc(w.en)}">${esc(w.en)} <small class="muted">${esc(w.zh)}</small></button>`).join("")}</div>
        ${App.ask.block("ptA", story ? "例如：First, ... Then, ... Finally, ..." : "例如：An old woman is ...", story ? "按麥克風把故事說完，說完會自動送出" : "按麥克風說說這張圖，說完會自動送出")}
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
    const r = await App.ai.call("describe", { picture: st.id, level: picOf(st.id).level, text, previous: prev || undefined });
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
  const items = (list, cls, mark) => (list || []).map((x) => `<div class="pt-li ${cls}">${mark} ${esc(x)}</div>`).join("");

  function layers(r) {
    const saw = r.saw || r.seen || [], got = r.understood || [], more = r.notice || r.missed || [];
    if (!saw.length && !got.length && !more.length) return "";
    return `<div class="panel">
      <div class="label">What you noticed</div><h2>你的觀察</h2>
      ${saw.length ? `<div class="pt-layer"><div class="pt-lh">What you saw <span>你看到的</span></div>${items(saw, "ok", "✓")}</div>` : ""}
      ${got.length ? `<div class="pt-layer"><div class="pt-lh">What you understood <span>你理解到的</span></div>${items(got, "think", "💭")}</div>` : ""}
      ${more.length ? `<div class="pt-layer"><div class="pt-lh">You can also notice <span>你還可以注意到</span></div>${items(more, "", "＋")}</div>` : ""}
    </div>`;
  }

  function storyPanel(s) {
    if (!s) return "";
    const word = (w, cls) => `<button class="pt-conn ${cls}" data-play="${esc(w)}">${esc(w)}</button>`;
    return `<div class="panel">
      <div class="label">Story</div><h2>故事結構</h2>
      ${s.order ? `<div class="sumrow"><span><b>順序</b>　${esc(s.order)}</span></div>` : ""}
      ${s.tense ? `<div class="sumrow"><span><b>時態</b>　${esc(s.tense)}</span></div>` : ""}
      ${s.used.length ? `<div class="pt-lh">你用了的連接詞</div><div class="pt-words">${s.used.map((w) => word(w, "ok")).join("")}</div>` : ""}
      ${s.try.length ? `<div class="pt-lh">下次試試看</div><div class="pt-words">${s.try.map((w) => word(w, "")).join("")}</div>` : ""}
    </div>`;
  }

  function renderResult() {
    const p = picOf(st.id), r = st.result;
    const c = r && r.compare;
    $("#ptView").innerHTML = `
      <div class="section-head"><div><div class="label">Picture Talk · ${esc(p.en)} ${levelTag(p)}</div><h2>${esc(p.zh)}</h2></div>
        <button class="linkbtn" data-act="list">換一張圖</button></div>
      ${figure(p, true)}
      ${App.ask.notice(st.demo, st.note, 'data-act="resend"')}
      <div class="panel">
        <div class="label">你說的</div>
        <div class="gt-msg gt-me" style="max-width:100%;align-self:flex-start"><div class="gt-text">${esc(st.text)}</div></div>
        ${c ? `<div class="sb-tone"><span class="sb-tag ${c.improved ? "ok" : "plain"}">${c.improved ? "進步了" : "再接再厲"}</span><p>${esc(c.note)}</p></div>` : ""}
        ${r ? `<p style="margin:0">${esc(r.summary)}</p>${r.level ? `<div class="muted" style="font-size:.85rem">英文程度 ${esc(r.level)}</div>` : ""}` : ""}
      </div>
      ${r ? layers(r) : ""}
      ${r ? storyPanel(r.story) : ""}
      ${r ? App.virtue.panel(r, isStory(p) ? "你的故事展現了" : "你的描述展現了") : ""}
      ${r && r.fixes.length ? `<div class="panel"><div class="label">English</div><h2>英文可以更好的地方</h2>
        ${r.fixes.map((f) => `<div class="sumrow"><span><s class="muted">${esc(f.from)}</s> → <b>${esc(f.to)}</b><br><small class="muted">${esc(f.note)}</small></span></div>`).join("")}</div>` : ""}
      ${r && r.better.length ? sentences("Better ways to say it", "從你的句子改寫", r.better.map((b) => ({ en: b.en, zh: `${b.zh}・${b.why}`, giving: b.giving })), "b") : ""}
      <details class="pt-model" ${r ? "" : "open"}>
        <summary>想看完整示範 <small class="muted">Model answer</small></summary>
        ${sentences("Model answer", "示範說法", p.model, "m")}
      </details>
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
