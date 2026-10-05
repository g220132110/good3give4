// 第三階段實測（Think Well、Global Share）：先 FAKE_AI=1 node dev/server.mjs
import { createRequire } from "node:module";
const require = createRequire(import.meta.url);
const { chromium } = require(process.env.PW_PATH || "playwright");
const OUT = process.env.OUT || ".";
const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2 });
await page.route(/fonts\.(googleapis|gstatic)\.com/, (r) => r.abort());
const errors = [];
page.on("pageerror", (e) => errors.push(e.message));
page.on("console", (m) => m.type() === "error" && !/ERR_FAILED/.test(m.text()) && errors.push(m.text()));
async function say(text) {
  const show = page.locator("#gtCShowType");
  if (await show.isVisible()) await show.click();
  await page.fill("#gtCIn", text);
  await page.click("#gtCSend");
  await page.waitForFunction(() => !document.querySelector(".gt-typing"));
}

await page.goto("http://localhost:8787/#/goodtalk");
await page.waitForSelector(".gt-scene");
const sections = await page.$$eval("h2.gt-kind", (h) => h.map((x) => x.textContent));
const total = await page.locator(".gt-scene").count();
await page.screenshot({ path: `${OUT}/p3-list.png`, fullPage: true });

// Think Well
await page.click('[data-sid="teammate-mistake"]');
await page.waitForSelector("#gtLog");
const twLabel = await page.textContent("#gtChat .section-head .label");
await say("Ken ruined everything.");
const twBubbles = await page.locator(".gt-msg").count();
await page.click('[data-act="leave"]');

// Global Share
await page.click('[data-sid="ambassador-three-acts"]');
await page.waitForSelector(".gt-intro[open]");
const introLines = await page.locator(".gt-intro-line").count();
const introZhVisible = await page.locator(".gt-intro .gt-zh").first().isVisible();
await page.screenshot({ path: `${OUT}/p3-ambassador.png`, fullPage: true });
await page.click('[data-act="zh"]');
const introZhHidden = !(await page.locator(".gt-intro .gt-zh").first().isVisible());
await page.click('[data-act="zh"]');
const turnLabel = await page.textContent("#gtInput .label");
for (const t of ["They are do good deeds, speak good words, and think good thoughts.", "Good thoughts make good words.", "No, anyone can do it.", "Say thank you to the bus driver.", "Confidence, joy, hope, and convenience."]) await say(t);
const introClosed = !(await page.locator(".gt-intro").evaluate((d) => d.open));
const ended = await page.locator("#gtEnd").isVisible();
await page.click('#gtEnd [data-act="finish"]');
await page.waitForSelector("#gtResult:not([hidden]) h2");
const resultTitle = await page.textContent("#gtResult .section-head h2");

console.log(JSON.stringify({ sections, total, twLabel, twBubbles, introLines, introZhVisible, introZhHidden, turnLabel, introClosed, ended, resultTitle, errors }, null, 2));
await browser.close();
