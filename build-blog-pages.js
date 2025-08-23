// Generates paginated blog pages from search.json
// Page 1 updates blog.html, Page 2+ → /blog/page/N/index.html

// Run in terminal: npm run build-blog

const fs = require("fs");
const path = require("path");

const POSTS_PER_PAGE = 6;
const searchJsonFile = path.join(__dirname, "search.json");
const outputDirBase = path.join(__dirname, "blog", "page"); // Page 2+ output
const blogHtmlFile = path.join(__dirname, "blog.html"); // Template for blog.html

// Load posts data
let posts = [];
try {
  const jsonData = fs.readFileSync(searchJsonFile, "utf8");
  posts = JSON.parse(jsonData);
} catch (err) {
  console.error("Error reading search.json:", err);
  process.exit(1);
}

// Sort posts by date descending
posts.sort((a, b) => new Date(b.date) - new Date(a.date));

const totalPages = Math.ceil(posts.length / POSTS_PER_PAGE);
console.log(`Total posts: ${posts.length}, Pages: ${totalPages}`);

// Read original blog.html as template
let blogTemplate = "";
try {
  blogTemplate = fs.readFileSync(blogHtmlFile, "utf8");
} catch (err) {
  console.error("Error reading blog.html:", err);
  process.exit(1);
}

// Helper: generate post tiles HTML
function generatePostTiles(postsSlice) {
  let html = "";
  for (const post of postsSlice) {
    const urlParts = post.url.split("/").filter(Boolean);
    const slug = urlParts[urlParts.length - 1];
    const categoryFolder =
      post.categories && post.categories[0] ? post.categories[0] : "general";

    const imageBase = `assets/img/optimized/blog/${categoryFolder}/${slug}-cover`;

    html += `
      <div class="box-item post-item">
        <div class="image">
          <a href="https://heleenevers.be${post.url}">
            <picture>
              <source srcset="${imageBase}-600.webp" type="image/webp" />
              <source srcset="${imageBase}-600.jpg" type="image/jpeg" />
              <img src="${imageBase}-600.jpg" alt="${post.title}" />
            </picture>
            <span class="info"><i class="ri-book-open-line"></i></span>
          </a>
        </div>
        <div class="desc">
          <div class="date">${new Date(post.date).toLocaleDateString("en-GB", {
            day: "numeric",
            month: "long",
            year: "numeric",
          })}</div>
          <a href="https://heleenevers.be${post.url}" class="name">${
      post.title
    }</a>
        </div>
      </div>
    `;
  }
  return html;
}

// Helper: generate pagination HTML with ellipsis after 9 numbers
function generatePaginationHTML(currentPage) {
  if (totalPages <= 1) return "";

  let html = '<nav class="pagination">';

  // Previous button
  if (currentPage > 1) {
    html += `<a href="${
      currentPage - 1 === 1 ? "/blog.html" : `/blog/page/${currentPage - 1}/`
    }" class="prev">Previous</a>`;
  }

  const visiblePages = 9; // max page links before ellipsis
  const half = Math.floor(visiblePages / 2);

  let start = Math.max(1, currentPage - half);
  let end = Math.min(totalPages, currentPage + half);

  // Adjust if we’re near the beginning or end
  if (currentPage <= half) {
    start = 1;
    end = Math.min(totalPages, visiblePages);
  } else if (currentPage + half >= totalPages) {
    end = totalPages;
    start = Math.max(1, totalPages - visiblePages + 1);
  }

  // Always show first page
  if (start > 1) {
    html += `<a href="/blog.html">1</a>`;
    if (start > 2) html += `<span class="dots">...</span>`;
  }

  // Page numbers
  for (let p = start; p <= end; p++) {
    const href = p === 1 ? "/blog.html" : `/blog/page/${p}/`;
    html += `<a href="${href}" ${
      p === currentPage ? 'class="active"' : ""
    }>${p}</a>`;
  }

  // Always show last page
  if (end < totalPages) {
    if (end < totalPages - 1) html += `<span class="dots">...</span>`;
    html += `<a href="/blog/page/${totalPages}/">${totalPages}</a>`;
  }

  // Next button
  if (currentPage < totalPages) {
    html += `<a href="/blog/page/${currentPage + 1}/" class="next">Next</a>`;
  }

  html += "</nav>";
  return html;
}

// Generate pages
for (let page = 1; page <= totalPages; page++) {
  const pagePosts = posts.slice(
    (page - 1) * POSTS_PER_PAGE,
    page * POSTS_PER_PAGE
  );

  const tilesHTML = generatePostTiles(pagePosts);
  const paginationHTML = generatePaginationHTML(page);

  // Replace content in template
  // Note: only replacing the post-items container
  const pageHTML = blogTemplate.replace(
    /<!-- BLOG_POSTS_START -->[\s\S]*?<!-- BLOG_POSTS_END -->/,
    `<!-- BLOG_POSTS_START -->\n<div class="box-items post-items">\n${tilesHTML}\n${paginationHTML}\n</div>\n<!-- BLOG_POSTS_END -->`
  );

  if (page === 1) {
    // Overwrite blog.html
    fs.writeFileSync(blogHtmlFile, pageHTML);
    console.log(`Page 1 updated: blog.html`);
  } else {
    // Create /blog/page/N/index.html
    const pageDir = path.join(outputDirBase, page.toString());
    fs.mkdirSync(pageDir, { recursive: true });
    fs.writeFileSync(path.join(pageDir, "index.html"), pageHTML);
    console.log(`Page ${page} written to ${pageDir}/index.html`);
  }
}

console.log("All blog pages built successfully.");
