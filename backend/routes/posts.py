import os
# from uuid import uuid4  <-- Không cần dùng uuid nữa vì Cloudinary tự đặt tên
from flask import request, jsonify, current_app
from werkzeug.utils import secure_filename
from .. import db
from ..models import Post, User
from . import api_bp
from .auth import token_required
from ..models import followers, Like, Post, Notification, Comment # Import đầy đủ model
import cloudinary.uploader # <-- Quan trọng

def allowed_file(filename):
    return '.' in filename and \
           filename.rsplit('.', 1)[1].lower() in {'png', 'jpg', 'jpeg', 'gif'}

# ==========================================
# 1. SỬA HÀM TẠO BÀI VIẾT (QUAN TRỌNG NHẤT)
# ==========================================
@api_bp.post("/posts")
@token_required
def create_post(current_user: User):
    content = request.form.get("content", "").strip()
    # Nếu không có nội dung và cũng không có ảnh thì báo lỗi
    if not content and 'image' not in request.files:
        return jsonify({"error": "Content or image required"}), 400

    image_url = None
    
    # Kiểm tra xem có file ảnh được gửi lên không
    if 'image' in request.files:
        file = request.files['image']
        if file and file.filename != '':
            if allowed_file(file.filename):
                try:
                    # --- CODE CŨ (Đã Xóa) ---
                    # filename = secure_filename(file.filename)
                    # ... os.path.join ... file.save ...
                    
                    # --- CODE MỚI (Cloudinary) ---
                    # Upload trực tiếp file lên Cloudinary
                    upload_result = cloudinary.uploader.upload(file)
                    # Lấy đường dẫn ảnh online (https://...)
                    image_url = upload_result.get("secure_url")
                except Exception as e:
                    return jsonify({"error": f"Image upload failed: {str(e)}"}), 500
            else:
                return jsonify({"error": "File type not allowed"}), 400

    # Lưu vào Database (image_url bây giờ là link Cloudinary)
    post = Post(content=content, image=image_url, user=current_user)
    db.session.add(post)
    db.session.commit()

    return jsonify({
        "message": "Post created", 
        "id": post.id, 
        "image_url": image_url 
    }), 201

# ==========================================
# CÁC HÀM DƯỚI GIỮ NGUYÊN
# ==========================================

@api_bp.get("/posts/feed")
@token_required
def get_feed(current_user: User):
    page = int(request.args.get("page", 1))
    feed_type = request.args.get("type", "for_you")
    per_page = 20

    if feed_type == "following":
        pagination = (
            Post.query
            .join(followers, (followers.c.followed_id == Post.user_id))
            .filter(followers.c.follower_id == current_user.id)
            .order_by(Post.created_at.desc())
            .paginate(page=page, per_page=per_page, error_out=False)
        )
    else:
        pagination = Post.query.order_by(Post.created_at.desc()).paginate(
            page=page, per_page=per_page, error_out=False
        )

    def serialize_post(p: Post):
        return {
            "id": p.id,
            "content": p.content,
            "image_url": p.image, # Link này giờ là link Cloudinary
            "created_at": p.created_at.isoformat(),
            "author_name": p.user.name,
            "author_username": p.user.email.split('@')[0], 
            "author_avatar": p.user.avatar,
            "likes_count": len(p.likes),
            "comments_count": len(p.comments),
            "liked_by_me": any(l.user_id == current_user.id for l in p.likes)
        }

    return jsonify(
        {"posts": [serialize_post(p) for p in pagination.items], "has_next": pagination.has_next}
    )

@api_bp.post("/posts/<int:post_id>/likes")
@token_required
def toggle_like(current_user, post_id: int):
    post = Post.query.get_or_404(post_id)
    existing = Like.query.filter_by(user_id=current_user.id, post_id=post.id).first()
    
    if existing:
        db.session.delete(existing)
        msg = "Unliked"
    else:
        like = Like(user=current_user, post=post)
        db.session.add(like)
        
        if post.user_id != current_user.id:
            existing_notif = Notification.query.filter_by(
                user_id=post.user_id,
                actor_id=current_user.id,
                action="like",
                post_id=post.id
            ).first()
            
            if not existing_notif:
                notif = Notification(
                    user_id=post.user_id, 
                    actor_id=current_user.id, 
                    action="like", 
                    post_id=post.id
                )
                db.session.add(notif)

        msg = "Liked"

    db.session.commit()
    return jsonify({"message": msg})

@api_bp.get("/posts/<int:post_id>")
@token_required
def get_post_detail(current_user: User, post_id: int):
    post = Post.query.get_or_404(post_id)
    
    comments_data = []
    sorted_comments = sorted(post.comments, key=lambda x: x.created_at, reverse=True)
    
    for c in sorted_comments:
        comments_data.append({
            "id": c.id,
            "body": c.body,
            "created_at_human": c.created_at.strftime("%b %d, %H:%M"),
            "author_name": c.user.name,
            "author_username": c.user.email.split('@')[0],
            "author_avatar": c.user.avatar
        })

    return jsonify({
        "id": post.id,
        "content": post.content,
        "image_url": post.image,
        "created_at_human": post.created_at.strftime("%b %d, %Y at %H:%M"),
        "author_name": post.user.name,
        "author_username": post.user.email.split('@')[0],
        "author_avatar": post.user.avatar,
        "likes_count": len(post.likes),
        "comments_count": len(post.comments),
        "liked_by_me": any(l.user_id == current_user.id for l in post.likes),
        "comments": comments_data
    })

@api_bp.post("/posts/<int:post_id>/comments")
@token_required
def create_comment(current_user: User, post_id: int):
    data = request.get_json() or {}
    body = data.get("body", "").strip()
    
    if not body:
        return jsonify({"error": "Comment empty"}), 400

    post = Post.query.get_or_404(post_id)
    
    comment = Comment(body=body, user=current_user, post=post)
    db.session.add(comment)
    
    if post.user_id != current_user.id:
        notif = Notification(
            user_id=post.user_id, 
            actor_id=current_user.id, 
            action="comment", 
            post_id=post.id
        )
        db.session.add(notif)
        
    db.session.commit()
    
    return jsonify({"message": "Commented", "id": comment.id}), 201

@api_bp.put("/posts/<int:post_id>")
@token_required
def update_post(current_user: User, post_id: int):
    post = Post.query.get_or_404(post_id)
    
    if post.user_id != current_user.id:
        return jsonify({"error": "Forbidden"}), 403

    data = request.get_json() or {}
    new_content = data.get("content", "").strip()
    
    if not new_content:
        return jsonify({"error": "Content required"}), 400

    post.content = new_content
    db.session.commit()
    
    return jsonify({"message": "Post updated", "content": new_content})

@api_bp.delete("/posts/<int:post_id>")
@token_required
def delete_post_api(current_user: User, post_id: int):
    post = Post.query.get_or_404(post_id)
    
    if post.user_id != current_user.id and not current_user.is_admin:
        return jsonify({"error": "Forbidden"}), 403

    # Lưu ý: Việc xóa ảnh trên Cloudinary cần thêm logic destroy nếu muốn, 
    # nhưng không bắt buộc để code chạy.
    
    db.session.delete(post)
    db.session.commit()
    
    return jsonify({"message": "Post updated"})