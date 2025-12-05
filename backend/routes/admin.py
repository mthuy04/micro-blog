from flask import jsonify
from ..models import User, Post
from . import api_bp
from .auth import token_required

@api_bp.get("/admin/overview")
@token_required
def admin_overview(current_user: User):
    # 1. Kiểm tra quyền Admin
    if not current_user.is_admin:
        return jsonify({"error": "Forbidden"}), 403

    # 2. Lấy số liệu thống kê
    users_count = User.query.count()
    posts_count = Post.query.count()
    
    # 3. Lấy danh sách User mới nhất (5 người)
    recent_users_query = User.query.order_by(User.created_at.desc()).limit(5).all()
    recent_users = [
        {
            "id": u.id,
            "full_name": u.name,
            "username": u.email.split('@')[0],
            "email": u.email,
            "role": "Admin" if u.is_admin else "User",
            "joined_human": u.created_at.strftime("%b %d, %Y")
        }
        for u in recent_users_query
    ]

    # 4. Lấy danh sách Post mới nhất (5 bài) - ĐÂY LÀ PHẦN BẠN ĐANG THIẾU
    recent_posts_query = Post.query.order_by(Post.created_at.desc()).limit(5).all()
    recent_posts = [
        {
            "id": p.id,
            "content": p.content[:50] + "..." if len(p.content) > 50 else p.content, # Cắt ngắn nội dung
            "author_name": p.user.name,
            "author_username": p.user.email.split('@')[0],
            "likes_count": len(p.likes),
            "comments_count": len(p.comments),
            "created_at_human": p.created_at.strftime("%b %d, %H:%M")
        }
        for p in recent_posts_query
    ]

    # 5. Trả về đúng cấu trúc mà Frontend AdminDashboard.jsx đang chờ
    return jsonify({
        "stats": {
            "total_users": users_count,
            "total_posts": posts_count,
            "active_now": 1,       # Fake số liệu (hoặc phát triển thêm logic online)
            "pending_reports": 0   # Fake số liệu
        },
        "recent_users": recent_users,
        "recent_posts": recent_posts
    })