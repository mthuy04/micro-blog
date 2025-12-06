import { useEffect, useState } from "react";
import { useParams, useNavigate, Link, useLocation } from "react-router-dom";
import MainLayout from "../components/layout/MainLayout";
import { getProfile, getUserFollowers, getUserFollowing, followUser, unfollowUser } from "../api/social";
import { getImageUrl } from "../utils/env";
import { ArrowLeft, Search, BadgeCheck, MoreHorizontal } from "lucide-react";

export default function FollowPage() {
  const { username } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  
  // Xác định đang ở tab nào dựa trên URL (mặc định là 'following')
  const isFollowersTab = location.pathname.includes("followers");
  const [activeTab, setActiveTab] = useState(isFollowersTab ? "followers" : "following");
  
  const [profile, setProfile] = useState(null);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  // 1. Load thông tin User chủ của trang này
  useEffect(() => {
    async function loadData() {
        setLoading(true);
        try {
            // Lấy profile trước để có ID
            const p = await getProfile(username);
            setProfile(p);
            
            // Sau đó lấy list dựa trên tab
            let list = [];
            if (activeTab === "followers") {
                list = await getUserFollowers(p.id);
            } else {
                list = await getUserFollowing(p.id);
            }
            // Add trạng thái is_following giả định (để UI hoạt động)
            // Lưu ý: Backend hiện tại trả về list user đơn giản, 
            // ta tạm thời set is_following = true nếu đang ở tab Following của chính mình
            const formattedList = list.map(u => ({...u, is_following: activeTab === "following"}));
            setUsers(formattedList);

        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    }
    loadData();
  }, [username, activeTab]);

  const handleTabChange = (tab) => {
      setActiveTab(tab);
      // Update URL mà không reload trang
      window.history.replaceState(null, "", `/profile/${username}/${tab}`);
  };

  return (
    <MainLayout>
      <main className="w-full lg:w-[640px] border-r border-slate-200/60 min-h-screen pb-20 pt-4 px-4 lg:px-6 space-y-6">
        
        {/* Sticky Header */}
        <div className="sticky top-0 z-30 bg-white/80 backdrop-blur-xl -mx-4 px-4 py-3 border-b border-slate-100 flex items-center gap-4">
            <button onClick={() => navigate(-1)} className="p-2 -ml-2 hover:bg-slate-100 rounded-full transition-colors">
                <ArrowLeft className="w-5 h-5 text-slate-600" />
            </button>
            <div className="flex items-center gap-3">
                {profile && (
                    <>
                        <div className="flex flex-col">
                            <h2 className="font-bold text-lg text-slate-900 leading-none">{profile.full_name}</h2>
                            <p className="text-xs text-slate-500 mt-1">@{profile.username}</p>
                        </div>
                    </>
                )}
            </div>
        </div>

        {/* Tabs Switcher */}
        <div className="flex p-1 bg-slate-100 rounded-xl">
            <button 
                onClick={() => handleTabChange("followers")}
                className={`flex-1 py-2 text-sm font-bold rounded-lg transition-all ${activeTab === "followers" ? "bg-white text-slate-900 shadow-sm" : "text-slate-500 hover:text-slate-700"}`}
            >
                Followers
            </button>
            <button 
                onClick={() => handleTabChange("following")}
                className={`flex-1 py-2 text-sm font-bold rounded-lg transition-all ${activeTab === "following" ? "bg-white text-slate-900 shadow-sm" : "text-slate-500 hover:text-slate-700"}`}
            >
                Following
            </button>
        </div>

        {/* Search */}
        <div className="relative group">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400 group-focus-within:text-indigo-600 transition-colors">
                <Search className="w-5 h-5" />
            </div>
            <input type="text" className="w-full pl-12 pr-4 py-3 bg-white rounded-2xl border border-slate-200 shadow-sm focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 outline-none transition-all placeholder-slate-400 text-sm font-medium" placeholder="Search users" />
        </div>

        {/* USER LIST */}
        <div className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden divide-y divide-slate-100 min-h-[300px]">
            {loading ? (
                <div className="p-8 text-center text-slate-500">Loading...</div>
            ) : users.length === 0 ? (
                <div className="p-8 text-center text-slate-500">No users found.</div>
            ) : (
                users.map(u => (
                    <UserRow key={u.id} user={u} />
                ))
            )}
        </div>

      </main>
    </MainLayout>
  );
}

// Component con để xử lý từng dòng user (Follow/Unfollow logic)
function UserRow({ user }) {
    // Vì API list followers hiện tại chưa trả về field "is_following" chuẩn xác so với Current User,
    // Ta dùng state local để giả lập hiệu ứng UI toggle.
    const [isFollowing, setIsFollowing] = useState(true); 
    const navigate = useNavigate();

    const handleToggleFollow = async (e) => {
        e.stopPropagation();
        try {
            if(isFollowing) {
                await unfollowUser(user.id);
            } else {
                await followUser(user.id);
            }
            setIsFollowing(!isFollowing);
        } catch(err) {
            console.error(err);
        }
    };

    return (
        <div 
            onClick={() => navigate(`/profile/${user.name}`)} // Lưu ý: Backend trả về user.name làm username trong list này thì sửa lại
            className="p-4 hover:bg-slate-50/80 transition-colors flex items-center justify-between gap-3 group cursor-pointer"
        >
            <div className="flex items-center gap-3 flex-1 min-w-0">
                <img src={getImageUrl(user.avatar)} className="w-12 h-12 rounded-full bg-indigo-50 border border-slate-200 flex-shrink-0 object-cover" alt="avt" />
                <div className="min-w-0">
                    <div className="flex items-center gap-1">
                        <h3 className="font-bold text-slate-900 text-[15px] truncate">{user.name}</h3>
                        {/* Fake badge check cho đẹp */}
                        {Math.random() > 0.7 && <BadgeCheck className="w-4 h-4 text-blue-500 fill-current" />}
                    </div>
                    {/* Backend list follower hiện chưa trả username/bio, ta fallback */}
                    <p className="text-xs text-slate-500 truncate">@{user.username || user.name.toLowerCase().replace(/\s/g, '')}</p>
                </div>
            </div>
            
            <div className="flex items-center gap-2">
                {isFollowing ? (
                    <button 
                        onClick={handleToggleFollow}
                        className="px-5 py-2 bg-slate-100 text-slate-700 hover:bg-red-50 hover:text-red-600 hover:border-red-200 border border-transparent rounded-full text-xs font-bold transition-all group/btn w-28 flex justify-center"
                    >
                        <span className="group-hover/btn:hidden">Following</span>
                        <span className="hidden group-hover/btn:inline">Unfollow</span>
                    </button>
                ) : (
                    <button 
                        onClick={handleToggleFollow}
                        className="px-5 py-2 bg-slate-900 text-white hover:bg-slate-800 rounded-full text-xs font-bold transition-all w-28"
                    >
                        Follow
                    </button>
                )}
            </div>
        </div>
    );
}