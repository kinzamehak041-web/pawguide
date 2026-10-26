const { pets } = require("./_lib/pets");

module.exports = (req, res) => {
  res.setHeader("Content-Type", "application/json; charset=utf-8");
  res.status(200).send(JSON.stringify([...new Set(pets.map((p) => p.category))]));
};
