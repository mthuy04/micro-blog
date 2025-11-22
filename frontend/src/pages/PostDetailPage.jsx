// frontend/src/pages/PostDetailPage.jsx
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import MainLayout from "../components/layout/MainLayout";
import { getPost, createComment, toggleLike } from "../api/posts";
import Toast from "../components/common/Toast";

export default function PostDetailPage() {
  const { id } = useParams();
  const [post, setPost] = useState(null);
  const [commentText, setCommentText] = useState("");
  const [toast, setToast] = useState({ type: "success", message: "" });

  useEffect(() => {
    async function load() {
      try {
        const data = await getPost(id);
        setPost(data.post || data);
      } catch (err) {
        console.error(err);
        setToast({ type: "error", message: "Failed to load post" });
      }
    }
    load();
  }, [id]);

  async function handleToggleLike() {
    try {
      const updated = await toggleLike(post.id);
      setPost(updated);
    } catch (err) {
      console.error(err);
    }
  }

  async function handleAddComment(e) {
    e.preventDefault();
    if (!commentText.trim()) return;
    try {
      const newComment = await createComment(post.id, {
        content: commentText,
      });
      setPost((p) => ({
        ...p,
        comments: [newComment, ...(p.comments || [])],
      }));
      setCommentText("");
    } catch (err) {
      console.error(err);
      setToast({ type: "error", message: "Failed to comment" });
    }
  }

  return (
    <MainLayout>
      {!post ? (
        <div className="p-6 text-sm text-slate-500">Loading post...</div>
      ) : (
        <>
          <div className="border-b border-slate-200 px-4 py-3 font-semibold">
            Post
          </div>

          {/* Post */}
          <article className="px-4 py-4 border-b border-slate-200 flex gap-3">
            <div className="w-10 h-10 rounded-full bg-slate-200"></div>
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
              <p className="mt-2 text-sm whitespace-pre-wrap">
                {post.content}
              </p>
              {post.image_url && (
                <div className="mt-3 rounded-2xl overflow-hidden border border-slate-200">
                  <img
                    src={post.image_url}
                    alt="Post"
                    className="w-full max-h-[450px] object-cover"
                  />
                </div>
              )}
              <div className="flex items-center gap-6 mt-3 text-xs text-slate-500">
                <button
                  type="button"
                  onClick={handleToggleLike}
                  className="flex items-center gap-1 hover:text-indigo-600"
                >
                  <span>{post.liked_by_me ? "💜" : "🤍"}</span>
                  <span>{post.likes_count || 0}</span>
                </button>
                <span>💬 {(post.comments || []).length}</span>
              </div>
            </div>
          </article>

          {/* Comment box */}
          <form
            onSubmit={handleAddComment}
            className="px-4 py-3 border-b border-slate-200 flex gap-3"
          >
            <div className="w-9 h-9 rounded-full bg-slate-200" />
            <div className="flex-1">
              <textarea
                rows={2}
                className="w-full border-none outline-none text-sm resize-none"
                placeholder="Post your reply"
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
              />
              <div className="flex justify-end mt-2">
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded-full bg-slate-900 text-white text-xs font-semibold"
                >
                  Reply
                </button>
              </div>
            </div>
          </form>

          {/* Comment list */}
          <div>
            {(post.comments || []).map((c) => (
              <div
                key={c.id}
                className="px-4 py-3 border-b border-slate-100 flex gap-3"
              >
                <div className="w-8 h-8 rounded-full bg-slate-200" />
                <div className="flex-1">
                  <div className="flex items-center gap-2 text-xs">
                    <span className="font-semibold">{c.author_name}</span>
                    <span className="text-slate-500">
                      @{c.author_username}
                    </span>
                    <span className="text-slate-400">
                      · {c.created_at_human || ""}
                    </span>
                  </div>
                  <p className="mt-1 text-sm">{c.content}</p>
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      <Toast
        type={toast.type}
        message={toast.message}
        onClose={() => setToast({ ...toast, message: "" })}
      />
    </MainLayout>
  );
}
