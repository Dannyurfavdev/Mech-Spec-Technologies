from django.contrib.auth.password_validation import validate_password
from rest_framework import serializers

from .models import InstructorProfile, User


class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'role', 'is_suspended', 'created_at']
        read_only_fields = ['id', 'is_suspended', 'created_at']


class RegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, validators=[validate_password])

    class Meta:
        model = User
        fields = ['username', 'email', 'password', 'role']

    def validate_role(self, value):
        # Prevent self-registration as admin — admins are created via
        # createsuperuser or promoted by an existing admin, never via the
        # public registration endpoint.
        if value == User.Role.ADMIN:
            raise serializers.ValidationError('Cannot self-register as administrator.')
        return value

    def create(self, validated_data):
        user = User.objects.create_user(
            username=validated_data['username'],
            email=validated_data.get('email', ''),
            password=validated_data['password'],
            role=validated_data.get('role', User.Role.STUDENT),
        )
        return user


class InstructorProfileSerializer(serializers.ModelSerializer):
    class Meta:
        model = InstructorProfile
        fields = ['id', 'bio', 'title', 'profile_picture']
