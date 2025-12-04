/**
 * WebSocket Client para Clientes AutoV7
 * Gerencia conexão WebSocket em tempo real para clientes
 */

class AutoV7WebSocketClient {
    constructor(userId) {
        this.userId = userId;
        this.socket = null;
        this.reconnectAttempts = 0;
        this.maxReconnectAttempts = 5;
        this.reconnectDelay = 3000;
        this.heartbeatInterval = null;
        this.isIntentionalClose = false;
        
        this.init();
    }
    
    init() {
        this.connect();
        this.setupEventListeners();
    }
    
    connect() {
        // Determinar protocolo (ws ou wss)
        const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
        const wsUrl = `${protocol}//${window.location.host}/ws/client/${this.userId}/`;
        
        console.log('Conectando ao WebSocket:', wsUrl);
        
        try {
            this.socket = new WebSocket(wsUrl);
            
            this.socket.onopen = (event) => this.onOpen(event);
            this.socket.onmessage = (event) => this.onMessage(event);
            this.socket.onerror = (event) => this.onError(event);
            this.socket.onclose = (event) => this.onClose(event);
            
        } catch (error) {
            console.error('Erro ao criar WebSocket:', error);
            this.scheduleReconnect();
        }
    }
    
    onOpen(event) {
        console.log('WebSocket conectado com sucesso!');
        this.reconnectAttempts = 0;
        this.showConnectionStatus('connected');
        
        // Iniciar heartbeat
        this.startHeartbeat();
        
        // Notificar conexão estabelecida
        this.dispatchCustomEvent('websocket:connected');
    }
    
    onMessage(event) {
        try {
            const data = JSON.parse(event.data);
            console.log('Mensagem recebida:', data);
            
            // Processar mensagem baseado no tipo
            this.handleMessage(data);
            
        } catch (error) {
            console.error('Erro ao processar mensagem:', error);
        }
    }
    
    onError(event) {
        console.error('Erro no WebSocket:', event);
        this.showConnectionStatus('error');
    }
    
    onClose(event) {
        console.log('WebSocket desconectado:', event.code, event.reason);
        this.stopHeartbeat();
        this.showConnectionStatus('disconnected');
        
        // Tentar reconectar se não foi intencional
        if (!this.isIntentionalClose) {
            this.scheduleReconnect();
        }
    }
    
    handleMessage(data) {
        const { type } = data;
        
        switch (type) {
            case 'connection_established':
                this.handleConnectionEstablished(data);
                break;
                
            case 'appointment_status_changed':
                this.handleAppointmentStatusChanged(data);
                break;
                
            case 'appointment_confirmed':
                this.handleAppointmentConfirmed(data);
                break;
                
            case 'appointment_cancelled':
                this.handleAppointmentCancelled(data);
                break;
                
            case 'new_notification':
                this.handleNewNotification(data);
                break;
                
            case 'reminder':
                this.handleReminder(data);
                break;
                
            case 'pong':
                // Resposta ao ping
                break;
                
            default:
                console.warn('Tipo de mensagem não reconhecido:', type);
        }
    }
    
    handleConnectionEstablished(data) {
        console.log('Conexão estabelecida:', data.message);
        this.showNotification('success', 'Conectado', 'Você está conectado ao sistema em tempo real!');
    }
    
    handleAppointmentStatusChanged(data) {
        const { appointment_id, new_status, status_display, message } = data;
        
        // Atualizar UI
        this.updateAppointmentStatus(appointment_id, new_status, status_display);
        
        // Mostrar notificação
        this.showNotification('info', 'Status Atualizado', message);
        
        // Emitir evento customizado
        this.dispatchCustomEvent('appointment:status_changed', data);
    }
    
    handleAppointmentConfirmed(data) {
        const { appointment_id, date, time, message } = data;
        
        this.showNotification('success', 'Agendamento Confirmado', message);
        
        // Atualizar lista de agendamentos
        this.refreshAppointmentList();
        
        this.dispatchCustomEvent('appointment:confirmed', data);
    }
    
    handleAppointmentCancelled(data) {
        const { appointment_id, reason, message } = data;
        
        this.showNotification('warning', 'Agendamento Cancelado', message);
        
        // Remover ou atualizar na UI
        this.removeOrUpdateAppointment(appointment_id);
        
        this.dispatchCustomEvent('appointment:cancelled', data);
    }
    
    handleNewNotification(data) {
        const { notification_id, title, message, notification_type } = data;
        
        // Mostrar notificação
        this.showNotification(notification_type, title, message);
        
        // Atualizar contador de notificações
        this.updateNotificationBadge();
        
        this.dispatchCustomEvent('notification:new', data);
    }
    
    handleReminder(data) {
        const { appointment_id, message, time_until } = data;
        
        this.showNotification('info', 'Lembrete', message);
        
        this.dispatchCustomEvent('appointment:reminder', data);
    }
    
    // Métodos de UI
    updateAppointmentStatus(appointmentId, newStatus, statusDisplay) {
        const appointmentCard = document.querySelector(`[data-appointment-id="${appointmentId}"]`);
        if (appointmentCard) {
            const statusBadge = appointmentCard.querySelector('.status-badge');
            if (statusBadge) {
                statusBadge.textContent = statusDisplay;
                statusBadge.className = `status-badge status-${newStatus}`;
            }
        }
    }
    
