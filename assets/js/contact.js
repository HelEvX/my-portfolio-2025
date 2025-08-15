document.getElementById("cform").addEventListener("submit", function (event) {
  event.preventDefault();

  const form = event.target;
  const data = new FormData(form);

  fetch("/", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams(data).toString(),
  })
    .then(() => {
      document.querySelector(".contact_form").innerHTML =
        '<div class="success-message"><h3>Thank you!</h3><p>Your message was sent successfully. We\'ll get back to you soon.</p></div>';
    })
    .catch((error) => alert("Submission failed: " + error.message));
});
