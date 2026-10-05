// 瀏覽器實測：先 node dev/server.mjs，再 node dev/e2e.mjs
// 截圖存到 OUT（預設目前資料夾）。
import { createRequire } from "node:module";
const require = createRequire(import.meta.url);
const { chromium } = require(process.env.PW_PATH || "playwright");

const OUT = process.env.OUT || ".";
const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2 });
await page.route(/fonts\.(googleapis|gstatic)\.com/, (r) => r.abort()); // 測試環境擋外部字型
const errors = [];
page.on("pageerror", (e) => errors.push(e.message));
page.on("console", (m) => m.type() === "error" && !/ERR_FAILED/.test(m.text()) && errors.push(m.text()));

await page.goto("http://localhost:8787/#/saybetter");
await page.waitForSelector("#sbCtx .chip");
const tabs = await page.$$eval(".tab span", (s) => s.map((x) => x.textContent));
await page.screenshot({ path: `${OUT}/1-input.png`, fullPage: true });

// 選「點餐購物」，點範例句（會打開打字列），送出
await page.click('#sbCtx .chip[data-id="restaurant"]');
await page.click('[data-ex="Give me the menu."]');
await page.click("#sbASend");
await page.waitForSelector(".sb-tone");
const tone = await page.textContent(".sb-tone .sb-tag");
const better = await page.locator(".sb-better").count();
const keyWords = await page.$$eval(".sb-better .tok.key", (b) => b.map((x) => x.textContent));
await page.screenshot({ path: `${OUT}/2-result.png`, fullPage: true });

// 點重點字打開單字卡
await page.click(".sb-better .tok.key");
await page.waitForSelector("#wordSheet:not([hidden])");
const sheetWord = await page.textContent("#wsWord");
const sheetZh = await page.textContent("#wsZh");
await page.click("#wsClose");

// Try Again（改用打字）
const showType = page.locator("#sbRShowType");
if (await showType.isVisible()) await showType.click();
await page.fill("#sbRIn", "Excuse me, could I have the menu, please?");
await page.click("#sbRSend");
await page.waitForSelector("#sbCompare:not([hidden]) h2");
const heading = await page.textContent("#sbCompare h2");
await page.screenshot({ path: `${OUT}/3-compare.png`, fullPage: true });

// 回輸入畫面：Passport 次數；空白送出的錯誤訊息
await page.click('#sbCompare [data-act="restart"]');
const passport = await page.textContent("#sbPassport");
await page.click('[data-ex="I want a coffee."]');
await page.fill("#sbAIn", "");
await page.click("#sbASend");
const err = await page.textContent("#sbAErr");

// 其他分頁還正常
await page.goto("http://localhost:8787/#/speaking");
await page.waitForTimeout(300);
const speakingOK = await page.locator("#spSetup, #spCourse").first().isVisible();

console.log(JSON.stringify({ tabs, tone, better, keyWords, sheetWord, sheetZh, heading, passport, err, speakingOK, errors }, null, 2));
await browser.close();
