import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import MainLayout from "../components/layout/MainLayout";
import { getProfile, updateProfile, updateAvatar } from "../api/social";
import { getCurrentUser, setCurrentUser } from "../api/client"; 
import { User, MapPin, UploadCloud, Save } from "lucide-react";
import { getImageUrl } from "../utils/env";

export default function EditProfilePage() {
  const user = getCurrentUser();
  const navigate = useNavigate();
  const [form, setForm] = useState({ full_name: "", bio: "", location: "" });
  const [avatarFile, setAvatarFile] = useState(null);

  useEffect(() => {
    if(user) {
        getProfile(user.username).then(p => {
            setForm({ full_name: p.full_name || "", bio: p.bio || "", location: p.location || "" });
        });
    }
  }, []);

  async function handleSubmit(e) {
    e.preventDefault();
    try {
        // 1. Cập nhật thông tin text
        await updateProfile(form);

        // 2. Nếu có file ảnh, upload và cập nhật LocalStorage
        if(avatarFile) {
            const fd = new FormData();
            fd.append("avatar", avatarFile);
            
            // Upload ảnh lên server
            const res = await updateAvatar(fd);
            
            // Cập nhật ngay vào bộ nhớ trình duyệt để Sidebar/Header nhận diện
            // Backend trả về { url: "..." }
            const updatedUser = { ...user, avatar: res.url };
            setCurrentUser(updatedUser);
        }

        // 3. Reload trang để toàn bộ web nhận diện ảnh mới
        // Dùng window.location.href để ép trình duyệt tải lại từ đầu, đảm bảo ảnh mới xuất hiện mọi nơi
        window.location.href = `/profile/${user.username}`;
        
    } catch(err) { console.error(err); }
  }
  
  // Helper xem trước ảnh
  const previewAvatar = avatarFile ? URL.createObjectURL(avatarFile) : getImageUrl(user?.avatar);

  return (
    <MainLayout active="profile">
        <main className="w-full lg:ml-72 min-h-screen pb-20 pt-8 px-4 lg:px-10">
            <div className="flex items-center gap-4 mb-8">
                 <div>
                    <h1 className="text-3xl font-bold text-slate-900">Edit Profile</h1>
                    <p className="text-slate-500 mt-1">Manage your public profile and private settings.</p>
                </div>
            </div>

            <div className="grid lg:grid-cols-12 gap-8 items-start">
                
                {/* LIVE PREVIEW */}
                <div className="lg:col-span-5 xl:col-span-4 lg:sticky lg:top-8 order-2 lg:order-1">
                    <div className="bg-white/40 backdrop-blur-sm border border-white/60 p-1 rounded-3xl shadow-sm">
                         <div className="bg-white rounded-[20px] p-6 shadow-xl shadow-indigo-100 overflow-hidden relative">
                            <div className="absolute top-3 right-3 bg-black/5 px-3 py-1 rounded-full text-[10px] font-bold uppercase text-slate-500">Live Preview</div>
                            <div className="h-32 -mx-6 -mt-6 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500"></div>
                            <div className="relative -mt-12 mb-3">
                                <div className="w-24 h-24 rounded-full p-1 bg-white shadow-md inline-block">
                                    <img src={previewAvatar} className="w-full h-full rounded-full object-cover bg-indigo-50" alt="Preview" />
                                </div>
                            </div>
                            <div className="space-y-3 text-center">
                                <div>
                                    <h3 className="text-xl font-bold text-slate-900">{form.full_name || "Your Name"}</h3>
                                    <p className="text-slate-500 text-sm">@{user?.username}</p>
                                </div>
                                <p className="text-slate-600 text-sm leading-relaxed">{form.bio || "Your bio will appear here..."}</p>
                                <div className="flex items-center justify-center gap-1 text-xs text-slate-400 pt-1">
                                    <MapPin className="w-3 h-3" />
                                    <span>{form.location || "Location"}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* EDIT FORM */}
                <div className="lg:col-span-7 xl:col-span-8 order-1 lg:order-2 space-y-8">
                    <div className="bg-white rounded-3xl p-6 md:p-8 shadow-sm border border-slate-100">
                        <div className="flex items-center gap-3 mb-6 border-b border-slate-100 pb-4">
                            <div className="p-2 bg-indigo-50 rounded-lg text-indigo-600"><User className="w-5 h-5" /></div>
                            <h2 className="text-lg font-bold text-slate-900">Profile Information</h2>
                        </div>

                        <form className="space-y-6" onSubmit={handleSubmit}>
                            {/* Avatar Upload */}
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-3">Profile Photo</label>
                                <div className="flex items-center gap-6">
                                    <img src={previewAvatar} className="w-16 h-16 rounded-full bg-indigo-50 border border-slate-200 object-cover" alt="Current" />
                                    <label className="flex-1 border-2 border-dashed border-slate-200 rounded-xl p-4 flex flex-col items-center justify-center text-center cursor-pointer hover:border-indigo-300 hover:bg-indigo-50/30 transition-all group">
                                        <input type="file" className="hidden" accept="image/*" onChange={(e) => setAvatarFile(e.target.files[0])} />
                                        <UploadCloud className="w-6 h-6 text-slate-400 group-hover:text-indigo-500 mb-2" />
                                        <p className="text-sm font-medium text-slate-600">Click to upload</p>
                                    </label>
                                </div>
                            </div>

                            {/* Name */}
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1.5">Display Name</label>
                                <input 
                                    type="text" 
                                    value={form.full_name} 
                                    onChange={(e) => setForm({...form, full_name: e.target.value})}
                                    className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-indigo-500 outline-none transition-all text-sm font-medium" 
                                />
                            </div>

                            {/* Bio */}
                            <div>
                                <div className="flex justify-between mb-1.5">
                                    <label className="block text-sm font-medium text-slate-700">Bio</label>
                                    <span className="text-xs text-slate-400">{form.bio.length}/160</span>
                                </div>
                                <textarea 
                                    rows="4" 
                                    value={form.bio} 
                                    onChange={(e) => setForm({...form, bio: e.target.value})}
                                    className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-indigo-500 outline-none transition-all text-sm resize-none"
                                ></textarea>
                            </div>

                             {/* Location */}
                             <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1.5">Location</label>
                                <input 
                                    type="text" 
                                    value={form.location} 
                                    onChange={(e) => setForm({...form, location: e.target.value})}
                                    className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-indigo-500 outline-none transition-all text-sm font-medium" 
                                />
                            </div>

                            {/* Action Buttons */}
                            <div className="flex items-center justify-end gap-4 pt-4">
                                <button type="button" onClick={() => navigate(-1)} className="px-6 py-3 rounded-xl font-bold text-slate-500 hover:bg-slate-100">Cancel</button>
                                <button type="submit" className="bg-indigo-600 text-white px-8 py-3 rounded-xl font-bold shadow-lg hover:bg-indigo-700 flex items-center gap-2">
                                    <Save className="w-4 h-4" />
                                    Save Changes
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </main>
    </MainLayout>
  );
}