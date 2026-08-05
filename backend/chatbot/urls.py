from django.urls import path

from . import views

urlpatterns = [
    path('ask/', views.ask, name='chatbot-ask'),
    path('faqs/', views.list_faqs, name='chatbot-faqs'),
]
