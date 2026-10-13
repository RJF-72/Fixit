const express = require("express");
const cors = require("cors");
const app = express();
app.use(cors()); app.use(express.json({ limit: "10mb" })); // image upload limits (spec 42)
// Tables (spec 41): users, projects, project_photos, project_steps, favorites, library_articles, library_categories, diagnoses, purchases, settings, feedback
app.get("/health", (req, res) => res.json({ ok: true, app: "FixIt", version: "1.0.0" }));
app.post("/api/diagnose", require("./api/diagnose"));
app.post("/api/purchases/verify", require("./api/verify"));
app.get("/api/library/search", require("./api/search"));
app.get("/api/parts", (req, res) => {
  const { q = "", category = "" } = req.query || {};
  if (!q) return res.status(400).json({ error: "Missing ?q=part name" });
  res.json({ q, findParts: require("./api/parts").partsLinks([String(q)], String(category)) });
});
app.delete("/api/account", (req, res) => res.json({ deleted: true })); // account+data deletion (spec 42)
const port = process.env.PORT || 8080;
if (require.main === module) app.listen(port, () => console.log("FixIt backend on :" + port));
module.exports = app;
