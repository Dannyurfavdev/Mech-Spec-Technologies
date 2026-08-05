"""
Lightweight retrieval for grounding the chatbot's answers in FAQEntry
content. No vector DB / embeddings — the FAQ set is small and fixed, so
keyword overlap is plenty and keeps the stack simple (matches the "keep
infra simple" decision made for this project).
"""

import re

_STOPWORDS = {
    'a', 'an', 'the', 'is', 'are', 'do', 'does', 'how', 'i', 'to', 'my', 'me',
    'can', 'what', 'when', 'where', 'why', 'in', 'on', 'for', 'of', 'and',
    'or', 'it', 'this', 'that', 'you', 'your', 'be', 'with',
}


def _tokenize(text):
    words = re.findall(r"[a-zA-Z']+", text.lower())
    return {w for w in words if w not in _STOPWORDS and len(w) > 2}


def retrieve_relevant_faqs(query, faq_queryset, top_n=3, min_score=1):
    """
    Scores each FAQEntry by token overlap between the query and the
    entry's question + keywords fields. Returns the top_n entries with
    score >= min_score, best first. Returns an empty list if nothing
    clears the bar — callers should treat that as 'no grounding found'
    rather than guessing.
    """
    query_tokens = _tokenize(query)
    if not query_tokens:
        return []

    scored = []
    for faq in faq_queryset:
        faq_tokens = _tokenize(faq.question) | _tokenize(faq.keywords)
        score = len(query_tokens & faq_tokens)
        if score >= min_score:
            scored.append((score, faq))

    scored.sort(key=lambda pair: pair[0], reverse=True)
    return [faq for _score, faq in scored[:top_n]]
