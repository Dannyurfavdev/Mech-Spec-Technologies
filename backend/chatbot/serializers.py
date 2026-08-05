from rest_framework import serializers

from .models import ChatLog, FAQEntry


class FAQEntrySerializer(serializers.ModelSerializer):
    class Meta:
        model = FAQEntry
        fields = ['id', 'category', 'question', 'answer', 'keywords']


class ChatLogSerializer(serializers.ModelSerializer):
    matched_faqs = FAQEntrySerializer(many=True, read_only=True)

    class Meta:
        model = ChatLog
        fields = ['id', 'message', 'matched_faqs', 'response', 'created_at']
        read_only_fields = fields
