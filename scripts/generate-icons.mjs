// Generates solid-color PNG icons for the PWA manifest
// Usage: node scripts/generate-icons.mjs

import { deflateSync } from "zlib";
import { writeFileSync, mkdirSync } from "fs";

function crc32(buf) {
  let c = 0xffffffff;
  for (const b of buf) {
    c ^= b;
    for (let i = 0; i < 8; i++) c = c & 1 ? (c >>> 1) ^ 0xedb88320 : c >>> 1;
  }
  return (c ^ 0xffffffff) >>> 0;
}

function chunk(type, data) {
  const t = Buffer.from(type);
  const len = Buffer.alloc(4);
  len.writeUInt32BE(data.length);
  const crcBuf = Buffer.alloc(4);
  crcBuf.writeUInt32BE(crc32(Buffer.concat([t, data])));
  return Buffer.concat([len, t, data, crcBuf]);
}

function makePNG(size, r, g, b) {
  const sig = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);

  const ihdrData = Buffer.alloc(13);
  ihdrData.writeUInt32BE(size, 0);
  ihdrData.writeUInt32BE(size, 4);
  ihdrData[8] = 8; // bit depth
  ihdrData[9] = 2; // RGB

  // Raw scanlines: filter byte (0) + RGB pixels
  const raw = Buffer.alloc(size * (1 + size * 3));
  for (let y = 0; y < size; y++) {
    const row = y * (1 + size * 3);
    raw[row] = 0; // filter None
    for (let x = 0; x < size; x++) {
      const px = row + 1 + x * 3;
      raw[px] = r;
      raw[px + 1] = g;
      raw[px + 2] = b;
    }
  }

  return Buffer.concat([
    sig,
    chunk("IHDR", ihdrData),
    chunk("IDAT", deflateSync(raw)),
    chunk("IEND", Buffer.alloc(0)),
  ]);
}

mkdirSync("public/icons", { recursive: true });

// Primary pink: #e03e6b → rgb(224, 62, 107)
const [r, g, b] = [224, 62, 107];

writeFileSync("public/icons/icon-192.png", makePNG(192, r, g, b));
writeFileSync("public/icons/icon-512.png", makePNG(512, r, g, b));
writeFileSync("public/icons/icon-512-maskable.png", makePNG(512, r, g, b));

console.log("✓ Generated public/icons/icon-192.png");
console.log("✓ Generated public/icons/icon-512.png");
console.log("✓ Generated public/icons/icon-512-maskable.png");
