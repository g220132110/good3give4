// 測試用假 AI：FAKE_AI=1 node dev/server.mjs
// 攔截送往 Gemini 的請求，依提示詞類型回傳固定 JSON，用來在本機測試「真的 AI」路徑。
const realFetch = globalThis.fetch;
const reply = (obj) => new Response(JSON.stringify({ candidates: [{ finishReason: "STOP", content: { parts: [{ text: JSON.stringify(obj) }] } }] }));
let turn = 0;
globalThis.fetch = async (url, init) => {
  if (!String(url).includes("generativelanguage.googleapis.com")) return realFetch(url, init);
  const sys = JSON.parse(init.body).systemInstruction.parts[0].text;
  const user = JSON.parse(init.body).contents[0].parts[0].text;
  if (sys.includes("role-playing")) {
    turn = (user.match(/\nLearner:/g) || []).length;
    const i = Math.min(turn - 1, 3);
    return reply({ reply: ["Really? You think so?", "Thanks. Maybe I can try again.", "That would help a lot!", "Thank you, I feel better now."][i],
      zh: ["真的嗎？你這樣覺得？", "謝謝，也許我可以再試一次。", "那會很有幫助！", "謝謝你，我感覺好多了。"][i], hint: "肯定他的努力", done: false });
  }
  if (sys.includes("finished a role-play")) {
    return reply({
      summary: "你一開始就鼓勵朋友不要放棄，還提出一起讀書，非常溫暖。下次可以多說他已經進步的地方。",
      level: "B1", fixes: [{ from: "study with together", to: "study together", note: "together 前面不用 with" }],
      acts: [{ name: "說好話", evidence: "你說「Don't give up」，鼓勵朋友。" }, { name: "做好事", evidence: "你主動提出一起讀書。" }],
      givings: [{ name: "給人信心", evidence: "你說「You can do it」，肯定他的能力。" }],
      better: [{ you: "Don't give up.", en: "Don't give up. You've already improved a lot.", zh: "別放棄，你已經進步很多了。", why: "具體指出他的進步", giving: "給人信心" }],
      retry: { turn: 0, tip: "加一句他已經做到的事" },
    });
  }
  if (sys.includes("describing it in English")) {
    const again = user.includes("Previous attempt");
    return reply({
      summary: "你注意到長輩提著重物很辛苦，還主動說要幫忙，非常體貼！", level: "A2",
      seen: ["長輩在爬樓梯", "她提著很重的袋子"], missed: ["她看起來很累、在流汗"],
      fixes: [{ from: "She carry", to: "She is carrying", note: "正在進行的動作用 is + V-ing" }],
      acts: [{ name: "做好事", evidence: "你說「I can help her」，主動提出幫忙。" }], givings: [{ name: "給人方便", evidence: "你想幫她提袋子。" }],
      better: [{ en: "She looks tired. Can I carry your bags for you?", zh: "她看起來很累。我可以幫你提袋子嗎？", why: "先觀察感受，再有禮貌地提出幫忙", giving: "給人方便" }],
      ...(again ? { compare: { improved: true, note: "進步了！這次你還描述了她的感受。" } } : {}),
    });
  }
  const retry = sys.includes("TRY AGAIN MODE");
  return reply({
    tone: { label: "溫暖", note: "很棒，語氣溫暖又真誠。" }, fixes: [],
    better: [{ en: "You've worked so hard. I believe in you.", zh: "你一直很努力，我相信你。", why: "肯定努力", giving: "給人信心" }],
    acts: [{ name: "說好話", evidence: "你用鼓勵的話安慰對方。" }], givings: [{ name: "給人信心", evidence: "你肯定了他的努力。" }], keys: ["believe"],
    ...(retry ? { compare: { improved: true, note: "進步了！這次你具體提到他的進步，更能給人信心。" } } : {}),
  });
};
