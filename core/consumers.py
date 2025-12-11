"""
WebSocket Consumers para o AutoV7

Gerencia conexões WebSocket em tempo real para clientes e administradores
"""

import json
from channels.generic.websocket import AsyncWebsocketConsumer
from channels.db import database_sync_to_async
from django.contrib.auth import get_user_model

User = get_user_model()


class ClientConsumer(AsyncWebsocketConsumer):
    """
    Consumer para clientes
    Gerencia notificações e atualizações de agendamentos em tempo real
    """
    
    async def connect(self):
        """Quando um cliente se conecta"""
        self.user_id = self.scope['url_route']['kwargs']['user_id']
        self.room_group_name = f'client_{self.user_id}'
        
        # Verificar se o usuário está autenticado
        user = self.scope.get('user')
        if not user or not user.is_authenticated:
            await self.close()
            return
        
        # Verificar se o user_id corresponde ao usuário autenticado
        if str(user.id) != str(self.user_id):
            await self.close()
            return
        
        # Join room group
        await self.channel_layer.group_add(
            self.room_group_name,
            self.channel_name
        )
        
        await self.accept()
        
        # Enviar mensagem de boas-vindas
        await self.send(text_data=json.dumps({
            'type': 'connection_established',
            'message': 'Conectado ao sistema AutoV7',
            'user_id': self.user_id
        }))
    
    async def disconnect(self, close_code):
        """Quando um cliente se desconecta"""
        # Leave room group
        await self.channel_layer.group_discard(
            self.room_group_name,
            self.channel_name
        )
    
    async def receive(self, text_data):
        """Recebe mensagens do WebSocket"""
        try:
            data = json.loads(text_data)
            message_type = data.get('type')
            
            # Processar diferentes tipos de mensagens
            if message_type == 'ping':
                await self.send(text_data=json.dumps({
                    'type': 'pong',
                    'timestamp': data.get('timestamp')
                }))
            
        except json.JSONDecodeError:
            await self.send(text_data=json.dumps({
                'type': 'error',
                'message': 'Invalid JSON format'
            }))
    
    # Handlers para mensagens do channel layer
    async def appointment_status_changed(self, event):
        """Envia notificação de mudança de status de agendamento"""
        await self.send(text_data=json.dumps({
            'type': 'appointment_status_changed',
            'appointment_id': event['appointment_id'],
            'new_status': event['new_status'],
            'status_display': event['status_display'],
            'message': event['message']
        }))
    
    async def appointment_confirmed(self, event):
        """Notifica confirmação de agendamento"""
        await self.send(text_data=json.dumps({
            'type': 'appointment_confirmed',
            'appointment_id': event['appointment_id'],
            'date': event['date'],
            'time': event['time'],
            'message': event['message']
        }))
    
    async def appointment_cancelled(self, event):
        """Notifica cancelamento de agendamento"""
        await self.send(text_data=json.dumps({
            'type': 'appointment_cancelled',
            'appointment_id': event['appointment_id'],
            'reason': event.get('reason', ''),
            'message': event['message']
        }))
    
    async def new_notification(self, event):
        """Envia nova notificação"""
        await self.send(text_data=json.dumps({
            'type': 'new_notification',
            'notification_id': event['notification_id'],
            'title': event['title'],
            'message': event['message'],
            'notification_type': event['notification_type']
        }))
    
    async def reminder(self, event):
        """Envia lembrete"""
        await self.send(text_data=json.dumps({
            'type': 'reminder',
            'appointment_id': event['appointment_id'],
            'message': event['message'],
            'time_until': event['time_until']
        }))


