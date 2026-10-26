// Generates SEO-friendly static pages: public/pets/<id>.html, sitemap.xml, robots.txt
// and the crawlable link list on the home page.
// Usage: node generate-pages.js            (uses default BASE_URL)
//        BASE_URL=https://yourdomain.com node generate-pages.js
const fs = require("fs");
const path = require("path");

const BASE = (process.env.BASE_URL || "https://petcare-hub-ten.vercel.app").replace(/\/$/, "");
const SITE = "PawGuide";
const pets = require("./data/pets.json");
const PUB = path.join(__dirname, "public");
fs.mkdirSync(path.join(PUB, "pets"), { recursive: true });

const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
const jsonLd = (o) => JSON.stringify(o).replace(/</g, "\\u003c");

const section = (title, items, cls = "") =>
  items && items.length
    ? `<section class="section ${cls}"><h2>${title}</h2><ul>${items.map((i) => `<li>${esc(i)}</li>`).join("")}</ul></section>`
    : "";

function page(p) {
  const title = `${p.name} Care Guide: Food, Housing, Health & Training | ${SITE}`;
  const desc = `How to raise and care for a ${p.name.toLowerCase()}: diet, housing, grooming, vet care, training and daily routine. ${p.summary}`.slice(0, 300);
  const url = `${BASE}/pets/${p.id}`;
  const ld = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: `${p.name} Care Guide`,
    description: desc,
    mainEntityOfPage: url,
    publisher: { "@type": "Organization", name: SITE },
  };
  const crumbs = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: BASE + "/" },
      { "@type": "ListItem", position: 2, name: `${p.name} care`, item: url },
    ],
  };
  const others = pets.filter((x) => x.id !== p.id).map((x) => `<a class="tag" href="/pets/${x.id}">${x.emoji} ${esc(x.name)}</a>`).join(" ");
  return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${esc(title)}</title>
<meta name="description" content="${esc(desc)}">
<link rel="canonical" href="${url}">
<meta property="og:type" content="article">
<meta property="og:title" content="${esc(title)}">
<meta property="og:description" content="${esc(desc)}">
<meta property="og:url" content="${url}">
<meta property="og:site_name" content="${SITE}">
<meta name="twitter:card" content="summary">
<link rel="stylesheet" href="/style.css">
<script type="application/ld+json">${jsonLd(ld)}</script>
<script type="application/ld+json">${jsonLd(crumbs)}</script>
</head>
<body>
<header class="pagehead"><nav class="nav"><a href="/" class="logo">🐾 ${SITE}</a></nav></header>
<main class="container">
  <a class="back" href="/">← All pets</a>
  <div class="detail-head">
    <div class="emoji">${p.emoji}</div>
    <div><h1>${esc(p.name)} Care Guide</h1><p>${esc(p.summary)}</p></div>
  </div>
  <div class="facts">
    <div class="fact"><small>Difficulty</small><strong>${esc(p.difficulty)}</strong></div>
    <div class="fact"><small>Lifespan</small><strong>${esc(p.lifespan)}</strong></div>
    <div class="fact"><small>Cost</small><strong>${esc(p.cost)}</strong></div>
    <div class="fact"><small>Size</small><strong>${esc(p.size)}</strong></div>
  </div>
  <div class="sections">
    ${section("🍽️ Food &amp; Diet", p.diet)}
    ${section("🏠 Housing", p.housing)}
    ${section("📅 Daily Routine", p.daily)}
    ${section("🛁 Grooming", p.grooming)}
    ${section("🩺 Health &amp; Vet Care", p.health)}
    ${section("🎓 Training", p.training)}
    ${section("⚠️ Foods &amp; Things to Avoid", p.avoid, "warn")}
    ${section("💡 Pro Tips", p.tips, "tipbox")}
  </div>
  <h2 class="morehead">More pet care guides</h2>
  <div class="tags">${others}</div>
</main>
<footer class="footer"><p>${SITE} gives general information. For illness or emergencies, always visit a qualified veterinarian.</p></footer>
</body>
</html>
`;
}

pets.forEach((p) => fs.writeFileSync(path.join(PUB, "pets", `${p.id}.html`), page(p)));

// sitemap + robots
const today = new Date().toISOString().slice(0, 10);
const urls = [BASE + "/", ...pets.map((p) => `${BASE}/pets/${p.id}`)];
fs.writeFileSync(
  path.join(PUB, "sitemap.xml"),
  `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n` +
    urls.map((u) => `  <url><loc>${u}</loc><lastmod>${today}</lastmod></url>`).join("\n") +
    `\n</urlset>\n`
);
fs.writeFileSync(path.join(PUB, "robots.txt"), `User-agent: *\nAllow: /\n\nSitemap: ${BASE}/sitemap.xml\n`);

// crawlable link list + canonical on the home page
let html = fs.readFileSync(path.join(PUB, "index.html"), "utf8");
const links = pets.map((p) => `<a class="tag" href="/pets/${p.id}">${p.emoji} ${esc(p.name)} care guide</a>`).join(" ");
html = html.replace(/<!--PET_LINKS_START-->[\s\S]*?<!--PET_LINKS_END-->/, `<!--PET_LINKS_START-->${links}<!--PET_LINKS_END-->`);
html = html.replace(/<link rel="canonical"[^>]*>/, `<link rel="canonical" href="${BASE}/">`);
html = html.replace(/<meta property="og:url"[^>]*>/, `<meta property="og:url" content="${BASE}/">`);
fs.writeFileSync(path.join(PUB, "index.html"), html);
console.log(`Generated ${pets.length} pet pages, sitemap.xml, robots.txt for ${BASE}`);
