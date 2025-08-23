from datetime import datetime
from app.core.extensions import db

class TokenBlacklist(db.Model):
    __tablename__ = 'token_blacklist'
    
    id = db.Column(db.Integer, primary_key=True)
    jti = db.Column(db.String(36), nullable=False, unique=True)  # JWT ID
    token_type = db.Column(db.String(16), nullable=False)  # 'access' or 'refresh'
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow, nullable=False)
    expires_at = db.Column(db.DateTime, nullable=False)
    
    def __repr__(self):
        return f'<TokenBlacklist {self.jti}>'
    
    @classmethod
    def is_jti_blacklisted(cls, jti):
        """Check if a JWT ID is blacklisted."""
        token = cls.query.filter_by(jti=jti).first()
        return token is not None
    
    @classmethod
    def add_token_to_blacklist(cls, jti, token_type, user_id=None, expires_at=None):
        """Add a token to the blacklist."""
        blacklisted_token = cls(
            jti=jti,
            token_type=token_type,
            user_id=user_id,
            expires_at=expires_at or datetime.utcnow()
        )
        db.session.add(blacklisted_token)
        return blacklisted_token