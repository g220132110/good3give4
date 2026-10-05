/* =========================================================================
 * 模組：Goodness Passport 善行護照
 * 路由：#/passport
 * 資料：App.virtue.stats()（三好四給次數、各功能練習次數）、App.mission（微善紀錄、連續天數）
 * 原則：只記次數、只跟自己比；不排名、不打分數。資料只存在這台裝置（localStorage）。
 * ========================================================================= */
(function () {
  const { $, esc } = App;
  const TAB_ICON = `<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round" aria-hidden="true"><rect x="5" y="3" width="14" height="18" rx="2"/><circle cx="12" cy="10" r="3"/><path d="M9 16h6"/></svg>`;

  const SOURCES = [
    { id: "saybetter", zh: "說好話", go: "saybetter" },
    { id: "goodtalk", zh: "情境對話", go: "goodtalk" },
    { id: "picturetalk", zh: "看圖說好話", go: "picturetalk" },
    { id: "mission", zh: "微善任務", go: "mission" },
  ];
  const STAMP = { 說好話: "說", 做好事: "做", 存好心: "心", 給人信心: "信", 給人歡喜: "喜", 給人希望: "望", 給人方便: "便" };

  function stamp(name, n, kind, i) {
    const info = App.virtue.info(name);
    return `<div class="pp-stamp pp-${kind} ${n ? "on" : ""}" style="--r:${(i % 3) * 4 - 4}deg">
      <span class="pp-seal">${esc(STAMP[name])}</span>
      <b>${esc(name)}</b><small>${esc(info.en)}</small>
      <span class="pp-n">${n ? `× ${n}` : "還沒蓋章"}</span>
    </div>`;
  }

  function render() {
    const s = App.virtue.stats();
    const m = App.mission;
    const recent = m ? m.log().slice(-5).reverse() : [];
    const taskOf = (id) => (m ? m.tasks().find((t) => t.id === id) : null);
    const total = Object.values(s.acts).reduce((a, b) => a + b, 0) + Object.values(s.givings).reduce((a, b) => a + b, 0);
    $("#ppView").innerHTML = `
      <div class="pp-cover">
        <div class="label">Goodness Passport</div>
        <h2>我的善行護照</h2>
        <p>每一次用英文說好話、存好心、做好事，都會在這裡蓋一個章。</p>
        <div class="pp-meta"><span><b>${total}</b> 個章</span><span><b>${m ? m.streak() : 0}</b> 天連續微善</span></div>
      </div>

      <div class="panel">
        <div class="label">Three Acts of Goodness</div><h2>三好</h2>
        <div class="pp-grid pp-3">${Object.keys(App.virtue.ACTS).map((k, i) => stamp(k, s.acts[k] || 0, "act", i)).join("")}</div>
      </div>
      <div class="panel">
        <div class="label">Four Givings</div><h2>四給</h2>
        <div class="pp-grid pp-4">${Object.keys(App.virtue.GIVINGS).map((k, i) => stamp(k, s.givings[k] || 0, "giving", i + 1)).join("")}</div>
      </div>

      <div class="panel">
        <div class="label">Practice</div><h2>練習足跡</h2>
        ${SOURCES.map((x) => `<button class="sumrow pp-src" data-go="${x.go}"><span>${esc(x.zh)}</span><b>${s.sources[x.id] || 0} 次 →</b></button>`).join("")}
      </div>

      <div class="panel">
        <div class="label">Kind moments</div><h2>最近的微善</h2>
        ${recent.length ? recent.map((e) => {
          const t = taskOf(e.id);
          return `<div class="pp-moment"><span class="pp-date">${esc(e.date.slice(5).replace("-", "/"))}</span>
            <span><b>${esc(t ? t.zh : e.id)}</b>${e.note ? `<br><span class="en">${esc(e.note)}</span>` : ""}</span></div>`;
        }).join("") : `<p class="muted" style="margin:0">還沒有紀錄。從今天的微善任務開始吧！</p><button class="btn btn-primary" data-go="mission" style="align-self:flex-start">今日微善</button>`}
      </div>

      <p class="muted pp-note">只跟自己比，不排名、不替善意打分數。紀錄只存在這台裝置，不會上傳。</p>`;
    $("#ppView").onclick = (e) => { const b = e.target.closest("[data-go]"); if (b) App.go(b.dataset.go); };
    App.setHeader("Goodness Passport", "善行護照");
  }

  App.registerModule({
    id: "passport", title: "Goodness Passport", tab: "護照", icon: TAB_ICON, order: 0.8,
    mount(el) { el.innerHTML = `<section id="ppView" class="stack" style="gap:14px"></section>`; render(); },
  });
})();
