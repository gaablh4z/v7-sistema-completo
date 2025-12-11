"""
Comando para criar usuário administrador
"""
from django.core.management.base import BaseCommand
from core.models import User


class Command(BaseCommand):
    help = 'Cria um usuário administrador'

    def add_arguments(self, parser):
        parser.add_argument('--email', type=str, help='E-mail do administrador')
        parser.add_argument('--password', type=str, help='Senha do administrador')
        parser.add_argument('--nome', type=str, help='Nome do administrador')
        parser.add_argument('--sobrenome', type=str, help='Sobrenome do administrador')

    def handle(self, *args, **options):
        email = options.get('email') or 'admin@autov7.com'
        password = options.get('password') or 'admin123'
        nome = options.get('nome') or 'Admin'
        sobrenome = options.get('sobrenome') or 'AutoV7'
        
        # Verificar se já existe
        if User.objects.filter(email=email).exists():
            self.stdout.write(self.style.WARNING(f'Usuário com e-mail {email} já existe!'))
            admin = User.objects.get(email=email)
            
            # Atualizar para admin se não for
            if admin.funcao != 'admin':
                admin.funcao = 'admin'
                admin.is_staff = True
                admin.is_superuser = True
                admin.save()
                self.stdout.write(self.style.SUCCESS(f'Usuário {email} atualizado para ADMIN!'))
            else:
                self.stdout.write(self.style.SUCCESS(f'Usuário {email} já é admin!'))
            
            return
        
        # Criar novo admin
        try:
            admin = User.objects.create_user(
                username=email.split('@')[0],
                email=email,
                password=password,
                first_name=nome,
                last_name=sobrenome,
                funcao='admin',
                is_staff=True,
                is_superuser=True,
                ativo=True,
                email_verificado=True
            )
            
            self.stdout.write(self.style.SUCCESS('=' * 60))
            self.stdout.write(self.style.SUCCESS('✅ ADMINISTRADOR CRIADO COM SUCESSO!'))
            self.stdout.write(self.style.SUCCESS('=' * 60))
            self.stdout.write(self.style.SUCCESS(f'📧 E-mail: {email}'))
            self.stdout.write(self.style.SUCCESS(f'🔑 Senha: {password}'))
            self.stdout.write(self.style.SUCCESS(f'👤 Nome: {nome} {sobrenome}'))
            self.stdout.write(self.style.SUCCESS('=' * 60))
            self.stdout.write(self.style.SUCCESS(''))
            self.stdout.write(self.style.SUCCESS('🌐 Acesse: http://localhost:8000/accounts/login/'))
            self.stdout.write(self.style.SUCCESS('📊 Painel: http://localhost:8000/admin-panel/'))
            self.stdout.write(self.style.SUCCESS('=' * 60))
            
        except Exception as e:
            self.stdout.write(self.style.ERROR(f'Erro ao criar administrador: {str(e)}'))
