/* Good Mission 內容包：每日英文微善任務（純前端，不需要 AI）
 * 每個任務：Learn（學兩句）→ Practice（跟讀，或連到對話情境）→ Act（真實生活做到）→ Reflect（反思）
 * tags：對應的三好四給（完成時記進 Passport）
 * practice：可連到的對話情境 id（js/modules/goodtalk.js），沒有就省略
 * 內容為自行撰寫、人工審核。
 */
App.registerContent("mission", {
  tasks: [
    {
      id: "thank-driver", tags: ["說好話", "給人歡喜"],
      zh: "下車時，真誠地向司機道謝", en: "Thank the driver",
      why: "一句真心的謝謝，可能是司機今天聽到最溫暖的話。",
      learn: [
        { en: "Thank you so much. Have a nice day!", zh: "非常謝謝你，祝你有美好的一天！" },
        { en: "Thanks for the ride!", zh: "謝謝你載我！" },
      ],
      reflect: "Today I thanked a bus driver.",
    },
    {
      id: "help-directions", tags: ["做好事", "給人方便"], practice: "lost-tourist",
      zh: "主動幫看起來迷路的人指路", en: "Help someone find the way",
      why: "幾句清楚的指引，可以省下對方很多時間和不安。",
      learn: [
        { en: "Can I help you find something?", zh: "需要我幫你找什麼地方嗎？" },
        { en: "Go straight and turn left. It's about five minutes.", zh: "直走再左轉，大約五分鐘。" },
      ],
      reflect: "Today I helped someone find the train station.",
    },
    {
      id: "praise-effort", tags: ["說好話", "給人信心"], practice: "good-news",
      zh: "真誠稱讚一位朋友或同事的努力", en: "Praise someone's effort",
      why: "被看見努力，比被稱讚聰明更能給人信心。",
      learn: [
        { en: "You did a great job on this.", zh: "你這件事做得很好。" },
        { en: "I can see how hard you worked.", zh: "我看得出來你很努力。" },
      ],
      reflect: "Today I told my friend she did a great job.",
    },
    {
      id: "hold-door", tags: ["做好事", "給人方便"],
      zh: "幫後面的人扶門，或讓座給需要的人", en: "Hold the door or offer your seat",
      why: "小小的動作，讓別人的一天輕鬆一點。",
      learn: [
        { en: "After you.", zh: "你先請。" },
        { en: "Please, take my seat.", zh: "請坐我的位子。" },
      ],
      reflect: "Today I gave my seat to an old man.",
    },
    {
      id: "listen-first", tags: ["存好心", "給人希望"], practice: "future-worry",
      zh: "朋友抱怨或難過時，先聽完再回應", en: "Listen before you answer",
      why: "先聽懂對方，比急著給建議更能讓人感到被支持。",
      learn: [
        { en: "That sounds hard. Tell me more.", zh: "聽起來很不容易，多說一點給我聽。" },
        { en: "I'm here for you.", zh: "我會陪著你。" },
      ],
      reflect: "Today I listened to my friend without interrupting.",
    },
    {
      id: "kind-message", tags: ["說好話", "給人歡喜"], practice: "no-reply",
      zh: "傳一則關心的訊息給好久沒聯絡的人", en: "Send a caring message",
      why: "一則簡單的問候，可能讓對方開心一整天。",
      learn: [
        { en: "Hi! I was thinking of you. How are you?", zh: "嗨！剛好想到你，最近好嗎？" },
        { en: "Hope you're doing well!", zh: "希望你一切都好！" },
      ],
      reflect: "Today I sent a message to an old friend.",
    },
    {
      id: "no-judge", tags: ["存好心"], practice: "teammate-mistake",
      zh: "別人犯錯時，先想一個可能的原因再說話", en: "Think before you judge",
      why: "多想一步，就能把責怪換成理解。",
      learn: [
        { en: "Maybe he had a hard day.", zh: "也許他今天過得不太順。" },
        { en: "It's okay. Everyone makes mistakes.", zh: "沒關係，每個人都會犯錯。" },
      ],
      reflect: "Today I didn't get angry when my classmate made a mistake.",
    },
    {
      id: "share-three-acts", tags: ["說好話"], practice: "ambassador-three-acts",
      zh: "跟一位朋友分享三好四給", en: "Share the Three Acts of Goodness",
      why: "把好的想法分享出去，善意就會傳得更遠。",
      learn: [
        { en: "Have you heard of the Three Acts of Goodness?", zh: "你聽過三好嗎？" },
        { en: "Do good deeds, speak good words, and think good thoughts.", zh: "做好事、說好話、存好心。" },
      ],
      reflect: "Today I told my friend about the Three Acts of Goodness.",
    },
    {
      id: "pick-up-trash", tags: ["做好事"],
      zh: "隨手撿起地上的垃圾", en: "Pick up litter",
      why: "環境乾淨，每個經過的人都會舒服一點。",
      learn: [
        { en: "Let me get that.", zh: "我來撿。" },
        { en: "Let's keep this place clean.", zh: "我們一起讓這裡保持乾淨吧。" },
      ],
      reflect: "Today I picked up some trash in the park.",
    },
    {
      id: "thank-family", tags: ["說好話", "給人歡喜"],
      zh: "對家人說一句謝謝", en: "Thank your family",
      why: "最親近的人，最常被我們忘記道謝。",
      learn: [
        { en: "Thank you for everything you do.", zh: "謝謝你為我做的一切。" },
        { en: "Dinner was delicious. Thanks, Mom!", zh: "晚餐好好吃，謝謝媽！" },
      ],
      reflect: "Today I thanked my mom for dinner.",
    },
  ],
});
