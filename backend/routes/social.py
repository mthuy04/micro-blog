from flask import request, jsonify
from .. import db
from ..models import User, Post, Comment, Like, Notification
from . import api_bp
from .auth import token_required

# ===== Comments =====


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
