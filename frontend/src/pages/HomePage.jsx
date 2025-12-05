import { useEffect, useState, useCallback } from "react";
import { Link, useNavigate } from "react-router-dom";
import MainLayout from "../components/layout/MainLayout";
import { getFeed, createPost, toggleLike, createComment, deletePost, updatePost } from "../api/posts";
import { getSuggestions, followUser } from "../api/social";
import { getCurrentUser } from "../api/client";
import { 
  Image, Smile, Calendar, MapPin, 
  MessageCircle, Repeat, Heart, Share, X, Send,
  MoreHorizontal, Trash2, Edit2, Check, ArrowDownCircle
} from "lucide-react";
import { getImageUrl } from "../utils/env";

export default function HomePage() {
  const [posts, setPosts] = useState([]);
  const [feedType, setFeedType] = useState("for_you"); 
  
  // Phân trang
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);

  const [content, setContent] = useState("");
  const [imageFile, setImageFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [loading, setLoading] = useState(false);
  
  const [activeCommentId, setActiveCommentId] = useState(null); 
  const [commentText, setCommentText] = useState("");

  const [openMenuId, setOpenMenuId] = useState(null);
  const [editingPostId, setEditingPostId] = useState(null);
  const [editContent, setEditContent] = useState("");

  const currentUser = getCurrentUser();
  const navigate = useNavigate();

  const loadPosts = useCallback(async (type, pageNum, isAppend = false) => {
    try {
      if (!isAppend) setLoading(true); 
      else setIsLoadingMore(true);

      const data = await getFeed(type, pageNum);
      
      if (isAppend) {
          setPosts(prev => [...prev, ...data.posts]);
      } else {
          setPosts(data.posts || []);
      }
      
      setHasMore(data.has_next);
    } catch (err) { 
        console.error(err); 
    } finally { 
        setLoading(false);
        setIsLoadingMore(false);
    }
  }, []);

  useEffect(() => {
      setPage(1);
      setHasMore(true);
      setPosts([]); 
      loadPosts(feedType, 1, false);
  }, [feedType, loadPosts]);

  const handleLoadMore = () => {
      const nextPage = page + 1;
      setPage(nextPage);
      loadPosts(feedType, nextPage, true);
  };

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

      await createPost(formData);
      
      setPage(1);
      loadPosts(feedType, 1, false);
      
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
            return { ...p, liked_by_me: isLiked, likes_count: p.likes_count + (isLiked ? 1 : -1) };
        }
        return p;
      }));
    } catch(err) { console.error(err); }
  }

  async function handleRepost(postToShare) {
    // THÊM: Hỏi caption
    const caption = window.prompt("Add a comment to your repost (optional):");
    if (caption === null) return; // User ấn Cancel thì thôi không repost nữa

    try {
        const repostData = {
            original_author: postToShare.author_name,
            original_username: postToShare.author_username,
            // Lấy nội dung sạch (đề phòng repost chồng repost)
            original_content: postToShare.content.split("|||REPOST::")[0], 
            original_avatar: postToShare.author_avatar,
            original_image: postToShare.image_url
        };
        
        const finalContent = `${caption} |||REPOST::${JSON.stringify(repostData)}`;
        const formData = new FormData();
        formData.append("content", finalContent);
        
        await createPost(formData);
        
        setPage(1);
        loadPosts(feedType, 1, false);
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

  async function handleDeletePost(postId) {
      if(!window.confirm("Delete this post?")) return;
      try {
          await deletePost(postId);
          setPosts(posts.filter(p => p.id !== postId));
      } catch(e) { console.error(e); }
  }

  function startEditing(post) {
      setEditingPostId(post.id);
      setEditContent(post.content);
      setOpenMenuId(null);
  }

  async function saveEdit(postId) {
      try {
          await updatePost(postId, editContent);
          setPosts(posts.map(p => p.id === postId ? {...p, content: editContent} : p));
          setEditingPostId(null);
      } catch(e) { console.error(e); }
  }

  const renderPostContent = (post) => {
      // Logic Edit (Giữ nguyên)
      if (editingPostId === post.id) {
          // ... (code edit cũ)
          return (
              <div className="mt-2" onClick={(e) => e.stopPropagation()}>
                  <textarea className="w-full p-3 border border-indigo-300 rounded-xl bg-slate-50" rows={3} value={editContent} onChange={(e) => setEditContent(e.target.value)} />
                  <div className="flex gap-2 mt-2">
                      <button onClick={() => saveEdit(post.id)} className="px-3 py-1 bg-indigo-600 text-white text-xs rounded-full">Save</button>
                      <button onClick={() => setEditingPostId(null)} className="px-3 py-1 bg-slate-200 text-slate-600 text-xs rounded-full">Cancel</button>
                  </div>
              </div>
          );
      }

      let caption = post.content;
      let repostData = null;

      // PARSE REPOST MỚI
      if (post.content.includes("|||REPOST::")) {
          const parts = post.content.split("|||REPOST::");
          caption = parts[0];
          try { repostData = JSON.parse(parts[1]); } catch {}
      } 
      // PARSE REPOST CŨ (Fallback)
      else if (post.content.startsWith("REPOST::")) {
          caption = "";
          try { repostData = JSON.parse(post.content.replace("REPOST::", "")); } catch {}
      }

      return (
          <div className="mt-1">
              {caption && <p className="text-slate-900 text-[15px] mb-3 whitespace-pre-wrap">{caption}</p>}
              
              {repostData && (
                  <div className="border border-slate-200 rounded-2xl p-4 bg-white hover:bg-slate-50 transition-colors cursor-pointer"
                       onClick={(e) => {
                           e.stopPropagation();
                           navigate(`/profile/${repostData.original_username}`);
                       }}>
                      <div className="flex items-center gap-2 mb-2">
                          <img src={getImageUrl(repostData.original_avatar) || `https://api.dicebear.com/7.x/avataaars/svg?seed=${repostData.original_username}`} className="w-5 h-5 rounded-full" alt="orig" />
                          <span className="font-bold text-sm text-slate-900">{repostData.original_author}</span>
                          <span className="text-slate-500 text-xs">@{repostData.original_username}</span>
                      </div>
                      <p className="text-sm text-slate-800 mb-2">{repostData.original_content}</p>
                      {repostData.original_image && (
                          <div className="rounded-xl overflow-hidden h-40 border border-slate-100 bg-slate-50">
                              <img src={getImageUrl(repostData.original_image)} className="w-full h-full object-cover" alt="orig content" />
                          </div>
                      )}
                  </div>
              )}
          </div>
      );
  };
  const goToDetail = (e, postId) => {
      if (editingPostId === postId) return;
      navigate(`/post/${postId}`);
  };

  const myAvatar = getImageUrl(currentUser?.avatar) || `https://api.dicebear.com/7.x/avataaars/svg?seed=${currentUser?.username}`;

  return (
    <MainLayout active="home">
        <main className="w-full lg:w-[600px] border-r border-slate-200/60 min-h-screen pb-20">
            
            {/* Header */}
            <div className="sticky top-0 bg-white/80 backdrop-blur-md z-10 border-b border-slate-100 px-6 py-4 flex justify-between items-center">
                <h2 className="text-xl font-bold text-slate-900">Home</h2>
                <div className="flex gap-2 text-sm font-medium bg-slate-100 p-1 rounded-lg">
                     <button onClick={() => setFeedType("for_you")} className={`px-4 py-1 rounded-md transition-all ${feedType === "for_you" ? "bg-white text-slate-900 shadow-sm" : "text-slate-500 hover:text-slate-900"}`}>For you</button>
                     <button onClick={() => setFeedType("following")} className={`px-4 py-1 rounded-md transition-all ${feedType === "following" ? "bg-white text-slate-900 shadow-sm" : "text-slate-500 hover:text-slate-900"}`}>Following</button>
                </div>
            </div>

            {/* Input Box */}
            <div className="px-6 py-4 border-b border-slate-100 bg-white">
                <div className="flex gap-4">
                    <img src={myAvatar} className="w-12 h-12 rounded-full bg-slate-50 border border-slate-100 flex-shrink-0 object-cover" alt="avatar" />
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
            
            {/* Post List */}
            {posts.map(post => {
                const authorAvatar = getImageUrl(post.author_avatar) || `https://api.dicebear.com/7.x/avataaars/svg?seed=${post.author_username}`;
                return (
                <div key={post.id} className="border-b border-slate-100 hover:bg-slate-50/30 transition-colors relative">
                    
                    {currentUser && (currentUser.name === post.author_name || currentUser.username === post.author_username) && (
                        <div className="absolute top-4 right-4 z-20">
                            <button 
                                onClick={(e) => { e.stopPropagation(); setOpenMenuId(openMenuId === post.id ? null : post.id); }}
                                className="text-slate-400 hover:text-indigo-600 p-2 hover:bg-indigo-50 rounded-full transition-colors"
                            >
                                <MoreHorizontal className="w-5 h-5" />
                            </button>
                            {openMenuId === post.id && (
                                <div className="absolute right-0 mt-1 w-32 bg-white rounded-xl shadow-xl border border-slate-100 overflow-hidden z-30 animate-in fade-in zoom-in duration-200">
                                    <button onClick={(e) => { e.stopPropagation(); startEditing(post); }} className="w-full text-left px-4 py-3 text-sm text-slate-600 hover:bg-slate-50 hover:text-indigo-600 flex items-center gap-2"><Edit2 className="w-4 h-4" /> Edit</button>
                                    <button onClick={(e) => { e.stopPropagation(); handleDeletePost(post.id); }} className="w-full text-left px-4 py-3 text-sm text-red-600 hover:bg-red-50 flex items-center gap-2"><Trash2 className="w-4 h-4" /> Delete</button>
                                </div>
                            )}
                        </div>
                    )}

                    <article className="p-6 cursor-pointer" onClick={(e) => goToDetail(e, post.id)}>
                        {post.content.startsWith("REPOST::") && (
                            <div className="flex items-center gap-2 mb-2 text-xs text-slate-500 font-bold ml-12">
                                <Repeat className="w-3 h-3" /> <span>{post.author_name} reposted</span>
                            </div>
                        )}

                        <div className="flex gap-4">
                            <img src={authorAvatar} className="w-12 h-12 rounded-full bg-slate-50 border border-slate-100 flex-shrink-0 object-cover" alt="author" />
                            <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 mb-1">
                                    <span className="font-bold text-slate-900 text-[15px] hover:underline z-10" onClick={(e) => {e.stopPropagation(); navigate(`/profile/${post.author_username}`)}}>{post.author_name}</span>
                                    <span className="text-slate-500 text-[15px]">@{post.author_username}</span>
                                    <span className="text-slate-400 text-[15px]">· {post.created_at_human}</span>
                                </div>
                                
                                {renderPostContent(post)}
                                
                                {post.image_url && editingPostId !== post.id && (
                                    <div className="rounded-2xl overflow-hidden border border-slate-200 mb-3 bg-slate-100 mt-3">
                                        <img src={getImageUrl(post.image_url)} className="w-full h-auto object-cover" alt="post content" />
                                    </div>
                                )}

                                <div className="flex justify-between items-center text-slate-500 max-w-md mt-3">
                                    <button onClick={(e) => { e.stopPropagation(); setActiveCommentId(activeCommentId === post.id ? null : post.id); }} className={`flex items-center gap-2 group hover:text-indigo-500 ${activeCommentId === post.id ? "text-indigo-600" : ""}`}>
                                        <MessageCircle className="w-4.5 h-4.5" /> <span className="text-sm">{post.comments_count}</span>
                                    </button>
                                    <button onClick={(e) => {e.stopPropagation(); handleRepost(post)}} className="flex items-center gap-2 group hover:text-green-500"><Repeat className="w-4.5 h-4.5" /> <span className="text-sm">0</span></button>
                                    <button onClick={(e) => {e.stopPropagation(); handleLike(post.id)}} className={`flex items-center gap-2 group ${post.liked_by_me ? "text-pink-500" : "hover:text-pink-500"}`}><Heart className={`w-4.5 h-4.5 ${post.liked_by_me ? "fill-current" : ""}`} /> <span className="text-sm">{post.likes_count}</span></button>
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
            )})}
            
            {/* LOAD MORE BUTTON */}
            {hasMore && (
                <div className="p-6 flex justify-center">
                    <button 
                        onClick={handleLoadMore} 
                        disabled={isLoadingMore}
                        className="flex items-center gap-2 px-6 py-2.5 bg-white border border-slate-200 rounded-full font-bold text-sm text-indigo-600 hover:bg-indigo-50 transition-all shadow-sm"
                    >
                        {isLoadingMore ? "Loading..." : (
                            <>
                                <ArrowDownCircle className="w-4 h-4" /> Load more posts
                            </>
                        )}
                    </button>
                </div>
            )}
            
            {!hasMore && posts.length > 0 && (
                <div className="p-8 text-center text-slate-400 text-sm">
                    You've reached the end! 🚀
                </div>
            )}
        </main>

        {/* ĐÃ XÓA: Phần <aside> bị trùng lặp tại đây */}
    </MainLayout>
  );
}