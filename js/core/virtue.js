/* App.virtue — 三好四給的統一標籤與 Goodness Passport 紀錄（v0.5 第 3、4 節）
 *
 *   App.virtue.badge("給人信心")        → 小徽章 HTML
 *   App.virtue.log("說好話", "saybetter") → 記錄一次實踐
 *   App.virtue.stats()                   → { acts:{說好話:3,…}, givings:{…}, sources:{…} }
 *   App.virtue.panel(result)             → 「做得好的地方」面板 HTML（result.acts / result.givings）
 *   App.virtue.logResult(result, 來源)    → 依分析結果記錄每一項三好四給
 *
 * 只記次數、只跟自己比，不排名、不打分數。
 */
(function () {
  const ACTS = {
    說好話: { en: "Speak Good Words", short: "Speak Well" },
    做好事: { en: "Do Good Deeds", short: "Do Well" },
    存好心: { en: "Think Good Thoughts", short: "Think Well" },
  };
  const GIVINGS = {
    給人信心: { en: "Confidence" },
    給人歡喜: { en: "Joy" },
    給人希望: { en: "Hope" },
    給人方便: { en: "Convenience" },
  };

  const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]);

  function info(name) {
    if (ACTS[name]) return { kind: "act", ...ACTS[name] };
    if (GIVINGS[name]) return { kind: "giving", ...GIVINGS[name] };
    return null;
  }

  function badge(name) {
    const i = info(name);
    if (!i) return "";
    return `<span class="gv-badge gv-${i.kind}" title="${esc(i.en)}">${esc(name)}<small>${esc(i.en)}</small></span>`;
  }

  function log(name, source) {
    if (!info(name)) return;
    const s = App.store.get("virtue.log", { acts: {}, givings: {}, sources: {} });
    const bucket = ACTS[name] ? s.acts : s.givings;
    bucket[name] = (bucket[name] || 0) + 1;
    if (source) s.sources[source] = (s.sources[source] || 0) + 1;
    App.store.set("virtue.log", s);
  }

  function stats() {
    return App.store.get("virtue.log", { acts: {}, givings: {}, sources: {} });
  }

  function panel(res, title = "這句話做得好的地方") {
    const items = [...(res.acts || []), ...(res.givings || [])];
    if (!items.length) return "";
    return `<div class="panel sb-good"><div class="label">What you gave</div><h2>${esc(title)}</h2>
      ${items.map((x) => `<div class="sb-point">${badge(x.name)}<p>${esc(x.evidence)}</p></div>`).join("")}</div>`;
  }

  // 完成時的小動畫：右下角浮出蓋章提示，1.8 秒後消失（減少動態效果的設定下不動畫）
  function toast(names) {
    if (!names.length || typeof document === "undefined") return;
    document.querySelectorAll(".gv-toast").forEach((t) => t.remove());
    const t = document.createElement("div");
    t.className = "gv-toast"; t.setAttribute("role", "status");
    t.innerHTML = `<span class="gv-stamp">好</span><span><b>Goodness Passport ＋1</b><span class="gv-toast-list">${names.map(badge).join("")}</span></span>`;
    document.body.appendChild(t);
    setTimeout(() => t.classList.add("out"), 1800);
    setTimeout(() => t.remove(), 2300);
  }

  function logResult(res, source) {
    const items = [...(res.acts || []), ...(res.givings || [])];
    items.forEach((x, i) => log(x.name, i === 0 ? source : ""));
    toast([...new Set(items.map((x) => x.name).filter(info))]);
    if (!items.length && source) {
      const s = stats(); s.sources[source] = (s.sources[source] || 0) + 1; App.store.set("virtue.log", s);
    }
  }

  App.virtue = { ACTS, GIVINGS, info, badge, log, stats, panel, logResult, toast };
})();
