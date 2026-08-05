from django.urls import path

from . import views

urlpatterns = [
    path('checkout/', views.checkout, name='checkout'),
    path('payments/<uuid:reference>/confirm/', views.confirm_payment, name='confirm-payment'),

    path('my-enrollments/', views.my_enrollments, name='my-enrollments'),
    path('lessons/<int:lesson_id>/complete/', views.complete_lesson, name='complete-lesson'),
    path('courses/<int:course_id>/progress/', views.course_progress, name='course-progress'),

    path(
        'instructor/courses/<int:course_id>/students/',
        views.course_enrolled_students, name='course-enrolled-students',
    ),
]
