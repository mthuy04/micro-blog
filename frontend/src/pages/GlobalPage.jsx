import { useEffect, useState, useCallback } from "react";
import { Link } from "react-router-dom";
import MainLayout from "../components/layout/MainLayout";
import { getFeed } from "../api/posts"; 
import { getImageUrl } from "../utils/env";
import { Globe, ArrowDownCircle } from "lucide-react";

export default function GlobalPage() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // --- STATE PHÂN TRANG ---
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);

  // Hàm load dữ liệu (tương tự HomePage)
  const loadGallery = useCallback(async (pageNum, isAppend = false) => {
    try {
        if (isAppend) setIsLoadingMore(true);
        else setLoading(true);

        // Gọi API lấy feed (mặc định lấy For You để xem tất cả)
        const data = await getFeed("for_you", pageNum);
        
        // LỌC: Chỉ lấy bài có ảnh & không phải Repost
        const validImages = data.posts.filter(p => 
            p.image_url && !p.content.startsWith("REPOST::")
        );

        if (isAppend) {
            setPosts(prev => [...prev, ...validImages]);
        } else {
            setPosts(validImages);
        }
        
        setHasMore(data.has_next);

    } catch (e) {
        console.error(e);
    } finally {
        setLoading(false);
        setIsLoadingMore(false);
    }
  }, []);

  // Chạy lần đầu
  useEffect(() => {
    loadGallery(1, false);
  }, [loadGallery]);

  // Xử lý nút Load More
  const handleLoadMore = () => {
      const nextPage = page + 1;
      setPage(nextPage);
      loadGallery(nextPage, true);
  };

  return (
    <MainLayout>
      <div className="flex justify-center max-w-6xl mx-auto gap-10">
        
        {/* CỘT TRÁI: DANH SÁCH ẢNH */}
        <main className="flex-1 max-w-[600px] border-r border-slate-200/60 min-h-screen pb-20">
            <div className="sticky top-0 bg-white/80 backdrop-blur-md z-10 border-b border-slate-100 px-6 py-4 flex items-center gap-3">
                <Globe className="w-6 h-6 text-indigo-600" />
                <h2 className="text-xl font-bold text-slate-900">Explore Global</h2>
            </div>

            <div className="p-4 grid grid-cols-2 gap-4">
                {loading ? (
                    <div className="col-span-2 text-center p-10 text-slate-500">Loading gallery...</div>
                ) : (
                    posts.map(post => (
                        <Link 
                            key={post.id} 
                            to={`/post/${post.id}`} 
                            className="relative group overflow-hidden rounded-2xl bg-slate-100 aspect-square block border border-slate-100 shadow-sm hover:shadow-md transition-all"
                        >
                            <img 
                                src={getImageUrl(post.image_url)} 
                                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" 
                                alt="global content" 
                            />
                            
                            {/* Overlay hiệu ứng khi hover */}
                            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-colors flex items-end p-4">
                                <div className="flex items-center gap-2 text-white opacity-0 group-hover:opacity-100 transition-opacity translate-y-2 group-hover:translate-y-0 duration-300">
                                    <img src={getImageUrl(post.author_avatar)} className="w-6 h-6 rounded-full border border-white object-cover" alt="avi" />
                                    <span className="text-xs font-bold truncate max-w-[100px]">{post.author_name}</span>
                                </div>
                            </div>
                        </Link>
                    ))
                )}
                
                {!loading && posts.length === 0 && (
                    <div className="col-span-2 text-center text-slate-500 py-10">
                        No photos found.
                    </div>
                )}
            </div>

            {/* --- NÚT LOAD MORE --- */}
            {hasMore && (
                <div className="p-6 flex justify-center pb-10">
                    <button 
                        onClick={handleLoadMore} 
                        disabled={isLoadingMore}
                        className="flex items-center gap-2 px-6 py-2.5 bg-white border border-slate-200 rounded-full font-bold text-sm text-indigo-600 hover:bg-indigo-50 transition-all shadow-sm"
                    >
                        {isLoadingMore ? "Loading..." : (
                            <>
                                <ArrowDownCircle className="w-4 h-4" /> Load more photos
                            </>
                        )}
                    </button>
                </div>
            )}
            
            {!hasMore && posts.length > 0 && (
                <div className="p-8 text-center text-slate-400 text-sm">
                    End of gallery
                </div>
            )}

        </main>
        
        {/* CỘT PHẢI: TRENDING */}
        <aside className="hidden xl:block w-[350px] pt-6 sticky top-0 h-screen overflow-y-auto pb-8">
            <div className="bg-slate-100/50 rounded-2xl p-6 border border-slate-100">
                <h3 className="font-bold text-lg mb-4 text-slate-900">Trending Topics</h3>
                <div className="flex flex-wrap gap-2">
                    {['#Photography', '#Travel', '#Food', '#Tech', '#Art', '#VNUIS', '#StudentLife'].map(tag => (
                        <span key={tag} className="bg-white px-3 py-1.5 rounded-full text-sm font-medium text-slate-600 border border-slate-200 cursor-pointer hover:border-indigo-300 hover:text-indigo-600 transition-all shadow-sm">
                            {tag}
                        </span>
                    ))}
                </div>
            </div>
        </aside>

      </div>
    </MainLayout>
  );
}