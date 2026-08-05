from django.contrib.auth.models import AbstractUser
from django.db import models


class User(AbstractUser):
    """Custom user with a role field driving RBAC across the platform."""

    class Role(models.TextChoices):
        ADMIN = 'admin', 'Administrator'
        INSTRUCTOR = 'instructor', 'Instructor'
        STUDENT = 'student', 'Student'

    role = models.CharField(max_length=20, choices=Role.choices, default=Role.STUDENT)
    is_suspended = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f'{self.username} ({self.role})'


class InstructorProfile(models.Model):
    """Extra profile info instructors fill in; created on first use."""

    user = models.OneToOneField(
        User, on_delete=models.CASCADE, related_name='instructor_profile',
        limit_choices_to={'role': User.Role.INSTRUCTOR},
    )
    bio = models.TextField(blank=True)
    title = models.CharField(max_length=255, blank=True)
    profile_picture = models.ImageField(upload_to='instructor_profiles/', null=True, blank=True)

    def __str__(self):
        return f'Instructor profile: {self.user.username}'
