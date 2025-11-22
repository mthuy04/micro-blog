// frontend/src/api/admin.js
import api from "./client";

// Lấy dữ liệu tổng quan cho AdminDashboard
export async function getAdminOverview() {
  // Backend: GET /api/admin/overview
  // Trả về dạng:
  // {
  //   stats: { total_users, active_now, total_posts, pending_reports },
  //   recent_users: [...],
  //   recent_posts: [...]
  // }
  const res = await api.get("/admin/overview");
  return res.data;
}
