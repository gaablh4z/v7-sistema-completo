"""
URL configuration for autov7_backend project.
"""
from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static
from django.contrib.auth import views as auth_views
from core.home_views import home_view, sobre_view, api_status
from core.favicon_view import favicon_view
from core.auth_views import custom_login_view, custom_logout_view
from core.admin import admin_site  # Importa o site admin customizado

urlpatterns = [
    path('', home_view, name='home'),
    path('sobre/', sobre_view, name='sobre'),
    path('favicon.ico', favicon_view, name='favicon'),
    path('admin/', admin_site.urls),  # Usa o site admin customizado
    path('api/status/', api_status, name='api_status'),
    path('api/auth/', include('core.urls')),
    
    # Auth URLs - Login customizado
    path('accounts/login/', custom_login_view, name='login'),
    path('accounts/logout/', custom_logout_view, name='logout'),
    path('accounts/', include('core.auth_urls')),
    
    # Dashboard do cliente
    path('dashboard/', include('core.dashboard_urls')),
    
    # Dashboard administrativo (nova interface)
    path('admin-panel/', include(('core.admin_new_urls', 'admin_new'), namespace='admin_new')),
    
    # path('api/vehicles/', include('vehicles.urls')),
    # path('api/appointments/', include('appointments.urls')),
    # path('api/services/', include('services.urls')),
    # path('api/inventory/', include('inventory.urls')),
]

# Serve media files in development
if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
    urlpatterns += static(settings.STATIC_URL, document_root=settings.STATIC_ROOT)
