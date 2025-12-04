/**
 * WebSocket Client para Clientes AutoV7 - VERSÃO MELHORADA
 * 
 * MELHORIAS:
 * - Detecta códigos de erro e não reconecta em erros de autenticação
 * - Backoff exponencial para reconexão
 * - Logging detalhado para depuração
 * - Delay de reconexão aumentado de 3s para 5s
 */

class AutoV7WebSocketClient {
    constructor(userId) {
        this.userId = userId;
        this.socket = null;
        this.reconnectAttempts = 0;
        this.maxReconnectAttempts = 5;
        this.reconnectDelay = 5000;  // ✅ Aumentado de 3s para 5s
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
        
        console.log('[CLIENT] 🔌 Conectando ao WebSocket:', wsUrl);
        
        try {
            this.socket = new WebSocket(wsUrl);
            
            this.socket.onopen = (event) => this.onOpen(event);
            this.socket.onmessage = (event) => this.onMessage(event);
            this.socket.onerror = (event) => this.onError(event);
            this.socket.onclose = (event) => this.onClose(event);
            
        } catch (error) {
            console.error('[CLIENT] ❌ Erro ao criar WebSocket:', error);
            this.scheduleReconnect();
        }
    }
    
    onOpen(event) {
        console.log('[CLIENT] ✅ WebSocket conectado com sucesso!');
        this.reconnectAttempts = 0;  // Reset contador de tentativas
        this.showConnectionStatus('connected');
        
        // Iniciar heartbeat
        this.startHeartbeat();
        
        // Notificar conexão estabelecida
        this.dispatchCustomEvent('websocket:connected');
    }
    
    onMessage(event) {
        try {
            const data = JSON.parse(event.data);
            console.log('[CLIENT] 📨 Mensagem recebida:', data);
            
            // Processar mensagem baseado no tipo
            this.handleMessage(data);
            
        } catch (error) {
            console.error('[CLIENT] ❌ Erro ao processar mensagem:', error);
        }
    }
    
    onError(event) {
        console.error('[CLIENT] ❌ Erro no WebSocket:', event);
        this.showConnectionStatus('error');
    }
    
    onClose(event) {
        console.log('[CLIENT] 🔌 WebSocket desconectado:', {
            code: event.code,
            reason: event.reason,
            wasClean: event.wasClean
        });
        
        this.stopHeartbeat();
        this.showConnectionStatus('disconnected');
        
        // ✅ MELHORIA: Identificar códigos de erro que NÃO devem reconectar
        const NO_RETRY_CODES = [
            4001,  // Não autenticado
            4003   // ID não corresponde
        ];
        
        if (NO_RETRY_CODES.includes(event.code)) {
            console.error('[CLIENT] ❌ Erro de autenticação detectado (code:', event.code, ')');
            console.error('[CLIENT] 🚫 NÃO tentando reconectar automaticamente.');
            
            this.showNotification('error', 'Erro de Autenticação', 
                'Sua sessão expirou ou há um problema de autenticação. Por favor, recarregue a página e faça login novamente.');
            
            return;  // ❌ NÃO reconectar
        }
        
        // Tentar reconectar se não foi intencional e não é erro de auth
        if (!this.isIntentionalClose) {
            console.log('[CLIENT] 🔄 Desconexão não intencional, agendando reconexão...');
            this.scheduleReconnect();
        } else {
            console.log('[CLIENT] ℹ️ Desconexão intencional, não reconectando.');
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
                console.log('[CLIENT] 🏓 Pong recebido');
                break;
                
            default:
                console.warn('[CLIENT] ⚠️ Tipo de mensagem não reconhecido:', type);
        }
    }
    
    handleConnectionEstablished(data) {
        console.log('[CLIENT] ✅ Conexão estabelecida:', data.message);
        this.showNotification('success', 'Conectado', 'Você está conectado ao sistema em tempo real!');
    }
    
    handleAppointmentStatusChanged(data) {
        const { appointment_id, new_status, status_display, message } = data;
        
        console.log('[CLIENT] 📋 Status do agendamento alterado:', data);
        
        // Atualizar UI
        this.updateAppointmentStatus(appointment_id, new_status, status_display);
        
        // Mostrar notificação
        this.showNotification('info', 'Status Atualizado', message);
        
        // Emitir evento customizado
        this.dispatchCustomEvent('appointment:status_changed', data);
    }
    
    handleAppointmentConfirmed(data) {
        const { appointment_id, date, time, message } = data;
        
        console.log('[CLIENT] ✅ Agendamento confirmado:', data);
        
        this.showNotification('success', 'Agendamento Confirmado', message);
        
        // Atualizar lista de agendamentos
        this.refreshAppointmentList();
        
        this.dispatchCustomEvent('appointment:confirmed', data);
    }
    
    handleAppointmentCancelled(data) {
        const { appointment_id, reason, message } = data;
        
        console.log('[CLIENT] ❌ Agendamento cancelado:', data);
        
        this.showNotification('warning', 'Agendamento Cancelado', message);
        
        // Remover ou atualizar na UI
        this.removeOrUpdateAppointment(appointment_id);
        
        this.dispatchCustomEvent('appointment:cancelled', data);
    }
    
