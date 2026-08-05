from django.shortcuts import get_object_or_404
from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework_simplejwt.exceptions import TokenError
from rest_framework_simplejwt.tokens import RefreshToken

from logs.models import AuditLog
from logs.utils import log_action

from .models import InstructorProfile, User
from .permissions import IsAdmin, IsInstructor, IsNotSuspended
from .serializers import InstructorProfileSerializer, RegisterSerializer, UserSerializer


@api_view(['POST'])
@permission_classes([AllowAny])
def register(request):
    serializer = RegisterSerializer(data=request.data)
    serializer.is_valid(raise_exception=True)
    user = serializer.save()
    log_action(user, AuditLog.Action.REGISTER, target=user, role=user.role)
    return Response(UserSerializer(user).data, status=status.HTTP_201_CREATED)


@api_view(['POST'])
@permission_classes([AllowAny])
def login(request):
    username = request.data.get('username')
    password = request.data.get('password')
    if not username or not password:
        return Response(
            {'detail': 'username and password are required.'},
            status=status.HTTP_400_BAD_REQUEST,
        )

    user = User.objects.filter(username=username).first()
    if user is None or not user.check_password(password):
        return Response({'detail': 'Invalid credentials.'}, status=status.HTTP_401_UNAUTHORIZED)

    if user.is_suspended:
        return Response(
            {'detail': 'This account has been suspended.'},
            status=status.HTTP_403_FORBIDDEN,
        )

    refresh = RefreshToken.for_user(user)
    log_action(user, AuditLog.Action.LOGIN, target=user)

    return Response({
        'access': str(refresh.access_token),
        'refresh': str(refresh),
        'user': UserSerializer(user).data,
    })


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def logout(request):
    """Blacklists the supplied refresh token so it can no longer be used
    to mint new access tokens — this is what makes logout 'secure' rather
    than just discarding the token client-side."""
    refresh_token = request.data.get('refresh')
    if not refresh_token:
        return Response(
            {'detail': 'refresh token is required.'},
            status=status.HTTP_400_BAD_REQUEST,
        )
    try:
        token = RefreshToken(refresh_token)
        token.blacklist()
    except TokenError:
        return Response({'detail': 'Invalid or expired token.'}, status=status.HTTP_400_BAD_REQUEST)

    log_action(request.user, AuditLog.Action.LOGOUT, target=request.user)
    return Response(status=status.HTTP_205_RESET_CONTENT)


@api_view(['GET', 'PATCH'])
@permission_classes([IsAuthenticated, IsNotSuspended])
def me(request):
    """Get or partially update the logged-in user's own basic info."""
    if request.method == 'GET':
        return Response(UserSerializer(request.user).data)

    serializer = UserSerializer(request.user, data=request.data, partial=True)
    serializer.is_valid(raise_exception=True)
    serializer.save()
    return Response(serializer.data)


@api_view(['GET', 'PUT'])
@permission_classes([IsInstructor, IsNotSuspended])
def instructor_profile(request):
    """Get or create/update the logged-in instructor's profile."""
    profile, _created = InstructorProfile.objects.get_or_create(user=request.user)

    if request.method == 'GET':
        return Response(InstructorProfileSerializer(profile).data)

    serializer = InstructorProfileSerializer(profile, data=request.data, partial=True)
    serializer.is_valid(raise_exception=True)
    serializer.save()
    return Response(serializer.data)


# ---- Admin: user management --------------------------------------------------

@api_view(['GET'])
@permission_classes([IsAdmin])
def admin_list_users(request):
    """?role=student|instructor|admin optional filter."""
    qs = User.objects.all().order_by('-created_at')
    role = request.query_params.get('role')
    if role:
        qs = qs.filter(role=role)
    return Response(UserSerializer(qs, many=True).data)


@api_view(['POST'])
@permission_classes([IsAdmin])
def admin_suspend_user(request, user_id):
    user = get_object_or_404(User, pk=user_id)
    if user.role == User.Role.ADMIN:
        return Response({'detail': 'Cannot suspend another administrator.'}, status=status.HTTP_400_BAD_REQUEST)
    user.is_suspended = True
    user.save(update_fields=['is_suspended'])
    log_action(request.user, AuditLog.Action.ADMIN_ACTION, target=user, action_taken='suspend_user')
    return Response(UserSerializer(user).data)


@api_view(['POST'])
@permission_classes([IsAdmin])
def admin_activate_user(request, user_id):
    user = get_object_or_404(User, pk=user_id)
    user.is_suspended = False
    user.save(update_fields=['is_suspended'])
    log_action(request.user, AuditLog.Action.ADMIN_ACTION, target=user, action_taken='activate_user')
    return Response(UserSerializer(user).data)


# ---- Admin: platform statistics ----------------------------------------------

@api_view(['GET'])
@permission_classes([IsAdmin])
def admin_platform_stats(request):
    # Imported here (not at module top) to avoid a circular import, since
    # courses/enrollments don't need to import accounts.views themselves.
    from courses.models import Course
    from enrollments.models import Enrollment, Order

    return Response({
        'users': {
            'total': User.objects.count(),
            'students': User.objects.filter(role=User.Role.STUDENT).count(),
            'instructors': User.objects.filter(role=User.Role.INSTRUCTOR).count(),
            'admins': User.objects.filter(role=User.Role.ADMIN).count(),
            'suspended': User.objects.filter(is_suspended=True).count(),
        },
        'courses': {
            'total_active': Course.objects.active().count(),
            'published': Course.objects.published().count(),
            'removed': Course.objects.filter(is_removed=True).count(),
        },
        'enrollments': {
            'total': Enrollment.objects.count(),
        },
        'orders': {
            'total': Order.objects.count(),
            'paid': Order.objects.filter(status=Order.Status.PAID).count(),
            'pending': Order.objects.filter(status=Order.Status.PENDING).count(),
        },
    })
