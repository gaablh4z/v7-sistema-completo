from django.core.management.base import BaseCommand
from django.contrib.auth import get_user_model
from vehicles.models import Vehicle
from services.models import ServiceCategory, Service
from appointments.models import Appointment, AppointmentService, WorkingHours
from inventory.models import ProductCategory, Supplier, Product
from decimal import Decimal
from datetime import date, time, datetime, timedelta

User = get_user_model()


class Command(BaseCommand):
    """
    Comando para popular o banco de dados com dados de exemplo
    """
    help = 'Popula o banco de dados com dados de exemplo para demonstração'

    def handle(self, *args, **options):
        self.stdout.write('Iniciando população do banco de dados...')
        
        # Criar usuários
        self.create_users()
        
        # Criar categorias e serviços
        self.create_services()
        
        # Criar veículos
        self.create_vehicles()
        
        # Criar horários de funcionamento
        self.create_working_hours()
        
        # Criar produtos e estoque
        self.create_inventory()
        
        # Criar alguns agendamentos
        self.create_appointments()
        
        self.stdout.write(
            self.style.SUCCESS('Banco de dados populado com sucesso!')
        )

    def create_users(self):
        """Criar usuários de exemplo"""
        self.stdout.write('Criando usuários...')
        
        # Admin já existe, criar alguns clientes
        if not User.objects.filter(email='joao@email.com').exists():
            User.objects.create_user(
                username='joao_silva',
                email='joao@email.com',
                password='123456',
                first_name='João',
                last_name='Silva',
                phone='(11) 99999-9999',
                funcao='client'
            )
        
        if not User.objects.filter(email='maria@email.com').exists():
            User.objects.create_user(
                username='maria_santos',
                email='maria@email.com',
                password='123456',
                first_name='Maria',
                last_name='Santos',
                phone='(11) 88888-8888',
                funcao='client'
            )
        
        if not User.objects.filter(email='carlos@email.com').exists():
            User.objects.create_user(
                username='carlos_oliveira',
                email='carlos@email.com',
                password='123456',
                first_name='Carlos',
                last_name='Oliveira',
                phone='(11) 77777-7777',
                funcao='client'
            )

    def create_services(self):
        """Criar categorias e serviços"""
        self.stdout.write('Criando serviços...')
        
        # Categorias
        lavagem_cat, _ = ServiceCategory.objects.get_or_create(
            name='Lavagem',
            defaults={'description': 'Serviços de lavagem de veículos'}
        )
        
        enceramento_cat, _ = ServiceCategory.objects.get_or_create(
            name='Enceramento',
            defaults={'description': 'Serviços de enceramento e proteção'}
        )
        
        detalhamento_cat, _ = ServiceCategory.objects.get_or_create(
            name='Detalhamento',
            defaults={'description': 'Serviços de detalhamento completo'}
        )
        
        # Serviços de Lavagem
        Service.objects.get_or_create(
            name='Lavagem Simples',
            category=lavagem_cat,
            defaults={
                'description': 'Lavagem externa básica',
                'price': Decimal('25.00'),
                'duration_minutes': 30,
                'applies_to_motorcycle': True
            }
        )
        
        Service.objects.get_or_create(
            name='Lavagem Completa',
            category=lavagem_cat,
            defaults={
                'description': 'Lavagem externa e interna completa',
                'price': Decimal('45.00'),
                'duration_minutes': 60
            }
        )
        
        Service.objects.get_or_create(
            name='Lavagem Premium',
            category=lavagem_cat,
            defaults={
                'description': 'Lavagem completa com produtos premium',
                'price': Decimal('70.00'),
                'duration_minutes': 90
            }
        )
        
        # Serviços de Enceramento
        Service.objects.get_or_create(
            name='Cera Carnaúba',
            category=enceramento_cat,
            defaults={
                'description': 'Aplicação de cera carnaúba',
                'price': Decimal('80.00'),
                'duration_minutes': 120
            }
        )
        
        Service.objects.get_or_create(
            name='Cera Sintética',
            category=enceramento_cat,
            defaults={
                'description': 'Aplicação de cera sintética',
                'price': Decimal('60.00'),
                'duration_minutes': 90
            }
        )
        
        # Serviços de Detalhamento
        Service.objects.get_or_create(
            name='Detalhamento Completo',
            category=detalhamento_cat,
            defaults={
                'description': 'Detalhamento interno e externo completo',
                'price': Decimal('200.00'),
                'duration_minutes': 240
            }
        )

    def create_vehicles(self):
        """Criar veículos para os clientes"""
        self.stdout.write('Criando veículos...')
        
        joao = User.objects.get(email='joao@email.com')
        maria = User.objects.get(email='maria@email.com')
        carlos = User.objects.get(email='carlos@email.com')
        
        Vehicle.objects.get_or_create(
            plate='ABC-1234',
            defaults={
                'user': joao,
                'make': 'Toyota',
                'model': 'Corolla',
                'year': 2020,
                'color': 'Branco',
                'category': 'sedan',
                'mileage': 30000
            }
        )
        
        Vehicle.objects.get_or_create(
            plate='DEF-5678',
            defaults={
                'user': maria,
                'make': 'Honda',
                'model': 'Civic',
                'year': 2021,
                'color': 'Prata',
                'category': 'sedan',
                'mileage': 25000
            }
        )
        
        Vehicle.objects.get_or_create(
            plate='GHI-9012',
            defaults={
                'user': carlos,
                'make': 'Volkswagen',
                'model': 'Gol',
                'year': 2019,
                'color': 'Azul',
                'category': 'hatch',
                'mileage': 40000
            }
        )

    def create_working_hours(self):
        """Criar horários de funcionamento"""
        self.stdout.write('Criando horários de funcionamento...')
        
        # Segunda a sexta: 8h às 18h
        for weekday in range(5):  # 0-4 (seg-sex)
            WorkingHours.objects.get_or_create(
                weekday=weekday,
                defaults={
                    'start_time': time(8, 0),
                    'end_time': time(18, 0),
                    'is_open': True
                }
            )
        
        # Sábado: 8h às 16h
        WorkingHours.objects.get_or_create(
            weekday=5,
            defaults={
                'start_time': time(8, 0),
                'end_time': time(16, 0),
                'is_open': True
            }
        )
        
        # Domingo: fechado
        WorkingHours.objects.get_or_create(
            weekday=6,
            defaults={
                'start_time': time(8, 0),
                'end_time': time(18, 0),
                'is_open': False
            }
        )

    def create_inventory(self):
        """Criar produtos e estoque"""
        self.stdout.write('Criando produtos...')
        
        # Categorias de produtos
        shampoo_cat, _ = ProductCategory.objects.get_or_create(
            name='Shampoos',
            defaults={'description': 'Shampoos automotivos'}
        )
        
        ceras_cat, _ = ProductCategory.objects.get_or_create(
            name='Ceras',
            defaults={'description': 'Ceras e protetores'}
        )
        
        # Fornecedor
        fornecedor, _ = Supplier.objects.get_or_create(
            name='AutoProdutos Ltda',
            defaults={
                'contact_person': 'José Silva',
                'email': 'vendas@autoprodutos.com',
                'phone': '(11) 1234-5678'
            }
        )
        
        # Produtos
        Product.objects.get_or_create(
            name='Shampoo Automotivo 1L',
            defaults={
                'description': 'Shampoo neutro para lavagem',
                'category': shampoo_cat,
                'supplier': fornecedor,
                'sku': 'SHAM001',
                'quantity': 50,
                'min_quantity': 10,
                'unit_price': Decimal('15.00'),
                'cost_price': Decimal('8.00')
            }
        )
        
        Product.objects.get_or_create(
            name='Cera Carnaúba 200g',
            defaults={
                'description': 'Cera carnaúba premium',
                'category': ceras_cat,
                'supplier': fornecedor,
                'sku': 'CERA001',
                'quantity': 30,
                'min_quantity': 5,
                'unit_price': Decimal('35.00'),
                'cost_price': Decimal('20.00')
            }
        )

    def create_appointments(self):
        """Criar alguns agendamentos de exemplo"""
        self.stdout.write('Criando agendamentos...')
        
        joao = User.objects.get(email='joao@email.com')
        maria = User.objects.get(email='maria@email.com')
        
        joao_vehicle = Vehicle.objects.get(user=joao)
        maria_vehicle = Vehicle.objects.get(user=maria)
        
        lavagem_simples = Service.objects.get(name='Lavagem Simples')
        lavagem_completa = Service.objects.get(name='Lavagem Completa')
        
        # Agendamento para amanhã
        tomorrow = date.today() + timedelta(days=1)
        
        # Agendamento do João
        appointment1, created = Appointment.objects.get_or_create(
            user=joao,
            vehicle=joao_vehicle,
            appointment_date=tomorrow,
            appointment_time=time(9, 0),
            defaults={
                'status': 'confirmed',
                'total_price': lavagem_completa.price,
                'notes': 'Cliente preferencial',
                'queue_position': 1
            }
        )
        
        if created:
            AppointmentService.objects.create(
                appointment=appointment1,
                service=lavagem_completa,
                price=lavagem_completa.price
            )
        
        # Agendamento da Maria
        appointment2, created = Appointment.objects.get_or_create(
            user=maria,
            vehicle=maria_vehicle,
            appointment_date=tomorrow,
            appointment_time=time(10, 30),
            defaults={
                'status': 'pending',
                'total_price': lavagem_simples.price,
                'notes': 'Primeira visita',
                'queue_position': 2
            }
        )
        
        if created:
            AppointmentService.objects.create(
                appointment=appointment2,
                service=lavagem_simples,
                price=lavagem_simples.price
            )
