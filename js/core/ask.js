/* =========================================================================
 * App.ask — AI 練習模組共用的輸入與回饋元件（說好話、Good Talk、之後的 Think Well…）
 *
 *   el.innerHTML = App.ask.block("sbA", "例如：…")     麥克風＋打字＋錯誤訊息
 *   App.ask.wire("sbA", (text) => {...})               接上事件；說完或送出時呼叫
 *   App.ask.busy("sbA", true, "AI 分析中…")             送出中鎖住按鈕
 *   App.ask.error("sbA", "訊息")                       顯示／清除錯誤
 *   App.ask.shadow(btn, "英文句子", outEl)              跟讀：逐字評分（同口說模組）
 *   App.ask.notice(on, note, resendAttr)               示範模式提示，可附「再送一次」按鈕
 *   App.ask.BUSY                                       AI 太忙時的統一提示文字
 * ========================================================================= */
(function () {
  const { $, esc } = App;
  const ICON = App.ui.ICON;
  const micOK = () => App.speech.canListen && !App.speech.micBlocked;

  const BUSY = "AI 目前使用的人太多，先顯示示範結果。稍等幾秒，按「再送一次」就好。";

  function block(id, placeholder, idleText = "按麥克風說一句英文，說完會自動送出") {
    const S = App.speech;
    return `
      ${micOK() ? `<button class="mic" id="${id}Mic" aria-label="開始說">${ICON.mic}</button><div class="heard" id="${id}Heard">${esc(idleText)}</div>`
                : `<div class="notice">${S.canListen ? "麥克風無法使用，" : "這個瀏覽器不支援語音辨識，"}先用打字。</div>`}
      <div class="typein" id="${id}TypeRow" ${micOK() ? "hidden" : ""}>
        <input id="${id}In" maxlength="300" placeholder="${esc(placeholder)}" autocomplete="off" enterkeyhint="send">
        <button class="btn btn-dark" id="${id}Send" style="padding:10px 14px">送出</button>
      </div>
      ${micOK() ? `<button class="linkbtn" id="${id}ShowType" style="align-self:center">改用打字</button>` : ""}
      <div class="sb-error" id="${id}Err" hidden></div>`;
  }

  function showType(id) {
    const row = $(`#${id}TypeRow`), btn = $(`#${id}ShowType`);
    if (row) row.hidden = false;
    if (btn) btn.hidden = true;
  }

  function wire(id, onSubmit) {
    const S = App.speech;
    const on = (sel, fn) => { const el = $(sel); if (el) el.onclick = fn; };
    const send = () => {
      const v = $(`#${id}In`).value.trim();
      if (v) onSubmit(v); else error(id, "請先輸入一句英文。");
    };
    on(`#${id}Send`, send);
    $(`#${id}In`).onkeydown = (e) => { if (e.key === "Enter" && !e.isComposing) { e.preventDefault(); send(); } };
    on(`#${id}ShowType`, () => { showType(id); $(`#${id}In`).focus(); });
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
            if (e === "not-allowed" || e === "service-not-allowed") { heard.textContent = "麥克風權限被拒絕，已切換成打字"; showType(id); }
            else if (e === "no-speech") heard.textContent = "沒有聽到聲音，靠近手機再試一次";
            else if (e === "network") heard.textContent = "語音辨識需要網路連線";
            else heard.textContent = "辨識出錯（" + e + "），再試一次";
            setTimeout(() => delete heard.dataset.err, 50);
          },
        );
      } catch (e) { reset(); heard.textContent = "無法啟動麥克風"; }
    });
  }

  function error(id, msg) {
    const el = $(`#${id}Err`);
    if (el) { el.textContent = msg || ""; el.hidden = !msg; }
  }

  function busy(id, on, label) {
    const send = $(`#${id}Send`), mic = $(`#${id}Mic`), heard = $(`#${id}Heard`);
    if (send) { send.disabled = on; send.textContent = on ? "處理中…" : "送出"; }
    if (mic) mic.disabled = on;
    if (on && heard && label) heard.textContent = label;
  }

  function clear(id) {
    const input = $(`#${id}In`), heard = $(`#${id}Heard`);
    if (input) input.value = "";
    if (heard) heard.textContent = "按麥克風繼續說";
  }

  // 跟讀：用 App.speech 的逐字評分（和口說模組相同的顏色）
  function shadow(btn, text, out) {
    const S = App.speech;
    if (S.listening) { S.finishListening(); return; }
    const words = S.parse(text);
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

  // 示範模式提示；resend 是按鈕上的屬性（例如 'data-act="resend"'），AI 太忙時才顯示
  function notice(on, note, resend) {
    if (!on) return "";
    const showResend = resend && note === BUSY;
    return `<div class="notice sb-notice"><span>示範模式：${esc(note || "目前顯示的是預先準備的示範結果，不是 AI 即時分析。")}</span>
      ${showResend ? `<button class="btn btn-dark sb-sm" ${resend}>再送一次</button>` : ""}</div>`;
  }

  App.ask = { BUSY, block, wire, error, busy, clear, shadow, notice, showType, micOK };
})();
