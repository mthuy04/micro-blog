// frontend/src/pages/AdminDashboard.jsx
import { useEffect, useState } from "react";
import MainLayout from "../components/layout/MainLayout";
import { getAdminOverview } from "../api/admin";
import Toast from "../components/common/Toast";

export default function AdminDashboard() {
  const [data, setData] = useState(null);
  const [toast, setToast] = useState({ type: "success", message: "" });

  useEffect(() => {
    async function load() {
      try {
        const res = await getAdminOverview();
        setData(res);
      } catch (err) {
        console.error(err);
        setToast({ type: "error", message: "Failed to load admin overview" });
      }
    }
    load();
  }, []);

  const stats = data?.stats || {};

  return (
    <MainLayout active="admin">
      <div className="border-b border-slate-200 px-4 py-3 font-semibold">
        Admin Dashboard
      </div>

      {!data ? (
        <div className="p-6 text-sm text-slate-500">Loading...</div>
      ) : (
        <div className="p-4 space-y-6">
          {/* Cards */}
          <div className="grid md:grid-cols-4 gap-4 text-xs">
            <StatCard
              label="Total Users"
              value={stats.total_users}
              accent="bg-indigo-100 text-indigo-700"
            />
            <StatCard
              label="Active Now"
              value={stats.active_now}
              accent="bg-emerald-100 text-emerald-700"
            />
            <StatCard
              label="Total Posts"
              value={stats.total_posts}
              accent="bg-sky-100 text-sky-700"
            />
            <StatCard
              label="Pending Reports"
              value={stats.pending_reports}
              accent="bg-red-100 text-red-700"
            />
          </div>

          {/* Users table */}
          <div className="bg-white rounded-2xl border border-slate-200">
            <div className="px-4 py-3 border-b border-slate-100 flex justify-between items-center">
              <h3 className="font-semibold text-sm">Recent users</h3>
            </div>
            <div className="divide-y divide-slate-100 text-xs">
              {(data.recent_users || []).map((u) => (
                <div
                  key={u.id}
                  className="flex items-center justify-between px-4 py-2"
                >
                  <div>
                    <p className="font-semibold">{u.full_name}</p>
                    <p className="text-slate-500 text-[11px]">
                      {u.email} · @{u.username}
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="px-2 py-0.5 rounded-full bg-slate-100 text-[11px]">
                      {u.role}
                    </span>
                    <span className="text-slate-400 text-[11px]">
                      Joined {u.joined_human}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Posts table */}
          <div className="bg-white rounded-2xl border border-slate-200">
            <div className="px-4 py-3 border-b border-slate-100 flex justify-between items-center">
              <h3 className="font-semibold text-sm">Recent posts</h3>
            </div>
            <div className="divide-y divide-slate-100 text-xs">
              {(data.recent_posts || []).map((p) => (
                <div
                  key={p.id}
                  className="flex items-center justify-between px-4 py-2"
                >
                  <div className="max-w-xs">
                    <p className="font-semibold text-[12px]">
                      {p.author_name} · @{p.author_username}
                    </p>
                    <p className="text-slate-500 text-[11px] truncate">
                      {p.content}
                    </p>
                  </div>
                  <div className="flex items-center gap-4 text-[11px] text-slate-500">
                    <span>❤️ {p.likes_count}</span>
                    <span>💬 {p.comments_count}</span>
                    <span>{p.created_at_human}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      <Toast
        type={toast.type}
        message={toast.message}
        onClose={() => setToast({ ...toast, message: "" })}
      />
    </MainLayout>
  );
}

function StatCard({ label, value, accent }) {
  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-4 space-y-1">
      <p className="text-[11px] text-slate-500">{label}</p>
      <p className="text-lg font-semibold">{value ?? 0}</p>
      <div
        className={`inline-flex items-center px-2 py-0.5 rounded-full text-[11px] ${accent}`}
      >
        • live
      </div>
    </div>
  );
}
