const { pets } = require("../_lib/pets");

module.exports = (req, res) => {
  const id = String((req.query && req.query.id) || "");
  const pet = pets.find((p) => p.id === id);
  res.setHeader("Content-Type", "application/json; charset=utf-8");
  if (!pet) return res.status(404).send(JSON.stringify({ error: "Pet not found" }));
  res.status(200).send(JSON.stringify(pet));
};
