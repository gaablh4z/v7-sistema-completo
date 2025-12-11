# core/middleware.py
from django.utils.deprecation import MiddlewareMixin
from django.contrib.auth.signals import user_logged_in
from django.dispatch import receiver
from django.shortcuts import redirect


class IPTrackingMiddleware(MiddlewareMixin):
    """
    Middleware para capturar IP do usuário
    """
    
    def process_request(self, request):
        # Captura o IP real do usuário
        x_forwarded_for = request.META.get('HTTP_X_FORWARDED_FOR')
        if x_forwarded_for:
            ip = x_forwarded_for.split(',')[0]
        else:
            ip = request.META.get('REMOTE_ADDR')
        
        request.user_ip = ip
        return None


class AdminRedirectMiddleware(MiddlewareMixin):
    """
    Middleware para redirecionar administradores para o painel correto
    """
    
    def process_request(self, request):
        # Se usuário está autenticado
        if request.user.is_authenticated:
            # Se é admin tentando acessar dashboard do cliente
            if request.user.funcao == 'admin' and request.path.startswith('/dashboard/'):
                return redirect('/admin-panel/')
            
            # Se é cliente tentando acessar painel admin
            elif request.user.funcao == 'client' and request.path.startswith('/admin-panel/'):
                return redirect('/dashboard/')
        
        return None


@receiver(user_logged_in)
def update_last_login_ip(sender, request, user, **kwargs):
    """
    Atualiza o último IP de login do usuário
    """
    if hasattr(request, 'user_ip'):
        user.ultimo_ip_login = request.user_ip
        user.save(update_fields=['ultimo_ip_login'])