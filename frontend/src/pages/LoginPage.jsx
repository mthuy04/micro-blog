// frontend/src/pages/LoginPage.jsx
import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { login } from "../api/auth";
import { setToken, setCurrentUser } from "../api/client";

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
      // data: { access_token, user }
      setToken(data.access_token);
      setCurrentUser(data.user);
      navigate("/home");
    } catch (err) {
      console.error(err);
      const msg =
        err?.response?.data?.message ||
        err?.response?.data?.error ||
        "Log in failed. Please check your email/password.";
      setError(msg);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="bg-white min-h-screen w-full flex overflow-hidden font-sans">
      {/* Left side: form */}
      <div className="w-full lg:w-1/2 flex flex-col justify-center p-6 md:p-16 xl:p-24 relative z-10 bg-white">
        {/* Logo */}
        <div className="absolute top-6 left-6 lg:static lg:mb-12 flex items-center gap-2">
          <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center text-white shadow-md">
            <span className="text-lg">⚡</span>
          </div>
          <span className="text-xl font-bold tracking-tight text-slate-900">
            GROUP 3
          </span>
        </div>

        <div className="max-w-sm w-full mx-auto">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-slate-900 mb-2">
              Welcome back
            </h1>
            <p className="text-slate-500">
              Please enter your details to sign in.
            </p>
          </div>

          {/* Error message */}
          {error && (
            <div className="mb-4 rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
              {error}
            </div>
          )}

          {/* Form */}
          <form className="space-y-5" onSubmit={handleSubmit}>
            {/* Email */}
            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium text-slate-700 mb-1.5"
              >
                Email address
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <span className="text-sm">@</span>
                </div>
                <input
                  id="email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-slate-200 bg-slate-50/60 text-sm placeholder-slate-400 focus:bg-white focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 outline-none transition-all"
                  placeholder="Enter your email"
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label
                  htmlFor="password"
                  className="block text-sm font-medium text-slate-700"
                >
                  Password
                </label>
                <button
                  type="button"
                  className="text-xs font-medium text-indigo-600 hover:text-indigo-700"
                >
                  Forgot password?
                </button>
              </div>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <span className="text-sm">•••</span>
                </div>
                <input
                  id="password"
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-slate-200 bg-slate-50/60 text-sm placeholder-slate-400 focus:bg-white focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 outline-none transition-all"
                  placeholder="Enter your password"
                />
              </div>
            </div>

            {/* Remember me */}
            <div className="flex items-center justify-between text-xs text-slate-500">
              <label className="inline-flex items-center gap-2 cursor-pointer select-none">
                <input
                  type="checkbox"
                  className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500/40"
                />
                <span>Remember me</span>
              </label>
            </div>

            {/* Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-indigo-600 text-white text-sm font-semibold py-2.5 shadow-lg shadow-indigo-300/40 hover:bg-indigo-700 disabled:opacity-60 disabled:cursor-not-allowed transition-all"
            >
              {loading ? "Logging in..." : "Log in"}
            </button>
          </form>

          {/* Footer link */}
          <p className="mt-4 text-sm text-slate-500">
            Don&apos;t have an account?{" "}
            <Link
              to="/register"
              className="font-semibold text-indigo-600 hover:text-indigo-700"
            >
              Sign up
            </Link>
          </p>

          {/* Small quote */}
          <div className="mt-10 border-t border-slate-100 pt-4">
            <p className="text-xs text-slate-500">
              “CampusTalk helps our class stay connected without the noise of
              big social networks.”
            </p>
          </div>
        </div>
      </div>

      {/* Right side: pretty preview card */}
      <div className="hidden lg:flex w-1/2 bg-gradient-to-br from-indigo-500 via-violet-500 to-fuchsia-500 items-center justify-center relative overflow-hidden">
        <div className="absolute inset-0 opacity-30 bg-[radial-gradient(circle_at_top,_#ffffff40,_transparent_60%),_radial-gradient(circle_at_bottom,_#00000033,_transparent_60%)]" />

        <div className="relative max-w-md w-full mx-10">
          <div className="bg-white/90 backdrop-blur-xl rounded-3xl p-6 shadow-2xl shadow-indigo-900/40 border border-white/70">
            <div className="flex items-center justify-between mb-4">
              <div>
                <div className="flex items-center gap-2">
                  <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-indigo-500 to-violet-500 flex items-center justify-center text-white text-sm font-semibold">
                    M
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-slate-900">
                      Minh Thuy xinhs
                    </p>
                    <p className="text-xs text-slate-400">@thuyxinh · 2h</p>
                  </div>
                </div>
              </div>
            </div>

            <p className="text-sm text-slate-800 mb-4">
              Just shipped the new dark mode update! 🌙 It&apos;s amazing how
              much better the contrast feels. Can&apos;t wait for you all to try
              it out. #coding #webdev #uiux
            </p>

            <div className="mt-4 flex items-center justify-between text-xs text-slate-500">
              <div className="flex gap-4">
                <span>12 comments</span>
                <span>4 shares</span>
              </div>
              <span className="font-semibold text-rose-500">128 likes</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
