from flask import request, jsonify
from .. import db
from ..models import Post, Comment, User, Notification
from . import api_bp
from .auth import token_required

# ===== Posts & feed =====

@api_bp.get("/posts/feed")
@token_required
def get_feed(current_user: User):
    page = int(request.args.get("page", 1))
    per_page = 10

    pagination = current_user.feed_query().paginate(
        page=page, per_page=per_page, error_out=False
    )

    def serialize_post(p: Post):
        return {
            "id": p.id,
            "content": p.content,
            "image": p.image,
            "created_at": p.created_at.isoformat(),
            "user": {"id": p.user.id, "name": p.user.name, "avatar": p.user.avatar},
            "likes_count": len(p.likes),
            "comments_count": len(p.comments),
        }

    return jsonify(
        {"posts": [serialize_post(p) for p in pagination.items], "has_next": pagination.has_next}
    )

@api_bp.post("/posts")
@token_required
def create_post(current_user: User):
    data = request.get_json() or {}
    content = (data.get("content") or "").strip()
    image = data.get("image")

    if not content:
        return jsonify({"error": "Content required"}), 400

    post = Post(content=content, image=image, user=current_user)
    db.session.add(post)
    db.session.commit()
    return jsonify({"message": "Post created", "id": post.id}), 201

@api_bp.delete("/posts/<int:post_id>")
@token_required
def delete_post(current_user: User, post_id: int):
    post = Post.query.get_or_404(post_id)
    if post.user_id != current_user.id and not current_user.is_admin:
        return jsonify({"error": "Forbidden"}), 403
    db.session.delete(post)
    db.session.commit()
    return jsonify({"message": "Post deleted"})
