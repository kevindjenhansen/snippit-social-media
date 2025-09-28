export function escapeHtml(str = "") {
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

export function renderPosts(postsContainer, posts, currentUser, attachPostListeners) {
  postsContainer.innerHTML = "";

  posts.forEach((post) => {
    const author = post.author;
    const authorName = author?.name || "Anonymous";
    const isOwner = author?.email && currentUser?.email && author.email === currentUser.email;

    const editDeleteHtml = isOwner
      ? `<button class="button-blue edit-post-btn" data-post-id="${post.id}">Edit</button>
         <button class="button-blue delete-post-btn" data-post-id="${post.id}">Delete</button>`
      : "";

    const div = document.createElement("div");
    div.className = "post";
    div.innerHTML = `
      <h3 class="post-title">${escapeHtml(post.title)}</h3>
      <p class="post-body">${escapeHtml(post.body || "")}</p>
      <p>By: <span class="author-name">${escapeHtml(authorName)}</span></p>
      <p>Created: ${new Date(post.created).toLocaleString()}</p>
      <div class="post-actions">
        <button class="button-blue view-post-btn" data-post-id="${post.id}">View Post</button>
        ${editDeleteHtml}
      </div>
    `;

    postsContainer.appendChild(div);
  });

  attachPostListeners();
}
