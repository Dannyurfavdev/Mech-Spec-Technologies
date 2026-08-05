from django.shortcuts import get_object_or_404
from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.exceptions import PermissionDenied
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response

from accounts.permissions import IsAdmin, IsCourseOwner, IsInstructor, IsNotSuspended
from logs.models import AuditLog
from logs.utils import log_action

from .models import Category, Course, LearningObjective, Lesson, Module
from .serializers import (
    CategorySerializer,
    CourseDetailSerializer,
    CourseListSerializer,
    CourseWriteSerializer,
    LearningObjectiveSerializer,
    LessonSerializer,
    ModuleSerializer,
)


def _get_owned_course(request, course_id):
    """Fetch a course the requesting instructor owns, or raise 403/404.
    Centralizes the has_object_permission call that DRF doesn't run
    automatically for function-based views.

    Deliberately does NOT filter out removed courses — instructors can
    still view (read-only) a course an admin removed, e.g. to appeal the
    decision or review history. Callers that modify the course must call
    _reject_if_removed() themselves."""
    course = get_object_or_404(Course, pk=course_id)
    checker = IsCourseOwner()
    if not checker.has_object_permission(request, None, course):
        raise PermissionDenied(checker.message)
    return course


def _reject_if_removed(course):
    """Call at the top of any instructor write path. Raises so the view
    can just call this and continue, no branching needed at call sites."""
    if course.is_removed:
        raise PermissionDenied('This course was removed by an administrator and is read-only. Contact support to appeal.')


# ---- Public / student browse ----------------------------------------------

@api_view(['GET'])
@permission_classes([AllowAny])
def list_categories(request):
    return Response(CategorySerializer(Category.objects.all(), many=True).data)


@api_view(['GET'])
@permission_classes([AllowAny])
def browse_courses(request):
    """Published, non-removed courses only. Optional ?category=<id> filter."""
    qs = Course.objects.published().select_related('instructor', 'category')
    category_id = request.query_params.get('category')
    if category_id:
        qs = qs.filter(category_id=category_id)
    return Response(CourseListSerializer(qs, many=True).data)


@api_view(['GET'])
@permission_classes([AllowAny])
def course_detail(request, course_id):
    """Anyone can view a published course's detail. Unpublished courses are
    only visible to the owning instructor (checked below)."""
    course = get_object_or_404(Course.objects.active(), pk=course_id)
    if not course.is_published:
        user = request.user
        is_owner = user.is_authenticated and course.instructor_id == user.id
        if not is_owner:
            return Response({'detail': 'Not found.'}, status=status.HTTP_404_NOT_FOUND)
    return Response(CourseDetailSerializer(course).data)


# ---- Instructor course management ------------------------------------------

@api_view(['GET', 'POST'])
@permission_classes([IsInstructor, IsNotSuspended])
def instructor_courses(request):
    if request.method == 'GET':
        # Includes removed courses (read-only) so instructors retain
        # visibility/history even after an admin removes one.
        qs = Course.objects.filter(instructor=request.user)
        return Response(CourseListSerializer(qs, many=True).data)

    serializer = CourseWriteSerializer(data=request.data)
    serializer.is_valid(raise_exception=True)
    course = serializer.save(instructor=request.user)
    log_action(request.user, AuditLog.Action.COURSE_CREATED, target=course, title=course.title)
    return Response(CourseDetailSerializer(course).data, status=status.HTTP_201_CREATED)


@api_view(['GET', 'PUT', 'PATCH', 'DELETE'])
@permission_classes([IsInstructor, IsNotSuspended])
def instructor_course_detail(request, course_id):
    course = _get_owned_course(request, course_id)

    if request.method == 'GET':
        # Read-only access works even if the course was removed.
        return Response(CourseDetailSerializer(course).data)

    if request.method == 'DELETE':
        # Instructors don't hard-delete or soft-delete — only admins remove
        # courses (see admin app). Instructors unpublish instead.
        return Response(
            {'detail': 'Instructors cannot delete courses. Unpublish instead via PATCH is_published=false.'},
            status=status.HTTP_405_METHOD_NOT_ALLOWED,
        )

    _reject_if_removed(course)
    partial = request.method == 'PATCH'
    serializer = CourseWriteSerializer(course, data=request.data, partial=partial)
    serializer.is_valid(raise_exception=True)
    course = serializer.save()
    log_action(request.user, AuditLog.Action.COURSE_UPDATED, target=course, title=course.title)
    return Response(CourseDetailSerializer(course).data)


