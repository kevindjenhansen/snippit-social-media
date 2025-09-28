import { initFollowButton } from "../profile/follow.js";
import { NOROFF_API_URL, NOROFF_API_KEY } from "../auth/config.js";

document.addEventListener("DOMContentLoaded", () => {
  const postsContainer = document.getElementById("posts");
  const user = JSON.parse(localStorage.getItem("user"));
  const accessToken = user?.accessToken;

  if (!accessToken) {
    window.location.href = "login.html";
    return;
  }

  const postId = new URLSearchParams(window.location.search).get("id");
  if (!postId) {
    postsContainer.innerHTML = "<p>No post ID provided.</p>";
    return;
  }

  const escapeHtml = (str = "") =>
    String(str)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");

  const fetchPost = async () => {
    try {
      const res = await fetch(`${NOROFF_API_URL}/social/posts/${postId}?_author=true`, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "X-Noroff-API-Key": NOROFF_API_KEY,
        },
      });

      if (!res.ok) throw new Error("Failed to fetch post");

      const { data: post } = await res.json();
      renderPost(post);
    } catch (err) {
      console.error(err);
      postsContainer.innerHTML = "<p style='color:red;'>Could not load post.</p>";
    }
  };

  const renderPost = (post) => {
    postsContainer.innerHTML = "";

    const author = post.author;
    const authorName = author?.name || "Anonymous";
    const isOwner = author?.email === user?.email;

    const actionsHTML = isOwner
      ? `
        <button class="button-blue edit-post-btn" data-post-id="${post.id}">Edit</button>
        <button class="button-blue delete-post-btn" data-post-id="${post.id}">Delete</button>
      `
      : `<button id="follow-btn" class="button-blue">Follow</button>`;

    const postDiv = document.createElement("div");
    postDiv.className = "post";
    postDiv.innerHTML = `
      <h3 class="post-title">${escapeHtml(post.title)}</h3>
      <p class="post-body">${escapeHtml(post.body || "")}</p>
      <p>By: <span class="author-name">${escapeHtml(authorName)}</span></p>
      <p>Created: ${new Date(post.created).toLocaleString()}</p>
      <div class="post-actions">${actionsHTML}</div>
    `;
    postsContainer.appendChild(postDiv);

    attachPostListeners(post, isOwner, authorName);
  };

  const attachPostListeners = (post, isOwner, authorName) => {
    if (isOwner) attachEditListener(post);
    if (isOwner) attachDeleteListener(post);
    if (!isOwner && authorName) initFollowButton("follow-btn", authorName, accessToken);
  };

  const attachEditListener = (post) => {
    const editBtn = document.querySelector(".edit-post-btn");
    if (!editBtn) return;

    editBtn.addEventListener("click", () => {
      const postDiv = editBtn.closest(".post");
      const currentTitle = postDiv.querySelector(".post-title").textContent;
      const currentBody = postDiv.querySelector(".post-body").textContent;

      postDiv.innerHTML = `
        <form class="edit-post-form">
          <input type="text" name="title" value="${currentTitle}" required>
          <textarea name="body" rows="4">${currentBody}</textarea>
          <div style="margin-top:8px">
            <button type="submit" class="button-blue">Save</button>
            <button type="button" class="button-blue cancel-edit-btn">Cancel</button>
          </div>
        </form>
      `;

      const editForm = postDiv.querySelector(".edit-post-form");
      const cancelBtn = postDiv.querySelector(".cancel-edit-btn");

      editForm.addEventListener("submit", async (e) => {
        e.preventDefault();
        await updatePost(post.id, editForm.title.value.trim(), editForm.body.value.trim());
      });

      cancelBtn.addEventListener("click", () => renderPost(post));
    });
  };

  const attachDeleteListener = (post) => {
    const deleteBtn = document.querySelector(".delete-post-btn");
    if (!deleteBtn) return;

    deleteBtn.addEventListener("click", async () => {
      if (!confirm("Are you sure you want to delete this post?")) return;

      try {
        const res = await fetch(`${NOROFF_API_URL}/social/posts/${post.id}`, {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${accessToken}`,
            "X-Noroff-API-Key": NOROFF_API_KEY,
          },
        });

        if (!res.ok) throw new Error("Failed to delete post");
        window.location.href = "index.html";
      } catch (err) {
        console.error(err);
        alert("Could not delete post.");
      }
    });
  };

  const updatePost = async (postId, title, body) => {
    try {
      const res = await fetch(`${NOROFF_API_URL}/social/posts/${postId}`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "X-Noroff-API-Key": NOROFF_API_KEY,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ title, body }),
      });

      if (!res.ok) throw new Error("Failed to update post");

      const { data: updatedPost } = await res.json();
      renderPost(updatedPost);
    } catch (err) {
      console.error(err);
      alert("Could not update post.");
    }
  };

  fetchPost();
});
