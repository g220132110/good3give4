// 本機測試伺服器：同時提供網頁與後端 /api（直接執行 worker 的程式碼）。
//   node dev/server.mjs            → 示範模式（不需金鑰）
//   ANTHROPIC_API_KEY=... node dev/server.mjs   → 真的呼叫 Claude
//   AI_PROVIDER=gemini GEMINI_API_KEY=... node dev/server.mjs
//   FAKE_AI=1 node dev/server.mjs  → 測試用假 AI（不連網，測 AI 路徑）
// 開啟 http://localhost:8787/
import http from "node:http";
import { readFile } from "node:fs/promises";
import { extname, join, normalize } from "node:path";
import { fileURLToPath } from "node:url";
import worker from "../worker/src/index.js";
if (process.env.FAKE_AI) { await import("./fake-ai.mjs"); process.env.GEMINI_API_KEY ||= "fake"; process.env.AI_PROVIDER = "gemini"; }

const ROOT = fileURLToPath(new URL("..", import.meta.url));
const PORT = Number(process.env.PORT || 8787);
const TYPES = { ".html": "text/html; charset=utf-8", ".js": "text/javascript; charset=utf-8", ".css": "text/css; charset=utf-8", ".json": "application/json", ".webmanifest": "application/manifest+json", ".png": "image/png", ".svg": "image/svg+xml" };
const env = { ...process.env };

http.createServer(async (req, res) => {
  const url = new URL(req.url, `http://localhost:${PORT}`);
  if (url.pathname.startsWith("/api/")) {
    const chunks = [];
    for await (const c of req) chunks.push(c);
    const r = await worker.fetch(
      new Request(url, { method: req.method, headers: req.headers, body: ["GET", "HEAD"].includes(req.method) ? undefined : Buffer.concat(chunks) }),
      env,
    );
    res.writeHead(r.status, Object.fromEntries(r.headers));
    return res.end(Buffer.from(await r.arrayBuffer()));
  }
  let path = normalize(decodeURIComponent(url.pathname)).replace(/^([/\\])+/, "");
  if (!path || path.endsWith("/")) path += "index.html";
  try {
    const body = await readFile(join(ROOT, path));
    res.writeHead(200, { "content-type": TYPES[extname(path)] || "application/octet-stream" });
    res.end(body);
  } catch {
    res.writeHead(404).end("not found");
  }
}).listen(PORT, () => console.log(`http://localhost:${PORT}/`));
