document.addEventListener("DOMContentLoaded", function () {
  // Load header & footer dynamically
  fetch("components/header.html")
    .then((response) => response.text())
    .then((data) => {
      document.getElementById("header-container").innerHTML = data;

      // Initialize menu functionality after header is loaded
      initializeMenu();
    })
    .catch((error) => console.error("Error loading header:", error));

  fetch("components/footer.html")
    .then((response) => response.text())
    .then((data) => {
      document.getElementById("footer-container").innerHTML = data;
    })
    .catch((error) => console.error("Error loading footer:", error));
});
