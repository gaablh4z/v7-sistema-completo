# core/views.py - Views consolidadas do sistema
from django.shortcuts import render, redirect, get_object_or_404
from django.contrib.auth import login, authenticate, logout
from django.contrib.auth.decorators import login_required, user_passes_test
from django.contrib import messages
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_protect
from django.views.decorators.http import require_http_methods
from django.db.models import Count, Sum, Q
from django.utils import timezone
from django.contrib.auth import get_user_model
from datetime import datetime, timedelta, date
import json
import re

from rest_framework import viewsets, status, permissions
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny
from rest_framework.response import Response

from .models import User, Notification, GalleryImage, ServiceImage, HeroImage, ServiceIcon
from vehicles.models import Vehicle
from services.models import Service, ServiceCategory
from appointments.models import Appointment
from inventory.models import Product
from .serializers import (
    UserSerializer, UserProfileSerializer, LoginSerializer, 
    RegisterSerializer, NotificationSerializer
)
from .forms import RegistrationForm

User = get_user_model()


# ===== VIEWS PÚBLICAS =====

@api_view(['GET'])
@permission_classes([AllowAny])
def api_status(request):
    """Status da API e estatísticas básicas"""
    try:
        stats = {
            'status': 'online',
            'message': 'AutoV7 Backend API está funcionando!',
            'version': '1.0.0',
            'django_version': '5.2.6',
            'statistics': {
                'total_users': User.objects.count(),
                'total_vehicles': Vehicle.objects.count(),
                'total_services': Service.objects.count(),
                'total_appointments': Appointment.objects.count(),
                'total_products': Product.objects.count(),
            },
            'endpoints': {
                'admin': '/admin/',
                'auth': '/api/auth/',
                'api_status': '/api/status/',
            }
        }
        return Response(stats)
    except Exception as e:
        return Response({
            'status': 'error',
            'message': str(e)
        }, status=500)


def home_view(request):
    """Página inicial com imagens dinâmicas"""
    gallery_images = GalleryImage.objects.filter(ativa=True).order_by('ordem', '-criada_em')[:8]
    service_images = ServiceImage.objects.filter(ativa=True).order_by('ordem', '-criada_em')
    hero_images = HeroImage.objects.filter(ativa=True).order_by('ordem', '-criada_em').first()
    service_icons = ServiceIcon.objects.filter(ativo=True).order_by('ordem', '-criado_em')
    featured_gallery = GalleryImage.objects.filter(ativa=True, destacada=True).order_by('ordem', '-criada_em')[:4]
    
    context = {
        'title': 'AutoV7 - Estética Automotiva',
        'message': 'Estética Automotiva de Qualidade Premium',
        'gallery_images': gallery_images,
        'service_images': service_images,
        'hero_image': hero_images,
        'featured_gallery': featured_gallery,
        'service_icons': service_icons,
    }
    return render(request, 'home.html', context)


def sobre_view(request):
    """Página Sobre"""
    gallery_images = GalleryImage.objects.filter(ativa=True).order_by('ordem', '-criada_em')[:8]
    context = {
        'title': 'Sobre - Estética Automotiva V7',
        'gallery_images': gallery_images,
    }
    return render(request, 'sobre.html', context)


# ===== AUTENTICAÇÃO =====

@csrf_protect
def custom_logout_view(request):
    """Logout personalizado"""
    if request.user.is_authenticated:
        user_name = request.user.first_name
        logout(request)
        if user_name:
            messages.success(request, f'Até logo, {user_name}! Você foi desconectado com sucesso.')
        else:
            messages.success(request, 'Você foi desconectado com sucesso.')
    return redirect('/')


@csrf_protect
def register_view(request):
    """Registro de usuários"""
    if request.user.is_authenticated:
        return redirect('/dashboard/')
    
    if request.method == 'POST':
        form = RegistrationForm(request.POST)
        if form.is_valid():
            try:
                user = form.save()
                login(request, user)
                messages.success(request, f'Bem-vindo, {user.first_name}! Sua conta foi criada com sucesso.')
                return redirect('/dashboard/')
            except Exception as e:
                messages.error(request, f'Erro ao criar conta: {str(e)}')
        else:
            for field, errors in form.errors.items():
                for error in errors:
                    messages.error(request, f'{field}: {error}')
    else:
        form = RegistrationForm()
    
    return render(request, 'auth/register.html', {'form': form})


@csrf_protect
def login_view(request):
    """Login personalizado"""
    if request.user.is_authenticated:
        return redirect('/dashboard/')
    
    if request.method == 'POST':
        username = request.POST.get('username', '')
        password = request.POST.get('password', '')
        
        if username and password:
            user = authenticate(request, username=username, password=password)
            if user is not None:
                login(request, user)
                messages.success(request, f'Bem-vindo, {user.first_name}!')
                return redirect('/dashboard/')
            else:
                messages.error(request, 'Credenciais inválidas.')
        else:
            messages.error(request, 'Por favor, preencha todos os campos.')
    
    return render(request, 'auth/login.html')


# ===== DASHBOARD CLIENTE =====

