// frontend/src/api/auth.js
import api from "./client";

export async function register(payload) {
  // POST /api/auth/register
  const res = await api.post("/auth/register", payload);
  return res.data;
}

export async function login(payload) {
    const res = await api.post("/auth/login", payload);
    
    // === SỬA ĐOẠN NÀY ===
    // Backend trả về key là "token", không phải "access_token"
    const { token, user } = res.data; 
    
    // Sửa access_token thành token
    if (token) {
        localStorage.setItem("accessToken", token);
    }
    // ====================
  
    if (user) localStorage.setItem("currentUser", JSON.stringify(user));
    return res.data;
  }

export function logout() {
  localStorage.removeItem("accessToken");
  localStorage.removeItem("currentUser");
}

export function getCurrentUser() {
  const raw = localStorage.getItem("currentUser");
  return raw ? JSON.parse(raw) : null;
}
