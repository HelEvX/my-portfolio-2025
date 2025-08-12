#!/usr/bin/env node
// add-post.js - Append a blog post entry to search.json with optional auto-summary + auto URL
// run in terminal with `node add-post.js`

const fs = require("fs");
const path = require("path");
const readline = require("readline");

const filePath = path.join(__dirname, "search.json");
const blogFolder = path.join(__dirname, "posts"); // change this to your blog posts folder

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
    .replace(/[#*_`>~\-]+/g, "")
    .replace(/\[([^\]]+)\]\([^)]+\)/g, "$1")
    .replace(/\s+/g, " ")
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

// Extract Category from HTML file path
function extractCategoryFromHtml(html) {
  const match = html.match(
    /<div class="cat-links">[\s\S]*?<a [^>]*>([^<]+)<\/a>/i
  );
  return match ? match[1].trim().toLowerCase() : null;
}

// Generate pretty URL like /category/yyyy/mm/dd/slug/
function createPrettyUrl(category, filePath) {
  const slug = path
    .basename(filePath, path.extname(filePath))
    .replace(/\s+/g, "-")
    .toLowerCase();

  const date = new Date(fs.statSync(filePath).mtime);
  const yyyy = date.getFullYear();
  const mm = String(date.getMonth() + 1).padStart(2, "0");
  const dd = String(date.getDate()).padStart(2, "0");

  return `/${category}/${yyyy}/${mm}/${dd}/${slug}/`;
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
    let categories = [];

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

      // Ask for category so we can build pretty URL
      const catInput = await ask(
        "Category (single word, e.g. design, music, blog): "
      );
      categories.push(catInput.toLowerCase() || "blog");

      // Auto-generate pretty URL
      url = createPrettyUrl(categories[0], postFilePath);
      console.log(`🔗 Auto-generated pretty URL: ${url}`);
    } else {
      // Manual mode
      content = await ask("Short summary (1–3 sentences): ");
      const catInput = await ask(
        "Category (single word, e.g. design, music, blog): "
      );
      categories.push(catInput.toLowerCase() || "blog");
      url = await ask("URL (relative, e.g. /design/2025/08/12/my-post/): ");
    }

    const tagsInput = await ask("Tags (comma-separated, optional): ");
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
