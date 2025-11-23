from flask import request, jsonify
from .. import db
from ..models import User, Post, Comment, Like, Notification
from . import api_bp
from .auth import token_required

# ===== Comments =====

@api_bp.post("/posts/<int:post_id>/comments")
@token_required
def create_comment(current_user: User, post_id: int):
    post = Post.query.get_or_404(post_id)
    data = request.get_json() or {}
    body = (data.get("body") or "").strip()
    if not body:
        return jsonify({"error": "Comment cannot be empty"}), 400

    comment = Comment(body=body, user=current_user, post=post)
    db.session.add(comment)

    if current_user.id != post.user_id:
        notif = Notification(
            user_id=post.user_id, actor_id=current_user.id, action="comment", post_id=post.id
        )
        db.session.add(notif)

    db.session.commit()
    return jsonify({"message": "Comment added"}), 201

# ===== Likes =====

# ===== Follow / Unfollow =====

@api_bp.post("/users/<int:user_id>/follow")
@token_required
def follow_user(current_user: User, user_id: int):
    target = User.query.get_or_404(user_id)
    if target.id == current_user.id:
        return jsonify({"error": "Cannot follow yourself"}), 400
    current_user.follow(target)
    if current_user.id != target.id:
        notif = Notification(
            user_id=target.id, actor_id=current_user.id, action="follow"
        )
        db.session.add(notif)
    db.session.commit()
    return jsonify({"message": "Followed"})

@api_bp.post("/users/<int:user_id>/unfollow")
@token_required
def unfollow_user(current_user: User, user_id: int):
    target = User.query.get_or_404(user_id)
    current_user.unfollow(target)
    db.session.commit()
    return jsonify({"message": "Unfollowed"})

@api_bp.get("/users/<int:user_id>/followers")
def get_followers(user_id: int):
    user = User.query.get_or_404(user_id)
    return jsonify(
        [
            {"id": u.id, "name": u.name, "avatar": u.avatar}
            for u in user.followers
        ]
    )

@api_bp.get("/users/<int:user_id>/following")
def get_following(user_id: int):
    user = User.query.get_or_404(user_id)
    return jsonify(
        [
            {"id": u.id, "name": u.name, "avatar": u.avatar}
            for u in user.following
        ]
    )
