import { mkdirSync, readdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import sharp from "sharp";

/** Base App store requirement */
const TARGET_WIDTH = 1284;
const TARGET_HEIGHT = 2778;

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const sourceDir = join(root, "assets", "screenshots-source");
const outDir = join(root, "public", "screenshots");

mkdirSync(outDir, { recursive: true });

const sources = readdirSync(sourceDir)
  .filter((name) => /\.(png|jpe?g|webp)$/i.test(name))
  .sort();

if (sources.length === 0) {
  console.error(`No images in ${sourceDir}`);
  process.exit(1);
}

for (const [index, name] of sources.entries()) {
  const input = join(sourceDir, name);
  const output = join(outDir, `${String(index + 1).padStart(2, "0")}.png`);

  await sharp(input)
    .resize(TARGET_WIDTH, TARGET_HEIGHT, {
      fit: "fill",
    })
    .png({ compressionLevel: 9 })
    .toFile(output);

  const meta = await sharp(output).metadata();
  console.log(`${output} → ${meta.width}×${meta.height}`);
}

console.log(`Done. ${sources.length} screenshot(s) in ${outDir}`);
