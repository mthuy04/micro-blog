from flask import jsonify
from ..models import User, Post
from . import api_bp
from .auth import token_required

@api_bp.get("/admin/overview")
@token_required
def admin_overview(current_user: User):
    if not current_user.is_admin:
        return jsonify({"error": "Forbidden"}), 403

    users_count = User.query.count()
    posts_count = Post.query.count()
    recent_users = (
        User.query.order_by(User.created_at.desc()).limit(5).all()
    )

    return jsonify(
        {
            "users_count": users_count,
            "posts_count": posts_count,
            "recent_users": [
                {
                    "id": u.id,
                    "name": u.name,
                    "email": u.email,
                    "created_at": u.created_at.isoformat(),
                }
                for u in recent_users
            ],
        }
    )
