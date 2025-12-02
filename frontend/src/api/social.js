import api from "./client";

// --- PROFILE & USER ---

// Lấy thông tin user theo username
export async function getProfile(username) {
  const res = await api.get(`/users/${username}`);
  return res.data;
}

// Lấy bài viết của user (Hỗ trợ các tab: posts, replies, media, likes)
export async function getUserPosts(username, tab = "posts") {
  const res = await api.get(`/users/${username}/posts?tab=${tab}`);
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

// --- FOLLOW SYSTEM ---

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

// --- NOTIFICATIONS ---

export async function getNotifications() {
    const res = await api.get("/notifications");
    return res.data;
}
  
export async function markRead(id) {
    const res = await api.post(`/notifications/${id}/read`);
    return res.data;
}

export async function getUnreadCount() {
    const res = await api.get("/notifications/count");
    return res.data;
}

// --- SEARCH ---

export async function searchSystem(query) {
    const res = await api.get(`/search?q=${encodeURIComponent(query)}`);
    return res.data;
}