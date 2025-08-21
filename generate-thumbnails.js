// Run in Terminal: node generate-thumbnails.js

// Recursively processes images in assets/img/blog and assets/img/works
// Generate multiple resized JPEG + WebP versions at 600px and 1200px widths from one master image
// Saves them in a parallel /optimized/ folder within each original folder

const sharp = require("sharp");
const fs = require("fs");
const path = require("path");

const baseFolder = path.join(__dirname, "assets/img");
const folders = ["blog", "works"];
const optimizedFolderName = "optimized";

// Target widths for output
const sizes = [600, 1200];

// Ensure folder exists
function ensureFolderExists(folder) {
  if (!fs.existsSync(folder)) fs.mkdirSync(folder, { recursive: true });
}

// Convert single image to multiple sizes and formats
async function processImage(inputPath, outputBasePath) {
  for (const size of sizes) {
    // JPEG output
    const jpegOutput = `${outputBasePath}-${size}.jpg`;
    await sharp(inputPath)
      .resize({ width: size, withoutEnlargement: true })
      .jpeg({ quality: 80 })
      .toFile(jpegOutput);
    console.log(`Created ${jpegOutput}`);

    // WebP output
    const webpOutput = `${outputBasePath}-${size}.webp`;
    await sharp(inputPath)
      .resize({ width: size, withoutEnlargement: true })
      .webp({ quality: 80 })
      .toFile(webpOutput);
    console.log(`Created ${webpOutput}`);
  }
}

// Process folders recursively
async function processFolder(folderPath, relativePath = "") {
  const fullPath = path.join(folderPath, relativePath);
  const entries = fs.readdirSync(fullPath, { withFileTypes: true });

  for (const entry of entries) {
    if (entry.isDirectory()) {
      await processFolder(folderPath, path.join(relativePath, entry.name));
    } else {
      const ext = path.extname(entry.name).toLowerCase();
      if ([".jpg", ".jpeg", ".png"].includes(ext)) {
        const inputPath = path.join(folderPath, relativePath, entry.name);
        const destFolder = path.join(
          folderPath,
          optimizedFolderName,
          relativePath
        );
        ensureFolderExists(destFolder);

        const baseName = path.parse(entry.name).name;
        const outputBasePath = path.join(destFolder, baseName);

        try {
          await processImage(inputPath, outputBasePath);
        } catch (err) {
          console.error(`Error processing ${inputPath}: ${err}`);
        }
      }
    }
  }
}

(async () => {
  for (const folder of folders) {
    await processFolder(path.join(baseFolder, folder));
  }
  console.log("All images processed successfully.");
})();
