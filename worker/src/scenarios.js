// 對話情境：角色設定只存在後端，前端只送 id。
// kind：goodtalk＝四給情境（之後 thinkwell、ambassador 也放這裡，共用同一個對話引擎）
// maxTurns：學習者最多說幾輪（後端強制結束）

export const SCENARIOS = {
  "exam-fail": {
    kind: "goodtalk",
    giving: "給人信心",
    title: "Comforting a friend who failed an exam",
    role: "Jamie, the learner's classmate. Jamie just failed a math test for the second time, feels stupid and wants to give up. Jamie is sad but not angry.",
    opener: "I studied so hard, but I failed again. Maybe I'm just not good enough.",
    goal: "Help Jamie feel confident again.",
    maxTurns: 4,
  },
  "lost-tourist": {
    kind: "goodtalk",
    giving: "給人方便",
    title: "Helping a lost tourist",
    role: "Alex, a friendly tourist from Canada visiting Taiwan for the first time. Alex is near a train station in a small town, looking for the night market, and does not speak Chinese.",
    opener: "Excuse me, sorry to bother you. Do you know how to get to the night market?",
    goal: "Help Alex find the way easily.",
    maxTurns: 4,
  },
  "future-worry": {
    kind: "goodtalk",
    giving: "給人希望",
    title: "Encouraging a friend worried about the future",
    role: "Sam, the learner's friend. Sam did not get into the university program Sam wanted and is worried about the future.",
    opener: "I didn't get into the program I wanted. I don't know what to do now.",
    goal: "Help Sam see a way forward.",
    maxTurns: 4,
  },
  "good-news": {
    kind: "goodtalk",
    giving: "給人歡喜",
    title: "Celebrating a friend's good news",
    role: "Mia, the learner's coworker. Mia just passed her driving test after failing twice and is very excited to share the news.",
    opener: "Guess what? I finally passed my driving test! Third time lucky!",
    goal: "Share Mia's joy and make her day even happier.",
    maxTurns: 4,
  },
};
