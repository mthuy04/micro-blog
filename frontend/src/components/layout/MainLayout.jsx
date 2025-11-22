// frontend/src/components/layout/MainLayout.jsx
import { Link, NavLink } from "react-router-dom";
import { getCurrentUser } from "../../api/client";
import { getSuggestions } from "../../api/social";
import { useEffect, useState } from "react";

export default function MainLayout({ active = "home", children }) {
  const currentUser = getCurrentUser();
  const [suggestions, setSuggestions] = useState([]);

  useEffect(() => {
    getSuggestions()
      .then(setSuggestions)
      .catch(() => setSuggestions([]));
  }, []);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <div className="max-w-6xl mx-auto flex">
        {/* Sidebar trái */}
        <aside className="w-64 hidden md:flex flex-col border-r border-slate-200 px-6 py-6">
          <div className="flex items-center gap-2 mb-8">
            <div className="w-9 h-9 rounded-xl bg-indigo-600 flex items-center justify-center text-white text-lg font-bold">
              ⚡
            </div>
            <span className="font-semibold tracking-tight">GROUP 3</span>
          </div>

          <nav className="flex flex-col gap-2 text-sm font-medium">
            <NavItem to="/home" icon="🏠" label="Home" active={active === "home"} />
            <NavItem to="/home" icon="🌍" label="Global" active={false} />
            <NavItem to="#" icon="🔔" label="Notifications" active={active === "notifications"} />
            <NavItem
              to={`/profile/${currentUser?.username || "me"}`}
              icon="👤"
              label="Profile"
              active={active === "profile"}
            />
            {currentUser?.role === "admin" && (
              <NavItem
                to="/admin"
                icon="🛠"
                label="Admin"
                active={active === "admin"}
              />
            )}
          </nav>

          <div className="mt-auto pt-6 border-t border-slate-200 flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-slate-200 overflow-hidden">
              {currentUser?.avatar_url && (
                <img
                  src={currentUser.avatar_url}
                  alt={currentUser.full_name}
                  className="w-full h-full object-cover"
                />
              )}
            </div>
            <div className="flex flex-col">
              <span className="font-semibold text-xs">
                {currentUser?.full_name || "Student User"}
              </span>
              <span className="text-xs text-slate-500">
                @{currentUser?.username || "username"}
              </span>
            </div>
          </div>
        </aside>

        {/* Cột giữa */}
        <main className="flex-1 min-h-screen border-r border-slate-200 bg-white">
          {children}
        </main>

        {/* Cột phải */}
        <aside className="hidden lg:block w-80 px-6 py-6">
          {/* Search giả lập */}
          <div className="mb-4">
            <input
              type="text"
              placeholder="Search CampusTalk"
              className="w-full rounded-full px-4 py-2 text-sm bg-slate-100 border border-transparent focus:border-indigo-500 focus:bg-white outline-none"
            />
          </div>

          {/* Who to follow */}
          <div className="bg-slate-100 rounded-2xl p-4 mb-4">
            <h3 className="font-semibold text-sm mb-3">Who to follow</h3>
            <div className="flex flex-col gap-3">
              {suggestions.slice(0, 3).map((u) => (
                <Link
                  key={u.id}
                  to={`/profile/${u.username}`}
                  className="flex items-center justify-between"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full bg-slate-200 overflow-hidden">
                      {u.avatar_url && (
                        <img
                          src={u.avatar_url}
                          alt={u.full_name}
                          className="w-full h-full object-cover"
                        />
                      )}
                    </div>
                    <div>
                      <p className="text-xs font-semibold">{u.full_name}</p>
                      <p className="text-xs text-slate-500">@{u.username}</p>
                    </div>
                  </div>
                  <button className="text-xs px-3 py-1 rounded-full bg-slate-900 text-white">
                    Follow
                  </button>
                </Link>
              ))}
            </div>
          </div>

          {/* Trends mock */}
          <div className="bg-slate-100 rounded-2xl p-4 text-xs">
            <h3 className="font-semibold mb-3">Trends for you</h3>
            <div className="space-y-2">
              <div>
                <p className="text-slate-500">Day · Trending</p>
                <p className="font-semibold">#19/11</p>
              </div>
              <div>
                <p className="text-slate-500">Design · Trending</p>
                <p className="font-semibold">Minimalism</p>
              </div>
              <div>
                <p className="text-slate-500">Special Day · Trending</p>
                <p className="font-semibold">Teacher Day</p>
              </div>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}

function NavItem({ to, icon, label, active }) {
  const base =
    "flex items-center gap-3 px-3 py-2 rounded-full text-sm transition-colors";
  const activeCls = active
    ? "bg-slate-900 text-white"
    : "text-slate-700 hover:bg-slate-100";

  return (
    <NavLink to={to} className={`${base} ${activeCls}`}>
      <span>{icon}</span>
      <span>{label}</span>
    </NavLink>
  );
}
