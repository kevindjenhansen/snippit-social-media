import { NOROFF_API_KEY, NOROFF_API_URL } from "../auth/config.js";

document.addEventListener("DOMContentLoaded", async () => {
  const postsContainer = document.getElementById("posts");
  const user = JSON.parse(localStorage.getItem("user"));
  const accessToken = user?.accessToken;

  if (!accessToken) {
    window.location.href = "login.html";
    return;
  }

  const newPostBtn = document.getElementById("new-post-btn");
  const newPostForm = document.getElementById("new-post-form");
  const postTitleInput = document.getElementById("post-title");
  const postBodyInput = document.getElementById("post-body");

  document.currentPosts = document.currentPosts || [];

  function escapeHtml(str = "") {
    return String(str)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }

  newPostBtn?.addEventListener("click", () => {
    newPostForm.classList.toggle("hidden");
  });

  newPostForm?.addEventListener("submit", async (e) => {
    e.preventDefault();
    const title = postTitleInput.value.trim();
    const body = postBodyInput.value.trim();
    if (!title) return alert("Title is required!");

    try {
      const res = await fetch(`${NOROFF_API_URL}/social/posts`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "X-Noroff-API-Key": NOROFF_API_KEY,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ title, body })
      });

      if (!res.ok) throw new Error("Failed to create post");

      const json = await res.json();
      document.currentPosts = [json.data, ...document.currentPosts];
      displayPosts(document.currentPosts);

      newPostForm.reset();
      newPostForm.classList.add("hidden");
    } catch (err) {
      console.error(err);
      alert("Could not create post.");
    }
  });

  async function fetchUserPosts() {
    try {
      const res = await fetch(`${NOROFF_API_URL}/social/posts?_author=true`, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "X-Noroff-API-Key": NOROFF_API_KEY
        }
      });
      if (!res.ok) throw new Error("Failed to fetch posts");

      const json = await res.json();
      document.currentPosts = json.data.filter(p => p.author.email === user.email) || [];
      displayPosts(document.currentPosts);
    } catch (err) {
      console.error(err);
      postsContainer.innerHTML = "<p style='color:red;'>Could not load your posts.</p>";
    }
  }

  function displayPosts(posts) {
    postsContainer.innerHTML = "";

    posts.forEach(post => {
      const div = document.createElement("div");
      div.className = "post";
      div.innerHTML = `
        <h3 class="post-title">${escapeHtml(post.title)}</h3>
        <p class="post-body">${escapeHtml(post.body || "")}</p>
        <p>Created: ${new Date(post.created).toLocaleString()}</p>
        <div class="post-actions">
          <button class="button-blue edit-post-btn" data-post-id="${post.id}">Edit</button>
          <button class="button-blue delete-post-btn" data-post-id="${post.id}">Delete</button>
        </div>
      `;
      postsContainer.appendChild(div);
    });

    attachPostListeners();
  }

  function attachPostListeners() {
    document.querySelectorAll(".edit-post-btn").forEach(btn => {
      btn.addEventListener("click", () => {
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
            const res = await fetch(`${NOROFF_API_URL}/social/posts/${postId}`, {
              method: "PUT",
              headers: {
                Authorization: `Bearer ${accessToken}`,
                "X-Noroff-API-Key": NOROFF_API_KEY,
                "Content-Type": "application/json"
              },
              body: JSON.stringify({ title, body })
            });

            if (!res.ok) throw new Error("Failed to update post");

            const json = await res.json();
            document.currentPosts = document.currentPosts.map(p => p.id === json.data.id ? json.data : p);
            displayPosts(document.currentPosts);
          } catch (err) {
            console.error(err);
            alert("Could not update post.");
          }
        });

        cancelBtn.addEventListener("click", () => {
          displayPosts(document.currentPosts);
        });
      });
    });

    document.querySelectorAll(".delete-post-btn").forEach(btn => {
      btn.addEventListener("click", async () => {
        const postId = btn.dataset.postId;
        if (!confirm("Are you sure you want to delete this post?")) return;

        try {
          const res = await fetch(`${NOROFF_API_URL}/social/posts/${postId}`, {
            method: "DELETE",
            headers: {
              Authorization: `Bearer ${accessToken}`,
              "X-Noroff-API-Key": NOROFF_API_KEY
            }
          });

          if (!res.ok) throw new Error("Failed to delete post");

          document.currentPosts = document.currentPosts.filter(p => p.id != postId);
          displayPosts(document.currentPosts);
        } catch (err) {
          console.error(err);
          alert("Could not delete post.");
        }
      });
    });
  }

  fetchUserPosts();
});
