const pets = require("../../data/pets.json");

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

function search(q, category) {
  let list = pets;
  if (category) list = list.filter((p) => p.category.toLowerCase() === category.toLowerCase());
  if (q) {
    list = list
      .map((p) => ({ p, s: score(p, q) }))
      .filter((x) => x.s > 0)
      .sort((a, b) => b.s - a.s)
      .map((x) => x.p);
  }
  return list.map(({ id, name, emoji, category, summary, difficulty, lifespan, cost }) => ({
    id, name, emoji, category, summary, difficulty, lifespan, cost,
  }));
}

module.exports = { pets, search };
