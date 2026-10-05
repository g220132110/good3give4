# Good English, Good Life（參賽版）

以 English Pass 為底層，加上 v0.5 規格：

- **第一階段**：後端代理、App.ai、App.virtue、Say It Better（說好話 AI 語氣教練＋Try Again）
- **第二階段**：對話引擎（/api/chat、/api/analyze）、Good Talk 四給情境對話 4 個、App.ask 共用輸入元件、中文對照、這句怎麼說更好
- **第三階段**：Think Well 換位思考 2 個、Global Share 文化大使 1 套（中英介紹卡、事實限制），與 Good Talk 共用對話引擎
- **第四階段**：Good Mission 每日英文微善任務 10 個（Learn → Practice → Act → Reflect、連續天數與紀錄）
- **插圖與看圖說好話**：App.art 程式繪製 SVG 插圖 29 張（對話情境、看圖、微善任務、三格故事）；看圖說好話 12 張單圖（A2／B1／B2，B2 為推想圖）＋ 4 組三格故事（/api/describe）
- **第五階段（整合）**：四大面向首頁（Speak Well／Think Well／Do Well／Global Share）、Goodness Passport 善行護照、訪客模式（首頁 EN 切換＋一分鐘三好四給）、PWA（可加到主畫面、離線開啟）、完成時的蓋章小動畫；底部分頁由 7 個減為 5 個（首頁、說好話、對話、看圖、護照），微善、口說、閱讀、生字本從首頁進入
- **插圖 2.0**：人物接地陰影、身體明暗、耳朵與髮光、眼神方向（gaze）、上半身前傾（lean）、場景光線與暗角、階梯邊緣光；影片重點場景（樓梯三格、考試失利、問路、文化大使）加主角柔光（P.glow）引導視線
- **B2 三格故事**：「打翻飲料 → 對方皺眉、道歉 → 一起清理、和好」（story-spill），練習理解雙方、原諒與道歉；插圖新增皺眉表情（upset）
- **Goodness AI 測試集**：`qa/`（59 題，14 類：很直接、文法錯、有禮貌、有鼓勵、有同理、有幫助、容易誤判、中英混雜、惡意輸入、看圖、三格故事、程度穩定、原意保留、文化大使），開 `/qa/` 就能對正式後端跑，自動檢查並可下載結果
- **看圖走向實踐**：結果頁「如果真的遇到，你會怎麼做？」一句反思，只存在裝置、不呼叫 AI
- **看圖教學深度**：回饋分三層（你看到的／你理解到的／你還可以注意到）、故事結構（順序、時態、連接詞）、示範說法預設收起、程度與模式篩選

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
node dev/e2e-picturetalk.mjs                     # 看圖說好話瀏覽器實測
node dev/e2e-home.mjs                            # 首頁、Passport、PWA 瀏覽器實測
# 插圖預覽：http://localhost:8787/dev/art.html
```

麥克風需要 https 或 localhost。直接雙擊 index.html 也能開，但只會用示範內容。

## 這次新增或修改的檔案

| 檔案 | 說明 |
|---|---|
| `worker/` | 後端代理（Cloudflare Workers）：/api/rewrite、Claude／Gemini 轉接、JSON 驗證、示範模式、備用模型、來源限制、用量上限、20 項測試 |
| `js/core/ai.js` | 新增：`App.ai.call(任務, 輸入)`，負責逾時、降級、裝置用量 |
| `js/core/virtue.js` | 新增：`App.virtue.badge()`、`log()`、`stats()`，用於三好四給徽章與 Passport |
| `js/core/ask.js` | 新增：`App.ask` 共用的麥克風＋打字、跟讀、示範提示與「再送一次」 |
| `js/modules/goodtalk.js` | 新增：Good Talk 四給情境對話（對話、中文對照開關、提示、分析、Try Again、示範模式） |
| `data/goodtalk/scenarios.js` | 新增：7 個情境（四給 4、換位思考 2、文化大使 1）的畫面文字、中文對照、介紹卡與示範內容（角色設定在 `worker/src/scenarios.js`） |
| `js/core/art.js` | 新增：`App.art.scene(id)` 程式繪製的 SVG 插圖；之後可在 `App.art.images` 換成圖片檔 |
| `js/modules/picturetalk.js` | 新增：看圖說好話（模式與程度篩選、單圖／三格故事、提示字、三層回饋、故事結構、示範收合、再說一次） |
| `data/picturetalk/pictures.js` | 新增：12 張圖＋3 組故事的程度、提示字與示範說法（圖片說明在 `worker/src/pictures.js`） |
| `js/modules/home.js` | 新增：首頁四大面向、今日微善、Passport 摘要、英文基本功、訪客模式（EN） |
| `js/modules/passport.js` | 新增：Goodness Passport（三好四給印章、練習足跡、最近的微善） |
| `manifest.webmanifest`、`sw.js`、`icons/` | 新增：PWA。sw.js 有網路就拿最新版，離線用存的那份；AI 不經過快取 |
| `js/modules/mission.js` | 新增：Good Mission 每日微善任務（今日任務、跟讀、連到對話情境、反思、AI 看英文、紀錄與連續天數） |
| `data/mission/tasks.js` | 新增：10 個微善任務 |
| `js/modules/soon.js` | 修改：測驗不再佔底部分頁（空間給「微善」） |
| `js/modules/saybetter.js` | 新增：Say It Better 模組。語音與跟讀評分直接用 `App.speech.listen/parse/grade`，和口說模組相同 |
| `data/saybetter/contexts.js` | 新增：6 個情境、範例句、離線示範結果，以及 12 個重點字的字典條目（字典已有的字不覆蓋） |
| `css/app.css` | 末端新增「三好四給徽章」「Say It Better」「Good Talk」區塊，全部用既有的 tokens |
| `index.html` | 加入上述檔案，設定 `EP_AI_ENDPOINT`，標題改為 Good English, Good Life |
| `dev/` | 本機伺服器與瀏覽器實測，不需部署 |

原有的口說、閱讀、生字本內容沒有改動，只是改從首頁進入（`nav: "home"`）；soon.js 只拿掉測驗的分頁。

## Goodness AI 測試集

上傳 `qa/` 後開 `https://你的網址/qa/`。每次改提示詞或換模型後跑一次；✗ 失敗要處理，△ 注意人工看一下。免費額度有限時可以分組跑。

## 上傳到 GitHub Pages

需要 `index.html`、`manifest.webmanifest`、`sw.js`、`css/`、`js/`、`data/`、`icons/`。整份上傳也可以，`worker/` 與 `dev/` 不影響網站（裡面沒有金鑰）。

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

## 換成 AI 產生的圖片

在 `index.html` 載入 art.js 之後加一行，例如：

```html
<script>App.art.images = { "pt-stairs": "images/pt-stairs.webp", "lost-tourist": "images/lost-tourist.webp" };</script>
```

有登記的場景會改顯示圖片，沒登記的仍用 SVG。場景 id 可在 `dev/art.html` 查看。
