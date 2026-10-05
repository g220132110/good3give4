// Good Talk 瀏覽器實測：先 FAKE_AI=1 node dev/server.mjs，再 node dev/e2e-goodtalk.mjs
// 第一段走 AI 路徑（假 AI），第二段擋掉 /api/chat 測示範模式。
import { createRequire } from "node:module";
const require = createRequire(import.meta.url);
const { chromium } = require(process.env.PW_PATH || "playwright");
const OUT = process.env.OUT || ".";
const browser = await chromium.launch();
const errors = [];

async function newPage() {
  const page = await browser.newPage({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2 });
  await page.route(/fonts\.(googleapis|gstatic)\.com/, (r) => r.abort());
  page.on("pageerror", (e) => errors.push(e.message));
  page.on("console", (m) => m.type() === "error" && !/ERR_FAILED|503/.test(m.text()) && errors.push(m.text()));
  return page;
}
async function say(page, text) {
  const show = page.locator("#gtCShowType");
  if (await show.isVisible()) await show.click();
  await page.fill("#gtCIn", text);
  await page.click("#gtCSend");
  await page.waitForFunction(() => !document.querySelector(".gt-typing"));
}

// ---------- AI 路徑 ----------
let page = await newPage();
await page.goto("http://localhost:8787/#/goodtalk");
await page.waitForSelector(".gt-scene");
const scenes = await page.locator(".gt-scene").count();
await page.screenshot({ path: `${OUT}/gt-1-list.png`, fullPage: true });
await page.click('[data-sid="exam-fail"]');
await page.waitForSelector("#gtLog");
await say(page, "Don't give up. You can do it.");
// 中文對照：初級預設顯示，按「中文」隱藏
const zhShown = await page.locator(".gt-zh").first().isVisible();
const zhText = await page.locator(".gt-ai .gt-zh").nth(1).textContent();
await page.click('[data-act="zh"]');
const zhHidden = !(await page.locator(".gt-zh").first().isVisible());
await page.click('[data-act="zh"]');
await say(page, "Let's study with together this weekend.");
await page.click('#gtInput [data-act="hint"]');
const hint = await page.textContent("#gtHint");
await page.screenshot({ path: `${OUT}/gt-2-chat.png`, fullPage: true });
const bubbles = await page.locator(".gt-msg").count();
await page.click('#gtInput [data-act="finish"]');
await page.waitForSelector("#gtResult:not([hidden]) .sb-good");
const gave = await page.$$eval("#gtResult .gv-badge", (b) => b.map((x) => x.firstChild.textContent));
const aiNotice = await page.locator("#gtResult .sb-notice").count();
await page.screenshot({ path: `${OUT}/gt-3-result.png`, fullPage: true });
const show = page.locator("#gtRShowType"); if (await show.isVisible()) await show.click();
await page.fill("#gtRIn", "Don't give up. You've improved a lot.");
await page.click("#gtRSend");
await page.waitForSelector("#gtCompare:not([hidden]) h2");
const compare = await page.textContent("#gtCompare h2");
await page.screenshot({ path: `${OUT}/gt-4-compare.png`, fullPage: true });
await page.click('#gtCompare [data-act="list"]');
const doneBadge = await page.textContent('[data-sid="exam-fail"] .badge');
await page.close();

// ---------- 示範模式（AI 連不到） ----------
page = await newPage();
await page.route("**/api/chat", (r) => r.fulfill({ status: 503, contentType: "application/json", body: '{"ok":false,"error":"busy","message":"busy"}' }));
await page.route("**/api/analyze", (r) => r.fulfill({ status: 503, contentType: "application/json", body: '{"ok":false,"error":"busy","message":"busy"}' }));
await page.goto("http://localhost:8787/#/goodtalk");
await page.waitForSelector(".gt-scene");
await page.click('[data-sid="lost-tourist"]');
await page.waitForSelector("#gtLog");
await say(page, "Yes, go straight.").catch(() => {});
// 第一句就太忙：出現「再送一次／用示範內容繼續」
await page.waitForSelector('#gtStall [data-act="demo"]');
const stallShown = await page.locator('#gtStall [data-act="resend"]').isVisible();
await page.click('#gtStall [data-act="demo"]');
await page.waitForFunction(() => !document.querySelector(".gt-typing"));
const demoNotice = await page.locator("#gtChat .sb-notice").count();
const demoReply = await page.locator(".gt-ai .gt-text").nth(1).textContent();
for (const t of ["About ten minutes.", "Try the oyster omelet.", "Have fun!"]) await say(page, t);
const endShown = await page.locator("#gtEnd").isVisible();
await page.click('#gtEnd [data-act="finish"]');
await page.waitForSelector("#gtResult:not([hidden])");
const demoSummary = await page.textContent("#gtResult .panel p");
await page.screenshot({ path: `${OUT}/gt-5-demo-result.png`, fullPage: true });

// 其他分頁正常
await page.click('.tab[data-id="saybetter"]');
const sbOK = await page.waitForSelector("#sbCtx .chip", { timeout: 5000 }).then(() => true, () => false);

console.log(JSON.stringify({ zhShown, zhText, zhHidden, stallShown, scenes, hint, bubbles, gave, aiNotice, compare, doneBadge, demoNotice, demoReply, endShown, demoSummary: demoSummary.slice(0, 20), sbOK, errors }, null, 2));
await browser.close();
