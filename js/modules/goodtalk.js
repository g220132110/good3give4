/* =========================================================================
 * 模組：Good Talk 四給情境對話（v0.5 必做第 2 項）
 * 路由：#/goodtalk
 * 資料：App.content.goodtalk（data/goodtalk/*.js）；角色設定在後端 worker/src/scenarios.js
 * 儲存：goodtalk.done（各情境完成次數）；三好四給記在 App.virtue
 * AI：/api/chat（角色回話）、/api/analyze（對話分析）、/api/rewrite（Try Again）
 * 流程：選情境 → 和 AI 角色對話（最多 4 輪）→ 分析「你給了對方什麼」→ Try Again → 前後對照
 *
 * 示範模式：第一句就連不到 AI 時，整段改用內容包的預寫對話；
 * 對話中途 AI 太忙時，讓使用者選「再送一次」或「用示範內容繼續」。
 * ========================================================================= */
(function () {
  const { $, esc } = App;
  const ICON = App.ui.ICON;
  const SOURCE = "goodtalk";
  const MAX_TURNS = 4;
  const TAB_ICON = `<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round" aria-hidden="true"><path d="M3 5h11v8H7l-4 3z"/><path d="M10 16h7l4 3V9h-4"/></svg>`;

  let st = null;
  const scenes = () => (App.content.goodtalk || []).flatMap((p) => p.scenarios);
  const sceneOf = (id) => scenes().find((s) => s.id === id);
  const userTurns = () => st.history.filter((h) => h.role === "user").length;

  const TEMPLATE = `
  <section id="gtList" class="stack" hidden></section>
  <section id="gtChat" class="stack" style="gap:14px" hidden></section>
  <section id="gtResult" class="stack" style="gap:14px" hidden></section>
  <section id="gtCompare" class="stack" style="gap:14px" hidden></section>`;

  function show(id) {
    ["gtList", "gtChat", "gtResult", "gtCompare"].forEach((s) => ($("#" + s).hidden = s !== id));
    window.scrollTo(0, 0);
  }

  /* ---------- 情境選單 ---------- */
  function renderList() {
    if (!$("#gtList")) return; // 已切換到其他分頁
    const done = App.store.get("goodtalk.done", {});
    $("#gtList").innerHTML = `
      <div class="panel">
        <div class="label">Good Talk · 四給情境對話</div>
        <h2>用英文帶給別人信心、歡喜、希望、方便</h2>
        <p class="muted" style="margin:0">和 AI 扮演的人物對話 4 輪。結束後，AI 會告訴你英文哪裡可以更好，以及你給了對方什麼。</p>
      </div>
      <div style="display:flex;flex-direction:column;gap:10px">
        ${scenes().map((s, i) => `
          <button class="unit gt-scene" data-sid="${s.id}">
            <span class="no">${String(i + 1).padStart(2, "0")}</span>
            <span><h3>${esc(s.zh)}</h3><span class="meta">${esc(s.en)}</span><span class="gt-give">${App.virtue.badge(s.giving)}</span></span>
            <span class="badge ${done[s.id] ? "done" : ""}">${done[s.id] ? `完成 ${done[s.id]} 次` : "未開始"}</span>
          </button>`).join("")}
      </div>`;
    $("#gtList").onclick = (e) => { const b = e.target.closest("[data-sid]"); if (b) start(b.dataset.sid); };
    App.setHeader("Good Talk", "四給情境對話");
    show("gtList");
  }

  /* ---------- 對話 ---------- */
  function start(sid) {
    App.speech.stop();
    st = { sid, history: [], hint: "", done: false, demoMode: false, aiUsed: false, pending: false, stalled: false,
           analysis: null, analysisDemo: false, analysisNote: "", retry: null };
    renderChat();
    App.speech.speak(sceneOf(sid).opener, 0.9);
  }

  function bubble(role, text, i) {
    if (role === "ai") return `
      <div class="gt-msg gt-ai" data-from="Good Talk">
        <div class="gt-text en">${App.ui.tokens(text)}</div>
        <button class="mini" data-say="${i}" aria-label="播放">${ICON.play}</button>
      </div>`;
    return `<div class="gt-msg gt-me"><div class="gt-text">${esc(text)}</div></div>`;
  }

  function lines() { return [{ role: "ai", text: sceneOf(st.sid).opener }, ...st.history]; }

  function renderChat() {
    if (!$("#gtList")) return; // 已切換到其他分頁
    const s = sceneOf(st.sid), n = userTurns();
    $("#gtChat").innerHTML = `
      <div class="section-head">
        <div><div class="label">Good Talk · ${esc(s.en)}</div><h2>${esc(s.zh)}</h2></div>
        <button class="linkbtn" data-act="leave">離開</button>
      </div>
      <div class="panel gt-task">
        <div class="label">你的任務</div>
        <div><b>${esc(s.task)}</b> ${App.virtue.badge(s.giving)}</div>
        <div class="muted" style="font-size:.9rem">${esc(s.who)}</div>
      </div>
      ${st.demoMode ? App.ask.notice(true, "AI 目前連不到，這段對話使用預先寫好的回應。") : ""}
      <div class="gt-log" id="gtLog">
        ${lines().map((l, i) => bubble(l.role, l.text, i)).join("")}
        ${st.pending ? `<div class="gt-msg gt-ai gt-typing"><span></span><span></span><span></span></div>` : ""}
      </div>
      <div id="gtStall"></div>
      <div class="panel" id="gtInput">
        <div class="topbar">
          <span class="label" style="font-variant-numeric:tabular-nums">第 ${Math.min(n + 1, MAX_TURNS)} / ${MAX_TURNS} 輪</span>
          <span style="flex:1"></span>
          ${st.hint ? `<button class="linkbtn" data-act="hint">需要提示</button>` : ""}
        </div>
        <div class="tip gt-hint" id="gtHint" hidden>${esc(st.hint)}</div>
        ${App.ask.block("gtC", "用英文回應…", "按麥克風回應對方，說完會自動送出")}
        ${n ? `<button class="linkbtn" data-act="finish" style="align-self:center">結束對話，看分析</button>` : ""}
      </div>
      <div class="panel gt-end" id="gtEnd" hidden>
        <h2>對話結束</h2>
        <p class="muted" style="margin:0">看看你這次用英文給了對方什麼。</p>
        <button class="btn btn-primary" data-act="finish">看分析</button>
      </div>`;
    const ended = st.done || n >= MAX_TURNS;
    $("#gtInput").hidden = ended;
    $("#gtEnd").hidden = !ended || st.pending;
    if (!ended) App.ask.wire("gtC", send);
    if (st.pending) App.ask.busy("gtC", true, "對方正在回應…");
    $("#gtChat").onclick = onChatClick;
    if ($("#gtChat").hidden) { App.setHeader("Good Talk", "四給情境對話"); show("gtChat"); }
    const log = $("#gtLog"); log.lastElementChild && log.lastElementChild.scrollIntoView({ block: "nearest" });
  }

  function onChatClick(e) {
    const t = e.target.closest("button"); if (!t) return;
    if (t.dataset.say) return App.speech.speak(lines()[+t.dataset.say].text, 0.9);
    const act = t.dataset.act;
    if (act === "leave") { App.speech.stop(); renderList(); }
    else if (act === "hint") { $("#gtHint").hidden = false; t.hidden = true; }
    else if (act === "finish") analyze();
    else if (act === "resend") askAI();
    else if (act === "demo") { st.demoMode = true; askAI(); }
  }

  function send(text) {
    if (st.pending) return;
    st.history.push({ role: "user", text });
    st.hint = "";
    askAI();
  }

  async function askAI() {
    st.pending = true; st.stalled = false;
    renderChat();
    const n = userTurns(), s = sceneOf(st.sid);
    let reply, done = false, hint = "";
    if (!st.demoMode) {
      const r = await App.ai.call("chat", { scenario: st.sid, history: st.history });
      if (r.ok) { reply = r.data.reply; hint = r.data.hint; done = r.data.done; st.aiUsed = true; }
      else if (!st.aiUsed && (r.offline || r.quota)) st.demoMode = true; // 一開始就連不到：整段用示範
      else { st.pending = false; st.stalled = r.message || App.ask.BUSY; renderChat(); return renderStall(); }
    }
    if (st.demoMode) {
      reply = s.demo.replies[Math.min(n - 1, s.demo.replies.length - 1)];
      hint = s.demo.hints[Math.min(n, s.demo.hints.length - 1)];
      done = n >= MAX_TURNS;
    }
    st.history.push({ role: "ai", text: reply });
    st.hint = hint;
    st.done = done || n >= MAX_TURNS;
    st.pending = false;
    renderChat();
    App.speech.speak(reply, 0.9);
  }

  function renderStall() {
    if (!$("#gtList")) return; // 已切換到其他分頁
    $("#gtStall").innerHTML = `
      <div class="notice sb-notice"><span>${esc(st.stalled)}</span>
        <span class="row" style="flex-wrap:nowrap"><button class="btn btn-dark sb-sm" data-act="resend">再送一次</button>
        <button class="btn btn-ghost sb-sm" data-act="demo">用示範內容繼續</button></span></div>`;
    $("#gtInput").hidden = true;
  }

  /* ---------- 分析 ---------- */
  async function analyze() {
    const s = sceneOf(st.sid);
    const btn = $("#gtEnd .btn") || null;
    if (btn) { btn.disabled = true; btn.textContent = "AI 分析中…"; }
    App.ask.busy("gtC", true, "AI 分析中…");
    let data, demo = st.demoMode, note = "";
    if (!st.demoMode) {
      const r = await App.ai.call("analyze", { scenario: st.sid, history: st.history });
      if (r.ok) data = r.data;
      else { demo = true; note = r.offline || r.quota ? App.ask.BUSY : r.message; }
    }
    if (demo) data = demoAnalysis(s);
    const first = !st.analysis;
    Object.assign(st, { analysis: data, analysisDemo: demo, analysisNote: note });
    if (first) {
      App.virtue.logResult(demo ? {} : data, SOURCE);
      const done = App.store.get("goodtalk.done", {}); done[st.sid] = (done[st.sid] || 0) + 1; App.store.set("goodtalk.done", done);
    }
    renderResult();
  }

  function demoAnalysis(s) {
    const turns = userTurns();
    return { summary: s.demo.analysis.summary, level: "", fixes: [], acts: [], givings: [],
             better: s.demo.analysis.better, retry: { turn: Math.max(0, turns - 1), tip: "參考上面的說法，用你自己的話再說一次。" } };
  }

  // 第 k 次回答之前，對方說的那句話
  function promptBefore(k) {
    const all = lines(); let seen = -1;
    for (let i = 0; i < all.length; i++) {
      if (all[i].role === "user" && ++seen === k) return { prompt: all[i - 1].text, prev: all[i].text };
    }
    return { prompt: all[0].text, prev: "" };
  }

  function renderResult() {
    if (!$("#gtList")) return; // 已切換到其他分頁
    const a = st.analysis, s = sceneOf(st.sid);
    const rt = st.history.some((h) => h.role === "user") ? promptBefore(a.retry.turn) : null;
    $("#gtResult").innerHTML = `
      <div class="section-head"><div><div class="label">Good Talk · ${esc(s.en)}</div><h2>你給了對方什麼？</h2></div>
        <button class="linkbtn" data-act="list">換一個情境</button></div>
      ${App.ask.notice(st.analysisDemo, st.analysisNote, 'data-act="reanalyze"')}
      <div class="panel">
        <div class="label">Summary${a.level ? ` · 英文程度 ${esc(a.level)}` : ""}</div>
        <p style="margin:0">${esc(a.summary)}</p>
      </div>
      ${App.virtue.panel(a, "這次對話做得好的地方")}
      ${a.fixes.length ? `<div class="panel"><div class="label">English</div><h2>英文可以更好的地方</h2>
        ${a.fixes.map((f) => `<div class="sumrow"><span><s class="muted">${esc(f.from)}</s> → <b>${esc(f.to)}</b><br><small class="muted">${esc(f.note)}</small></span></div>`).join("")}</div>` : ""}
      ${a.better.length ? `<div class="panel" data-from="Good Talk"><div class="label">Better ways to say it</div><h2>更好的說法</h2>
        ${a.better.map((b, i) => `
          <div class="sb-better">
            <span class="no">${String(i + 1).padStart(2, "0")}</span>
            <div class="sb-b-body">
              ${b.you ? `<div class="muted" style="font-size:.88rem">你說：${esc(b.you)}</div>` : ""}
              <div class="en">${App.ui.tokens(b.en)}</div>
              <div class="sb-b-zh">${esc(b.zh)}</div>
              <div class="muted sb-b-why">${esc(b.why)} ${b.giving ? App.virtue.badge(b.giving) : ""}</div>
              <div class="row">
                <button class="btn btn-ghost sb-sm" data-play="${i}">${ICON.play}聽</button>
                ${App.ask.micOK() ? `<button class="btn btn-ghost sb-sm" data-shadow="${i}">${ICON.speak}跟讀</button>` : ""}
              </div>
              <div class="sb-shadow" id="gtS${i}" hidden></div>
            </div>
          </div>`).join("")}</div>` : ""}
      ${rt ? `<div class="panel sb-try">
        <div class="label">Try again</div><h2>換你再說一次</h2>
        <div class="gt-msg gt-ai"><div class="gt-text en">${esc(rt.prompt)}</div></div>
        ${rt.prev ? `<div class="muted" style="font-size:.9rem">你當時說：${esc(rt.prev)}</div>` : ""}
        ${a.retry.tip ? `<div class="tip" style="margin:0">${esc(a.retry.tip)}</div>` : ""}
        ${App.ask.block("gtR", "用說的或打字")}
      </div>` : ""}
      <div class="row">
        <button class="btn btn-ghost" data-act="again">再練一次這個情境</button>
        <button class="btn btn-primary" data-act="list">換一個情境</button>
      </div>`;
    if (rt) App.ask.wire("gtR", (text) => tryAgain(text, rt));
    $("#gtResult").onclick = (e) => {
      const t = e.target.closest("button"); if (!t) return;
      if (t.dataset.play) return App.speech.speak(a.better[+t.dataset.play].en, 0.9);
      if (t.dataset.shadow) return App.ask.shadow(t, a.better[+t.dataset.shadow].en, $("#gtS" + t.dataset.shadow));
      if (t.dataset.act === "list") renderList();
      else if (t.dataset.act === "again") start(st.sid);
      else if (t.dataset.act === "reanalyze") { st.demoMode = false; analyze(); }
    };
    App.setHeader("Good Talk", "對話分析");
    show("gtResult");
  }

  /* ---------- Try Again ---------- */
  async function tryAgain(text, rt) {
    App.ask.error("gtR", "");
    App.ask.busy("gtR", true, "比較兩次說法…");
    const r = await App.ai.call("rewrite", { text, previous: rt.prev || undefined, scenario: st.sid, prompt: rt.prompt });
    App.ask.busy("gtR", false);
    let data, demo = false, note = "";
    if (r.ok) { data = r.data; demo = r.demo; note = r.reason === "busy" ? App.ask.BUSY : ""; }
    else if (r.offline || r.quota) {
      demo = true; note = App.ai.endpoint() ? App.ask.BUSY : r.message;
      const kind = /\b(please|thank|sorry|congratulations|proud|help|together|can do|believe|let me|let's)\b/i.test(text);
      data = { tone: { label: kind ? "溫暖" : "中性", note: "" }, fixes: [], better: [], acts: [], givings: [],
               compare: kind ? { improved: true, note: "這次的說法更溫暖、更能幫到對方。" } : { improved: false, note: "可以參考上面的好說法，再試一次。" } };
    } else return App.ask.error("gtR", r.message);
    st.retry = { ...rt, text, result: data, demo, note };
    if (!demo) (data.acts.length || data.givings.length) && App.virtue.logResult(data);
    renderCompare();
  }

  function renderCompare() {
    if (!$("#gtList")) return; // 已切換到其他分頁
    const rt = st.retry, c = rt.result.compare || { improved: false, note: "" };
    $("#gtCompare").innerHTML = `
      ${App.ask.notice(rt.demo, rt.note, 'data-act="resend"')}
      <div class="panel ${c.improved ? "sb-up" : ""}">
        <div class="label">Before · After</div>
        <h2>${c.improved ? "你進步了！" : "再接再厲"}</h2>
        <div class="gt-msg gt-ai"><div class="gt-text en">${esc(rt.prompt)}</div></div>
        <div class="sb-pair">
          ${rt.prev ? `<div><span class="label">第一次</span><div class="en">${esc(rt.prev)}</div></div>` : ""}
          <div class="after"><span class="label">第二次</span><div class="en">${esc(rt.text)}</div></div>
        </div>
        <p style="margin:0">${esc(c.note)}</p>
      </div>
      ${App.virtue.panel(rt.result)}
      <div class="row">
        <button class="btn btn-ghost" data-act="back">回到分析</button>
        <button class="btn btn-primary" data-act="list">換一個情境</button>
      </div>`;
    $("#gtCompare").onclick = (e) => {
      const t = e.target.closest("[data-act]"); if (!t) return;
      if (t.dataset.act === "back") renderResult();
      else if (t.dataset.act === "resend") { t.disabled = true; t.textContent = "分析中…"; tryAgain(rt.text, rt); }
      else renderList();
    };
    show("gtCompare");
  }

  /* ---------- 模組介面 ---------- */
  App.registerModule({
    id: "goodtalk", title: "Good Talk", tab: "對話", icon: TAB_ICON, order: 0.6, // order: 0 會被 App 當成 99
    mount(el) {
      el.innerHTML = TEMPLATE;
      if (!st) return renderList();
      if (st.retry) renderCompare();
      else if (st.analysis) renderResult();
      else { st.pending = false; renderChat(); }
    },
    unmount() { App.speech.stop(); },
  });
})();