@login_required
def dashboard_home(request):
    """Dashboard principal do cliente"""
    user = request.user
    user_vehicles = Vehicle.objects.filter(usuario=user).count()
    user_appointments = Appointment.objects.filter(usuario=user).count()
    completed_appointments = Appointment.objects.filter(usuario=user, situacao='completed').count()
    
    upcoming_appointments = Appointment.objects.filter(
        usuario=user,
        data_agendamento__gte=timezone.now().date()
    ).order_by('data_agendamento', 'horario_agendamento')[:3]
    
    recent_vehicles = Vehicle.objects.filter(usuario=user).order_by('-criado_em')[:3]
    
    context = {
        'user_vehicles': user_vehicles,
        'user_appointments': user_appointments,
        'completed_appointments': completed_appointments,
        'upcoming_appointments': upcoming_appointments,
        'recent_vehicles': recent_vehicles,
        'loyalty_points': user.pontos_fidelidade,
        'average_rating': user.avaliacao_media,
        'total_services': user.total_servicos,
    }
    
    return render(request, 'dashboard/home.html', context)


@login_required
def vehicles_page(request):
    """Página de gerenciamento de veículos"""
    if request.method == 'POST':
        return handle_vehicle_form(request)
    
    user_vehicles = Vehicle.objects.filter(usuario=request.user).order_by('-criado_em')
    
    context = {
        'vehicles': user_vehicles,
        'total_vehicles': user_vehicles.count(),
        'vehicle_categories_choices': Vehicle.CATEGORY_CHOICES,
    }
    
    return render(request, 'dashboard/vehicles.html', context)


@login_required
def profile_page(request):
    """Página de perfil do usuário"""
    if request.method == 'POST':
        user = request.user
        user.first_name = request.POST.get('first_name', user.first_name)
        user.last_name = request.POST.get('last_name', user.last_name)
        user.email = request.POST.get('email', user.email)
        user.telefone = request.POST.get('telefone', user.telefone)
        user.endereco = request.POST.get('endereco', user.endereco)
        
        if 'foto_perfil' in request.FILES:
            user.foto_perfil = request.FILES['foto_perfil']
        
        user.save()
        messages.success(request, 'Perfil atualizado com sucesso!')
        return redirect('/dashboard/profile/')
    
    return render(request, 'dashboard/profile.html', {'user': request.user})


@login_required
def appointments_page(request):
    """Página de histórico de agendamentos"""
    user_appointments = Appointment.objects.filter(
        usuario=request.user
    ).select_related('veiculo', 'usuario').order_by('-criado_em')
    
    status_filter = request.GET.get('status')
    if status_filter:
        user_appointments = user_appointments.filter(situacao=status_filter)
    
    context = {
        'appointments': user_appointments,
        'total_appointments': user_appointments.count(),
        'completed_appointments': user_appointments.filter(situacao='completed').count(),
        'pending_appointments': user_appointments.filter(situacao='pending').count(),
        'status_choices': Appointment.STATUS_CHOICES,
    }
    
    return render(request, 'dashboard/appointments.html', context)


# ===== FUNÇÕES AUXILIARES =====

def handle_vehicle_form(request):
    """Processa formulário de veículo"""
    try:
        data = request.POST
        vehicle_id = data.get('vehicle_id')
        
        marca = data.get('marca', '').strip()
        modelo = data.get('modelo', '').strip()
        placa = data.get('placa', '').strip().upper()
        ano_str = data.get('ano', '').strip()
        
        if not all([marca, modelo, placa, ano_str]):
            messages.error(request, 'Marca, modelo, placa e ano são obrigatórios.')
            return redirect('vehicles_page')
        
        try:
            ano = int(ano_str)
            if ano < 1900 or ano > 2030:
                raise ValueError("Ano inválido")
        except (ValueError, TypeError):
            messages.error(request, 'Ano deve ser um número válido entre 1900 e 2030.')
            return redirect('vehicles_page')
        
        placa_clean = re.sub(r'[^A-Z0-9]', '', placa)
        if not re.match(r'^[A-Z]{3}[0-9]{4}$|^[A-Z]{3}[0-9][A-Z][0-9]{2}$', placa_clean):
            messages.error(request, 'Formato de placa inválido. Use ABC1234 ou ABC1D23.')
            return redirect('vehicles_page')
        
        quilometragem = data.get('quilometragem', '').strip()
        if quilometragem:
            try:
                quilometragem = int(quilometragem)
                if quilometragem < 0:
                    raise ValueError("Quilometragem não pode ser negativa")
            except (ValueError, TypeError):
                messages.error(request, 'Quilometragem deve ser um número válido.')
                return redirect('vehicles_page')
        else:
            quilometragem = None
        
        vehicle_data = {
            'marca': marca,
            'modelo': modelo,
            'ano': ano,
            'cor': data.get('cor', '').strip(),
            'placa': placa_clean,
            'categoria': data.get('categoria', 'sedan'),
            'quilometragem': quilometragem,
        }
        
        if vehicle_id:
            vehicle = get_object_or_404(Vehicle, id=vehicle_id, usuario=request.user)
            for key, value in vehicle_data.items():
                setattr(vehicle, key, value)
            vehicle.save()
            messages.success(request, 'Veículo atualizado com sucesso!')
        else:
            if Vehicle.objects.filter(placa=placa_clean).exists():
                messages.error(request, f'Já existe um veículo cadastrado com a placa {placa_clean}.')
                return redirect('vehicles_page')
            
            vehicle_data['usuario'] = request.user
            Vehicle.objects.create(**vehicle_data)
            messages.success(request, 'Veículo adicionado com sucesso!')
        
        return redirect('vehicles_page')
        
    except Exception as e:
        print(f"Erro ao salvar veículo: {str(e)}")
        messages.error(request, f'Erro ao salvar veículo: {str(e)}')
        return redirect('vehicles_page')


# ===== API REST =====


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
