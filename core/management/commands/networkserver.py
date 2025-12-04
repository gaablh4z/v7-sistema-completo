from django.core.management.base import BaseCommand
from django.core.management.commands.runserver import Command as RunserverCommand
from django.conf import settings
import socket
import subprocess
import platform
import os


class Command(BaseCommand):
    help = 'Inicia o servidor Django com acesso de rede automático (como --network do Node.js)'

    def add_arguments(self, parser):
        parser.add_argument(
            '--port',
            default='8000',
            help='Porta para o servidor (padrão: 8000)',
        )
        parser.add_argument(
            '--no-firewall',
            action='store_true',
            help='Pula a configuração automática do firewall',
        )

    def get_local_ip(self):
        """Obtém o IP local da máquina"""
        try:
            # Conecta a um socket para descobrir o IP local
            s = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
            s.connect(("8.8.8.8", 80))
            local_ip = s.getsockname()[0]
            s.close()
            return local_ip
        except Exception:
            return "127.0.0.1"

    def configure_windows_firewall(self, port):
        """Configura o firewall do Windows automaticamente"""
        if platform.system() != 'Windows':
            return True
            
        try:
            # Comando para adicionar regra do firewall
            cmd = f'netsh advfirewall firewall add rule name="Django Network Server Port {port}" dir=in action=allow protocol=TCP localport={port}'
            
            # Tenta executar como administrador
            result = subprocess.run(cmd, shell=True, capture_output=True, text=True)
            
            if result.returncode == 0:
                self.stdout.write(
                    self.style.SUCCESS(f'✅ Firewall configurado para porta {port}')
                )
                return True
            else:
                self.stdout.write(
                    self.style.WARNING(f'⚠️ Não foi possível configurar o firewall automaticamente.')
                )
                self.stdout.write(
                    self.style.WARNING(f'Execute como administrador ou configure manualmente.')
                )
                return False
        except Exception as e:
            self.stdout.write(
                self.style.WARNING(f'⚠️ Erro ao configurar firewall: {e}')
            )
            return False

    def handle(self, *args, **options):
        port = options['port']
        local_ip = self.get_local_ip()
        
        # Banner estilizado
        self.stdout.write(
            self.style.SUCCESS('\n' + '='*60)
        )
        self.stdout.write(
            self.style.SUCCESS('🌐 DJANGO NETWORK SERVER (como Node.js --network)')
        )
        self.stdout.write(
            self.style.SUCCESS('='*60)
        )
        
        # Configurar firewall automaticamente (se não foi desabilitado)
        if not options['no_firewall']:
            self.stdout.write('\n📛 Configurando firewall...')
            self.configure_windows_firewall(port)
        
        # Informações de acesso
        self.stdout.write(f'\n📍 URLS DE ACESSO:')
        self.stdout.write(f'')
        self.stdout.write(
            self.style.HTTP_INFO(f'   Local:    http://localhost:{port}/')
        )
        self.stdout.write(
            self.style.HTTP_INFO(f'   Local:    http://127.0.0.1:{port}/')
        )
        self.stdout.write(
            self.style.HTTP_SUCCESS(f'   Network:  http://{local_ip}:{port}/')
        )
        
        self.stdout.write(f'\n📱 ACESSO DE OUTROS DISPOSITIVOS:')
        self.stdout.write(f'   • Smartphones na mesma rede Wi-Fi')
        self.stdout.write(f'   • Tablets e outros computadores')
        self.stdout.write(f'   • Use: http://{local_ip}:{port}/')
        
        self.stdout.write(f'\n⚡ PÁGINAS DISPONÍVEIS:')
        self.stdout.write(f'   • Página Principal: http://{local_ip}:{port}/')
        self.stdout.write(f'   • Sobre:           http://{local_ip}:{port}/sobre/')
        self.stdout.write(f'   • Admin:           http://{local_ip}:{port}/admin/')
        
        self.stdout.write(f'\n🔧 Para parar o servidor: Ctrl+C')
        self.stdout.write(
            self.style.SUCCESS('='*60 + '\n')
        )
        
        # Executar o runserver com 0.0.0.0
        try:
            # Chama o comando runserver original com 0.0.0.0
            runserver_cmd = RunserverCommand()
            runserver_cmd.execute(f'0.0.0.0:{port}'.split())
            
        except KeyboardInterrupt:
            self.stdout.write(
                self.style.SUCCESS('\n\n🛑 Servidor parado pelo usuário')
            )
        except Exception as e:
            self.stdout.write(
                self.style.ERROR(f'\n❌ Erro ao iniciar servidor: {e}')
            )