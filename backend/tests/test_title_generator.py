from app.core.title_generator import (
    sanitize_title,
    truncate_word_boundary,
    simple_truncate,
    generate_title,
)


def test_sanitize_title_basic():
    assert sanitize_title("  <b>Hello</b>   world  ") == "Hello world"


def test_truncate_word_boundary():
    text = "This is a fairly long sentence that should truncate cleanly"
    out = truncate_word_boundary(text, limit=20)
    assert out == "This is a fairly long"


def test_simple_truncate_ellipsis():
    text = "abcdefghij"
    assert simple_truncate(text, limit=5) == "abcd…"


def test_generate_title_with_ai_preferred():
    title = generate_title(ai_tool_title=" My <i>Title</i>  ", first_message=None)
    assert title.startswith("My Title")


def test_generate_title_from_first_message_fallback():
    title = generate_title(ai_tool_title=None, first_message="Explain visas for Canada tourist entry requirements")
    assert len(title) <= 50
    assert len(title) > 0


