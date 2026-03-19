import sharp from "sharp";
import fs from "fs";
import path from "path";

const svgPath = "./logo.svg";
const outDir  = "./public/icons";

fs.mkdirSync(outDir, { recursive: true });

const svgBuffer = fs.readFileSync(svgPath);

const sizes = [
  { name: "icon-192.png",           size: 192 },
  { name: "icon-512.png",           size: 512 },
  { name: "icon-512-maskable.png",  size: 512 },   // maskable: logo fills safe zone already
  { name: "apple-touch-icon.png",   size: 180 },
  { name: "favicon-32.png",         size: 32  },
  { name: "favicon-16.png",         size: 16  },
];

for (const { name, size } of sizes) {
  const outPath = path.join(outDir, name);
  await sharp(svgBuffer)
    .resize(size, size)
    .png()
    .toFile(outPath);
  console.log(`✓ ${name} (${size}x${size})`);
}

// Also write favicon.ico equivalent as 32px PNG for index.html
fs.copyFileSync(path.join(outDir, "favicon-32.png"), "./public/favicon.png");
console.log("✓ public/favicon.png");
