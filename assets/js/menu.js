// Menu functionality, page loading effects, and dynamic content loading

document.addEventListener("DOMContentLoaded", function () {
  /**
   * Utility function to load an HTML component into a target element
   * and then run a callback after it's loaded.
   */
  function loadComponent(targetSelector, componentPath, callback) {
    const target = document.querySelector(targetSelector);
    if (!target) return;

    fetch(componentPath)
      .then((response) => {
        if (!response.ok) throw new Error(`Failed to load ${componentPath}`);
        return response.text();
      })
      .then((html) => {
        target.innerHTML = html;
        if (typeof callback === "function") callback();
      })
      .catch((error) =>
        console.error(`Error loading ${componentPath}:`, error)
      );
  }

  // -------------------------------
  // Load Header
  // -------------------------------
  loadComponent("#header-container", "../components/header.html", () => {
    // Only run after header is in DOM
    initializeAllMenu();
  });

  // -------------------------------
  // Load Sidebar
  // -------------------------------
  loadComponent("#sidebar-container", "../components/sidebar.html", () => {
    // Only run after sidebar is in DOM
    initializeSidebar();
    initializeSearch();
    populateSidebar();
  });

  // -------------------------------
  // Load Footer
  // -------------------------------
  loadComponent("#footer-container", "../components/footer.html");

  // -------------------------------
  // Preloader functionality
  // -------------------------------
  const preloader = document.getElementById("preloader");
  const body = document.body;

  if (preloader) {
    // Simulate loading time
    setTimeout(() => {
      preloader.classList.add("hide");
      body.classList.add("loaded");

      // Remove preloader from DOM after transition
      setTimeout(() => {
        if (preloader.parentNode) {
          preloader.remove();
        }
      }, 600);
    }, 2000);
  }
});

// Mobile menu toggle functionality
function initializeMobileMenu() {
  const menuBtn = document.querySelector(".menu-btn");
  const topMenu = document.querySelector(".top-menu");
  const header = document.querySelector("header");

  if (menuBtn && topMenu) {
    menuBtn.addEventListener("click", function (e) {
      e.preventDefault();

      // Toggle menu active state
      const isActive = header.classList.contains("active");

      if (isActive) {
        header.classList.remove("active");
        topMenu.classList.remove("active");
        menuBtn.classList.remove("active");
        document.body.classList.remove("menu-open");
      } else {
        header.classList.add("active");
        topMenu.classList.add("active");
        menuBtn.classList.add("active");
        document.body.classList.add("menu-open");
      }
    });

    // Close menu when clicking on menu links
    const menuLinks = topMenu.querySelectorAll("a");
    menuLinks.forEach((link) => {
      link.addEventListener("click", function () {
        header.classList.remove("active");
        topMenu.classList.remove("active");
        menuBtn.classList.remove("active");
        document.body.classList.remove("menu-open");
      });
    });
  }
}

// Active menu item highlighting
function setActiveMenuItem() {
  const currentPage = window.location.pathname.split("/").pop() || "index.html";
  const menuItems = document.querySelectorAll(".top-menu ul li");

  menuItems.forEach((item) => {
    const link = item.querySelector("a");
    if (link) {
      const href = link.getAttribute("href");

      // Remove active class from all items
      item.classList.remove("active");

      // Add active class to current page
      if (
        href === currentPage ||
        (currentPage === "" && href === "index.html") ||
        (currentPage === "index.html" && href === "index.html")
      ) {
        item.classList.add("active");
      }
    }
  });
}

// Sidebar functionality
function initializeSidebar() {
  const sidebarBtn = document.querySelector(".sidebar_btn");
  const sidebar = document.querySelector(".content-sidebar");
  const overlay = document.querySelector(".s_overlay");
  const closeBtn = document.querySelector(".content-sidebar .close");

  // Animation helpers for overlay
  function fadeInElement(element) {
    if (!element) return;
    element.style.opacity = 0;
    element.style.display = "block";
    element.style.transition = "opacity 0.3s ease";
    requestAnimationFrame(() => {
      element.style.opacity = 1;
    });
  }

  function fadeOutElement(element) {
    if (!element) return;
    element.style.opacity = 1;
    element.style.transition = "opacity 0.3s ease";
    element.style.opacity = 0;
    setTimeout(() => {
      element.style.display = "none";
    }, 300);
  }

  // Open sidebar
  if (sidebarBtn && sidebar) {
    sidebarBtn.addEventListener("click", function (e) {
      e.preventDefault();
      sidebar.classList.add("active");
      fadeInElement(overlay);
      overlay.classList.add("active");
      document.body.classList.add("scroll_hidden");
    });
  }

  // Close sidebar function
  function closeSidebar() {
    sidebar.classList.remove("active");
    overlay.classList.remove("active");
    fadeOutElement(overlay);
    document.body.classList.remove("scroll_hidden");
  }

  // Close on overlay click
  if (overlay) {
    overlay.addEventListener("click", closeSidebar);
  }

  // Close on "X" button click
  if (closeBtn) {
    closeBtn.addEventListener("click", closeSidebar);
  }

  // Close on Esc key
  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape" && sidebar.classList.contains("active")) {
      closeSidebar();
    }
  });
}

