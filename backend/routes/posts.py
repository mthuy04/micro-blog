import os
from uuid import uuid4
from flask import request, jsonify, current_app
from werkzeug.utils import secure_filename
from .. import db
from ..models import Post, User
from . import api_bp
from .auth import token_required
from ..models import followers

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
def toggle_like(current_user: User, post_id: int):
    # ... (Giữ nguyên logic like cũ của bạn hoặc copy lại từ file social.py nếu cần)
    from ..models import Like
    post = Post.query.get_or_404(post_id)
    existing = Like.query.filter_by(user_id=current_user.id, post_id=post.id).first()
    if existing:
        db.session.delete(existing)
        msg = "Unliked"
    else:
        like = Like(user=current_user, post=post)
        db.session.add(like)
        msg = "Liked"
    db.session.commit()
    return jsonify({"message": msg})