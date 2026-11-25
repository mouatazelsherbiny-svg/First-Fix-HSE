// Tiny static server for the AI office (no dependencies). node office/server.js [port]
// Opens the browser itself once the server is ready. If the office is already running, it just opens the page.
const http = require("http");
const fs = require("fs");
const path = require("path");
const { exec } = require("child_process");
const root = __dirname;
const port = Number(process.argv[2]) || 4321;
const url = `http://localhost:${port}`;
const types = { ".html": "text/html; charset=utf-8", ".json": "application/json; charset=utf-8", ".js": "text/javascript", ".css": "text/css", ".png": "image/png", ".svg": "image/svg+xml", ".glb": "model/gltf-binary", ".txt": "text/plain" };

function openBrowser() {
  const cmd = process.platform === "win32" ? `start "" "${url}"` : process.platform === "darwin" ? `open "${url}"` : `xdg-open "${url}"`;
  exec(cmd, () => {});
}

const server = http.createServer((req, res) => {
  let p = decodeURIComponent((req.url || "/").split("?")[0]);
  if (p === "/") p = "/index.html";
  const f = path.normalize(path.join(root, p));
  if (!f.startsWith(root)) return res.writeHead(403).end();
  fs.readFile(f, (err, buf) => {
    if (err) {
      if (p === "/status.json") return res.writeHead(200, { "Content-Type": types[".json"], "Cache-Control": "no-store" }).end('{"agents":{},"log":[]}');
      return res.writeHead(404).end("Not found");
    }
    res.writeHead(200, { "Content-Type": types[path.extname(f)] || "application/octet-stream", "Cache-Control": "no-store" });
    res.end(buf);
  });
});

server.on("error", (e) => {
  if (e.code === "EADDRINUSE") {
    console.log(`The AI Office is already running at ${url} — opening it.`);
    openBrowser();
    setTimeout(() => process.exit(0), 1500);
  } else {
    console.error(e);
  }
});

server.listen(port, "127.0.0.1", () => {
  console.log(`AI Office running at ${url}`);
  console.log("Keep this window open while you watch the office. Close it (or Ctrl+C) to stop.");
  if (!process.argv.includes("--no-open")) openBrowser();
});
