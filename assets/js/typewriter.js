// Typewriter effect functionality
class TypeWriter {
  constructor(element, options = {}) {
    this.element = element;
    this.texts = options.texts || [];
    this.speed = options.speed || 80;
    this.deleteSpeed = options.deleteSpeed || 40;
    this.pauseTime = options.pauseTime || 2000;
    this.loop = options.loop !== false;
    this.currentTextIndex = 0;
    this.currentCharIndex = 0;
    this.isDeleting = false;
    this.isPaused = false;
  }

  type() {
    if (this.texts.length === 0) return;

    const currentText = this.texts[this.currentTextIndex];

    if (!this.isDeleting) {
      // Typing
      this.element.textContent = currentText.substring(
        0,
        this.currentCharIndex + 1
      );
      this.currentCharIndex++;

      if (this.currentCharIndex === currentText.length) {
        // Finished typing, pause then start deleting
        this.isPaused = true;
        setTimeout(() => {
          this.isPaused = false;
          this.isDeleting = true;
          this.type();
        }, this.pauseTime);
        return;
      }
    } else {
      // Deleting
      this.element.textContent = currentText.substring(
        0,
        this.currentCharIndex - 1
      );
      this.currentCharIndex--;

      if (this.currentCharIndex === 0) {
        // Finished deleting
        this.isDeleting = false;
        this.currentTextIndex = (this.currentTextIndex + 1) % this.texts.length;

        if (!this.loop && this.currentTextIndex === 0) {
          return; // Stop if not looping and we've gone through all texts
        }
      }
    }

    if (!this.isPaused) {
      const speed = this.isDeleting ? this.deleteSpeed : this.speed;
      setTimeout(() => this.type(), speed);
    }
  }

  start() {
    this.type();
  }

  stop() {
    // Stop the typewriter effect
    this.loop = false;
  }
}

// Simple single-text typewriter function
function typeWriter(element, text, speed = 80, callback = null) {
  let i = 0;
  element.textContent = "";

  function type() {
    if (i < text.length) {
      element.textContent += text.charAt(i);
      i++;
      setTimeout(type, speed);
    } else if (callback) {
      callback();
    }
  }

  type();
}

// Initialize typewriter effects when DOM is loaded
document.addEventListener("DOMContentLoaded", function () {
  // Wait for page to load and preloader to finish
  setTimeout(() => {
    initializeTypewriters();
  }, 2500);
});

function initializeTypewriters() {
  // Homepage typewriter effect
  const typedSubtitle = document.querySelector(".typed-subtitle");
  if (typedSubtitle && typedSubtitle.textContent.trim() === "") {
    typeWriter(typedSubtitle, "Digital Designer for Web & Video", 80);
  }

  // Multi-text typewriter for other pages (example)
  const multiTextElement = document.querySelector(".multi-typewriter");
  if (multiTextElement) {
    const typewriter = new TypeWriter(multiTextElement, {
      texts: [
        "UX/UI Designer",
        "Creative Director",
        "Digital Artist",
        "Problem Solver",
      ],
      speed: 100,
      deleteSpeed: 50,
      pauseTime: 2000,
      loop: true,
    });
    typewriter.start();
  }

  // Breadcrumb typewriter for other pages
  const typedBread = document.querySelector(".typed-bread");
  if (typedBread && typedBread.textContent.trim() === "") {
    const breadText = typedBread.getAttribute("data-text") || "Welcome";
    typeWriter(typedBread, breadText, 60);
  }
}

// Cursor blinking animation (handled by CSS, but can be controlled here)
function manageCursor() {
  const cursors = document.querySelectorAll(".typed-cursor");
  cursors.forEach((cursor) => {
    // Additional cursor management if needed
    cursor.style.animationDuration = "1s";
  });
}

// Page-specific typewriter initialization
function initializePageTypewriter(pageType) {
  switch (pageType) {
    case "home":
      // Already handled in main initialization
      break;
    case "about":
      const aboutSubtitle = document.querySelector(".about-subtitle");
      if (aboutSubtitle) {
        typeWriter(
          aboutSubtitle,
          "Passionate about creating meaningful digital experiences.",
          70
        );
      }
      break;
    case "portfolio":
      const portfolioSubtitle = document.querySelector(".portfolio-subtitle");
      if (portfolioSubtitle) {
        typeWriter(
          portfolioSubtitle,
          "A collection of my creative work and projects.",
          70
        );
      }
      break;
    case "blog":
      const blogSubtitle = document.querySelector(".blog-subtitle");
      if (blogSubtitle) {
        typeWriter(
          blogSubtitle,
          "Thoughts, insights, and creative processes.",
          70
        );
      }
      break;
    case "contact":
      const contactSubtitle = document.querySelector(".contact-subtitle");
      if (contactSubtitle) {
        typeWriter(
          contactSubtitle,
          "Let's create something amazing together.",
          70
        );
      }
      break;
  }
}
