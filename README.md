# 🎓 CampusTalk - University Social Network

**CampusTalk** is a full-stack micro-blogging and social networking platform tailored for university students. Built as the final project for the course **Computer Based Technologies (INS2065)**.

![CampusTalk Banner](https://via.placeholder.com/1000x400?text=CampusTalk+Preview) 
*(Thay thế link trên bằng ảnh chụp màn hình dự án thực tế của bạn)*

## 🚀 About The Project

CampusTalk enables students to connect, share ideas, and stay updated with campus life. It features a modern, responsive interface inspired by Twitter/X, allowing users to post updates, interact with others, and manage their personal profiles.

### ✨ Key Features

**User & Content:**
* 🔐 **Authentication:** Secure Login/Register with JWT.
* 📝 **Create Posts:** Share thoughts with text and images (Cloudinary integration).
* 🔄 **Social Interactions:** Like, Comment, and **Repost (Quote Tweet)** functionalities.
* 👤 **Profile Management:** Update bio, location, and upload avatar.
* 🔍 **Smart Search:** Search for users (`@username`) or topics (`#hashtag`).

**Feeds & Discovery:**
* 🏠 **Dual Feeds:** "For You" (Global) and "Following" (Personalized).
* 🔔 **Notifications:** Real-time updates when someone follows, likes, or comments.
* 💬 **Messaging:** Direct messaging system.

**Admin Module:**
* 📊 **Dashboard:** View system statistics (Total Users, Posts, etc.).
* 🛡️ **Moderation:** Ability to ban users and delete inappropriate posts.

## 🛠️ Tech Stack

**Frontend:**
* ![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB) **ReactJS (Vite)**
* ![TailwindCSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white) **TailwindCSS**
* **Lucide React** (Icons)

**Backend:**
* ![Flask](https://img.shields.io/badge/Flask-000000?style=for-the-badge&logo=flask&logoColor=white) **Flask (Python)**
* **SQLAlchemy** (ORM) & **Flask-Migrate**
* **PyJWT** (Authentication)

**Database & Cloud:**
* ![MySQL](https://img.shields.io/badge/MySQL-005C84?style=for-the-badge&logo=mysql&logoColor=white) **MySQL**
* ☁️ **Cloudinary** (Image Storage)
* 🚀 **Render & Vercel** (Deployment)

## ⚙️ Getting Started

### Prerequisites
* Node.js & npm
* Python 3.x
* MySQL Server (XAMPP or similar)

### 1. Clone the repository
```bash
git clone [https://github.com/your-username/micro-blog.git](https://github.com/your-username/micro-blog.git)
cd micro-blog
