const $ = (s) => document.querySelector(s);
const grid = $("#grid");
const listView = $("#list-view");
const detailView = $("#detail-view");
const detail = $("#detail");
const empty = $("#empty");
const chips = $("#chips");
let activeCategory = "";

const esc = (s) =>
  String(s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));

async function loadCategories() {
  const cats = await (await fetch("/api/categories")).json();
  chips.innerHTML = "";
  ["All", ...cats].forEach((c) => {
    const b = document.createElement("button");
    b.className = "chip" + ((c === "All" && !activeCategory) || c === activeCategory ? " active" : "");
    b.textContent = c;
    b.onclick = () => {
      activeCategory = c === "All" ? "" : c;
      loadCategories();
      search();
    };
    chips.appendChild(b);
  });
}

async function search() {
  const q = $("#q").value.trim();
  const params = new URLSearchParams();
  if (q) params.set("q", q);
  if (activeCategory) params.set("category", activeCategory);
  const pets = await (await fetch("/api/pets?" + params)).json();
  $("#list-title").textContent = q ? `Results for "${q}"` : activeCategory || "All pets";
  grid.innerHTML = pets
    .map(
      (p) => `
    <a class="card" href="/pets/${esc(p.id)}" data-id="${esc(p.id)}">
      <div class="emoji">${p.emoji}</div>
      <h3>${esc(p.name)}</h3>
      <p>${esc(p.summary)}</p>
      <div class="tags">
        <span class="tag">${esc(p.difficulty)}</span>
        <span class="tag">${esc(p.lifespan)}</span>
        <span class="tag">${esc(p.category)}</span>
      </div>
    </a>`
    )
    .join("");
  empty.hidden = pets.length > 0;
  showList();
}

function list(title, items, cls = "") {
  if (!items || !items.length) return "";
  return `<div class="section ${cls}"><h3>${title}</h3><ul>${items.map((i) => `<li>${esc(i)}</li>`).join("")}</ul></div>`;
}

async function openPet(id) {
  const p = await (await fetch("/api/pets/" + encodeURIComponent(id))).json();
  detail.innerHTML = `
    <div class="detail-head">
      <div class="emoji">${p.emoji}</div>
      <div><h2>${esc(p.name)}</h2><p>${esc(p.summary)}</p></div>
    </div>
    <div class="facts">
      <div class="fact"><small>Difficulty</small><strong>${esc(p.difficulty)}</strong></div>
      <div class="fact"><small>Lifespan</small><strong>${esc(p.lifespan)}</strong></div>
      <div class="fact"><small>Cost</small><strong>${esc(p.cost)}</strong></div>
      <div class="fact"><small>Size</small><strong>${esc(p.size)}</strong></div>
    </div>
    <div class="sections">
      ${list("🍽️ Food & Diet", p.diet)}
      ${list("🏠 Housing", p.housing)}
      ${list("📅 Daily Routine", p.daily)}
      ${list("🛁 Grooming", p.grooming)}
      ${list("🩺 Health & Vet Care", p.health)}
      ${list("🎓 Training", p.training)}
      ${list("⚠️ Foods & Things to Avoid", p.avoid, "warn")}
      ${list("💡 Pro Tips", p.tips, "tipbox")}
    </div>`;
  listView.hidden = true;
  detailView.hidden = false;
  window.scrollTo({ top: 0, behavior: "smooth" });
}

function showList() {
  listView.hidden = false;
  detailView.hidden = true;
}

$("#search-form").addEventListener("submit", (e) => { e.preventDefault(); search(); });
$("#back").onclick = showList;
$("#home-link").onclick = (e) => { e.preventDefault(); $("#q").value = ""; activeCategory = ""; loadCategories(); search(); };

loadCategories();
search();
