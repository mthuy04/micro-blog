from flask import request, jsonify, current_app
from .. import db
from ..models import User, Post
from . import api_bp
from .auth import token_required
import os
from werkzeug.utils import secure_filename
from uuid import uuid4
from sqlalchemy import func 
from ..models import followers

# Lấy thông tin Profile người khác
@api_bp.get("/users/<string:username>")
@token_required
def get_user_profile(current_user: User, username: str):
    # ... (giữ nguyên đoạn tìm target_user) ...
    # (Logic tìm user cũ của bạn)
    target_user = None
    users = User.query.all()
    for u in users:
        if u.email.split('@')[0] == username:
            target_user = u
            break
    
    if not target_user:
        return jsonify({"error": "User not found"}), 404

    is_following = current_user.is_following(target_user)
    
    return jsonify({
        "id": target_user.id,
        "full_name": target_user.name,
        "username": username,
        "bio": target_user.bio,
        "avatar_url": target_user.avatar,
        "location": "Hanoi, VN", 
        "followers_count": target_user.followers.count(),
        "following_count": target_user.following.count(),
        "is_following": is_following,
        
        # === THÊM DÒNG NÀY ===
        "joined_date": target_user.created_at.strftime("Joined %B %Y") 
        # =====================
    })

# Lấy bài viết của 1 user cụ thể
from flask import request, jsonify
from ..models import User, Post, Like, Comment
from . import api_bp

@api_bp.get("/users/<string:username>/posts")
def get_user_posts(username: str):
    # 1. Tìm user chủ profile
    target_user = None
    all_users = User.query.all() # Lấy all rồi lọc python để support logic username = email split
    for u in all_users:
        if u.email.split('@')[0] == username:
            target_user = u
            break
            
    if not target_user:
        return jsonify([]), 404

    tab = request.args.get("tab", "posts")
    result = []

    # --- LOGIC TAB REPLIES (Lấy comment + Bài gốc) ---
    if tab == "replies":
        comments = Comment.query.filter_by(user_id=target_user.id).order_by(Comment.created_at.desc()).all()
        for c in comments:
            original_post = Post.query.get(c.post_id)
            
            # Xử lý dữ liệu an toàn (phòng trường hợp bài gốc bị xóa)
            reply_to_username = "unknown"
            reply_to_author = "Unknown User"
            reply_to_content = "Content unavailable"
            
            if original_post:
                reply_to_content = original_post.content
                if original_post.user:
                    reply_to_author = original_post.user.name
                    reply_to_username = original_post.user.email.split('@')[0]

            result.append({
                "id": c.post_id,
                "content": c.body,
                "image_url": None,
                "created_at_human": c.created_at.strftime("%b %d"),
                "author_name": target_user.name,
                "author_username": username,
                "author_avatar": target_user.avatar,
                
                # Dữ liệu quan trọng cho giao diện Reply
                "is_reply": True,
                "reply_to_author": reply_to_author,
                "reply_to_username": reply_to_username,
                "reply_to_content": reply_to_content
            })
        return jsonify(result)

    # --- LOGIC CÁC TAB KHÁC (Posts, Media, Likes) ---
    query = Post.query

    if tab == "likes":
        # Lấy TẤT CẢ bài viết mà user này đã like (bất kể bài của ai)
        query = query.join(Like).filter(Like.user_id == target_user.id)
    elif tab == "media":
        # Lấy bài của user có ảnh
        query = query.filter_by(user_id=target_user.id).filter(Post.image != None)
    else:
        # Mặc định: Posts (bài của chính user)
        query = query.filter_by(user_id=target_user.id)

    posts = query.order_by(Post.created_at.desc()).all()
    
    for p in posts:
        # Lấy username tác giả bài viết an toàn
        p_username = "unknown"
        if p.user:
            p_username = p.user.email.split('@')[0]

        result.append({
            "id": p.id,
            "content": p.content,
            "image_url": p.image,
            "created_at_human": p.created_at.strftime("%b %d"),
            "likes_count": len(p.likes),
            "comments_count": len(p.comments),
            "author_name": p.user.name if p.user else "Unknown",
            "author_username": p_username,
            "author_avatar": p.user.avatar if p.user else None,
            "is_reply": False
        })
    
    return jsonify(result)

# Cập nhật Profile
@api_bp.put("/users/profile")
@token_required
def update_profile(current_user: User):
    data = request.get_json()
    current_user.name = data.get("full_name", current_user.name)
    current_user.bio = data.get("bio", current_user.bio)
    # Thêm các trường khác nếu DB có
    db.session.commit()
    return jsonify({"message": "Updated"})

# Upload Avatar
@api_bp.post("/users/avatar")
@token_required
def upload_avatar(current_user: User):
    if 'avatar' not in request.files:
        return jsonify({"error": "No file"}), 400
    
    file = request.files['avatar']
    if file.filename == '':
        return jsonify({"error": "No selected file"}), 400

    filename = secure_filename(file.filename)
    ext = filename.rsplit('.', 1)[1].lower()
    new_name = f"avatar_{current_user.id}_{uuid4().hex[:8]}.{ext}"
    
    save_path = os.path.join(current_app.root_path, "static", "avatars")
    os.makedirs(save_path, exist_ok=True)
    file.save(os.path.join(save_path, new_name))
    
    url = f"/static/avatars/{new_name}"
    current_user.avatar = url
    db.session.commit()
    
    return jsonify({"url": url})

@api_bp.get("/users/suggestions")
@token_required
def get_suggestions(current_user: User):
    subquery = db.session.query(followers.c.followed_id).filter(followers.c.follower_id == current_user.id)
    
    suggestions = User.query.filter(
        User.id != current_user.id,
        ~User.id.in_(subquery)
    ).order_by(func.random()).limit(3).all()

    return jsonify([
        {
            "id": u.id,
            "name": u.name,
            
            # === SỬA DÒNG NÀY ===
            # Xóa "u.username or"
            "username": u.email.split('@')[0],
            # ====================
            
            "avatar": u.avatar
        }
        for u in suggestions
    ])