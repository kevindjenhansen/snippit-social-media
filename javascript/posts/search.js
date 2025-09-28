// /javascript/search.js
export function initPostSearch({ searchInput, searchBtn, clearSearchBtn, fetchPosts, displayPosts, accessToken, postsContainer }) {
  
  searchBtn?.addEventListener("click", async () => {
    const query = searchInput.value.trim();
    if (!query) return alert("Please enter a search query");

    try {
      const res = await fetch(`https://v2.api.noroff.dev/social/posts/search?q=${encodeURIComponent(query)}`, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "X-Noroff-API-Key": "d0bf8e63-4dd2-4fb2-9744-b973a91883b1"
        }
      });

      if (!res.ok) throw new Error("Search failed");

      const json = await res.json();
      const posts = json.data || [];

      if (posts.length === 0) {
        postsContainer.innerHTML = "<p>No posts found for your query.</p>";
      } else {
        document.currentPosts = posts;
        displayPosts(posts);
      }
    } catch (err) {
      console.error(err);
      alert("Could not search posts.");
    }
  });

  clearSearchBtn?.addEventListener("click", () => {
    searchInput.value = "";
    fetchPosts();
  });

  searchInput?.addEventListener("keypress", (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      searchBtn.click();
    }
  });
}
