from backend import create_app, db
from backend.models import User
from werkzeug.security import generate_password_hash

app = create_app()

def reset_password(email, new_password):
    with app.app_context():
        # Tìm user theo email
        user = User.query.filter_by(email=email).first()
        
        if user:
            print(f"✅ Tìm thấy user: {user.name} ({user.email})")
            # Cập nhật mật khẩu với thuật toán mới (pbkdf2:sha256)
            user.password_hash = generate_password_hash(new_password, method='pbkdf2:sha256')
            db.session.commit()
            print("🚀 Đã cập nhật mật khẩu thành công!")
        else:
            print(f"❌ Không tìm thấy user có email: {email}")

if __name__ == "__main__":
    # Thay đổi thông tin bên dưới thành email và mật khẩu mới của bạn
    MY_EMAIL = "htn43@gmail.com"  # Email tài khoản cũ của bạn
    NEW_PASS = "12345678"       # Mật khẩu mới bạn muốn đặt
    
    reset_password(MY_EMAIL, NEW_PASS)