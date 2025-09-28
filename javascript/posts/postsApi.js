import { NOROFF_API_KEY, NOROFF_API_URL } from "../auth/config.js";

export async function fetchPosts(accessToken) {
  const res = await fetch(`${NOROFF_API_URL}/social/posts?_author=true`, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "X-Noroff-API-Key": NOROFF_API_KEY,
    },
  });
  if (!res.ok) throw new Error("Failed to fetch posts");
  const json = await res.json();
  return json.data;
}

export async function createPost(title, body, accessToken) {
  const res = await fetch(`${NOROFF_API_URL}/social/posts`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "X-Noroff-API-Key": NOROFF_API_KEY,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ title, body }),
  });
  if (!res.ok) throw new Error("Failed to create post");
  return (await res.json()).data;
}

export async function updatePost(postId, title, body, accessToken) {
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
  return (await res.json()).data;
}

export async function deletePost(postId, accessToken) {
  const res = await fetch(`${NOROFF_API_URL}/social/posts/${postId}`, {
    method: "DELETE",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "X-Noroff-API-Key": NOROFF_API_KEY,
    },
  });
  if (!res.ok) throw new Error("Failed to delete post");
  return true;
}
