"""
Role-based permission classes for use with DRF's @permission_classes
decorator on function-based views, e.g.:

    @api_view(['POST'])
    @permission_classes([IsInstructor])
    def create_course(request):
        ...

Combine with IsAuthenticated implicitly — these all check request.user.role,
so an unauthenticated request (AnonymousUser) simply fails the check rather
than erroring, but pair with IsAuthenticated in DEFAULT_PERMISSION_CLASSES
(already set globally in settings) for a proper 401 vs 403 distinction.
"""

from rest_framework.permissions import BasePermission

from .models import User


class IsAdmin(BasePermission):
    message = 'This action requires administrator privileges.'

    def has_permission(self, request, view):
        return bool(
            request.user
            and request.user.is_authenticated
            and request.user.role == User.Role.ADMIN
        )


class IsInstructor(BasePermission):
    message = 'This action requires an instructor account.'

    def has_permission(self, request, view):
        return bool(
            request.user
            and request.user.is_authenticated
            and request.user.role == User.Role.INSTRUCTOR
        )


class IsStudent(BasePermission):
    message = 'This action requires a student account.'

    def has_permission(self, request, view):
        return bool(
            request.user
            and request.user.is_authenticated
            and request.user.role == User.Role.STUDENT
        )


class IsNotSuspended(BasePermission):
    """Blocks any suspended user regardless of role. Stack alongside a
    role check, e.g. permission_classes([IsStudent, IsNotSuspended])."""

    message = 'Your account has been suspended. Contact support.'

    def has_permission(self, request, view):
        return bool(
            request.user
            and request.user.is_authenticated
            and not request.user.is_suspended
        )


class IsCourseOwner(BasePermission):
    """Object-level check: the requesting instructor owns this course.
    Use as a second permission alongside IsInstructor, and call
    check_object_permissions(request, course) manually in FBVs since
    DRF only runs has_object_permission automatically for generic views."""

    message = 'You do not own this course.'

    def has_object_permission(self, request, view, obj):
        return obj.instructor_id == request.user.id
