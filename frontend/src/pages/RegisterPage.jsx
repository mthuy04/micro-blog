// frontend/src/pages/RegisterPage.jsx
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { register } from "../api/auth";
import { setToken, setCurrentUser } from "../api/client";
import { Zap, User, Mail, Lock, Loader, Check, AlertCircle } from "lucide-react";

export default function RegisterPage() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  async function handleSubmit(e) {
    e.preventDefault();
    
    // Client-side validation
    if (form.password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }
    if (form.password.length < 8) {
      setError("Password must be at least 8 characters");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const data = await register(form);
      setToken(data.token);
      setCurrentUser(data.user);
      // Hiệu ứng thành công giả lập để giống HTML
      setTimeout(() => navigate("/home"), 1000); 
    } catch (err) {
      console.error(err);
      const msg = err?.response?.data?.message || err?.response?.data?.error || "Sign up failed.";
      setError(msg);
      setLoading(false);
    }
  }

  return (
    <div className="bg-slate-50 min-h-screen flex flex-col items-center justify-center p-6 text-slate-900 font-sans">
      {/* Header */}
      <div className="text-center mb-8">
        <div className="flex items-center justify-center gap-2 mb-3">
          <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-indigo-200">
            <Zap className="w-6 h-6" />
          </div>
          <span className="text-2xl font-bold tracking-tight text-slate-900">GROUP 3</span>
        </div>
        <p className="text-slate-500 font-medium">Join the conversation today.</p>
      </div>

      {/* Main Card */}
      <div className="w-full max-w-md bg-white rounded-3xl shadow-xl shadow-slate-200/60 border border-slate-100 overflow-hidden">
        <div className="p-8 md:p-10">
          <h1 className="text-2xl font-bold text-slate-900 mb-6 text-center">Create your account</h1>

          <form className="space-y-5" onSubmit={handleSubmit}>
            
            {/* Full Name */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Full Name</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <User className="w-5 h-5" />
                </div>
                <input
                  type="text"
                  name="name"
                  required
                  value={form.name}
                  onChange={handleChange}
                  className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 outline-none transition-all placeholder-slate-400 text-sm"
                  placeholder="e.g. Alex Rivera"
                />
              </div>
            </div>

            {/* Email */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Email Address</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <Mail className="w-5 h-5" />
                </div>
                <input
                  type="email"
                  name="email"
                  required
                  value={form.email}
                  onChange={handleChange}
                  className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 outline-none transition-all placeholder-slate-400 text-sm"
                  placeholder="name@example.com"
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
                  name="password"
                  required
                  value={form.password}
                  onChange={handleChange}
                  className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 outline-none transition-all placeholder-slate-400 text-sm"
                  placeholder="Create a password"
                />
              </div>
              <ul className="mt-2 space-y-1">
                <li className="text-xs text-slate-500 flex items-center gap-1.5">
                  <div className={`w-1.5 h-1.5 rounded-full ${form.password.length >= 8 ? 'bg-green-500' : 'bg-slate-300'}`}></div>
                  <span className={form.password.length >= 8 ? 'text-green-600' : 'text-slate-500'}>Must be at least 8 characters</span>
                </li>
              </ul>
            </div>

            {/* Confirm Password */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Confirm Password</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <Lock className="w-5 h-5" />
                </div>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className={`w-full pl-10 pr-4 py-3 rounded-xl border outline-none transition-all placeholder-slate-400 text-sm ${
                    error === "Passwords do not match" 
                    ? "border-red-500 focus:border-red-500 focus:ring-4 focus:ring-red-500/10" 
                    : "border-slate-200 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10"
                  }`}
                  placeholder="Repeat password"
                />
              </div>
              {error && (
                <p className="mt-1.5 text-xs text-red-500 flex items-center gap-1">
                  <AlertCircle className="w-3 h-3" /> {error}
                </p>
              )}
            </div>

            {/* Submit Button */}
            <div className="pt-2">
              <button
                type="submit"
                disabled={loading}
                className={`w-full font-semibold py-3.5 rounded-xl transition-all shadow-lg transform active:scale-[0.98] flex items-center justify-center gap-2 ${
                    loading ? "bg-indigo-500 cursor-not-allowed" : "bg-indigo-600 hover:bg-indigo-700 shadow-indigo-200"
                } text-white`}
              >
                {loading ? (
                    <>
                        <Loader className="w-5 h-5 animate-spin" /> Creating Account...
                    </>
                ) : (
                    "Sign Up"
                )}
              </button>
            </div>
          </form>
        </div>

        {/* Footer Link */}
        <div className="bg-slate-50 px-8 py-6 border-t border-slate-100 text-center">
          <p className="text-sm text-slate-600">
            Already have an account?{" "}
            <Link to="/login" className="text-indigo-600 font-semibold hover:text-indigo-700 transition-colors hover:underline">
              Log in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
