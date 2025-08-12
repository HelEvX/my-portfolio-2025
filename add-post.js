#!/usr/bin/env node
// add-post.js - Append a blog post entry to search.json with optional auto-summary + auto URL

const fs = require("fs");
const path = require("path");
const readline = require("readline");

const filePath = path.join(__dirname, "search.json");
const blogFolder = path.join(__dirname, "posts"); // change this to your blog posts folder
const blogUrlBase = "/blog/"; // change this if your blog URLs are different

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

function ask(question) {
  return new Promise((resolve) =>
    rl.question(question, (answer) => resolve(answer.trim()))
  );
}

// Remove HTML tags and extra whitespace
function stripHtml(html) {
  return html
    .replace(/<[^>]*>/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

// Basic Markdown strip (optional, quick cleanup)
function stripMarkdown(md) {
  return md
    .replace(/[#*_`>~\-]+/g, "") // remove markdown symbols
    .replace(/\[([^\]]+)\]\([^)]+\)/g, "$1") // links
    .replace(/\s+/g, " ") // collapse spaces
    .trim();
}

// Extract first N sentences from text
function getFirstSentences(text, count = 3) {
  const sentences = text.split(/(?<=[.!?])\s+/);
  return sentences.slice(0, count).join(" ");
}

// Find the newest file in blogFolder
function getNewestPostFile() {
  if (!fs.existsSync(blogFolder)) return null;
  const files = fs
    .readdirSync(blogFolder)
    .filter((file) => file.endsWith(".html") || file.endsWith(".md"))
    .map((file) => ({
      name: file,
      time: fs.statSync(path.join(blogFolder, file)).mtime.getTime(),
    }))
    .sort((a, b) => b.time - a.time);

  return files.length > 0 ? path.join(blogFolder, files[0].name) : null;
}

// Convert filename to URL slug
function filenameToUrl(filePath) {
  const baseName = path.basename(filePath, path.extname(filePath));
  return `${blogUrlBase}${baseName.replace(/\s+/g, "-").toLowerCase()}/`;
}

(async function () {
  try {
    // Load existing data
    let data = [];
    if (fs.existsSync(filePath)) {
      const fileContent = fs.readFileSync(filePath, "utf8");
      try {
        data = JSON.parse(fileContent);
        if (!Array.isArray(data))
          throw new Error("search.json is not an array");
      } catch (err) {
        console.error("❌ Error parsing search.json:", err.message);
        process.exit(1);
      }
    }

    console.log("=== Add New Blog Post to search.json ===");

    const title = await ask("Post title: ");

    // Try auto-detect newest post file
    let postFilePath = getNewestPostFile();
    if (postFilePath) {
      const confirm = await ask(
        `Use newest file "${path.basename(postFilePath)}"? (Y/n): `
      );
      if (confirm.toLowerCase() === "n") {
        const manualPath = await ask(
          "Path to HTML or Markdown file (leave blank to type summary manually): "
        );
        postFilePath = manualPath ? path.resolve(manualPath) : null;
      }
    } else {
      console.log("⚠ No post files found in 'posts' folder.");
      const manualPath = await ask(
        "Path to HTML or Markdown file (leave blank to type summary manually): "
      );
      postFilePath = manualPath ? path.resolve(manualPath) : null;
    }

    let content = "";
    let url = "";
    if (postFilePath && fs.existsSync(postFilePath)) {
      // Auto-generate content
      let raw = fs.readFileSync(postFilePath, "utf8");
      if (postFilePath.endsWith(".html")) {
        raw = stripHtml(raw);
      } else if (postFilePath.endsWith(".md")) {
        raw = stripMarkdown(raw);
      }
      content = getFirstSentences(raw, 3);
      console.log(`📄 Auto-generated summary: ${content}`);

      // Auto-generate URL
      url = filenameToUrl(postFilePath);
      console.log(`🔗 Auto-generated URL: ${url}`);
    } else {
      // Manual mode
      content = await ask("Short summary (1–3 sentences): ");
      url = await ask("URL (relative, e.g. /blog/my-post/): ");
    }

    const categoriesInput = await ask(
      "Categories (comma-separated, optional): "
    );
    const tagsInput = await ask("Tags (comma-separated, optional): ");

    const categories = categoriesInput
      ? categoriesInput
          .split(",")
          .map((c) => c.trim())
          .filter(Boolean)
      : [];
    const tags = tagsInput
      ? tagsInput
          .split(",")
          .map((t) => t.trim())
          .filter(Boolean)
      : [];

    const newPost = {
      title,
      content,
      url,
      categories,
      tags,
    };

    data.push(newPost);

    fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
    console.log(`✅ Added post "${title}" to search.json`);
  } catch (err) {
    console.error("❌ Error:", err.message);
  } finally {
    rl.close();
  }
})();
