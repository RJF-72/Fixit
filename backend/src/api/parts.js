// backend/src/api/parts.js — "Find This Part" referral hook.
// For each material/part the diagnosis needs, generate genuine retailer SEARCH
// links (never fake product listings). When legitimate affiliate partnerships
// exist, append tags via AFFILIATE_TAGS config — no fake IDs by default.
const RETAILERS = [
  { id: "homedepot", label: "Home Depot", search: (q) => "https://www.homedepot.com/s/" + encodeURIComponent(q) },
  { id: "lowes", label: "Lowe's", search: (q) => "https://www.lowes.com/search?searchTerm=" + encodeURIComponent(q) },
  { id: "amazon", label: "Amazon", search: (q) => "https://www.amazon.com/s?k=" + encodeURIComponent(q) },
  { id: "autozone", label: "AutoZone", autoOnly: true, search: (q) => "https://www.autozone.com/searchresult?searchText=" + encodeURIComponent(q) },
];
// AFFILIATE_TAGS: { retailerId: "tag=fixit-20" } — appended as extra query param when set.
const AFFILIATE_TAGS = {};
function withTag(url, retailerId) {
  const tag = AFFILIATE_TAGS[retailerId];
  if (!tag) return url;
  return url + (url.includes("?") ? "&" : "?") + tag;
}
function partsLinks(materials, category = "") {
  const isAuto = /auto/i.test(category || "");
  return (materials || []).map((m) => ({
    part: m,
    links: RETAILERS.filter((r) => !r.autoOnly || isAuto).map((r) => ({ retailer: r.label, url: withTag(r.search(m), r.id) })),
  }));
}
module.exports = { RETAILERS, AFFILIATE_TAGS, partsLinks };
