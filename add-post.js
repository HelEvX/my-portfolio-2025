#!/usr/bin/env node
// Append a blog post entry to search.json with optional auto-summary + auto URL
// run in terminal with `node add-post.js`

const fs = require("fs");
const path = require("path");
const readline = require("readline");
const jsdom = require("jsdom");
const { JSDOM } = jsdom;

const filePath = path.join(__dirname, "search.json");
const blogFolder = path.join(__dirname, "posts"); // blog posts folder

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

// Extract first N sentences from text
function getFirstSentences(text, count = 3) {
  const sentences = text.split(/(?<=[.!?])\s+/);
  return sentences.slice(0, count).join(" ");
}

// Generate pretty URL like /category/yyyy/mm/dd/slug/
function createPrettyUrl(category, dateStr, filePath) {
  const slug = path
    .basename(filePath, path.extname(filePath))
    .replace(/\s+/g, "-")
    .toLowerCase();

  const date = new Date(dateStr);
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

    // Auto-detect newest file
    let postFilePath = null;
    if (fs.existsSync(blogFolder)) {
      const files = fs
        .readdirSync(blogFolder)
        .filter((file) => file.endsWith(".html") || file.endsWith(".md"))
        .map((file) => ({
          name: file,
          time: fs.statSync(path.join(blogFolder, file)).mtime.getTime(),
        }))
        .sort((a, b) => b.time - a.time);
      postFilePath =
        files.length > 0 ? path.join(blogFolder, files[0].name) : null;
    }

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
      const manualPath = await ask(
        "Path to HTML or Markdown file (leave blank to type summary manually): "
      );
      postFilePath = manualPath ? path.resolve(manualPath) : null;
    }

    // Ask category first
    const catInput = await ask(
      "Category (single word, e.g. general, hobby, work, school): "
    );
    const categories = catInput ? [catInput.toLowerCase()] : ["blog"];

    // Ask date next
    const dateInput = await ask(
      "Enter date (YYYY-MM-DD) or leave blank for today: "
    );
    const dateStr = dateInput || new Date().toISOString().split("T")[0];

    // Ask if summary should be auto-generated
    let content = "";
    const autoSummary = await ask(
      "Auto-generate summary from post-summary? (Y/n): "
    );
    if (
      autoSummary.toLowerCase() === "y" &&
      postFilePath &&
      fs.existsSync(postFilePath)
    ) {
      const raw = fs.readFileSync(postFilePath, "utf8");
      if (postFilePath.endsWith(".html")) {
        const dom = new JSDOM(raw);
        const summaryElem = dom.window.document.querySelector("#post-summary");
        if (summaryElem) {
          content = summaryElem.textContent.trim();
        } else {
          content = stripHtml(raw);
          content = getFirstSentences(content, 3);
        }
      } else if (postFilePath.endsWith(".md")) {
        content = getFirstSentences(
          stripHtml(fs.readFileSync(postFilePath, "utf8")),
          3
        );
      }
      console.log(`📄 Auto-generated summary: ${content}`);
    } else {
      content = await ask("Short summary (1–3 sentences): ");
    }

    // Generate URL automatically
    let url = postFilePath
      ? createPrettyUrl(categories[0], dateStr, postFilePath)
      : "";
    console.log(`🔗 Auto-generated pretty URL: ${url}`);

    // Ask tags
    const tagsInput = await ask("Tags (comma-separated, optional): ");
    const tags = tagsInput
      ? tagsInput
          .split(",")
          .map((t) => t.trim().toLowerCase())
          .filter(Boolean)
      : [];

    // Assemble post object
    const newPost = {
      title,
      content,
      url,
      categories,
      tags,
      date: dateStr,
    };

    // Update or add
    const existingIndex = data.findIndex((item) => item.url === newPost.url);
    if (existingIndex !== -1) {
      data[existingIndex] = newPost;
      console.log(`🔄 Updated existing post: "${title}"`);
    } else {
      data.push(newPost);
      console.log(`✅ Added new post: "${title}"`);
    }

    // Write updated JSON
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
  } catch (err) {
    console.error("❌ Error:", err.message);
  } finally {
    rl.close();
  }
})();
