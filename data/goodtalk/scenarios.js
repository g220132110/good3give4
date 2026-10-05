/* Good Talk 內容包：四給情境（畫面顯示用）與示範模式內容。
 * id 與 opener 必須和後端 worker/src/scenarios.js 一致；角色設定只放後端。
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
      demo: {
        replies: [
          "Really? But I always get bad grades in math.",
          "Hmm, maybe you're right. I did better on the last quiz.",
          "That would really help. Can we start this weekend?",
          "Thank you. I feel much better now. You're a good friend.",
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
      demo: {
        replies: [
          "Oh, great! Is it far from here? Can I walk there?",
          "Thank you! Is there anything you recommend to eat there?",
          "That sounds delicious. I'll try it!",
          "You're so kind. Thank you so much for your help!",
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
      demo: {
        replies: [
          "I know, but I really wanted it. Everyone else got in.",
          "Maybe. I never thought about other options.",
          "That's true. I could try again next year, right?",
          "Thanks for listening. I feel a little more hopeful now.",
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
      demo: {
        replies: [
          "Thank you! I was so nervous this time.",
          "Yes! I practiced every weekend.",
          "Maybe I'll drive to the beach. Do you want to come?",
          "Yay! It's a plan. Thanks for being so happy for me!",
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
