// 看圖說好話：每張圖的文字說明（只存在後端，前端只送 id）。
// AI 不需要真的「看」圖，而是拿學習者的描述和這段說明比對，穩定又省額度。

export const PICTURES = {
  "pt-stairs": {
    focus: "做好事、給人方便",
    desc: "An elderly woman with grey hair is slowly climbing stairs. She is carrying two heavy shopping bags and looks tired; she is sweating. A young person is standing at the bottom of the stairs nearby.",
    help: "Offer to carry her bags or help her up the stairs.",
  },
  "pt-lost-child": {
    focus: "做好事、給人希望",
    desc: "A busy market with food stalls. A small child is standing alone in the middle and crying, probably lost. Adults are walking past.",
    help: "Stay with the child, comfort them, and help find their parents or ask a market worker or police officer.",
  },
  "pt-dropped-books": {
    focus: "做好事、給人方便",
    desc: "A school hallway. A student is kneeling on the floor because their books fell and are scattered everywhere. The student looks worried. Another student is standing nearby.",
    help: "Help pick up the books.",
  },
  "pt-rain": {
    focus: "做好事、給人方便",
    desc: "It is raining hard on a city street. One person has no umbrella and is holding a bag over their head; they look worried and wet. Another person nearby has a red umbrella.",
    help: "Share the umbrella or walk together to a dry place.",
  },
  "pt-alone-lunch": {
    focus: "存好心、給人歡喜",
    desc: "A school cafeteria at lunchtime. A new student is sitting alone at a table, eating and looking sad. At another table, two students are eating together happily.",
    help: "Say hello and invite the new student to sit and eat together.",
  },
  "pt-ticket-machine": {
    focus: "做好事、給人方便",
    desc: "A train station. A foreign traveler with a backpack is standing in front of a ticket machine, looking confused and not sure how to use it. Another person is standing nearby.",
    help: "Offer to help and show how to buy a ticket.",
  },
};
