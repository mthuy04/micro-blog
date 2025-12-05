import api from "./client";

export async function getFeed(type = "for_you", page = 1) {
    const res = await api.get(`/posts/feed?type=${type}&page=${page}`);
    return res.data;
}

// Cập nhật để nhận formData (gồm file)
export async function createPost(formData) {
  const res = await api.post("/posts", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return res.data;
}

export async function toggleLike(postId) {
  const res = await api.post(`/posts/${postId}/likes`);
  return res.data;
}

export async function getPost(id) {
  const res = await api.get(`/posts/${id}`);
  return res.data;
}

export async function createComment(postId, payload) {
  const res = await api.post(`/posts/${postId}/comments`, payload);
  return res.data;
}
export async function updatePost(postId, content) {
    const res = await api.put(`/posts/${postId}`, { content });
    return res.data;
  }
  
  export async function deletePost(postId) {
    const res = await api.delete(`/posts/${postId}`);
    return res.data;
  }

  import api from "./client";

export async function getFeed(type = "for_you", page = 1) {
    const res = await api.get(`/posts/feed?type=${type}&page=${page}`);
    return res.data;
}

export async function createPost(formData) {
  const res = await api.post("/posts", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return res.data;
}

export async function toggleLike(postId) {
  const res = await api.post(`/posts/${postId}/likes`);
  return res.data;
}

export async function getPost(id) {
  const res = await api.get(`/posts/${id}`);
  return res.data;
}

export async function createComment(postId, payload) {
  const res = await api.post(`/posts/${postId}/comments`, payload);
  return res.data;
}

export async function updatePost(postId, content) {
    const res = await api.put(`/posts/${postId}`, { content });
    return res.data;
}
  
export async function deletePost(postId) {
    const res = await api.delete(`/posts/${postId}`);
    return res.data;
}

// --- MỚI THÊM: Xoá Comment ---
export async function deleteComment(commentId) {
    const res = await api.delete(`/comments/${commentId}`);
    return res.data;
}