export const BASE_URL = "http://127.0.0.1:5000";

export function getImageUrl(path) {
  if (!path) return null;
  if (path.startsWith("http")) return path;
  return `${BASE_URL}${path}`;
}