// Run in Terminal:
//   npm run images → everything in assets/img/ (except optimized)
//   npm run images -- blog → just that folder
//   npm run images -- blog/image.jpg → just that one image

// Recursively processes images in assets/img/blog and assets/img/works
// Generate multiple resized JPEG + WebP versions at 600px and 1200px widths from one master image
// Saves them in a parallel /optimized/ folder

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

// Check if all output files already exist
function outputsExist(outputBasePath) {
  for (const size of sizes) {
    const jpgPath = `${outputBasePath}-${size}.jpg`;
    const webpPath = `${outputBasePath}-${size}.webp`;
    if (!fs.existsSync(jpgPath) || !fs.existsSync(webpPath)) {
      return false; // something is missing
    }
  }
  return true;
}

// Convert single image to multiple sizes and formats
async function processImage(inputPath, outputBasePath) {
  if (outputsExist(outputBasePath)) {
    console.log(`Skipping ${inputPath} (already optimized)`);
    return;
  }

  for (const size of sizes) {
    const jpegOutput = `${outputBasePath}-${size}.jpg`;
    await sharp(inputPath)
      .resize({ width: size, withoutEnlargement: true })
      .jpeg({ quality: 80 })
      .toFile(jpegOutput);
    console.log(`Created ${jpegOutput}`);

    const webpOutput = `${outputBasePath}-${size}.webp`;
    await sharp(inputPath)
      .resize({ width: size, withoutEnlargement: true })
      .webp({ quality: 80 })
      .toFile(webpOutput);
    console.log(`Created ${webpOutput}`);
  }
}

// Recursively process a folder
async function processFolder(folderPath, relativePath = "") {
  const fullPath = path.join(folderPath, relativePath);
  const entries = fs.readdirSync(fullPath, { withFileTypes: true });

  for (const entry of entries) {
    if (entry.isDirectory()) {
      if (entry.name === optimizedFolderName) continue; // skip optimized folders
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

// CLI entry point
(async () => {
  const args = process.argv.slice(2); // optional folder/file argument
  const targetArg = args[0]; // e.g., works/subfolder-1 or works/subfolder-1/photo.jpg

  if (targetArg) {
    const fullTargetPath = path.join(baseFolder, targetArg);

    if (!fs.existsSync(fullTargetPath)) {
      console.error(`Target not found: ${fullTargetPath}`);
      process.exit(1);
    }

    const stats = fs.statSync(fullTargetPath);
    if (stats.isDirectory()) {
      await processFolder(baseFolder, targetArg);
    } else {
      const relativePath = path.dirname(targetArg);
      const destFolder = path.join(
        baseFolder,
        optimizedFolderName,
        relativePath
      );
      ensureFolderExists(destFolder);

      const baseName = path.parse(fullTargetPath).name;
      const outputBasePath = path.join(destFolder, baseName);
      await processImage(fullTargetPath, outputBasePath);
    }
  } else {
    // No argument: process all "blog" and "works" folders
    for (const folder of folders) {
      await processFolder(path.join(baseFolder, folder));
    }
  }

  console.log("All images processed successfully.");
})();
