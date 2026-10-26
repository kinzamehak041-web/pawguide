// PawGuide backend - zero dependencies, runs on plain Node.js (v14+)
const http = require("http");
const fs = require("fs");
const path = require("path");
const { URL } = require("url");

const pets = JSON.parse(fs.readFileSync(path.join(__dirname, "data", "pets.json"), "utf8"));
const PUBLIC_DIR = path.join(__dirname, "public");
const PORT = process.env.PORT || 3000;

const MIME = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "application/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".svg": "image/svg+xml",
  ".ico": "image/x-icon",
  ".xml": "application/xml; charset=utf-8",
  ".txt": "text/plain; charset=utf-8",
};

// Simple scoring search across name, aliases, category, tags and summary
function score(pet, q) {
  const terms = q.toLowerCase().split(/\s+/).filter(Boolean);
  let total = 0;
  for (const t of terms) {
    const name = pet.name.toLowerCase();
    if (name === t) total += 10;
    else if (name.includes(t)) total += 6;
    if (pet.aliases.some((a) => a.toLowerCase().includes(t))) total += 5;
    if (pet.category.toLowerCase().includes(t)) total += 3;
    if (pet.tags.some((x) => x.toLowerCase().includes(t))) total += 2;
    if (pet.summary.toLowerCase().includes(t)) total += 1;
  }
  return total;
}

function sendJson(res, status, data) {
  res.writeHead(status, { "Content-Type": "application/json; charset=utf-8" });
  res.end(JSON.stringify(data));
}

function handleApi(url, res) {
  const { pathname, searchParams } = url;

  // GET /api/pets?q=cat&category=Birds
  if (pathname === "/api/pets") {
    const q = (searchParams.get("q") || "").trim();
    const category = (searchParams.get("category") || "").trim().toLowerCase();
    let list = pets;
    if (category) list = list.filter((p) => p.category.toLowerCase() === category);
    if (q) {
      list = list
        .map((p) => ({ p, s: score(p, q) }))
        .filter((x) => x.s > 0)
        .sort((a, b) => b.s - a.s)
        .map((x) => x.p);
    }
    return sendJson(
      res,
      200,
      list.map(({ id, name, emoji, category, summary, difficulty, lifespan, cost }) => ({
        id, name, emoji, category, summary, difficulty, lifespan, cost,
      }))
    );
  }

  // GET /api/pets/:id -> full care guide
  const m = pathname.match(/^\/api\/pets\/([^/]+)$/);
  if (m) {
    const pet = pets.find((p) => p.id === decodeURIComponent(m[1]));
    return pet ? sendJson(res, 200, pet) : sendJson(res, 404, { error: "Pet not found" });
  }

  if (pathname === "/api/categories") {
    return sendJson(res, 200, [...new Set(pets.map((p) => p.category))]);
  }

  return sendJson(res, 404, { error: "Not found" });
}

function serveStatic(pathname, res) {
  let rel = pathname === "/" ? "/index.html" : pathname;
  const file = path.normalize(path.join(PUBLIC_DIR, rel));
  if (!file.startsWith(PUBLIC_DIR)) {
    res.writeHead(403);
    return res.end("Forbidden");
  }
  const tryFile = fs.existsSync(file) && fs.statSync(file).isFile() ? file : file + ".html";
  fs.readFile(tryFile, (err, data) => {
    if (err) {
      res.writeHead(404, { "Content-Type": "text/plain" });
      return res.end("Not found");
    }
    res.writeHead(200, { "Content-Type": MIME[path.extname(tryFile)] || "application/octet-stream" });
    res.end(data);
  });
}

const server = http.createServer((req, res) => {
  const url = new URL(req.url, `http://${req.headers.host || "localhost"}`);
  if (url.pathname.startsWith("/api/")) return handleApi(url, res);
  serveStatic(url.pathname, res);
});

server.listen(PORT, () => console.log(`PawGuide running on http://localhost:${PORT}`));
