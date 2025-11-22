# backend/__init__.py

import os
from flask import Flask
from flask_sqlalchemy import SQLAlchemy
from flask_migrate import Migrate
from flask_cors import CORS

from .config import Config  # dùng relative import

# ----- SQLAlchemy & Migrate -----
db = SQLAlchemy()
migrate = Migrate()


def create_app():
    app = Flask(__name__)
    app.config.from_object(Config)

    # Khởi tạo DB
    db.init_app(app)
    migrate.init_app(app, db)

    # ----- CORS CHO FRONTEND VITE (5174) -----
    CORS(
        app,
        resources={
            r"/api/*": {
                "origins": [
                    "http://localhost:5174",
                    "http://127.0.0.1:5174",
                ]
            }
        },
        supports_credentials=True,
    )
    # -----------------------------------------

    # Import models để SQLAlchemy biết các bảng
    from . import models  # noqa: F401

    # Import & register các blueprint
    from .routes.auth import auth_bp
    from .routes.posts import posts_bp
    from .routes.social import social_bp
    from .routes.notifications import notifications_bp
    from .routes.admin import admin_bp
    from .routes.uploads import uploads_bp

    app.register_blueprint(auth_bp, url_prefix="/api/auth")
    app.register_blueprint(posts_bp, url_prefix="/api/posts")
    app.register_blueprint(social_bp, url_prefix="/api/social")
    app.register_blueprint(notifications_bp, url_prefix="/api/notifications")
    app.register_blueprint(admin_bp, url_prefix="/api/admin")
    app.register_blueprint(uploads_bp, url_prefix="/api/uploads")

    # Dev local: tự tạo bảng nếu chưa có
    with app.app_context():
        db.create_all()

    return app
