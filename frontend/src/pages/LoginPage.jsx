// frontend/src/pages/LoginPage.jsx
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { login } from "../api/auth";
import { setToken, setCurrentUser } from "../api/client";
import { Zap, Mail, Lock, ShieldCheck, Heart, MessageCircle, MoreHorizontal, Image as ImageIcon } from "lucide-react";

export default function LoginPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const data = await login({ email, password });
      setToken(data.token); // Lưu ý: Backend trả về "token", không phải "access_token"
      setCurrentUser(data.user);
      navigate("/home");
    } catch (err) {
      console.error(err);
      const msg = err?.response?.data?.message || err?.response?.data?.error || "Log in failed.";
      setError(msg);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="bg-white h-screen w-full flex overflow-hidden font-sans">
      {/* Left Side: Login Form */}
      <div className="w-full lg:w-1/2 flex flex-col justify-center p-8 md:p-16 xl:p-24 relative z-10 bg-white">
        
        {/* Logo */}
        <div className="absolute top-8 left-8 lg:static lg:mb-12 flex items-center gap-2">
          <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center text-white">
            <Zap className="w-5 h-5" />
          </div>
          <span className="text-xl font-bold tracking-tight text-slate-900">CAMPUSTALK</span>
        </div>

        <div className="max-w-sm w-full mx-auto">
          {/* Header */}
          <div className="mb-10">
            <h1 className="text-3xl font-bold text-slate-900 mb-2">Welcome back</h1>
            <p className="text-slate-500">Please enter your details to sign in.</p>
          </div>

          {error && (
            <div className="mb-4 p-3 rounded-xl bg-red-50 text-red-600 text-sm border border-red-100">
              {error}
            </div>
          )}

          {/* Form */}
          <form className="space-y-5" onSubmit={handleSubmit}>
            {/* Email */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Email Address</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <Mail className="w-5 h-5" />
                </div>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 outline-none transition-all placeholder-slate-400 text-sm"
                  placeholder="Enter your email"
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Password</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <Lock className="w-5 h-5" />
                </div>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 outline-none transition-all placeholder-slate-400 text-sm"
                  placeholder="••••••••"
                />
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-indigo-600 text-white font-semibold py-3.5 rounded-xl hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-200 transform active:scale-[0.98] flex items-center justify-center gap-2 disabled:opacity-70"
            >
              {loading ? "Logging in..." : "Log In"}
            </button>
          </form>

          {/* Footer */}
          <p className="text-center mt-8 text-sm text-slate-500">
            Don't have an account?{" "}
            <Link to="/register" className="font-semibold text-indigo-600 hover:text-indigo-700">Sign up</Link>
          </p>

          <div className="mt-12 flex items-center justify-center gap-2 text-xs text-slate-400 uppercase tracking-wider font-medium">
            <ShieldCheck className="w-4 h-4 text-green-500" />
            Secure Authentication
          </div>
        </div>
      </div>

      {/* Right Side: Visual */}
      <div className="hidden lg:block lg:w-1/2 relative bg-slate-50 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-50 to-blue-100"></div>
        {/* Floating Mockup Card */}
        <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-[400px] bg-white/60 backdrop-blur-xl border border-white/50 p-6 rounded-3xl shadow-2xl shadow-indigo-500/10 transform rotate-[-2deg]">
                <div className="flex items-center gap-3 mb-4">
                    <img src="https://api.dicebear.com/7.x/avataaars/svg?seed=Felix" className="w-12 h-12 rounded-full bg-white shadow-sm border-2 border-white" />
                    <div>
                        <div className="h-4 w-24 bg-slate-800/10 rounded mb-1.5"></div>
                        <div className="h-3 w-16 bg-slate-800/5 rounded"></div>
                    </div>
                </div>
                <div className="h-48 w-full bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl mb-4 flex items-center justify-center text-white/20">
                    <ImageIcon className="w-12 h-12" />
                </div>
                <div className="flex items-center gap-4">
                    <div className="w-8 h-8 rounded-full bg-white/50 flex items-center justify-center text-slate-400"> 
                        <Heart className="w-4 h-4" />
                    </div>
                    <div className="w-8 h-8 rounded-full bg-white/50 flex items-center justify-center text-slate-400">
                         <MessageCircle className="w-4 h-4" />
                    </div>
                </div>
            </div>
        </div>
      </div>
    </div>
  );
}
