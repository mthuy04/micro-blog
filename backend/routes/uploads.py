import os
from uuid import uuid4
from flask import current_app, request, jsonify
from werkzeug.utils import secure_filename
from . import api_bp
from .auth import token_required
from ..models import User

ALLOWED_EXTENSIONS = {"png", "jpg", "jpeg", "gif"}

def allowed_file(filename: str) -> bool:
    return "." in filename and filename.rsplit(".", 1)[1].lower() in ALLOWED_EXTENSIONS

@api_bp.post("/upload/image")
@token_required
def upload_image(current_user: User):
    """
    Nhận multipart/form-data, field "file", optional field "type" = avatar|post
    """
    if "file" not in request.files:
        return jsonify({"error": "No file part"}), 400

    file = request.files["file"]
    if file.filename == "":
        return jsonify({"error": "No selected file"}), 400

    if not allowed_file(file.filename):
        return jsonify({"error": "Unsupported file type"}), 400

    upload_type = request.form.get("type", "post")
    folder = "avatars" if upload_type == "avatar" else "uploads"

    filename = secure_filename(file.filename)
    ext = filename.rsplit(".", 1)[1].lower()
    new_name = f"{uuid4().hex}.{ext}"

    save_dir = os.path.join(current_app.root_path, "static", folder)
    os.makedirs(save_dir, exist_ok=True)
    file.save(os.path.join(save_dir, new_name))

    url = f"/static/{folder}/{new_name}"

    # Nếu là avatar, cập nhật profile luôn
    if upload_type == "avatar":
        current_user.avatar = url

    from .. import db
    db.session.commit()

    return jsonify({"url": url})
