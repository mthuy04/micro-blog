// frontend/src/api/client.js
import axios from "axios";

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:5000/api";

// ====== LocalStorage keys ======
const TOKEN_KEY = "accessToken";
const USER_KEY = "currentUser";

// ====== Axios instance ======
const api = axios.create({
  baseURL: API_BASE_URL,
});

// Tự động gắn JWT token vào header Authorization
api.interceptors.request.use((config) => {
  const token = getToken();
  if (token) {
    config.headers = config.headers || {};
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// ====== Helpers cho token ======
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

// ====== Helpers cho current user (lưu object JSON) ======
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

// Export mặc định: axios instance
export default api;
