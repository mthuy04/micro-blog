import { useEffect, useState } from "react";
import { useSearchParams, Link, useNavigate } from "react-router-dom"; // Thêm useNavigate
import MainLayout from "../components/layout/MainLayout";
import { searchSystem } from "../api/social";
import { getImageUrl } from "../utils/env";
import { Search, User, FileText, MessageCircle, Heart } from "lucide-react";

export default function SearchPage() {
  const [searchParams] = useSearchParams();
  const query = searchParams.get("q");
  const navigate = useNavigate(); // Hook để chuyển trang
  
  const [results, setResults] = useState({ users: [], posts: [] });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!query) return;

    let isMounted = true;
    setLoading(true);
    
    searchSystem(query).then(data => {
      if (isMounted) {
        setResults(data);
        setLoading(false);
      }
    }).catch(() => {
      if (isMounted) setLoading(false);
    });

    return () => { isMounted = false; };
  }, [query]);

  // --- HÀM MỚI: Xử lý hiển thị nội dung Repost ---
  const renderContent = (content) => {
      if (!content) return null;

      let caption = content;
      let repostData = null;

      // 1. Parse Repost Mới
      if (content.includes("|||REPOST::")) {
          const parts = content.split("|||REPOST::");
          caption = parts[0];
          try { repostData = JSON.parse(parts[1]); } catch {}
      } 
      // 2. Parse Repost Cũ
      else if (content.startsWith("REPOST::")) {
          caption = "";
          try { repostData = JSON.parse(content.replace("REPOST::", "")); } catch {}
      }

      return (
          <div className="text-sm text-slate-800 mb-2">
              {caption && <p className="mb-2 line-clamp-2">{caption}</p>}
              
              {repostData && (
                  <div className="mt-1 border border-slate-200 rounded-xl p-3 bg-slate-50 hover:bg-slate-100 transition-colors cursor-pointer"
                       onClick={(e) => {
                           e.preventDefault(); // Chặn Link cha
                           navigate(`/profile/${repostData.original_username}`);
                       }}>
                      <div className="flex items-center gap-2 mb-1">
                          <img src={getImageUrl(repostData.original_avatar)} className="w-4 h-4 rounded-full" alt="orig" />
                          <span className="font-bold text-xs text-slate-900">{repostData.original_author}</span>
                      </div>
                      <p className="text-xs text-slate-600 line-clamp-2">{repostData.original_content}</p>
                  </div>
              )}
          </div>
      );
  };
  // ---------------------------------------------

  return (
    <MainLayout>
      <main className="w-full lg:w-[600px] border-r border-slate-200/60 min-h-screen pb-20">
        <div className="sticky top-0 bg-white/80 backdrop-blur-md z-10 border-b border-slate-100 px-6 py-4">
            <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                <Search className="w-6 h-6" />
                Results for "{query}"
            </h2>
        </div>

        {loading ? (
            <div className="p-10 text-center text-slate-500">Searching...</div>
        ) : (
            <div className="p-4 space-y-6">
                
                {results.users.length > 0 && (
                    <section>
                        <h3 className="font-bold text-lg mb-3 flex items-center gap-2"><User className="w-5 h-5"/> People</h3>
                        <div className="bg-slate-50 rounded-2xl border border-slate-200 overflow-hidden">
                            {results.users.map(u => (
                                <div key={u.id} className="p-4 flex items-center gap-3 border-b border-slate-100 last:border-0 hover:bg-white transition-colors">
                                    <img src={getImageUrl(u.avatar) || `https://api.dicebear.com/7.x/avataaars/svg?seed=${u.username}`} className="w-10 h-10 rounded-full bg-white" alt="avatar" />
                                    <div>
                                        <Link to={`/profile/${u.username}`} className="font-bold text-sm text-slate-900 hover:underline">{u.name}</Link>
                                        <p className="text-xs text-slate-500">@{u.username}</p>
                                    </div>
                                    <Link to={`/profile/${u.username}`} className="ml-auto px-3 py-1 bg-white border border-slate-300 rounded-full text-xs font-bold hover:bg-slate-50">View</Link>
                                </div>
                            ))}
                        </div>
                    </section>
                )}

                {results.posts.length > 0 && (
                    <section>
                        <h3 className="font-bold text-lg mb-3 flex items-center gap-2"><FileText className="w-5 h-5"/> Posts</h3>
                        <div className="space-y-4">
                            {results.posts.map(p => (
                                <Link key={p.id} to={`/post/${p.id}`} className="block bg-white p-4 rounded-2xl border border-slate-200 hover:shadow-md transition-shadow group">
                                    <div className="flex items-center gap-2 mb-2">
                                        <img src={getImageUrl(p.author_avatar) || `https://api.dicebear.com/7.x/avataaars/svg?seed=${p.author_username}`} className="w-6 h-6 rounded-full" alt="author" />
                                        <span className="font-bold text-sm text-slate-900 group-hover:text-indigo-600 transition-colors">{p.author_name}</span>
                                        <span className="text-xs text-slate-500">@{p.author_username} · {p.created_at_human}</span>
                                    </div>
                                    
                                    {/* SỬ DỤNG HÀM RENDER CONTENT THAY VÌ IN TRỰC TIẾP */}
                                    {renderContent(p.content)}
                                    {/* ------------------------------------------------ */}

                                    {p.image_url && (
                                        <div className="h-32 rounded-xl overflow-hidden border border-slate-100 mb-2">
                                             <img src={getImageUrl(p.image_url)} className="w-full h-full object-cover" alt="post content"/>
                                        </div>
                                    )}
                                    <div className="flex gap-4 text-xs text-slate-400">
                                        <span className="flex gap-1 items-center"><Heart className="w-3 h-3"/> {p.likes_count}</span>
                                        <span className="flex gap-1 items-center"><MessageCircle className="w-3 h-3"/> {p.comments_count}</span>
                                    </div>
                                </Link>
                            ))}
                        </div>
                    </section>
                )}

                {results.users.length === 0 && results.posts.length === 0 && (
                    <div className="text-center text-slate-500 py-10">No results found for "{query}"</div>
                )}
            </div>
        )}
      </main>
    </MainLayout>
  );
}