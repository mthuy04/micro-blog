from flask import request, jsonify
from .. import db
from ..models import Message, User
from . import api_bp
from .auth import token_required
from sqlalchemy import or_, and_

# Gửi tin nhắn
@api_bp.post("/messages")
@token_required
def send_message(current_user: User):
    data = request.get_json()
    receiver_id = data.get("receiver_id")
    body = data.get("body")
    
    if not body or not receiver_id:
        return jsonify({"error": "Missing data"}), 400
        
    msg = Message(body=body, sender_id=current_user.id, receiver_id=receiver_id)
    db.session.add(msg)
    db.session.commit()
    return jsonify({"message": "Sent", "id": msg.id})

# Lấy tin nhắn với 1 user cụ thể
@api_bp.get("/messages/<int:partner_id>")
@token_required
def get_messages(current_user: User, partner_id: int):
    messages = Message.query.filter(
        or_(
            and_(Message.sender_id == current_user.id, Message.receiver_id == partner_id),
            and_(Message.sender_id == partner_id, Message.receiver_id == current_user.id)
        )
    ).order_by(Message.created_at.asc()).all()
    
    return jsonify([{
        "id": m.id,
        "body": m.body,
        "sender_id": m.sender_id,
        "created_at": m.created_at.isoformat()
    } for m in messages])

# Lấy danh sách người đã chat (Inbox)
@api_bp.get("/conversations")
@token_required
def get_conversations(current_user: User):
    users = User.query.filter(User.id != current_user.id).all()
    return jsonify([{
        "id": u.id,
        "name": u.name,
        "avatar": u.avatar,
        "last_message": "Start chatting..."
    } for u in users])