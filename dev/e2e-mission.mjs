// 微善任務實測：先 FAKE_AI=1 node dev/server.mjs，再 node dev/e2e-mission.mjs
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

await page.goto("http://localhost:8787/#/mission");
await page.waitForSelector(".ms-hero h2");
const tabs = await page.$$eval(".tab span", (s) => s.map((x) => x.textContent));
const first = await page.textContent(".ms-hero h2");
await page.click('[data-act="next"]');
const second = await page.textContent(".ms-hero h2");
// 換到有練習情境的任務
let tries = 0;
while (!(await page.locator('[data-act="practice"]').count()) && tries++ < 10) await page.click('[data-act="next"]');
const practiceTask = await page.textContent(".ms-hero h2");
await page.screenshot({ path: `${OUT}/ms-1-today.png`, fullPage: true });
await page.click('[data-act="practice"]');
await page.waitForSelector("#gtChat:not([hidden]) #gtLog");
const jumped = await page.textContent("#gtChat h2");
await page.goto("http://localhost:8787/#/mission");
await page.waitForSelector(".ms-hero h2");
await page.click('[data-act="did"]');
await page.waitForSelector("#msFeel .chip");
await page.click('#msFeel .chip[data-id="smile"]');
await page.fill("#msNote", "Today I help a man find the way.");
await page.click('[data-act="check"]');
await page.waitForSelector("#msTip .gt-better");
await page.screenshot({ path: `${OUT}/ms-2-reflect.png`, fullPage: true });
await page.click('[data-act="finish"]');
await page.waitForSelector(".ms-done");
const streak = await page.textContent(".ms-done .score b");
await page.screenshot({ path: `${OUT}/ms-3-done.png`, fullPage: true });
await page.click('[data-act="today"]');
const total = await page.textContent(".ms-stats div:nth-child(2) b");
const doneNotice = await page.locator(".ms-hero .notice").count();
const passport = await page.evaluate(() => JSON.parse(localStorage.getItem("ep.virtue.log")));

console.log(JSON.stringify({ tabs, first, second, practiceTask, jumped, streak, total, doneNotice, passport, errors }, null, 2));
await browser.close();
