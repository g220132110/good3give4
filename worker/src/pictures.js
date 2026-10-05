// 看圖說好話：每張圖的文字說明（只存在後端，前端只送 id）。
// AI 不需要真的「看」圖，而是拿學習者的描述和這段說明比對，穩定又省額度。
// level：圖的建議程度（A2／B1／B2）；B2 的圖要學習者推想原因、不急著評斷（think）。
// panels：有這個欄位就是三格故事（Story Mode），desc 是整個故事的重點。

export const PICTURES = {
  "pt-stairs": {
    level: "A2",
    focus: "做好事、給人方便",
    desc: "An elderly woman with grey hair is slowly climbing stairs. She is carrying two heavy shopping bags and looks tired; she is sweating. A young person is standing at the bottom of the stairs nearby.",
    help: "Offer to carry her bags or help her up the stairs.",
  },
  "pt-lost-child": {
    level: "B1",
    focus: "做好事、給人希望",
    desc: "A busy market with food stalls. A small child is standing alone in the middle and crying, probably lost. Adults are walking past.",
    help: "Stay with the child, comfort them, and help find their parents or ask a market worker or police officer.",
  },
  "pt-dropped-books": {
    level: "A2",
    focus: "做好事、給人方便",
    desc: "A school hallway. A student is kneeling on the floor because their books fell and are scattered everywhere. The student looks worried. Another student is standing nearby.",
    help: "Help pick up the books.",
  },
  "pt-rain": {
    level: "A2",
    focus: "做好事、給人方便",
    desc: "It is raining hard on a city street. One person has no umbrella and is holding a bag over their head; they look worried and wet. Another person nearby has a red umbrella.",
    help: "Share the umbrella or walk together to a dry place.",
  },
  "pt-alone-lunch": {
    level: "B1",
    focus: "存好心、給人歡喜",
    desc: "A school cafeteria at lunchtime. A new student is sitting alone at a table, eating and looking sad. At another table, two students are eating together happily.",
    help: "Say hello and invite the new student to sit and eat together.",
  },
  "pt-ticket-machine": {
    level: "A2",
    focus: "做好事、給人方便",
    desc: "A train station. A foreign traveler with a backpack is standing in front of a ticket machine, looking confused and not sure how to use it. Another person is standing nearby.",
    help: "Offer to help and show how to buy a ticket.",
  },
  "pt-performance": {
    level: "A2",
    focus: "說好話、給人信心",
    desc: "A school stage. A student has just finished a performance and is raising both arms, smiling. Two classmates in front of the stage are smiling and clapping.",
    help: "Clap and give specific praise, like \"You were amazing! I loved your song.\"",
  },
  "pt-nervous-speech": {
    level: "B1",
    focus: "說好話、給人信心",
    desc: "A classroom. A student is standing in front of the blackboard holding a paper, about to give a speech. The student looks nervous and is sweating. Two classmates are sitting and watching.",
    help: "Smile, listen, and encourage the speaker, like \"Take your time. You can do it.\"",
  },
  "pt-apology": {
    level: "B1",
    focus: "說好話、存好心",
    desc: "A cafeteria table. A student has accidentally knocked over a cup and spilled a drink on the table. The student looks worried and says \"I'm so sorry!\" Another student is standing at the other end of the table.",
    help: "Accept the apology kindly (\"It's okay. Accidents happen.\") and help clean up together.",
  },
  "pt-crumpled-art": {
    level: "B1",
    focus: "給人信心、給人希望",
    desc: "A living room. A girl is sitting next to a sofa looking upset. Next to her is an easel with an empty canvas, and crumpled papers are on the floor. Her drawings did not go well.",
    help: "Encourage her: notice her effort, say mistakes are part of learning, and invite her to try again.",
  },
  "pt-cut-line": {
    level: "B2",
    focus: "存好心、說好話",
    desc: "A ticket counter. Three people are waiting in a line. A man looking at his phone walks straight to the front of the line. The first person in line looks confused.",
    help: "Do not assume he is rude; maybe he did not see the line. Politely say, \"Excuse me, I think the line starts back there.\"",
    think: "Ask the learner to think about what might be happening and what could be said politely, without blaming.",
  },
  "pt-priority-seat": {
    level: "B2",
    focus: "存好心、給人方便",
    desc: "On a train. A young man is sitting in a priority seat with his hand on his chin and a tired, unhappy face. An elderly man is standing nearby, holding the pole. Someone is wondering what to do.",
    help: "Do not judge quickly; the young man may be sick or have a hidden need. Offer your own seat to the elderly man, or ask politely and kindly.",
    think: "Ask the learner to think about possible reasons (people can have needs we cannot see) and a polite, respectful way to help.",
  },
  "story-stairs": {
    level: "A2",
    focus: "做好事、給人方便",
    desc: "A short story about helping an elderly woman on the stairs.",
    panels: [
      "An elderly woman is climbing the stairs slowly with two heavy bags. She looks tired and is sweating. A student is standing at the bottom.",
      "The student walks up to her and asks, \"Can I help you?\"",
      "The student carries the bags up the stairs. The woman smiles, waves, and says, \"Thank you, dear!\"",
    ],
    help: "Notice someone who needs help, offer politely, and help.",
  },
  "story-lunch": {
    level: "B1",
    focus: "存好心、給人歡喜",
    desc: "A short story about including a new student at lunch.",
    panels: [
      "A new student is eating lunch alone in the cafeteria and looks sad. Other students are eating together.",
      "A girl walks over with her lunch tray, waves, and asks, \"Hi! Can I sit here?\"",
      "The two students are eating together and smiling. They look like new friends.",
    ],
    help: "Notice someone who is alone and invite them in.",
  },
  "story-rain": {
    level: "A2",
    focus: "做好事、給人方便",
    desc: "A short story about sharing an umbrella in the rain.",
    panels: [
      "It is raining hard. A man has no umbrella and holds a bag over his head. A woman with a red umbrella is nearby.",
      "The woman walks over, holds out her umbrella, and asks, \"Share my umbrella?\"",
      "They walk together under the umbrella and both smile.",
    ],
    help: "Share what you have so someone else stays dry.",
  },
  "story-spill": {
    level: "B2",
    focus: "存好心、說好話",
    desc: "A short story about an accident at lunch, an apology, and making up.",
    panels: [
      "In the cafeteria, a student accidentally knocks over a cup. The drink spills onto a classmate's notebook. Both are surprised.",
      "The classmate holds up the wet notebook and frowns. The student who spilled the drink quickly says, \"I'm so sorry!\"",
      "They clean the table together with napkins. The classmate smiles and says, \"It's okay. Accidents happen.\" They are friends again.",
    ],
    help: "Apologize sincerely and help fix the problem; when someone apologizes, accept it kindly.",
    think: "Ask the learner to tell the story and to think about how BOTH people feel (the one who made the mistake and the one who was upset). Reward understanding both sides and forgiving, kind words.",
  },
};
