# core/auth_urls.py
from django.urls import path
from . import auth_views

urlpatterns = [
    path('register/', auth_views.register_view, name='register'),
    path('check-email/', auth_views.check_email_availability, name='check_email'),
    path('validate-password/', auth_views.validate_password_strength, name='validate_password'),
]