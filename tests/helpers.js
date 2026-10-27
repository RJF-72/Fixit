// Shared mock req/res for handler-level tests (handlers are Express-style
// functions taking (req, res); no HTTP server needed).
function mockRes() {
  return {
    statusCode: 200,
    headers: {},
    body: null,
    set(k, v) { this.headers[k] = v; return this; },
    status(code) { this.statusCode = code; return this; },
    json(payload) { this.body = payload; return this; },
  };
}
function mockReq(body = {}, headers = {}) {
  return { body, headers, query: {} };
}
module.exports = { mockRes, mockReq };
