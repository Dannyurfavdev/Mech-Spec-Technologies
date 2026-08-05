from django.contrib import admin
from django.contrib.auth.admin import UserAdmin

from .models import InstructorProfile, User


@admin.register(User)
class CustomUserAdmin(UserAdmin):
    list_display = ['username', 'email', 'role', 'is_suspended', 'is_staff']
    list_filter = ['role', 'is_suspended', 'is_staff']
    fieldsets = UserAdmin.fieldsets + (
        ('Platform role', {'fields': ('role', 'is_suspended')}),
    )


@admin.register(InstructorProfile)
class InstructorProfileAdmin(admin.ModelAdmin):
    list_display = ['user', 'title']
