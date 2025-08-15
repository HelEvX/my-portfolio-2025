// Run the script after your posts are ready and search.json is updated: node add-prev-next-nav.js

const fs = require("fs");
const path = require("path");
const jsdom = require("jsdom");
const { JSDOM } = jsdom;

// Paths - adjust if needed
const searchJsonPath = path.join(__dirname, "search.json");
const postsDir = path.join(__dirname, "posts"); // Folder containing your blog post HTML files

// Helper function: Extract filename from URL slug
function extractFilenameFromUrl(url) {
  if (url.endsWith("/")) url = url.slice(0, -1);
  const slug = url.substring(url.lastIndexOf("/") + 1);
  return slug + ".html"; // Adjust extension if needed
}

async function main() {
  // Load and parse posts metadata
  let posts;
  try {
    const data = fs.readFileSync(searchJsonPath, "utf8");
    posts = JSON.parse(data);
  } catch (err) {
    console.error("Error reading search.json:", err);
    process.exit(1);
  }

  // Sort posts by descending date (newest first)
  posts.sort((a, b) => new Date(b.date) - new Date(a.date));

  for (let i = 0; i < posts.length; i++) {
    const post = posts[i];
    const previous = i > 0 ? posts[i - 1] : null;
    const next = i < posts.length - 1 ? posts[i + 1] : null;

    const filename = extractFilenameFromUrl(post.url);
    const postPath = path.join(postsDir, filename);

    if (!fs.existsSync(postPath)) {
      console.warn(`Warning: Post HTML file not found: ${postPath}, skipping.`);
      continue;
    }

    // Parse post HTML
    const html = fs.readFileSync(postPath, "utf8");
    const dom = new JSDOM(html);
    const document = dom.window.document;

    // Find or create navigation container
    let nav = document.querySelector("#post-navigation-placeholder");

    if (!nav) {
      nav = document.createElement("nav");
      nav.id = "post-navigation-placeholder";
      nav.className = "navigation post-navigation";
      document.body.appendChild(nav);
    } else {
      // Add missing class if needed
      if (!nav.classList.contains("post-navigation")) {
        nav.classList.add("post-navigation");
      }
    }
    // Build navigation HTML with Prev/Next links
    nav.innerHTML = `
        <div class="nav-links">
            <div class="nav-previous">
            ${
              previous
                ? `<a href="${previous.url}" title="${escapeHtml(
                    previous.title
                  )}">
                    <i class="ri-arrow-left-s-line" aria-hidden="true"></i>
                    <span class="post-nav-prev post-nav-text">Prev</span>
                    </a>`
                : `<span class="disabled post-nav-prev post-nav-text">
                    <i class="ri-arrow-left-s-line" aria-hidden="true"></i>
                    Prev
                    </span>`
            }
            </div>
            <div class="nav-next">
            ${
              next
                ? `<a href="${next.url}" title="${escapeHtml(next.title)}">
                    <span class="post-nav-next post-nav-text">Next</span>
                    <i class="ri-arrow-right-s-line" aria-hidden="true"></i>
                    </a>`
                : `<span class="disabled post-nav-next post-nav-text">
                    Next
                    <i class="ri-arrow-right-s-line" aria-hidden="true"></i>
                    </span>`
            }
            </div>
        </div>
        `;

    // Write updated HTML back to file
    fs.writeFileSync(postPath, dom.serialize(), "utf8");
    console.log(`Updated navigation for: ${filename}`);
  }
}

// Utility to escape HTML special characters in titles
function escapeHtml(text) {
  return text.replace(/[&<>"']/g, (match) => {
    const escapeMap = {
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      '"': "&quot;",
      "'": "&#39;",
    };
    return escapeMap[match];
  });
}

main().catch((err) => {
  console.error("Unexpected error:", err);
});
