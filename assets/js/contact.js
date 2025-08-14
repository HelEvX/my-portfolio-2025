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
      alert("Thank you for your message! We will get back to you soon.");
      form.reset();
    })
    .catch((error) => alert("Submission failed: " + error.message));
});