    handleNewNotification(data) {
        const { notification_id, title, message, notification_type } = data;
        
        console.log('[CLIENT] 🔔 Nova notificação:', data);
        
        // Mostrar notificação
        this.showNotification(notification_type, title, message);
        
        // Atualizar contador de notificações
        this.updateNotificationBadge();
        
        this.dispatchCustomEvent('notification:new', data);
    }
    
    handleReminder(data) {
        const { appointment_id, message, time_until } = data;
        
        console.log('[CLIENT] ⏰ Lembrete:', data);
        
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
            fetch('/dashboard/appointments/list/')
                .then(response => response.text())
                .then(html => {
                    appointmentList.innerHTML = html;
                    console.log('[CLIENT] ✅ Lista de agendamentos atualizada');
                })
                .catch(error => console.error('[CLIENT] ❌ Erro ao atualizar lista:', error));
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
            console.log(`[CLIENT ${type.toUpperCase()}] ${title}: ${message}`);
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
                'connected': '🟢 Conectado',
                'disconnected': '🔴 Desconectado',
                'error': '⚠️ Erro de conexão'
            };
            
            statusIndicator.textContent = statusText[status] || status;
        }
    }
    
    // Heartbeat para manter conexão viva
    startHeartbeat() {
        console.log('[CLIENT] 💓 Iniciando heartbeat (30s)');
        
        this.heartbeatInterval = setInterval(() => {
            if (this.socket && this.socket.readyState === WebSocket.OPEN) {
                console.log('[CLIENT] 🏓 Enviando ping...');
                this.send({
                    type: 'ping',
                    timestamp: Date.now()
                });
            } else {
                console.warn('[CLIENT] ⚠️ Socket não está aberto, parando heartbeat');
                this.stopHeartbeat();
            }
        }, 30000); // 30 segundos
    }
    
    stopHeartbeat() {
        if (this.heartbeatInterval) {
            console.log('[CLIENT] 💔 Parando heartbeat');
            clearInterval(this.heartbeatInterval);
            this.heartbeatInterval = null;
        }
    }
    
    // ✅ MELHORIA: Reconexão com backoff exponencial
    scheduleReconnect() {
        if (this.reconnectAttempts >= this.maxReconnectAttempts) {
            console.error('[CLIENT] ❌ Máximo de tentativas de reconexão atingido');
            this.showNotification('error', 'Erro de Conexão', 
                'Não foi possível conectar ao servidor. Por favor, recarregue a página.');
            return;
        }
        
        this.reconnectAttempts++;
        
        // ✅ Backoff exponencial: 5s, 10s, 20s, 40s, 80s
        const delay = this.reconnectDelay * Math.pow(2, this.reconnectAttempts - 1);
        
        console.log(`[CLIENT] 🔄 Tentando reconectar em ${delay/1000}s... (tentativa ${this.reconnectAttempts}/${this.maxReconnectAttempts})`);
        
        setTimeout(() => {
            console.log(`[CLIENT] 🔄 Executando tentativa de reconexão ${this.reconnectAttempts}...`);
            this.connect();
        }, delay);
    }
    
    // Enviar mensagem
    send(data) {
        if (this.socket && this.socket.readyState === WebSocket.OPEN) {
            this.socket.send(JSON.stringify(data));
            console.log('[CLIENT] 📤 Mensagem enviada:', data);
        } else {
            console.warn('[CLIENT] ⚠️ WebSocket não está conectado, não foi possível enviar:', data);
        }
    }
    
    // Eventos customizados
    dispatchCustomEvent(eventName, data = {}) {
        const event = new CustomEvent(eventName, { detail: data });
        window.dispatchEvent(event);
        console.log('[CLIENT] 📡 Evento customizado disparado:', eventName);
    }
    
    setupEventListeners() {
        // Reconectar quando a aba volta ao foco
        document.addEventListener('visibilitychange', () => {
            if (!document.hidden) {
                console.log('[CLIENT] 👁️ Aba voltou ao foco');
                
                if (this.socket.readyState !== WebSocket.OPEN) {
                    console.log('[CLIENT] 🔄 Socket não está conectado, reconectando...');
                    this.connect();
                } else {
                    console.log('[CLIENT] ✅ Socket já está conectado');
                }
            }
        });
    }
    
    // Desconectar manualmente
    disconnect() {
        console.log('[CLIENT] 🔌 Desconexão manual iniciada');
        this.isIntentionalClose = true;
        this.stopHeartbeat();
        if (this.socket) {
            this.socket.close(1000, 'Desconexão intencional');
        }
    }
}

// Inicializar automaticamente se houver userId disponível
document.addEventListener('DOMContentLoaded', () => {
    const userIdElement = document.querySelector('[data-user-id]');
    if (userIdElement) {
        const userId = userIdElement.dataset.userId;
        
        console.log('[CLIENT] 🚀 Inicializando WebSocket Client para usuário:', userId);
        
        window.autoV7WS = new AutoV7WebSocketClient(userId);
        
        console.log('[CLIENT] ✅ WebSocket Client inicializado');
        
        // Adicionar controles de debug no console
        console.log('[CLIENT] 💡 Comandos disponíveis no console:');
        console.log('  - window.autoV7WS.disconnect() - Desconectar manualmente');
        console.log('  - window.autoV7WS.connect() - Reconectar manualmente');
        console.log('  - window.autoV7WS.send({type: "ping"}) - Enviar ping');
    } else {
        console.warn('[CLIENT] ⚠️ Elemento [data-user-id] não encontrado, WebSocket não inicializado');
    }
});
