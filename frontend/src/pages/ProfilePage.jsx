import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import MainLayout from "../components/layout/MainLayout";
import { getProfile, getUserPosts, followUser, unfollowUser } from "../api/social";
import { getCurrentUser } from "../api/client";
import { getImageUrl } from "../utils/env";
import { 
  ArrowLeft, MapPin, Calendar, 
  MessageCircle, Repeat, Heart, Share2, Search, Camera 
} from "lucide-react";

export default function ProfilePage() {
  const { username } = useParams();
  const [profile, setProfile] = useState(null);
  const [posts, setPosts] = useState([]);
  const currentUser = getCurrentUser();

  useEffect(() => {
    async function load() {
      try {
        const p = await getProfile(username);
        setProfile(p);
        const ps = await getUserPosts(username);
        setPosts(ps.posts || ps);
      } catch (err) { console.error(err); }
    }
    load();
  }, [username]);

  async function handleFollow() {
    try {
      if (profile.is_following) await unfollowUser(profile.id);
      else await followUser(profile.id);
      
      setProfile(prev => ({ 
          ...prev, 
          is_following: !prev.is_following,
          followers_count: prev.is_following ? prev.followers_count - 1 : prev.followers_count + 1
      }));
    } catch(err) { console.error(err); }
  }

  // --- HÀM XỬ LÝ HIỂN THỊ NỘI DUNG (BAO GỒM REPOST) ---
  const renderContent = (content) => {
      if (content.startsWith("REPOST::")) {
          try {
              const data = JSON.parse(content.replace("REPOST::", ""));
              // Xử lý ảnh avatar fallback
              const repostAvatar = getImageUrl(data.original_avatar) || `https://api.dicebear.com/7.x/avataaars/svg?seed=${data.original_username}`;
              
              return (
                  <div className="mt-2 border border-slate-200 rounded-2xl p-4 bg-white hover:bg-slate-50 transition-colors cursor-pointer">
                      <div className="flex items-center gap-2 mb-2">
                          <img src={repostAvatar} className="w-6 h-6 rounded-full border border-slate-100" alt="orig" />
                          <span className="font-bold text-sm text-slate-900">{data.original_author}</span>
                          <span className="text-slate-500 text-xs">@{data.original_username}</span>
                      </div>
                      <p className="text-sm text-slate-800 mb-2">{data.original_content}</p>
                      {data.original_image && (
                          <div className="rounded-xl overflow-hidden h-40 border border-slate-100">
                              <img src={getImageUrl(data.original_image)} className="w-full h-full object-cover" alt="orig content"/>
                          </div>
                      )}
                  </div>
              );
          } catch { return content; }
      }
      return <p className="text-slate-800 text-[15px] leading-relaxed mb-3 whitespace-pre-wrap">{content}</p>;
  };
  // ----------------------------------------------------

  if (!profile) return <MainLayout><div className="p-10 text-center">Loading profile...</div></MainLayout>;

  const avatarSrc = getImageUrl(profile.avatar_url) || `https://api.dicebear.com/7.x/avataaars/svg?seed=${profile.username}`;

  return (
    <MainLayout active="profile">
      
      <main className="w-full lg:w-[600px] border-r border-slate-200/60 min-h-screen pb-20">
        
        {/* Header */}
        <div className="hidden lg:flex sticky top-0 z-30 bg-white/80 backdrop-blur-md px-4 py-3 border-b border-slate-100 items-center gap-4">
            <Link to="/home" className="p-2 -ml-2 hover:bg-slate-100 rounded-full transition-colors">
                <ArrowLeft className="w-5 h-5 text-slate-600" />
            </Link>
            <div>
                 <h2 className="font-bold text-lg text-slate-900">{profile.full_name}</h2>
                 <p className="text-xs text-slate-500">{posts.length} posts</p>
             </div>
        </div>

        {/* Profile Info */}
        <div className="relative mb-6">
            <div className="h-48 w-full bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 relative overflow-hidden group">
            </div>

            <div className="px-4 pb-4 relative">
                <div className="flex justify-between items-end -mt-12 mb-4">
                    <div className="relative">
                        <div className="w-32 h-32 rounded-full p-1 bg-white shadow-md overflow-hidden">
                            <img src={avatarSrc} className="w-full h-full rounded-full object-cover bg-slate-100" alt="Avatar" />
                        </div>
                    </div>
                    
                    {currentUser?.username === profile.username ? (
                        <Link to="/profile/edit" className="mb-2 px-5 py-2.5 border border-slate-300 rounded-2xl font-bold text-slate-700 hover:bg-slate-50 hover:border-slate-400 transition-all bg-white/80 backdrop-blur-sm">
                            Edit profile
                        </Link>
                    ) : (
                        <button onClick={handleFollow} className={`mb-2 px-5 py-2.5 rounded-2xl font-bold transition-all ${profile.is_following ? "border border-slate-300 bg-white text-slate-700" : "bg-slate-900 text-white shadow-lg"}`}>
                            {profile.is_following ? "Following" : "Follow"}
                        </button>
                    )}
                </div>

                <div className="space-y-3">
                    <div>
                        <h1 className="text-2xl font-extrabold text-slate-900 flex items-center gap-2">
                            {profile.full_name}
                        </h1>
                        <p className="text-slate-500 text-[15px]">@{profile.username}</p>
                    </div>
                    
                    {profile.bio && <p className="text-slate-700 leading-relaxed text-[15px] max-w-lg">{profile.bio}</p>}

                    <div className="flex flex-wrap gap-4 text-sm text-slate-500 items-center pt-1">
                        <div className="flex items-center gap-1.5"><MapPin className="w-4 h-4" /><span>{profile.location || "Hanoi, VN"}</span></div>
                        <div className="flex items-center gap-1.5"><Calendar className="w-4 h-4" /><span>{profile.joined_date || "Joined 2023"}</span></div>
                    </div>

                    <div className="flex gap-6 pt-2">
                        <div className="flex gap-1.5 group"><span className="font-bold text-slate-900">{profile.following_count}</span><span className="text-slate-500">Following</span></div>
                        <div className="flex gap-1.5 group"><span className="font-bold text-slate-900">{profile.followers_count}</span><span className="text-slate-500">Followers</span></div>
                    </div>
                </div>
            </div>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-slate-200/60 bg-white/50 backdrop-blur-sm px-2 sticky top-14 z-20">
            <button className="flex-1 py-4 text-center border-b-2 border-indigo-600 font-bold text-slate-900 text-sm">Posts</button>
            <button className="flex-1 py-4 text-center font-medium text-slate-500 text-sm hover:bg-slate-50">Replies</button>
            <button className="flex-1 py-4 text-center font-medium text-slate-500 text-sm hover:bg-slate-50">Media</button>
            <button className="flex-1 py-4 text-center font-medium text-slate-500 text-sm hover:bg-slate-50">Likes</button>
        </div>

        {/* Post List */}
        <div className="space-y-0 min-h-[500px]">
            {posts.length === 0 && <div className="p-10 text-center text-slate-500">No posts yet.</div>}
            
            {posts.map(post => (
                <div key={post.id} className="border-b border-slate-100 hover:bg-slate-50/30 transition-colors">
                    <article className="p-6">
                        {post.content.startsWith("REPOST::") && (
                            <div className="flex items-center gap-2 mb-2 text-xs text-slate-500 font-bold ml-12">
                                <Repeat className="w-3 h-3" /> <span>{post.author_name} reposted</span>
                            </div>
                        )}

                        <div className="flex gap-4">
                            <img src={getImageUrl(post.author_avatar) || `https://api.dicebear.com/7.x/avataaars/svg?seed=${post.author_username}`} className="w-12 h-12 rounded-full bg-slate-100 border-slate-100 flex-shrink-0 object-cover" alt="User" />
                            <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 mb-1">
                                    <span className="font-bold text-slate-900 text-[15px]">{post.author_name}</span>
                                    <span className="text-slate-400 text-[14px]">@{post.author_username}</span>
                                    <span className="text-slate-300 text-[10px]">•</span>
                                    <span className="text-slate-400 text-[14px]">{post.created_at_human}</span>
                                </div>
                                
                                {/* Link sang trang chi tiết */}
                                <Link to={`/post/${post.id}`} className="block group">
                                    {renderContent(post.content)}
                                    {post.image_url && (
                                        <div className="rounded-2xl overflow-hidden border border-slate-200 mb-3 bg-slate-100 mt-3">
                                            <img src={getImageUrl(post.image_url)} className="w-full h-auto object-cover" alt="Post" />
                                        </div>
                                    )}
                                </Link>
                                
                                <div className="flex justify-between items-center text-slate-400 max-w-md pt-1">
                                    <div className="flex items-center gap-2 hover:text-indigo-500"><MessageCircle className="w-5 h-5" /> <span className="text-sm">{post.comments_count}</span></div>
                                    <div className="flex items-center gap-2 hover:text-green-500"><Repeat className="w-5 h-5" /> <span className="text-sm">0</span></div>
                                    <div className="flex items-center gap-2 hover:text-pink-500"><Heart className="w-5 h-5" /> <span className="text-sm">{post.likes_count}</span></div>
                                    <div className="flex items-center gap-2 hover:text-indigo-500"><Share2 className="w-5 h-5" /></div>
                                </div>
                            </div>
                        </div>
                    </article>
                </div>
            ))}
        </div>
      </main>

      {/* RIGHT SIDEBAR */}
      <aside className="hidden xl:block w-[350px] pl-8 pt-6 space-y-8 sticky top-0 h-screen overflow-y-auto pb-8">
        <div className="relative group">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400"><Search className="w-5 h-5" /></div>
            <input type="text" className="w-full pl-12 pr-4 py-3 bg-slate-100 border-transparent rounded-full text-sm font-medium outline-none" placeholder="Search Pulse" />
        </div>
      </aside>

    </MainLayout>
  );
}