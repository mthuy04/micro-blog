import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import MainLayout from "../components/layout/MainLayout";
import { getNotifications, markRead } from "../api/social";
import { getImageUrl } from "../utils/env";
import { Heart, UserPlus, MessageCircle, Bell } from "lucide-react";
// Import hàm xử lý thời gian
import { formatDistanceToNow } from "date-fns"; 

export default function NotificationsPage() {
  const [notifs, setNotifs] = useState([]);

  useEffect(() => {
    getNotifications().then(data => setNotifs(data));
  }, []);

  const handleRead = (id) => {
      markRead(id);
      setNotifs(notifs.map(n => n.id === id ? {...n, read_at: new Date()} : n));
  };

  const getIcon = (action) => {
      switch(action) {
          case 'like': return <Heart className="w-5 h-5 text-pink-500 fill-current" />;
          case 'follow': return <UserPlus className="w-5 h-5 text-indigo-500" />;
          case 'comment': return <MessageCircle className="w-5 h-5 text-sky-500" />;
          default: return <Bell className="w-5 h-5 text-slate-500" />;
      }
  };

  const getText = (n) => {
      if (n.action === 'like') return "liked your post";
      if (n.action === 'follow') return "started following you";
      if (n.action === 'comment') return "commented on your post";
      return "interacted with you";
  };

  return (
    <MainLayout active="/notifications">
      <main className="w-full lg:w-[600px] border-r border-slate-200/60 min-h-screen pb-20">
        <div className="sticky top-0 bg-white/80 backdrop-blur-md z-10 border-b border-slate-100 px-6 py-4">
            <h2 className="text-xl font-bold text-slate-900">Notifications</h2>
        </div>

        <div className="divide-y divide-slate-100">
            {notifs.length === 0 && <div className="p-10 text-center text-slate-500">No notifications yet.</div>}
            
            {notifs.map(n => (
                <div 
                    key={n.id} 
                    onClick={() => handleRead(n.id)}
                    className={`p-5 flex gap-4 hover:bg-slate-50 transition-colors cursor-pointer ${!n.read_at ? "bg-indigo-50/40" : ""}`}
                >
                    <div className="mt-1">{getIcon(n.action)}</div>
                    <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                            <img src={getImageUrl(n.actor.avatar) || `https://api.dicebear.com/7.x/avataaars/svg?seed=${n.actor.name}`} className="w-8 h-8 rounded-full border border-slate-200" alt="actor" />
                            <Link to={`/profile/${n.actor.name}`} className="font-bold text-slate-900 hover:underline" onClick={e => e.stopPropagation()}>
                                {n.actor.name}
                            </Link>
                            <span className="text-slate-500 text-xs">
                                • {n.created_at ? formatDistanceToNow(new Date(n.created_at), { addSuffix: true }) : "just now"}
                            </span>
                        </div>
                        <p className="text-slate-600 text-sm">
                            {getText(n)}
                            {n.post_id && <Link to={`/post/${n.post_id}`} className="ml-1 text-slate-400 hover:text-indigo-500 font-medium">view post</Link>}
                        </p>
                    </div>
                </div>
            ))}
        </div>
      </main>
      
      <aside className="hidden xl:block w-[350px] pl-8 pt-6 sticky top-0 h-screen">
          {/* Empty or Widget */}
      </aside>
    </MainLayout>
  );
}