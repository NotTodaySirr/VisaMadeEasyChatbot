"""Conversation title generation with layered fallbacks and sanitization."""

from typing import Optional
import re


MAX_TITLE_CHARS = 50
DEFAULT_TITLE = "New Conversation"


def sanitize_title(raw: str) -> str:
    """Basic sanitization: strip whitespace, remove control chars, strip HTML tags.

    Keep minimal by default; caller clamps length later.
    """
    if not raw:
        return ""
    text = raw.strip()
    # remove rudimentary HTML tags
    text = re.sub(r"<[^>]+>", "", text)
    # collapse whitespace
    text = re.sub(r"\s+", " ", text)
    # remove non-printable control chars
    text = re.sub(r"[\x00-\x1F\x7F]", "", text)
    return text


def truncate_word_boundary(text: str, limit: int = MAX_TITLE_CHARS) -> str:
    if len(text) <= limit:
        return text
    cut = text[: limit + 1]
    # find last space for word boundary; fallback to hard cut
    idx = cut.rfind(" ")
    if idx == -1:
        return text[:limit]
    return text[:idx]


def smart_title_from_first_message(first_message: str) -> str:
    """Secondary fallback: create a reasonable title from first message.

    Steps: sanitize → word-boundary truncation ≤50 → ensure non-empty.
    """
    base = sanitize_title(first_message)
    title = truncate_word_boundary(base, MAX_TITLE_CHARS)
    title = title or DEFAULT_TITLE
    return title


def simple_truncate(text: str, limit: int = MAX_TITLE_CHARS) -> str:
    if not text:
        return ""
    if len(text) <= limit:
        return text
    return text[: max(0, limit - 1)] + "…"


def generate_title(
    *,
    ai_tool_title: Optional[str],
    first_message: Optional[str],
) -> str:
    """Generate a conversation title using layered fallbacks.

    Priority:
    1) ai_tool_title (sanitized, clamped)
    2) smart_title_from_first_message (word boundary ≤50)
    3) simple_truncate with ellipsis
    4) DEFAULT_TITLE
    """
    # Primary
    if ai_tool_title:
        title = sanitize_title(ai_tool_title)
        title = simple_truncate(title, MAX_TITLE_CHARS)
        return title or DEFAULT_TITLE

    # Secondary
    if first_message:
        title = smart_title_from_first_message(first_message)
        return title or DEFAULT_TITLE

    # Tertiary
    if first_message:
        return simple_truncate(first_message, MAX_TITLE_CHARS) or DEFAULT_TITLE

    # Final
    return DEFAULT_TITLE


