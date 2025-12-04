import React from "react";
import { Link, useLocation } from "react-router-dom";

export default function Sidebar({ onLogout, unreadCount = 0 }) {
  const { pathname } = useLocation();

  const menuItem = (to, label) => (
    <Link
      to={to}
      className={`flex items-center gap-3 px-4 py-2 rounded-xl hover:bg-slate-100 ${
        pathname === to ? "font-semibold text-blue-600" : "text-slate-700"
      }`}
    >
      <span>{label}</span>
    </Link>
  );

  return (
    <aside className="hidden md:flex md:flex-col w-64 border-r bg-white p-4">
      <div className="mb-6 px-4 text-2xl font-bold text-blue-600">CAMPUSTALK</div>
      {menuItem("/home", "Home")}
      {menuItem("/home/global", "Global")}
      <div className="relative">
        {menuItem("/home/notifications", "Notifications")}
        {unreadCount > 0 && (
          <span className="absolute right-6 top-2 w-2 h-2 rounded-full bg-red-500" />
        )}
      </div>
      {menuItem("/home/messages", "Messages")}
      {menuItem("/home/profile", "Profile")}
      {menuItem("/admin", "Admin")}
      <button
        onClick={onLogout}
        className="mt-auto px-4 py-2 rounded-xl bg-slate-100 text-slate-700 hover:bg-slate-200 text-left"
      >
        Logout
      </button>
    </aside>
  );
}
