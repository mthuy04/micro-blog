from datetime import datetime
from werkzeug.security import generate_password_hash, check_password_hash
from . import db

followers = db.Table(
    "followers",
    db.Column("follower_id", db.Integer, db.ForeignKey("users.id"), primary_key=True),
    db.Column("followed_id", db.Integer, db.ForeignKey("users.id"), primary_key=True),
)

class User(db.Model):
    __tablename__ = "users"

    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(50), nullable=False)
    email = db.Column(db.String(120), unique=True, index=True, nullable=False)
    password_hash = db.Column(db.String(255), nullable=False)
    bio = db.Column(db.Text)
    avatar = db.Column(db.String(255))  # URL hoặc path file
    is_admin = db.Column(db.Boolean, default=False, nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    posts = db.relationship("Post", backref="user", lazy=True, cascade="all, delete-orphan")
    comments = db.relationship("Comment", backref="user", lazy=True, cascade="all, delete-orphan")
    likes = db.relationship("Like", backref="user", lazy=True, cascade="all, delete-orphan")

    notifications = db.relationship(
        "Notification",
        backref="user",
        lazy=True,
        foreign_keys="Notification.user_id",
        cascade="all, delete-orphan",
    )

    following = db.relationship(
        "User",
        secondary=followers,
        primaryjoin=(followers.c.follower_id == id),
        secondaryjoin=(followers.c.followed_id == id),
        backref=db.backref("followers", lazy="dynamic"),
        lazy="dynamic",
    )

    def set_password(self, password: str) -> None:
        self.password_hash = generate_password_hash(password)

    def check_password(self, password: str) -> bool:
        return check_password_hash(self.password_hash, password)

    def follow(self, user: "User") -> None:
        if not self.is_following(user):
            self.following.append(user)

    def unfollow(self, user: "User") -> None:
        if self.is_following(user):
            self.following.remove(user)

    def is_following(self, user: "User") -> bool:
        return self.following.filter(followers.c.followed_id == user.id).count() > 0

    def feed_query(self):
        from .models import Post
        return (
            Post.query.join(followers, followers.c.followed_id == Post.user_id)
            .filter((followers.c.follower_id == self.id) | (Post.user_id == self.id))
            .order_by(Post.created_at.desc())
        )

class Post(db.Model):
    __tablename__ = "posts"

    id = db.Column(db.Integer, primary_key=True)
    content = db.Column(db.Text, nullable=False)
    image = db.Column(db.String(255))
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    user_id = db.Column(db.Integer, db.ForeignKey("users.id"), nullable=False)

    comments = db.relationship("Comment", backref="post", lazy=True, cascade="all, delete-orphan")
    likes = db.relationship("Like", backref="post", lazy=True, cascade="all, delete-orphan")

class Comment(db.Model):
    __tablename__ = "comments"

    id = db.Column(db.Integer, primary_key=True)
    body = db.Column(db.Text, nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    user_id = db.Column(db.Integer, db.ForeignKey("users.id"), nullable=False)
    post_id = db.Column(db.Integer, db.ForeignKey("posts.id"), nullable=False)

class Like(db.Model):
    __tablename__ = "likes"

    id = db.Column(db.Integer, primary_key=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    user_id = db.Column(db.Integer, db.ForeignKey("users.id"), nullable=False)
    post_id = db.Column(db.Integer, db.ForeignKey("posts.id"), nullable=False)

    __table_args__ = (db.UniqueConstraint("user_id", "post_id", name="uq_user_post_like"),)

class Notification(db.Model):
    __tablename__ = "notifications"

    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey("users.id"), nullable=False)  # receiver
    actor_id = db.Column(db.Integer, db.ForeignKey("users.id"), nullable=False) # who did it
    action = db.Column(db.String(20), nullable=False)  # "follow" | "like" | "comment"
    post_id = db.Column(db.Integer, db.ForeignKey("posts.id"))
    comment_id = db.Column(db.Integer, db.ForeignKey("comments.id"))
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    read_at = db.Column(db.DateTime)

    actor = db.relationship("User", foreign_keys=[actor_id])
