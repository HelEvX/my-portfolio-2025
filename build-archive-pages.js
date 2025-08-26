// Generates archive pages for tags and categories from search.json
// Creates /tags/TAG_NAME/index.html and /categories/CATEGORY_NAME/index.html

// Run in terminal: npm run build-archives

const fs = require("fs");
const path = require("path");

const POSTS_PER_PAGE = 6;
const searchJsonFile = path.join(__dirname, "search.json");
const tagsOutputDir = path.join(__dirname, "tags");
const categoriesOutputDir = path.join(__dirname, "categories");
const blogHtmlFile = path.join(__dirname, "blog.html"); // Template

// Load posts data
let posts = [];
try {
  const jsonData = fs.readFileSync(searchJsonFile, "utf8");
  posts = JSON.parse(jsonData);
} catch (err) {
  console.error("Error reading search.json:", err);
  process.exit(1);
}

// Read blog.html template
let blogTemplate = "";
try {
  blogTemplate = fs.readFileSync(blogHtmlFile, "utf8");
} catch (err) {
  console.error("Error reading blog.html:", err);
  process.exit(1);
}

// Helper: slugify strings for URLs
function slugify(text) {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, "") // Remove special characters
    .replace(/[\s_-]+/g, "-") // Replace spaces and underscores with hyphens
    .replace(/^-+|-+$/g, ""); // Remove leading/trailing hyphens
}

