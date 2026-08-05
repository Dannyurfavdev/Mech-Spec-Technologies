"""
Thin wrapper around the Anthropic API for the grounded support-assistant
response. Kept separate from views.py so the prompt and client setup are
easy to find and tune independently of the request-handling logic.
"""

import os

import anthropic

# NOTE: verify this against the current model list at
# https://docs.claude.com before deploying — model names change over time
# and this default may be stale by the time you read this.
DEFAULT_MODEL = os.environ.get('ANTHROPIC_MODEL', 'claude-sonnet-4-5')

SYSTEM_PROMPT = """You are the support assistant for the Mech Spec LMS platform.

Your ONLY job is to help users with platform usage questions: registration, \
logging in, uploading or publishing a course, purchasing a course, password \
help, and dashboard navigation.

Rules:
- Answer using ONLY the context provided below. Do not use outside knowledge \
about the platform.
- If the context does not contain the answer, say you're not sure and \
suggest the user contact support — do NOT guess or make something up.
- You do NOT provide tutoring, explanations, or help on course subject \
matter (e.g. don't explain a lesson's content, solve homework, etc). If \
asked something like that, politely redirect the user to their course \
material or instructor.
- Keep answers short and direct.

Context (relevant FAQ entries):
{context}
"""


class ChatbotNotConfigured(Exception):
    """Raised when ANTHROPIC_API_KEY isn't set. Callers should turn this
    into a clean 503 rather than letting it bubble up as a 500."""


def _build_context(faq_entries):
    if not faq_entries:
        return '(No matching FAQ entries were found for this question.)'
    return '\n\n'.join(f'Q: {f.question}\nA: {f.answer}' for f in faq_entries)


def get_grounded_response(user_message, faq_entries):
    api_key = os.environ.get('ANTHROPIC_API_KEY')
    if not api_key:
        raise ChatbotNotConfigured('ANTHROPIC_API_KEY is not set in the environment.')

    client = anthropic.Anthropic(api_key=api_key)
    system = SYSTEM_PROMPT.format(context=_build_context(faq_entries))

    response = client.messages.create(
        model=DEFAULT_MODEL,
        max_tokens=400,
        system=system,
        messages=[{'role': 'user', 'content': user_message}],
    )
    return ''.join(block.text for block in response.content if block.type == 'text')
