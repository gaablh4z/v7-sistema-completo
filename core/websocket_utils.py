"""
Utilitários WebSocket para enviar mensagens aos consumers

Funções auxiliares para broadcasting de mensagens em tempo real
"""

from channels.layers import get_channel_layer
from asgiref.sync import async_to_sync


def notify_client_appointment_status_changed(user_id, appointment_id, new_status, status_display, message):
    """
    Notifica cliente sobre mudança de status de agendamento
    """
    channel_layer = get_channel_layer()
    async_to_sync(channel_layer.group_send)(
        f'client_{user_id}',
        {
            'type': 'appointment_status_changed',
            'appointment_id': appointment_id,
            'new_status': new_status,
            'status_display': status_display,
            'message': message
        }
    )


def notify_client_appointment_confirmed(user_id, appointment_id, date, time, message):
    """
    Notifica cliente sobre confirmação de agendamento
    """
    channel_layer = get_channel_layer()
    async_to_sync(channel_layer.group_send)(
        f'client_{user_id}',
        {
            'type': 'appointment_confirmed',
            'appointment_id': appointment_id,
            'date': date,
            'time': time,
            'message': message
        }
    )


def notify_client_appointment_cancelled(user_id, appointment_id, reason, message):
    """
    Notifica cliente sobre cancelamento de agendamento
    """
    channel_layer = get_channel_layer()
    async_to_sync(channel_layer.group_send)(
        f'client_{user_id}',
        {
            'type': 'appointment_cancelled',
            'appointment_id': appointment_id,
            'reason': reason,
            'message': message
        }
    )


def notify_client_new_notification(user_id, notification_id, title, message, notification_type):
    """
    Envia nova notificação para cliente
    """
    channel_layer = get_channel_layer()
    async_to_sync(channel_layer.group_send)(
        f'client_{user_id}',
        {
            'type': 'new_notification',
            'notification_id': notification_id,
            'title': title,
            'message': message,
            'notification_type': notification_type
        }
    )


def notify_client_reminder(user_id, appointment_id, message, time_until):
    """
    Envia lembrete para cliente
    """
    channel_layer = get_channel_layer()
    async_to_sync(channel_layer.group_send)(
        f'client_{user_id}',
        {
            'type': 'reminder',
            'appointment_id': appointment_id,
            'message': message,
            'time_until': time_until
        }
    )


# FUNÇÕES PARA ADMINISTRADORES

def notify_admin_new_appointment(appointment_data):
    """
    Notifica admins sobre novo agendamento
    
    appointment_data deve conter:
    - appointment_id
    - client_name
    - client_email
    - vehicle (string descritivo)
    - service (nome do serviço)
    - date
    - time
    - total_price
    - created_at
    """
    channel_layer = get_channel_layer()
    async_to_sync(channel_layer.group_send)(
        'admin_panel',
        {
            'type': 'new_appointment',
            **appointment_data
        }
    )


def notify_admin_appointment_cancelled_by_client(appointment_id, client_name, reason=''):
    """
    Notifica admins sobre cancelamento pelo cliente
    """
    channel_layer = get_channel_layer()
    async_to_sync(channel_layer.group_send)(
        'admin_panel',
        {
            'type': 'appointment_cancelled_by_client',
            'appointment_id': appointment_id,
            'client_name': client_name,
            'reason': reason
        }
    )


def notify_admin_new_customer(customer_id, name, email, joined_at):
    """
    Notifica admins sobre novo cliente
    """
    channel_layer = get_channel_layer()
    async_to_sync(channel_layer.group_send)(
        'admin_panel',
        {
            'type': 'new_customer',
            'customer_id': customer_id,
            'name': name,
            'email': email,
            'joined_at': joined_at
        }
    )


def notify_admin_new_vehicle(vehicle_id, owner_name, vehicle, plate):
    """
    Notifica admins sobre novo veículo
    """
    channel_layer = get_channel_layer()
    async_to_sync(channel_layer.group_send)(
        'admin_panel',
        {
            'type': 'new_vehicle',
            'vehicle_id': vehicle_id,
            'owner_name': owner_name,
            'vehicle': vehicle,
            'plate': plate
        }
    )


def notify_admin_stats_update(stats):
    """
    Atualiza estatísticas em tempo real para admins
    
    stats deve conter:
    - total_appointments
    - pending_appointments
    - confirmed_appointments
    - completed_appointments
    - total_revenue
    - etc.
    """
    channel_layer = get_channel_layer()
    async_to_sync(channel_layer.group_send)(
        'admin_panel',
        {
            'type': 'stats_update',
            'stats': stats
        }
    )


# FUNÇÕES PARA NOTIFICAÇÕES GERAIS

def send_notification(user_id, notification_id, title, message, notification_type, created_at):
    """
    Envia notificação geral para usuário
    """
    channel_layer = get_channel_layer()
    async_to_sync(channel_layer.group_send)(
        f'notifications_{user_id}',
        {
            'type': 'notification',
            'id': notification_id,
            'title': title,
            'message': message,
            'notification_type': notification_type,
            'created_at': created_at
        }
    )


def send_alert(user_id, level, title, message):
    """
    Envia alerta para usuário
    
    level: 'info', 'warning', 'error', 'success'
    """
    channel_layer = get_channel_layer()
    async_to_sync(channel_layer.group_send)(
        f'notifications_{user_id}',
        {
            'type': 'alert',
            'level': level,
            'title': title,
            'message': message
        }
    )


def send_system_message(user_id, message, sender='Sistema'):
    """
    Envia mensagem do sistema para usuário
    """
    channel_layer = get_channel_layer()
    async_to_sync(channel_layer.group_send)(
        f'notifications_{user_id}',
        {
            'type': 'message',
            'message': message,
            'sender': sender
        }
    )


def broadcast_alert_to_all_admins(level, title, message):
    """
    Envia alerta para todos os admins conectados
    """
    from core.models import User
    admins = User.objects.filter(funcao='admin')
    
    for admin in admins:
        send_alert(admin.id, level, title, message)