    refreshAppointmentList() {
        // Recarregar lista de agendamentos sem refresh da página
        const appointmentList = document.querySelector('#appointment-list');
        if (appointmentList) {
            // Fazer requisição AJAX para buscar lista atualizada
            fetch('/dashboard/appointments/list/')
                .then(response => response.text())
                .then(html => {
                    appointmentList.innerHTML = html;
                })
                .catch(error => console.error('Erro ao atualizar lista:', error));
        }
    }
    
    removeOrUpdateAppointment(appointmentId) {
        const appointmentCard = document.querySelector(`[data-appointment-id="${appointmentId}"]`);
        if (appointmentCard) {
            appointmentCard.classList.add('appointment-cancelled');
            setTimeout(() => {
                this.refreshAppointmentList();
            }, 2000);
        }
    }
    
    updateNotificationBadge() {
        const badge = document.querySelector('.notification-badge');
        if (badge) {
            const currentCount = parseInt(badge.textContent) || 0;
            badge.textContent = currentCount + 1;
            badge.style.display = 'inline-block';
        }
    }
    
    showNotification(type, title, message) {
        // Usar toastr ou sistema de notificação existente
        if (typeof toastr !== 'undefined') {
            toastr[type](message, title);
        } else {
            // Fallback para alert nativo
            console.log(`[${type.toUpperCase()}] ${title}: ${message}`);
            
            // Criar notificação visual simples
            this.createVisualNotification(type, title, message);
        }
    }
    
    createVisualNotification(type, title, message) {
        const notification = document.createElement('div');
        notification.className = `autov7-notification notification-${type}`;
        notification.innerHTML = `
            <div class="notification-content">
                <strong>${title}</strong>
                <p>${message}</p>
            </div>
            <button class="notification-close">&times;</button>
        `;
        
        document.body.appendChild(notification);
        
        // Auto-remover após 5 segundos
        setTimeout(() => {
            notification.classList.add('fade-out');
            setTimeout(() => notification.remove(), 300);
        }, 5000);
        
        // Botão de fechar
        notification.querySelector('.notification-close').addEventListener('click', () => {
            notification.remove();
        });
    }
    
    showConnectionStatus(status) {
        const statusIndicator = document.querySelector('.connection-status');
        if (statusIndicator) {
            statusIndicator.className = `connection-status status-${status}`;
            
            const statusText = {
                'connected': 'Conectado',
                'disconnected': 'Desconectado',
                'error': 'Erro de conexão'
            };
            
            statusIndicator.textContent = statusText[status] || status;
        }
    }
    
    // Heartbeat para manter conexão viva
    startHeartbeat() {
        this.heartbeatInterval = setInterval(() => {
            if (this.socket && this.socket.readyState === WebSocket.OPEN) {
                this.send({
                    type: 'ping',
                    timestamp: Date.now()
                });
            }
        }, 30000); // 30 segundos
    }
    
    stopHeartbeat() {
        if (this.heartbeatInterval) {
            clearInterval(this.heartbeatInterval);
            this.heartbeatInterval = null;
        }
    }
    
    // Reconexão automática
    scheduleReconnect() {
        if (this.reconnectAttempts >= this.maxReconnectAttempts) {
            console.error('Máximo de tentativas de reconexão atingido');
            this.showNotification('error', 'Erro de Conexão', 'Não foi possível conectar ao servidor. Por favor, recarregue a página.');
            return;
        }
        
        this.reconnectAttempts++;
        console.log(`Tentando reconectar em ${this.reconnectDelay/1000}s... (tentativa ${this.reconnectAttempts}/${this.maxReconnectAttempts})`);
        
        setTimeout(() => {
            this.connect();
        }, this.reconnectDelay);
    }
    
    // Enviar mensagem
    send(data) {
        if (this.socket && this.socket.readyState === WebSocket.OPEN) {
            this.socket.send(JSON.stringify(data));
        } else {
            console.warn('WebSocket não está conectado');
        }
    }
    
    // Eventos customizados
    dispatchCustomEvent(eventName, data = {}) {
        const event = new CustomEvent(eventName, { detail: data });
        window.dispatchEvent(event);
    }
    
    setupEventListeners() {
        // Reconectar quando a aba volta ao foco
        document.addEventListener('visibilitychange', () => {
            if (!document.hidden && this.socket.readyState !== WebSocket.OPEN) {
                console.log('Aba voltou ao foco, reconectando...');
                this.connect();
            }
        });
    }
    
    // Desconectar manualmente
    disconnect() {
        this.isIntentionalClose = true;
        this.stopHeartbeat();
        if (this.socket) {
            this.socket.close();
        }
    }
}

// Inicializar automaticamente se houver userId disponível
document.addEventListener('DOMContentLoaded', () => {
    const userIdElement = document.querySelector('[data-user-id]');
    if (userIdElement) {
        const userId = userIdElement.dataset.userId;
        window.autoV7WS = new AutoV7WebSocketClient(userId);
        
        console.log('WebSocket Client inicializado para usuário:', userId);
    }
});
