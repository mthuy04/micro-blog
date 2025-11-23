import { useEffect, useState, useCallback } from "react";
import { Link, useNavigate } from "react-router-dom";
import MainLayout from "../components/layout/MainLayout";
import { getFeed, createPost, toggleLike, createComment } from "../api/posts";
import { getSuggestions, followUser } from "../api/social";
import { getCurrentUser } from "../api/client";
import { 
  Image, Smile, Calendar, MapPin, 
  MessageCircle, Repeat, Heart, Share, Search, X, Send
} from "lucide-react";
import { getImageUrl } from "../utils/env";

export default function HomePage() {
  const [posts, setPosts] = useState([]);
  const [suggestions, setSuggestions] = useState([]); 
  const [feedType, setFeedType] = useState("for_you"); 
  const [content, setContent] = useState("");
  const [imageFile, setImageFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [loading, setLoading] = useState(false);
  
  const [activeCommentId, setActiveCommentId] = useState(null); 
  const [commentText, setCommentText] = useState("");

  const currentUser = getCurrentUser();
  const navigate = useNavigate();

  const loadData = useCallback(async () => {
    try {
      const data = await getFeed(feedType);
      setPosts(data.posts || []);
      const suggestData = await getSuggestions();
      setSuggestions(suggestData);
    } catch (err) { console.error(err); }
  }, [feedType]);

  useEffect(() => { loadData(); }, [loadData]);

  useEffect(() => {
    if (!imageFile) { setPreviewUrl(null); return; }
    const objectUrl = URL.createObjectURL(imageFile);
    setPreviewUrl(objectUrl);
    return () => URL.revokeObjectURL(objectUrl);
  }, [imageFile]);

  async function handleCreatePost() {
    if (!content.trim() && !imageFile) return;
    setLoading(true);
    try {
      const formData = new FormData();
      formData.append("content", content);
      if (imageFile) formData.append("image", imageFile);

      const res = await createPost(formData);
      
      const newPost = {
          id: res.id,
          content: content,
          image_url: res.image_url,
          author_name: currentUser?.name || "Me",
          author_username: currentUser?.username || "me",
          author_avatar: currentUser?.avatar,
          created_at_human: "Just now",
          likes_count: 0,
          comments_count: 0,
          liked_by_me: false
      };

      setPosts([newPost, ...posts]);
      setContent("");
      setImageFile(null);
    } catch (err) { console.error(err); } finally { setLoading(false); }
  }

  async function handleLike(id) {
    try {
      await toggleLike(id);
      setPosts(posts.map(p => {
        if (p.id === id) {
            const isLiked = !p.liked_by_me;
            return { 
                ...p, 
                liked_by_me: isLiked, 
                likes_count: p.likes_count + (isLiked ? 1 : -1) 
            };
        }
        return p;
      }));
    } catch(err) { console.error(err); }
  }

  async function handleFollow(userId) {
    try {
        await followUser(userId);
        setSuggestions(prev => prev.filter(u => u.id !== userId));
        if (feedType === "following") loadData();
    } catch (err) { console.error(err); }
  }

  async function handleRepost(postToShare) {
    if (!window.confirm("Repost this to your feed?")) return;
    try {
        const repostData = {
            original_author: postToShare.author_name,
            original_username: postToShare.author_username,
            original_content: postToShare.content,
            original_avatar: postToShare.author_avatar, // Có thể là null
            original_image: postToShare.image_url
        };
        
        const formData = new FormData();
        formData.append("content", `REPOST::${JSON.stringify(repostData)}`);
        
        await createPost(formData);
        window.location.reload(); 
    } catch (err) { console.error(err); }
  }

  async function submitComment(postId) {
      if(!commentText.trim()) return;
      try {
          await createComment(postId, { body: commentText });
          setPosts(posts.map(p => p.id === postId ? {...p, comments_count: p.comments_count + 1} : p));
          setCommentText("");
          setActiveCommentId(null); 
          // Chuyển sang trang detail để xem comment vừa đăng
          navigate(`/post/${postId}`);
      } catch(e) { console.error(e); }
  }

  const renderContent = (content) => {
      if (content.startsWith("REPOST::")) {
          try {
              const data = JSON.parse(content.replace("REPOST::", ""));
              // FIX: Xử lý avatar repost bị null
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

  return (
    <MainLayout active="home">
        <main className="w-full lg:w-[600px] border-r border-slate-200/60 min-h-screen pb-20">
            {/* Header Tabs */}
            <div className="sticky top-0 bg-white/80 backdrop-blur-md z-10 border-b border-slate-100 px-6 py-4 flex justify-between items-center">
                <h2 className="text-xl font-bold text-slate-900">Home</h2>
                <div className="flex gap-2 text-sm font-medium bg-slate-100 p-1 rounded-lg">
                     <button onClick={() => setFeedType("for_you")} className={`px-4 py-1 rounded-md transition-all ${feedType === "for_you" ? "bg-white text-slate-900 shadow-sm" : "text-slate-500 hover:text-slate-900"}`}>For you</button>
                     <button onClick={() => setFeedType("following")} className={`px-4 py-1 rounded-md transition-all ${feedType === "following" ? "bg-white text-slate-900 shadow-sm" : "text-slate-500 hover:text-slate-900"}`}>Following</button>
                </div>
            </div>

            {/* Create Post Area */}
            <div className="px-6 py-4 border-b border-slate-100 bg-white">
                <div className="flex gap-4">
                    <img src={getImageUrl(currentUser?.avatar) || `https://api.dicebear.com/7.x/avataaars/svg?seed=${currentUser?.username}`} className="w-12 h-12 rounded-full bg-slate-50 border border-slate-100 flex-shrink-0" alt="me" />
                    <div className="flex-1">
                        <textarea value={content} onChange={(e) => setContent(e.target.value)} className="w-full border-none focus:ring-0 text-lg placeholder-slate-400 resize-none min-h-[80px] outline-none" placeholder="What's happening?"></textarea>
                        {previewUrl && (
                            <div className="relative mb-3">
                                <img src={previewUrl} className="rounded-2xl max-h-60 w-full object-cover border border-slate-200" alt="preview" />
                                <button onClick={() => setImageFile(null)} className="absolute top-2 right-2 bg-slate-900/70 text-white p-1 rounded-full hover:bg-slate-800"><X className="w-4 h-4" /></button>
                            </div>
                        )}
                        <div className="flex items-center justify-between pt-2 border-t border-slate-50 mt-2">
                            <div className="flex gap-1 text-indigo-600">
                                <label className="p-2 hover:bg-indigo-50 rounded-full cursor-pointer transition-colors"><input type="file" className="hidden" accept="image/*" onChange={(e) => setImageFile(e.target.files[0])} /><Image className="w-5 h-5" /></label>
                                <button className="p-2 hover:bg-indigo-50 rounded-full"><Smile className="w-5 h-5" /></button>
                                <button className="p-2 hover:bg-indigo-50 rounded-full"><Calendar className="w-5 h-5" /></button>
                                <button className="p-2 hover:bg-indigo-50 rounded-full"><MapPin className="w-5 h-5" /></button>
                            </div>
                            <button onClick={handleCreatePost} disabled={loading || (!content.trim() && !imageFile)} className="bg-indigo-600 text-white px-5 py-2 rounded-full font-bold text-sm hover:bg-indigo-700 shadow-md disabled:opacity-50">{loading ? "Posting..." : "Post"}</button>
                        </div>
                    </div>
                </div>
            </div>
            
            {/* Feed List */}
            {posts.map(post => (
                <div key={post.id} className="border-b border-slate-100 hover:bg-slate-50/30 transition-colors">
                    <article className="p-6">
                        {post.content.startsWith("REPOST::") && (
                            <div className="flex items-center gap-2 mb-2 text-xs text-slate-500 font-bold ml-12">
                                <Repeat className="w-3 h-3" /> <span>{post.author_name} reposted</span>
                            </div>
                        )}

                        <div className="flex gap-4">
                            <img src={getImageUrl(post.author_avatar) || `https://api.dicebear.com/7.x/avataaars/svg?seed=${post.author_username}`} className="w-12 h-12 rounded-full bg-slate-50 border border-slate-100 flex-shrink-0" alt="author" />
                            <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 mb-1">
                                    <Link to={`/profile/${post.author_username}`} className="font-bold text-slate-900 text-[15px] hover:underline">{post.author_name}</Link>
                                    <span className="text-slate-500 text-[15px]">@{post.author_username}</span>
                                    <span className="text-slate-400 text-[15px]">· {post.created_at_human}</span>
                                </div>
                                
                                {/* FIX: Bấm vào nội dung bài viết -> Sang trang Detail */}
                                <Link to={`/post/${post.id}`} className="block group">
                                    {renderContent(post.content)}
                                    {post.image_url && (
                                        <div className="rounded-2xl overflow-hidden border border-slate-200 mb-3 bg-slate-100 mt-3">
                                            <img src={getImageUrl(post.image_url)} className="w-full h-auto object-cover" alt="post content" />
                                        </div>
                                    )}
                                </Link>

                                <div className="flex justify-between items-center text-slate-500 max-w-md mt-3">
                                    {/* Nút Comment: Mở ô nhập inline */}
                                    <button onClick={(e) => { e.stopPropagation(); setActiveCommentId(activeCommentId === post.id ? null : post.id); }} className={`flex items-center gap-2 group hover:text-indigo-500 ${activeCommentId === post.id ? "text-indigo-600" : ""}`}>
                                        <MessageCircle className="w-4.5 h-4.5" /> <span className="text-sm">{post.comments_count}</span>
                                    </button>
                                    
                                    <button onClick={(e) => {e.stopPropagation(); handleRepost(post)}} className="flex items-center gap-2 group hover:text-green-500">
                                        <Repeat className="w-4.5 h-4.5" /> <span className="text-sm">0</span>
                                    </button>
                                    
                                    <button onClick={(e) => {e.stopPropagation(); handleLike(post.id)}} className={`flex items-center gap-2 group ${post.liked_by_me ? "text-pink-500" : "hover:text-pink-500"}`}>
                                        <Heart className={`w-4.5 h-4.5 ${post.liked_by_me ? "fill-current" : ""}`} /> <span className="text-sm">{post.likes_count}</span>
                                    </button>
                                    
                                    <button className="flex items-center gap-2 group hover:text-indigo-500"><Share className="w-4.5 h-4.5" /></button>
                                </div>
                            </div>
                        </div>
                    </article>

                    {activeCommentId === post.id && (
                        <div className="px-6 pb-4 pl-[4.5rem] animate-in slide-in-from-top-2 duration-200">
                            <div className="flex gap-2 items-center bg-slate-100 rounded-2xl px-4 py-2">
                                <input autoFocus className="bg-transparent border-none outline-none w-full text-sm" placeholder="Post your reply..." value={commentText} onChange={e => setCommentText(e.target.value)} onKeyDown={e => e.key === 'Enter' && submitComment(post.id)} />
                                <button onClick={() => submitComment(post.id)} disabled={!commentText.trim()} className="text-indigo-600 disabled:text-slate-400"><Send className="w-4 h-4" /></button>
                            </div>
                        </div>
                    )}
                </div>
            ))}
        </main>

        {/* Sidebar Right */}
        <aside className="hidden lg:block w-[350px] pl-8 pt-6 space-y-6 sticky top-0 h-screen overflow-y-auto pb-8">
            <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400"><Search className="w-5 h-5" /></div>
                <input type="text" className="w-full pl-12 pr-4 py-3 bg-slate-100 border-transparent rounded-full text-sm font-medium outline-none" placeholder="Search Pulse" />
            </div>
            <div className="bg-slate-100/50 rounded-2xl border border-slate-100 p-4">
                <h3 className="font-bold text-xl text-slate-900 mb-4 px-2">Who to follow</h3>
                <div className="space-y-4">
                    {suggestions.map((u) => (
                        <div key={u.id} className="flex items-center justify-between px-2">
                            <div className="flex items-center gap-3">
                                <img src={getImageUrl(u.avatar) || `https://api.dicebear.com/7.x/avataaars/svg?seed=${u.username}`} className="w-10 h-10 rounded-full bg-white" alt="sugg" />
                                <div>
                                    <Link to={`/profile/${u.username}`} className="font-bold text-sm text-slate-900 hover:underline cursor-pointer">{u.name}</Link>
                                    <p className="text-xs text-slate-500">@{u.username}</p>
                                </div>
                            </div>
                            <button onClick={() => handleFollow(u.id)} className="bg-slate-900 text-white text-xs font-bold px-3 py-1.5 rounded-full hover:bg-slate-800 transition-colors">Follow</button>
                        </div>
                    ))}
                </div>
            </div>
        </aside>
    </MainLayout>
  );
}