from django.contrib import admin

from .models import Enrollment, LessonProgress, Order, Transaction


@admin.register(Order)
class OrderAdmin(admin.ModelAdmin):
    list_display = ['id', 'student', 'course', 'status', 'price_at_purchase', 'created_at']
    list_filter = ['status']


@admin.register(Transaction)
class TransactionAdmin(admin.ModelAdmin):
    list_display = ['reference', 'order', 'status', 'completed_at']
    list_filter = ['status']


admin.site.register(Enrollment)
admin.site.register(LessonProgress)
