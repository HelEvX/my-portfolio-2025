document.addEventListener("DOMContentLoaded", () => {
  const shareContainers = document.querySelectorAll(".social-share");

  shareContainers.forEach((container) => {
    const title = encodeURIComponent(
      container.getAttribute("data-title") || document.title
    );
    const url = encodeURIComponent(
      container.getAttribute("data-url") || window.location.href
    );
    const text = encodeURIComponent(title);

    const facebook = container.querySelector(".share-btn-facebook");
    if (facebook) {
      facebook.href = `https://www.facebook.com/sharer/sharer.php?u=${url}`;
    }

    const twitter = container.querySelector(".share-btn-twitter");
    if (twitter) {
      twitter.href = `https://twitter.com/intent/tweet?url=${url}&text=${text}`;
    }

    const linkedin = container.querySelector(".share-btn-linkedin");
    if (linkedin) {
      linkedin.href = `https://www.linkedin.com/shareArticle?mini=true&url=${url}&title=${text}`;
    }

    const reddit = container.querySelector(".share-btn-reddit");
    if (reddit) {
      reddit.href = `https://www.reddit.com/submit?url=${url}&title=${text}`;
    }

    const pinterest = container.querySelector(".share-btn-pinterest");
    if (pinterest) {
      pinterest.href = `https://pinterest.com/pin/create/button/?url=${url}`;
    }
  });
});
