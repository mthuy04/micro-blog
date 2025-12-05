# backend/routes/search.py
from flask import request, jsonify
from sqlalchemy import or_
from ..models import User, Post
from . import api_bp

@api_bp.get("/search")
def search():
    query = request.args.get("q", "").strip()
    if not query:
        return jsonify({"users": [], "posts": []})

    users = []
    posts = []

    # LOGIC TÌM KIẾM THÔNG MINH
    if query.startswith("#"):
        # 1. Nếu bắt đầu bằng # -> Chỉ tìm bài viết chứa hashtag đó
        tag = query # Giữ nguyên cả dấu #
        posts = Post.query.filter(Post.content.ilike(f"%{tag}%"))\
                          .order_by(Post.created_at.desc()).limit(30).all()
    
    elif query.startswith("@"):
        # 2. Nếu bắt đầu bằng @ -> Chỉ tìm User theo username/email
        username_query = query[1:] # Bỏ dấu @
        users = User.query.filter(
            or_(
                User.email.ilike(f"%{username_query}%"),
                User.name.ilike(f"%{username_query}%")
            )
        ).limit(10).all()
        
    else:
        # 3. Tìm kiếm hỗn hợp (Mặc định)
        users = User.query.filter(
            or_(
                User.name.ilike(f"%{query}%"),
                User.email.ilike(f"%{query}%")
            )
        ).limit(5).all()

        posts = Post.query.filter(
            Post.content.ilike(f"%{query}%")
        ).order_by(Post.created_at.desc()).limit(20).all()

    # Serialize kết quả
    users_data = [{
        "id": u.id,
        "name": u.name,
        "username": u.email.split('@')[0],
        "avatar": u.avatar
    } for u in users]

    posts_data = [{
        "id": p.id,
        "content": p.content,
        "image_url": p.image,
        "created_at_human": p.created_at.strftime("%b %d"),
        "author_name": p.user.name,
        "author_username": p.user.email.split('@')[0],
        "author_avatar": p.user.avatar,
        "likes_count": len(p.likes),
        "comments_count": len(p.comments)
    } for p in posts]

    return jsonify({"users": users_data, "posts": posts_data})