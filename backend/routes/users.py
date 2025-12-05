from flask import request, jsonify, current_app
from .. import db
from ..models import User, Post, Like, Comment, followers
from . import api_bp
from .auth import token_required
import os
from werkzeug.utils import secure_filename
from uuid import uuid4
from sqlalchemy import func 
import cloudinary.uploader # <--- THÊM DÒNG NÀY

# Lấy thông tin Profile người khác
@api_bp.get("/users/<string:username>")
@token_required
def get_user_profile(current_user: User, username: str):
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
        "joined_date": target_user.created_at.strftime("Joined %B %Y") 
    })

# Lấy bài viết của 1 user cụ thể
@api_bp.get("/users/<string:username>/posts")
def get_user_posts(username: str):
    target_user = None
    all_users = User.query.all() 
    for u in all_users:
        if u.email.split('@')[0] == username:
            target_user = u
            break
            
    if not target_user:
        return jsonify([]), 404

    tab = request.args.get("tab", "posts")
    result = []

    if tab == "replies":
        comments = Comment.query.filter_by(user_id=target_user.id).order_by(Comment.created_at.desc()).all()
        for c in comments:
            original_post = Post.query.get(c.post_id)
            reply_to_username = "unknown"
            reply_to_author = "Unknown User"
            reply_to_content = "Content unavailable"
            
            if original_post:
                reply_to_content = original_post.content
                if original_post.user:
                    reply_to_author = original_post.user.name
                    reply_to_username = original_post.user.email.split('@')[0]

            result.append({
                "id": c.id,          # <--- QUAN TRỌNG: Trả về ID của Comment
                "post_id": c.post_id, # <--- Giữ ID bài gốc để navigate
                "type": "comment",    # <--- Đánh dấu đây là comment
                "content": c.body,
                "image_url": None,
                "created_at_human": c.created_at.strftime("%b %d"),
                "author_name": target_user.name,
                "author_username": username,
                "author_avatar": target_user.avatar,
                "is_reply": True,
                "reply_to_author": reply_to_author,
                "reply_to_username": reply_to_username,
                "reply_to_content": reply_to_content
            })
        return jsonify(result)

    query = Post.query

    if tab == "likes":
        query = query.join(Like).filter(Like.user_id == target_user.id)
    elif tab == "media":
        query = query.filter_by(user_id=target_user.id).filter(Post.image != None)
    else:
        query = query.filter_by(user_id=target_user.id)

    posts = query.order_by(Post.created_at.desc()).all()
    
    for p in posts:
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
    db.session.commit()
    return jsonify({"message": "Updated"})

# ========================================================
# HÀM UPLOAD AVATAR - ĐÃ SỬA DÙNG CLOUDINARY
# ========================================================
@api_bp.post("/users/avatar")
@token_required
def upload_avatar(current_user: User):
    if 'avatar' not in request.files:
        return jsonify({"error": "No file"}), 400
    
    file = request.files['avatar']
    if file.filename == '':
        return jsonify({"error": "No selected file"}), 400

    # Kiểm tra file hợp lệ (dùng hàm từ module khác hoặc viết lại đơn giản)
    if not ('.' in file.filename and file.filename.rsplit('.', 1)[1].lower() in {'png', 'jpg', 'jpeg', 'gif'}):
        return jsonify({"error": "File type not allowed"}), 400

    try:
        # --- CODE MỚI: Upload lên Cloudinary ---
        upload_result = cloudinary.uploader.upload(file)
        url = upload_result.get("secure_url")
        
        # --- Cập nhật Database ---
        current_user.avatar = url
        db.session.commit()
        
        return jsonify({"url": url})
        
    except Exception as e:
        print(f"Cloudinary Avatar Error: {e}")
        return jsonify({"error": "Avatar upload failed"}), 500

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
            "username": u.email.split('@')[0],
            "avatar": u.avatar
        }
        for u in suggestions
    ])