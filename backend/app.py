# backend/app.py

from backend import create_app  # import từ package backend

app = create_app()

if __name__ == "__main__":
    # Chạy dev server tại http://127.0.0.1:5000
    app.run(debug=True, port=5000)
