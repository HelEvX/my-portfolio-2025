// Menu functionality, page loading effects, and dynamic content loading

document.addEventListener("DOMContentLoaded", function () {
  // Load header & footer dynamically
  fetch("components/header.html")
    .then((response) => response.text())
    .then((data) => {
      document.getElementById("header-container").innerHTML = data;

      // Initialize menu functionality after header is loaded
      initializeAllMenu();
    })
    .catch((error) => console.error("Error loading header:", error));

  fetch("components/footer.html")
    .then((response) => response.text())
    .then((data) => {
      document.getElementById("footer-container").innerHTML = data;
    })
    .catch((error) => console.error("Error loading footer:", error));

  // Preloader functionality
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

  if (sidebarBtn && sidebar) {
    sidebarBtn.addEventListener("click", function () {
      sidebar.classList.add("active");
      if (overlay) overlay.style.display = "block";
    });
  }

  if (closeBtn && sidebar) {
    closeBtn.addEventListener("click", function () {
      sidebar.classList.remove("active");
      if (overlay) overlay.style.display = "none";
    });
  }

  if (overlay) {
    overlay.addEventListener("click", function () {
      sidebar.classList.remove("active");
      overlay.style.display = "none";
    });
  }
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
  if (element.style.display === "none") return;

  element.style.opacity = "1";
  element.style.transition = "opacity 0.3s ease";

  // Start fade out
  setTimeout(() => {
    element.style.opacity = "0";
  }, 10);

  // Set display none after animation
  setTimeout(() => {
    element.style.display = "none";
  }, 330); // 300ms transition + 30ms buffer
}

// Fade in function
function fadeInElement(element) {
  if (element.style.display === "block" && element.style.opacity === "1")
    return;

  element.style.display = "block";
  element.style.opacity = "0";
  element.style.transition = "opacity 0.3s ease";

  // Start fade in
  setTimeout(() => {
    element.style.opacity = "1";
  }, 10);
}

// Initialize all menu functionality
function initializeAllMenu() {
  initializeMobileMenu();
  setActiveMenuItem();
  initializeSidebar();
  initializeScrollMouseButton();
}

// Export menu functions for use in other scripts
window.MenuManager = {
  setActive: function (pageName) {
    const menuItems = document.querySelectorAll(".top-menu ul li");
    menuItems.forEach((item) => {
      const link = item.querySelector("a");
      if (link && link.getAttribute("href").includes(pageName)) {
        document
          .querySelector(".top-menu ul li.active")
          ?.classList.remove("active");
        item.classList.add("active");
      }
    });
  },

  // Re-initialize scroll effects
  reinitializeScrollEffects: function () {
    initializeScrollMouseButton();
  },
};
