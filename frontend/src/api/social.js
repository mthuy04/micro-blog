import api from "./client";

// Lấy thông tin user theo username
export async function getProfile(username) {
  const res = await api.get(`/users/${username}`);
  return res.data;
}

// Lấy bài viết của user đó
export async function getUserPosts(username) {
  const res = await api.get(`/users/${username}/posts`);
  return res.data;
}

// Cập nhật profile
export async function updateProfile(data) {
  const res = await api.put("/users/profile", data);
  return res.data;
}

// Upload Avatar
export async function updateAvatar(formData) {
  const res = await api.post("/users/avatar", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return res.data;
}

// Follow / Unfollow
export async function followUser(userId) {
  const res = await api.post(`/users/${userId}/follow`);
  return res.data;
}

export async function unfollowUser(userId) {
  const res = await api.post(`/users/${userId}/unfollow`);
  return res.data;
}

export async function getSuggestions() {
    const res = await api.get("/users/suggestions");
    return res.data;
  }