import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import MainLayout from "../components/layout/MainLayout";
import { getProfile, getUserPosts, followUser, unfollowUser } from "../api/social";
import { getCurrentUser } from "../api/client";
import { getImageUrl } from "../utils/env";
import { 
  ArrowLeft, MapPin, Calendar, 
  MessageCircle, Repeat, Heart, Share2 
} from "lucide-react";

export default function ProfilePage() {
  const { username } = useParams();
  const [profile, setProfile] = useState(null);
  const [posts, setPosts] = useState([]);
  const [activeTab, setActiveTab] = useState("posts");
  const currentUser = getCurrentUser();

  useEffect(() => {
    async function load() {
      try {
        const p = await getProfile(username);
        setProfile(p);
        
        const data = await getUserPosts(username, activeTab);
        setPosts(data.posts || data);
      } catch (err) { console.error(err); }
    }
    load();
  }, [username, activeTab]);

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

  // Helper 1: Render nội dung chính của bài Post (có xử lý Repost UI)
  const renderContent = (content) => {
      if (content && content.startsWith("REPOST::")) {
          try {
              const data = JSON.parse(content.replace("REPOST::", ""));
              const repostAvatar = getImageUrl(data.original_avatar) || `https://api.dicebear.com/7.x/avataaars/svg?seed=${data.original_username}`;
              
              return (
                  <div className="mt-2 border border-slate-200 rounded-2xl p-4 bg-white hover:bg-slate-50 transition-colors cursor-pointer">
                      <div className="flex items-center gap-2 mb-2">
                          <img src={repostAvatar} className="w-6 h-6 rounded-full border border-slate-100 object-cover" alt="orig" />
                          <span className="font-bold text-sm text-slate-900">{data.original_author}</span>
                          <span className="text-slate-500 text-xs">@{data.original_username}</span>
                      </div>
                      <p className="text-sm text-slate-800 mb-2">{data.original_content}</p>
                      {data.original_image && (
                          <div className="rounded-xl overflow-hidden h-40 border border-slate-100 bg-slate-50">
                              <img src={getImageUrl(data.original_image)} className="w-full h-full object-cover" alt="orig content"/>
                          </div>
                      )}
                  </div>
              );
          } catch { return content; }
      }
      return <p className="text-slate-800 text-[15px] leading-relaxed mb-3 whitespace-pre-wrap">{content}</p>;
  };

  // Helper 2: Làm sạch nội dung cho phần trích dẫn bé tí (Tab Replies)
  const getCleanQuote = (content) => {
      if (!content) return "Content unavailable";
      if (content.startsWith("REPOST::")) {
          try {
              const data = JSON.parse(content.replace("REPOST::", ""));
              return data.original_content || "Shared a post";
          } catch {
              return "Shared a post";
          }
      }
      return content;
  };

  const getTabClass = (tabName) => {
      const base = "flex-1 py-4 text-center text-sm font-medium transition-colors hover:bg-slate-50 cursor-pointer relative";
      const active = "text-slate-900 font-bold border-b-4 border-indigo-600";
      const inactive = "text-slate-500 border-b-4 border-transparent";
      return `${base} ${activeTab === tabName ? active : inactive}`;
  };

  if (!profile) return <MainLayout><div className="p-10 text-center">Loading...</div></MainLayout>;

  const avatarSrc = getImageUrl(profile.avatar_url) || `https://api.dicebear.com/7.x/avataaars/svg?seed=${profile.username}`;

  return (
    <MainLayout active="profile">
      <main className="w-full lg:w-[600px] border-r border-slate-200/60 min-h-screen pb-20">
        
        {/* Header & Info */}
        <div className="hidden lg:flex sticky top-0 z-30 bg-white/80 backdrop-blur-md px-4 py-3 border-b border-slate-100 items-center gap-4">
            <Link to="/home" className="p-2 -ml-2 hover:bg-slate-100 rounded-full transition-colors">
                <ArrowLeft className="w-5 h-5 text-slate-600" />
            </Link>
            <div>
                 <h2 className="font-bold text-lg text-slate-900">{profile.full_name}</h2>
                 <p className="text-xs text-slate-500">{posts.length} posts</p>
             </div>
        </div>

        <div className="relative mb-6">
            <div className="h-48 w-full bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 relative overflow-hidden"></div>
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
                        <h1 className="text-2xl font-extrabold text-slate-900 flex items-center gap-2">{profile.full_name}</h1>
                        <p className="text-slate-500 text-[15px]">@{profile.username}</p>
                    </div>
                    {profile.bio && <p className="text-slate-700 leading-relaxed text-[15px] max-w-lg">{profile.bio}</p>}
                    <div className="flex flex-wrap gap-4 text-sm text-slate-500 items-center pt-1">
                        <div className="flex items-center gap-1.5"><MapPin className="w-4 h-4" /><span>{profile.location || "Hanoi, VN"}</span></div>
                        <div className="flex items-center gap-1.5"><Calendar className="w-4 h-4" /><span>{profile.joined_date}</span></div>
                    </div>
                    <div className="flex gap-6 pt-2">
                        <div className="flex gap-1.5 group"><span className="font-bold text-slate-900">{profile.following_count}</span><span className="text-slate-500">Following</span></div>
                        <div className="flex gap-1.5 group"><span className="font-bold text-slate-900">{profile.followers_count}</span><span className="text-slate-500">Followers</span></div>
                    </div>
                </div>
            </div>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-slate-200/60 bg-white/80 backdrop-blur-sm sticky top-14 z-20">
            <button onClick={() => setActiveTab("posts")} className={getTabClass("posts")}>Posts</button>
            <button onClick={() => setActiveTab("replies")} className={getTabClass("replies")}>Replies</button>
            <button onClick={() => setActiveTab("media")} className={getTabClass("media")}>Media</button>
            <button onClick={() => setActiveTab("likes")} className={getTabClass("likes")}>Likes</button>
        </div>

        {/* CONTENT AREA */}
        <div className="min-h-[500px]">
            
            {/* --- CASE 1: GRID MEDIA --- */}
            {activeTab === "media" && (
                <div className="grid grid-cols-3 gap-1 p-1">
                    {posts.map(post => (
                        <Link key={post.id} to={`/post/${post.id}`} className="aspect-square bg-slate-100 overflow-hidden relative group">
                            <img src={getImageUrl(post.image_url)} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300" alt="media" />
                            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors"></div>
                        </Link>
                    ))}
                    {posts.length === 0 && <div className="col-span-3 p-10 text-center text-slate-500">No photos found.</div>}
                </div>
            )}

            {/* --- CASE 2: REPLIES LIST (Fix JSON Display) --- */}
            {activeTab === "replies" && (
                <div className="divide-y divide-slate-100">
                    {posts.length === 0 && <div className="p-10 text-center text-slate-500">No replies yet.</div>}
                    {posts.map(post => (
                        <div key={post.id} className="p-6 hover:bg-slate-50 transition-colors flex gap-4">
                            <div className="flex flex-col items-center">
                                <img src={getImageUrl(post.author_avatar) || `https://api.dicebear.com/7.x/avataaars/svg?seed=${post.author_username}`} className="w-10 h-10 rounded-full bg-slate-100 border border-slate-100 object-cover" alt="User" />
                                <div className="w-0.5 flex-1 bg-slate-200 my-2 rounded-full"></div>
                            </div>
                            
                            <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 mb-1 text-sm text-slate-500">
                                    <span className="font-bold text-slate-900">{post.author_name}</span>
                                    <span>replied to</span>
                                    <Link to={`/profile/${post.reply_to_username}`} className="text-indigo-600 font-medium hover:underline">
                                        @{post.reply_to_username}
                                    </Link>
                                    <span>· {post.created_at_human}</span>
                                </div>
                                
                                <p className="text-slate-900 text-[15px] mb-3">{post.content}</p>
                                
                                <Link to={`/post/${post.id}`} className="block p-4 rounded-2xl bg-slate-100/70 border border-slate-200 hover:bg-slate-200/70 transition-colors">
                                    <div className="flex items-center gap-2 mb-1">
                                        <div className="text-xs font-bold text-slate-700">{post.reply_to_author}</div>
                                        <span className="text-xs text-slate-400">Original Post</span>
                                    </div>
                                    {/* SỬ DỤNG HÀM getCleanQuote ĐỂ FIX LỖI HIỂN THỊ JSON */}
                                    <p className="text-xs text-slate-500 line-clamp-2 italic">"{getCleanQuote(post.reply_to_content)}"</p>
                                </Link>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* --- CASE 3: STANDARD POSTS & LIKES --- */}
            {(activeTab === "posts" || activeTab === "likes") && (
                <>
                    {posts.length === 0 && (
                        <div className="p-10 text-center text-slate-500">
                            {activeTab === "likes" ? "No liked posts yet." : "No posts yet."}
                        </div>
                    )}
                    {posts.map(post => (
                        <div key={post.id} className="border-b border-slate-100 hover:bg-slate-50/30 transition-colors">
                            <article className="p-6">
                                <div className="flex gap-4">
                                    <img src={getImageUrl(post.author_avatar) || `https://api.dicebear.com/7.x/avataaars/svg?seed=${post.author_username}`} className="w-12 h-12 rounded-full bg-slate-100 border-slate-100 flex-shrink-0 object-cover" alt="User" />
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2 mb-1">
                                            <span className="font-bold text-slate-900 text-[15px]">{post.author_name}</span>
                                            <span className="text-slate-400 text-[14px]">@{post.author_username}</span>
                                            <span className="text-slate-300 text-[10px]">•</span>
                                            <span className="text-slate-400 text-[14px]">{post.created_at_human}</span>
                                        </div>
                                        
                                        <Link to={`/post/${post.id}`} className="block group">
                                            {renderContent(post.content)}
                                            {post.image_url && (
                                                <div className="rounded-2xl overflow-hidden border border-slate-200 mb-3 bg-slate-100 mt-3">
                                                    <img src={getImageUrl(post.image_url)} className="w-full h-full object-cover" alt="Post" />
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
                </>
            )}
        </div>
      </main>

      <aside className="hidden xl:block w-[350px] pl-8 pt-6 space-y-8 sticky top-0 h-screen overflow-y-auto pb-8">
      </aside>

    </MainLayout>
  );
}