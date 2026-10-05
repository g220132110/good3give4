/* =========================================================================
 * 模組：Good Mission 每日英文微善任務（v0.5 必做第 5 項）
 * 路由：#/mission
 * 資料：App.content.mission（data/mission/*.js）
 * 儲存：mission.log（完成紀錄 [{date, id, feeling, note}]）、mission.pick（今天換過幾次任務）
 * 流程：Learn（學兩句、跟讀）→ Practice（連到對話情境）→ Act（真實生活做到）→ Reflect（反思）
 * AI：只有「AI 幫我看看英文」會用到（/api/rewrite），其餘不需要 AI。
 * ========================================================================= */
(function () {
  const { $, esc } = App;
  const ICON = App.ui.ICON;
  const SOURCE = "mission";
  const TAB_ICON = `<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round" aria-hidden="true"><path d="M12 3l2.5 5.2 5.5.8-4 3.9.9 5.6L12 15.9 7.1 18.5 8 12.9 4 9l5.5-.8z"/></svg>`;
  const FEELINGS = [
    { id: "smile", zh: "對方笑了", sub: "They smiled" },
    { id: "thanks", zh: "對方說謝謝", sub: "They said thanks" },
    { id: "happy", zh: "我覺得很開心", sub: "I felt happy" },
    { id: "brave", zh: "有點緊張，但我做到了", sub: "Nervous, but I did it" },
  ];

  let st = { screen: "today", feeling: "", note: "", tip: null };

  const tasks = () => (App.content.mission || []).flatMap((p) => p.tasks);
  const today = () => new Date(Date.now() + 8 * 3600e3).toISOString().slice(0, 10);
  const dayNo = (d) => Math.floor(Date.parse(d) / 864e5);
  const log = () => App.store.get("mission.log", []);

  function todayTask() {
    const pick = App.store.get("mission.pick", {});
    const offset = pick.date === today() ? pick.offset : 0;
    const list = tasks();
    return list[(dayNo(today()) + offset) % list.length];
  }

  function nextTask() {
    const pick = App.store.get("mission.pick", {});
    const offset = pick.date === today() ? pick.offset : 0;
    App.store.set("mission.pick", { date: today(), offset: offset + 1 });
  }

  // 連續天數：從今天（或昨天）往回數，每天至少完成一個
  function streak() {
    const days = new Set(log().map((e) => e.date));
    let d = dayNo(today());
    if (!days.has(today())) d -= 1;
    let n = 0;
    while (days.has(new Date(d * 864e5).toISOString().slice(0, 10))) { n++; d--; }
    return n;
  }

  const tagsResult = (t) => ({
    acts: t.tags.filter((x) => App.virtue.ACTS[x]).map((name) => ({ name })),
    givings: t.tags.filter((x) => App.virtue.GIVINGS[x]).map((name) => ({ name })),
  });

  /* ---------- 今日任務 ---------- */
  function renderToday() {
    const t = todayTask();
    const doneToday = log().some((e) => e.date === today() && e.id === t.id);
    const micOK = App.ask.micOK();
    $("#msView").innerHTML = `
      <div class="panel ms-hero">
        ${App.art && App.art.has(t.art || t.practice) ? `<div class="gt-banner">${App.art.scene(t.art || t.practice)}</div>` : ""}
        <div class="section-head" style="align-items:center">
          <div class="label">Good Mission · ${today().slice(5).replace("-", "/")} 今日微善</div>
          <button class="linkbtn" data-act="next">換一個任務</button>
        </div>
        <h2>${esc(t.zh)}</h2>
        <div class="muted">${esc(t.en)}</div>
        <div class="row" style="gap:6px">${t.tags.map((x) => App.virtue.badge(x)).join("")}</div>
        <p style="margin:0">${esc(t.why)}</p>
        ${doneToday ? `<div class="notice">今天已經完成這個任務了！想多做一件好事，可以按「換一個任務」。</div>` : ""}
      </div>

      <div class="panel" data-from="Good Mission">
        <div class="label">Step 1 · Learn</div><h2>先學兩句</h2>
        ${t.learn.map((p, i) => `
          <div class="sb-better">
            <span class="no">${String(i + 1).padStart(2, "0")}</span>
            <div class="sb-b-body">
              <div class="en">${App.ui.tokens(p.en)}</div>
              <div class="sb-b-zh">${esc(p.zh)}</div>
              <div class="row">
                <button class="btn btn-ghost sb-sm" data-play="${i}">${ICON.play}聽</button>
                ${micOK ? `<button class="btn btn-ghost sb-sm" data-shadow="${i}">${ICON.speak}跟讀</button>` : ""}
              </div>
              <div class="sb-shadow" id="msS${i}" hidden></div>
            </div>
          </div>`).join("")}
      </div>

      <div class="panel">
        <div class="label">Step 2 · Practice</div><h2>先練習一次</h2>
        ${t.practice
          ? `<p class="muted" style="margin:0">和 AI 扮演的人物模擬這個情境，練熟了再出門。</p>
             <button class="btn btn-ghost" data-act="practice">和 AI 練習這個情境</button>`
          : `<p class="muted" style="margin:0">把上面兩句各跟讀一次，說順了就可以出門實踐。</p>`}
      </div>

      <div class="panel ms-act">
        <div class="label">Step 3 · Act</div><h2>在生活中做到它</h2>
        <p class="muted" style="margin:0">今天找一個機會，用剛學的英文（或中文）把這件好事做出來。做到後回來按下面的按鈕。</p>
        <button class="btn btn-primary" data-act="did">我今天做到了！</button>
      </div>

      ${recordPanel()}`;
    $("#msView").onclick = (e) => {
      const b = e.target.closest("button"); if (!b) return;
      if (b.dataset.play) return App.speech.speak(t.learn[+b.dataset.play].en, 0.9);
      if (b.dataset.shadow) return App.ask.shadow(b, t.learn[+b.dataset.shadow].en, $("#msS" + b.dataset.shadow));
      const act = b.dataset.act;
      if (act === "next") { nextTask(); renderToday(); window.scrollTo(0, 0); }
      else if (act === "practice") App.go("goodtalk/" + t.practice);
      else if (act === "did") { st = { screen: "reflect", feeling: "", note: "", tip: null }; renderReflect(); }
    };
    App.setHeader("Good Mission", "每日英文微善任務");
  }

  function recordPanel() {
    const all = log(), n = streak();
    const byId = Object.fromEntries(tasks().map((t) => [t.id, t]));
    const recent = all.slice(-5).reverse();
    return `<div class="panel">
      <div class="label">My good deeds · 我的微善紀錄</div>
      <div class="ms-stats">
        <div><b>${n}</b><span class="muted">連續天數</span></div>
        <div><b>${all.length}</b><span class="muted">累計完成</span></div>
      </div>
      ${recent.length ? recent.map((e) => {
        const f = FEELINGS.find((x) => x.id === e.feeling);
        return `<div class="sumrow"><span>${esc(byId[e.id] ? byId[e.id].zh : e.id)}${e.note ? `<br><small class="muted">${esc(e.note)}</small>` : ""}</span>
          <span class="n">${e.date.slice(5).replace("-", "/")}${f ? `<br><small class="muted">${esc(f.zh)}</small>` : ""}</span></div>`;
      }).join("") : `<p class="muted" style="margin:0">完成第一個任務後，紀錄會出現在這裡。只跟自己比，不排名。</p>`}
    </div>`;
  }

  /* ---------- 反思 ---------- */
  function renderReflect() {
    const t = todayTask();
    $("#msView").innerHTML = `
      <div class="panel">
        <div class="label">Step 4 · Reflect</div>
        <h2>太棒了！回想一下剛剛</h2>
        <p class="muted" style="margin:0">${esc(t.zh)}</p>
      </div>
      <div class="panel">
        <h2>對方有什麼反應？你覺得怎麼樣？</h2>
        <div class="chips" id="msFeel"></div>
      </div>
      <div class="panel">
        <h2>用一句英文記下今天的好事</h2>
        <p class="muted" style="margin:0">可以不寫。寫了可以請 AI 幫你看看英文。</p>
        <div class="typein"><input id="msNote" maxlength="200" placeholder="${esc(t.reflect)}" value="${esc(st.note)}" autocomplete="off"></div>
        <button class="linkbtn" data-act="check" style="align-self:flex-start">AI 幫我看看英文</button>
        <div id="msTip">${tipHtml()}</div>
      </div>
      <div class="row">
        <button class="btn btn-ghost" data-act="back">回到任務</button>
        <button class="btn btn-primary" data-act="finish">完成</button>
      </div>`;
    const feel = $("#msFeel");
    const drawFeel = () => {
      feel.innerHTML = App.ui.chips(FEELINGS, (id) => id === st.feeling);
    };
    drawFeel();
    feel.onclick = (e) => { const c = e.target.closest(".chip"); if (c) { st.feeling = c.dataset.id; drawFeel(); } };
    $("#msNote").oninput = (e) => { st.note = e.target.value; };
    $("#msView").onclick = (e) => {
      const b = e.target.closest("button"); if (!b || b.classList.contains("chip")) return;
      if (b.dataset.tipsay) return App.speech.speak(b.dataset.tipsay, 0.9);
      const act = b.dataset.act;
      if (act === "back") renderToday();
      else if (act === "check") check();
      else if (act === "finish") finish();
    };
    window.scrollTo(0, 0);
  }

  function tipHtml() {
    const tip = st.tip;
    if (!tip) return "";
    if (tip.loading) return `<div class="gt-tip muted" style="margin:0">AI 正在看這句…</div>`;
    if (tip.error) return `<div class="gt-tip" style="margin:0"><span class="muted">${esc(tip.error)}</span></div>`;
    const r = tip.data, b = r.better[0];
    return `<div class="gt-tip" style="margin:0">
      ${r.fixes.length ? r.fixes.map((f) => `<div class="gt-fix"><s class="muted">${esc(f.from)}</s> → <b>${esc(f.to)}</b> <small class="muted">${esc(f.note)}</small></div>`).join("")
                       : `<div>英文很好，沒有需要修改的地方！</div>`}
      ${b ? `<div class="gt-better"><button class="mini" data-tipsay="${esc(b.en)}" aria-label="播放">${ICON.play}</button>
        <div><div class="en">${esc(b.en)}</div><div class="muted" style="font-size:.88rem">${esc(b.zh)}</div></div></div>` : ""}
    </div>`;
  }

  async function check() {
    const text = (st.note || "").trim();
    if (!text) { st.tip = { error: "先寫一句英文，再請 AI 看看。" }; $("#msTip").innerHTML = tipHtml(); return; }
    st.tip = { loading: true }; $("#msTip").innerHTML = tipHtml();
    const r = await App.ai.call("rewrite", { text, context: "free" });
    st.tip = r.ok && !r.demo ? { data: r.data } : { error: "AI 目前比較忙，可以直接按「完成」，稍後再試。" };
    if ($("#msTip")) $("#msTip").innerHTML = tipHtml();
  }

  function finish() {
    const t = todayTask();
    const all = log();
    all.push({ date: today(), id: t.id, feeling: st.feeling, note: (st.note || "").trim().slice(0, 200) });
    App.store.set("mission.log", all.slice(-200));
    App.virtue.logResult(tagsResult(t), SOURCE);
    st.screen = "today"; // 離開再回來時回到今日任務
    renderDone(t);
  }

  /* ---------- 完成 ---------- */
  function renderDone(t) {
    const n = streak();
    $("#msView").innerHTML = `
      <div class="panel ms-done">
        <div class="label">Mission complete</div>
        <h2>完成今日微善！</h2>
        <div class="score good" style="justify-content:flex-start"><b>${n}</b><span class="muted">連續天數</span></div>
        <p style="margin:0">你今天用行動實踐了：</p>
        <div class="row" style="gap:6px">${t.tags.map((x) => App.virtue.badge(x)).join("")}</div>
        ${st.note ? `<div class="gt-msg gt-me" style="max-width:100%"><div class="gt-text">${esc(st.note)}</div></div>` : ""}
      </div>
      <div class="row">
        <button class="btn btn-ghost" data-act="more">再挑戰一個</button>
        <button class="btn btn-primary" data-act="today">回到今日任務</button>
      </div>
      ${recordPanel()}`;
    $("#msView").onclick = (e) => {
      const b = e.target.closest("[data-act]"); if (!b) return;
      if (b.dataset.act === "more") nextTask();
      st = { screen: "today", feeling: "", note: "", tip: null };
      renderToday(); window.scrollTo(0, 0);
    };
    window.scrollTo(0, 0);
  }

  /* ---------- 模組介面 ---------- */
  App.registerModule({
    id: "mission", title: "Good Mission", tab: "微善", icon: TAB_ICON, order: 0.7, // order: 0 會被 App 當成 99
    mount(el) {
      el.innerHTML = `<section id="msView" class="stack" style="gap:14px"></section>`;
      if (st.screen === "reflect") renderReflect(); else renderToday();
    },
    unmount() { App.speech.stop(); },
  });
})();
