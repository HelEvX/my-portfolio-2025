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
      if (prevBtn) prevBtn.style.display = "block";
      if (nextBtn) nextBtn.style.display = "block";
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

  // Update Gallery Items
  function updateGalleryPopup() {
    const currentItem = galleryItems[currentIndex];
    const src = currentItem.getAttribute("href");
    const caption = currentItem.getAttribute("title") || "";
    openPopup(
      `<figure>
       <img src="${src}" alt="${caption}">
       <figcaption>${caption}</figcaption>
     </figure>`,
      { gallery: true }
    );
    updatePagination();
  }

  // Add event listeners ONLY if element exists
  if (galleryItems.length) {
    currentIndex = 0;
    updateGalleryPopup();
  }

  if (prevBtn) {
    prevBtn.addEventListener("click", () => {
      currentIndex =
        (currentIndex - 1 + galleryItems.length) % galleryItems.length;
      updateGalleryPopup();
    });
  }

  if (nextBtn) {
    nextBtn.addEventListener("click", () => {
      currentIndex = (currentIndex + 1) % galleryItems.length;
      updateGalleryPopup();
    });
  }

  if (closeBtn) {
    closeBtn.addEventListener("click", closePopup);
  }

  if (overlay) {
    overlay.addEventListener("click", (e) => {
      if (e.target === overlay) closePopup();
    });
  }

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
            'a[href$=".jpg"],a[href$=".jpeg"],a[href$=".png"],a[href$=".webp"]'
          )
        );

        if (galleryItems.length) {
          currentIndex = 0;
          const firstItem = galleryItems[currentIndex]; // Declare and assign here
          const src = firstItem.getAttribute("href");
          const caption = firstItem.getAttribute("title") || "";
          openPopup(
            `<figure>
              <img src="${src}" alt="${caption}">
              <figcaption>${caption}</figcaption>
            </figure>`,
            { gallery: true }
          );
        }
      } else {
        console.warn("Gallery container not found for", galleryId);
      }
      return;
    }

    // ---- Handle Image ----
    if (link.classList.contains("has-popup-image")) {
      const src = link.getAttribute("href");
      const caption = link.querySelector("img")?.alt || "";
      openPopup(
        `<figure>
       <img src="${src}" alt="${caption}">
       <figcaption>${caption}</figcaption>
     </figure>`
      );
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
      const trackUrl = encodeURIComponent(link.getAttribute("href"));
      const scEmbed = `https://w.soundcloud.com/player/?url=${trackUrl}&color=%23ff5500&auto_play=true&hide_related=false&show_comments=true&show_user=true&show_reposts=false&show_teaser=true&visual=true`;
      openPopup(
        `<iframe width="100%" height="600" scrolling="no" frameborder="no" allow="autoplay" src="${scEmbed}"></iframe>`
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

        // Then bind close listener to inner close button
        const innerCloseBtn = document.querySelector(
          "#popup-content .popup-box .popup-close-inner"
        );
        if (innerCloseBtn) {
          innerCloseBtn.addEventListener("click", closePopup);
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
                  // Vimeo accepts time as #t=115s or ?t=115
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
});
