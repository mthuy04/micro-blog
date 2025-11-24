# backend/routes/auth.py
from datetime import datetime, timedelta
from functools import wraps
import jwt

from flask import current_app, request, jsonify

from backend import db
from backend.models import User
from . import api_bp



def generate_token(user: User) -> str:
    payload = {
        "user_id": user.id,
        "exp": datetime.utcnow() + timedelta(days=1),
    }
    return jwt.encode(
        payload,
        current_app.config["SECRET_KEY"],
        algorithm="HS256",
    )


def token_required(f):
    @wraps(f)
    def decorated(*args, **kwargs):
        auth_header = request.headers.get("Authorization", "")
        if not auth_header.startswith("Bearer "):
            return jsonify({"error": "Missing token"}), 401

        token = auth_header.split(" ")[1]

        try:
            data = jwt.decode(
                token,
                current_app.config["SECRET_KEY"],
                algorithms=["HS256"],
            )
            user = User.query.get(data["user_id"])
            if user is None:
                raise ValueError("User not found")
        except Exception:
            return jsonify({"error": "Invalid or expired token"}), 401

        return f(user, *args, **kwargs)

    return decorated


@api_bp.post("/auth/register")
def register():
    data = request.get_json() or {}
    name = (data.get("name") or "").strip()
    email = (data.get("email") or "").strip().lower()
    password = data.get("password")

    if not all([name, email, password]):
        return jsonify({"error": "Missing fields"}), 400

    if User.query.filter_by(email=email).first():
        return jsonify({"error": "Email already registered"}), 400

    user = User(name=name, email=email)
    user.set_password(password)

    db.session.add(user)
    db.session.commit()

    token = generate_token(user)
    username = user.email.split('@')[0]

    return (
        jsonify(
            {
                "token": token,
                "user": {"id": user.id, "name": user.name, "email": user.email},
            }
        ),
        201,
    )


@api_bp.post("/auth/login")
def login():
    data = request.get_json() or {}
    email = (data.get("email") or "").strip().lower()
    password = data.get("password")

    user = User.query.filter_by(email=email).first()
    if user is None or not user.check_password(password):
        return jsonify({"error": "Invalid credentials"}), 401

    token = generate_token(user)
    username = user.email.split('@')[0]
    return jsonify(
        {
            "token": token,
            "user": {
                "id": user.id, 
                "name": user.name, 
                "email": user.email,
                "username": username, # <--- THÊM DÒNG NÀY
                "avatar": user.avatar,
                "is_admin": user.is_admin
            },
        }
    )

