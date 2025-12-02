import { useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { 
  Zap, Home, Globe, Bell, Mail, User, Settings, 
  LogOut, PenTool, Search 
} from "lucide-react";
import { getCurrentUser, clearToken, clearCurrentUser } from "../../api/client";
import { getImageUrl } from "../../utils/env";
import { getSuggestions, followUser, getUnreadCount } from "../../api/social";

export default function MainLayout({ children }) {
  const navigate = useNavigate();
  const location = useLocation();
  const user = getCurrentUser();
  
  // --- QUAN TRỌNG: Lấy ID ra biến riêng để so sánh ---
  const userId = user?.id; 
  // --------------------------------------------------

  const currentPath = location.pathname;
  const isHomePage = currentPath === "/home";

  const [keyword, setKeyword] = useState("");
  const [suggestions, setSuggestions] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);

  // --- SỬA LOGIC USE EFFECT ---
  useEffect(() => {
      // Chỉ chạy khi có userId (đã đăng nhập)
      if (userId) {
          // 1. Tải suggestions (Chỉ ở trang Home)
          if (isHomePage) {
              getSuggestions().then(setSuggestions).catch(console.error);
          }
          
          // 2. Gọi API đếm số thông báo lần đầu
          getUnreadCount().then(data => setUnreadCount(data.count)).catch(console.error);
          
          // 3. Interval: Cập nhật số thông báo mỗi 10s
          const interval = setInterval(() => {
              getUnreadCount().then(data => setUnreadCount(data.count)).catch(console.error);
          }, 10000); 
          
          return () => clearInterval(interval);
      }
      
  // QUAN TRỌNG: Dependency chỉ chứa [userId, isHomePage] (không được để object user vào đây)
  }, [userId, isHomePage]); 
  // ---------------------------

  function handleLogout() {
    clearToken();
    clearCurrentUser();
    navigate("/login");
  }
  
  const handleSearch = (e) => {
      if (e.key === 'Enter' && keyword.trim()) {
          navigate(`/search?q=${encodeURIComponent(keyword.trim())}`);
          setKeyword("");
      }
  };

  const handleFollowSidebar = async (targetId) => {
      try {
          await followUser(targetId);
          setSuggestions(prev => prev.filter(u => u.id !== targetId));
      } catch (err) { console.error(err); }
  };

  const getLinkClass = (path) => {
    const isActive = currentPath === path || (path !== "/home" && currentPath.startsWith(path));
    return `flex items-center gap-4 px-4 py-3.5 font-medium text-xl rounded-2xl transition-all group ${isActive ? "text-slate-900 bg-slate-100 font-bold" : "text-slate-500 hover:bg-slate-50 hover:text-indigo-600"}`;
  };
  
  const getMobileLinkClass = (path) => {
    const isActive = currentPath === path || (path !== "/home" && currentPath.startsWith(path));
    return `p-3 rounded-xl flex flex-col items-center justify-center transition-all ${isActive ? "text-indigo-600 bg-indigo-50" : "text-slate-400 hover:text-slate-600"}`;
  };

  const userAvatar = getImageUrl(user?.avatar) || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user?.username}`;
  const profileLink = `/profile/${user?.username}`;

  return (
    <div className="bg-slate-50 text-slate-900 min-h-screen font-sans overflow-x-hidden">
      
      {/* Mobile Top Bar */}
      <div className="lg:hidden fixed top-0 w-full bg-white/90 backdrop-blur-md border-b border-slate-200 z-50 px-4 py-3 flex justify-between items-center">
          <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center text-white"><Zap className="w-5 h-5" /></div>
          <h1 className="font-bold text-lg">Pulse</h1>
          <Link to={profileLink}>
            <div className="w-8 h-8 bg-slate-200 rounded-full overflow-hidden border border-slate-200"><img src={userAvatar} className="w-full h-full object-cover" alt="avatar" /></div>
          </Link>
      </div>

      <div className="max-w-7xl mx-auto min-h-screen flex justify-center relative">

        {/* LEFT SIDEBAR */}
        <aside className="hidden lg:flex w-72 flex-col fixed left-[max(0px,calc(50%-40rem))] top-0 h-screen border-r border-slate-200/60 bg-white/50 backdrop-blur-sm z-40 pt-6 px-6 pb-8">
             <div className="flex items-center gap-3 mb-10 px-2">
                <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center text-white shadow-lg"><Zap className="w-6 h-6" /></div>
                <span className="text-2xl font-extrabold tracking-tight text-slate-900">GROUP 3</span>
             </div>
             <nav className="flex-1 space-y-2">
                <Link to="/home" className={getLinkClass("/home")}><Home className="w-7 h-7" /><span>Home</span></Link>
                <Link to="/explore" className={getLinkClass("/explore")}><Globe className="w-7 h-7" /><span>Global</span></Link>
                
                <Link to="/notifications" className={`${getLinkClass("/notifications")} relative`}>
                    <div className="relative">
                        <Bell className="w-7 h-7" />
                        {unreadCount > 0 && (
                            <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] font-bold w-4 h-4 flex items-center justify-center rounded-full border-2 border-white">
                                {unreadCount > 9 ? "9+" : unreadCount}
                            </span>
                        )}
                    </div>
                    <span>Notifications</span>
                </Link>

                <Link to="/messages" className={getLinkClass("/messages")}><Mail className="w-7 h-7" /><span>Messages</span></Link>
                <Link to={profileLink} className={getLinkClass(profileLink)}><User className="w-7 h-7" /><span>Profile</span></Link>
                {user?.is_admin && <Link to="/admin" className={getLinkClass("/admin")}><Settings className="w-7 h-7" /><span>Admin</span></Link>}
             </nav>
             
             <button onClick={() => navigate("/home")} className="w-full bg-slate-900 text-white py-4 rounded-2xl font-bold shadow-xl hover:shadow-2xl transition-all mt-6 flex items-center justify-center gap-2">
                <PenTool className="w-5 h-5" /> <span>Post</span>
             </button>

             <div className="mt-auto pt-6 border-t border-slate-100">
                <button onClick={handleLogout} className="w-full flex items-center gap-3 p-3 rounded-2xl hover:bg-slate-100 transition-colors text-left group">
                  <img src={userAvatar} className="w-10 h-10 rounded-full bg-indigo-50 border border-slate-200 object-cover" alt="avatar" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold text-slate-900 truncate">{user?.name}</p>
                    <p className="text-xs text-slate-500 truncate">Log out</p>
                  </div>
                  <LogOut className="w-5 h-5 text-slate-400 group-hover:text-red-600" />
                </button>
             </div>
        </aside>

        {/* CONTENT WRAPPER */}
        <div className={`flex-1 w-full lg:ml-72 pt-16 lg:pt-0 pb-20 lg:pb-0 min-h-screen ${isHomePage ? "xl:mr-[350px]" : ""}`}>
             {children}
        </div>

        {/* RIGHT SIDEBAR */}
        {isHomePage && (
            <aside className="hidden xl:block w-[350px] fixed right-[max(0px,calc(50%-40rem))] top-0 h-screen overflow-y-auto pb-8 pt-6 pl-8 pr-6 border-l border-slate-200/0 z-40">
                <div className="relative group mb-6">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400"><Search className="w-5 h-5" /></div>
                    <input 
                        type="text" 
                        className="w-full pl-12 pr-4 py-3 bg-slate-100 border-transparent rounded-full text-sm font-medium outline-none focus:bg-white focus:ring-2 focus:ring-indigo-500/20 transition-all" 
                        placeholder="Search Pulse" 
                        value={keyword}
                        onChange={(e) => setKeyword(e.target.value)}
                        onKeyDown={handleSearch}
                    />
                </div>
                
                <div className="bg-slate-100/50 rounded-2xl border border-slate-100 p-4">
                    <h3 className="font-bold text-xl text-slate-900 mb-4 px-2">Who to follow</h3>
                    <div className="space-y-4">
                        {suggestions.length === 0 && <p className="text-sm text-slate-500 px-2">No new suggestions.</p>}
                        {suggestions.map((u) => (
                            <div key={u.id} className="flex items-center justify-between px-2">
                                <div className="flex items-center gap-3">
                                    <img src={getImageUrl(u.avatar) || `https://api.dicebear.com/7.x/avataaars/svg?seed=${u.username}`} className="w-10 h-10 rounded-full bg-white object-cover border border-slate-200" alt="sugg" />
                                    <div>
                                        <Link to={`/profile/${u.username}`} className="font-bold text-sm text-slate-900 hover:underline cursor-pointer">{u.name}</Link>
                                        <p className="text-xs text-slate-500">@{u.username}</p>
                                    </div>
                                </div>
                                <button onClick={() => handleFollowSidebar(u.id)} className="bg-slate-900 text-white text-xs font-bold px-3 py-1.5 rounded-full hover:bg-slate-800 transition-colors">Follow</button>
                            </div>
                        ))}
                    </div>
                </div>
                
                <div className="bg-slate-100/50 rounded-2xl border border-slate-100 p-4 mt-6">
                    <h3 className="font-bold text-xl text-slate-900 mb-4 px-2">Trends for you</h3>
                    <div className="space-y-1">
                        <div className="hover:bg-slate-200/50 p-2 rounded-xl cursor-pointer"><p className="font-bold text-slate-900">#VNUIS</p><p className="text-xs text-slate-500">12K posts</p></div>
                        <div className="hover:bg-slate-200/50 p-2 rounded-xl cursor-pointer"><p className="font-bold text-slate-900">#FinalExam</p><p className="text-xs text-slate-500">5K posts</p></div>
                    </div>
                </div>
            </aside>
        )}

      </div>

      {/* Mobile Bottom Nav */}
      <nav className="lg:hidden fixed bottom-0 w-full bg-white border-t border-slate-200 z-50 px-6 py-2 flex justify-between items-center pb-safe">
            <Link to="/home" className={getMobileLinkClass("/home")}><Home className="w-6 h-6" /></Link>
            <Link to="/explore" className={getMobileLinkClass("/explore")}><Globe className="w-6 h-6" /></Link>
            
            <div onClick={() => navigate("/home")} className="w-12 h-12 bg-indigo-600 rounded-full flex items-center justify-center text-white -mt-8 shadow-lg border-4 border-slate-50 cursor-pointer">
                <PenTool className="w-6 h-6" />
            </div>
            
            <Link to="/notifications" className={getMobileLinkClass("/notifications")}><Bell className="w-6 h-6" /></Link>
            <Link to={profileLink} className={getMobileLinkClass(profileLink)}><User className="w-6 h-6" /></Link>
      </nav>

    </div>
  );
}