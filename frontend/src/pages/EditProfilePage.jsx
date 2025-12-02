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
        await updateProfile(form);

        if(avatarFile) {
            const fd = new FormData();
            fd.append("avatar", avatarFile);
            const res = await updateAvatar(fd);
            const updatedUser = { ...user, avatar: res.url };
            setCurrentUser(updatedUser);
        }

        window.location.href = `/profile/${user.username}`;
        
    } catch(err) { console.error(err); }
  }
  
  const previewAvatar = avatarFile ? URL.createObjectURL(avatarFile) : getImageUrl(user?.avatar);

  return (
    <MainLayout active="profile">
        {/* SỬA LẠI CONTAINER CHÍNH:
            - Bỏ 'mx-auto' để không tự căn giữa màn hình.
            - Giữ max-w-6xl để giới hạn chiều rộng trên màn hình siêu to.
            - Thêm pl-0 lg:pl-10 để tạo khoảng cách vừa phải với Sidebar.
        */}
        <main className="w-full max-w-6xl min-h-screen pb-20 pt-8 px-6 lg:pl-12">
            
            <div className="flex items-center gap-4 mb-10">
                 <div>
                    <h1 className="text-3xl font-bold text-slate-900">Edit Profile</h1>
                    <p className="text-slate-500 mt-1">Manage your public profile and private settings.</p>
                </div>
            </div>

            <div className="grid lg:grid-cols-12 gap-10 items-start">
                
                {/* EDIT FORM (Đảo lên trước để User tập trung sửa) hoặc giữ nguyên tuỳ bạn. 
                    Ở đây tôi giữ nguyên thứ tự nhưng chỉnh lại tỉ lệ cột cho cân đối hơn.
                */}
                
                {/* LIVE PREVIEW (Cột trái) */}
                <div className="lg:col-span-5 xl:col-span-4 order-1">
                    <div className="sticky top-8">
                        <div className="bg-white/40 backdrop-blur-sm border border-white/60 p-1 rounded-3xl shadow-sm">
                             <div className="bg-white rounded-[20px] p-6 shadow-xl shadow-indigo-100 overflow-hidden relative">
                                <div className="absolute top-3 right-3 bg-black/5 px-3 py-1 rounded-full text-[10px] font-bold uppercase text-slate-500">Live Preview</div>
                                <div className="h-32 -mx-6 -mt-6 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500"></div>
                                <div className="relative -mt-12 mb-3 text-center">
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
                        <p className="text-center text-xs text-slate-400 mt-4">This is how your profile will look to others.</p>
                    </div>
                </div>

                {/* EDIT FORM (Cột phải - Chiếm phần lớn hơn) */}
                <div className="lg:col-span-7 xl:col-span-8 order-2">
                    <div className="bg-white rounded-3xl p-8 md:p-10 shadow-sm border border-slate-100">
                        <div className="flex items-center gap-3 mb-8 border-b border-slate-100 pb-6">
                            <div className="p-2.5 bg-indigo-50 rounded-xl text-indigo-600"><User className="w-6 h-6" /></div>
                            <div>
                                <h2 className="text-xl font-bold text-slate-900">Profile Information</h2>
                                <p className="text-sm text-slate-500">Update your photo and personal details.</p>
                            </div>
                        </div>

                        <form className="space-y-8" onSubmit={handleSubmit}>
                            {/* Avatar Upload */}
                            <div>
                                <label className="block text-sm font-bold text-slate-700 mb-3">Profile Photo</label>
                                <div className="flex items-center gap-6 p-4 border border-slate-100 rounded-2xl bg-slate-50/50">
                                    <img src={previewAvatar} className="w-20 h-20 rounded-full bg-indigo-50 border-2 border-white shadow-sm object-cover" alt="Current" />
                                    <div className="flex-1">
                                        <label className="inline-flex cursor-pointer gap-2 items-center px-4 py-2 bg-white border border-slate-300 rounded-lg font-semibold text-sm text-slate-700 hover:bg-slate-50 hover:border-slate-400 transition-all shadow-sm">
                                            <UploadCloud className="w-4 h-4" />
                                            <span>Upload new photo</span>
                                            <input type="file" className="hidden" accept="image/*" onChange={(e) => setAvatarFile(e.target.files[0])} />
                                        </label>
                                        <p className="text-xs text-slate-400 mt-2">Recommended: Square JPG, PNG. Max 2MB.</p>
                                    </div>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {/* Name */}
                                <div className="md:col-span-2">
                                    <label className="block text-sm font-bold text-slate-700 mb-2">Display Name</label>
                                    <input 
                                        type="text" 
                                        value={form.full_name} 
                                        onChange={(e) => setForm({...form, full_name: e.target.value})}
                                        className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 outline-none transition-all text-sm font-medium" 
                                        placeholder="e.g. Alex Doe"
                                    />
                                </div>

                                {/* Location */}
                                <div className="md:col-span-2">
                                    <label className="block text-sm font-bold text-slate-700 mb-2">Location</label>
                                    <div className="relative">
                                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400"><MapPin className="w-4 h-4" /></div>
                                        <input 
                                            type="text" 
                                            value={form.location} 
                                            onChange={(e) => setForm({...form, location: e.target.value})}
                                            className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 outline-none transition-all text-sm font-medium" 
                                            placeholder="e.g. Hanoi, Vietnam"
                                        />
                                    </div>
                                </div>

                                {/* Bio */}
                                <div className="md:col-span-2">
                                    <div className="flex justify-between mb-2">
                                        <label className="block text-sm font-bold text-slate-700">Bio</label>
                                        <span className={`text-xs font-medium ${form.bio.length > 160 ? "text-red-500" : "text-slate-400"}`}>{form.bio.length}/160</span>
                                    </div>
                                    <textarea 
                                        rows="4" 
                                        value={form.bio} 
                                        onChange={(e) => setForm({...form, bio: e.target.value})}
                                        className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 outline-none transition-all text-sm resize-none leading-relaxed"
                                        placeholder="Tell us a little about yourself..."
                                    ></textarea>
                                </div>
                            </div>

                            {/* Action Buttons */}
                            <div className="flex items-center justify-end gap-4 pt-6 border-t border-slate-100 mt-4">
                                <button type="button" onClick={() => navigate(-1)} className="px-6 py-2.5 rounded-xl font-bold text-slate-500 hover:bg-slate-100 hover:text-slate-700 transition-colors">Cancel</button>
                                <button type="submit" className="bg-indigo-600 text-white px-8 py-3 rounded-xl font-bold shadow-lg shadow-indigo-200 hover:bg-indigo-700 hover:shadow-xl hover:-translate-y-0.5 transition-all flex items-center gap-2">
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