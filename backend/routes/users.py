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
@api_bp.get("/users/<string:username>/posts")
def get_user_posts(username: str):
    target_user = None
    users = User.query.all()
    for u in users:
        if u.email.split('@')[0] == username:
            target_user = u
            break
            
    if not target_user:
        return jsonify([]), 404

    posts = Post.query.filter_by(user_id=target_user.id).order_by(Post.created_at.desc()).all()
    
    result = []
    for p in posts:
        result.append({
            "id": p.id,
            "content": p.content,
            "image_url": p.image,
            "created_at_human": p.created_at.strftime("%b %d"),
            "likes_count": len(p.likes),
            "comments_count": len(p.comments),
            "author_name": target_user.name,
            "author_username": username,
            "author_avatar": target_user.avatar
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