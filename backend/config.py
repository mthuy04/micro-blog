import os
from pathlib import Path

BASE_DIR = Path(__file__).resolve().parent

class Config:
    SECRET_KEY = os.environ.get("SECRET_KEY", "dev-secret-key")

    # 1. Thử lấy Database từ Render (Biến môi trường)
    database_url = os.environ.get("DATABASE_URL")

    # 2. Logic chọn Database:
    if database_url:
        # --- TRƯỜNG HỢP CHẠY TRÊN RENDER (CLOUD) ---
        # Fix lỗi nhỏ nếu Render trả về postgres:// thay vì postgresql:// (phòng hờ)
        if database_url.startswith("postgres://"):
            database_url = database_url.replace("postgres://", "postgresql://", 1)
        
        SQLALCHEMY_DATABASE_URI = database_url
        
        # Cấu hình SSL cho Aiven (Chỉ áp dụng khi URL chứa aivencloud)
        if "aivencloud" in database_url:
            SQLALCHEMY_ENGINE_OPTIONS = {
                "connect_args": {
                    "ssl": {"ca": "/etc/ssl/certs/ca-certificates.crt"}
                }
            }
    else:
        # --- TRƯỜNG HỢP CHẠY LOCAL (XAMPP) ---
        # Dùng lại cấu hình cũ của bạn để không bị lỗi khi dev ở nhà
        MYSQL_USER = "root"
        MYSQL_PASSWORD = ""
        MYSQL_HOST = "localhost"
        MYSQL_DB = "micro_blog"
        
        SQLALCHEMY_DATABASE_URI = (
            f"mysql+pymysql://{MYSQL_USER}:{MYSQL_PASSWORD}"
            f"@{MYSQL_HOST}/{MYSQL_DB}"
        )

    SQLALCHEMY_TRACK_MODIFICATIONS = False
    UPLOAD_FOLDER = BASE_DIR / "static" / "uploads"