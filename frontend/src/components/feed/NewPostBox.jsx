import React, { useState } from "react";

export default function NewPostBox({ onSubmit, loading }) {
  const [content, setContent] = useState("");
  const [imageUrl, setImageUrl] = useState("");

  async function handlePost() {
    if (!content.trim()) return;
    await onSubmit(content.trim(), imageUrl.trim() || null);
    setContent("");
    setImageUrl("");
  }

  return (
    <div className="flex gap-3">
      <div className="w-10 h-10 rounded-full bg-slate-300" />
      <div className="flex-1">
        <textarea
          className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
          rows={3}
          placeholder="What is happening?!"
          value={content}
          onChange={(e) => setContent(e.target.value)}
        />
        <input
          type="text"
          placeholder="Image URL (optional)"
          className="mt-2 w-full border border-slate-200 rounded-xl px-3 py-1 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500"
          value={imageUrl}
          onChange={(e) => setImageUrl(e.target.value)}
        />
        <div className="mt-2 flex justify-end">
          <button
            disabled={loading}
            onClick={handlePost}
            className="px-4 py-1 rounded-full bg-blue-600 text-white text-sm font-semibold disabled:opacity-60"
          >
            {loading ? "Posting..." : "Post"}
          </button>
        </div>
      </div>
    </div>
  );
}
