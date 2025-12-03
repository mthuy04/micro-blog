import os
from flask import Flask
from flask_sqlalchemy import SQLAlchemy
from flask_migrate import Migrate
from flask_cors import CORS

from .config import Config  # lấy config MySQL, SECRET_KEY, ...

# ----- SQLAlchemy & Migrate -----
db = SQLAlchemy()
migrate = Migrate()

def create_app():
    app = Flask(__name__)
    app.config.from_object(Config)

    # Khởi tạo DB
    db.init_app(app)
    migrate.init_app(app, db)

    # ===== ĐÃ CẬP NHẬT: CẤU HÌNH CORS CHO VERCEL =====
    # Chỉ cho phép Frontend từ Localhost và Vercel gọi API
    # Bạn cần thay 'https://ten-du-an-cua-ban.vercel.app' bằng link thực tế của bạn
    
    CORS(app, resources={r"/api/*": {"origins": [
        "http://localhost:5173",               # Cho phép chạy dưới local
        "https://ten-du-an-cua-ban.vercel.app" # <--- THAY LINK VERCEL CỦA BẠN VÀO ĐÂY
    ]}}, supports_credentials=True)
    # =================================================

    from . import models

    # Import & register 1 blueprint duy nhất cho API
    from .routes import api_bp
    app.register_blueprint(api_bp, url_prefix="/api")

    # Dev local: tự tạo bảng nếu chưa có
    # Lưu ý: Trên Render, nếu database đã có bảng rồi thì lệnh này sẽ được bỏ qua an toàn
    with app.app_context():
        db.create_all()

    return app