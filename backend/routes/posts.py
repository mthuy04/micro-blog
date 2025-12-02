import os
from uuid import uuid4
from flask import request, jsonify, current_app
from werkzeug.utils import secure_filename
from .. import db
from ..models import Post, User
from . import api_bp
from .auth import token_required
from ..models import followers, Like, Post, Notification

def allowed_file(filename):
    return '.' in filename and \
           filename.rsplit('.', 1)[1].lower() in {'png', 'jpg', 'jpeg', 'gif'}

@api_bp.post("/posts")
@token_required
def create_post(current_user: User):
    content = request.form.get("content", "").strip()
    if not content:
        return jsonify({"error": "Content required"}), 400

    image_url = None
    if 'image' in request.files:
        file = request.files['image']
        if file and file.filename != '' and allowed_file(file.filename):
            filename = secure_filename(file.filename)
            ext = filename.rsplit('.', 1)[1].lower()
            new_filename = f"{uuid4().hex}.{ext}"
            upload_folder = os.path.join(current_app.root_path, "static", "uploads")
            os.makedirs(upload_folder, exist_ok=True)
            file.save(os.path.join(upload_folder, new_filename))
            image_url = f"/static/uploads/{new_filename}"

    post = Post(content=content, image=image_url, user=current_user)
    db.session.add(post)
    db.session.commit()

    return jsonify({
        "message": "Post created", 
        "id": post.id, 
        "image_url": image_url 
    }), 201

@api_bp.get("/posts/feed")
@token_required
def get_feed(current_user: User):
    page = int(request.args.get("page", 1))
    feed_type = request.args.get("type", "for_you") # Lấy tham số type
    per_page = 20

    if feed_type == "following":
        # Logic: Chỉ lấy bài của người mình đang follow
        # Join bảng posts với bảng followers
        pagination = (
            Post.query
            .join(followers, (followers.c.followed_id == Post.user_id))
            .filter(followers.c.follower_id == current_user.id)
            .order_by(Post.created_at.desc())
            .paginate(page=page, per_page=per_page, error_out=False)
        )
    else:
        # Logic: For you (Lấy tất cả bài viết mới nhất hệ thống)
        pagination = Post.query.order_by(Post.created_at.desc()).paginate(
            page=page, per_page=per_page, error_out=False
        )

    def serialize_post(p: Post):
        return {
            "id": p.id,
            "content": p.content,
            "image_url": p.image,
            "created_at": p.created_at.isoformat(),
            "author_name": p.user.name,
            
            # === SỬA DÒNG NÀY ===
            # Xóa "p.user.username or", chỉ dùng email split
            "author_username": p.user.email.split('@')[0], 
            # ====================
            
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
        
        # --- THÊM ĐOẠN NÀY ĐỂ TẠO THÔNG BÁO ---
        # Chỉ tạo thông báo nếu người like không phải là chủ bài viết
        if post.user_id != current_user.id:
            # Kiểm tra xem đã có thông báo like chưa để tránh spam
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
        # ---------------------------------------

        msg = "Liked"

    db.session.commit()
    return jsonify({"message": msg})

# 1. API Lấy chi tiết bài viết (Kèm comments)
@api_bp.get("/posts/<int:post_id>")
@token_required
def get_post_detail(current_user: User, post_id: int):
    post = Post.query.get_or_404(post_id)
    
    # Lấy danh sách comment của bài viết
    comments_data = []
    # Sắp xếp comment mới nhất lên đầu (nếu muốn)
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
        "comments": comments_data # Trả về danh sách comment
    })

# 2. API Viết Comment
@api_bp.post("/posts/<int:post_id>/comments")
@token_required
def create_comment(current_user: User, post_id: int):
    data = request.get_json() or {}
    body = data.get("body", "").strip()
    
    if not body:
        return jsonify({"error": "Comment empty"}), 400

    post = Post.query.get_or_404(post_id)
    
    # Import model Comment ở đây để tránh lỗi vòng lặp nếu chưa import ở đầu
    from ..models import Comment, Notification
    
    comment = Comment(body=body, user=current_user, post=post)
    db.session.add(comment)
    
    # Tạo thông báo (nếu người comment không phải chủ bài viết)
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
    
    # Kiểm tra quyền chính chủ
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
    
    # Kiểm tra quyền chính chủ hoặc Admin
    if post.user_id != current_user.id and not current_user.is_admin:
        return jsonify({"error": "Forbidden"}), 403

    # (Tuỳ chọn) Nếu muốn xóa cả ảnh trên server thì thêm logic os.remove ở đây
    
    db.session.delete(post)
    db.session.commit()
    
    return jsonify({"message": "Post deleted"})