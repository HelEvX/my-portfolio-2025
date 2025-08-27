// Styling effects and visual functionality

//-------------------------------------------------------------
// Glitching Buttons and Active Menu Tabs
//-------------------------------------------------------------
document.addEventListener("DOMContentLoaded", function () {
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

      // Keep glitch effect on active menu tab
      const activeMenuBtn = document.querySelector(
        ".top-menu ul li.active a.btn"
      );
      if (activeMenuBtn) {
        activeMenuBtn.classList.add("glitch-effect-white");
      }
    });
  });
}

//-------------------------------------------------------------
// Popup functionality for images, videos, music, and galleries
//-------------------------------------------------------------
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
      const showNav = galleryItems.length > 1;
      pagination.style.display = showNav ? "block" : "none";
      if (prevBtn) prevBtn.style.display = showNav ? "block" : "none";
      if (nextBtn) nextBtn.style.display = showNav ? "block" : "none";
      updatePagination();
    } else {
      pagination.style.display = "none";
      if (prevBtn) prevBtn.style.display = "none";
      if (nextBtn) nextBtn.style.display = "none";
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
    overlay.classList.remove("popup-video-open", "popup-content-open");
  }

  // Helper to update pagination text
  function updatePagination() {
    pagination.textContent = `${currentIndex + 1} of ${galleryItems.length}`;
  }

  // Unified gallery item renderer supporting images and videos
  function renderGalleryItem(index) {
    const item = galleryItems[index];
    if (!item) return;

    const src = item.getAttribute("href");
    const caption = item.getAttribute("title") || "";
    const ext = src.split(".").pop().toLowerCase();

    let popupContent = "";

    if (ext === "webm") {
      const baseName = src.substring(0, src.lastIndexOf("."));
      const posterSrc = baseName + ".webp";

      popupContent = `
        <figure>
          <video autoplay loop muted playsinline poster="${posterSrc}" aria-label="${caption}">
            <source src="${src}" type="video/webm" />
            Your browser does not support the video tag.
          </video>
          <figcaption>${caption}</figcaption>
        </figure>
      `;
    } else {
      popupContent = `
        <figure>
          <img src="${src}" alt="${caption}">
          <figcaption>${caption}</figcaption>
        </figure>
      `;
    }

    openPopup(popupContent, { gallery: true });
    updatePagination();
  }

  // updateGalleryPopup just calls renderGalleryItem for current index
  function updateGalleryPopup() {
    renderGalleryItem(currentIndex);
  }

  // Navigation buttons event listeners added dynamically per gallery
  function addNavigationHandlers() {
    if (prevBtn) {
      prevBtn.onclick = () => {
        currentIndex =
          (currentIndex - 1 + galleryItems.length) % galleryItems.length;
        updateGalleryPopup();
      };
    }
    if (nextBtn) {
      nextBtn.onclick = () => {
        currentIndex = (currentIndex + 1) % galleryItems.length;
        updateGalleryPopup();
      };
    }
  }

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

    // ---- Handle Single Image ----
    if (link.classList.contains("has-popup-image")) {
      const src = link.getAttribute("href");
      const caption =
        link.getAttribute("title") || link.querySelector("img")?.alt || "";

      const popupContent = `
        <figure>
          <img src="${src}" alt="${caption}">
          <figcaption>${caption}</figcaption>
        </figure>
      `;

      openPopup(popupContent, { gallery: false }); // no arrows
      return;
    }

    // ---- Handle Gallery ----
    if (link.classList.contains("has-popup-gallery")) {
      const galleryId = link.getAttribute("href");
      const galleryContainer = document.querySelector(galleryId);

      if (!galleryContainer) {
        console.warn("Gallery container not found for", galleryId);
        return;
      }

      galleryItems = Array.from(
        galleryContainer.querySelectorAll(
          'a[href$=".jpg"],a[href$=".jpeg"],a[href$=".png"],a[href$=".webp"],a[href$=".gif"],a[href$=".webm"]'
        )
      );

      if (galleryItems.length === 0) return;

      currentIndex = 0;
      renderGalleryItem(currentIndex);
      addNavigationHandlers();

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
      const trackUrl = encodeURIComponent(link.getAttribute("href"));
      const scEmbed = `https://w.soundcloud.com/player/?url=${trackUrl}&color=%23ff5500&auto_play=true&hide_related=false&show_comments=true&show_user=true&show_reposts=false&show_teaser=true&visual=true`;
      openPopup(
        `<iframe width="100%" height="300" scrolling="no" frameborder="no" allow="autoplay" src="${scEmbed}"></iframe>`
      );
      return;
    }

    // ---- Handle Content Popup ----
    if (link.classList.contains("has-popup-content")) {
      const contentId = link.getAttribute("href");
      const contentContainer = document.querySelector(contentId);

      if (contentContainer) {
        openPopup(contentContainer.innerHTML);
        document
          .querySelector("#popup-overlay")
          .classList.add("popup-content-open");

        // Re-run glitch effect on all .btn buttons inside popup
        initializeButtonHoverEffects();

        // Bind close listener to inner close button
        const innerCloseBtn = document.querySelector(
          "#popup-content .popup-box .popup-close-inner"
        );
        if (innerCloseBtn) {
          innerCloseBtn.addEventListener("click", closePopup);
        }

        // Bind close listener to top close button
        const topCloseBtn = document.querySelector(
          "#popup-content .popup-box .popup-close-top"
        );
        if (topCloseBtn) {
          topCloseBtn.addEventListener("click", closePopup);
        }

        // ---- VIDEO THUMBNAIL CLICK HANDLER ----
        document
          .querySelectorAll("#popup-content .video-preview")
          .forEach(function (preview) {
            preview.addEventListener(
              "click",
              function () {
                const videoId = preview.getAttribute("data-video-id");
                const provider =
                  preview.getAttribute("data-video-provider") || "youtube";

                // get start time first
                let startTime = parseInt(
                  preview.getAttribute("data-start-time") || "0",
                  10
                );

                // build embed src
                let iframeSrc = "";
                if (provider === "youtube") {
                  iframeSrc = `https://www.youtube.com/embed/${videoId}?autoplay=1&enablejsapi=1&start=${startTime}`;
                } else if (provider === "vimeo") {
                  iframeSrc = `https://player.vimeo.com/video/${videoId}?autoplay=1#t=${startTime}s`;
                }

                // create iframe
                const iframe = document.createElement("iframe");
                iframe.src = iframeSrc;
                iframe.allow = "autoplay; encrypted-media; fullscreen";
                iframe.allowFullscreen = true;
                iframe.width = "100%";
                iframe.style.aspectRatio = "16 / 9";
                iframe.frameBorder = "0";

                // replace preview thumbnail with iframe
                preview.innerHTML = "";
                preview.appendChild(iframe);
              },
              { once: true }
            );
          });
      }
      return;
    }
  });

  // Play video preview on hover for tiles with video (NOT working)
  const videoTiles = document.querySelectorAll(".box-item.f-gallery video");

  videoTiles.forEach((video) => {
    video.muted = true;
    video.loop = true;
    video.playsInline = true;
    video.autoplay = false;

    video.addEventListener("mouseenter", () => {
      video.play().catch(() => {});
    });

    video.addEventListener("mouseleave", () => {
      video.pause();
      video.currentTime = 0;
    });
  });

  // Close buttons

  if (closeBtn) closeBtn.addEventListener("click", closePopup);
  if (overlay) {
    overlay.addEventListener("click", (e) => {
      if (e.target === overlay) closePopup();
    });
  }
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") closePopup();
  });
});

