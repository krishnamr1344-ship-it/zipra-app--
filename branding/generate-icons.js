"use strict";
// Generates Zipra brand PNG icons at required sizes from a procedural design.
// No external deps: uses zlib (built-in) for PNG encoding and supersampling AA.
const fs = require("fs");
const path = require("path");
const zlib = require("zlib");

const SRC = path.join(__dirname);
const OUT = path.join(__dirname, "generated");
fs.mkdirSync(OUT, { recursive: true });

// ---------- color helpers ----------
function lerp(a, b, t) { return a + (b - a) * t; }
function gradBg(x, y, S) {
  // gradient from (#FF9A3D) top-left to (#F26400) bottom-right, plus subtle radial glow
  const t = (x + y) / (2 * S); // 0..1
  const r = Math.round(lerp(255, 242, t));
  const g = Math.round(lerp(154, 100, t));
  const b = Math.round(lerp(61, 0, t));
  // glow
  const cx = S * 0.5, cy = S * 0.32;
  const d = Math.hypot(x - cx, y - cy) / (S * 0.7);
  const glow = Math.max(0, 1 - d) * 0.28;
  return [r + (255 - r) * glow, g + (255 - g) * glow, b + (255 - b) * glow];
}
function mix(c1, c2, t) {
  return [lerp(c1[0], c2[0], t), lerp(c1[1], c2[1], t), lerp(c1[2], c2[2], t)];
}
const WHITE = [255, 255, 255];
const CREAM = [255, 243, 232];
const ORANGE = [255, 122, 0];

// ---------- SDF-ish shape tests (in unit 0..1 space) ----------
// rounded square tile mask with radius rr
function tileMask(u, v, rr) {
  const ax = Math.max(0, Math.abs(u - 0.5) - (0.5 - rr));
  const ay = Math.max(0, Math.abs(v - 0.5) - (0.5 - rr));
  return Math.hypot(ax, ay) <= rr ? 1 : 0;
}
// leaf body: ellipse-ish rounded shape centered, radius ~0.30, taller
function leafMask(u, v) {
  const dx = (u - 0.5) / 0.30;
  const dy = (v - 0.5) / 0.34;
  return dx * dx + dy * dy <= 1 ? 1 : 0;
}
// Z bolt (the brand letter): a bold Z formed by two horizontal bars + diagonal
function zMask(u, v) {
  const x = u, y = v;
  const top = y > 0.36 && y < 0.43 && x > 0.36 && x < 0.64;
  const bot = y > 0.57 && y < 0.64 && x > 0.36 && x < 0.64;
  // diagonal from top-right to bottom-left
  const diagTop = 0.36 + (x - 0.36) * (0.57 - 0.36) / (0.64 - 0.36);
  const diagBot = 0.43 + (x - 0.36) * (0.64 - 0.43) / (0.64 - 0.36);
  const diag = y >= diagTop && y <= diagBot && x > 0.36 && x < 0.64;
  return top || bot || diag ? 1 : 0;
}

function render(size) {
  const SS = 3; // supersample
  const N = size * SS;
  const buf = Buffer.alloc(N * N * 4);
  for (let py = 0; py < N; py++) {
    for (let px = 0; px < N; px++) {
      // accumulate AA over subpixels
      let ar = 0, ag = 0, ab = 0, aa = 0;
      for (let sy = 0; sy < SS; sy++) {
        for (let sx = 0; sx < SS; sx++) {
          const fx = (px + (sx + 0.5) / SS) / size;
          const fy = (py + (sy + 0.5) / SS) / size;
          const onTile = tileMask(fx, fy, 0.226);
          if (!onTile) continue;
          let r, g, b, a;
          const onLeaf = leafMask(fx, fy);
          const onZ = onLeaf && zMask(fx, fy);
          if (onZ) {
            [r, g, b] = ORANGE; a = 1;
          } else if (onLeaf) {
            // leaf gradient white -> cream top to bottom
            const t = (fy - 0.16) / 0.68;
            const c = mix(WHITE, CREAM, Math.max(0, Math.min(1, t)));
            [r, g, b] = c; a = 1;
          } else {
            const c = gradBg(fx * size, fy * size, size);
            [r, g, b] = c; a = 1;
          }
          ar += r; ag += g; ab += b; aa += a;
        }
      }
      const i = (py * N + px) * 4;
      if (aa > 0) {
        buf[i] = ar / aa;
        buf[i + 1] = ag / aa;
        buf[i + 2] = ab / aa;
        buf[i + 3] = 255; // tile already clips outside
      } else {
        buf[i + 3] = 0;
      }
    }
  }
  return { buf, N };
}

