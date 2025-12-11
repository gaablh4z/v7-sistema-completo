from django.http import JsonResponse
from django.shortcuts import render, redirect
from django.views.decorators.csrf import csrf_exempt
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from django.contrib.auth import get_user_model
from vehicles.models import Vehicle
from services.models import Service
from appointments.models import Appointment
from inventory.models import Product
from .models import GalleryImage, ServiceImage, HeroImage, HeroBackground, ServiceIcon

User = get_user_model()


@api_view(['GET'])
@permission_classes([AllowAny])
def api_status(request):
    """
    Status da API e estatísticas básicas
    """
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
    """
    Página inicial com imagens dinâmicas do banco de dados
    Disponível para todos os usuários (autenticados ou não)
    """
    # Buscar imagens ativas
    gallery_images = GalleryImage.objects.filter(ativa=True).order_by('ordem', '-criada_em')[:8]
    service_images = ServiceImage.objects.filter(ativa=True).order_by('ordem', '-criada_em')
    hero_images = HeroImage.objects.filter(ativa=True).order_by('ordem', '-criada_em').first()
    hero_background = HeroBackground.objects.filter(ativa=True).order_by('ordem', '-criada_em').first()
    service_icons = ServiceIcon.objects.filter(ativo=True).order_by('ordem', '-criado_em')
    
    # Buscar imagens destacadas separadamente (campos em português)
    featured_gallery = GalleryImage.objects.filter(ativa=True, destacada=True).order_by('ordem', '-criada_em')[:4]
    
    # Organizar imagens de serviços por tipo
    services_by_type = {}
    for service_img in service_images:
        if service_img.tipo_servico not in services_by_type:    
            services_by_type[service_img.tipo_servico] = []
        services_by_type[service_img.tipo_servico].append(service_img)
    
    context = {
        'title': 'AutoV7 - Estética Automotiva',
        'message': 'Estética Automotiva de Qualidade Premium',
        'version': '1.0.0',
        'gallery_images': gallery_images,
        'service_images': service_images,
        'services_by_type': services_by_type,
        'hero_image': hero_images,
        'hero_background': hero_background,
        'featured_gallery': featured_gallery,
        'service_icons': service_icons,
    }
    return render(request, 'home.html', context)


def sobre_view(request):
    """
    Página Sobre com informações da empresa e galeria de imagens
    """
    # Buscar imagens da galeria para exibir na página sobre
    gallery_images = GalleryImage.objects.filter(ativa=True).order_by('ordem', '-criada_em')[:8]
    
    context = {
        'title': 'Sobre - Estética Automotiva V7',
        'gallery_images': gallery_images,
    }
    return render(request, 'sobre.html', context)
