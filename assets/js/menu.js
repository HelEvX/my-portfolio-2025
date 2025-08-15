document.addEventListener("DOMContentLoaded", function () {
  document.body.classList.add("loaded");

  // Helper to safely attach event listeners
  function safeAddEventListener(selector, event, handler) {
    const el = document.querySelector(selector);
    if (el) {
      el.addEventListener(event, handler);
    } else {
      console.warn(`Element not found for selector: ${selector}`);
    }
  }

  // Utility function to load an HTML component into a target element
  // and then run a callback after it's loaded.
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
  loadComponent("#header-container", "/components/header.html", () => {
    if (typeof initializeAllMenu === "function") initializeAllMenu();
    if (typeof initializeButtonHoverEffects === "function")
      initializeButtonHoverEffects();

    // Call the active menu highlighter here
    if (typeof setActiveMenuItem === "function") setActiveMenuItem();

    // Attach navigation event listeners AFTER header is loaded
    safeAddEventListener("header .top-menu", "click", handleMenuLinkClick);
    safeAddEventListener(".typed-bread", "click", handleMenuLinkClick);
  });

  // -------------------------------
  // Load Sidebar
  // -------------------------------
  loadComponent("#sidebar-container", "/components/sidebar.html", () => {
    if (typeof initializeSidebar === "function") initializeSidebar();
    if (typeof initializeSearch === "function") initializeSearch();
    if (typeof populateSidebar === "function") populateSidebar();
  });

  // -------------------------------
  // Load Footer
  // -------------------------------
  loadComponent("#footer-container", "/components/footer.html");

  // -------------------------------
  // Preloader functionality (no custom typing)
  // -------------------------------
  const preloader = document.getElementById("preloader");
  const body = document.body;

  if (preloader) {
    const MAX_WAIT = 10000; // fallback 10s

    function hidePreloader() {
      preloader.classList.add("hide");
      body.classList.add("loaded");

      setTimeout(() => {
        if (preloader.parentNode) {
          preloader.remove();
        }
        if (typeof startTypedAnimations === "function") {
          startTypedAnimations();
        }
      }, 600); // match CSS transition duration
    }

    function startFlow() {
      hidePreloader();
    }

    if (document.readyState === "complete") {
      startFlow();
    } else {
      window.addEventListener("load", startFlow);
      setTimeout(startFlow, MAX_WAIT);
    }
  }

  // -------------------------------
  // Smooth Fadeout Between Pages
  // -------------------------------
  function handleMenuLinkClick(event) {
    console.log("Menu link clicked:", event.target);
    const link = event.target.closest("a");
    if (!link) return;

    const href = link.getAttribute("href");
    if (!href) return;

    if (href.indexOf("#section-") === 0) {
      if (!document.body.classList.contains("home")) {
        location.href = "/" + href;
        event.preventDefault();
        return;
      }
      const target = document.querySelector(href);
      if (target) {
        window.scrollTo({
          top: target.offsetTop - 110,
          behavior: "smooth",
        });
        event.preventDefault();
      }
      const header = document.querySelector("header");
      if (header && header.classList.contains("active")) {
        const menuBtn = document.querySelector(".menu-btn");
        if (menuBtn) menuBtn.click();
      }
    } else {
      document.body.classList.remove("loaded"); // start fade-out animation
      event.preventDefault();
      setTimeout(function () {
        window.location.href = href;
      }, 500);
    }
  }

  // -------------------------------
  // Filter functionality with two-phase fade-out/fade-in
  // -------------------------------
  const filterInputs = document.querySelectorAll(
    '.filters input[type="radio"]'
  );
  const items = document.querySelectorAll(".box-item");

  // Apply transition styles via CSS or JS for smooth fade/scale
  items.forEach((item) => {
    item.style.transition = "opacity 0.4s ease, transform 0.4s ease";
  });

  filterInputs.forEach((input) => {
    input.addEventListener("change", (e) => {
      e.preventDefault();

      const filterValue = input.value;

      // ---- Phase 1: Fade out everything ----
      items.forEach((item) => {
        item.style.opacity = "0";
        item.style.transform = "scale(0.8)";
      });

      // ---- After fade-out finishes, filter and fade-in matches ----
      setTimeout(() => {
        items.forEach((item) => {
          const matches =
            filterValue === ".box-item" ||
            item.classList.contains(filterValue.slice(1));

          if (matches) {
            item.style.display = "block";
            // small delay before fade in for smoother effect
            requestAnimationFrame(() => {
              item.style.opacity = "1";
              item.style.transform = "scale(1)";
            });
          } else {
            item.style.display = "none";
          }
        });
      }, 400); // matches fade-out duration

      // ---- Active button highlight ----
      document
        .querySelectorAll(".filters .btn-group label")
        .forEach((label) => {
          label.classList.remove("glitch-effect");
        });
      input.closest("label").classList.add("glitch-effect");
    });
  });

  // Activate the first filter on load
  const firstInput = document.querySelector('.filters input[type="radio"]');
  if (firstInput) {
    firstInput.checked = true;
    firstInput.dispatchEvent(new Event("change"));
  }

  // -------------------------------
  // Search functionality event listeners with null checks
  // -------------------------------
  const searchInput = document.getElementById("search-input");
  const resultsContainer = document.getElementById("results-container");
  const searchForm = document.querySelector(".search-form");

  if (searchInput && resultsContainer) {
    resultsContainer.style.display = "none";

    searchInput.addEventListener("input", function () {
      clearTimeout(window.searchTimeout);
      const query = this.value.trim().toLowerCase();

      if (query.length < 2) {
        resultsContainer.style.display = "none";
        resultsContainer.innerHTML = "";
        return;
      }

      window.searchTimeout = setTimeout(() => {
        performSearch(query, resultsContainer, window.searchData || []);
      }, 300);
    });

    searchInput.addEventListener("focus", function () {
      if (resultsContainer.innerHTML.trim() !== "") {
        resultsContainer.style.display = "block";
      }
    });

    document.addEventListener("click", function (e) {
      if (
        !searchInput.contains(e.target) &&
        !resultsContainer.contains(e.target)
      ) {
        resultsContainer.style.display = "none";
      }
    });
  }

  if (searchForm) {
    searchForm.addEventListener("submit", function (e) {
      e.preventDefault();
      const query = searchInput.value.trim();
      if (query) {
        window.location.href = `/search.html?q=${encodeURIComponent(query)}`;
      }
    });
  }
});

