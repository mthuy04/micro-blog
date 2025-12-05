import { useEffect, useState } from "react";
import MainLayout from "../components/layout/MainLayout";
import { getAdminOverview } from "../api/admin";
import Toast from "../components/common/Toast";
import { Users, FileText, Activity, AlertCircle } from "lucide-react";

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

  const stats = data?.stats || { total_users: 0, total_posts: 0, active_now: 0, pending_reports: 0 };

  return (
    <MainLayout active="admin">
      <div className="w-full max-w-6xl mx-auto p-6 min-h-screen pb-20">
        
        <div className="mb-8">
            <h1 className="text-3xl font-bold text-slate-900">Admin Dashboard</h1>
            <p className="text-slate-500 mt-1">Overview of system performance and activities.</p>
        </div>

        {!data ? (
          <div className="p-10 text-center text-slate-500 animate-pulse">Loading dashboard data...</div>
        ) : (
          <div className="space-y-8">
            {/* Stats Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <StatCard
                icon={<Users className="w-5 h-5"/>}
                label="Total Users"
                value={stats.total_users}
                color="bg-indigo-50 text-indigo-600"
              />
              <StatCard
                icon={<Activity className="w-5 h-5"/>}
                label="Active Now"
                value={stats.active_now}
                color="bg-emerald-50 text-emerald-600"
                live
              />
              <StatCard
                icon={<FileText className="w-5 h-5"/>}
                label="Total Posts"
                value={stats.total_posts}
                color="bg-blue-50 text-blue-600"
              />
              <StatCard
                icon={<AlertCircle className="w-5 h-5"/>}
                label="Reports"
                value={stats.pending_reports}
                color="bg-orange-50 text-orange-600"
              />
            </div>

            <div className="grid lg:grid-cols-2 gap-8">
                {/* Recent Users Table */}
                <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
                    <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
                        <h3 className="font-bold text-slate-900">New Users</h3>
                    </div>
                    <div className="divide-y divide-slate-100">
                        {(data.recent_users || []).map((u) => (
                            <div key={u.id} className="flex items-center justify-between px-6 py-4 hover:bg-slate-50 transition-colors">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center font-bold text-sm">
                                        {u.full_name.charAt(0)}
                                    </div>
                                    <div>
                                        <p className="font-bold text-sm text-slate-900">{u.full_name}</p>
                                        <p className="text-xs text-slate-500">@{u.username}</p>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <span className={`px-2 py-1 rounded-md text-[10px] font-bold uppercase ${u.role === 'Admin' ? 'bg-purple-100 text-purple-700' : 'bg-slate-100 text-slate-600'}`}>
                                        {u.role}
                                    </span>
                                    <p className="text-[10px] text-slate-400 mt-1">{u.joined_human}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Recent Posts Table */}
                <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
                    <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
                        <h3 className="font-bold text-slate-900">Recent Posts</h3>
                    </div>
                    <div className="divide-y divide-slate-100">
                        {(data.recent_posts || []).map((p) => (
                            <div key={p.id} className="px-6 py-4 hover:bg-slate-50 transition-colors">
                                <div className="flex justify-between items-start mb-1">
                                    <p className="font-bold text-xs text-slate-900">{p.author_name}</p>
                                    <span className="text-[10px] text-slate-400">{p.created_at_human}</span>
                                </div>
                                <p className="text-sm text-slate-600 mb-2 line-clamp-2">{p.content || "Image post"}</p>
                                <div className="flex gap-4 text-xs text-slate-400 font-medium">
                                    <span>❤️ {p.likes_count}</span>
                                    <span>💬 {p.comments_count}</span>
                                </div>
                            </div>
                        ))}
                        {(!data.recent_posts || data.recent_posts.length === 0) && (
                            <div className="p-6 text-center text-sm text-slate-400">No posts yet.</div>
                        )}
                    </div>
                </div>
            </div>
          </div>
        )}

        <Toast
          type={toast.type}
          message={toast.message}
          onClose={() => setToast({ ...toast, message: "" })}
        />
      </div>
    </MainLayout>
  );
}

function StatCard({ icon, label, value, color, live }) {
  return (
    <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm flex items-center gap-4">
        <div className={`p-3 rounded-xl ${color}`}>
            {icon}
        </div>
        <div>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-0.5 flex items-center gap-2">
                {label}
                {live && <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>}
            </p>
            <p className="text-2xl font-extrabold text-slate-900">{value}</p>
        </div>
    </div>
  );
}