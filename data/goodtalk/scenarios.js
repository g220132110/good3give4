/* Good Talk 內容包：四給情境（畫面顯示用）與示範模式內容。
 * id 與 opener 必須和後端 worker/src/scenarios.js 一致；角色設定只放後端。
 * openerZh、repliesZh：給初學者看的中文對照。
 * demo：AI 連不到時使用的預寫對話（依輪次）與示範分析，人工撰寫、人工審核。
 */
App.registerContent("goodtalk", {
  scenarios: [
    {
      id: "exam-fail", giving: "給人信心",
      zh: "朋友考試又沒過", en: "A friend failed an exam",
      who: "同學 Jamie 數學考試第二次不及格，覺得自己很笨、想放棄。",
      task: "用英文鼓勵 Jamie，讓他重新有信心。",
      opener: "I studied so hard, but I failed again. Maybe I'm just not good enough.",
      openerZh: "我很努力讀了，結果又沒過。也許我就是不夠好。",
      demo: {
        replies: [
          "Really? But I always get bad grades in math.",
          "Hmm, maybe you're right. I did better on the last quiz.",
          "That would really help. Can we start this weekend?",
          "Thank you. I feel much better now. You're a good friend.",
        ],
        repliesZh: [
          "真的嗎？可是我數學總是考不好。",
          "嗯，也許你說得對，我上次小考有進步。",
          "那真的很有幫助。我們這週末開始好嗎？",
          "謝謝你，我感覺好多了。你真是好朋友。",
        ],
        hints: ["先接住他的感受，再肯定他的努力", "可以提到他已經進步的地方", "試著提出一個具體的幫忙", "約好時間，讓他知道你會陪他"],
        analysis: {
          summary: "示範模式無法分析你剛剛說的話。以下是這個情境裡常見的好說法，可以先跟讀練習。",
          better: [
            { you: "", en: "You worked really hard. One test doesn't decide who you are.", zh: "你真的很努力，一次考試不能決定你是誰。", why: "肯定努力，把失敗和他這個人分開", giving: "給人信心" },
            { you: "", en: "Let's study together this weekend. I can help you.", zh: "這週末我們一起讀，我可以幫你。", why: "提出具體的協助", giving: "給人希望" },
          ],
        },
      },
    },
    {
      id: "lost-tourist", giving: "給人方便",
      zh: "幫迷路的外國遊客", en: "Helping a lost tourist",
      who: "加拿大遊客 Alex 第一次來台灣，在車站附近找不到夜市，不會說中文。",
      task: "用英文幫 Alex 順利找到路。",
      opener: "Excuse me, sorry to bother you. Do you know how to get to the night market?",
      openerZh: "不好意思，打擾一下。你知道夜市怎麼走嗎？",
      demo: {
        replies: [
          "Oh, great! Is it far from here? Can I walk there?",
          "Thank you! Is there anything you recommend to eat there?",
          "That sounds delicious. I'll try it!",
          "You're so kind. Thank you so much for your help!",
        ],
        repliesZh: [
          "太好了！離這裡遠嗎？可以走路過去嗎？",
          "謝謝！那裡有什麼推薦的小吃嗎？",
          "聽起來好好吃，我會去試試看！",
          "你人真好，非常謝謝你的幫忙！",
        ],
        hints: ["先說清楚方向", "告訴他走路大概要多久", "可以推薦一樣夜市小吃", "祝他玩得愉快"],
        analysis: {
          summary: "示範模式無法分析你剛剛說的話。以下是這個情境裡常見的好說法，可以先跟讀練習。",
          better: [
            { you: "", en: "Go straight and turn left at the second light. It's about ten minutes.", zh: "直走，在第二個紅綠燈左轉，大約十分鐘。", why: "給出清楚的路線和時間", giving: "給人方便" },
            { you: "", en: "I'm going that way too. Let me show you!", zh: "我也往那邊走，我帶你去！", why: "直接陪他走一段", giving: "給人歡喜" },
          ],
        },
      },
    },
    {
      id: "future-worry", giving: "給人希望",
      zh: "朋友為未來擔心", en: "A friend worried about the future",
      who: "朋友 Sam 沒有考上想讀的科系，很擔心以後怎麼辦。",
      task: "用英文陪 Sam 看見接下來的路。",
      opener: "I didn't get into the program I wanted. I don't know what to do now.",
      openerZh: "我沒考上想讀的科系，現在不知道該怎麼辦。",
      demo: {
        replies: [
          "I know, but I really wanted it. Everyone else got in.",
          "Maybe. I never thought about other options.",
          "That's true. I could try again next year, right?",
          "Thanks for listening. I feel a little more hopeful now.",
        ],
        repliesZh: [
          "我知道，可是我真的很想讀。其他人都考上了。",
          "也許吧，我從來沒想過其他選擇。",
          "也對，我明年可以再試一次，對吧？",
          "謝謝你聽我說，我現在覺得比較有希望了。",
        ],
        hints: ["先表示你理解他的失落", "提醒他還有其他選擇", "可以一起想下一步", "讓他知道你會支持他"],
        analysis: {
          summary: "示範模式無法分析你剛剛說的話。以下是這個情境裡常見的好說法，可以先跟讀練習。",
          better: [
            { you: "", en: "I'm sorry. I know how much you wanted it.", zh: "我很遺憾，我知道你有多想要。", why: "先接住對方的失落", giving: "" },
            { you: "", en: "This isn't the end. Let's look at other choices together.", zh: "這不是結束，我們一起看看其他選擇。", why: "指出下一步，陪他一起想", giving: "給人希望" },
          ],
        },
      },
    },
    {
      id: "good-news", giving: "給人歡喜",
      zh: "分享朋友的好消息", en: "Celebrating good news",
      who: "同事 Mia 考了三次，終於通過駕照考試，很興奮地跟你分享。",
      task: "用英文分享 Mia 的喜悅，讓她更開心。",
      opener: "Guess what? I finally passed my driving test! Third time lucky!",
      openerZh: "你猜怎樣？我終於考過駕照了！第三次就成功！",
      demo: {
        replies: [
          "Thank you! I was so nervous this time.",
          "Yes! I practiced every weekend.",
          "Maybe I'll drive to the beach. Do you want to come?",
          "Yay! It's a plan. Thanks for being so happy for me!",
        ],
        repliesZh: [
          "謝謝！這次我好緊張。",
          "對啊！我每個週末都在練習。",
          "也許我會開車去海邊，你要一起來嗎？",
          "耶！就這麼說定了。謝謝你這麼替我開心！",
        ],
        hints: ["先恭喜她", "問問她當時的感受或過程", "肯定她不放棄的努力", "可以約她一起慶祝"],
        analysis: {
          summary: "示範模式無法分析你剛剛說的話。以下是這個情境裡常見的好說法，可以先跟讀練習。",
          better: [
            { you: "", en: "Congratulations! I knew you could do it!", zh: "恭喜！我就知道你做得到！", why: "真心為她高興", giving: "給人歡喜" },
            { you: "", en: "You never gave up. I'm so proud of you.", zh: "你從來沒放棄，我真為你驕傲。", why: "肯定她的堅持", giving: "給人信心" },
          ],
        },
      },
    },
  ],
});

