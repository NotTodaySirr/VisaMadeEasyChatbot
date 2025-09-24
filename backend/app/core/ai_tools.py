"""AI tool declarations for Google GenAI function/tool calling.

This module intentionally returns plain Python dicts for tool specifications to
avoid tight coupling to specific SDK type classes. The AI service can adapt these
dicts into the provider's native types where needed.
"""

from typing import Dict, Any


def get_title_generation_tool() -> Dict[str, Any]:
    """Return a tool definition for generating conversation titles.

    Contract mirrors Google GenAI function declaration shape:
    {
      "function_declarations": [
        {
          "name": "generate_conversation_title",
          "description": "...",
          "parameters": {
            "type": "OBJECT",
            "properties": {
              "title": {"type": "STRING", "description": "..."}
            },
            "required": ["title"]
          }
        }
      ]
    }
    """

    return {
        "function_declarations": [
            {
                "name": "generate_conversation_title",
                "description": (
                    "Generate a concise, descriptive title (≤50 chars) for a conversation "
                    "based on the first user message."
                ),
                "parameters": {
                    "type": "OBJECT",
                    "properties": {
                        "title": {
                            "type": "STRING",
                            "description": (
                                "A concise title (max 50 characters) capturing the essence "
                                "of the conversation."
                            ),
                        }
                    },
                    "required": ["title"],
                },
            }
        ]
    }


def get_tools_spec() -> Dict[str, Any]:
    """Return the complete tools spec collection.

    Extend here if additional tools are added.
    """
    return get_title_generation_tool()


