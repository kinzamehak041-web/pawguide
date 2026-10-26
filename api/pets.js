const { search } = require("./_lib/pets");

module.exports = (req, res) => {
  const q = String((req.query && req.query.q) || "").trim();
  const category = String((req.query && req.query.category) || "").trim();
  res.setHeader("Content-Type", "application/json; charset=utf-8");
  res.status(200).send(JSON.stringify(search(q, category)));
};