/* ---------- Think Well 換位思考、Global Share 文化大使 ----------
 * kind：goodtalk／thinkwell／ambassador（決定在選單的哪一區）
 * maxTurns 必須和後端一致；intro：開始前的中英對照介紹卡（自行撰寫）
 */
App.registerContent("goodtalk", {
  scenarios: [
    {
      id: "teammate-mistake", kind: "thinkwell", giving: "存好心", maxTurns: 4,
      zh: "隊友失誤輸了比賽", en: "A teammate's mistake",
      who: "隊友 Ken 最後一球沒投進，你們輸了比賽。教練 Lee 看到你很不開心。",
      task: "跟教練聊這場比賽：不怪罪 Ken，想想他的處境和大家能怎麼改進。",
      opener: "Hey, you look upset. What happened in the game today?",
      openerZh: "嘿，你看起來不太開心。今天比賽發生什麼事了？",
      demo: {
        replies: [
          "I see. How do you think Ken feels right now?",
          "That's a kind way to see it. What could the team do next time?",
          "Great idea. Maybe you can tell Ken that too.",
          "I'm proud of you. That's what a good teammate does.",
        ],
        repliesZh: ["我懂了。你覺得 Ken 現在感覺怎麼樣？", "這樣想很體貼。下次球隊可以怎麼做？", "好主意。也許你也可以這樣告訴 Ken。", "我以你為榮，這就是好隊友會做的事。"],
        hints: ["先說發生了什麼事，不急著怪誰", "想想 Ken 現在的心情", "想一個大家可以一起改進的方法", "說說你想對 Ken 說什麼"],
        analysis: {
          summary: "示範模式無法分析你剛剛說的話。以下是這個情境裡常見的好說法，可以先跟讀練習。",
          better: [
            { you: "", en: "We lost the game, but everyone tried hard.", zh: "我們輸了比賽，但大家都很努力。", why: "描述事情，不怪罪某一個人", giving: "" },
            { you: "", en: "Ken must feel terrible. Let's practice together next week.", zh: "Ken 一定很難過，下週我們一起練習吧。", why: "理解對方，並提出一起改進", giving: "給人希望" },
          ],
        },
      },
    },
    {
      id: "no-reply", kind: "thinkwell", giving: "存好心", maxTurns: 4,
      zh: "朋友兩天沒回訊息", en: "A friend didn't reply",
      who: "好朋友 Amy 已經兩天沒回你的訊息。朋友 Lin 注意到你一直看手機。",
      task: "跟 Lin 聊聊：先別生氣，想想 Amy 可能有什麼別的原因。",
      opener: "You keep checking your phone. Is something wrong?",
      openerZh: "你一直在看手機，怎麼了嗎？",
      demo: {
        replies: [
          "Two days? Hmm, do you know if she's okay?",
          "Maybe. What else could be the reason?",
          "That's true. What could you send her?",
          "That sounds kind. I'm sure she'll appreciate it.",
        ],
        repliesZh: ["兩天？嗯，你知道她還好嗎？", "也許吧。還可能有什麼原因？", "說得也是。你可以傳什麼給她？", "聽起來很貼心，我相信她會很感謝。"],
        hints: ["說說發生了什麼事", "想想 Amy 可能有什麼別的原因", "例如她可能很忙或手機壞了", "想一句關心她的訊息"],
        analysis: {
          summary: "示範模式無法分析你剛剛說的話。以下是這個情境裡常見的好說法，可以先跟讀練習。",
          better: [
            { you: "", en: "Maybe she's just busy. I'll wait a little.", zh: "也許她只是很忙，我再等等。", why: "先往好的方向想", giving: "" },
            { you: "", en: "Hi Amy, I hope you're okay. Talk when you're free!", zh: "嗨 Amy，希望你一切都好，有空再聊！", why: "用關心代替抱怨", giving: "給人歡喜" },
          ],
        },
      },
    },
    {
      id: "ambassador-three-acts", kind: "ambassador", giving: "說好話", maxTurns: 5,
      zh: "向外國旅客介紹三好四給", en: "Introduce the Three Acts of Goodness",
      who: "澳洲旅客 Emma 第一次來台灣，看到「Three Acts of Goodness」的標語，很好奇是什麼意思。",
      task: "用簡單的英文向 Emma 介紹三好四給，並舉生活中的例子。",
      opener: "Hi! I saw a sign that says 'Three Acts of Goodness'. What does that mean?",
      openerZh: "嗨！我看到一個寫著「Three Acts of Goodness」的標語，那是什麼意思？",
      intro: [
        { en: "The Three Acts of Goodness are: do good deeds, speak good words, and think good thoughts.", zh: "「三好」是：做好事、說好話、存好心。" },
        { en: "They are about what we do, what we say, and what we think.", zh: "它們分別關於我們的行為、言語和心念。" },
        { en: "The Four Givings are: give others confidence, joy, hope, and convenience.", zh: "「四給」是：給人信心、給人歡喜、給人希望、給人方便。" },
        { en: "Venerable Master Hsing Yun promoted the Three Acts of Goodness movement in Taiwan in 1998. He was the founding master of Fo Guang Shan.", zh: "星雲大師於 1998 年在台灣提倡三好運動。他是佛光山開山宗長。" },
        { en: "Their spirit is rooted in Humanistic Buddhism, and people of different backgrounds can practice it in daily life.", zh: "它們的精神源自人間佛教，不同背景的人都能在日常生活中實踐。" },
        { en: "For example: help someone carry heavy bags, say thank you, and try to understand others before judging.", zh: "例如：幫人提重物、說聲謝謝、先試著理解別人再下判斷。" },
      ],
      demo: {
        replies: [
          "Oh, that's interesting! Why is thinking good thoughts important?",
          "I like that. Can people from different backgrounds practice it?",
          "Cool! How can I practice it when I travel here?",
          "Nice! I also heard about the Four Givings. What are they?",
          "Thank you! I learned something special in Taiwan today.",
        ],
        repliesZh: ["喔，好有趣！為什麼存好心很重要？", "我喜歡這個想法。不同背景的人也能實踐嗎？", "太好了！我在這裡旅行時可以怎麼實踐？", "不錯！我也聽說過四給，那是什麼？", "謝謝你！我今天在台灣學到很特別的東西。"],
        hints: ["先說出三好是哪三個", "可以說好的想法會帶來好的話和行為", "這些是每個人都能做的日常小事", "舉一個旅行時能做的例子", "說出四給是哪四個"],
        analysis: {
          summary: "示範模式無法分析你剛剛說的話。以下是介紹三好四給時常用的好說法，可以先跟讀練習。",
          better: [
            { you: "", en: "They are: do good deeds, speak good words, and think good thoughts.", zh: "它們是：做好事、說好話、存好心。", why: "先清楚說出三個重點", giving: "給人方便" },
            { you: "", en: "Anyone can practice them, like saying thank you to a bus driver.", zh: "每個人都能實踐，例如向公車司機說謝謝。", why: "用生活例子讓外國人容易懂", giving: "給人歡喜" },
          ],
        },
      },
    },
  ],
});
