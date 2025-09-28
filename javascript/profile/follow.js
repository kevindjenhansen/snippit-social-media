import { NOROFF_API_URL, NOROFF_API_KEY } from "../auth/config.js";

export async function initFollowButton(buttonId, authorName, accessToken) {
  const btn = document.getElementById(buttonId);
  if (!btn || !authorName) return;

  const currentUser = JSON.parse(localStorage.getItem("user"));
  const currentEmail = currentUser?.email;

  try {
    const res = await fetch(`${NOROFF_API_URL}/social/profiles/${encodeURIComponent(authorName)}?_followers=true`, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "X-Noroff-API-Key": NOROFF_API_KEY
      }
    });
    if (!res.ok) throw new Error("Failed to get profile followers");
    const json = await res.json();
    const followers = json.data?.followers || [];
    btn.textContent = followers.some(f => f.email === currentEmail) ? "Unfollow" : "Follow";
  } catch (err) {
    console.error("Error checking follow status:", err);
    btn.textContent = "Follow"; // fallback
  }

  btn.addEventListener("click", async () => {
    const currentlyFollowing = btn.textContent.trim() === "Unfollow";
    const action = currentlyFollowing ? "unfollow" : "follow";

    try {
      const url = `${NOROFF_API_URL}/social/profiles/${encodeURIComponent(authorName)}/${action}`;
      const res = await fetch(url, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "X-Noroff-API-Key": NOROFF_API_KEY
        }
      });

      if (!res.ok) throw new Error(`Follow toggle failed: ${res.status}`);

      btn.textContent = currentlyFollowing ? "Follow" : "Unfollow";

    } catch (err) {
      console.error("Error toggling follow:", err);
      alert("Could not update follow status.");
    }
  });
}
