// Menu functionality and page loading effects

document.addEventListener("DOMContentLoaded", function () {
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
    const currentPage =
      window.location.pathname.split("/").pop() || "index.html";
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

  // Initialize all menu functionality
  function initializeAllMenu() {
    initializeMobileMenu();
    setActiveMenuItem();
    initializeSidebar();
  }

  // Call initialization
  initializeAllMenu();

  // Re-initialize when header is dynamically loaded
  const headerContainer = document.getElementById("header-container");
  if (headerContainer) {
    const observer = new MutationObserver(function (mutations) {
      mutations.forEach(function (mutation) {
        if (mutation.type === "childList" && mutation.addedNodes.length > 0) {
          // Header has been added, initialize menu
          setTimeout(initializeAllMenu, 100);
        }
      });
    });

    observer.observe(headerContainer, {
      childList: true,
      subtree: true,
    });
  }
});

// Export functions for use in other scripts if needed
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
};
