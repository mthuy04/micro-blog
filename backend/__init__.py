# backend/__init__.py

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

    # ===== SỬA LẠI ĐOẠN NÀY =====
    # Cho phép tất cả các nguồn (origins="*") để dev cho dễ, tránh lỗi CORS
    CORS(app, resources={r"/api/*": {"origins": "*"}}, supports_credentials=True)
    # ============================

    from . import models

    # Import & register 1 blueprint duy nhất cho API
    from .routes import api_bp
    app.register_blueprint(api_bp, url_prefix="/api")

    # Dev local: tự tạo bảng nếu chưa có
    with app.app_context():
        db.create_all()

    return app
