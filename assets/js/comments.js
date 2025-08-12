document.addEventListener("DOMContentLoaded", () => {
  const commentsList = document.getElementById("comments-list");
  const noCommentsMsg = document.getElementById("no-comments-msg");

  // Fake data for testing
  const existingComments = [
    {
      id: 1,
      name: "Alice",
      date: "2025-08-12",
      text: "Great post!",
      parent_id: null,
    },
    {
      id: 2,
      name: "Heleen Evers",
      date: "2025-08-12",
      text: "Thanks Alice!",
      parent_id: 1,
    },
  ];

  function renderComments(comments) {
    commentsList.innerHTML = "";
    if (comments.length === 0) {
      noCommentsMsg.textContent = "Start the discussion";
    } else {
      noCommentsMsg.textContent = "Join the conversation";
      comments.forEach((comment) => {
        const commentDiv = document.createElement("div");
        commentDiv.classList.add("post-comment");
        if (comment.parent_id) commentDiv.classList.add("reply");

        commentDiv.innerHTML = `
          <div class="image">
            <img src="https://via.placeholder.com/80" alt="${comment.name}">
          </div>
          <div class="desc">
            <div class="name">${comment.name} — ${comment.date}</div>
            <p>${comment.text}</p>
          </div>
        `;

        commentsList.appendChild(commentDiv);
      });
    }
  }

  renderComments(existingComments);
});