function populateSidebar() {
  fetch("/search.json")
    .then((response) => {
      if (!response.ok) throw new Error("Failed to load search.json");
      return response.json();
    })
    .then((posts) => {
      // -------------------------
      // Latest Posts (limit 5)
      // -------------------------
      const latestList = document.getElementById("latest-posts-list");
      if (latestList) {
        latestList.innerHTML = "";
        posts
          .slice() // copy array before sorting
          .sort((a, b) => {
            // Sort newest date first
            const dateA = new Date(a.date);
            const dateB = new Date(b.date);
            return dateB - dateA;
          })
          .slice(0, 5)
          .forEach((post) => {
            const li = document.createElement("li");
            li.innerHTML = `<a href="${post.url}">${post.title}</a>`;
            latestList.appendChild(li);
          });
      }

      // -------------------------
      // Categories
      // -------------------------
      const categoriesList = document.getElementById("categories-list");
      if (categoriesList) {
        const catCount = {};
        posts.forEach((post) => {
          (post.categories || []).forEach((cat) => {
            catCount[cat] = (catCount[cat] || 0) + 1;
          });
        });

        categoriesList.innerHTML = Object.keys(catCount)
          .sort()
          .map(
            (cat) =>
              `<li><a href="/categories/${cat}">${capitalize(
                cat
              )}</a> <small>(${catCount[cat]})</small></li>`
          )
          .join("");
      }

      // -------------------------
      // Tags
      // -------------------------
      const tagsList = document.getElementById("tags-list");
      if (tagsList) {
        const tagCount = {};
        posts.forEach((post) => {
          (post.tags || []).forEach((tag) => {
            tagCount[tag] = (tagCount[tag] || 0) + 1;
          });
        });

        tagsList.innerHTML = Object.keys(tagCount)
          .sort()
          .map(
            (tag) =>
              `<li><a href="/tags/${tag}">${capitalize(tag)}</a> <small>(${
                tagCount[tag]
              })</small></li>`
          )
          .join("");
      }
    })
    .catch((err) => console.error("Error populating sidebar:", err));

  function capitalize(str) {
    return str.charAt(0).toUpperCase() + str.slice(1);
  }
}

// Initialize search functionality
function initializeSearch() {
  const searchInput = document.getElementById("search-input");
  const resultsContainer = document.getElementById("results-container");
  const searchForm = document.querySelector(".search-form");

  if (!searchInput || !resultsContainer) return;

  // Hide results initially
  resultsContainer.style.display = "none";

  let searchData = [];

  // Try to fetch search data
  fetch("../search.json")
    .then((response) => response.json())
    .then((data) => {
      searchData = data;
      console.log("Search data loaded:", searchData.length + " items");
    })
    .catch((error) => {
      console.warn(
        "Could not load search.json, search will be limited:",
        error
      );
    });

  // Real-time search as user types
  let searchTimeout;
  searchInput.addEventListener("input", function () {
    clearTimeout(searchTimeout);
    const query = this.value.trim().toLowerCase();

    if (query.length < 2) {
      resultsContainer.style.display = "none";
      resultsContainer.innerHTML = "";
      return;
    }

    // Debounce search
    searchTimeout = setTimeout(() => {
      performSearch(query, resultsContainer, searchData);
    }, 300);
  });

  // Handle form submission
  if (searchForm) {
    searchForm.addEventListener("submit", function (e) {
      e.preventDefault();
      const query = searchInput.value.trim();
      if (query) {
        // Redirect to search page or perform search
        window.location.href = `../search.html?q=${encodeURIComponent(query)}`;
      }
    });
  }

  // Hide results when clicking outside
  document.addEventListener("click", function (e) {
    if (
      !searchInput.contains(e.target) &&
      !resultsContainer.contains(e.target)
    ) {
      resultsContainer.style.display = "none";
    }
  });

  // Show results when focusing on search input
  searchInput.addEventListener("focus", function () {
    if (resultsContainer.innerHTML.trim() !== "") {
      resultsContainer.style.display = "block";
    }
  });
}

