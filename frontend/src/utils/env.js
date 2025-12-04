// frontend/src/utils/env.js

// Lấy link API từ biến môi trường (Cái bạn đã set trên Vercel)
// Nếu có đuôi "/api" thì cắt bỏ đi để lấy root domain
const API_URL = import.meta.env.VITE_API_URL || "http://127.0.0.1:5000";
export const BASE_URL = API_URL.replace("/api", ""); 

export function getImageUrl(path, seed = "default") {
  if (!path) {
      // Fallback sang DiceBear nếu không có ảnh
      // seed giúp avatar cố định theo tên user, không bị nhảy lung tung
      return `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(seed)}`;
  }
  
  // 1. Nếu là link Cloudinary hoặc DiceBear -> Giữ nguyên
  if (path.startsWith("http")) return path;
  
  // 2. Nếu là Blob (Preview ảnh khi upload) -> Giữ nguyên
  if (path.startsWith("blob:")) return path;

  // 3. Nếu là link static cũ (/static/...) -> Nối với Server thật (Render)
  if (path.startsWith("/static")) return `${BASE_URL}${path}`;
  
  return path;
}