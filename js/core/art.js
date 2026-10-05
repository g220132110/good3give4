/* =========================================================================
 * App.art — 程式繪製的 SVG 插圖（扁平暖色風格，所有場景共用同一組人物與道具）
 *
 *   App.art.scene("lost-tourist")        → <svg>…</svg> 字串（找不到回傳 ""）
 *   App.art.has("lost-tourist")          → true / false
 *
 * 之後若改用 AI 產生的圖片：在 App.art.images 登記 { 場景 id: "images/xxx.webp" }，
 * scene() 會改回傳 <img>，其他模組不用改。
 * ========================================================================= */
(function () {
  const C = {
    ink: "#12343b", sky: "#dcecef", sky2: "#eef6f4", wall: "#f3ece0", floor: "#e6dccb", grass: "#cfe3c3",
    teal: "#2c7a8c", amber: "#e8a33d", coral: "#e07a5f", green: "#6a994e", purple: "#8e7cc3", blue: "#4f86c6",
    pants: "#3d4a5c", wood: "#c49a6c", white: "#ffffff", gray: "#b8c0c2", red: "#d1495b",
    skin: ["#f2c9a0", "#e0ac7e", "#b9825a"], hair: ["#2b2321", "#5a3d2b", "#c9a26b", "#d9d9d9"],
  };

  /* ---------- 人物 ----------
   * x：中心、y：腳底；s：比例；mood：happy／sad／worried／neutral／cry
   * arms：down／wave／point／hold／up／hug／reach；sit：坐姿；old：長輩（灰髮、拐杖）
   */
  function person(o) {
    const s = o.s || 1, x = o.x, y = o.y;
    const skin = C.skin[o.skin || 0], hair = o.old ? C.hair[3] : C.hair[o.hair || 0];
    const shirt = o.shirt || C.teal, pants = o.pants || C.pants;
    const g = [];
    const sit = o.sit;
    const hipY = sit ? -34 : -44, shY = sit ? -70 : -80, headY = sit ? -86 : -96;
    // 腿
    if (sit) {
      g.push(`<path d="M-8 ${hipY}h22v8h-6v26h-8v-26h-8z" fill="${pants}"/>`, `<path d="M-2 ${hipY}h20v8h-4v26h-8v-26h-8z" fill="${pants}" opacity=".9"/>`);
    } else {
      g.push(`<rect x="-10" y="${hipY}" width="8" height="44" rx="4" fill="${pants}"/>`, `<rect x="2" y="${hipY}" width="8" height="44" rx="4" fill="${pants}"/>`);
      g.push(`<ellipse cx="-6" cy="-1" rx="6" ry="3" fill="${C.ink}"/>`, `<ellipse cx="6" cy="-1" rx="6" ry="3" fill="${C.ink}"/>`);
    }
    // 身體
    g.push(`<rect x="-14" y="${shY}" width="28" height="${hipY - shY + 6}" rx="10" fill="${shirt}"/>`);
    // 手臂（左右兩條）
    const arm = (side, kind) => {
      const sx = side * 12, sy = shY + 6;
      const ends = {
        down: [side * 16, sy + 30], wave: [side * 22, sy - 26], point: [side * 34, sy - 6], hold: [side * 8, sy + 22],
        up: [side * 20, sy - 30], hug: [side * 2, sy + 12], reach: [side * 30, sy + 14], chin: [side * 4, sy - 8],
      };
      const [ex, ey] = ends[kind] || ends.down;
      return `<path d="M${sx} ${sy}L${ex} ${ey}" stroke="${shirt}" stroke-width="8" stroke-linecap="round"/><circle cx="${ex}" cy="${ey}" r="4.5" fill="${skin}"/>`;
    };
    const arms = o.arms || "down";
    const [la, ra] = Array.isArray(arms) ? arms : [arms, arms];
    g.push(arm(-1, la), arm(1, ra));
    // 頭
    g.push(`<rect x="-4" y="${headY + 10}" width="8" height="8" fill="${skin}"/>`);
    g.push(`<circle cx="0" cy="${headY}" r="14" fill="${skin}"/>`);
    // 頭髮
    const hs = o.hairStyle || "short";
    if (hs === "long") g.push(`<path d="M-15 ${headY + 14}V${headY - 2}a15 15 0 0 1 30 0V${headY + 14}h-6V${headY - 2}h-18V${headY + 14}z" fill="${hair}"/>`);
    else if (hs === "bun") g.push(`<path d="M-14 ${headY - 2}a14 14 0 0 1 28 0z" fill="${hair}"/><circle cx="0" cy="${headY - 15}" r="6" fill="${hair}"/>`);
    else if (hs === "cap") g.push(`<path d="M-14 ${headY - 3}a14 14 0 0 1 28 0z" fill="${o.cap || C.coral}"/><rect x="${o.facing === -1 ? -24 : 4}" y="${headY - 5}" width="20" height="4" rx="2" fill="${o.cap || C.coral}"/>`);
    else g.push(`<path d="M-14 ${headY - 1}a14 14 0 0 1 28 0c-4-4-9-5-14-5s-10 1-14 5z" fill="${hair}"/>`);
    // 臉
    const f = o.facing === -1 ? -3 : o.facing === 1 ? 3 : 0, ey = headY + 1, m = headY + 7;
    const mood = o.mood || "neutral";
    if (mood === "cry") g.push(`<path d="M${f - 7} ${ey}q2 -2 4 0M${f + 3} ${ey}q2 -2 4 0" stroke="${C.ink}" stroke-width="1.6" fill="none" stroke-linecap="round"/><path d="M${f - 6} ${ey + 3}v6M${f + 6} ${ey + 3}v6" stroke="${C.blue}" stroke-width="2" stroke-linecap="round"/>`);
    else if (mood === "sad" || mood === "worried") g.push(`<circle cx="${f - 5}" cy="${ey + 1}" r="1.6" fill="${C.ink}"/><circle cx="${f + 5}" cy="${ey + 1}" r="1.6" fill="${C.ink}"/><path d="M${f - 8} ${ey - 4}l4 ${mood === "sad" ? 2 : -1}M${f + 8} ${ey - 4}l-4 ${mood === "sad" ? 2 : -1}" stroke="${C.ink}" stroke-width="1.4" stroke-linecap="round"/>`);
    else g.push(`<circle cx="${f - 5}" cy="${ey}" r="1.6" fill="${C.ink}"/><circle cx="${f + 5}" cy="${ey}" r="1.6" fill="${C.ink}"/>`);
    const mouth = { happy: `M${f - 5} ${m - 1}q5 5 10 0`, sad: `M${f - 4} ${m + 2}q4 -4 8 0`, cry: `M${f - 4} ${m + 2}q4 -4 8 0`, worried: `M${f - 4} ${m + 1}h8`, neutral: `M${f - 3} ${m}q3 2 6 0` }[mood];
    g.push(`<path d="${mouth}" stroke="${C.ink}" stroke-width="1.6" fill="none" stroke-linecap="round"/>`);
    if (mood === "happy") g.push(`<circle cx="${f - 9}" cy="${m - 2}" r="2.5" fill="${C.coral}" opacity=".35"/><circle cx="${f + 9}" cy="${m - 2}" r="2.5" fill="${C.coral}" opacity=".35"/>`);
    // 背包、拐杖
    if (o.backpack) g.push(`<rect x="${(o.facing || 1) * -18 - 6}" y="${shY + 4}" width="12" height="26" rx="5" fill="${o.backpack}"/>`);
    if (o.old) g.push(`<path d="M24 ${shY + 30}V0" stroke="${C.wood}" stroke-width="3" stroke-linecap="round"/>`);
    return `<g transform="translate(${x} ${y}) scale(${s})">${g.join("")}</g>`;
  }

  /* ---------- 背景 ---------- */
  const W = 320, H = 200;
  const ground = (y, c) => `<rect x="0" y="${y}" width="${W}" height="${H - y}" fill="${c}"/>`;
  const BG = {
    street: () => `<rect width="${W}" height="${H}" fill="${C.sky}"/><rect x="18" y="62" width="58" height="100" rx="4" fill="#c9dde0"/><rect x="230" y="48" width="70" height="114" rx="4" fill="#c4d8db"/>${ground(160, C.floor)}<rect y="158" width="${W}" height="4" fill="${C.gray}"/>`,
    station: () => `<rect width="${W}" height="${H}" fill="${C.sky}"/><rect x="40" y="40" width="240" height="122" rx="6" fill="#d7cbb7"/><rect x="40" y="40" width="240" height="22" rx="6" fill="${C.teal}"/><text x="160" y="56" text-anchor="middle" font-size="12" font-weight="700" fill="#fff" font-family="sans-serif">STATION</text><circle cx="160" cy="84" r="12" fill="#fff" stroke="${C.ink}" stroke-width="2"/><path d="M160 84v-7M160 84l5 3" stroke="${C.ink}" stroke-width="2" stroke-linecap="round"/><rect x="128" y="110" width="64" height="52" rx="4" fill="#a99a82"/>${ground(160, C.floor)}`,
    classroom: () => `<rect width="${W}" height="${H}" fill="${C.wall}"/><rect x="30" y="26" width="140" height="70" rx="4" fill="#3f5f55"/><rect x="210" y="30" width="80" height="58" rx="4" fill="${C.sky}" stroke="#fff" stroke-width="4"/>${ground(158, C.floor)}`,
    park: () => `<rect width="${W}" height="${H}" fill="${C.sky}"/><circle cx="270" cy="38" r="16" fill="#f6d36b"/><circle cx="50" cy="96" r="30" fill="#9cc58a"/><rect x="46" y="110" width="8" height="50" fill="${C.wood}"/><circle cx="280" cy="104" r="24" fill="#a9cf96"/><rect x="276" y="116" width="7" height="44" fill="${C.wood}"/>${ground(158, C.grass)}`,
    court: () => `<rect width="${W}" height="${H}" fill="#e9e4f2"/><rect x="250" y="30" width="44" height="30" rx="2" fill="#fff" stroke="${C.ink}" stroke-width="2"/><path d="M262 60h20l-3 18h-14z" fill="none" stroke="${C.coral}" stroke-width="2.5"/><rect x="270" y="60" width="4" height="100" fill="${C.ink}" opacity=".6"/>${ground(156, "#e8c999")}<path d="M0 176h${W}" stroke="#fff" stroke-width="2" opacity=".7"/>`,
    home: () => `<rect width="${W}" height="${H}" fill="${C.wall}"/><rect x="220" y="30" width="72" height="60" rx="4" fill="${C.sky}" stroke="#fff" stroke-width="4"/><rect x="18" y="104" width="120" height="44" rx="10" fill="${C.purple}" opacity=".55"/><rect x="18" y="92" width="120" height="22" rx="10" fill="${C.purple}" opacity=".7"/>${ground(158, C.floor)}`,
    market: () => `<rect width="${W}" height="${H}" fill="#f7e7d3"/>${[0, 1, 2].map((i) => `<rect x="${12 + i * 104}" y="56" width="92" height="70" fill="#e8d6bd"/><path d="M${8 + i * 104} 56h100l-6 -20h-88z" fill="${[C.coral, C.amber, C.teal][i]}"/>`).join("")}<circle cx="40" cy="20" r="4" fill="${C.amber}"/><circle cx="90" cy="16" r="4" fill="${C.coral}"/><circle cx="160" cy="20" r="4" fill="${C.amber}"/><circle cx="230" cy="16" r="4" fill="${C.coral}"/><circle cx="290" cy="20" r="4" fill="${C.amber}"/><path d="M20 20Q90 30 160 20T300 20" stroke="${C.ink}" stroke-width="1" fill="none" opacity=".4"/>${ground(156, C.floor)}`,
    rain: () => `<rect width="${W}" height="${H}" fill="#c9d6dc"/><rect x="20" y="56" width="70" height="104" rx="4" fill="#b2c3ca"/><rect x="240" y="44" width="62" height="116" rx="4" fill="#aebfc6"/>${ground(160, "#9fb1b8")}${Array.from({ length: 34 }, (_, i) => `<path d="M${(i * 37) % 320} ${(i * 53) % 150}l-4 10" stroke="#fff" stroke-width="1.5" opacity=".75" stroke-linecap="round"/>`).join("")}`,
    hallway: () => `<rect width="${W}" height="${H}" fill="#eae3d6"/>${[0, 1, 2, 3].map((i) => `<rect x="${16 + i * 76}" y="40" width="60" height="110" rx="3" fill="${i % 2 ? "#9fc1c7" : "#a8c7b7"}"/><circle cx="${66 + i * 76}" cy="96" r="2.5" fill="${C.ink}"/>`).join("")}${ground(152, C.floor)}`,
    cafeteria: () => `<rect width="${W}" height="${H}" fill="${C.wall}"/><rect x="190" y="104" width="120" height="10" rx="3" fill="${C.wood}"/><rect x="20" y="118" width="120" height="10" rx="3" fill="${C.wood}"/>${ground(158, C.floor)}`,
    stairs: () => `<rect width="${W}" height="${H}" fill="${C.sky2}"/>${[0, 1, 2, 3, 4].map((i) => `<rect x="${140 + i * 36}" y="${160 - (i + 1) * 20}" width="${200 - i * 36}" height="${(i + 1) * 20}" fill="${i % 2 ? "#d9cdb9" : "#e3d8c6"}"/>`).join("")}${ground(160, C.floor)}<path d="M150 120L300 40" stroke="${C.gray}" stroke-width="3"/>`,
    bus: () => `<rect width="${W}" height="${H}" fill="${C.sky}"/>${ground(160, C.floor)}<rect x="30" y="60" width="210" height="88" rx="14" fill="${C.amber}"/><rect x="44" y="72" width="44" height="34" rx="4" fill="#e9f3f5"/><rect x="98" y="72" width="40" height="34" rx="4" fill="#e9f3f5"/><rect x="148" y="72" width="40" height="34" rx="4" fill="#e9f3f5"/><rect x="196" y="72" width="32" height="70" rx="4" fill="#d8e8eb"/><circle cx="70" cy="150" r="12" fill="${C.ink}"/><circle cx="200" cy="150" r="12" fill="${C.ink}"/>`,
    door: () => `<rect width="${W}" height="${H}" fill="${C.wall}"/><rect x="120" y="36" width="84" height="124" rx="4" fill="#cfe0e3" stroke="${C.wood}" stroke-width="6"/><rect x="190" y="96" width="4" height="16" rx="2" fill="${C.ink}"/>${ground(160, C.floor)}`,
    dinner: () => `<rect width="${W}" height="${H}" fill="${C.wall}"/><circle cx="160" cy="28" r="10" fill="#f6d36b"/><path d="M160 0v18" stroke="${C.ink}" stroke-width="2"/>${ground(160, C.floor)}`,
    sign: () => `<rect width="${W}" height="${H}" fill="${C.sky2}"/><path d="M110 70l50 -30 50 30z" fill="${C.coral}"/><rect x="118" y="70" width="84" height="60" fill="#f3e2c5"/><rect x="146" y="96" width="28" height="34" fill="${C.wood}"/>${ground(156, C.grass)}<rect x="16" y="60" width="92" height="46" rx="6" fill="#fff" stroke="${C.teal}" stroke-width="3"/><text x="62" y="78" text-anchor="middle" font-size="9" font-weight="700" fill="${C.teal}" font-family="sans-serif">THREE ACTS</text><text x="62" y="92" text-anchor="middle" font-size="9" font-weight="700" fill="${C.teal}" font-family="sans-serif">OF GOODNESS</text><rect x="58" y="106" width="8" height="50" fill="${C.wood}"/>`,
  };

  /* ---------- 道具 ---------- */
  const P = {
    paperX: (x, y) => `<rect x="${x}" y="${y}" width="26" height="32" rx="2" fill="#fff" stroke="${C.gray}"/><path d="M${x + 6} ${y + 9}l14 14M${x + 20} ${y + 9}l-14 14" stroke="${C.red}" stroke-width="3" stroke-linecap="round"/>`,
    desk: (x, y, w = 90) => `<rect x="${x}" y="${y}" width="${w}" height="8" rx="2" fill="${C.wood}"/><rect x="${x + 6}" y="${y + 8}" width="6" height="${158 - y - 8}" fill="${C.wood}"/><rect x="${x + w - 12}" y="${y + 8}" width="6" height="${158 - y - 8}" fill="${C.wood}"/>`,
    map: (x, y) => `<path d="M${x} ${y}l10 -4 10 4 10 -4v22l-10 4 -10 -4 -10 4z" fill="#fff4d6" stroke="${C.amber}" stroke-width="1.5"/><path d="M${x + 10} ${y - 4}v22M${x + 20} ${y}v22" stroke="${C.amber}" stroke-width="1"/>`,
    bench: (x, y) => `<rect x="${x}" y="${y}" width="120" height="8" rx="3" fill="${C.wood}"/><rect x="${x}" y="${y - 22}" width="120" height="6" rx="3" fill="${C.wood}"/><rect x="${x + 8}" y="${y + 8}" width="6" height="${158 - y - 8}" fill="${C.wood}"/><rect x="${x + 106}" y="${y + 8}" width="6" height="${158 - y - 8}" fill="${C.wood}"/>`,
    thought: (x, y, t) => `<circle cx="${x - 14}" cy="${y + 24}" r="3" fill="#fff"/><circle cx="${x - 8}" cy="${y + 14}" r="5" fill="#fff"/><ellipse cx="${x + 10}" cy="${y}" rx="22" ry="16" fill="#fff"/><text x="${x + 10}" y="${y + 6}" text-anchor="middle" font-size="18" font-weight="700" fill="${C.ink}" font-family="sans-serif">${t}</text>`,
    bubble: (x, y, t, c = "#fff") => `<rect x="${x}" y="${y}" width="${t.length * 7 + 18}" height="24" rx="12" fill="${c}"/><path d="M${x + 14} ${y + 24}l-4 8 10 -8z" fill="${c}"/><text x="${x + 9}" y="${y + 16}" font-size="11" font-weight="700" fill="${C.ink}" font-family="sans-serif">${t}</text>`,
    confetti: () => Array.from({ length: 22 }, (_, i) => `<rect x="${(i * 47) % 300 + 10}" y="${(i * 29) % 90 + 6}" width="6" height="3" rx="1" fill="${[C.amber, C.coral, C.teal, C.green, C.purple][i % 5]}" transform="rotate(${(i * 37) % 90} ${(i * 47) % 300 + 13} ${(i * 29) % 90 + 7})"/>`).join(""),
    card: (x, y) => `<rect x="${x}" y="${y}" width="26" height="18" rx="3" fill="#fff" stroke="${C.teal}" stroke-width="2"/><circle cx="${x + 8}" cy="${y + 9}" r="4" fill="${C.amber}"/><path d="M${x + 15} ${y + 6}h7M${x + 15} ${y + 11}h5" stroke="${C.gray}" stroke-width="2"/>`,
    ball: (x, y) => `<circle cx="${x}" cy="${y}" r="9" fill="${C.coral}"/><path d="M${x - 9} ${y}h18M${x} ${y - 9}v18" stroke="${C.ink}" stroke-width="1" opacity=".5"/>`,
    clipboard: (x, y) => `<rect x="${x}" y="${y}" width="16" height="22" rx="2" fill="${C.wood}"/><rect x="${x + 2}" y="${y + 4}" width="12" height="16" fill="#fff"/>`,
    phone: (x, y, big) => big
      ? `<rect x="${x}" y="${y}" width="70" height="120" rx="10" fill="${C.ink}"/><rect x="${x + 5}" y="${y + 10}" width="60" height="100" rx="4" fill="#f5f7f6"/><rect x="${x + 10}" y="${y + 20}" width="38" height="14" rx="7" fill="${C.teal}"/><rect x="${x + 18}" y="${y + 40}" width="42" height="14" rx="7" fill="${C.teal}"/><rect x="${x + 10}" y="${y + 60}" width="30" height="14" rx="7" fill="${C.teal}"/><text x="${x + 18}" y="${y + 98}" font-size="16" fill="${C.gray}" font-family="sans-serif">…</text>`
      : `<rect x="${x}" y="${y}" width="10" height="16" rx="2" fill="${C.ink}"/>`,
    bags: (x, y) => `<rect x="${x}" y="${y}" width="18" height="20" rx="3" fill="${C.green}"/><path d="M${x + 4} ${y}q5 -8 10 0" stroke="${C.green}" stroke-width="2" fill="none"/><rect x="${x + 14}" y="${y + 2}" width="16" height="18" rx="3" fill="${C.amber}"/><path d="M${x + 17} ${y + 2}q5 -7 10 0" stroke="${C.amber}" stroke-width="2" fill="none"/>`,
    books: (x, y) => [0, 1, 2, 3].map((i) => `<rect x="${x + i * 22}" y="${y + (i % 2) * 6}" width="18" height="6" rx="1" fill="${[C.coral, C.teal, C.amber, C.purple][i]}" transform="rotate(${[-20, 10, 35, -8][i]} ${x + i * 22 + 9} ${y + 3})"/>`).join(""),
    umbrella: (x, y, c = C.coral) => `<path d="M${x - 26} ${y}a26 20 0 0 1 52 0z" fill="${c}"/><path d="M${x} ${y}v30" stroke="${C.ink}" stroke-width="2"/>`,
    tray: (x, y) => `<rect x="${x}" y="${y}" width="30" height="5" rx="2" fill="${C.gray}"/><circle cx="${x + 10}" cy="${y - 3}" r="5" fill="#fff" stroke="${C.gray}"/><rect x="${x + 18}" y="${y - 9}" width="6" height="9" fill="${C.amber}"/>`,
    machine: (x, y) => `<rect x="${x}" y="${y}" width="56" height="110" rx="6" fill="${C.teal}"/><rect x="${x + 8}" y="${y + 12}" width="40" height="30" rx="3" fill="#dff1ee"/><path d="M${x + 14} ${y + 22}h28M${x + 14} ${y + 30}h18" stroke="${C.gray}" stroke-width="3"/>${[0, 1, 2].map((r) => [0, 1, 2].map((c) => `<rect x="${x + 10 + c * 13}" y="${y + 52 + r * 12}" width="10" height="8" rx="2" fill="#fff" opacity=".85"/>`).join("")).join("")}<rect x="${x + 14}" y="${y + 92}" width="28" height="6" rx="3" fill="${C.ink}"/>`,
    trash: (x, y) => `<path d="M${x} ${y}l8 -3 4 5 -7 3z" fill="#fff" stroke="${C.gray}"/><circle cx="${x + 26}" cy="${y}" r="3.5" fill="${C.coral}"/>`,
    bin: (x, y) => `<path d="M${x} ${y}h26l-3 34h-20z" fill="${C.green}"/><rect x="${x - 2}" y="${y - 4}" width="30" height="5" rx="2" fill="${C.ink}"/>`,
    table: (x, y, w = 160) => `<rect x="${x}" y="${y}" width="${w}" height="10" rx="3" fill="${C.wood}"/><rect x="${x + 10}" y="${y + 10}" width="8" height="${160 - y - 10}" fill="${C.wood}"/><rect x="${x + w - 18}" y="${y + 10}" width="8" height="${160 - y - 10}" fill="${C.wood}"/><circle cx="${x + 40}" cy="${y - 5}" r="9" fill="#fff" stroke="${C.gray}"/><circle cx="${x + w - 40}" cy="${y - 5}" r="9" fill="#fff" stroke="${C.gray}"/><ellipse cx="${x + w / 2}" cy="${y - 6}" rx="16" ry="8" fill="${C.coral}"/>`,
    sweat: (x, y) => `<path d="M${x} ${y}q3 5 0 7q-3 -2 0 -7z" fill="${C.blue}" opacity=".7"/>`,
    heart: (x, y) => `<path d="M${x} ${y + 6}l-7 -7a4 4 0 0 1 7 -5a4 4 0 0 1 7 5z" fill="${C.coral}"/>`,
  };

  const wrap = (label, body) => `<svg class="art" viewBox="0 0 ${W} ${H}" role="img" aria-label="${label}" xmlns="http://www.w3.org/2000/svg"><g>${body}</g></svg>`;

  /* ---------- 場景 ---------- */
  const SCENES = {
    // Good Talk
    "exam-fail": ["朋友考試又沒過，難過地坐在書桌前", () => BG.classroom() + P.desk(70, 120) + person({ x: 115, y: 158, sit: true, mood: "sad", shirt: C.blue, arms: "hold" }) + P.paperX(82, 92) + person({ x: 220, y: 158, mood: "worried", shirt: C.amber, hair: 1, hairStyle: "long", skin: 1, arms: ["down", "reach"], facing: -1 }) + P.thought(140, 42, "…")],
    "lost-tourist": ["外國遊客拿著地圖，在車站前問路", () => BG.station() + person({ x: 110, y: 172, mood: "worried", shirt: C.green, hairStyle: "cap", backpack: C.coral, arms: ["hold", "down"], facing: 1, skin: 0 }) + P.map(84, 122) + person({ x: 210, y: 172, mood: "happy", shirt: C.teal, arms: ["down", "point"], facing: -1, skin: 1, hair: 0 }) + P.bubble(12, 26, "Night market?")],
    "future-worry": ["朋友坐在長椅上，為未來擔心", () => BG.park() + P.bench(100, 130) + person({ x: 135, y: 158, sit: true, mood: "worried", shirt: C.purple, arms: ["hold", "chin"], skin: 1 }) + `<rect x="128" y="112" width="20" height="14" rx="2" fill="#fff" stroke="${C.gray}"/>` + person({ x: 190, y: 158, sit: true, mood: "neutral", shirt: C.amber, hairStyle: "long", hair: 2, arms: ["reach", "down"], facing: -1 }) + P.thought(140, 34, "?")],
    "good-news": ["朋友開心地拿著剛考到的駕照", () => BG.street() + P.confetti() + person({ x: 130, y: 172, mood: "happy", shirt: C.coral, hairStyle: "long", hair: 1, arms: ["up", "wave"], skin: 0 }) + P.card(104, 52) + person({ x: 210, y: 172, mood: "happy", shirt: C.teal, arms: ["down", "wave"], facing: -1, skin: 2 })],
    // Think Well
    "teammate-mistake": ["比賽輸了，隊友低著頭，球在地上", () => BG.court() + person({ x: 110, y: 168, mood: "sad", shirt: C.purple, arms: "down", skin: 1 }) + P.ball(150, 160) + person({ x: 210, y: 168, mood: "neutral", shirt: C.teal, hairStyle: "cap", cap: C.ink, arms: ["down", "hold"], facing: -1 }) + P.clipboard(212, 104) + P.thought(110, 32, "…")],
    "no-reply": ["一直看手機，朋友兩天沒回訊息", () => BG.home() + person({ x: 90, y: 160, sit: true, mood: "worried", shirt: C.coral, hairStyle: "long", hair: 0, arms: ["hold", "hold"] }) + P.phone(84, 100) + P.phone(200, 40, true) + P.thought(150, 30, "?")],
    // Global Share
    "ambassador-three-acts": ["外國旅客好奇地看著「三好」的標語", () => BG.sign() + person({ x: 190, y: 172, mood: "happy", shirt: C.green, hairStyle: "long", hair: 2, backpack: C.amber, arms: ["point", "down"], facing: -1, skin: 0 }) + person({ x: 262, y: 172, mood: "happy", shirt: C.teal, arms: ["down", "wave"], facing: -1, skin: 1 }) + P.bubble(178, 40, "What does it mean?")],
    // 看圖說好話
    "pt-stairs": ["一位長輩提著兩袋重物，吃力地爬樓梯", () => BG.stairs() + person({ x: 196, y: 120, old: true, mood: "worried", shirt: C.purple, hairStyle: "bun", arms: ["hold", "hold"], skin: 0 }) + P.bags(178, 80) + P.sweat(214, 18) + person({ x: 70, y: 168, mood: "neutral", shirt: C.teal, arms: "down", facing: 1, skin: 1 })],
    "pt-lost-child": ["熱鬧的市場裡，一個小孩站著哭", () => BG.market() + person({ x: 150, y: 168, s: 0.72, mood: "cry", shirt: C.amber, hairStyle: "short", arms: ["chin", "chin"], skin: 0 }) + person({ x: 240, y: 168, mood: "neutral", shirt: C.green, arms: "down", facing: -1, hairStyle: "long", hair: 1 }) + person({ x: 60, y: 168, mood: "neutral", shirt: C.blue, arms: "down", facing: 1, skin: 2 })],
    "pt-dropped-books": ["走廊上，同學的書掉了一地", () => BG.hallway() + person({ x: 130, y: 162, sit: true, mood: "worried", shirt: C.coral, arms: ["reach", "reach"], hairStyle: "long", hair: 0 }) + P.books(150, 150) + person({ x: 250, y: 162, mood: "neutral", shirt: C.teal, arms: "down", facing: -1, skin: 1 })],
    "pt-rain": ["下大雨，有人沒帶傘，用包包擋雨", () => BG.rain() + person({ x: 130, y: 172, mood: "worried", shirt: C.amber, arms: ["up", "up"], skin: 1 }) + `<rect x="108" y="50" width="44" height="10" rx="4" fill="${C.ink}"/>` + person({ x: 220, y: 172, mood: "neutral", shirt: C.teal, arms: ["down", "hold"], facing: -1, hairStyle: "long", hair: 2 }) + P.umbrella(222, 72)],
    "pt-alone-lunch": ["午餐時間，一位新同學獨自坐著吃飯", () => BG.cafeteria() + P.tray(60, 118) + person({ x: 80, y: 160, sit: true, mood: "sad", shirt: C.purple, arms: ["hold", "hold"], skin: 2 }) + P.tray(230, 104) + person({ x: 220, y: 158, sit: true, s: 0.85, mood: "happy", shirt: C.coral, arms: "down", hairStyle: "long" }) + person({ x: 270, y: 158, sit: true, s: 0.85, mood: "happy", shirt: C.green, arms: "down", facing: -1, skin: 1 })],
    "pt-ticket-machine": ["外國人站在售票機前，看不懂操作", () => BG.station() + P.machine(200, 54) + person({ x: 160, y: 172, mood: "worried", shirt: C.coral, hairStyle: "long", hair: 2, backpack: C.teal, arms: ["chin", "reach"], facing: 1 }) + P.thought(110, 14, "?") + person({ x: 70, y: 172, mood: "neutral", shirt: C.teal, arms: "down", facing: 1, skin: 1 })],
    // 微善任務
    "m-bus": ["下公車時向司機道謝", () => BG.bus() + `<circle cx="212" cy="96" r="10" fill="${C.skin[0]}"/><path d="M202 93a10 10 0 0 1 20 0z" fill="${C.teal}"/><rect x="200" y="106" width="24" height="20" rx="8" fill="${C.teal}"/><circle cx="209" cy="97" r="1.4" fill="${C.ink}"/><circle cx="215" cy="97" r="1.4" fill="${C.ink}"/><path d="M208 101q4 3 8 0" stroke="${C.ink}" stroke-width="1.4" fill="none" stroke-linecap="round"/>` + person({ x: 270, y: 172, mood: "happy", shirt: C.coral, arms: ["down", "wave"], facing: -1, skin: 1 }) + P.bubble(220, 70, "Thank you!")],
    "m-door": ["幫後面的人扶門", () => BG.door() + person({ x: 110, y: 172, mood: "happy", shirt: C.teal, arms: ["down", "reach"], facing: 1 }) + person({ x: 240, y: 172, old: true, mood: "happy", shirt: C.purple, hairStyle: "bun", arms: "down", facing: -1, skin: 1 }) + P.heart(160, 30)],
    "m-trash": ["在公園撿起地上的垃圾", () => BG.park() + P.bin(220, 124) + person({ x: 150, y: 170, mood: "happy", shirt: C.green, arms: ["reach", "down"], facing: 1, skin: 1 }) + P.trash(184, 166) + P.trash(110, 172)],
    "m-dinner": ["吃完晚餐，謝謝家人", () => BG.dinner() + P.table(80, 112) + person({ x: 70, y: 166, mood: "happy", shirt: C.teal, arms: ["down", "wave"] }) + person({ x: 250, y: 166, mood: "happy", shirt: C.coral, hairStyle: "bun", hair: 1, arms: "down", facing: -1, skin: 1 }) + P.heart(160, 56)],
  };

  App.art = {
    images: {},
    has: (id) => Boolean(App.art.images[id] || SCENES[id]),
    scene(id, cls = "") {
      if (App.art.images[id]) return `<img class="art ${cls}" src="${App.art.images[id]}" alt="">`;
      const s = SCENES[id];
      return s ? wrap(s[0], s[1]()).replace('class="art"', `class="art ${cls}"`) : "";
    },
    label: (id) => (SCENES[id] ? SCENES[id][0] : ""),
    ids: () => Object.keys(SCENES),
  };
})();
