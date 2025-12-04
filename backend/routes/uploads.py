import os
from uuid import uuid4
from flask import current_app, request, jsonify
from werkzeug.utils import secure_filename
from . import api_bp
from .auth import token_required
from ..models import User
import cloudinary.uploader # <--- THÊM DÒNG NÀY

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

    try:
        # --- CODE MỚI: Upload lên Cloudinary ---
        upload_result = cloudinary.uploader.upload(file)
        url = upload_result.get("secure_url")

        # Nếu request có type=avatar, cập nhật luôn user (dự phòng)
        upload_type = request.form.get("type", "post")
        if upload_type == "avatar":
            current_user.avatar = url
            from .. import db
            db.session.commit()

        return jsonify({"url": url})

    except Exception as e:
        print(f"Upload Error: {e}")
        return jsonify({"error": "Upload failed"}), 500