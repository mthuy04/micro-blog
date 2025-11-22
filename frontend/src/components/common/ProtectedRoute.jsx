// frontend/src/components/common/ProtectedRoute.jsx
import { Navigate, Outlet, useLocation } from "react-router-dom";
import { getToken, getCurrentUser } from "../../api/client";

// Bảo vệ route yêu cầu đăng nhập
export function RequireAuth() {
  const location = useLocation();
  const token = getToken();
  const user = getCurrentUser();

  if (!token || !user) {
    // redirect về login, nhớ vị trí cũ để quay lại
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return <Outlet />;
}

// Bảo vệ route admin
export function RequireAdmin() {
  const location = useLocation();
  const token = getToken();
  const user = getCurrentUser();

  if (!token || !user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (user.role !== "admin") {
    return <Navigate to="/home" replace />;
  }

  return <Outlet />;
}
