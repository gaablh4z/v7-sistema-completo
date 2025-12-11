# core/dashboard_urls.py
from django.urls import path
from . import dashboard_views

urlpatterns = [
    # Dashboard principal
    path('', dashboard_views.dashboard_home, name='dashboard_home'),
    
    # Páginas do dashboard
    path('booking/', dashboard_views.booking_page, name='booking_page'),
    path('booking-old/', dashboard_views.booking_page_old, name='booking_page_old'),
    path('vehicles/', dashboard_views.vehicles_page, name='vehicles_page'),
    path('appointments/', dashboard_views.appointments_page, name='appointments_page'),
    path('profile/', dashboard_views.profile_page, name='profile_page'),
    path('change-password/', dashboard_views.change_password, name='change_password'),
    
    # APIs AJAX
    path('api/time-slots/', dashboard_views.get_time_slots, name='get_time_slots'),
    path('api/calendar-availability/', dashboard_views.get_calendar_availability, name='get_calendar_availability'),
    path('api/available-time-slots/', dashboard_views.get_time_slots, name='get_available_time_slots'),
    path('api/vehicle/<int:vehicle_id>/delete/', dashboard_views.delete_vehicle, name='delete_vehicle'),
    path('api/appointment/<int:appointment_id>/cancel/', dashboard_views.cancel_appointment, name='cancel_appointment'),
    path('api/stats/', dashboard_views.dashboard_stats, name='dashboard_stats'),
    path('api/change-password/', dashboard_views.change_password, name='change_password'),
]
