// frontend/src/pages/EditProfilePage.jsx
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import MainLayout from "../components/layout/MainLayout";
import { getProfile, updateProfile, updateAvatar } from "../api/social";
import Toast from "../components/common/Toast";

export default function EditProfilePage() {
  const { username } = useParams();
  const [form, setForm] = useState({
    full_name: "",
    bio: "",
    location: "",
    website: "",
  });
  const [avatarFile, setAvatarFile] = useState(null);
  const [toast, setToast] = useState({ type: "success", message: "" });
  const navigate = useNavigate();

  useEffect(() => {
    async function load() {
      try {
        const p = await getProfile(username);
        setForm({
          full_name: p.full_name || "",
          bio: p.bio || "",
          location: p.location || "",
          website: p.website || "",
        });
      } catch (err) {
        console.error(err);
        setToast({ type: "error", message: "Failed to load profile" });
      }
    }
    load();
  }, [username]);

  function handleChange(e) {
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    try {
      await updateProfile(form);
      if (avatarFile) {
        const fd = new FormData();
        fd.append("avatar", avatarFile);
        await updateAvatar(fd);
      }
      setToast({ type: "success", message: "Profile updated!" });
      navigate(`/profile/${username}`);
    } catch (err) {
      console.error(err);
      setToast({ type: "error", message: "Failed to update profile" });
    }
  }

  return (
    <MainLayout active="profile">
      <div className="border-b border-slate-200 px-4 py-3 font-semibold">
        Edit profile
      </div>

      <form
        onSubmit={handleSubmit}
        className="px-4 py-4 max-w-lg space-y-4 text-sm"
      >
        <div>
          <label className="block text-xs font-medium mb-1">Avatar</label>
          <input
            type="file"
            accept="image/*"
            onChange={(e) => setAvatarFile(e.target.files?.[0] || null)}
          />
        </div>

        <div>
          <label className="block text-xs font-medium mb-1">Full name</label>
          <input
            name="full_name"
            value={form.full_name}
            onChange={handleChange}
            className="w-full border border-slate-200 rounded-lg px-3 py-2"
          />
        </div>

        <div>
          <label className="block text-xs font-medium mb-1">Bio</label>
          <textarea
            name="bio"
            rows={3}
            value={form.bio}
            onChange={handleChange}
            className="w-full border border-slate-200 rounded-lg px-3 py-2"
          />
        </div>

        <div className="flex gap-4">
          <div className="flex-1">
            <label className="block text-xs font-medium mb-1">
              Location
            </label>
            <input
              name="location"
              value={form.location}
              onChange={handleChange}
              className="w-full border border-slate-200 rounded-lg px-3 py-2"
            />
          </div>
          <div className="flex-1">
            <label className="block text-xs font-medium mb-1">
              Website
            </label>
            <input
              name="website"
              value={form.website}
              onChange={handleChange}
              className="w-full border border-slate-200 rounded-lg px-3 py-2"
            />
          </div>
        </div>

        <button
          type="submit"
          className="px-4 py-2 rounded-full bg-slate-900 text-white text-xs font-semibold"
        >
          Save changes
        </button>
      </form>

      <Toast
        type={toast.type}
        message={toast.message}
        onClose={() => setToast({ ...toast, message: "" })}
      />
    </MainLayout>
  );
}
