import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import sharp from "sharp";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const publicDir = join(root, "public");

const iconSvg = readFileSync(join(publicDir, "icon.svg"));
const ogSvg = readFileSync(join(publicDir, "og.svg"));

await sharp(iconSvg).png().toFile(join(publicDir, "icon.png"));
await sharp(iconSvg).resize(512, 512).png().toFile(join(publicDir, "splash.png"));
await sharp(ogSvg).png().toFile(join(publicDir, "image.png"));
await sharp(ogSvg).png().toFile(join(publicDir, "app-thumbnail.png"));
await sharp(iconSvg).resize(180, 180).png().toFile(join(publicDir, "apple-touch-icon.png"));

console.log(
  "Generated icon.png, splash.png, image.png, app-thumbnail.png, apple-touch-icon.png",
);
