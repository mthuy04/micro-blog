// frontend/src/api/auth.js
import api from "./client";

export async function register(payload) {
  // POST /api/auth/register
  const res = await api.post("/auth/register", payload);
  return res.data;
}

export async function login(payload) {
  // POST /api/auth/login
  const res = await api.post("/auth/login", payload);
  // Giả định backend trả { access_token, user }
  const { access_token, user } = res.data;
  if (access_token) localStorage.setItem("accessToken", access_token);
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
