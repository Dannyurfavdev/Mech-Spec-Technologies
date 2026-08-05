from django.conf import settings
from django.db import models


class AuditLog(models.Model):
    class Action(models.TextChoices):
        LOGIN = 'LOGIN', 'Login'
        LOGOUT = 'LOGOUT', 'Logout'
        REGISTER = 'REGISTER', 'Register'
        COURSE_CREATED = 'COURSE_CREATED', 'Course created'
        COURSE_UPDATED = 'COURSE_UPDATED', 'Course updated'
        COURSE_REMOVED = 'COURSE_REMOVED', 'Course removed'
        ENROLLMENT = 'ENROLLMENT', 'Enrollment'
        PURCHASE = 'PURCHASE', 'Purchase'
        ADMIN_ACTION = 'ADMIN_ACTION', 'Admin action'
        SYSTEM_ERROR = 'SYSTEM_ERROR', 'System error'

    actor = models.ForeignKey(
        settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True, blank=True,
        related_name='audit_logs',
    )
    action = models.CharField(max_length=30, choices=Action.choices)
    target_type = models.CharField(max_length=100, blank=True)
    target_id = models.PositiveIntegerField(null=True, blank=True)
    metadata = models.JSONField(blank=True, default=dict)
    timestamp = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-timestamp']

    def __str__(self):
        return f'{self.action} by {self.actor_id} @ {self.timestamp}'
