// ==================================
// Typed.js Animations Starter
// Ensures only ONE active instance
// ==================================

let subtitleTyped = null; // persistent reference

function startTypedAnimations() {
  console.log("startTypedAnimations triggered at", performance.now());

  // Remove any leftover cursors
  document.querySelectorAll(".typed-cursor").forEach((el) => el.remove());

  // ---------- SUBTITLE ----------
  const subtitleStrings = [
    "for Web & Video Projects.",
    "putting your ideas in motion.",
    "working internationally.",
    "based in Belgium.",
  ];

  // Kill any existing instance before starting new
  if (subtitleTyped) {
    console.log("Destroying old subtitle Typed instance...");
    subtitleTyped.destroy();
    subtitleTyped = null;
  }

  if (document.querySelector(".typed-subtitle")) {
    subtitleTyped = new Typed(".typed-subtitle", {
      strings: subtitleStrings,
      typeSpeed: 50,
      backSpeed: 40,
      backDelay: 2500,
      startDelay: 0,
      loop: true,
      loopCount: Infinity,
      smartBackspace: false,
      contentType: "null",
      showCursor: true,
      cursorChar: "|",
      autoInsertCss: true,

      // Debug logging
      preStringTyped: (pos, self) => {
        if (!self._instanceId) {
          self._instanceId = Math.random().toString(36).slice(2, 7);
        }
        console.log(
          `Instance ${self._instanceId}: About to type string index: ${pos} / total: ${self.strings.length}`
        );
      },
      onStringTyped: (pos, self) => {
        console.log(
          `Instance ${self._instanceId}: Finished typing string index: ${pos}`
        );
      },
    });
  }

  // ---------- BREADCRUMBS ----------
  if (document.querySelector(".typed-bread")) {
    new Typed(".typed-bread", {
      stringsElement: ".typing-bread",
      typeSpeed: 50,
      showCursor: false,
    });
  }

  // ---------- PRELOADER ----------
  if (document.querySelector(".typed-load")) {
    new Typed(".typed-load", {
      stringsElement: ".typing-load",
      typeSpeed: 50,
      backSpeed: 25,
      showCursor: true,
    });
  }
}
