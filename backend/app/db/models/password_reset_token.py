from __future__ import annotations

from datetime import datetime, timezone

from app.core.extensions import db


class PasswordResetToken(db.Model):
    __tablename__ = 'password_reset_token'

    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id', ondelete='CASCADE'), nullable=False)
    token_hash = db.Column(db.String(128), nullable=False, unique=True)
    expires_at = db.Column(db.DateTime(timezone=True), nullable=False)
    consumed_at = db.Column(db.DateTime(timezone=True), nullable=True)
    created_at = db.Column(db.DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), nullable=False)

    user = db.relationship('User', backref=db.backref('password_reset_tokens', lazy='dynamic'))

    __table_args__ = (
        db.Index('ix_password_reset_token_user_id', 'user_id'),
        db.Index('ix_password_reset_token_expires_at', 'expires_at'),
    )

    def mark_consumed(self) -> None:
        """Mark the token as used."""
        if not self.consumed_at:
            self.consumed_at = datetime.now(timezone.utc)

    @property
    def is_expired(self) -> bool:
        return datetime.now(timezone.utc) >= self.expires_at

    @property
    def is_active(self) -> bool:
        return not self.is_expired and self.consumed_at is None

    def __repr__(self) -> str:  # pragma: no cover - debug helper
        return f"<PasswordResetToken user_id={self.user_id} expires_at={self.expires_at!s}>"
