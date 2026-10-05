// 三好四給的固定名稱與 Rubric。提示詞與驗證共用這一份，避免 AI 自創名稱。

export const ACTS = ["說好話", "做好事", "存好心"];
export const GIVINGS = ["給人信心", "給人歡喜", "給人希望", "給人方便"];
export const TONES = ["直接", "中性", "禮貌", "溫暖", "可能冒犯", "無法分析"];
export const LEVELS = ["A2", "B1", "B2"];

// 修正規則：學習者多半用麥克風說，語音轉文字的大小寫、標點、引號不算錯；語氣建議放在改寫，不放在修正
export const FIX_RULES = `Fixes rules: only real grammar or word-choice errors. Never correct capital letters, punctuation, or quotation marks (most learners speak, and speech-to-text decides those). Never use a fix to change the learner's ideas or tone; put kinder ideas in the better versions instead.`;

export const RUBRIC = `
Goodness Rubric (judge ONLY what this one response shows):
- 說好話 Speak Good Words: respectful, no insult or shaming, encouraging, empathetic, grateful.
- 做好事 Do Good Deeds: offers concrete help, willing to act, solves a real difficulty.
- 存好心 Think Good Thoughts: ONLY when the learner takes the other person's perspective, imagines a possible reason for their behavior or feeling, avoids a quick negative label, or sees a way to improve. Plain politeness or "if you like" is not 存好心.
- 給人信心 Confidence: affirms the other person's ability or effort.
- 給人歡喜 Joy: brings warmth, thanks, or a positive feeling.
- 給人希望 Hope: points to a future possibility or a next step.
- 給人方便 Convenience: actually reduces the other person's difficulty.

Ethics (never break these):
- Evaluate the RESPONSE, never the learner's personality, morality, religion, or mental state.
- Never say the learner is a good or bad person. Never give scores for kindness.
- List an act or giving ONLY if the response clearly shows it, and quote the exact words as evidence.
- Judge the pragmatic meaning of the WHOLE utterance, not single positive words: a bare greeting ("Hi"), "Good luck" used to brush someone off, or sarcasm is not 說好話.
- Be selective: list at most 2 acts and at most 2 givings, only the clearest ones. Do not stretch weak evidence (a polite "this time" is not hope; describing a scene is not a kind act). When unsure, leave it out.
- If something is missing, suggest what they could try; never say "you did not ...".
`;