class AdminConsumer(AsyncWebsocketConsumer):
    """
    Consumer para administradores
    Recebe todas as atualizações do sistema em tempo real
    """
    
    async def connect(self):
        """Quando um admin se conecta"""
        user = self.scope.get('user')
        
        # Verificar se o usuário é admin
        if not user or not user.is_authenticated or user.funcao != 'admin':
            await self.close()
            return
        
        self.room_group_name = 'admin_panel'
        
        # Join admin room group
        await self.channel_layer.group_add(
            self.room_group_name,
            self.channel_name
        )
        
        await self.accept()
        
        # Enviar mensagem de conexão
        await self.send(text_data=json.dumps({
            'type': 'connection_established',
            'message': 'Conectado ao Painel Administrativo',
            'role': 'admin'
        }))
    
    async def disconnect(self, close_code):
        """Quando um admin se desconecta"""
        await self.channel_layer.group_discard(
            self.room_group_name,
            self.channel_name
        )
    
    async def receive(self, text_data):
        """Recebe mensagens do WebSocket"""
        try:
            data = json.loads(text_data)
            message_type = data.get('type')
            
            if message_type == 'ping':
                await self.send(text_data=json.dumps({
                    'type': 'pong',
                    'timestamp': data.get('timestamp')
                }))
            
        except json.JSONDecodeError:
            await self.send(text_data=json.dumps({
                'type': 'error',
                'message': 'Invalid JSON format'
            }))
    
    # Handlers para eventos do sistema
    async def new_appointment(self, event):
        """Notifica novo agendamento"""
        await self.send(text_data=json.dumps({
            'type': 'new_appointment',
            'appointment_id': event['appointment_id'],
            'client_name': event['client_name'],
            'client_email': event['client_email'],
            'vehicle': event['vehicle'],
            'service': event['service'],
            'date': event['date'],
            'time': event['time'],
            'total_price': event['total_price'],
            'created_at': event['created_at']
        }))
    
    async def appointment_cancelled_by_client(self, event):
        """Notifica cancelamento pelo cliente"""
        await self.send(text_data=json.dumps({
            'type': 'appointment_cancelled_by_client',
            'appointment_id': event['appointment_id'],
            'client_name': event['client_name'],
            'reason': event.get('reason', 'Não informado')
        }))
    
    async def new_customer(self, event):
        """Notifica novo cliente"""
        await self.send(text_data=json.dumps({
            'type': 'new_customer',
            'customer_id': event['customer_id'],
            'name': event['name'],
            'email': event['email'],
            'joined_at': event['joined_at']
        }))
    
    async def new_vehicle(self, event):
        """Notifica novo veículo cadastrado"""
        await self.send(text_data=json.dumps({
            'type': 'new_vehicle',
            'vehicle_id': event['vehicle_id'],
            'owner_name': event['owner_name'],
            'vehicle': event['vehicle'],
            'plate': event['plate']
        }))
    
    async def stats_update(self, event):
        """Atualiza estatísticas em tempo real"""
        await self.send(text_data=json.dumps({
            'type': 'stats_update',
            'stats': event['stats']
        }))


class NotificationConsumer(AsyncWebsocketConsumer):
    """
    Consumer para notificações gerais
    Usado por todos os tipos de usuários
    """
    
    async def connect(self):
        """Quando um usuário se conecta"""
        self.user_id = self.scope['url_route']['kwargs']['user_id']
        self.room_group_name = f'notifications_{self.user_id}'
        
        user = self.scope.get('user')
        if not user or not user.is_authenticated:
            await self.close()
            return
        
        if str(user.id) != str(self.user_id):
            await self.close()
            return
        
        # Join room group
        await self.channel_layer.group_add(
            self.room_group_name,
            self.channel_name
        )
        
        await self.accept()
    
    async def disconnect(self, close_code):
        """Quando um usuário se desconecta"""
        await self.channel_layer.group_discard(
            self.room_group_name,
            self.channel_name
        )
    
    async def receive(self, text_data):
        """Recebe mensagens do WebSocket"""
        try:
            data = json.loads(text_data)
            message_type = data.get('type')
            
            if message_type == 'mark_read':
                notification_id = data.get('notification_id')
                await self.mark_notification_read(notification_id)
            
        except json.JSONDecodeError:
            pass
    
    async def notification(self, event):
        """Envia notificação"""
        await self.send(text_data=json.dumps({
            'type': 'notification',
            'id': event['id'],
            'title': event['title'],
            'message': event['message'],
            'notification_type': event['notification_type'],
            'created_at': event['created_at']
        }))
    
    async def alert(self, event):
        """Envia alerta"""
        await self.send(text_data=json.dumps({
            'type': 'alert',
            'level': event['level'],  # info, warning, error, success
            'title': event['title'],
            'message': event['message']
        }))
    
    async def message(self, event):
        """Envia mensagem do sistema"""
        await self.send(text_data=json.dumps({
            'type': 'message',
            'message': event['message'],
            'sender': event.get('sender', 'Sistema')
        }))
    
    @database_sync_to_async
    def mark_notification_read(self, notification_id):
        """Marca notificação como lida"""
        from core.models import Notification
        try:
            notification = Notification.objects.get(id=notification_id)
            notification.lida = True
            notification.save()
        except Notification.DoesNotExist:
            pass
