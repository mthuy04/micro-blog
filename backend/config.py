# backend/config.py
import os
from pathlib import Path

BASE_DIR = Path(__file__).resolve().parent

class Config:
    SECRET_KEY = os.getenv("SECRET_KEY", "dev-secret-key")

    MYSQL_USER = os.getenv("MYSQL_USER", "root")
    MYSQL_PASSWORD = os.getenv("MYSQL_PASSWORD", "")
    MYSQL_HOST = os.getenv("MYSQL_HOST", "localhost")
    MYSQL_DB = os.getenv("MYSQL_DB", "micro_blog")  # trùng với DB bạn đã tạo

    SQLALCHEMY_DATABASE_URI = (
        f"mysql+pymysql://{MYSQL_USER}:{MYSQL_PASSWORD}"
        f"@{MYSQL_HOST}/{MYSQL_DB}"
    )
    SQLALCHEMY_TRACK_MODIFICATIONS = False

    UPLOAD_FOLDER = BASE_DIR / "static" / "uploads"

# Ưu tiên lấy DATABASE_URL từ Render, nếu không có thì mới dùng MySQL local
SQLALCHEMY_DATABASE_URI = os.environ.get('DATABASE_URL') 

# Fix lỗi nhỏ của Render (Render dùng 'postgres://' nhưng thư viện Python cần 'postgresql://')
if SQLALCHEMY_DATABASE_URI and SQLALCHEMY_DATABASE_URI.startswith("postgres://"):
    SQLALCHEMY_DATABASE_URI = SQLALCHEMY_DATABASE_URI.replace("postgres://", "postgresql://", 1)

# Nếu không có DATABASE_URL (tức là đang chạy local), thì dùng chuỗi MySQL cũ của bạn
if not SQLALCHEMY_DATABASE_URI:
    SQLALCHEMY_DATABASE_URI = f"mysql://{os.environ.get('MYSQL_USER')}:{os.environ.get('MYSQL_PASSWORD')}@..."
