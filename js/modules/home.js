/* =========================================================================
 * 模組：首頁（四大面向）
 * 路由：#/home（也是預設首頁）
 * 四大面向：Speak Well 說好話、Think Well 存好心、Do Well 做好事、Global Share 分享好
 * 訪客模式：右上「EN」切成全英文，給外國訪客或評審快速了解，並附一分鐘三好四給介紹
 * 儲存：home.lang（"zh" 或 "en"）
 * ========================================================================= */
(function () {
  const { $, esc } = App;
  const ICON = App.ui.ICON;
  const TAB_ICON = `<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round" aria-hidden="true"><path d="M4 11l8-7 8 7v9a1 1 0 0 1-1 1h-4v-6h-6v6H5a1 1 0 0 1-1-1z"/></svg>`;

  const T = {
    zh: {
      kicker: "三好四給 × AI 英語實踐", title: "Good English, Good Life",
      lead: "用英文說好話、存好心、做好事，把善意分享給世界。",
      today: "今日微善", go: "開始", done: "今天完成了", streak: (n) => `連續 ${n} 天`,
      pillars: "四大面向", basics: "英文基本功", passport: "我的 Goodness Passport", open: "打開護照",
      acts: "三好實踐", givings: "四給", practice: "練習次數",
      speaking: "旅遊口說", reading: "新聞閱讀", words: "生字本",
      visitor: "EN", visitorLabel: "切換成英文訪客模式",
      note: "只跟自己比，不排名、不替善意打分數。",
    },
    en: {
      kicker: "Three Acts of Goodness × AI English", title: "Good English, Good Life",
      lead: "Practice English by speaking kindly, thinking kindly, and doing good — then share it with the world.",
      today: "Today's kind mission", go: "Start", done: "Done today", streak: (n) => `${n}-day streak`,
      pillars: "Four pillars", basics: "English basics", passport: "My Goodness Passport", open: "Open passport",
      acts: "Acts of goodness", givings: "Givings", practice: "Practice",
      speaking: "Travel speaking", reading: "News reading", words: "Word book",
      visitor: "中", visitorLabel: "切換成中文",
      note: "You only compare with yourself. No rankings, and kindness is never scored.",
      oneMin: "The Three Acts of Goodness in one minute",
      oneMinLead: "A Taiwanese learner app built around a simple idea from Fo Guang Shan: do good deeds, speak good words, think good thoughts.",
    },
  };

  const PILLARS = [
    {
      id: "speak", color: "sp", en: "Speak Well", zh: "說好話", act: "說好話",
      desc: { zh: "AI 語氣教練，把話說得溫暖又得體", en: "An AI tone coach for warm, kind English" },
      links: [
        { to: "saybetter", zh: "Say It Better 說好話", en: "Say It Better" },
        { to: "picturetalk", zh: "看圖說好話", en: "Picture Talk" },
      ],
    },
    {
      id: "think", color: "th", en: "Think Well", zh: "存好心", act: "存好心",
      desc: { zh: "換位思考，先理解再回應", en: "See things from the other side first" },
      links: [
        { to: "goodtalk/teammate-mistake", zh: "隊友犯錯時", en: "When a teammate makes a mistake" },
        { to: "goodtalk/no-reply", zh: "訊息沒被回", en: "When a friend doesn't reply" },
      ],
    },
    {
      id: "do", color: "do", en: "Do Well", zh: "做好事", act: "做好事",
      desc: { zh: "四給情境對話，加上每日微善任務", en: "Role-play the Four Givings, plus a daily kind mission" },
      links: [
        { to: "goodtalk", zh: "Good Talk 四給對話", en: "Good Talk role-plays" },
        { to: "mission", zh: "Good Mission 微善任務", en: "Good Mission" },
      ],
    },
    {
      id: "share", color: "sh", en: "Global Share", zh: "分享好", act: "",
      desc: { zh: "當文化小大使，用英文介紹三好四給", en: "Be an ambassador and explain the Three Acts in English" },
      links: [{ to: "goodtalk/ambassador-three-acts", zh: "向外國旅客介紹", en: "Talk with a visitor" }],
    },
  ];

  const lang = () => (App.store.get("home.lang", "zh") === "en" ? "en" : "zh");
  const sum = (o) => Object.values(o || {}).reduce((a, b) => a + b, 0);

  function render() {
    const L = lang(), t = T[L];
    const m = App.mission, task = m && m.todayTask();
    const doneToday = m && task && m.log().some((e) => e.date === m.today() && e.id === task.id);
    const s = App.virtue.stats();
    const n = m ? m.streak() : 0;
    const amb = ((App.content.goodtalk || []).flatMap((p) => p.scenarios || []).find((x) => x.id === "ambassador-three-acts") || {}).intro || [];
    $("#hmView").innerHTML = `
      <div class="hm-hero">
        <div class="hm-top"><div class="label">${esc(t.kicker)}</div>
          <button class="hm-lang" data-act="lang" aria-label="${esc(t.visitorLabel)}">${esc(t.visitor)}</button></div>
        <h2>${esc(t.title)}</h2>
        <p>${esc(t.lead)}</p>
      </div>

      ${L === "en" && amb.length ? `<div class="panel hm-visitor">
        <div class="label">Visitor mode</div><h2>${esc(t.oneMin)}</h2>
        <p class="muted" style="margin:0">${esc(t.oneMinLead)}</p>
        ${amb.map((x) => `<div class="hm-line"><button class="m-play" data-say="${esc(x.en)}" aria-label="Play">${ICON.play}</button><span>${esc(x.en)}</span></div>`).join("")}
        <div class="row"><button class="btn btn-primary" data-go="picturetalk">Try Picture Talk</button><button class="btn btn-ghost" data-go="saybetter">Try Say It Better</button></div>
      </div>` : ""}

      ${task ? `<button class="hm-today" data-go="mission">
        <span class="hm-today-art">${App.art.scene(task.art || task.practice)}</span>
        <span class="hm-today-body">
          <span class="label">${esc(t.today)}${n ? ` · ${esc(t.streak(n))}` : ""}</span>
          <b>${esc(L === "en" ? task.en : task.zh)}</b>
          <small class="muted">${esc(L === "en" ? task.learn[0].en : task.en)}</small>
          <span class="hm-today-cta ${doneToday ? "ok" : ""}">${doneToday ? "✓ " + esc(t.done) : esc(t.go) + " →"}</span>
        </span>
      </button>` : ""}

      <div class="label" style="margin-top:4px">${esc(t.pillars)}</div>
      <div class="hm-pillars">
        ${PILLARS.map((p) => `<div class="hm-pillar hm-${p.color}">
          <div class="hm-p-head"><b>${esc(p.en)}</b><span>${esc(p.zh)}</span></div>
          <p>${esc(p.desc[L])}</p>
          <div class="hm-p-links">${p.links.map((k) => `<button data-go="${esc(k.to)}">${esc(k[L])} →</button>`).join("")}</div>
          ${p.act && s.acts[p.act] ? `<span class="hm-p-count">${s.acts[p.act]}</span>` : ""}
        </div>`).join("")}
      </div>

      <button class="panel hm-pass" data-go="passport">
        <div class="label">${esc(t.passport)}</div>
        <div class="hm-pass-row">
          <span><b>${sum(s.acts)}</b><small>${esc(t.acts)}</small></span>
          <span><b>${sum(s.givings)}</b><small>${esc(t.givings)}</small></span>
          <span><b>${sum(s.sources)}</b><small>${esc(t.practice)}</small></span>
          <span class="hm-pass-go">${esc(t.open)} →</span>
        </div>
        <small class="muted">${esc(t.note)}</small>
      </button>

      <div class="label" style="margin-top:4px">${esc(t.basics)}</div>
      <div class="hm-basics">
        <button data-go="speaking">${ICON.speak}<span>${esc(t.speaking)}</span></button>
        <button data-go="reading">${ICON.read}<span>${esc(t.reading)}</span></button>
        <button data-go="words">${ICON.words}<span>${esc(t.words)}</span></button>
      </div>`;
    $("#hmView").onclick = (e) => {
      const b = e.target.closest("button"); if (!b) return;
      if (b.dataset.say) return App.speech.speak(b.dataset.say, 0.9);
      if (b.dataset.go) return App.go(b.dataset.go);
      if (b.dataset.act === "lang") { App.store.set("home.lang", L === "en" ? "zh" : "en"); render(); }
    };
    App.setHeader(L === "en" ? "Home" : "首頁", "Good English, Good Life");
  }

  App.registerModule({
    id: "home", title: "首頁", tab: "首頁", icon: TAB_ICON, order: 0.1, // order: 0 會被 App 當成 99
    mount(el) { el.innerHTML = `<section id="hmView" class="stack" style="gap:14px"></section>`; render(); },
    unmount() { App.speech.stop(); },
  });
})();
