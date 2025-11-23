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

  // Định nghĩa hàm fetch riêng để tái sử dụng
  const loadData = async () => {
    try {
        const data = await getPost(id);
        setPost(data.post || data);
    } catch (e) { console.error(e); }
  };

  // Gọi lần đầu
  useEffect(() => {
    loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  async function handleComment(e) {
    e.preventDefault();
    if (!comment.trim()) return;
    try {
      await createComment(id, { body: comment });
      setComment("");
      // Gọi lại hàm loadData để cập nhật comment mới
      await loadData(); 
    } catch (e) {
      console.error(e);
    }
  }

  async function handleLike() {
    try {
      await toggleLike(id);
      setPost((prev) => ({
        ...prev,
        liked_by_me: !prev.liked_by_me,
        likes_count: prev.liked_by_me ? prev.likes_count - 1 : prev.likes_count + 1,
      }));
    } catch (e) {
      console.error(e);
    }
  }

  if (!post) return <MainLayout><div className="p-10 text-center">Loading...</div></MainLayout>;

  const avatarSrc = getImageUrl(post.author_avatar) || `https://api.dicebear.com/7.x/avataaars/svg?seed=${post.author_username}`;

  return (
    <MainLayout>
      <main className="w-full lg:w-[600px] border-r border-slate-200/60 min-h-screen pb-20">
        {/* Header */}
        <div className="sticky top-0 bg-white/80 backdrop-blur-md z-10 border-b border-slate-100 px-4 py-3 flex items-center gap-4">
          <button onClick={() => navigate(-1)} className="p-2 hover:bg-slate-100 rounded-full">
            <ArrowLeft className="w-5 h-5 text-slate-700" />
          </button>
          <h2 className="text-xl font-bold text-slate-900">Post</h2>
        </div>

        {/* Main Post Content */}
        <article className="p-6 border-b border-slate-100">
          <div className="flex gap-3 mb-4">
            <img src={avatarSrc} className="w-14 h-14 rounded-full border border-slate-100 object-cover" alt="User" />
            <div className="flex flex-col justify-center">
              <Link to={`/profile/${post.author_username}`} className="font-bold text-slate-900 text-lg hover:underline">
                {post.author_name}
              </Link>
              <p className="text-slate-500">@{post.author_username}</p>
            </div>
          </div>

          <p className="text-xl text-slate-900 mb-4 leading-relaxed whitespace-pre-wrap">{post.content}</p>

          {post.image_url && (
            <div className="rounded-2xl overflow-hidden border border-slate-200 mb-4">
              <img src={getImageUrl(post.image_url)} className="w-full h-auto object-cover" alt="Post" />
            </div>
          )}

          <div className="py-4 border-b border-slate-100 text-slate-500 text-[15px]">
            {post.created_at_human} · <strong>{post.views || "12.5K"}</strong> Views
          </div>

          <div className="flex justify-around items-center py-3 border-b border-slate-100 text-slate-500">
            <button className="flex items-center gap-2 hover:text-indigo-600">
              <MessageCircle className="w-5 h-5" /> {post.comments_count}
            </button>
            <button className="flex items-center gap-2 hover:text-green-600">
              <Repeat className="w-5 h-5" /> 0
            </button>
            <button onClick={handleLike} className={`flex items-center gap-2 ${post.liked_by_me ? "text-pink-600" : "hover:text-pink-600"}`}>
              <Heart className={`w-5 h-5 ${post.liked_by_me ? "fill-current" : ""}`} /> {post.likes_count}
            </button>
            <button className="flex items-center gap-2 hover:text-indigo-600">
              <Share className="w-5 h-5" />
            </button>
          </div>
        </article>

        {/* Input Comment */}
        <div className="p-4 border-b border-slate-100 flex gap-3 bg-slate-50/50">
          <div className="w-10 h-10 rounded-full bg-slate-200 overflow-hidden">
             {/* Placeholder avatar, có thể thay bằng currentUser nếu muốn */}
          </div>
          <form onSubmit={handleComment} className="flex-1 relative">
            <input
              className="w-full p-4 pr-12 bg-white border border-slate-200 rounded-2xl outline-none focus:ring-2 focus:ring-indigo-500/20 transition-all"
              placeholder="Post your reply..."
              value={comment}
              onChange={(e) => setComment(e.target.value)}
            />
            <button type="submit" disabled={!comment.trim()} className="absolute right-2 top-2 p-2 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 disabled:opacity-50 transition-colors">
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>

        {/* Comments List */}
        <div className="divide-y divide-slate-100">
          {post.comments &&
            post.comments.map((c) => (
              <div key={c.id} className="p-5 hover:bg-slate-50 transition-colors">
                <div className="flex gap-3">
                  <img
                    src={getImageUrl(c.author_avatar) || `https://api.dicebear.com/7.x/avataaars/svg?seed=${c.author_username || "User"}`}
                    className="w-10 h-10 rounded-full border border-slate-100 object-cover"
                    alt="Commenter"
                  />
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-bold text-slate-900 text-sm">{c.author_name || "User"}</span>
                      <span className="text-slate-500 text-xs">@{c.author_username}</span>
                      <span className="text-slate-400 text-xs">· {c.created_at_human || "now"}</span>
                    </div>
                    <p className="text-slate-800 text-[15px] leading-relaxed">{c.body}</p>
                  </div>
                </div>
              </div>
            ))}
          {(!post.comments || post.comments.length === 0) && (
            <div className="p-10 text-center">
              <p className="text-slate-500 font-medium">No comments yet. Be the first to reply!</p>
            </div>
          )}
        </div>
      </main>

      {/* Right Sidebar */}
      <aside className="hidden xl:block w-[380px] pl-10 pt-8 space-y-6 sticky top-0 h-screen overflow-y-auto pb-8">
        <div className="bg-slate-100/50 rounded-3xl p-6">
          <h3 className="font-bold text-lg mb-4">Relevant People</h3>
          <div className="flex items-center gap-3 mb-4">
            <img src={avatarSrc} className="w-10 h-10 rounded-full object-cover" alt="suggest" />
            <div>
              <p className="font-bold text-sm">{post.author_name}</p>
              <p className="text-xs text-slate-500">@{post.author_username}</p>
            </div>
            <button className="ml-auto bg-white border border-slate-300 px-3 py-1 rounded-full text-xs font-bold">Follow</button>
          </div>
        </div>
      </aside>
    </MainLayout>
  );
}