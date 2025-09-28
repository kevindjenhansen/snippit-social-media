import { fetchPosts, createPost, updatePost, deletePost } from "./postsApi.js";
import { renderPosts } from "./postsRenderer.js";
import { initPostSearch } from "./search.js";

document.addEventListener("DOMContentLoaded", async () => {
  const postsContainer = document.getElementById("posts");
  const user = JSON.parse(localStorage.getItem("user"));
  const accessToken = user?.accessToken;

  if (!accessToken) return window.location.href = "login.html";

  const newPostBtn = document.getElementById("new-post-btn");
  const newPostForm = document.getElementById("new-post-form");
  const postTitleInput = document.getElementById("post-title");
  const postBodyInput = document.getElementById("post-body");
  const searchInput = document.getElementById("search-query");
  const searchBtn = document.getElementById("search-btn");
  const clearSearchBtn = document.getElementById("clear-search-btn");

  document.currentPosts = [];

  newPostBtn?.addEventListener("click", () => newPostForm.classList.toggle("hidden"));

  newPostForm?.addEventListener("submit", async (e) => {
    e.preventDefault();
    const title = postTitleInput.value.trim();
    const body = postBodyInput.value.trim();
    if (!title) return alert("Please enter a title.");

    try {
      const post = await createPost(title, body, accessToken);
      document.currentPosts = [post, ...document.currentPosts];
      renderPosts(postsContainer, document.currentPosts, user, attachPostListeners);

      newPostForm.reset();
      newPostForm.classList.add("hidden");
    } catch (err) {
      console.error(err);
      alert("Failed to create the post. Try again.");
    }
  });

  /**
   * Attach click handlers for all post action buttons
   * (view, edit, delete). This makes sure buttons behave
   * correctly even after re-rendering the posts
   */
  async function attachPostListeners() {
    document.querySelectorAll(".view-post-btn").forEach(btn => {
      btn.addEventListener("click", () => {
        const postId = btn.dataset.postId;
        window.location.href = `post.html?id=${postId}`;
      });
    });

    document.querySelectorAll(".edit-post-btn").forEach(btn => {
      btn.addEventListener("click", handleEditPost);
    });

    document.querySelectorAll(".delete-post-btn").forEach(btn => {
      btn.addEventListener("click", handleDeletePost);
    });
  }

  /**
   * Delete a post after asking the user for confirmation
   * Updates the displayed list if deletion is successful
   * 
   * @param {Event} e - Click event from the delete button
   */
  async function handleDeletePost(e) {
    const btn = e.currentTarget;
    const postId = btn.dataset.postId;

    if (!confirm("Are you sure you want to delete this post?")) return;

    try {
      await deletePost(postId, accessToken);
      document.currentPosts = document.currentPosts.filter(p => p.id !== postId);
      renderPosts(postsContainer, document.currentPosts, user, attachPostListeners);
    } catch (err) {
      console.error(err);
      alert("Failed to delete the post. Please try again.");
    }
  }

  /**
   * Edit an existing post. Replaces the post with a form,
   * lets the user update the title/body, and handles save/cancel
   * 
   * @param {Event} e - Click event from the edit button
   */
  async function handleEditPost(e) {
    const btn = e.currentTarget;
    const postId = btn.dataset.postId;
    const postDiv = btn.closest(".post");
    const currentTitle = postDiv.querySelector(".post-title").textContent;
    const currentBody = postDiv.querySelector(".post-body").textContent;

    postDiv.innerHTML = `
      <form class="edit-post-form" data-post-id="${postId}">
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
      const title = editForm.title.value.trim();
      const body = editForm.body.value.trim();

      try {
        const updatedPost = await updatePost(postId, title, body, accessToken);
        document.currentPosts = document.currentPosts.map(p => p.id === updatedPost.id ? updatedPost : p);
        renderPosts(postsContainer, document.currentPosts, user, attachPostListeners);
      } catch (err) {
        console.error(err);
        alert("Failed to update the post. Try again.");
      }
    });

    cancelBtn.addEventListener("click", () => {
      renderPosts(postsContainer, document.currentPosts, user, attachPostListeners);
    });
  }

  initPostSearch({
    searchInput,
    searchBtn,
    clearSearchBtn,
    fetchPosts: async () => {
      const posts = await fetchPosts(accessToken);
      document.currentPosts = posts;
      renderPosts(postsContainer, posts, user, attachPostListeners);
    },
    displayPosts: (posts) => renderPosts(postsContainer, posts, user, attachPostListeners),
    accessToken,
    postsContainer,
  });

  try {
    const posts = await fetchPosts(accessToken);
    document.currentPosts = posts;
    renderPosts(postsContainer, posts, user, attachPostListeners);
  } catch (err) {
    console.error(err);
    postsContainer.innerHTML = "<p style='color:red;'>Could not load posts.</p>";
  }
});
