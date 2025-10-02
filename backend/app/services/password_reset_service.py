from __future__ import annotations

import hashlib
import secrets
from datetime import datetime, timedelta, timezone
from typing import Optional

from flask import current_app
from sqlalchemy import and_, or_

from app.core import db, send_email
from app.db.models.password_reset_token import PasswordResetToken
from app.db.models.user import User


def _hash_token(raw_token: str) -> str:
    return hashlib.sha256(raw_token.encode('utf-8')).hexdigest()


def _build_reset_link(token: str) -> str:
    app = current_app._get_current_object()
    base_url: str = app.config.get('FRONTEND_BASE_URL', 'http://localhost:5173').rstrip('/')
    # Use path parameter format instead of query string
    return f"{base_url}/auth/reset-password/{token}"


def _expiry_window() -> timedelta:
    minutes = current_app.config.get('PASSWORD_RESET_TOKEN_EXPIRATION_MINUTES', 30)
    try:
        minutes = int(minutes)
    except (TypeError, ValueError):
        minutes = 30
    return timedelta(minutes=minutes)


def create_password_reset_token(user: User) -> tuple[str, PasswordResetToken]:
    """Create a single-use password reset token for the given user."""
    now = datetime.now(timezone.utc)

    active_tokens = PasswordResetToken.query.filter_by(user_id=user.id, consumed_at=None).all()
    for token in active_tokens:
        token.consumed_at = now

    raw_token = secrets.token_urlsafe(48)
    hashed = _hash_token(raw_token)
    expires_at = now + _expiry_window()

    reset_token = PasswordResetToken(
        user_id=user.id,
        token_hash=hashed,
        expires_at=expires_at,
    )
    db.session.add(reset_token)

    return raw_token, reset_token


def verify_reset_token(raw_token: str) -> Optional[PasswordResetToken]:
    if not raw_token:
        return None

    hashed = _hash_token(raw_token)
    token = PasswordResetToken.query.filter_by(token_hash=hashed).first()
    if not token or token.consumed_at is not None or token.is_expired:
        return None

    return token


def send_reset_email(user: User, reset_link: str) -> bool:
    display_name = user.username or user.email
    minutes = current_app.config.get('PASSWORD_RESET_TOKEN_EXPIRATION_MINUTES', 30)
    subject = 'Password reset instructions'
    text_body = (
        f"Hello {display_name},\n\n"
        "We received a request to reset the password for your VisaMadeEasy account.\n"
        "Click the link below to choose a new password:\n"
        f"{reset_link}\n\n"
        f"This link will expire in {minutes} minutes. If you did not request a password reset, you can safely ignore this email."
    )

    html_body = f"""
    <p>Hello {display_name},</p>
    <p>We received a request to reset the password for your VisaMadeEasy account.</p>
    <p><a href=\"{reset_link}\">Click here to choose a new password</a>.</p>
    <p>This link will expire in {minutes} minutes. If you did not request a password reset, you can safely ignore this email.</p>
    """

    return send_email(subject, [user.email], text_body, html_body)


def build_and_send_reset_email(user: User) -> tuple[Optional[str], Optional[PasswordResetToken]]:
    """Create token, persist it, and send reset instructions."""
    raw_token, reset_token = create_password_reset_token(user)
    reset_link = _build_reset_link(raw_token)

    app = current_app._get_current_object()
    if app.config.get('MAIL_SUPPRESS_SEND'):
        app.logger.info('Password reset link (suppressed send) for %s: %s', user.email, reset_link)

    send_reset_email(user, reset_link)
    return raw_token, reset_token


def prune_expired_reset_tokens(retention_minutes: Optional[int] = None) -> int:
    """Delete reset tokens that have been expired or unused past the retention window."""
    app = current_app._get_current_object()
    minutes = retention_minutes if retention_minutes is not None else app.config.get(
        'PASSWORD_RESET_TOKEN_RETENTION_MINUTES',
        1440,
    )

    try:
        minutes = int(minutes)
    except (TypeError, ValueError):
        minutes = 1440

    if minutes <= 0:
        minutes = 60

    threshold = datetime.now(timezone.utc) - timedelta(minutes=minutes)

    filters = or_(
        PasswordResetToken.expires_at <= threshold,
        and_(
            PasswordResetToken.consumed_at.isnot(None),
            PasswordResetToken.consumed_at <= threshold,
        ),
    )

    deleted = PasswordResetToken.query.filter(filters).delete(synchronize_session=False)
    db.session.commit()
    return deleted
