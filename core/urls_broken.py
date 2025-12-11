from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import UserViewSet, NotificationViewSet, AuthViewSet

router = DefaultRouter()
router.register(r'users', UserViewSet)
router.register(r'notifications', NotificationViewSet)

urlpatterns = [
    path('', include(router.urls)),
    path('login/', AuthViewSet.as_view({'post': 'login'}), name='login'),
    path('logout/', AuthViewSet.as_view({'post': 'logout'}), name='logout'),
    path('register/', AuthViewSet.as_view({'post': 'register'}), name='register'),
    path('profile/', AuthViewSet.as_view({'get': 'profile', 'patch': 'profile'}), name='profile'),
]
