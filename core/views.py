from rest_framework import viewsets, status, permissions
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.authtoken.models import Token
from django.contrib.auth import login, logout
from django.db.models import Q
from django.contrib.auth import get_user_model
from .models import Notification
from .serializers import (
    UserSerializer, UserProfileSerializer, LoginSerializer, 
    RegisterSerializer, NotificationSerializer
)

User = get_user_model()


class UserViewSet(viewsets.ModelViewSet):
    """
    ViewSet para gerenciamento de usuários
    """
    queryset = User.objects.all()
    serializer_class = UserSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        user = self.request.user
        if user.is_authenticated and getattr(user, 'role', None) == 'admin':
            return User.objects.all()
        elif user.is_authenticated:
            return User.objects.filter(pk=user.pk)
        return User.objects.none()
    
    def get_serializer_class(self):
        if self.action in ['retrieve', 'update', 'partial_update']:
            return UserProfileSerializer
        return UserSerializer


class NotificationViewSet(viewsets.ModelViewSet):
    """
    ViewSet para notificações
    """
    queryset = Notification.objects.all()
    serializer_class = NotificationSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        user = self.request.user
        if user.is_authenticated:
            return Notification.objects.filter(user=user)
        return Notification.objects.none()
    
    def perform_create(self, serializer):
        serializer.save(user=self.request.user)
    
    @action(detail=True, methods=['post'])
    def mark_as_read(self, request, pk=None):
        """
        Marca uma notificação como lida
        """
        notification = self.get_object()
        notification.is_read = True
        notification.save()
        return Response({'status': 'marked as read'})
    
    @action(detail=False, methods=['post'])
    def mark_all_as_read(self, request):
        """
        Marca todas as notificações como lidas
        """
        self.get_queryset().update(is_read=True)
        return Response({'status': 'all marked as read'})


class AuthViewSet(viewsets.ViewSet):
    """
    ViewSet para autenticação
    """
    permission_classes = [permissions.AllowAny]
    
    @action(detail=False, methods=['post'])
    def login(self, request):
        """
        Login do usuário
        """
        serializer = LoginSerializer(data=request.data)
        if serializer.is_valid():
            # Temporary fix for type checking
            validated_data = serializer.validated_data
            user = validated_data.get('user') if validated_data else None
            if user:
                token, created = Token.objects.get_or_create(user=user)
                login(request, user)
                
                return Response({
                    'token': token.key,
                    'user': UserProfileSerializer(user).data
                })
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    @action(detail=False, methods=['post'])
    def logout(self, request):
        """
        Logout do usuário
        """
        if request.user.is_authenticated:
            try:
                Token.objects.get(user=request.user).delete()
            except Token.DoesNotExist:
                pass
            logout(request)
        return Response({'status': 'logged out'})
    
    @action(detail=False, methods=['post'])
    def register(self, request):
        """
        Registro de novo usuário
        """
        serializer = RegisterSerializer(data=request.data)
        if serializer.is_valid():
            user = serializer.save()
            token, created = Token.objects.get_or_create(user=user)
            
            return Response({
                'token': token.key,
                'user': UserProfileSerializer(user).data
            }, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    @action(detail=False, methods=['get', 'patch'], permission_classes=[permissions.IsAuthenticated])
    def profile(self, request):
        """
        Visualizar e atualizar perfil do usuário
        """
        if request.method == 'GET':
            serializer = UserProfileSerializer(request.user)
            return Response(serializer.data)
        
        elif request.method == 'PATCH':
            serializer = UserProfileSerializer(request.user, data=request.data, partial=True)
            if serializer.is_valid():
                serializer.save()
                return Response(serializer.data)
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
