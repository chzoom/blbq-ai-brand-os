import http from "node:http";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import aiHandler from "./netlify/functions/ai.mjs";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

function loadEnv() {
  const envPath = path.join(__dirname, ".env");
  if (!fs.existsSync(envPath)) return;
  const text = fs.readFileSync(envPath, "utf8");
  for (const line of text.split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const index = trimmed.indexOf("=");
    if (index <= 0) continue;
    const key = trimmed.slice(0, index).trim();
    let value = trimmed.slice(index + 1).trim();
    value = value.replace(/^["']|["']$/g, "");
    if (!process.env[key]) process.env[key] = value;
  }
}

loadEnv();

const PORT = Number(process.env.PORT || 8787);
const ROOT = __dirname;

const mimeTypes = {
  ".html": "text/html; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".mjs": "text/javascript; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".svg": "image/svg+xml",
  ".ico": "image/x-icon",
  ".txt": "text/plain; charset=utf-8",
  ".md": "text/markdown; charset=utf-8"
};

function sendNodeResponse(res, status, headers, body) {
  res.writeHead(status, headers);
  res.end(body);
}

async function handleAI(req, res) {
  try {
    const chunks = [];
    for await (const chunk of req) chunks.push(chunk);
    const body = Buffer.concat(chunks);

    const request = new Request(`http://127.0.0.1:${PORT}${req.url}`, {
      method: req.method,
      headers: req.headers,
      body: ["GET", "HEAD"].includes(req.method) ? undefined : body
    });

    const response = await aiHandler(request);
    const responseBody = Buffer.from(await response.arrayBuffer());
    const headers = {};
    response.headers.forEach((value, key) => headers[key] = value);
    sendNodeResponse(res, response.status, headers, responseBody);
  } catch (error) {
    sendNodeResponse(
      res,
      500,
      { "content-type": "application/json; charset=utf-8" },
      JSON.stringify({ error: error?.message || "本地 AI 服务异常" })
    );
  }
}

function safeFilePath(urlPath) {
  let decoded;
  try {
    decoded = decodeURIComponent(urlPath.split("?")[0]);
  } catch {
    decoded = "/";
  }
  if (decoded === "/") decoded = "/index.html";
  const relative = decoded.replace(/^\/+/, "");
  const target = path.resolve(ROOT, relative);
  if (!target.startsWith(path.resolve(ROOT))) return null;
  return target;
}

const server = http.createServer(async (req, res) => {
  if (req.url?.startsWith("/.netlify/functions/ai")) {
    await handleAI(req, res);
    return;
  }

  const target = safeFilePath(req.url || "/");
  if (!target) {
    sendNodeResponse(res, 403, { "content-type": "text/plain; charset=utf-8" }, "禁止访问");
    return;
  }

  fs.stat(target, (err, stat) => {
    if (err || !stat.isFile()) {
      sendNodeResponse(res, 404, { "content-type": "text/plain; charset=utf-8" }, "文件不存在");
      return;
    }

    const type = mimeTypes[path.extname(target).toLowerCase()] || "application/octet-stream";
    res.writeHead(200, { "content-type": type, "cache-control": "no-store" });
    fs.createReadStream(target).pipe(res);
  });
});

server.listen(PORT, "127.0.0.1", () => {
  console.log("");
  console.log("==============================================");
  console.log(" 饱里宝气小红书 AI 运营工作台已启动");
  console.log(` 地址：http://127.0.0.1:${PORT}`);
  console.log(" 关闭方法：回到此窗口，按 Control + C");
  console.log("==============================================");
  console.log("");
});
