import { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import MainLayout from "../components/layout/MainLayout";
import { getPost, createComment, toggleLike } from "../api/posts";
import { getImageUrl } from "../utils/env";
import { ArrowLeft, MessageCircle, Heart, Repeat, Share, Send } from "lucide-react";

export default function PostDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [post, setPost] = useState(null);
  const [comment, setComment] = useState("");
  const [loading, setLoading] = useState(true);

  const loadData = async () => {
    try {
        const data = await getPost(id);
        setPost(data.post || data);
    } catch (e) { 
        console.error(e); 
    } finally {
        setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [id]);

  async function handleComment(e) {
    e.preventDefault();
    if (!comment.trim()) return;
    try {
      await createComment(id, { body: comment });
      setComment("");
      await loadData();
    } catch (e) { console.error(e); }
  }

  async function handleLike() {
    try {
      await toggleLike(id);
      setPost((prev) => ({
        ...prev,
        liked_by_me: !prev.liked_by_me,
        likes_count: prev.liked_by_me ? prev.likes_count - 1 : prev.likes_count + 1,
      }));
    } catch (e) { console.error(e); }
  }

  // --- HÀM RENDER CONTENT ĐÃ ĐƯỢC NÂNG CẤP (Fix lỗi JSON) ---
  const renderContent = (fullContent) => {
      if (!fullContent) return null;

      let caption = fullContent;
      let repostData = null;

      // 1. Parse Format Mới (Caption |||REPOST::{json})
      if (fullContent.includes("|||REPOST::")) {
          const parts = fullContent.split("|||REPOST::");
          caption = parts[0]; 
          try { repostData = JSON.parse(parts[1]); } catch {}
      } 
      // 2. Parse Format Cũ (REPOST::{json})
      else if (fullContent.startsWith("REPOST::")) {
          caption = "";
          try { repostData = JSON.parse(fullContent.replace("REPOST::", "")); } catch {}
      }

      return (
          <div className="text-[15px] text-slate-900 mb-2">
              {/* Hiển thị Caption của người repost */}
              {caption && <p className="mb-4 text-xl leading-relaxed whitespace-pre-wrap">{caption}</p>}
              
              {/* Hiển thị khung bài gốc */}
              {repostData && (
                  <div className="mt-2 border border-slate-200 rounded-2xl p-4 bg-white hover:bg-slate-50 transition-colors cursor-pointer"
                       onClick={(e) => {
                           e.stopPropagation();
                           navigate(`/profile/${repostData.original_username}`);
                       }}>
                      <div className="flex items-center gap-2 mb-2">
                          <img src={getImageUrl(repostData.original_avatar) || `https://api.dicebear.com/7.x/avataaars/svg?seed=${repostData.original_username}`} className="w-6 h-6 rounded-full border border-slate-100" alt="orig" />
                          <span className="font-bold text-sm text-slate-900">{repostData.original_author}</span>
                          <span className="text-slate-500 text-xs">@{repostData.original_username}</span>
                      </div>
                      <p className="text-sm text-slate-800 mb-2">{repostData.original_content}</p>
                      {repostData.original_image && (
                          <div className="rounded-xl overflow-hidden h-64 border border-slate-100 bg-slate-50">
                              <img src={getImageUrl(repostData.original_image)} className="w-full h-full object-cover" alt="orig content"/>
                          </div>
                      )}
                  </div>
              )}
          </div>
      );
  };

  if (loading) return <MainLayout><div className="p-10 text-center text-slate-500">Loading post...</div></MainLayout>;
  if (!post) return <MainLayout><div className="p-10 text-center text-slate-500">Post not found.</div></MainLayout>;

  const avatarSrc = getImageUrl(post.author_avatar) || `https://api.dicebear.com/7.x/avataaars/svg?seed=${post.author_username}`;

  return (
    <MainLayout>
      <main className="w-full lg:w-[600px] border-r border-slate-200/60 min-h-screen pb-20">
        <div className="sticky top-0 bg-white/80 backdrop-blur-md z-10 border-b border-slate-100 px-4 py-3 flex items-center gap-4">
          <button onClick={() => navigate(-1)} className="p-2 hover:bg-slate-100 rounded-full transition-colors"><ArrowLeft className="w-5 h-5 text-slate-700" /></button>
          <h2 className="text-xl font-bold text-slate-900">Post</h2>
        </div>

        <article className="p-6 border-b border-slate-100">
          <div className="flex gap-3 mb-4">
            <img src={avatarSrc} className="w-14 h-14 rounded-full border border-slate-100 object-cover" alt="User" />
            <div className="flex flex-col justify-center">
              <Link to={`/profile/${post.author_username}`} className="font-bold text-slate-900 text-lg hover:underline">{post.author_name}</Link>
              <p className="text-slate-500">@{post.author_username}</p>
            </div>
          </div>

          {/* Gọi hàm render đã fix */}
          <div className="mb-4">{renderContent(post.content)}</div>

          {post.image_url && (
            <div className="rounded-2xl overflow-hidden border border-slate-200 mb-4 bg-slate-100">
              <img src={getImageUrl(post.image_url)} className="w-full h-auto object-cover" alt="Post" />
            </div>
          )}

          <div className="py-4 border-b border-slate-100 text-slate-500 text-[15px]">
            {post.created_at_human}
          </div>

          <div className="flex justify-around items-center py-3 border-b border-slate-100 text-slate-500">
            <button className="flex items-center gap-2 hover:text-indigo-600"><MessageCircle className="w-5 h-5" /> {post.comments_count}</button>
            <button className="flex items-center gap-2 hover:text-green-600"><Repeat className="w-5 h-5" /> 0</button>
            <button onClick={handleLike} className={`flex items-center gap-2 transition-colors ${post.liked_by_me ? "text-pink-600" : "hover:text-pink-600"}`}><Heart className={`w-5 h-5 ${post.liked_by_me ? "fill-current" : ""}`} /> {post.likes_count}</button>
            <button className="flex items-center gap-2 hover:text-indigo-600"><Share className="w-5 h-5" /></button>
          </div>
        </article>

        {/* Input Comment */}
        <div className="p-4 border-b border-slate-100 flex gap-3 bg-slate-50/50">
          <div className="w-10 h-10 rounded-full bg-slate-200 overflow-hidden flex-shrink-0">
             <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=MyUser`} className="w-full h-full object-cover" alt="me" />
          </div>
          <form onSubmit={handleComment} className="flex-1 relative">
            <input className="w-full p-4 pr-12 bg-white border border-slate-200 rounded-2xl outline-none focus:ring-2 focus:ring-indigo-500/20 transition-all placeholder-slate-400" placeholder="Post your reply..." value={comment} onChange={(e) => setComment(e.target.value)} />
            <button type="submit" disabled={!comment.trim()} className="absolute right-2 top-2 p-2 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 disabled:opacity-50 transition-colors"><Send className="w-4 h-4" /></button>
          </form>
        </div>

        <div className="divide-y divide-slate-100">
          {post.comments && post.comments.map((c) => (
              <div key={c.id} className="p-5 hover:bg-slate-50 transition-colors">
                <div className="flex gap-3">
                  <Link to={`/profile/${c.author_username}`}><img src={getImageUrl(c.author_avatar) || `https://api.dicebear.com/7.x/avataaars/svg?seed=${c.author_username}`} className="w-10 h-10 rounded-full border border-slate-100 object-cover bg-white" alt="Commenter" /></Link>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <Link to={`/profile/${c.author_username}`} className="font-bold text-slate-900 text-sm hover:underline">{c.author_name}</Link>
                      <span className="text-slate-500 text-xs">@{c.author_username}</span>
                      <span className="text-slate-400 text-xs">· {c.created_at_human}</span>
                    </div>
                    <p className="text-slate-800 text-[15px] leading-relaxed">{c.body}</p>
                  </div>
                </div>
              </div>
            ))}
        </div>
      </main>
    </MainLayout>
  );
}