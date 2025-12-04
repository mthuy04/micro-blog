// frontend/src/pages/LandingPage.jsx
import { Link } from "react-router-dom";
import { 
  Zap, Menu, ArrowRight, LogIn, ChevronRight, 
  MoreHorizontal, MessageCircle, Repeat, Heart, Share, Image 
} from "lucide-react";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 overflow-x-hidden font-sans">
      {/* Navigation */}
      <nav className="w-full py-6 px-6 md:px-12 flex justify-between items-center max-w-7xl mx-auto relative z-20">
        <div className="flex items-center gap-2">
          <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-indigo-200">
            <Zap className="w-6 h-6" />
          </div>
          <span className="text-xl font-bold tracking-tight text-slate-900">
            CAMPUSTALK
          </span>
        </div>

        {/* Desktop Menu */}
        <div className="hidden md:flex items-center gap-8 font-medium text-slate-600">
          <Link to="/" className="hover:text-indigo-600 transition-colors">Home</Link>
          <a href="#" className="hover:text-indigo-600 transition-colors">About</a>
          <div className="w-px h-6 bg-slate-200 mx-2"></div>
          <Link to="/login" className="hover:text-indigo-600 transition-colors">Log in</Link>
          <Link 
            to="/register" 
            className="bg-slate-900 text-white px-5 py-2.5 rounded-full hover:bg-slate-800 transition-all shadow-md hover:shadow-lg text-sm"
          >
            Sign up
          </Link>
        </div>

        {/* Mobile Menu Button */}
        <button className="md:hidden text-slate-600 hover:text-indigo-600">
          <Menu className="w-8 h-8" />
        </button>
      </nav>

      {/* Hero Section */}
      <main className="max-w-7xl mx-auto px-6 md:px-12 py-12 lg:py-20 relative">
        {/* Background Decor */}
        <div className="absolute top-0 right-0 -z-10 w-[800px] h-[800px] bg-indigo-100/50 rounded-full blur-3xl opacity-60 translate-x-1/3 -translate-y-1/4 pointer-events-none"></div>
        <div className="absolute bottom-0 left-0 -z-10 w-[600px] h-[600px] bg-blue-100/50 rounded-full blur-3xl opacity-60 -translate-x-1/3 translate-y-1/4 pointer-events-none"></div>

        <div className="grid lg:grid-cols-2 gap-16 items-center">
          {/* Left Content */}
          <div className="flex flex-col gap-8 max-w-2xl z-10">
            <div className="inline-flex items-center gap-2 bg-white border border-slate-200 rounded-full px-4 py-1.5 w-fit shadow-sm">
              <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
              <span className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                Live Beta Now Open
              </span>
            </div>

            <h1 className="text-5xl md:text-6xl lg:text-7xl font-extrabold tracking-tight leading-[1.1] text-slate-900">
              Share your world, <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-blue-500">
                one thought
              </span>{" "}
              at a time.
            </h1>

            <p className="text-lg md:text-xl text-slate-600 leading-relaxed max-w-lg">
              The mini social network for big ideas. Post short updates, follow
              interesting people, and curate your personal corner of the
              internet without the noise.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 mt-2">
              <Link
                to="/register"
                className="bg-indigo-600 text-white px-8 py-4 rounded-2xl font-semibold text-lg shadow-xl shadow-indigo-200 hover:shadow-2xl hover:bg-indigo-700 transition-all transform hover:-translate-y-0.5 flex items-center justify-center gap-2"
              >
                Get Started Free
                <ArrowRight className="w-5 h-5" />
              </Link>
              <Link
                to="/login"
                className="bg-white text-slate-700 border border-slate-200 px-8 py-4 rounded-2xl font-semibold text-lg shadow-sm hover:bg-slate-50 hover:border-slate-300 transition-all flex items-center justify-center gap-2"
              >
                <LogIn className="w-5 h-5" />
                Log in
              </Link>
            </div>

            <div className="flex items-center gap-4 mt-8 text-sm text-slate-500">
              <div className="flex -space-x-2">
                <img src="https://api.dicebear.com/7.x/avataaars/svg?seed=Felix" alt="User" className="w-8 h-8 rounded-full border-2 border-white bg-indigo-100" />
                <img src="https://api.dicebear.com/7.x/avataaars/svg?seed=Aneka" alt="User" className="w-8 h-8 rounded-full border-2 border-white bg-pink-100" />
                <img src="https://api.dicebear.com/7.x/avataaars/svg?seed=John" alt="User" className="w-8 h-8 rounded-full border-2 border-white bg-blue-100" />
                <div className="w-8 h-8 rounded-full border-2 border-white bg-slate-100 flex items-center justify-center text-xs font-bold text-slate-600">
                  +2k
                </div>
              </div>
              <p>Joined recently</p>
            </div>
          </div>

          {/* Right Visual: Mock Newsfeed */}
          <div className="relative perspective-1000 hidden md:block h-[600px]">
             {/* ... (Phần mock UI giữ nguyên cấu trúc HTML nhưng thay class thành className) ... */}
             {/* Tôi rút gọn phần visual trang trí để code không quá dài, nhưng vẫn giữ bố cục chính */}
             <div className="relative w-full max-w-md mx-auto md:ml-auto transform rotate-y-[-5deg] rotate-x-[5deg] hover:rotate-0 transition-transform duration-700 ease-out">
                {/* Mock Post Card */}
                <div className="absolute top-12 left-0 right-0 bg-white p-6 rounded-3xl shadow-2xl shadow-slate-200 border border-slate-100 z-20">
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex gap-3">
                      <img src="https://api.dicebear.com/7.x/avataaars/svg?seed=Sara" alt="Avatar" className="w-12 h-12 rounded-full bg-indigo-50 p-0.5" />
                      <div>
                        <h3 className="font-bold text-slate-900">Minh Thuý xinhs</h3>
                        <p className="text-slate-500 text-xs">@thuyxinh • 2h</p>
                      </div>
                    </div>
                    <MoreHorizontal className="w-5 h-5 text-slate-400" />
                  </div>
                  <p className="text-slate-700 leading-relaxed mb-4">
                    Just shipped the new dark mode update! 🌙 It’s amazing how much better the contrast feels.
                  </p>
                  <div className="rounded-2xl overflow-hidden mb-4 border border-slate-100 h-48 bg-slate-100 flex items-center justify-center bg-gradient-to-br from-indigo-500 to-purple-600">
                    <Image className="w-8 h-8 text-white/50" />
                  </div>
                  <div className="flex items-center justify-between pt-2 border-t border-slate-50 text-slate-400">
                     {/* Icons... */}
                     <MessageCircle className="w-4 h-4" />
                     <Repeat className="w-4 h-4" />
                     <Heart className="w-4 h-4 text-pink-500 fill-current" />
                     <Share className="w-4 h-4" />
                  </div>
                </div>
             </div>
          </div>
        </div>
      </main>
    </div>
  );
}
