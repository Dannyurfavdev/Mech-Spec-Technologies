from rest_framework import serializers

from accounts.serializers import UserSerializer
from courses.serializers import CourseListSerializer

from .models import Enrollment, LessonProgress, Order, Transaction


class OrderSerializer(serializers.ModelSerializer):
    course_detail = CourseListSerializer(source='course', read_only=True)

    class Meta:
        model = Order
        fields = ['id', 'course', 'course_detail', 'price_at_purchase', 'status', 'created_at']
        read_only_fields = ['price_at_purchase', 'status', 'created_at']


class TransactionSerializer(serializers.ModelSerializer):
    class Meta:
        model = Transaction
        fields = ['id', 'order', 'reference', 'status', 'completed_at']
        read_only_fields = fields


class EnrollmentSerializer(serializers.ModelSerializer):
    course_detail = CourseListSerializer(source='course', read_only=True)

    class Meta:
        model = Enrollment
        fields = ['id', 'course', 'course_detail', 'enrolled_at']
        read_only_fields = fields


class EnrolledStudentSerializer(serializers.ModelSerializer):
    """Used on the instructor's 'view enrolled students' endpoint."""
    student = UserSerializer(read_only=True)

    class Meta:
        model = Enrollment
        fields = ['id', 'student', 'enrolled_at']


class LessonProgressSerializer(serializers.ModelSerializer):
    class Meta:
        model = LessonProgress
        fields = ['id', 'lesson', 'completed_at']
        read_only_fields = ['completed_at']
