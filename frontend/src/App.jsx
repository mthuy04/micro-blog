import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { getToken } from "./api/client";

// Import các trang
import LandingPage from "./pages/LandingPage";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import HomePage from "./pages/HomePage";
import ProfilePage from "./pages/ProfilePage";
import EditProfilePage from "./pages/EditProfilePage";
import PostDetailPage from "./pages/PostDetailPage"; // Đảm bảo file này đã được tạo

// Component bảo vệ (chỉ cho phép vào khi đã đăng nhập)
function ProtectedRoute({ children }) {
  const token = getToken();
  return token ? children : <Navigate to="/login" replace />;
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Trang công khai */}
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />

        {/* Trang yêu cầu đăng nhập */}
        <Route 
          path="/home" 
          element={
            <ProtectedRoute>
              <HomePage />
            </ProtectedRoute>
          } 
        />
        
        <Route 
          path="/profile/:username" 
          element={
            <ProtectedRoute>
              <ProfilePage />
            </ProtectedRoute>
          } 
        />

        <Route 
          path="/profile/edit" 
          element={
            <ProtectedRoute>
              <EditProfilePage />
            </ProtectedRoute>
          } 
        />

        {/* --- ĐÂY LÀ DÒNG QUAN TRỌNG BẠN ĐANG THIẾU --- */}
        <Route 
          path="/post/:id" 
          element={
            <ProtectedRoute>
              <PostDetailPage />
            </ProtectedRoute>
          } 
        />
        {/* --------------------------------------------- */}

        {/* Fallback: Nếu nhập link linh tinh thì về Home */}
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </BrowserRouter>
  );
}