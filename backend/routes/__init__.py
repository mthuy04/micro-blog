# backend/routes/__init__.py
from flask import Blueprint

# 1. Tạo Blueprint chung cho toàn bộ API
api_bp = Blueprint("api", __name__)
@api_bp.get("/health")
def health_check():
    return jsonify({"status": "ok", "message": "Server is running 🚀"}), 200
# ---------------------

# 2. IMPORT CÁC MODULE CON ĐỂ KÍCH HOẠT ROUTES
# Lưu ý: Phải import SAU khi khai báo api_bp để tránh lỗi vòng lặp (circular import)
from . import auth
from . import posts
from . import social
from . import notifications
from . import admin
from . import uploads
from . import users
from . import messages
from . import search