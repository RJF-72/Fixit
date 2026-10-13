// GET /api/library/search?q=running toilet — natural-language search over knowledge/ (spec 16)
const fs = require("fs"), path = require("path");
module.exports = (req, res) => {
  const q = String(req.query.q || "").toLowerCase();
  const lib = path.join(__dirname, "..", "..", "..", "knowledge", "library.json");
  let articles = []; try { articles = JSON.parse(fs.readFileSync(lib, "utf8")); } catch (e) {}
  const hits = articles.filter(a => (a.title + " " + a.category + " " + (a.keywords||[]).join(" ")).toLowerCase().includes(q.split(" ")[0] || ""));
  res.json({ q: req.query.q || "", hits: hits.slice(0, 20) });
};
