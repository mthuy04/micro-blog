import { useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import MainLayout from "../components/layout/MainLayout";
import { getProfile, getUserPosts, followUser, unfollowUser } from "../api/social";
import { toggleLike, deletePost, createPost, createComment } from "../api/posts";
import { getCurrentUser } from "../api/client";
import { getImageUrl } from "../utils/env";
import { 
  ArrowLeft, MapPin, Calendar, 
  MessageCircle, Repeat, Heart, Share2, MoreHorizontal, Trash2, Send
} from "lucide-react";

export default function ProfilePage() {
  const { username } = useParams();
  const navigate = useNavigate();
  const [profile, setProfile] = useState(null);
  const [posts, setPosts] = useState([]);
  const [activeTab, setActiveTab] = useState("posts");
  
  // State cho tương tác
  const [activeCommentId, setActiveCommentId] = useState(null);
  const [commentText, setCommentText] = useState("");
  const [openMenuId, setOpenMenuId] = useState(null);

  const currentUser = getCurrentUser();

  useEffect(() => {
    async function load() {
      try {
        const p = await getProfile(username);
        setProfile(p);
        const data = await getUserPosts(username, activeTab);
        setPosts(Array.isArray(data) ? data : (data.posts || []));
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

  async function handleLike(postId) {
    try {
        await toggleLike(postId);
        setPosts(posts.map(p => {
            if (p.id === postId) {
                const isLiked = !p.liked_by_me; 
                return { 
                    ...p, 
                    liked_by_me: isLiked, 
                    likes_count: p.likes_count + (isLiked ? 1 : -1) 
                };
            }
            return p;
        }));
    } catch (e) { console.error(e); }
  }

  async function handleDelete(postId) {
      if (!window.confirm("Are you sure you want to delete this post?")) return;
      try {
          await deletePost(postId);
          setPosts(posts.filter(p => p.id !== postId));
      } catch(e) { console.error(e); }
  }

  async function handleRepostWithCaption(postToShare) {
      const caption = window.prompt("Add a comment to your repost (optional):");
      if (caption === null) return; 

      try {
        const repostData = {
            original_author: postToShare.author_name,
            original_username: postToShare.author_username,
            // Cắt chuỗi để tránh lồng repost vô tận
            original_content: postToShare.content.split("|||REPOST::")[0],
            original_avatar: postToShare.author_avatar,
            original_image: postToShare.image_url
        };
        
        const finalContent = `${caption} |||REPOST::${JSON.stringify(repostData)}`;
        const formData = new FormData();
        formData.append("content", finalContent);
        
        await createPost(formData);
        alert("Reposted successfully!");
      } catch (err) { console.error(err); }
  }

  async function submitComment(postId) {
    if(!commentText.trim()) return;
    try {
        await createComment(postId, { body: commentText });
        setCommentText("");
        setActiveCommentId(null);
        navigate(`/post/${postId}`);
    } catch(e) { console.error(e); }
  }

  // --- HÀM MỚI: LÀM SẠCH NỘI DUNG REPLY ĐỂ TRÁNH LỖI JSON ---
  const getCleanReplyContent = (content) => {
      if (!content) return "Unavailable content";
      
      // Nếu chứa dấu hiệu Repost mới
      if (content.includes("|||REPOST::")) {
          const parts = content.split("|||REPOST::");
          // Trả về caption nếu có, nếu không thì báo là "Reposted..."
          return parts[0].trim() || "Reposted a post"; 
      }
      
      // Nếu là format Repost cũ (bắt đầu bằng JSON)
      if (content.startsWith("REPOST::")) {
          return "Reposted a post";
      }
      
      return content;
  };
  // -----------------------------------------------------------

  const renderContent = (fullContent) => {
      if (!fullContent) return null;

      let caption = fullContent;
      let repostData = null;

      if (fullContent.includes("|||REPOST::")) {
          const parts = fullContent.split("|||REPOST::");
          caption = parts[0];
          try { repostData = JSON.parse(parts[1]); } catch {}
      } 
      else if (fullContent.startsWith("REPOST::")) {
          caption = "";
          try { repostData = JSON.parse(fullContent.replace("REPOST::", "")); } catch {}
      }

      return (
          <div className="text-[15px] text-slate-900 mb-2">
              {caption && <p className="mb-3 whitespace-pre-wrap">{caption}</p>}
              
              {repostData && (
                  <div className="mt-2 border border-slate-200 rounded-2xl p-4 bg-white hover:bg-slate-50 transition-colors cursor-pointer"
                       onClick={(e) => {
                           e.stopPropagation();
                           navigate(`/profile/${repostData.original_username}`);
                       }}>
                      <div className="flex items-center gap-2 mb-2">
                          <img src={getImageUrl(repostData.original_avatar)} className="w-5 h-5 rounded-full" alt="orig" />
                          <span className="font-bold text-sm">{repostData.original_author}</span>
                          <span className="text-slate-500 text-xs">@{repostData.original_username}</span>
                      </div>
                      <p className="text-sm text-slate-800 mb-2 line-clamp-3">{repostData.original_content}</p>
                      {repostData.original_image && (
                          <div className="rounded-xl overflow-hidden h-32 border border-slate-100 bg-slate-100">
                              <img src={getImageUrl(repostData.original_image)} className="w-full h-full object-cover" alt="orig content"/>
                          </div>
                      )}
                  </div>
              )}
          </div>
      );
  };

  if (!profile) return <MainLayout><div className="p-10 text-center">Loading...</div></MainLayout>;
  const avatarSrc = getImageUrl(profile.avatar_url) || `https://api.dicebear.com/7.x/avataaars/svg?seed=${profile.username}`;

  return (
    <MainLayout active="profile">
      <main className="w-full lg:w-[600px] border-r border-slate-200/60 min-h-screen pb-20">
        
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
                        <Link to="/profile/edit" className="mb-2 px-5 py-2.5 border border-slate-300 rounded-2xl font-bold text-slate-700 hover:bg-slate-50 bg-white/90">Edit profile</Link>
                    ) : (
                        <button onClick={handleFollow} className={`mb-2 px-5 py-2.5 rounded-2xl font-bold transition-all ${profile.is_following ? "border border-slate-300 bg-white text-slate-700" : "bg-slate-900 text-white"}`}>
                            {profile.is_following ? "Following" : "Follow"}
                        </button>
                    )}
                </div>
                <div>
                    <h1 className="text-2xl font-extrabold text-slate-900">{profile.full_name}</h1>
                    <p className="text-slate-500">@{profile.username}</p>
                    {profile.bio && <p className="text-slate-700 mt-2">{profile.bio}</p>}
                    <div className="flex gap-4 mt-3 text-sm text-slate-500">
                        <span>{profile.location || "Hanoi, VN"}</span>
                        <span>{profile.joined_date}</span>
                    </div>
                    <div className="flex gap-4 mt-3">
    <Link to={`/profile/${profile.username}/following`} className="font-bold text-slate-900 hover:underline cursor-pointer">
        {profile.following_count} <span className="font-normal text-slate-500">Following</span>
    </Link>
    <Link to={`/profile/${profile.username}/followers`} className="font-bold text-slate-900 hover:underline cursor-pointer">
        {profile.followers_count} <span className="font-normal text-slate-500">Followers</span>
    </Link>
</div>
                </div>
            </div>
        </div>

        <div className="flex border-b border-slate-200 sticky top-0 bg-white/95 backdrop-blur z-20">
            {["posts", "replies", "media", "likes"].map(tab => (
                <button key={tab} onClick={() => setActiveTab(tab)} className={`flex-1 py-3 font-bold capitalize ${activeTab === tab ? "border-b-4 border-indigo-600 text-slate-900" : "text-slate-500 hover:bg-slate-50"}`}>
                    {tab}
                </button>
            ))}
        </div>

        <div className="min-h-[500px]">
            {posts.length === 0 && <div className="p-10 text-center text-slate-500">No {activeTab} yet.</div>}
            
            {activeTab === "media" ? (
                <div className="grid grid-cols-3 gap-1 p-1">
                    {posts.map(post => (
                        <Link key={post.id} to={`/post/${post.id}`} className="aspect-square bg-slate-100 relative group">
                            <img src={getImageUrl(post.image_url)} className="w-full h-full object-cover" alt="media" />
                        </Link>
                    ))}
                </div>
            ) : (
                posts.map(post => (
                    <div key={post.id} className="border-b border-slate-100 hover:bg-slate-50/50 transition-colors relative">
                        
                        {currentUser?.username === profile.username && !post.is_reply && (
                            <div className="absolute top-4 right-4 z-10">
                                <button onClick={(e) => { e.stopPropagation(); setOpenMenuId(openMenuId === post.id ? null : post.id); }} className="p-2 text-slate-400 hover:bg-indigo-50 hover:text-indigo-600 rounded-full">
                                    <MoreHorizontal className="w-5 h-5" />
                                </button>
                                {openMenuId === post.id && (
                                    <div className="absolute right-0 mt-1 w-32 bg-white rounded-xl shadow-xl border border-slate-100 overflow-hidden z-20">
                                        <button onClick={(e) => { e.stopPropagation(); handleDelete(post.id); }} className="w-full text-left px-4 py-3 text-sm text-red-600 hover:bg-red-50 flex items-center gap-2"><Trash2 className="w-4 h-4" /> Delete</button>
                                    </div>
                                )}
                            </div>
                        )}

                        <article className="p-5 cursor-pointer" onClick={() => navigate(`/post/${post.id}`)}>
                            
                            {/* --- ĐOẠN NÀY ĐÃ ĐƯỢC CẬP NHẬT --- */}
                            {post.is_reply && (
                                <div className="mb-2 ml-14 relative">
                                    <div className="absolute -left-8 top-6 bottom-[-20px] w-0.5 bg-slate-200"></div>
                                    <div className="text-slate-500 text-xs mb-1 flex items-center gap-1">
                                        <span>Replying to</span>
                                        <Link to={`/profile/${post.reply_to_username}`} className="text-indigo-600 hover:underline font-bold" onClick={e => e.stopPropagation()}>
                                            @{post.reply_to_username || "unknown"}
                                        </Link>
                                    </div>
                                    
                                    {/* SỬ DỤNG HÀM CLEAN CONTENT Ở ĐÂY */}
                                    <div className="text-slate-400 text-sm line-clamp-1 italic bg-slate-50 p-2 rounded-lg border border-slate-100">
                                        "{getCleanReplyContent(post.reply_to_content)}"
                                    </div>
                                </div>
                            )}
                            {/* ----------------------------------- */}

                            <div className="flex gap-3">
                                <img src={getImageUrl(post.author_avatar) || `https://api.dicebear.com/7.x/avataaars/svg?seed=${post.author_username}`} className="w-12 h-12 rounded-full border border-slate-100 flex-shrink-0 object-cover z-10 bg-white" alt="User" />
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2 mb-1">
                                        <span className="font-bold text-slate-900">{post.author_name}</span>
                                        <span className="text-slate-500 text-sm">@{post.author_username} · {post.created_at_human}</span>
                                    </div>
                                    
                                    {renderContent(post.content)}
                                    
                                    {post.image_url && (
                                        <div className="rounded-2xl overflow-hidden border border-slate-200 mt-3 mb-2">
                                            <img src={getImageUrl(post.image_url)} className="w-full max-h-[500px] object-cover" alt="Post" />
                                        </div>
                                    )}

                                    {!post.is_reply && (
                                        <div className="flex justify-between items-center text-slate-500 max-w-md mt-3" onClick={e => e.stopPropagation()}>
                                            <button onClick={() => setActiveCommentId(activeCommentId === post.id ? null : post.id)} className="flex items-center gap-2 hover:text-indigo-500 group"><MessageCircle className="w-5 h-5" /> <span className="text-sm">{post.comments_count}</span></button>
                                            <button onClick={() => handleRepostWithCaption(post)} className="flex items-center gap-2 hover:text-green-500 group"><Repeat className="w-5 h-5" /> <span className="text-sm">Repost</span></button>
                                            <button onClick={() => handleLike(post.id)} className={`flex items-center gap-2 group ${post.liked_by_me ? "text-pink-500" : "hover:text-pink-500"}`}><Heart className={`w-5 h-5 ${post.liked_by_me ? "fill-current" : ""}`} /> <span className="text-sm">{post.likes_count}</span></button>
                                            <button className="hover:text-indigo-500"><Share2 className="w-5 h-5" /></button>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </article>

                        {activeCommentId === post.id && !post.is_reply && (
                            <div className="px-5 pb-4 pl-[4.5rem]">
                                <div className="flex gap-2 items-center bg-slate-100 rounded-2xl px-4 py-2">
                                    <input autoFocus className="bg-transparent border-none outline-none w-full text-sm" placeholder="Post your reply..." value={commentText} onChange={e => setCommentText(e.target.value)} onKeyDown={e => e.key === 'Enter' && submitComment(post.id)} />
                                    <button onClick={() => submitComment(post.id)} disabled={!commentText.trim()} className="text-indigo-600 disabled:text-slate-400"><Send className="w-4 h-4" /></button>
                                </div>
                            </div>
                        )}
                    </div>
                ))
            )}
        </div>
      </main>
    </MainLayout>
  );
}