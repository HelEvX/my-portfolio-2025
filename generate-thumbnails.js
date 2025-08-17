// Run in Terminal: node generate-thumbnails.js

// Processes both /assets/img/blog and /assets/img/works
// Creates a /thumbnails/ folder inside each (if missing)
// Converts all .jpg, .jpeg, .png, .gif images to JPG thumbnails of max 500px on the longest side, preserving aspect ratio
// Uses medium-quality JPG (quality 60) to reduce file size but keep decent visuals
// Skips any files inside the thumbnails folder to avoid recursion

const sharp = require("sharp");
const fs = require("fs");
const path = require("path");

// Base folder where your images sit
const baseFolder = path.join(__dirname, "assets/img");

// Folders to process
const folders = ["blog", "works"];

// Destination thumbnail folder name inside each folder
const thumbnailFolderName = "thumbnails";

// Ensure thumbnail folder exists, create if missing
function ensureFolderExists(folder) {
  if (!fs.existsSync(folder)) fs.mkdirSync(folder, { recursive: true });
}

// Process images for a specific folder
function processFolder(folderPath, relativePath = "") {
  const fullPath = path.join(folderPath, relativePath);
  const entries = fs.readdirSync(fullPath, { withFileTypes: true });

  entries.forEach((entry) => {
    if (entry.isDirectory()) {
      // Recurse into subdirectory
      processFolder(folderPath, path.join(relativePath, entry.name));
    } else {
      const ext = path.extname(entry.name).toLowerCase();
      if ([".jpg", ".jpeg", ".png", ".gif"].includes(ext)) {
        const inputPath = path.join(folderPath, relativePath, entry.name);
        const destFolder = path.join(
          folderPath,
          thumbnailFolderName,
          relativePath
        );
        ensureFolderExists(destFolder);

        const baseName = path.parse(entry.name).name;
        const outputPath = path.join(destFolder, baseName + ".jpg");

        sharp(inputPath)
          .metadata()
          .then((metadata) => {
            const isLandscape = metadata.width >= metadata.height;
            const resizeOptions = isLandscape
              ? { height: 500, withoutEnlargement: true, fit: "inside" }
              : { width: 500, withoutEnlargement: true, fit: "inside" };

            return sharp(inputPath)
              .resize(resizeOptions)
              .jpeg({ quality: 60 })
              .toFile(outputPath)
              .then(() => console.log(`Thumbnail generated: ${outputPath}`));
          })
          .catch((err) =>
            console.error(`Error processing ${inputPath}: ${err}`)
          );
      }
    }
  });
}

// Loop through each folder
folders.forEach((folder) => processFolder(path.join(baseFolder, folder)));