function encodePNG(rgba, w, h) {
  // add filter byte per row
  const stride = w * 4;
  const raw = Buffer.alloc((stride + 1) * h);
  for (let y = 0; y < h; y++) {
    raw[y * (stride + 1)] = 0;
    rgba.copy(raw, y * (stride + 1) + 1, y * stride, y * stride + stride);
  }
  const compressed = zlib.deflateSync(raw, { level: 9 });

  function chunk(type, data) {
    const len = Buffer.alloc(4);
    len.writeUInt32BE(data.length, 0);
    const typeBuf = Buffer.from(type, "ascii");
    const crcBuf = Buffer.alloc(4);
    crcBuf.writeUInt32BE(crc32(Buffer.concat([typeBuf, data])) >>> 0, 0);
    return Buffer.concat([len, typeBuf, data, crcBuf]);
  }
  const sig = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(w, 0);
  ihdr.writeUInt32BE(h, 4);
  ihdr[8] = 8; // bit depth
  ihdr[9] = 6; // color type RGBA
  ihdr[10] = 0;
  ihdr[11] = 0;
  ihdr[12] = 0;
  return Buffer.concat([sig, chunk("IHDR", ihdr), chunk("IDAT", compressed), chunk("IEND", Buffer.alloc(0))]);
}

// CRC32
const crcTable = (() => {
  const t = new Uint32Array(256);
  for (let n = 0; n < 256; n++) {
    let c = n;
    for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
    t[n] = c >>> 0;
  }
  return t;
})();
function crc32(buf) {
  let c = 0xffffffff;
  for (let i = 0; i < buf.length; i++) c = crcTable[(c ^ buf[i]) & 0xff] ^ (c >>> 8);
  return (c ^ 0xffffffff) >>> 0;
}

function save(name, size) {
  const { buf, N } = render(size);
  const png = encodePNG(buf, size, size); // encode at logical size
  fs.writeFileSync(path.join(OUT, name), png);
  console.log("wrote", name, size + "px");
}

// Required sizes
const sizes = {
  "icon-1024.png": 1024, // source / store
  "icon-512.png": 512,
  "icon-192.png": 192, // PWA
  "icon-144.png": 144,
  "icon-96.png": 96,
  "icon-72.png": 72,
  "icon-48.png": 48,
  "favicon-32.png": 32, // browser tab
  "favicon-16.png": 16,
  "notification-96.png": 96, // notification (white bg variant below)
  "splash-1242.png": 1242,
  "splash-2048.png": 2048, // app store splash
};
for (const [n, s] of Object.entries(sizes)) save(n, s);

// Adaptive foreground (transparent bg) for Android adaptive icon
function renderForeground(size) {
  const SS = 3, N = size * SS;
  const buf = Buffer.alloc(N * N * 4);
  for (let py = 0; py < N; py++) {
    for (let px = 0; px < N; px++) {
      let ar = 0, ag = 0, ab = 0, aa = 0;
      for (let sy = 0; sy < SS; sy++) {
        for (let sx = 0; sx < SS; sx++) {
          const fx = (px + (sx + 0.5) / SS) / size;
          const fy = (py + (sy + 0.5) / SS) / size;
          const onLeaf = leafMask(fx, fy);
          const onZ = onLeaf && zMask(fx, fy);
          let r, g, b, a = 1;
          if (onZ) { [r, g, b] = ORANGE; }
          else if (onLeaf) {
            const t = (fy - 0.16) / 0.68;
            [r, g, b] = mix(WHITE, CREAM, Math.max(0, Math.min(1, t)));
          } else { continue; }
          ar += r; ag += g; ab += b; aa += a;
        }
      }
      const i = (py * N + px) * 4;
      if (aa > 0) {
        buf[i] = ar / aa; buf[i + 1] = ag / aa; buf[i + 2] = ab / aa; buf[i + 3] = 255;
      } else buf[i + 3] = 0;
    }
  }
  return buf;
}
function saveFG(name, size) {
  const buf = renderForeground(size);
  fs.writeFileSync(path.join(OUT, name), encodePNG(buf, size, size));
  console.log("wrote", name, size + "px (foreground)");
}
// Android adaptive foreground recommended 432px inside 1024 safe area; export 1024
saveFG("adaptive-foreground-1024.png", 1024);
saveFG("adaptive-foreground-432.png", 432);

// Monochrome white notification icon (Android status bar) - leaf only, white
function renderNotif(size) {
  const SS = 3, N = size * SS;
  const buf = Buffer.alloc(N * N * 4);
  for (let py = 0; py < N; py++) {
    for (let px = 0; px < N; px++) {
      let aa = 0;
      for (let sy = 0; sy < SS; sy++) {
        for (let sx = 0; sx < SS; sx++) {
          const fx = (px + (sx + 0.5) / SS) / size;
          const fy = (py + (sy + 0.5) / SS) / size;
          if (leafMask(fx, fy)) aa += 1;
        }
      }
      const i = (py * N + px) * 4;
      if (aa > 0) { buf[i] = 255; buf[i+1] = 255; buf[i+2] = 255; buf[i+3] = Math.min(255, (aa / (SS*SS)) * 255); }
      else buf[i+3] = 0;
    }
  }
  return buf;
}
fs.writeFileSync(path.join(OUT, "notification-white-96.png"), encodePNG(renderNotif(96), 96, 96));
console.log("wrote notification-white-96.png");

console.log("\nAll icons generated in", OUT);
