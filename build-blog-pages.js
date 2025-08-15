// Run in terminal: node build-blog-pages.js

const fs = require("fs");
const path = require("path");

const POSTS_PER_PAGE = 6;
const searchJsonFile = path.join(__dirname, "search.json");
const outputDirBase = path.join(__dirname, "blog", "page"); // Output folder for pages

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

for (let page = 1; page <= totalPages; page++) {
  // Slice posts for the current page
  const pagePosts = posts.slice(
    (page - 1) * POSTS_PER_PAGE,
    page * POSTS_PER_PAGE
  );

  // Build HTML
  let html = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8" />
      <title>Blog – Page ${page}</title>
      <meta name="description" content="Blog posts – page ${page} of ${totalPages}" />
      <link rel="canonical" href="https://heleenevers.be/blog/page/${page}/" />
      <link rel="stylesheet" href="/assets/css/style.css" />
    </head>
    <body>
      <h1>Blog – Page ${page}</h1>
      <div class="blog-tiles">
  `;

  for (const post of pagePosts) {
    html += `
      <article class="blog-tile">
        <a href="https://heleenevers.be${post.url}">
          <h2>${post.title}</h2>
          <time datetime="${post.date}">${post.date}</time>
          <p>${post.content}</p>
        </a>
      </article>
    `;
  }

  // Pagination links
  html += `<nav class="pagination">`;
  if (page > 1) {
    html += `<a href="/blog/page/${page - 1}/" class="prev">Previous</a>`;
  }
  for (let p = 1; p <= totalPages; p++) {
    html += `<a href="/blog/page/${p}/" ${
      p === page ? 'class="active"' : ""
    }>${p}</a>`;
  }
  if (page < totalPages) {
    html += `<a href="/blog/page/${page + 1}/" class="next">Next</a>`;
  }
  html += `</nav>`;

  html += `
      </div>
    </body>
    </html>
  `;

  // Write to disk
  const pageDir = path.join(outputDirBase, page.toString());
  fs.mkdirSync(pageDir, { recursive: true });
  fs.writeFileSync(path.join(pageDir, "index.html"), html);
  console.log(`Page ${page} written to ${pageDir}/index.html`);
}
