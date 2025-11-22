// frontend/src/pages/LandingPage.jsx
import { Link } from "react-router-dom";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 overflow-x-hidden">
      {/* Nav */}
      <nav className="w-full py-6 px-6 md:px-12 flex justify-between items-center max-w-7xl mx-auto">
        <div className="flex items-center gap-2">
          <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-indigo-200">
            ⚡
          </div>
          <span className="text-xl font-bold tracking-tight text-slate-900">
            GROUP 3
          </span>
        </div>

        <div className="hidden md:flex items-center gap-6 text-sm font-medium text-slate-600">
          <Link to="/" className="hover:text-indigo-600">
            Home
          </Link>
          <a href="#about" className="hover:text-indigo-600">
            About
          </a>
          <Link
            to="/login"
            className="px-4 py-2 rounded-full border border-slate-200 hover:border-indigo-500 hover:text-indigo-600"
          >
            Log in
          </Link>
          <Link
            to="/register"
            className="px-4 py-2 rounded-full bg-slate-900 text-white hover:bg-indigo-600"
          >
            Sign up
          </Link>
        </div>
      </nav>

      {/* Hero */}
      <main className="max-w-7xl mx-auto px-6 md:px-12 py-8 md:py-16 grid md:grid-cols-2 gap-10 items-center">
        <section>
          <p className="text-sm font-medium text-emerald-600 mb-3">
            LIVE BETA NOW OPEN
          </p>
          <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight mb-4">
            Share your world,{" "}
            <span className="text-indigo-600">one thought</span> at a time.
          </h1>
          <p className="text-slate-600 text-sm md:text-base mb-6 max-w-lg">
            The mini social network for big ideas. Post short updates, follow
            interesting people, and curate your personal corner of the internet
            without the noise.
          </p>

          <div className="flex flex-wrap gap-3 mb-4">
            <Link
              to="/register"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-slate-900 text-white text-sm font-semibold hover:bg-indigo-600"
            >
              Get Started Free
              <span>→</span>
            </Link>
            <Link
              to="/login"
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-full bg-white border border-slate-200 text-sm font-semibold hover:border-indigo-500 hover:text-indigo-600"
            >
              Log in
            </Link>
          </div>

          <p className="text-xs text-slate-500">+2k joined recently</p>
        </section>

        {/* Card demo đơn giản */}
        <section className="hidden md:block">
          <div className="bg-white rounded-3xl shadow-xl p-4 border border-slate-100">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-full bg-slate-200" />
              <div>
                <p className="text-sm font-semibold">Minh Thuy xinhs</p>
                <p className="text-xs text-slate-500">@thuyxinh · 2h</p>
              </div>
            </div>
            <p className="text-sm mb-4">
              Just shipped the new dark mode update! 🌙 It's amazing how much
              better the contrast feels. Can't wait for you all to try it out.
              #coding #webdev #uiux
            </p>
            <div className="flex gap-6 text-xs text-slate-500">
              <span>12 replies</span>
              <span>4 reposts</span>
              <span>128 likes</span>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
