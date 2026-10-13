// scripts/make-icons.js — generates correctly-sized FixIt placeholder artwork. Pure Node, no dependencies.
// Real designed art should replace these before production submission, but these
// satisfy dimension/format gates: Play 512px, App Store 1024px, splash, favicon.
const fs = require("fs");
const path = require("path");
const zlib = require("zlib");

const AMBER = [255, 179, 0];
const DARK = [20, 20, 20];

function crc32(buf) {
  if (!crc32.t) {
    crc32.t = new Int32Array(256);
    for (let n = 0; n < 256; n++) {
      let c = n;
      for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
      crc32.t[n] = c;
    }
  }
  let c = -1;
  for (let i = 0; i < buf.length; i++) c = crc32.t[(c ^ buf[i]) & 255] ^ (c >>> 8);
  return (c ^ -1) >>> 0;
}
function chunk(type, data) {
  const t = Buffer.from(type, "ascii");
  const len = Buffer.alloc(4);
  len.writeUInt32BE(data.length, 0);
  const crc = Buffer.alloc(4);
  crc.writeUInt32BE(crc32(Buffer.concat([t, data])), 0);
  return Buffer.concat([len, t, data, crc]);
}
// px: Buffer of w*h*3 RGB bytes
function png(w, h, px) {
  const rows = [];
  for (let y = 0; y < h; y++) rows.push(Buffer.concat([Buffer.from([0]), px.subarray(y * w * 3, (y + 1) * w * 3)]));
  const idat = zlib.deflateSync(Buffer.concat(rows), { level: 9 });
  return Buffer.concat([
    Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]),
    chunk("IHDR", (() => { const b = Buffer.alloc(13); b.writeUInt32BE(w, 0); b.writeUInt32BE(h, 4); b[8] = 8; b[9] = 2; return b; })()),
    chunk("IDAT", idat),
    chunk("IEND", Buffer.alloc(0)),
  ]);
}
function paint(w, h, fn) {
  const px = Buffer.alloc(w * h * 3);
  for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) {
    const [r, g, b] = fn(x / w, y / h, x, y);
    const o = (y * w + x) * 3;
    px[o] = r; px[o + 1] = g; px[o + 2] = b;
  }
  return px;
}
// Amber tile, dark centered square, amber "F" drawn with rects.
function appIcon(s) {
  return paint(s, s, (fx, fy) => {
    const inBox = fx >= 0.25 && fx <= 0.75 && fy >= 0.25 && fy <= 0.75;
    if (!inBox) return AMBER;
    const barV = fx >= 0.375 && fx <= 0.45 && fy >= 0.35 && fy <= 0.65;
    const barT = fx >= 0.375 && fx <= 0.625 && fy >= 0.35 && fy <= 0.425;
    const barM = fx >= 0.375 && fx <= 0.575 && fy >= 0.47 && fy <= 0.545;
    return barV || barT || barM ? AMBER : DARK;
  });
}
// Dark splash, amber centered square, dark "F".
function splash(w, h) {
  return paint(w, h, (fx, fy) => {
    const cx = fx >= 0.5 - 0.14 * (h / w) * 2 && fx <= 0.5 + 0.14 * (h / w) * 2;
    const box = cx && fy >= 0.25 && fy <= 0.75;
    if (!box) return DARK;
    const f = (a, b, c, d) => fx >= a && fx <= b && fy >= c && fy <= d;
    const s = 0.14 * (h / w) * 2; // half-width of square in fx units
    const x0 = 0.5 - s, x1 = 0.5 + s;
    const barV = fx >= x0 + s * 0.25 && fx <= x0 + s * 0.5 && fy >= 0.375 && fy <= 0.625;
    const barT = fx >= x0 + s * 0.25 && fx <= x0 + s * 1.5 && fy >= 0.375 && fy <= 0.45;
    const barM = fx >= x0 + s * 0.25 && fx <= x0 + s * 1.25 && fy >= 0.475 && fy <= 0.55;
    void f;
    return barV || barT || barM ? DARK : AMBER;
  });
}

const root = path.join(__dirname, "..");
const out = [
  ["mobile/assets/icon.png", png(512, 512, appIcon(512))],
  ["mobile/assets/adaptive-icon.png", png(512, 512, appIcon(512))],
  ["mobile/assets/favicon.png", png(48, 48, appIcon(48))],
  ["mobile/assets/splash.png", png(1280, 720, splash(1280, 720))],
  ["store/icon-1024.png", png(1024, 1024, appIcon(1024))],
];
for (const [rel, buf] of out) {
  const p = path.join(root, rel);
  fs.mkdirSync(path.dirname(p), { recursive: true });
  fs.writeFileSync(p, buf);
  console.log("wrote " + rel + " (" + buf.length + " bytes)");
}
