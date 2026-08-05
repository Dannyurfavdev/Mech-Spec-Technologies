from django.contrib import admin

from .models import ChatLog, FAQEntry


@admin.register(FAQEntry)
class FAQEntryAdmin(admin.ModelAdmin):
    list_display = ['question', 'category']
    list_filter = ['category']
    search_fields = ['question', 'keywords']


@admin.register(ChatLog)
class ChatLogAdmin(admin.ModelAdmin):
    list_display = ['user', 'message', 'created_at']
    readonly_fields = ['user', 'message', 'matched_faqs', 'response', 'created_at']
