import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { RequireAuth } from "./components/common/ProtectedRoute"; // Dùng cái xịn này

// Import Pages
import LandingPage from "./pages/LandingPage";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import HomePage from "./pages/HomePage";
import ProfilePage from "./pages/ProfilePage";
import EditProfilePage from "./pages/EditProfilePage";
import PostDetailPage from "./pages/PostDetailPage";
import GlobalPage from "./pages/GlobalPage";
import NotificationsPage from "./pages/NotificationsPage";
import MessagesPage from "./pages/MessagesPage";
import SearchPage from "./pages/SearchPage";
import AdminDashboard from "./pages/AdminDashboard";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />

        {/* Protected Routes (Cần đăng nhập) */}
        <Route element={<RequireAuth />}>
          <Route path="/home" element={<HomePage />} />
          <Route path="/explore" element={<GlobalPage />} />
          <Route path="/notifications" element={<NotificationsPage />} />
          <Route path="/messages" element={<MessagesPage />} />
          <Route path="/search" element={<SearchPage />} />
          
          {/* Profile Routes */}
          <Route path="/profile/edit" element={<EditProfilePage />} />
          <Route path="/profile/:username" element={<ProfilePage />} />
          
          {/* Post Detail */}
          <Route path="/post/:id" element={<PostDetailPage />} />
          
          {/* Admin */}
          <Route path="/admin" element={<AdminDashboard />} />
        </Route>

        {/* Catch all - Redirect về Home nếu sai link */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}