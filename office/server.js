// Tiny static server for the AI office (no dependencies). node office/server.js [port]
const http = require("http");
const fs = require("fs");
const path = require("path");
const root = __dirname;
const port = Number(process.argv[2]) || 4321;
const types = { ".html": "text/html; charset=utf-8", ".json": "application/json; charset=utf-8", ".js": "text/javascript", ".css": "text/css", ".png": "image/png", ".svg": "image/svg+xml" };

http
  .createServer((req, res) => {
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
  })
  .listen(port, "127.0.0.1", () => console.log(`AI Office running at http://localhost:${port}  (Ctrl+C to stop)`));
