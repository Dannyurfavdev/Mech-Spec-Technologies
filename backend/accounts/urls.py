from django.urls import path
from rest_framework_simplejwt.views import TokenRefreshView

from . import views

urlpatterns = [
    path('register/', views.register, name='register'),
    path('login/', views.login, name='login'),
    path('login/refresh/', TokenRefreshView.as_view(), name='login-refresh'),
    path('logout/', views.logout, name='logout'),
    path('me/', views.me, name='me'),
    path('instructor/profile/', views.instructor_profile, name='instructor-profile'),

    path('admin/users/', views.admin_list_users, name='admin-list-users'),
    path('admin/users/<int:user_id>/suspend/', views.admin_suspend_user, name='admin-suspend-user'),
    path('admin/users/<int:user_id>/activate/', views.admin_activate_user, name='admin-activate-user'),
    path('admin/stats/', views.admin_platform_stats, name='admin-platform-stats'),
]
