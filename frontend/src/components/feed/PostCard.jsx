import React, { useState } from "react";

export default function PostCard({ post, onLike, onComment }) {
  const [comment, setComment] = useState("");

  return (
    <article className="border-b px-4 py-3">
      <div className="flex items-start gap-3">
        <div className="w-10 h-10 rounded-full bg-slate-300 overflow-hidden">
          {post.user.avatar && (
            <img
              src={post.user.avatar}
              alt={post.user.name}
              className="w-full h-full object-cover"
            />
          )}
        </div>

        <div className="flex-1">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-sm">{post.user.name}</span>
            <span className="text-xs text-slate-400">
              {new Date(post.created_at).toLocaleString()}
            </span>
          </div>

          <p className="mt-1 text-sm text-slate-800 whitespace-pre-line">
            {post.content}
          </p>

          {post.image && (
            <img
              src={post.image}
              alt=""
              className="mt-2 rounded-xl max-h-[450px] w-full object-cover"
            />
          )}

          <div className="mt-3 flex items-center gap-6 text-xs text-slate-500">
            <button
              onClick={onLike}
              className="flex items-center gap-1 hover:text-blue-500"
            >
              <span>♥</span>
              <span>{post.likes_count}</span>
            </button>
            <div className="flex items-center gap-1">
              <span>💬</span>
              <span>{post.comments_count}</span>
            </div>
          </div>

          <div className="mt-2 flex gap-2">
            <input
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              className="flex-1 rounded-full border border-slate-200 px-3 py-1 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Write a comment..."
            />
            <button
              onClick={() => {
                if (!comment.trim()) return;
                onComment(comment.trim());
                setComment("");
              }}
              className="px-3 py-1 rounded-full bg-blue-600 text-white text-xs"
            >
              Reply
            </button>
          </div>
        </div>
      </div>
    </article>
  );
}
