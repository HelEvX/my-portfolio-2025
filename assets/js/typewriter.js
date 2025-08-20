// ==================================
// Typed.js Animations Starter
// Ensures only ONE active instance
// ==================================

let subtitleTyped = null; // persistent reference

function startTypedAnimations() {
  //console.log("startTypedAnimations triggered at", performance.now());

  // Remove any leftover cursors
  document.querySelectorAll(".typed-cursor").forEach((el) => el.remove());

  // ---------- SUBTITLE ----------
  const subtitleStrings = [
    "for Web &amp; Video Projects.",
    "putting your ideas in motion.",
    "working internationally.",
    "based in Belgium.",
  ];

  const subtitleEl = document.querySelector(".typed-subtitle");
  if (subtitleEl) {
    // Destroy old instance if exists
    if (subtitleTyped) {
      subtitleTyped.destroy();
      subtitleTyped = null;
    }

    subtitleTyped = new Typed(subtitleEl, {
      strings: subtitleStrings,
      typeSpeed: 50,
      backSpeed: 40,
      backDelay: 2500,
      loop: true,
      smartBackspace: false,
      showCursor: true,
      cursorChar: "|",
      autoInsertCss: true,
    });
  }

  // ---------- BREADCRUMBS ----------
  const breadEl = document.querySelector(".typed-bread");
  if (breadEl) {
    new Typed(breadEl, {
      stringsElement: ".typing-bread",
      typeSpeed: 50,
      showCursor: false,
    });
  }

  // ---------- PRELOADER ----------
  const loadEl = document.querySelector(".typed-load");
  if (loadEl) {
    new Typed(loadEl, {
      stringsElement: ".typing-load",
      typeSpeed: 50,
      backSpeed: 25,
      backDelay: 500,
      loop: true,
      showCursor: true,
      cursorChar: "|",
      fadeOut: true,
      fadeOutClass: "typed-fade-out",
      fadeOutDelay: 500,
    });
  }
}

// Ensure script runs after DOM is fully loaded
document.addEventListener("DOMContentLoaded", () => {
  startTypedAnimations();
});