// SVG logo glitch burst effect

const slices = document.querySelectorAll(
  ".orange-slice1, .orange-slice2, .orange-slice3, .orange-slice4, .orange-slice5, .orange-slice6, .orange-slice7, .orange-slice8, .orange-slice9, .orange-slice10, .orange-slice11, .orange-slice12, .orange-slice13, .teal-slice1, .teal-slice2, .teal-slice3, .teal-slice4, .teal-slice5, .teal-slice6, .teal-slice7, .teal-slice8, .teal-slice9, .teal-slice10, .teal-slice11, .teal-slice12, .teal-slice13, .base-slice1, .base-slice2, .base-slice3, .base-slice4, .base-slice5, .base-slice6, .base-slice7, .base-slice8, .base-slice9, .base-slice10, .base-slice11, .base-slice12, .base-slice13"
);

// Enable glitch
function startGlitch() {
  slices.forEach((slice) => {
    slice.classList.remove("glitch-paused");
  });
}

// Pause glitch in neutral state
function stopGlitch() {
  slices.forEach((slice) => {
    slice.classList.add("glitch-paused");
  });
}

// Initial state: paused
stopGlitch();

// Repeat bursts every 6s
setInterval(() => {
  startGlitch();
  setTimeout(stopGlitch, 2000);
}, 6000);
