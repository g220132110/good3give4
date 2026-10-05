// 首頁、Passport、PWA 實測：先 FAKE_AI=1 node dev/server.mjs，再 node dev/e2e-home.mjs
import { createRequire } from "node:module";
const require = createRequire(import.meta.url);
const { chromium } = require(process.env.PW_PATH || "playwright");
const OUT = process.env.OUT || ".";
const browser = await chromium.launch();
const errors = [];
const page = await browser.newPage({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2 });
await page.route(/fonts\.(googleapis|gstatic)\.com/, (r) => r.abort());
page.on("pageerror", (e) => errors.push(e.message));
page.on("console", (m) => m.type() === "error" && !/ERR_FAILED|503/.test(m.text()) && errors.push(m.text()));

await page.goto("http://localhost:8787/");
await page.waitForSelector(".hm-pillar");
const tabs = await page.$$eval(".tab span", (s) => s.map((x) => x.textContent));
const pillars = await page.locator(".hm-pillar").count();
await page.screenshot({ path: `${OUT}/home-1.png`, fullPage: true });

// 訪客模式
await page.click('[data-act="lang"]');
await page.waitForSelector(".hm-visitor");
const visitorLines = await page.locator(".hm-visitor .hm-line").count();
const enTitle = await page.textContent(".hm-p-head b");
await page.screenshot({ path: `${OUT}/home-2-visitor.png`, fullPage: true });
await page.click('[data-act="lang"]');

// 從首頁進微善：分頁亮「首頁」
await page.click(".hm-today");
await page.waitForSelector("#msView");
const activeOnMission = await page.$eval('.tab[aria-current="page"] span', (s) => s.textContent);

// 說好話拿到結果 → 蓋章提示 → Passport 有章
await page.goto("http://localhost:8787/#/saybetter");
await page.waitForSelector(".sb-ctx, .chip");
const show = page.locator("#sbAShowType");
await page.evaluate(() => App.virtue.logResult({ acts: [{ name: "說好話", evidence: "x" }], givings: [{ name: "給人信心", evidence: "y" }] }, "saybetter"));
await page.waitForSelector(".gv-toast");
await page.screenshot({ path: `${OUT}/home-3-toast.png` });
await page.click('.tab[data-id="passport"]');
await page.waitForSelector(".pp-stamp");
const stampsOn = await page.locator(".pp-stamp.on").count();
await page.screenshot({ path: `${OUT}/home-4-passport.png`, fullPage: true });

// PWA
const manifest = await page.evaluate(async () => (await fetch("manifest.webmanifest")).json());
const sw = await page.evaluate(async () => { const r = await navigator.serviceWorker.ready; return Boolean(r.active); });
const cached = await page.evaluate(async () => (await (await caches.open("ge-v1")).keys()).length);

console.log(JSON.stringify({ tabs, pillars, visitorLines, enTitle, activeOnMission, stampsOn, manifest: manifest.short_name, sw, cached, errors }, null, 2));
await browser.close();
