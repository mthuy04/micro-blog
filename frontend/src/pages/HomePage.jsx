// frontend/src/pages/HomePage.jsx
import { useEffect, useState } from "react";
import MainLayout from "../components/layout/MainLayout";
import { getFeed, createPost, toggleLike } from "../api/posts";
import Toast from "../components/common/Toast";

export default function HomePage() {
  const [posts, setPosts] = useState([]);
  const [content, setContent] = useState("");
  const [image, setImage] = useState(null);
  const [toast, setToast] = useState({ type: "success", message: "" });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadFeed();
  }, []);

  async function loadFeed() {
    try {
      const data = await getFeed();
      setPosts(data.posts || data);
    } catch (err) {
      console.error(err);
      setToast({ type: "error", message: "Failed to load feed" });
    }
  }

  function handleFile(e) {
    setImage(e.target.files[0] || null);
  }

  async function handleCreatePost(e) {
    e.preventDefault();
    if (!content.trim() && !image) return;

    const formData = new FormData();
    formData.append("content", content);
    if (image) formData.append("image", image);

    setLoading(true);
    try {
      const newPost = await createPost(formData);
      setPosts((prev) => [newPost, ...prev]);
      setContent("");
      setImage(null);
      setToast({ type: "success", message: "Post created!" });
    } catch (err) {
      console.error(err);
      setToast({ type: "error", message: "Failed to create post" });
    } finally {
      setLoading(false);
    }
  }

  async function handleToggleLike(postId) {
    try {
      const updated = await toggleLike(postId);
      setPosts((prev) =>
        prev.map((p) => (p.id === updated.id ? updated : p))
      );
    } catch (err) {
      console.error(err);
      setToast({ type: "error", message: "Failed to like post" });
    }
  }

  return (
    <MainLayout active="home">
      {/* Header */}
      <div className="border-b border-slate-200 px-4 py-3 font-semibold">
        Home
      </div>

      {/* New post box */}
      <form
        onSubmit={handleCreatePost}
        className="px-4 py-3 border-b border-slate-200 flex gap-3"
      >
        <div className="w-10 h-10 rounded-full bg-slate-200" />
        <div className="flex-1">
          <textarea
            rows={3}
            value={content}
            onChange={(e) => setContent(e.target.value)}
            className="w-full text-sm border-none resize-none outline-none"
            placeholder="What’s happening?"
          />
          <div className="flex items-center justify-between mt-2">
            <div className="flex items-center gap-2 text-xl text-indigo-600">
              <label className="cursor-pointer text-sm text-indigo-600">
                📷
                <input
                  type="file"
                  className="hidden"
                  accept="image/*"
                  onChange={handleFile}
                />
              </label>
            </div>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-1.5 rounded-full bg-slate-900 text-white text-xs font-semibold disabled:opacity-60"
            >
              {loading ? "Posting..." : "Post"}
            </button>
          </div>
        </div>
      </form>

      {/* Feed list */}
      <div>
        {posts.map((post) => (
          <article
            key={post.id}
            className="px-4 py-3 border-b border-slate-200 flex gap-3"
          >
            <div className="w-10 h-10 rounded-full bg-slate-200 overflow-hidden">
              {post.author_avatar && (
                <img
                  src={post.author_avatar}
                  alt={post.author_name}
                  className="w-full h-full object-cover"
                />
              )}
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold">
                  {post.author_name}
                </span>
                <span className="text-xs text-slate-500">
                  @{post.author_username}
                </span>
                <span className="text-xs text-slate-400">
                  · {post.created_at_human || "now"}
                </span>
              </div>
              <p className="text-sm mt-1 whitespace-pre-wrap">
                {post.content}
              </p>
              {post.image_url && (
                <div className="mt-2 rounded-2xl overflow-hidden border border-slate-200">
                  <img
                    src={post.image_url}
                    alt="Post"
                    className="w-full max-h-[450px] object-cover"
                  />
                </div>
              )}

              <div className="flex items-center gap-8 mt-3 text-xs text-slate-500">
                <button
                  type="button"
                  className="flex items-center gap-1 hover:text-indigo-600"
                  onClick={() => handleToggleLike(post.id)}
                >
                  <span>{post.liked_by_me ? "💜" : "🤍"}</span>
                  <span>{post.likes_count || 0}</span>
                </button>
                <span>💬 {post.comments_count || 0}</span>
              </div>
            </div>
          </article>
        ))}
      </div>

      <Toast
        type={toast.type}
        message={toast.message}
        onClose={() => setToast({ ...toast, message: "" })}
      />
    </MainLayout>
  );
}
