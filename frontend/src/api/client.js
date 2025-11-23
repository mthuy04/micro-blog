// frontend/src/api/client.js
import axios from "axios";

// ĐỔI "localhost" -> "127.0.0.1"
const API_BASE_URL = "http://127.0.0.1:5000/api";

const TOKEN_KEY = "accessToken";
const USER_KEY = "currentUser";

const api = axios.create({
  baseURL: API_BASE_URL,
});

// 4. Interceptor: Tự động gắn token vào mọi request gửi đi
api.interceptors.request.use((config) => {
  const token = localStorage.getItem(TOKEN_KEY); // Sử dụng biến đã khai báo ở trên
  if (token) {
    config.headers = config.headers || {};
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// ====== Các hàm Helper ======

export function setToken(token) {
  if (!token) return;
  localStorage.setItem(TOKEN_KEY, token);
}

export function getToken() {
  return localStorage.getItem(TOKEN_KEY);
}

export function clearToken() {
  localStorage.removeItem(TOKEN_KEY);
}

export function setCurrentUser(user) {
  if (!user) return;
  localStorage.setItem(USER_KEY, JSON.stringify(user));
}

export function getCurrentUser() {
  const raw = localStorage.getItem(USER_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw);
  } catch (e) {
    console.error("Failed to parse currentUser from localStorage", e);
    return null;
  }
}

export function clearCurrentUser() {
  localStorage.removeItem(USER_KEY);
}

// Export mặc định
export default api;
