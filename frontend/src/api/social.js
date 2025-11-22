// frontend/src/api/social.js
import api from "./client";

// Gợi ý "Who to follow" ở sidebar
export async function getSuggestions() {
  const res = await api.get("/social/suggestions"); // GET /api/social/suggestions
  return res.data;
}

// Follow 1 user
export async function followUser(userId) {
  const res = await api.post(`/social/follow/${userId}`);
  return res.data;
}

// Unfollow 1 user
export async function unfollowUser(userId) {
  const res = await api.post(`/social/unfollow/${userId}`);
  return res.data;
}

// Lấy thông tin profile theo username
export async function getProfile(username) {
  const res = await api.get(`/social/profile/${username}`); // GET /api/social/profile/<username>
  return res.data;
}

// Lấy các post của 1 user
export async function getUserPosts(username) {
  const res = await api.get(`/social/profile/${username}/posts`);
  return res.data;
}

// Update profile (tên, bio, location, website)
export async function updateProfile(payload) {
  // PATCH /api/social/me
  const res = await api.patch("/social/me", payload);
  return res.data;
}

// Upload avatar mới
export async function updateAvatar(formData) {
  // POST /api/uploads/avatar
  const res = await api.post("/uploads/avatar", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return res.data;
}
