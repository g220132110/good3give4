/* Goodness AI 測試頁：依序把 QA_CASES 送到正式後端，自動檢查結果。
 * 不放在 App 裡、不影響學習者；開 /qa/ 就能跑。結果存在這台電腦，可下載 JSON 留存比較。
 */
(function () {
  const $ = (s) => document.querySelector(s);
  const esc = (s) => String(s ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]);
  const param = new URLSearchParams(location.search).get("endpoint");
  const ENDPOINT = param || (/^(localhost|127\.0\.0\.1)$/.test(location.hostname) ? location.origin : "https://good-english-api.ct-f78.workers.dev");
  const GAP = 4500; // 每題間隔，避免免費額度每分鐘次數超過
  const wait = (ms) => new Promise((r) => setTimeout(r, ms));
  const CASES = window.QA_CASES;
  let results = {}, running = false, stop = false;
  try { results = JSON.parse(localStorage.getItem("qa.results") || "{}"); } catch (e) {}
  let last = {};
  try { last = JSON.parse(localStorage.getItem("qa.prev") || "{}"); } catch (e) {}

  async function send(c) {
    const body = { level: "B1", ...c.input };
    for (let i = 0; i < 3; i++) {
      const t0 = Date.now();
      try {
        const res = await fetch(`${ENDPOINT}/api/${c.task}`, { method: "POST", headers: { "content-type": "application/json", "x-ep-device": "qa-runner" }, body: JSON.stringify(body) });
        const j = await res.json().catch(() => ({}));
        if (res.ok && j.ok && !j.demo) return { ok: true, data: j.data, ms: Date.now() - t0, model: j.model || "" };
        if (j.error === "quota") return { ok: false, why: "今日額度用完" };
        if (i < 2) { await wait(6000); continue; }
        return { ok: false, why: j.demo ? "AI 沒回應（示範結果）" : j.message || `HTTP ${res.status}` };
      } catch (e) {
        if (i < 2) { await wait(6000); continue; }
        return { ok: false, why: "連不上後端" };
      }
    }
  }

  const goods = (d) => [...(d.acts || []), ...(d.givings || [])].map((x) => x.name);
  const avgWords = (d) => { const b = d.better || []; return b.length ? b.reduce((a, x) => a + x.en.split(/\s+/).length, 0) / b.length : 0; };

  function judge(c, d) {
    const k = c.check || {}, soft = c.soft || [], g = goods(d), out = [];
    const add = (name, pass, msg) => out.push({ name, pass, soft: soft.includes(name), msg });
    if (k.tone) add("tone", k.tone.includes(d.tone?.label), `語氣 ${d.tone?.label}（期待 ${k.tone.join("/")}）`);
    if (k.need) add("need", k.need.some((x) => g.includes(x)), `需要 ${k.need.join("/")} 其中之一`);
    if (k.no) { const bad = k.no.filter((x) => g.includes(x)); add("no", !bad.length, bad.length ? `不該出現 ${bad.join("、")}` : "沒有亂加"); }
    if (k.none) add("none", !g.length, g.length ? `不該有三好四給，卻有 ${g.join("、")}` : "沒有三好四給");
    if (k.maxGood != null) add("maxGood", g.length <= k.maxGood, `三好四給 ${g.length} 個（上限 ${k.maxGood}）`);
    if (k.minFixes != null) add("minFixes", (d.fixes || []).length >= k.minFixes, `修正 ${(d.fixes || []).length} 個（至少 ${k.minFixes}）`);
    if (k.maxFixes != null) add("maxFixes", (d.fixes || []).length <= k.maxFixes, `修正 ${(d.fixes || []).length} 個（最多 ${k.maxFixes}）`);
    if (k.level) add("level", k.level.includes(d.level), `程度 ${d.level || "—"}（期待 ${k.level.join("/")}）`);
    if (k.understood) add("understood", (d.understood || []).length > 0, "要有「你理解到的」");
    if (k.notice === true) add("notice", (d.notice || []).length > 0, "要有「你還可以注意到」");
    if (k.story) add("story", Boolean(d.story), "要有故事結構");
    if (k.used) add("used", (d.story?.used || []).some((w) => w.toLowerCase() === k.used.toLowerCase()), `要認出 ${k.used}`);
    if (k.tryMore) add("tryMore", (d.story?.try || []).length > 0, "要建議連接詞");
    if (k.notText) add("notText", !JSON.stringify(d).includes(k.notText), `不可出現「${k.notText}」`);
    if (k.same) { const o = results[k.same]; if (o && o.data) add("same", o.data.level === d.level, `程度 ${o.data.level} → ${d.level}`); }
    if (k.deeper) { const o = results[k.deeper]; if (o && o.data) add("deeper", avgWords(d) > avgWords(o.data), `改寫平均字數 ${avgWords(o.data).toFixed(1)} → ${avgWords(d).toFixed(1)}`); }
    return out;
  }

  function status(r) {
    if (!r) return "wait";
    if (!r.ok) return "skip";
    if (r.checks.some((x) => !x.pass && !x.soft)) return "fail";
    if (r.checks.some((x) => !x.pass)) return "warn";
    return "pass";
  }
  const LABEL = { pass: "通過", warn: "注意", fail: "失敗", skip: "沒跑到", wait: "—", run: "執行中" };

  function summary(d) {
    if (!d) return "";
    const parts = [];
    if (d.tone) parts.push(`語氣 <b>${esc(d.tone.label)}</b>`);
    if (d.level) parts.push(`程度 <b>${esc(d.level)}</b>`);
    const g = goods(d);
    parts.push(g.length ? g.map((x) => `<span class="q-g">${esc(x)}</span>`).join("") : `<span class="muted">無三好四給</span>`);
    if ((d.fixes || []).length) parts.push(`修正 ${d.fixes.length}`);
    if (d.story) parts.push(`連接詞 ${esc((d.story.used || []).join(", ") || "—")}`);
    return parts.join(" · ");
  }

  function render() {
    const groups = [...new Set(CASES.map((c) => c.group))];
    const st = CASES.map((c) => (running === c.id ? "run" : status(results[c.id])));
    const count = (s) => st.filter((x) => x === s).length;
    $("#qaSum").innerHTML = `<span class="q-pass">通過 ${count("pass")}</span><span class="q-warn">注意 ${count("warn")}</span><span class="q-fail">失敗 ${count("fail")}</span><span class="q-skip">沒跑到 ${count("skip")}</span><span class="muted">共 ${CASES.length} 題</span>`;
    $("#qaGroups").innerHTML = `<button class="chip" data-run="all">全部跑（約 ${Math.ceil(CASES.length * 9 / 60)} 分鐘）</button><button class="chip" data-run="bad">只重跑失敗／沒跑到的</button>` +
      groups.map((g) => `<button class="chip" data-run="g:${esc(g)}">${esc(g)}（${CASES.filter((c) => c.group === g).length}）</button>`).join("");
    $("#qaList").innerHTML = CASES.map((c, i) => {
      const r = results[c.id], s = st[i], p = last[c.id];
      const changed = p && p !== s && s !== "wait" && s !== "run" ? `<small class="q-chg">上次：${LABEL[p]}</small>` : "";
      return `<div class="q-row q-${s}">
        <div class="q-head"><span class="q-badge">${LABEL[s]}</span><b>${esc(c.id)}</b><span class="muted">${esc(c.group)} · ${c.task === "rewrite" ? "說好話" : "看圖 " + esc(c.input.picture)}</span>${changed}
          <button class="linkbtn" data-one="${esc(c.id)}">只跑這題</button></div>
        <div class="q-in">${esc(c.input.text)}</div>
        ${c.note ? `<div class="muted q-note">${esc(c.note)}</div>` : ""}
        ${r && r.ok ? `<div class="q-out">${summary(r.data)} <span class="muted">· ${(r.ms / 1000).toFixed(1)} 秒</span></div>
          <div class="q-checks">${r.checks.map((x) => `<span class="${x.pass ? "ok" : x.soft ? "warn" : "bad"}">${x.pass ? "✓" : x.soft ? "△" : "✗"} ${esc(x.msg)}</span>`).join("")}</div>
          <details><summary>完整回傳</summary><pre>${esc(JSON.stringify(r.data, null, 2))}</pre></details>` : r ? `<div class="q-out muted">${esc(r.why)}</div>` : ""}
      </div>`;
    }).join("");
  }

  async function run(list) {
    if (running) return;
    stop = false; $("#qaStop").hidden = false;
    const snapshot = {}; CASES.forEach((c) => { snapshot[c.id] = status(results[c.id]); });
    localStorage.setItem("qa.prev", JSON.stringify(snapshot)); last = snapshot;
    for (let i = 0; i < list.length && !stop; i++) {
      const c = list[i];
      running = c.id; render();
      document.querySelector(`[data-one="${c.id}"]`)?.closest(".q-row").scrollIntoView({ block: "center", behavior: "smooth" });
      const r = await send(c);
      if (r.ok) r.checks = judge(c, r.data);
      r.at = new Date().toISOString();
      results[c.id] = r;
      localStorage.setItem("qa.results", JSON.stringify(results));
      if (r.why === "今日額度用完") { stop = true; alert("今天的 AI 額度用完了，明天再跑剩下的。"); }
      if (i < list.length - 1 && !stop) await wait(GAP);
    }
    running = false; $("#qaStop").hidden = true; render();
  }

  document.addEventListener("click", (e) => {
    const b = e.target.closest("button"); if (!b) return;
    if (b.dataset.one) return run(CASES.filter((c) => c.id === b.dataset.one));
    const k = b.dataset.run;
    if (k === "all") run(CASES);
    else if (k === "bad") run(CASES.filter((c) => ["fail", "skip", "wait"].includes(status(results[c.id]))));
    else if (k && k.startsWith("g:")) run(CASES.filter((c) => c.group === k.slice(2)));
    if (b.id === "qaStop") stop = true;
    if (b.id === "qaExport") {
      const blob = new Blob([JSON.stringify({ endpoint: ENDPOINT, at: new Date().toISOString(), results }, null, 2)], { type: "application/json" });
      const a = document.createElement("a"); a.href = URL.createObjectURL(blob); a.download = `goodness-qa-${new Date().toISOString().slice(0, 10)}.json`; a.click();
    }
    if (b.id === "qaClear" && confirm("清除所有測試結果？")) { results = {}; last = {}; localStorage.removeItem("qa.results"); localStorage.removeItem("qa.prev"); render(); }
  });

  $("#qaEndpoint").textContent = ENDPOINT;
  render();
})();
