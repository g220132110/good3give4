/* Service Worker：讓網站可以加到主畫面、離線開啟。
 * 網站檔案：有網路就拿最新版（上傳新版後立刻生效），同時存一份；沒網路或 4 秒沒回應就用存的那份。
 * AI 後端（/api/、其他網域）與 Google 字型：不經過快取，直接連網。
 * 改了網站檔案後，把 VERSION 加一，舊快取會被清掉。
 */
const VERSION = "ge-v1";
const CORE = [
  "./",
  "index.html",
  "manifest.webmanifest",
  "css/app.css",
  "icons/icon.svg",
  "icons/icon-192.png",
  "js/core/app.js",
  "js/core/speech.js",
  "js/core/dict.js",
  "js/core/virtue.js",
  "js/core/ai.js",
  "js/core/ask.js",
  "js/core/art.js",
  "data/speaking/travel.js",
  "data/news/2026-09-25.js",
  "data/saybetter/contexts.js",
  "data/goodtalk/scenarios.js",
  "data/mission/tasks.js",
  "data/picturetalk/pictures.js",
  "data/roots.js",
  "js/modules/home.js",
  "js/modules/saybetter.js",
  "js/modules/goodtalk.js",
  "js/modules/mission.js",
  "js/modules/picturetalk.js",
  "js/modules/passport.js",
  "js/modules/speaking.js",
  "js/modules/reading.js",
  "js/modules/wordbook.js",
  "js/modules/soon.js",
];

self.addEventListener("install", (e) => {
  e.waitUntil(caches.open(VERSION).then((c) => c.addAll(CORE)).then(() => self.skipWaiting()));
});

self.addEventListener("activate", (e) => {
  e.waitUntil(caches.keys().then((keys) => Promise.all(keys.filter((k) => k !== VERSION).map((k) => caches.delete(k)))).then(() => self.clients.claim()));
});

self.addEventListener("fetch", (e) => {
  const url = new URL(e.request.url);
  if (e.request.method !== "GET" || url.origin !== location.origin || url.pathname.includes("/api/")) return;
  e.respondWith(caches.open(VERSION).then(async (cache) => {
    const net = fetch(e.request).then((res) => { if (res.ok) cache.put(e.request, res.clone()); return res; });
    const slow = new Promise((r) => setTimeout(r, 4000));
    try {
      const res = await Promise.race([net, slow]);
      if (res) return res;
    } catch (err) { /* 離線 */ }
    return (await cache.match(e.request, { ignoreSearch: true })) || net;
  }));
});
