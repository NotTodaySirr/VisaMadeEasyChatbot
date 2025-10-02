from __future__ import annotations

import smtplib
import ssl
from email.message import EmailMessage
from typing import Iterable, Optional

from flask import current_app

# Import certifi for reliable CA certificates
try:
    import certifi
    CA_CERTS_AVAILABLE = True
except ImportError:
    CA_CERTS_AVAILABLE = False


def _create_ssl_context():
    """Create an SSL context with proper certificate verification."""
    context = ssl.create_default_context()
    
    # Use certifi's CA bundle if available
    if CA_CERTS_AVAILABLE:
        context.load_verify_locations(certifi.where())
    
    return context


def send_email(
    subject: str,
    recipients: Iterable[str] | str,
    text_body: str,
    html_body: Optional[str] = None,
) -> bool:
    """Send an email using SMTP settings from the Flask configuration.

    Returns True if the message was sent successfully. If email delivery is
    suppressed or configuration is missing, the function logs the reason and
    returns False so callers can decide how to continue gracefully.
    """
    app = current_app._get_current_object()

    if app.config.get('MAIL_SUPPRESS_SEND'):
        app.logger.info('MAIL_SUPPRESS_SEND is enabled; skipping email to %s', recipients)
        return False

    mail_server = app.config.get('MAIL_SERVER')
    if not mail_server:
        app.logger.warning('MAIL_SERVER is not configured; skipping email delivery for subject %s', subject)
        return False

    # Normalise recipients to a list for the email message headers.
    if isinstance(recipients, (str, bytes)):
        recipient_list = [recipients]
    else:
        recipient_list = list(recipients)

    if not recipient_list:
        app.logger.warning('No recipients provided for email with subject %s', subject)
        return False

    sender = app.config.get('MAIL_DEFAULT_SENDER') or app.config.get('MAIL_USERNAME')
    if not sender:
        app.logger.warning('No sender configured; set MAIL_DEFAULT_SENDER or MAIL_USERNAME')
        return False

    message = EmailMessage()
    message['Subject'] = subject
    message['From'] = sender
    message['To'] = ', '.join(recipient_list)
    message.set_content(text_body)

    if html_body:
        message.add_alternative(html_body, subtype='html')

    mail_port = int(app.config.get('MAIL_PORT', 587))
    username = app.config.get('MAIL_USERNAME')
    password = app.config.get('MAIL_PASSWORD')
    use_ssl = app.config.get('MAIL_USE_SSL', False)
    use_tls = app.config.get('MAIL_USE_TLS', True)

    try:
        # Create SSL context with proper CA certificates
        context = _create_ssl_context()
        
        if use_ssl:
            with smtplib.SMTP_SSL(mail_server, mail_port, context=context) as smtp:
                if username and password:
                    smtp.login(username, password)
                smtp.send_message(message)
        else:
            with smtplib.SMTP(mail_server, mail_port) as smtp:
                if use_tls:
                    smtp.starttls(context=context)
                if username and password:
                    smtp.login(username, password)
                smtp.send_message(message)
    except Exception as exc:  # pragma: no cover - network errors depend on env
        app.logger.error('Failed to send email for subject %s: %s', subject, exc, exc_info=True)
        return False

    return True
