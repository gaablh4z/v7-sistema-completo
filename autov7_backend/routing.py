"""
Configuração de rotas WebSocket para o AutoV7

Define os endpoints WebSocket para comunicação em tempo real
"""

from django.urls import re_path
from core import consumers

websocket_urlpatterns = [
    # WebSocket para clientes - notificações e atualizações em tempo real
    re_path(r'ws/client/(?P<user_id>\w+)/$', consumers.ClientConsumer.as_asgi()),
    
    # WebSocket para administradores - recebe todas as atualizações do sistema
    re_path(r'ws/admin/$', consumers.AdminConsumer.as_asgi()),
    
    # WebSocket para notificações gerais
    re_path(r'ws/notifications/(?P<user_id>\w+)/$', consumers.NotificationConsumer.as_asgi()),
]
