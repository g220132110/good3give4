// 看圖說好話實測：先 FAKE_AI=1 node dev/server.mjs，再 node dev/e2e-picturetalk.mjs
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
  const show = page.locator("#ptAShowType");
  if (await show.isVisible()) await show.click();
  await page.fill("#ptAIn", text);
  await page.click("#ptASend");
}

let page = await newPage();
await page.goto("http://localhost:8787/#/picturetalk");
await page.waitForSelector(".pt-card");
const tabs = await page.$$eval(".tab span", (s) => s.map((x) => x.textContent));
const cards = await page.locator(".pt-card .art").count();
await page.screenshot({ path: `${OUT}/pt-1-list.png`, fullPage: true });
await page.click('[data-id="pt-stairs"]');
await page.waitForSelector(".pt-figure .art");
await page.click('[data-act="hint"]');
const words = await page.locator(".pt-words .sb-example").count();
await page.screenshot({ path: `${OUT}/pt-2-picture.png`, fullPage: true });
await say(page, "An old woman carry two bags. I can help her.");
await page.waitForSelector(".pt-li.ok");
const seen = await page.locator(".pt-li.ok").count();
const gave = await page.$$eval(".sb-good .gv-badge", (b) => b.map((x) => x.firstChild.textContent));
const model = await page.locator("text=示範說法").count();
await page.screenshot({ path: `${OUT}/pt-3-result.png`, fullPage: true });
await page.click('[data-act="again"]');
await say(page, "She looks tired. Can I carry your bags?");
await page.waitForSelector(".sb-tone .sb-tag");
const compare = await page.textContent(".sb-tone .sb-tag");
await page.close();

// 示範模式：AI 太忙
page = await newPage();
await page.route("**/api/describe", (r) => r.fulfill({ status: 503, contentType: "application/json", body: '{"ok":false,"error":"busy","message":"busy"}' }));
await page.goto("http://localhost:8787/#/picturetalk");
await page.waitForSelector(".pt-card");
await page.click('[data-id="pt-rain"]');
await say(page, "A man has no umbrella.");
await page.waitForSelector('.sb-notice [data-act="resend"]', { timeout: 20000 });
const demoModel = await page.locator("text=示範說法").count();

// 插圖出現在對話與微善
await page.goto("http://localhost:8787/#/goodtalk");
await page.waitForSelector(".gt-thumb .art");
const thumbs = await page.locator(".gt-thumb .art").count();
await page.goto("http://localhost:8787/#/mission");
await page.waitForSelector(".ms-hero .gt-banner .art");

console.log(JSON.stringify({ tabs, cards, words, seen, gave, model, compare, demoModel, thumbs, errors }, null, 2));
await browser.close();
