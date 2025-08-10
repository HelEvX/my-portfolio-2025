// Styling effects and visual functionality

document.addEventListener("DOMContentLoaded", function () {
  // Initialize all styling effects
  initializeButtonHoverEffects();
});

// Button hover effects with glitch-effect-white class
function initializeButtonHoverEffects() {
  const buttons = document.querySelectorAll("a.btn, .btn");

  buttons.forEach((button) => {
    button.addEventListener("mouseenter", function () {
      this.classList.add("glitch-effect-white");
    });

    button.addEventListener("mouseleave", function () {
      this.classList.remove("glitch-effect-white");

      // Keep glitch effect on active menu button
      const activeMenuBtn = document.querySelector(
        ".top-menu ul li.active a.btn"
      );
      if (activeMenuBtn) {
        activeMenuBtn.classList.add("glitch-effect-white");
      }
    });
  });
}

// Simple filter functionality for portfolio items
function filterItems(category) {
  const items = document.querySelectorAll(".box-item");

  items.forEach((item) => {
    if (category === "all" || item.classList.contains(`f-${category}`)) {
      item.classList.remove("hidden");
    } else {
      item.classList.add("hidden");
    }
  });
}

// Export styling functions for use in other scripts
window.StyleManager = {
  reinitializeButtons: function () {
    initializeButtonHoverEffects();
  },

  filterPortfolio: function (category) {
    filterItems(category);
  },
};
