from flask import request, jsonify
from .. import db
from ..models import Notification, User
from . import api_bp
from .auth import token_required

@api_bp.get("/notifications")
@token_required
def list_notifications(current_user: User):
    unread_only = request.args.get("unread") == "1"
    query = Notification.query.filter_by(user_id=current_user.id).order_by(
        Notification.created_at.desc()
    )
    if unread_only:
        query = query.filter(Notification.read_at.is_(None))

    items = query.limit(50).all()
    result = []
    for n in items:
        result.append(
            {
                "id": n.id,
                "action": n.action,
                "created_at": n.created_at.isoformat(),
                "read_at": n.read_at.isoformat() if n.read_at else None,
                "actor": {"id": n.actor.id, "name": n.actor.name, "avatar": n.actor.avatar},
                "post_id": n.post_id,
            }
        )
    return jsonify(result)

@api_bp.post("/notifications/<int:notif_id>/read")
@token_required
def mark_notification_read(current_user: User, notif_id: int):
    notif = Notification.query.get_or_404(notif_id)
    if notif.user_id != current_user.id:
        return jsonify({"error": "Forbidden"}), 403
    notif.read_at = notif.read_at or db.func.now()
    db.session.commit()
    return jsonify({"message": "Marked as read"})

@api_bp.get("/notifications/count")
@token_required
def count_unread_notifications(current_user):
    count = Notification.query.filter_by(user_id=current_user.id, read_at=None).count()
    return jsonify({"count": count})
