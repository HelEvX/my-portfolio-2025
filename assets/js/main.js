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

// Popup functionality for images, videos, music, and galleries
document.addEventListener("DOMContentLoaded", () => {
  const overlay = document.getElementById("popup-overlay");
  const contentBox = document.getElementById("popup-content");
  const closeBtn = document.getElementById("popup-close");
  const prevBtn = document.getElementById("popup-prev");
  const nextBtn = document.getElementById("popup-next");
  const pagination = document.getElementById("popup-pagination");

  let galleryItems = [];
  let currentIndex = 0;

  // Helper to open popup
  function openPopup(html, { gallery = false, index = 0 } = {}) {
    // Fill content
    contentBox.innerHTML = html;

    // Show nav if gallery
    if (gallery) {
      pagination.style.display = "block";
      prevBtn.style.display = "block";
      nextBtn.style.display = "block";
      updatePagination();
    } else {
      pagination.style.display = "none";
      prevBtn.style.display = "none";
      nextBtn.style.display = "none";
    }

    overlay.style.display = "flex";
    document.body.style.overflow = "hidden";
  }

  // Helper to close popup
  function closePopup() {
    overlay.style.display = "none";
    document.body.style.overflow = "";
    contentBox.innerHTML = "";
    galleryItems = [];
    currentIndex = 0;
  }

  // Helper to update pagination text
  function updatePagination() {
    pagination.textContent = `${currentIndex + 1} of ${galleryItems.length}`;
  }

  // Gallery navigation
  prevBtn.addEventListener("click", () => {
    currentIndex =
      (currentIndex - 1 + galleryItems.length) % galleryItems.length;
    const imgSrc = galleryItems[currentIndex].href;
    openPopup(`<img src="${imgSrc}" alt="">`, { gallery: true });
  });

  nextBtn.addEventListener("click", () => {
    currentIndex = (currentIndex + 1) % galleryItems.length;
    const imgSrc = galleryItems[currentIndex].href;
    openPopup(`<img src="${imgSrc}" alt="">`, { gallery: true });
  });

  // Close events
  closeBtn.addEventListener("click", closePopup);
  overlay.addEventListener("click", (e) => {
    if (e.target === overlay) closePopup();
  });
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") closePopup();
  });

  // Event delegation for tiles
  document.body.addEventListener("click", (e) => {
    const link = e.target.closest(
      "a.has-popup-image, a.has-popup-video, a.has-popup-music, a.has-popup-media, a.has-popup-gallery, a.has-popup-link, a.has-popup-content"
    );
    if (!link) return;

    e.preventDefault();

    // ---- Handle Links (open in new tab) ----
    if (link.classList.contains("has-popup-link")) {
      window.open(link.href, "_blank");
      return;
    }

    // ---- Handle Gallery ----
    if (link.classList.contains("has-popup-gallery")) {
      const galleryId = link.getAttribute("href");
      const galleryContainer = document.querySelector(galleryId);

      if (galleryContainer) {
        galleryItems = Array.from(
          galleryContainer.querySelectorAll(
            'a[href$=".jpg"],a[href$=".jpeg"],a[href$=".png"],a[href$=".gif"]'
          )
        );

        if (galleryItems.length) {
          currentIndex = 0;
          const firstSrc = galleryItems[currentIndex].getAttribute("href");
          openPopup(`<img src="${firstSrc}" alt="">`, { gallery: true });
        }
      } else {
        console.warn("Gallery container not found for", galleryId);
      }
      return;
    }

    // ---- Handle Image ----
    if (link.classList.contains("has-popup-image")) {
      openPopup(`<img src="${link.getAttribute("href")}" alt="">`);
      return;
    }

    // ---- Handle Video ----
    if (link.classList.contains("has-popup-video")) {
      const href = link.getAttribute("href");
      let embedUrl = "";
      let watchUrl = href; // Default to original URL

      if (href.includes("youtu.be")) {
        const id = href.split("youtu.be/")[1];
        embedUrl = `https://www.youtube.com/embed/${id}?autoplay=1`;
        watchUrl = `https://www.youtube.com/watch?v=${id}`;
      } else if (href.includes("youtube.com/watch?v=")) {
        const id = href.split("v=")[1];
        embedUrl = `https://www.youtube.com/embed/${id}?autoplay=1`;
        watchUrl = href;
      } else if (href.includes("vimeo.com")) {
        const id = href.split("vimeo.com/")[1];
        embedUrl = `https://player.vimeo.com/video/${id}?autoplay=1`;
        watchUrl = href;
      }

      // Wrap iframe in a responsive container
      openPopup(
        `
        <div class="popup-video-container">
          <div class="popup-video-frame">
            <iframe src="${embedUrl}" allow="autoplay; fullscreen" allowfullscreen></iframe>
          </div>
          <a href="${watchUrl}" target="_blank" rel="noopener noreferrer" class="popup-video-open-link">
            Watch on ${href.includes("vimeo.com") ? "Vimeo" : "YouTube"}
          </a>
        </div>
      `,
        { type: "video" }
      );

      document
        .querySelector("#popup-overlay")
        .classList.add("popup-video-open");

      return;
    }

    // ---- Handle Music ----
    if (link.classList.contains("has-popup-music")) {
      // Assuming SoundCloud track URL is directly in href
      const trackUrl = encodeURIComponent(link.getAttribute("href"));
      const scEmbed = `https://w.soundcloud.com/player/?url=${trackUrl}&auto_play=true`;
      openPopup(
        `<iframe width="100%" height="166" scrolling="no" frameborder="no" allow="autoplay" src="${scEmbed}"></iframe>`
      );
      return;
    }

    // ---- Handle Content Popup ----
    if (link.classList.contains("has-popup-content")) {
      const contentId = link.getAttribute("href");
      const contentContainer = document.querySelector(contentId);

      if (contentContainer) {
        openPopup(contentContainer.innerHTML); // inject the hidden HTML
      } else {
        console.warn("Content container not found for", contentId);
      }
      return;
    }
  });
});
