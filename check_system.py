#!/usr/bin/env python
"""
Script de verificação do sistema AutoV7
Verifica se todas as funcionalidades estão operacionais
"""

import os
import sys
import django
from pathlib import Path

# Configurar Django
sys.path.append(os.path.dirname(__file__))
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'autov7_backend.settings')
django.setup()

from django.core.management import call_command
from django.contrib.auth import get_user_model
from django.test import Client
from django.urls import reverse
from core.models import User, Notification
from vehicles.models import Vehicle, VehicleImage
from services.models import Service, ServiceIcon
from appointments.models import Appointment, Holiday
from inventory.models import Product, Category, Supplier

def print_status(message, status="INFO"):
    """Imprime status com cores"""
    colors = {
        "OK": "\033[92m✓\033[0m",
        "ERROR": "\033[91m✗\033[0m", 
        "WARNING": "\033[93m⚠\033[0m",
        "INFO": "\033[94mℹ\033[0m"
    }
    print(f"{colors.get(status, '')} {message}")

def check_database():
    """Verifica se o banco de dados está acessível"""
    try:
        # Verificar se conseguimos fazer queries básicas
        user_count = User.objects.count()
        vehicle_count = Vehicle.objects.count()
        service_count = Service.objects.count()
        appointment_count = Appointment.objects.count()
        
        print_status("Banco de dados acessível", "OK")
        print_status(f"Usuários: {user_count}", "INFO")
        print_status(f"Veículos: {vehicle_count}", "INFO") 
        print_status(f"Serviços: {service_count}", "INFO")
        print_status(f"Agendamentos: {appointment_count}", "INFO")
        return True
    except Exception as e:
        print_status(f"Erro no banco de dados: {e}", "ERROR")
        return False

def check_models():
    """Verifica se todos os modelos estão funcionais"""
    models_to_check = [
        User, Vehicle, VehicleImage, Service, ServiceIcon,
        Appointment, Holiday, Product, Category, Supplier, Notification
    ]
    
    for model in models_to_check:
        try:
            model.objects.exists()
            print_status(f"Modelo {model.__name__} funcionando", "OK")
        except Exception as e:
            print_status(f"Erro no modelo {model.__name__}: {e}", "ERROR")
            return False
    return True

def check_urls():
    """Verifica se as URLs principais estão funcionando"""
    client = Client()
    
    urls_to_check = [
        ('/', 'Página inicial'),
        ('/admin/', 'Admin Django'),
        ('/api/status/', 'Status da API'),
        ('/accounts/login/', 'Login'),
        ('/admin-panel/', 'Painel administrativo'),
    ]
    
    for url, name in urls_to_check:
        try:
            response = client.get(url)
            if response.status_code < 500:
                print_status(f"{name} ({url}) - Status: {response.status_code}", "OK")
            else:
                print_status(f"{name} ({url}) - Erro: {response.status_code}", "ERROR")
        except Exception as e:
            print_status(f"Erro ao acessar {name}: {e}", "ERROR")

def check_static_files():
    """Verifica se os arquivos estáticos estão configurados"""
    from django.conf import settings
    
    static_dirs = [
        settings.STATIC_ROOT if settings.STATIC_ROOT else settings.BASE_DIR / 'staticfiles',
        settings.BASE_DIR / 'static',
        settings.MEDIA_ROOT if settings.MEDIA_ROOT else settings.BASE_DIR / 'media'
    ]
    
    for directory in static_dirs:
        if directory and Path(directory).exists():
            print_status(f"Diretório {directory} existe", "OK")
        else:
            print_status(f"Diretório {directory} não encontrado", "WARNING")

def check_permissions():
    """Verifica se há superusuários criados"""
    superusers = User.objects.filter(is_superuser=True).count()
    if superusers > 0:
        print_status(f"{superusers} superusuário(s) encontrado(s)", "OK")
    else:
        print_status("Nenhum superusuário encontrado", "WARNING")
        print_status("Execute: python manage.py createsuperuser", "INFO")

def main():
    """Função principal de verificação"""
    print("=" * 60)
    print("🔍 VERIFICAÇÃO DO SISTEMA AUTOV7")
    print("=" * 60)
    
    print("\n📊 VERIFICANDO BANCO DE DADOS...")
    if not check_database():
        print_status("Execute as migrações: python manage.py migrate", "INFO")
        return
    
    print("\n🏗️ VERIFICANDO MODELOS...")
    if not check_models():
        return
    
    print("\n🌐 VERIFICANDO URLs...")
    check_urls()
    
    print("\n📁 VERIFICANDO ARQUIVOS ESTÁTICOS...")
    check_static_files()
    
    print("\n👤 VERIFICANDO PERMISSÕES...")
    check_permissions()
    
    print("\n" + "=" * 60)
    print("✅ VERIFICAÇÃO CONCLUÍDA!")
    print("=" * 60)
    print("\n📝 PRÓXIMOS PASSOS:")
    print("1. Acesse: http://127.0.0.1:8000")
    print("2. Admin: http://127.0.0.1:8000/admin/")
    print("3. Painel: http://127.0.0.1:8000/admin-panel/")
    print("4. Dashboard: http://127.0.0.1:8000/dashboard/")
    
if __name__ == '__main__':
    main()