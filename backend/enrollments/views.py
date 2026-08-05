from django.db import transaction as db_transaction
from django.shortcuts import get_object_or_404
from django.utils import timezone
from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response

from accounts.permissions import IsCourseOwner, IsInstructor, IsNotSuspended, IsStudent
from courses.models import Course, Lesson
from logs.models import AuditLog
from logs.utils import log_action

from .models import Enrollment, LessonProgress, Order, Transaction
from .serializers import (
    EnrolledStudentSerializer,
    EnrollmentSerializer,
    LessonProgressSerializer,
    OrderSerializer,
    TransactionSerializer,
)


# ---- Checkout / simulated payment -----------------------------------------

@api_view(['POST'])
@permission_classes([IsStudent, IsNotSuspended])
def checkout(request):
    """Starts a simulated purchase for a single course: creates a pending
    Order + Transaction. Call the confirm endpoint next to 'pay'."""
    course_id = request.data.get('course')
    course = get_object_or_404(Course.objects.published(), pk=course_id)

    if Enrollment.objects.filter(student=request.user, course=course).exists():
        return Response({'detail': 'Already enrolled in this course.'}, status=status.HTTP_400_BAD_REQUEST)

    existing_pending = Order.objects.filter(
        student=request.user, course=course, status=Order.Status.PENDING,
    ).first()
    if existing_pending:
        return Response(OrderSerializer(existing_pending).data)

    order = Order.objects.create(
        student=request.user, course=course, price_at_purchase=course.price,
    )
    txn = Transaction.objects.create(order=order)
    return Response({
        'order': OrderSerializer(order).data,
        'transaction': TransactionSerializer(txn).data,
    }, status=status.HTTP_201_CREATED)


@api_view(['POST'])
@permission_classes([IsStudent, IsNotSuspended])
def confirm_payment(request, reference):
    """Simulates a payment gateway callback confirming success. No real
    money moves — this just flips status and creates the Enrollment."""
    txn = get_object_or_404(Transaction, reference=reference, order__student=request.user)

    if txn.status == Transaction.Status.SUCCESS:
        return Response({'detail': 'Payment already confirmed.'})

    with db_transaction.atomic():
        txn.status = Transaction.Status.SUCCESS
        txn.completed_at = timezone.now()
        txn.save()

        order = txn.order
        order.status = Order.Status.PAID
        order.save()

        enrollment, _created = Enrollment.objects.get_or_create(
            student=request.user, course=order.course,
        )

    log_action(request.user, AuditLog.Action.PURCHASE, target=order, course=order.course.title)
    log_action(request.user, AuditLog.Action.ENROLLMENT, target=enrollment, course=order.course.title)

    return Response({
        'order': OrderSerializer(order).data,
        'enrollment': EnrollmentSerializer(enrollment).data,
    })


# ---- Student: enrolled courses + progress ----------------------------------

@api_view(['GET'])
@permission_classes([IsStudent, IsNotSuspended])
def my_enrollments(request):
    qs = Enrollment.objects.filter(student=request.user).select_related('course')
    return Response(EnrollmentSerializer(qs, many=True).data)


@api_view(['POST'])
@permission_classes([IsStudent, IsNotSuspended])
def complete_lesson(request, lesson_id):
    lesson = get_object_or_404(Lesson, pk=lesson_id)
    course = lesson.module.course

    if not Enrollment.objects.filter(student=request.user, course=course).exists():
        return Response(
            {'detail': 'You must be enrolled in this course to track lesson progress.'},
            status=status.HTTP_403_FORBIDDEN,
        )

    progress, created = LessonProgress.objects.get_or_create(student=request.user, lesson=lesson)
    return Response(
        LessonProgressSerializer(progress).data,
        status=status.HTTP_201_CREATED if created else status.HTTP_200_OK,
    )


@api_view(['GET'])
@permission_classes([IsStudent, IsNotSuspended])
def course_progress(request, course_id):
    course = get_object_or_404(Course.objects.active(), pk=course_id)
    if not Enrollment.objects.filter(student=request.user, course=course).exists():
        return Response({'detail': 'Not enrolled in this course.'}, status=status.HTTP_403_FORBIDDEN)

    total_lessons = Lesson.objects.filter(module__course=course).count()
    completed = LessonProgress.objects.filter(
        student=request.user, lesson__module__course=course,
    ).values_list('lesson_id', flat=True)

    return Response({
        'course': course_id,
        'total_lessons': total_lessons,
        'completed_lesson_ids': list(completed),
        'completed_count': len(completed),
        'percent_complete': round(len(completed) / total_lessons * 100, 1) if total_lessons else 0,
    })


# ---- Instructor: view enrolled students -------------------------------------

@api_view(['GET'])
@permission_classes([IsInstructor, IsNotSuspended])
def course_enrolled_students(request, course_id):
    course = get_object_or_404(Course.objects.active(), pk=course_id)
    checker = IsCourseOwner()
    if not checker.has_object_permission(request, None, course):
        return Response({'detail': checker.message}, status=status.HTTP_403_FORBIDDEN)

    qs = Enrollment.objects.filter(course=course).select_related('student')
    return Response(EnrolledStudentSerializer(qs, many=True).data)