# ---- Learning objectives ----------------------------------------------------

@api_view(['POST'])
@permission_classes([IsInstructor, IsNotSuspended])
def add_learning_objective(request, course_id):
    course = _get_owned_course(request, course_id)
    _reject_if_removed(course)
    serializer = LearningObjectiveSerializer(data=request.data)
    serializer.is_valid(raise_exception=True)
    serializer.save(course=course)
    return Response(serializer.data, status=status.HTTP_201_CREATED)


@api_view(['DELETE'])
@permission_classes([IsInstructor, IsNotSuspended])
def delete_learning_objective(request, course_id, objective_id):
    course = _get_owned_course(request, course_id)
    _reject_if_removed(course)
    objective = get_object_or_404(LearningObjective, pk=objective_id, course=course)
    objective.delete()
    return Response(status=status.HTTP_204_NO_CONTENT)


# ---- Modules -----------------------------------------------------------------

@api_view(['POST'])
@permission_classes([IsInstructor, IsNotSuspended])
def add_module(request, course_id):
    course = _get_owned_course(request, course_id)
    _reject_if_removed(course)
    serializer = ModuleSerializer(data=request.data)
    serializer.is_valid(raise_exception=True)
    module = serializer.save(course=course)
    return Response(ModuleSerializer(module).data, status=status.HTTP_201_CREATED)


@api_view(['PATCH', 'DELETE'])
@permission_classes([IsInstructor, IsNotSuspended])
def module_detail(request, course_id, module_id):
    course = _get_owned_course(request, course_id)
    _reject_if_removed(course)
    module = get_object_or_404(Module, pk=module_id, course=course)

    if request.method == 'DELETE':
        module.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)

    serializer = ModuleSerializer(module, data=request.data, partial=True)
    serializer.is_valid(raise_exception=True)
    serializer.save()
    return Response(serializer.data)


# ---- Lessons -------------------------------------------------------------------

@api_view(['POST'])
@permission_classes([IsInstructor, IsNotSuspended])
def add_lesson(request, course_id, module_id):
    course = _get_owned_course(request, course_id)
    _reject_if_removed(course)
    module = get_object_or_404(Module, pk=module_id, course=course)
    serializer = LessonSerializer(data=request.data)
    serializer.is_valid(raise_exception=True)
    lesson = serializer.save(module=module)
    return Response(LessonSerializer(lesson).data, status=status.HTTP_201_CREATED)


@api_view(['PATCH', 'DELETE'])
@permission_classes([IsInstructor, IsNotSuspended])
def lesson_detail(request, course_id, module_id, lesson_id):
    course = _get_owned_course(request, course_id)
    _reject_if_removed(course)
    module = get_object_or_404(Module, pk=module_id, course=course)
    lesson = get_object_or_404(Lesson, pk=lesson_id, module=module)

    if request.method == 'DELETE':
        lesson.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)

    serializer = LessonSerializer(lesson, data=request.data, partial=True)
    serializer.is_valid(raise_exception=True)
    serializer.save()
    return Response(serializer.data)


# ---- Admin: course oversight -------------------------------------------------

@api_view(['GET'])
@permission_classes([IsAdmin])
def admin_list_courses(request):
    """All courses, including unpublished and removed — admins need full
    visibility, unlike the public browse endpoint."""
    qs = Course.objects.select_related('instructor', 'category').order_by('-created_at')
    return Response(CourseListSerializer(qs, many=True).data)


@api_view(['POST'])
@permission_classes([IsAdmin])
def admin_remove_course(request, course_id):
    """Soft-delete: sets is_removed=True. The course disappears from public
    browse/detail and instructor listings but the row (and its enrollment/
    order history) is preserved."""
    course = get_object_or_404(Course, pk=course_id)
    course.is_removed = True
    course.save(update_fields=['is_removed'])
    log_action(request.user, AuditLog.Action.COURSE_REMOVED, target=course, title=course.title)
    return Response(CourseDetailSerializer(course).data)


@api_view(['POST'])
@permission_classes([IsAdmin])
def admin_restore_course(request, course_id):
    course = get_object_or_404(Course, pk=course_id)
    course.is_removed = False
    course.save(update_fields=['is_removed'])
    log_action(request.user, AuditLog.Action.ADMIN_ACTION, target=course, action_taken='restore_course')
    return Response(CourseDetailSerializer(course).data)
