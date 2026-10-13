// POST /api/purchases/verify { platform: apple|google|microsoft, receipt } -> server-side validation (spec 42), returns entitlement
module.exports = (req, res) => {
  const { platform, receipt } = req.body || {};
  if (!platform || !receipt) return res.status(400).json({ error: "platform + receipt required" });
  return res.json({ entitled: true, sku: "fixit_lifetime_799", platform }); // stub: call StoreKit/Play/Microsoft verify here
};
