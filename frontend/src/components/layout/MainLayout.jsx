import { Link, useLocation, useNavigate } from "react-router-dom";
import { 
  Zap, Home, Globe, Bell, Mail, User, Settings, 
  LogOut, PenTool 
} from "lucide-react";
import { getCurrentUser, clearToken, clearCurrentUser } from "../../api/client";
import { getImageUrl } from "../../utils/env";

export default function MainLayout({ children }) {
  const navigate = useNavigate();
  const location = useLocation();
  const user = getCurrentUser();
  const active = location.pathname;

  function handleLogout() {
    clearToken();
    clearCurrentUser();
    navigate("/login");
  }

  // Class cho Desktop Sidebar
  const getLinkClass = (path) => {
    const isActive = active === path || (path !== "/home" && active.startsWith(path));
    const base = "flex items-center gap-4 px-4 py-3.5 font-medium text-xl rounded-2xl transition-all group";
    return isActive 
      ? `${base} text-slate-900 bg-slate-100 font-bold`
      : `${base} text-slate-500 hover:bg-slate-50 hover:text-indigo-600`;
  };

  // Class cho Mobile Bottom Bar
  const getMobileLinkClass = (path) => {
    const isActive = active === path || (path !== "/home" && active.startsWith(path));
    return `p-3 rounded-xl flex flex-col items-center justify-center transition-all ${
      isActive ? "text-indigo-600 bg-indigo-50" : "text-slate-400 hover:text-slate-600"
    }`;
  };

  // Xử lý avatar
  const userAvatar = getImageUrl(user?.avatar) || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user?.username}`;

  return (
    <div className="bg-slate-50 text-slate-900 min-h-screen font-sans">
      <div className="max-w-7xl mx-auto min-h-screen flex justify-center relative">

        {/* DESKTOP SIDEBAR */}
        <aside className="hidden lg:flex w-72 flex-col fixed left-[max(0px,calc(50%-40rem))] top-0 h-screen border-r border-slate-200/60 bg-white/50 backdrop-blur-sm z-20 pt-6 px-6 pb-8">
          <div className="flex items-center gap-3 mb-10 px-2">
            <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center text-white shadow-lg">
              <Zap className="w-6 h-6" />
            </div>
            <span className="text-2xl font-extrabold tracking-tight text-slate-900">GROUP 3</span>
          </div>

          <nav className="flex-1 space-y-2">
            <Link to="/home" className={getLinkClass("/home")}><Home className="w-7 h-7" /><span>Home</span></Link>
            <Link to="/home" className={getLinkClass("/explore")}><Globe className="w-7 h-7" /><span>Global</span></Link>
            <Link to="#" className={getLinkClass("/notifications")}><Bell className="w-7 h-7" /><span>Notifications</span></Link>
            <Link to="#" className={getLinkClass("/messages")}><Mail className="w-7 h-7" /><span>Messages</span></Link>
            <Link to={`/profile/${user?.username}`} className={getLinkClass(`/profile/${user?.username}`)}><User className="w-7 h-7" /><span>Profile</span></Link>
            {user?.is_admin && <Link to="/admin" className={getLinkClass("/admin")}><Settings className="w-7 h-7" /><span>Admin</span></Link>}
          </nav>

          <button className="w-full bg-slate-900 text-white py-4 rounded-2xl font-bold shadow-xl hover:shadow-2xl transition-all mt-6 flex items-center justify-center gap-2">
             <PenTool className="w-5 h-5" /> <span>Post</span>
          </button>

          <div className="mt-auto pt-6 border-t border-slate-100">
            <button onClick={handleLogout} className="w-full flex items-center gap-3 p-3 rounded-2xl hover:bg-slate-100 transition-colors text-left group">
              <img src={userAvatar} className="w-10 h-10 rounded-full bg-indigo-50 border border-slate-200 object-cover" alt="avatar" />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-bold text-slate-900 truncate">{user?.name || "User"}</p>
                <p className="text-xs text-slate-500 truncate">Log out</p>
              </div>
              <LogOut className="w-5 h-5 text-slate-400 group-hover:text-red-600" />
            </button>
          </div>
        </aside>

        {/* MOBILE TOP BAR */}
        <div className="lg:hidden fixed top-0 w-full bg-white/90 backdrop-blur-md border-b border-slate-200 z-30 px-4 py-3 flex justify-between items-center">
            <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center text-white"><Zap className="w-5 h-5" /></div>
            <h1 className="font-bold text-lg">Pulse</h1>
            <div className="w-8 h-8 bg-slate-200 rounded-full overflow-hidden border border-slate-200">
                 <img src={userAvatar} className="w-full h-full object-cover" alt="avatar" />
            </div>
        </div>

        {/* CONTENT WRAPPER */}
        <div className="flex w-full lg:ml-72 pt-16 lg:pt-0 pb-20 lg:pb-0 justify-center">
            {children}
        </div>

        {/* MOBILE BOTTOM NAV */}
        <nav className="lg:hidden fixed bottom-0 w-full bg-white border-t border-slate-200 z-30 px-6 py-2 flex justify-between items-center pb-safe">
            <Link to="/home" className={getMobileLinkClass("/home")}><Home className="w-6 h-6" /></Link>
            <div className="w-12 h-12 bg-indigo-600 rounded-full flex items-center justify-center text-white -mt-8 shadow-lg border-4 border-slate-50 cursor-pointer">
                <PenTool className="w-6 h-6" />
            </div>
            <Link to={`/profile/${user?.username}`} className={getMobileLinkClass(`/profile/${user?.username}`)}><User className="w-6 h-6" /></Link>
        </nav>

      </div>
    </div>
  );
}