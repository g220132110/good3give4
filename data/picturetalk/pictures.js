/* 看圖說好話 內容包：圖片（js/core/art.js 的場景 id）、提示字、示範說法。
 * id 必須和後端 worker/src/pictures.js 一致；圖片的文字說明只放後端。
 * level：A2／B1／B2；B2 是「推想圖」，用 thinkQuestions（想想可能的原因、有禮貌地說）。
 * panels：有這個欄位就是三格故事（Story Mode），用 storyQuestions。
 * model：示範說法（看到什麼 → 感受 → 我可以怎麼幫），人工撰寫、人工審核。
 */
App.registerContent("picturetalk", {
  questions: [
    { en: "What do you see?", zh: "你看到什麼？" },
    { en: "How does the person feel?", zh: "圖裡的人感覺怎麼樣？" },
    { en: "What could you do to help?", zh: "你可以怎麼幫忙？" },
  ],
  thinkQuestions: [
    { en: "What do you see?", zh: "你看到什麼？" },
    { en: "What might be happening? Why?", zh: "可能發生了什麼事？為什麼？" },
    { en: "What could you say politely?", zh: "你可以怎麼有禮貌地說？" },
  ],
  storyQuestions: [
    { en: "Tell the story in 3–5 sentences.", zh: "用 3–5 句說完這個故事。" },
    { en: "Use First, Then, Finally.", zh: "用 First、Then、Finally 串起來。" },
    { en: "How do the people feel at the end?", zh: "最後大家感覺怎麼樣？" },
  ],
  pictures: [
    {
      id: "pt-stairs", level: "A2", tags: ["做好事", "給人方便"],
      zh: "提重物爬樓梯的長輩", en: "Heavy bags on the stairs",
      words: [{ en: "stairs", zh: "樓梯" }, { en: "heavy", zh: "重的" }, { en: "tired", zh: "累的" }, { en: "carry", zh: "提、搬" }],
      model: [
        { en: "An old woman is climbing the stairs with two heavy bags.", zh: "一位老奶奶提著兩袋重物在爬樓梯。" },
        { en: "She looks very tired.", zh: "她看起來很累。" },
        { en: "I can say, \"Can I help you carry your bags?\"", zh: "我可以說：「我可以幫你提袋子嗎？」" },
      ],
    },
    {
      id: "pt-lost-child", level: "B1", tags: ["做好事", "給人希望"],
      zh: "市場裡哭泣的小孩", en: "A lost child at the market",
      words: [{ en: "market", zh: "市場" }, { en: "crying", zh: "在哭" }, { en: "lost", zh: "走失的" }, { en: "parents", zh: "父母" }],
      model: [
        { en: "A little child is crying in a busy market.", zh: "一個小孩在熱鬧的市場裡哭。" },
        { en: "Maybe the child is lost and scared.", zh: "這個孩子可能走失了，很害怕。" },
        { en: "I can stay with the child and help find their parents.", zh: "我可以陪著孩子，幫忙找他的爸媽。" },
      ],
    },
    {
      id: "pt-dropped-books", level: "A2", tags: ["做好事", "給人方便"],
      zh: "書掉了一地的同學", en: "Dropped books",
      words: [{ en: "hallway", zh: "走廊" }, { en: "drop", zh: "掉落" }, { en: "floor", zh: "地上" }, { en: "pick up", zh: "撿起來" }],
      model: [
        { en: "A student dropped her books in the hallway.", zh: "一位同學的書在走廊上掉了。" },
        { en: "She looks worried.", zh: "她看起來很著急。" },
        { en: "I can help her pick up the books.", zh: "我可以幫她把書撿起來。" },
      ],
    },
    {
      id: "pt-rain", level: "A2", tags: ["做好事", "給人方便"],
      zh: "沒帶傘的路人", en: "No umbrella in the rain",
      words: [{ en: "rain", zh: "雨" }, { en: "umbrella", zh: "雨傘" }, { en: "wet", zh: "濕的" }, { en: "share", zh: "分享、共用" }],
      model: [
        { en: "It is raining hard, and a man has no umbrella.", zh: "雨下得很大，有個人沒帶傘。" },
        { en: "He is getting wet.", zh: "他快被淋濕了。" },
        { en: "I can share my umbrella with him.", zh: "我可以跟他一起撐傘。" },
      ],
    },
    {
      id: "pt-alone-lunch", level: "B1", tags: ["存好心", "給人歡喜"],
      zh: "獨自吃午餐的新同學", en: "Eating lunch alone",
      words: [{ en: "lunch", zh: "午餐" }, { en: "alone", zh: "獨自" }, { en: "new student", zh: "新同學" }, { en: "join", zh: "加入" }],
      model: [
        { en: "A new student is eating lunch alone.", zh: "一位新同學一個人在吃午餐。" },
        { en: "He looks a little lonely.", zh: "他看起來有點孤單。" },
        { en: "I can say, \"Hi! Do you want to eat with us?\"", zh: "我可以說：「嗨！要不要跟我們一起吃？」" },
      ],
    },
    {
      id: "pt-ticket-machine", level: "A2", tags: ["做好事", "給人方便"],
      zh: "看不懂售票機的旅客", en: "Confused at the ticket machine",
      words: [{ en: "ticket machine", zh: "售票機" }, { en: "confused", zh: "困惑的" }, { en: "traveler", zh: "旅客" }, { en: "show", zh: "示範給…看" }],
      model: [
        { en: "A traveler is standing in front of a ticket machine.", zh: "一位旅客站在售票機前。" },
        { en: "She looks confused.", zh: "她看起來不知道怎麼用。" },
        { en: "I can say, \"Can I help? Let me show you how to buy a ticket.\"", zh: "我可以說：「需要幫忙嗎？我示範給你看怎麼買票。」" },
      ],
    },
    {
      id: "pt-performance", level: "A2", tags: ["說好話", "給人信心"],
      zh: "表演完的同學", en: "After the show",
      words: [{ en: "stage", zh: "舞台" }, { en: "perform", zh: "表演" }, { en: "clap", zh: "拍手" }, { en: "amazing", zh: "很棒的" }],
      model: [
        { en: "A student just finished a show on the stage.", zh: "一位同學剛在舞台上表演完。" },
        { en: "She looks happy, and her friends are clapping.", zh: "她看起來很開心，朋友們在拍手。" },
        { en: "I can say, \"You were amazing! I loved your song.\"", zh: "我可以說：「你好棒！我很喜歡你唱的歌。」" },
      ],
    },
    {
      id: "pt-nervous-speech", level: "B1", tags: ["說好話", "給人信心"],
      zh: "上台前很緊張的同學", en: "Nervous before a speech",
      words: [{ en: "nervous", zh: "緊張的" }, { en: "speech", zh: "演講" }, { en: "sweat", zh: "流汗" }, { en: "take your time", zh: "慢慢來" }],
      model: [
        { en: "A student is standing in front of the class with a paper.", zh: "一位同學拿著講稿站在全班面前。" },
        { en: "He is sweating, so he is probably nervous about his speech.", zh: "他在流汗，可能對演講很緊張。" },
        { en: "I can smile at him and say, \"Take your time. You can do it.\"", zh: "我可以對他微笑說：「慢慢來，你做得到。」" },
      ],
    },
    {
      id: "pt-apology", level: "B1", tags: ["說好話", "存好心"],
      zh: "不小心打翻飲料的同學", en: "An accident at lunch",
      words: [{ en: "spill", zh: "灑出來" }, { en: "accident", zh: "意外" }, { en: "apologize", zh: "道歉" }, { en: "clean up", zh: "清理" }],
      model: [
        { en: "A student knocked over a cup, and the drink spilled on the table.", zh: "一位同學打翻杯子，飲料灑在桌上。" },
        { en: "She feels bad and says, \"I'm so sorry!\"", zh: "她覺得很抱歉，說：「真的很對不起！」" },
        { en: "I can say, \"It's okay. Accidents happen. Let's clean it up together.\"", zh: "我可以說：「沒關係，意外難免，我們一起擦乾淨吧。」" },
      ],
    },
    {
      id: "pt-crumpled-art", level: "B1", tags: ["給人信心", "給人希望"],
      zh: "畫不好而沮喪的女孩", en: "A bad drawing day",
      words: [{ en: "upset", zh: "難過的" }, { en: "crumpled", zh: "揉皺的" }, { en: "drawing", zh: "畫" }, { en: "try again", zh: "再試一次" }],
      model: [
        { en: "A girl is sitting next to her easel, and there is crumpled paper on the floor.", zh: "一個女孩坐在畫架旁，地上有揉皺的紙。" },
        { en: "She is upset because her drawings didn't go well.", zh: "她很難過，因為畫得不順利。" },
        { en: "I can say, \"I can see you worked hard. Every artist makes mistakes. Let's try again!\"", zh: "我可以說：「我看得出你很努力，每個畫家都會失敗，再試一次吧！」" },
      ],
    },
    {
      id: "pt-cut-line", level: "B2", tags: ["存好心", "說好話"],
      zh: "直接走到隊伍最前面的人", en: "Someone at the front of the line",
      words: [{ en: "line", zh: "隊伍" }, { en: "cut in line", zh: "插隊" }, { en: "maybe he didn't see", zh: "也許他沒看到" }, { en: "Excuse me", zh: "不好意思" }],
      model: [
        { en: "People are waiting in line, but a man walked straight to the front.", zh: "大家在排隊，但有個人直接走到最前面。" },
        { en: "He is looking at his phone, so maybe he didn't see the line.", zh: "他在看手機，也許他沒看到隊伍。" },
        { en: "I could say politely, \"Excuse me, I think the line starts back there.\"", zh: "我可以有禮貌地說：「不好意思，隊伍好像是從後面開始喔。」" },
      ],
    },
    {
      id: "pt-priority-seat", level: "B2", tags: ["存好心", "給人方便"],
      zh: "博愛座與站著的長輩", en: "The priority seat",
      words: [{ en: "priority seat", zh: "博愛座" }, { en: "elderly", zh: "年長的" }, { en: "hidden need", zh: "看不見的需要" }, { en: "offer", zh: "主動提供" }],
      model: [
        { en: "A young man is sitting in a priority seat, and an elderly man is standing.", zh: "一位年輕人坐在博愛座，旁邊有位長輩站著。" },
        { en: "The young man looks tired. Maybe he is sick, so I shouldn't judge him too quickly.", zh: "年輕人看起來很累，也許他身體不舒服，我不該太快下定論。" },
        { en: "I can offer my own seat: \"Sir, would you like to sit here?\"", zh: "我可以讓出自己的座位：「先生，您要坐這裡嗎？」" },
      ],
    },
    {
      id: "story-stairs", level: "A2", tags: ["做好事", "給人方便"], panels: ["pt-stairs", "st-stairs-2", "st-stairs-3"],
      zh: "故事：樓梯上的幫忙", en: "Story: Help on the stairs",
      words: [{ en: "First", zh: "首先" }, { en: "Then", zh: "接著" }, { en: "Finally", zh: "最後" }, { en: "carried", zh: "提（過去式）" }],
      model: [
        { en: "First, an old woman was climbing the stairs with two heavy bags.", zh: "首先，一位老奶奶提著兩袋重物爬樓梯。" },
        { en: "Then a student walked up and asked, \"Can I help you?\"", zh: "接著，一位學生走過去問：「需要幫忙嗎？」" },
        { en: "Finally, he carried her bags, and she said, \"Thank you, dear!\"", zh: "最後，他幫她提袋子，她說：「謝謝你，孩子！」" },
      ],
    },
    {
      id: "story-lunch", level: "B1", tags: ["存好心", "給人歡喜"], panels: ["pt-alone-lunch", "st-lunch-2", "st-lunch-3"],
      zh: "故事：一起吃午餐", en: "Story: Lunch together",
      words: [{ en: "At first", zh: "一開始" }, { en: "After that", zh: "之後" }, { en: "In the end", zh: "最後" }, { en: "lonely", zh: "孤單的" }],
      model: [
        { en: "At first, a new student was eating lunch alone, and he looked lonely.", zh: "一開始，一位新同學獨自吃午餐，看起來很孤單。" },
        { en: "After that, a girl came over with her tray and asked, \"Hi! Can I sit here?\"", zh: "之後，一個女孩端著餐盤過來問：「嗨！我可以坐這裡嗎？」" },
        { en: "In the end, they ate together and became friends.", zh: "最後，他們一起吃飯，成了朋友。" },
      ],
    },
    {
      id: "story-rain", level: "A2", tags: ["做好事", "給人方便"], panels: ["pt-rain", "st-rain-2", "st-rain-3"],
      zh: "故事：一起撐傘", en: "Story: Sharing an umbrella",
      words: [{ en: "First", zh: "首先" }, { en: "Then", zh: "接著" }, { en: "Finally", zh: "最後" }, { en: "shared", zh: "分享（過去式）" }],
      model: [
        { en: "First, it was raining hard, and a man had no umbrella.", zh: "首先，雨下得很大，有個人沒帶傘。" },
        { en: "Then a woman walked over and asked, \"Share my umbrella?\"", zh: "接著，一位女士走過去問：「一起撐傘嗎？」" },
        { en: "Finally, they walked together and stayed dry.", zh: "最後，他們一起走，沒有淋濕。" },
      ],
    },
  ],
});
