from django.conf import settings
from django.db import models


class FAQEntry(models.Model):
    class Category(models.TextChoices):
        REGISTRATION = 'registration', 'Registration'
        COURSES = 'courses', 'Courses'
        PAYMENTS = 'payments', 'Payments'
        PASSWORD = 'password', 'Password'
        DASHBOARD = 'dashboard', 'Dashboard'
        GENERAL = 'general', 'General'

    category = models.CharField(max_length=20, choices=Category.choices, default=Category.GENERAL)
    question = models.CharField(max_length=500)
    answer = models.TextField()
    keywords = models.CharField(
        max_length=500, blank=True,
        help_text='Comma-separated extra terms to aid retrieval matching.',
    )

    class Meta:
        verbose_name_plural = 'FAQ entries'

    def __str__(self):
        return self.question


class ChatLog(models.Model):
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True, blank=True,
        related_name='chat_logs',
    )
    message = models.TextField()
    matched_faqs = models.ManyToManyField(FAQEntry, blank=True, related_name='chat_logs')
    response = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f'ChatLog #{self.pk} — {self.message[:50]}'
