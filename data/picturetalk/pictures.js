/* 看圖說好話 內容包：圖片（js/core/art.js 的場景 id）、提示字、示範說法。
 * id 必須和後端 worker/src/pictures.js 一致；圖片的文字說明只放後端。
 * model：示範說法（看到什麼 → 感受 → 我可以怎麼幫），人工撰寫、人工審核。
 */
App.registerContent("picturetalk", {
  questions: [
    { en: "What do you see?", zh: "你看到什麼？" },
    { en: "How does the person feel?", zh: "圖裡的人感覺怎麼樣？" },
    { en: "What could you do to help?", zh: "你可以怎麼幫忙？" },
  ],
  pictures: [
    {
      id: "pt-stairs", tags: ["做好事", "給人方便"],
      zh: "提重物爬樓梯的長輩", en: "Heavy bags on the stairs",
      words: [{ en: "stairs", zh: "樓梯" }, { en: "heavy", zh: "重的" }, { en: "tired", zh: "累的" }, { en: "carry", zh: "提、搬" }],
      model: [
        { en: "An old woman is climbing the stairs with two heavy bags.", zh: "一位老奶奶提著兩袋重物在爬樓梯。" },
        { en: "She looks very tired.", zh: "她看起來很累。" },
        { en: "I can say, \"Can I help you carry your bags?\"", zh: "我可以說：「我可以幫你提袋子嗎？」" },
      ],
    },
    {
      id: "pt-lost-child", tags: ["做好事", "給人希望"],
      zh: "市場裡哭泣的小孩", en: "A lost child at the market",
      words: [{ en: "market", zh: "市場" }, { en: "crying", zh: "在哭" }, { en: "lost", zh: "走失的" }, { en: "parents", zh: "父母" }],
      model: [
        { en: "A little child is crying in a busy market.", zh: "一個小孩在熱鬧的市場裡哭。" },
        { en: "Maybe the child is lost and scared.", zh: "這個孩子可能走失了，很害怕。" },
        { en: "I can stay with the child and help find their parents.", zh: "我可以陪著孩子，幫忙找他的爸媽。" },
      ],
    },
    {
      id: "pt-dropped-books", tags: ["做好事", "給人方便"],
      zh: "書掉了一地的同學", en: "Dropped books",
      words: [{ en: "hallway", zh: "走廊" }, { en: "drop", zh: "掉落" }, { en: "floor", zh: "地上" }, { en: "pick up", zh: "撿起來" }],
      model: [
        { en: "A student dropped her books in the hallway.", zh: "一位同學的書在走廊上掉了。" },
        { en: "She looks worried.", zh: "她看起來很著急。" },
        { en: "I can help her pick up the books.", zh: "我可以幫她把書撿起來。" },
      ],
    },
    {
      id: "pt-rain", tags: ["做好事", "給人方便"],
      zh: "沒帶傘的路人", en: "No umbrella in the rain",
      words: [{ en: "rain", zh: "雨" }, { en: "umbrella", zh: "雨傘" }, { en: "wet", zh: "濕的" }, { en: "share", zh: "分享、共用" }],
      model: [
        { en: "It is raining hard, and a man has no umbrella.", zh: "雨下得很大，有個人沒帶傘。" },
        { en: "He is getting wet.", zh: "他快被淋濕了。" },
        { en: "I can share my umbrella with him.", zh: "我可以跟他一起撐傘。" },
      ],
    },
    {
      id: "pt-alone-lunch", tags: ["存好心", "給人歡喜"],
      zh: "獨自吃午餐的新同學", en: "Eating lunch alone",
      words: [{ en: "lunch", zh: "午餐" }, { en: "alone", zh: "獨自" }, { en: "new student", zh: "新同學" }, { en: "join", zh: "加入" }],
      model: [
        { en: "A new student is eating lunch alone.", zh: "一位新同學一個人在吃午餐。" },
        { en: "He looks a little lonely.", zh: "他看起來有點孤單。" },
        { en: "I can say, \"Hi! Do you want to eat with us?\"", zh: "我可以說：「嗨！要不要跟我們一起吃？」" },
      ],
    },
    {
      id: "pt-ticket-machine", tags: ["做好事", "給人方便"],
      zh: "看不懂售票機的旅客", en: "Confused at the ticket machine",
      words: [{ en: "ticket machine", zh: "售票機" }, { en: "confused", zh: "困惑的" }, { en: "traveler", zh: "旅客" }, { en: "show", zh: "示範給…看" }],
      model: [
        { en: "A traveler is standing in front of a ticket machine.", zh: "一位旅客站在售票機前。" },
        { en: "She looks confused.", zh: "她看起來不知道怎麼用。" },
        { en: "I can say, \"Can I help? Let me show you how to buy a ticket.\"", zh: "我可以說：「需要幫忙嗎？我示範給你看怎麼買票。」" },
      ],
    },
  ],
});