// Mobile menu toggle functionality
function initializeMobileMenu() {
  const menuBtn = document.querySelector(".menu-btn");
  const topMenu = document.querySelector(".top-menu");
  const header = document.querySelector("header");
  const body = document.body;

  // Elements to hide/show dynamically
  const elementsToToggle = [
    document.querySelector("header"),
    document.querySelector("footer"),
    ...document.querySelectorAll(".section"),
  ].filter((el) => el !== null);

  if (menuBtn && topMenu) {
    menuBtn.addEventListener("click", function (e) {
      e.preventDefault();

      // Toggle menu active state
      const isActive = header.classList.contains("active");

      if (isActive) {
        // Close menu: remove classes
        header.classList.remove("active");
        topMenu.classList.remove("active");
        menuBtn.classList.remove("active");
        document.body.classList.remove("menu-open");

        // Restore visibility of elements
        elementsToToggle.forEach((el) => {
          el.style.opacity = "";
          el.style.visibility = "";
        });
      } else {
        // Open menu: add classes
        header.classList.add("active");
        topMenu.classList.add("active");
        menuBtn.classList.add("active");
        document.body.classList.add("menu-open");

        // Hide elements with desired styles
        elementsToToggle.forEach((el) => {
          el.style.opacity = "0";
          el.style.visibility = "hidden";
        });
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

        // Restore visibility of elements
        elementsToToggle.forEach((el) => {
          el.style.opacity = "";
          el.style.visibility = "";
        });
      });
    });
  }
}

// Utility: normalize href for comparison by removing leading "../"
function normalizePath(path) {
  return path.replace(/^\/+/, "");
}

// Active menu item highlighting
function setActiveMenuItem() {
  const currentPath = window.location.pathname.replace(/^\/+/, "");
  const currentPage = window.location.pathname.split("/").pop() || "index.html";
  const menuItems = document.querySelectorAll(".top-menu ul li");

  menuItems.forEach((item) => {
    const link = item.querySelector("a");
    if (link) {
      const href = normalizePath(link.getAttribute("href"));

      // Remove active class from all items
      item.classList.remove("active");

      // Exact filename match
      if (href === currentPage) {
        item.classList.add("active");
        return; // done for this item
      }

      // For pages inside folders, highlight parent menu item by matching folder
      if (href.replace(/\.html$/, "") === currentPath.split("/")[0]) {
        item.classList.add("active");
      }
    }
  });
}

// Define loadComponent globally
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
    .catch((error) => console.error(`Error loading ${componentPath}:`, error));
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
  fetch("/search.json")
    .then((response) => response.json())
    .then((data) => {
      searchData = data;
      //console.log("Search data loaded:", searchData.length + " items");
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
        window.location.href = `/search.html?q=${encodeURIComponent(query)}`;
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

    //console.log("Mouse button found and initialized");

    // Ensure initial visible state
    mouseBtn.style.display = "block";
    mouseBtn.style.opacity = "1";

    // Scroll event listener function
    const onScrollCheck = function () {
      const scrollY = window.pageYOffset || document.documentElement.scrollTop;

      if (scrollY >= 1) {
        // Fade out (like jQuery fadeOut)
        fadeOutElement(mouseBtn);
      } else {
        // Fade in (like jQuery fadeIn)
        fadeInElement(mouseBtn);
      }
    };

    // Run once immediately on load (fixes refresh bug)
    onScrollCheck();

    // Run on every scroll
    window.addEventListener("scroll", onScrollCheck);

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
  initializeButtonHoverEffects();
}
