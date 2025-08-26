from flask_login import UserMixin
from werkzeug.security import generate_password_hash, check_password_hash
from datetime import datetime
import uuid
from app.core.extensions import db

class User(UserMixin, db.Model):
    __tablename__ = 'user'
    
    id = db.Column(db.Integer, primary_key=True)
    email = db.Column(db.String(120), unique=True, nullable=False)
    username = db.Column(db.String(64), unique=True, nullable=False)
    password_hash = db.Column(db.String(128), nullable=False)
    yearofbirth = db.Column(db.Integer, nullable=False)
    educational_level = db.Column(db.String(64), nullable=False)
    
    def set_password(self, password):
        """Hash and set the user's password."""
        self.password_hash = generate_password_hash(password)
    
    def check_password(self, password):
        """Check if the provided password matches the hashed password."""
        return check_password_hash(self.password_hash, password)
    
    def get_id(self):
        """Return the user ID as a string for Flask-Login."""
        return str(self.id)
    
    def __repr__(self):
        return f'<User {self.username}>'