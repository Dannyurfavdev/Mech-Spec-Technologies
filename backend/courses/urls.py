from django.urls import path

from . import views

urlpatterns = [
    path('categories/', views.list_categories, name='list-categories'),
    path('', views.browse_courses, name='browse-courses'),
    path('<int:course_id>/', views.course_detail, name='course-detail'),

    path('instructor/courses/', views.instructor_courses, name='instructor-courses'),
    path('instructor/courses/<int:course_id>/', views.instructor_course_detail, name='instructor-course-detail'),

    path('instructor/courses/<int:course_id>/objectives/', views.add_learning_objective, name='add-objective'),
    path(
        'instructor/courses/<int:course_id>/objectives/<int:objective_id>/',
        views.delete_learning_objective, name='delete-objective',
    ),

    path('instructor/courses/<int:course_id>/modules/', views.add_module, name='add-module'),
    path('instructor/courses/<int:course_id>/modules/<int:module_id>/', views.module_detail, name='module-detail'),

    path(
        'instructor/courses/<int:course_id>/modules/<int:module_id>/lessons/',
        views.add_lesson, name='add-lesson',
    ),
    path(
        'instructor/courses/<int:course_id>/modules/<int:module_id>/lessons/<int:lesson_id>/',
        views.lesson_detail, name='lesson-detail',
    ),

    path('admin/courses/', views.admin_list_courses, name='admin-list-courses'),
    path('admin/courses/<int:course_id>/remove/', views.admin_remove_course, name='admin-remove-course'),
    path('admin/courses/<int:course_id>/restore/', views.admin_restore_course, name='admin-restore-course'),
]
