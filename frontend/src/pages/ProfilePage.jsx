// frontend/src/pages/ProfilePage.jsx
import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import MainLayout from "../components/layout/MainLayout";
import {
  getProfile,
  getUserPosts,
  followUser,
  unfollowUser,
} from "../api/social";
import { toggleLike } from "../api/posts";
import Toast from "../components/common/Toast";
import { getCurrentUser } from "../api/client";

export default function ProfilePage() {
  const { username } = useParams();
  const [profile, setProfile] = useState(null);
  const [posts, setPosts] = useState([]);
  const [toast, setToast] = useState({ type: "success", message: "" });
  const currentUser = getCurrentUser();

  useEffect(() => {
    async function load() {
      try {
        const p = await getProfile(username);
        setProfile(p);
        const ps = await getUserPosts(username);
        setPosts(ps.posts || ps);
      } catch (err) {
        console.error(err);
        setToast({ type: "error", message: "Failed to load profile" });
      }
    }
    load();
  }, [username]);

  async function handleFollowToggle() {
    if (!profile) return;
    try {
      let updated;
      if (profile.is_following) {
        updated = await unfollowUser(profile.id);
      } else {
        updated = await followUser(profile.id);
      }
      setProfile((p) => ({ ...p, ...updated }));
    } catch (err) {
      console.error(err);
      setToast({ type: "error", message: "Failed to update follow" });
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
    }
  }

  return (
    <MainLayout active="profile">
      {!profile ? (
        <div className="p-6 text-sm text-slate-500">Loading profile...</div>
      ) : (
        <>
          {/* Header */}
          <div className="border-b border-slate-200 px-4 py-3">
            <h1 className="font-semibold text-sm">{profile.full_name}</h1>
            <p className="text-xs text-slate-500">
              {posts.length} posts · {profile.followers_count} followers
            </p>
          </div>

          {/* Banner + avatar */}
          <div className="w-full h-32 bg-gradient-to-r from-indigo-500 to-purple-500" />
          <div className="px-4 flex justify-between items-end -mt-8 mb-2">
            <div className="flex items-end gap-3">
              <div className="w-20 h-20 rounded-full border-4 border-white bg-slate-200 overflow-hidden">
                {profile.avatar_url && (
                  <img
                    src={profile.avatar_url}
                    alt={profile.full_name}
                    className="w-full h-full object-cover"
                  />
                )}
              </div>
              <div className="pb-1">
                <p className="font-semibold text-sm">{profile.full_name}</p>
                <p className="text-xs text-slate-500">@{profile.username}</p>
              </div>
            </div>

            {currentUser?.username === profile.username ? (
              <Link
                to={`/profile/${profile.username}/edit`}
                className="px-3 py-1 rounded-full border border-slate-300 text-xs font-medium hover:border-indigo-500 hover:text-indigo-600"
              >
                Edit profile
              </Link>
            ) : (
              <button
                onClick={handleFollowToggle}
                className={`px-4 py-1 rounded-full text-xs font-semibold ${
                  profile.is_following
                    ? "border border-slate-300 bg-white"
                    : "bg-slate-900 text-white"
                }`}
              >
                {profile.is_following ? "Following" : "Follow"}
              </button>
            )}
          </div>

          <div className="px-4 mb-3 text-xs text-slate-600">
            {profile.bio && <p className="mb-1">{profile.bio}</p>}
            <div className="flex gap-4 text-slate-500">
              {profile.location && <span>📍 {profile.location}</span>}
              {profile.website && (
                <a
                  href={profile.website}
                  target="_blank"
                  rel="noreferrer"
                  className="text-indigo-600"
                >
                  🔗 {profile.website}
                </a>
              )}
            </div>
          </div>

          {/* Posts */}
          <div>
            {posts.map((post) => (
              <article
                key={post.id}
                className="px-4 py-3 border-t border-slate-200 flex gap-3"
              >
                <div className="w-9 h-9 rounded-full bg-slate-200" />
                <div className="flex-1">
                  <p className="text-sm whitespace-pre-wrap">{post.content}</p>
                  {post.image_url && (
                    <div className="mt-2 rounded-2xl overflow-hidden border border-slate-200">
                      <img
                        src={post.image_url}
                        alt="Post"
                        className="w-full max-h-[450px] object-cover"
                      />
                    </div>
                  )}
                  <div className="flex items-center gap-6 mt-2 text-xs text-slate-500">
                    <button
                      type="button"
                      onClick={() => handleToggleLike(post.id)}
                      className="flex items-center gap-1 hover:text-indigo-600"
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
