from rest_framework import serializers

from .models import Category, Course, LearningObjective, Lesson, Module


class CategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = Category
        fields = ['id', 'name', 'slug']
        read_only_fields = ['slug']


class LearningObjectiveSerializer(serializers.ModelSerializer):
    class Meta:
        model = LearningObjective
        fields = ['id', 'text', 'order']


class LessonSerializer(serializers.ModelSerializer):
    class Meta:
        model = Lesson
        fields = ['id', 'module', 'title', 'content', 'order']
        read_only_fields = ['module']


class ModuleSerializer(serializers.ModelSerializer):
    lessons = LessonSerializer(many=True, read_only=True)

    class Meta:
        model = Module
        fields = ['id', 'course', 'title', 'order', 'lessons']
        read_only_fields = ['course']


class CourseListSerializer(serializers.ModelSerializer):
    """Lightweight — used for browse/list views."""
    instructor_name = serializers.CharField(source='instructor.username', read_only=True)
    category_name = serializers.CharField(source='category.name', read_only=True, default=None)

    class Meta:
        model = Course
        fields = [
            'id', 'title', 'slug', 'price', 'thumbnail', 'is_published',
            'instructor', 'instructor_name', 'category', 'category_name',
            'created_at',
        ]


class CourseDetailSerializer(serializers.ModelSerializer):
    """Full nested representation — used for a single course's detail view."""
    instructor_name = serializers.CharField(source='instructor.username', read_only=True)
    objectives = LearningObjectiveSerializer(many=True, read_only=True)
    modules = ModuleSerializer(many=True, read_only=True)

    class Meta:
        model = Course
        fields = [
            'id', 'title', 'slug', 'description', 'price', 'thumbnail',
            'category', 'instructor', 'instructor_name', 'is_published',
            'objectives', 'modules', 'created_at', 'updated_at',
        ]


class CourseWriteSerializer(serializers.ModelSerializer):
    """Used for create/update — instructor is set from request.user, not
    accepted from the client, so it can't be spoofed."""

    class Meta:
        model = Course
        fields = ['id', 'title', 'description', 'category', 'price', 'thumbnail', 'is_published']