// Helper: generate post tiles HTML
function generatePostTiles(postsSlice) {
  let html = "";
  for (const post of postsSlice) {
    const urlParts = post.url.split("/").filter(Boolean);
    const slug = urlParts[urlParts.length - 1];
    const categoryFolder =
      post.categories && post.categories[0] ? post.categories[0] : "general";

    const imageBase = `../../../assets/img/optimized/blog/${categoryFolder}/${slug}-cover`;

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

// Helper: generate pagination HTML
function generatePaginationHTML(currentPage, totalPages, baseUrl) {
  if (totalPages <= 1) return "";

  let html = '<nav class="pagination">';

  // Previous button
  if (currentPage > 1) {
    const prevUrl =
      currentPage - 1 === 1 ? baseUrl : `${baseUrl}page/${currentPage - 1}/`;
    html += `<a href="${prevUrl}" class="prev">Previous</a>`;
  }

  const visiblePages = 9;
  const half = Math.floor(visiblePages / 2);

  let start = Math.max(1, currentPage - half);
  let end = Math.min(totalPages, currentPage + half);

  if (currentPage <= half) {
    start = 1;
    end = Math.min(totalPages, visiblePages);
  } else if (currentPage + half >= totalPages) {
    end = totalPages;
    start = Math.max(1, totalPages - visiblePages + 1);
  }

  // Always show first page
  if (start > 1) {
    html += `<a href="${baseUrl}">1</a>`;
    if (start > 2) html += `<span class="dots">...</span>`;
  }

  // Page numbers
  for (let p = start; p <= end; p++) {
    const href = p === 1 ? baseUrl : `${baseUrl}page/${p}/`;
    html += `<a href="${href}" ${
      p === currentPage ? 'class="active"' : ""
    }>${p}</a>`;
  }

  // Always show last page
  if (end < totalPages) {
    if (end < totalPages - 1) html += `<span class="dots">...</span>`;
    html += `<a href="${baseUrl}page/${totalPages}/">${totalPages}</a>`;
  }

  // Next button
  if (currentPage < totalPages) {
    html += `<a href="${baseUrl}page/${
      currentPage + 1
    }/" class="next">Next</a>`;
  }

  html += "</nav>";
  return html;
}

// Helper: create archive template
function createArchiveTemplate(archiveType, archiveName) {
  const displayTitle = `Archive: ${
    archiveName.charAt(0).toUpperCase() + archiveName.slice(1)
  }`;
  const breadcrumbTitle = `Archive: ${
    archiveType === "tags" ? "Tag" : "Category"
  } - ${archiveName}`;
  const breadcrumb = `<a href="../../../index.html">Home</a> / <a href="../../../blog.html">Blog</a> / <strong><a href="#">${breadcrumbTitle}</a></strong>`;

  return (
    blogTemplate
      // Update title
      .replace(
        /<title>.*?<\/title>/,
        `<title>Heleen Evers | ${displayTitle}</title>`
      )
      // Update main heading
      .replace(
        /data-text="Blog">Blog<\/div>/,
        `data-text="${displayTitle}">${displayTitle}</div>`
      )
      // Update breadcrumb in typing-bread
      .replace(
        /<div class="h-subtitle typing-bread" style="display: none">\s*<p>[\s\S]*?<\/p>\s*<\/div>/,
        `<div class="h-subtitle typing-bread" style="display: none">
              <p>
                ${breadcrumb}
              </p>
            </div>`
      )
      // Update CSS and JS paths to be relative
      .replace(/href="\/assets\//g, 'href="../../../assets/')
      .replace(/src="\/assets\//g, 'src="../../../assets/')
      // Update component script paths
      .replace(
        /src="\/assets\/js\/menu\.js"/,
        'src="../../../assets/js/menu.js"'
      )
      .replace(
        /src="\/assets\/js\/typewriter\.js"/,
        'src="../../../assets/js/typewriter.js"'
      )
      .replace(
        /src="\/assets\/js\/main\.js"/,
        'src="../../../assets/js/main.js"'
      )
  );
}

// Helper: generate pages for a specific archive type and name
function generateArchivePages(archiveType, archiveName, filteredPosts) {
  const slug = slugify(archiveName);
  const outputDir =
    archiveType === "tags"
      ? path.join(tagsOutputDir, slug)
      : path.join(categoriesOutputDir, slug);

  const totalPages = Math.ceil(filteredPosts.length / POSTS_PER_PAGE);
  const baseUrl = `/${archiveType}/${slug}/`;

  console.log(
    `Generating ${totalPages} page(s) for ${archiveType}/${archiveName} (${filteredPosts.length} posts)`
  );

  for (let page = 1; page <= totalPages; page++) {
    const pagePosts = filteredPosts.slice(
      (page - 1) * POSTS_PER_PAGE,
      page * POSTS_PER_PAGE
    );

    const tilesHTML = generatePostTiles(pagePosts);
    const paginationHTML = generatePaginationHTML(page, totalPages, baseUrl);

    // Create page HTML
    const archiveTemplate = createArchiveTemplate(archiveType, archiveName);
    const pageHTML = archiveTemplate.replace(
      /<!-- BLOG_POSTS_START -->[\s\S]*?<!-- BLOG_POSTS_END -->/,
      `<!-- BLOG_POSTS_START -->\n<div class="box-items post-items">\n${tilesHTML}\n${paginationHTML}\n</div>\n<!-- BLOG_POSTS_END -->`
    );

    if (page === 1) {
      // Main archive page: /tags/TAG_NAME/index.html
      fs.mkdirSync(outputDir, { recursive: true });
      fs.writeFileSync(path.join(outputDir, "index.html"), pageHTML);
    } else {
      // Paginated pages: /tags/TAG_NAME/page/N/index.html
      const pageDir = path.join(outputDir, "page", page.toString());
      fs.mkdirSync(pageDir, { recursive: true });
      fs.writeFileSync(path.join(pageDir, "index.html"), pageHTML);
    }
  }
}

// Clean output directories
if (fs.existsSync(tagsOutputDir)) {
  fs.rmSync(tagsOutputDir, { recursive: true, force: true });
}
if (fs.existsSync(categoriesOutputDir)) {
  fs.rmSync(categoriesOutputDir, { recursive: true, force: true });
}

// Sort posts by date descending
posts.sort((a, b) => new Date(b.date) - new Date(a.date));

// Generate category archives
const categoryMap = new Map();
posts.forEach((post) => {
  if (post.categories && post.categories.length > 0) {
    post.categories.forEach((category) => {
      if (!categoryMap.has(category)) {
        categoryMap.set(category, []);
      }
      categoryMap.get(category).push(post);
    });
  }
});

console.log(`\nGenerating category archives...`);
categoryMap.forEach((posts, category) => {
  generateArchivePages("categories", category, posts);
});

// Generate tag archives
const tagMap = new Map();
posts.forEach((post) => {
  if (post.tags && post.tags.length > 0) {
    post.tags.forEach((tag) => {
      if (!tagMap.has(tag)) {
        tagMap.set(tag, []);
      }
      tagMap.get(tag).push(post);
    });
  }
});

console.log(`\nGenerating tag archives...`);
tagMap.forEach((posts, tag) => {
  generateArchivePages("tags", tag, posts);
});

console.log(`\nArchive pages built successfully!`);
console.log(`Categories: ${categoryMap.size}`);
console.log(`Tags: ${tagMap.size}`);
