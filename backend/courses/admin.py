from django.contrib import admin

from .models import Category, Course, LearningObjective, Lesson, Module


class ModuleInline(admin.TabularInline):
    model = Module
    extra = 0


@admin.register(Course)
class CourseAdmin(admin.ModelAdmin):
    list_display = ['title', 'instructor', 'price', 'is_published', 'is_removed', 'created_at']
    list_filter = ['is_published', 'is_removed', 'category']
    search_fields = ['title', 'instructor__username']
    inlines = [ModuleInline]


admin.site.register(Category)
admin.site.register(LearningObjective)
admin.site.register(Module)
admin.site.register(Lesson)