// Perform search function
function performSearch(query, resultsContainer, searchData) {
  if (searchData.length === 0) {
    resultsContainer.innerHTML = "<li>Search data not available</li>";
    resultsContainer.style.display = "block";
    return;
  }

  const results = searchData.filter((item) => {
    const title = (item.title || "").toLowerCase();
    const content = (item.content || "").toLowerCase();
    const categories = (item.categories || []).join(" ").toLowerCase();
    const tags = (item.tags || []).join(" ").toLowerCase();

    return (
      title.includes(query) ||
      content.includes(query) ||
      categories.includes(query) ||
      tags.includes(query)
    );
  });

  if (results.length === 0) {
    resultsContainer.innerHTML = "<li>No results found</li>";
  } else {
    const html = results
      .slice(0, 10)
      .map(
        (item) =>
          `<li><a href="${item.url}" title="${item.excerpt || item.title}">${
            item.title
          }</a></li>`
      )
      .join("");
    resultsContainer.innerHTML = html;
  }

  resultsContainer.style.display = "block";
}

// Widget title wrapping
function initializeWidgetTitles() {
  const widgetTitles = document.querySelectorAll(".widget-title");
  widgetTitles.forEach((title) => {
    if (!title.querySelector(".widget-title-span")) {
      const content = title.innerHTML;
      title.innerHTML = `<span class="widget-title-span">${content}</span>`;
    }
  });
}

// Hide/show scroll mouse button based on scroll position
function initializeScrollMouseButton() {
  const mouseBtn = document.querySelector(".mouse_btn");

  if (mouseBtn) {
    // Prevent double initialization
    if (mouseBtn.hasAttribute("data-scroll-initialized")) {
      console.log("Mouse button already initialized, skipping...");
      return;
    }
    mouseBtn.setAttribute("data-scroll-initialized", "true");

    // Check if page has content below the fold
    const body = document.body;
    const hasShortContent =
      body.classList.contains("homepage") ||
      body.classList.contains("contact") ||
      body.classList.contains("404") ||
      document.body.scrollHeight <= window.innerHeight + 200; // Auto-detect short pages

    if (hasShortContent) {
      console.log("Page has no content below fold - hiding mouse button");
      mouseBtn.style.display = "none";
      return; // Exit early, no scroll listeners needed
    }

    console.log("Mouse button found and initialized");

    // Ensure initial visible state
    mouseBtn.style.display = "block";
    mouseBtn.style.opacity = "1";

    // Scroll event listener
    window.addEventListener("scroll", function () {
      const scrollY = window.pageYOffset || document.documentElement.scrollTop;

      if (scrollY >= 1) {
        // Fade out (like jQuery fadeOut)
        fadeOutElement(mouseBtn);
      } else {
        // Fade in (like jQuery fadeIn)
        fadeInElement(mouseBtn);
      }
    });

    // Click handler for smooth scroll
    mouseBtn.addEventListener("click", function (e) {
      e.preventDefault();
      console.log("Mouse button clicked - scrolling and hiding");

      const windowHeight = window.innerHeight;

      // Hide the button immediately when clicked
      fadeOutElement(mouseBtn);

      // Smooth scroll
      window.scrollTo({
        top: windowHeight - 150,
        behavior: "smooth",
      });
    });
  } else {
    console.error("Mouse button (.mouse_btn) not found in DOM");
  }
}

// Fade out function
function fadeOutElement(element) {
  if (!element || element.style.display === "none") return;

  element.style.opacity = element.style.opacity || "1";
  element.style.transition = "opacity 0.3s ease";
  element.style.display = "block";

  // Start fade out
  requestAnimationFrame(() => {
    element.style.opacity = "0";
  });

  // Set display none after animation
  setTimeout(() => {
    if (element.style.opacity === "0") {
      element.style.display = "none";
    }
  }, 300);
}

// Fade in function
function fadeInElement(element) {
  if (!element) return;
  if (element.style.display === "block" && element.style.opacity === "1")
    return;

  element.style.display = "block";
  element.style.opacity = "0";
  element.style.transition = "opacity 0.3s ease";

  // Start fade in
  requestAnimationFrame(() => {
    element.style.opacity = "1";
  });
}

// Initialize all menu functionality
function initializeAllMenu() {
  initializeMobileMenu();
  setActiveMenuItem();
  initializeSidebar();
  initializeScrollMouseButton();
  initializeSearch();
  initializeWidgetTitles();
}
