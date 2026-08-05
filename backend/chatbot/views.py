from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny
from rest_framework.response import Response

from .llm import ChatbotNotConfigured, get_grounded_response
from .models import ChatLog, FAQEntry
from .retrieval import retrieve_relevant_faqs
from .serializers import ChatLogSerializer, FAQEntrySerializer


@api_view(['POST'])
@permission_classes([AllowAny])
def ask(request):
    """Public — even a not-yet-registered visitor should be able to ask
    'how do I register?'. Tracks the user on the log if authenticated."""
    message = (request.data.get('message') or '').strip()
    if not message:
        return Response({'detail': 'message is required.'}, status=status.HTTP_400_BAD_REQUEST)

    matched = retrieve_relevant_faqs(message, FAQEntry.objects.all())

    try:
        answer = get_grounded_response(message, matched)
    except ChatbotNotConfigured:
        return Response(
            {'detail': 'The AI assistant is not configured on this server (missing API key).'},
            status=status.HTTP_503_SERVICE_UNAVAILABLE,
        )

    log = ChatLog.objects.create(
        user=request.user if request.user.is_authenticated else None,
        message=message,
        response=answer,
    )
    log.matched_faqs.set(matched)

    return Response(ChatLogSerializer(log).data, status=status.HTTP_201_CREATED)


@api_view(['GET'])
@permission_classes([AllowAny])
def list_faqs(request):
    """Lets a frontend show a static FAQ page alongside the chat widget."""
    return Response(FAQEntrySerializer(FAQEntry.objects.all(), many=True).data)
