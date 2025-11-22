// frontend/src/api/posts.js
import api from "./client";

// Lấy newsfeed chính
export async function getFeed() {
  const res = await api.get("/posts/feed"); // GET /api/posts/feed
  return res.data;
}

// Tạo post mới (text + image)
export async function createPost(formData) {
  const res = await api.post("/posts", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return res.data;
}

// Toggle like / unlike 1 post
export async function toggleLike(postId) {
  const res = await api.post(`/posts/${postId}/like`);
  // Backend trả về post đã update (likes_count, liked_by_me, ...)
  return res.data;
}

// Lấy chi tiết 1 post
export async function getPost(postId) {
  const res = await api.get(`/posts/${postId}`);
  // Có thể là { post, comments } hoặc chỉ post
  return res.data;
}

// Tạo comment cho post
export async function createComment(postId, payload) {
  // payload: { content: "..." }
  const res = await api.post(`/posts/${postId}/comments`, payload);
  return res.data;
}
