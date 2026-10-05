# Good English, Good Life（參賽版）

以 English Pass 為底層，加上 v0.5 規格：

- **第一階段**：後端代理、App.ai、App.virtue、Say It Better（說好話 AI 語氣教練＋Try Again）
- **第二階段**：對話引擎（/api/chat、/api/analyze）、Good Talk 四給情境對話 4 個、App.ask 共用輸入元件、中文對照、這句怎麼說更好
- **第三階段**：Think Well 換位思考 2 個、Global Share 文化大使 1 套（中英介紹卡、事實限制），與 Good Talk 共用對話引擎
- **第四階段**：Good Mission 每日英文微善任務 10 個（Learn → Practice → Act → Reflect、連續天數與紀錄）

## 本機試用

```bash
node dev/server.mjs                              # 示範模式，不需金鑰
ANTHROPIC_API_KEY=sk-... node dev/server.mjs     # 真的呼叫 Claude
AI_PROVIDER=gemini GEMINI_API_KEY=... node dev/server.mjs
# 開啟 http://localhost:8787/
node --test worker/test/*.mjs                    # 後端測試
FAKE_AI=1 node dev/server.mjs                    # 測試用假 AI（不連網，測 AI 路徑）
node dev/e2e.mjs                                 # 說好話瀏覽器實測（需要 playwright）
node dev/e2e-goodtalk.mjs                        # Good Talk 瀏覽器實測（AI 路徑＋示範模式）
node dev/e2e-phase3.mjs                          # Think Well、Global Share 瀏覽器實測
node dev/e2e-mission.mjs                         # 微善任務瀏覽器實測
```

麥克風需要 https 或 localhost。直接雙擊 index.html 也能開，但只會用示範內容。

## 這次新增或修改的檔案

| 檔案 | 說明 |
|---|---|
| `worker/` | 後端代理（Cloudflare Workers）：/api/rewrite、Claude／Gemini 轉接、JSON 驗證、示範模式、備用模型、來源限制、用量上限、18 項測試 |
| `js/core/ai.js` | 新增：`App.ai.call(任務, 輸入)`，負責逾時、降級、裝置用量 |
| `js/core/virtue.js` | 新增：`App.virtue.badge()`、`log()`、`stats()`，用於三好四給徽章與 Passport |
| `js/core/ask.js` | 新增：`App.ask` 共用的麥克風＋打字、跟讀、示範提示與「再送一次」 |
| `js/modules/goodtalk.js` | 新增：Good Talk 四給情境對話（對話、中文對照開關、提示、分析、Try Again、示範模式） |
| `data/goodtalk/scenarios.js` | 新增：7 個情境（四給 4、換位思考 2、文化大使 1）的畫面文字、中文對照、介紹卡與示範內容（角色設定在 `worker/src/scenarios.js`） |
| `js/modules/mission.js` | 新增：Good Mission 每日微善任務（今日任務、跟讀、連到對話情境、反思、AI 看英文、紀錄與連續天數） |
| `data/mission/tasks.js` | 新增：10 個微善任務 |
| `js/modules/soon.js` | 修改：測驗不再佔底部分頁（空間給「微善」） |
| `js/modules/saybetter.js` | 新增：Say It Better 模組。語音與跟讀評分直接用 `App.speech.listen/parse/grade`，和口說模組相同 |
| `data/saybetter/contexts.js` | 新增：6 個情境、範例句、離線示範結果，以及 12 個重點字的字典條目（字典已有的字不覆蓋） |
| `css/app.css` | 末端新增「三好四給徽章」「Say It Better」「Good Talk」區塊，全部用既有的 tokens |
| `index.html` | 加入上述檔案，設定 `EP_AI_ENDPOINT`，標題改為 Good English, Good Life |
| `dev/` | 本機伺服器與瀏覽器實測，不需部署 |

原有的口說、閱讀、生字本都沒有改動；soon.js 只拿掉測驗的分頁。

## 上傳到 GitHub Pages

只需要 `index.html`、`css/`、`js/`、`data/`。整份上傳也可以，`worker/` 與 `dev/` 不影響網站（裡面沒有金鑰）。

## 部署

1. **前端**：照舊放在 GitHub Pages 等 https 空間。
2. **後端**：
   ```bash
   cd worker
   npx wrangler login
   npx wrangler secret put ANTHROPIC_API_KEY      # 或 GEMINI_API_KEY，並把 AI_PROVIDER 改成 gemini
   npx wrangler kv namespace create QUOTA         # 把 id 填進 wrangler.toml
   # wrangler.toml：ALLOWED_ORIGINS 填前端網址，例如 https://你的帳號.github.io
   npx wrangler deploy
   ```
3. **連接前後端**：在 `index.html` 把 `EP_AI_ENDPOINT` 的空字串改成 worker 網址。

## 設計重點

- **金鑰與提示詞只在後端**：前端只送情境 id 和使用者文字。
- **四給不打分數**：只列出這次回應展現的元素，並附上證據。名稱不在固定清單裡的，後端直接丟掉。
- **AI 不會讓畫面壞掉**：AI 回傳格式錯誤時重試一次，再失敗就改用示範結果；連不到後端時，前端改用內容包。兩種情況都會標示「示範模式」。
- **隱私**：只送文字，不送錄音；後端不儲存內容，只記次數。
- **注意**：`App.registerModule` 排序時，`order: 0` 會被當成 99，所以模組要用 0.5。
