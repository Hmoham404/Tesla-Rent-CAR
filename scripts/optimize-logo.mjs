import sharp from "sharp";
const input =
  process.argv[2] || "public/2204e69a-ae19-472e-9649-47fb21a955d8.png";
await sharp(input)
  .resize({ width: 720, withoutEnlargement: true })
  .webp({ quality: 88 })
  .toFile("public/logo.webp");
console.log("public/logo.webp updated; original file preserved.");
