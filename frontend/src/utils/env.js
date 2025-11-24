export const BASE_URL = "http://127.0.0.1:5000";

export function getImageUrl(path, seed = "default") {
  // Nếu không có path, trả về ảnh mặc định ngay lập tức
  if (!path) {
      return `https://api.dicebear.com/7.x/avataaars/svg?seed=${seed}`;
  }
  
  if (path.startsWith("http")) return path;
  if (path.startsWith("/static")) return `${BASE_URL}${path}`;
  
  return path;
}