/**
 * WebSocket Admin para Administradores AutoV7
 * Gerencia conexão WebSocket em tempo real para administradores
 */

class AutoV7WebSocketAdmin {
    constructor() {
        this.socket = null;
        this.reconnectAttempts = 0;
        this.maxReconnectAttempts = 5;
        this.reconnectDelay = 3000;
        this.heartbeatInterval = null;
        this.isIntentionalClose = false;
        this.soundEnabled = true;
        
        this.init();
    }
    
    init() {
        this.connect();
        this.setupEventListeners();
        this.loadSoundPreference();
    }
    
    connect() {
        const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
        const wsUrl = `${protocol}//${window.location.host}/ws/admin/`;
        
        console.log('[ADMIN] Conectando ao WebSocket:', wsUrl);
        
        try {
            this.socket = new WebSocket(wsUrl);
            
            this.socket.onopen = (event) => this.onOpen(event);
            this.socket.onmessage = (event) => this.onMessage(event);
            this.socket.onerror = (event) => this.onError(event);
            this.socket.onclose = (event) => this.onClose(event);
            
        } catch (error) {
            console.error('[ADMIN] Erro ao criar WebSocket:', error);
            this.scheduleReconnect();
        }
    }
    
    onOpen(event) {
        console.log('[ADMIN] WebSocket conectado com sucesso!');
        this.reconnectAttempts = 0;
        this.showConnectionStatus('connected');
        this.startHeartbeat();
        this.dispatchCustomEvent('admin:websocket:connected');
    }
    
    onMessage(event) {
        try {
            const data = JSON.parse(event.data);
            console.log('[ADMIN] Mensagem recebida:', data);
            this.handleMessage(data);
        } catch (error) {
            console.error('[ADMIN] Erro ao processar mensagem:', error);
        }
    }
    
    onError(event) {
        console.error('[ADMIN] Erro no WebSocket:', event);
        this.showConnectionStatus('error');
    }
    
    onClose(event) {
        console.log('[ADMIN] WebSocket desconectado:', event.code, event.reason);
        this.stopHeartbeat();
        this.showConnectionStatus('disconnected');
        
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
                
            case 'new_appointment':
                this.handleNewAppointment(data);
                break;
                
            case 'appointment_cancelled_by_client':
                this.handleAppointmentCancelledByClient(data);
                break;
                
            case 'new_customer':
                this.handleNewCustomer(data);
                break;
                
            case 'new_vehicle':
                this.handleNewVehicle(data);
                break;
                
            case 'stats_update':
                this.handleStatsUpdate(data);
                break;
                
            case 'pong':
                break;
                
            default:
                console.warn('[ADMIN] Tipo de mensagem não reconhecido:', type);
        }
    }
    
    handleConnectionEstablished(data) {
        console.log('[ADMIN] Conexão estabelecida:', data.message);
        this.showNotification('success', 'Painel Administrativo', 'Conectado ao sistema em tempo real!');
    }
    
    handleNewAppointment(data) {
        const {
            appointment_id,
            client_name,
            client_email,
            vehicle,
            service,
            date,
            time,
            total_price,
            created_at
        } = data;
        
        // Tocar som de notificação
        this.playNotificationSound();
        
        // Mostrar notificação destacada
        this.showNotification(
            'info',
            '🔔 Novo Agendamento!',
            `${client_name} agendou ${service} para ${date} às ${time}`
        );
        
        // Adicionar à lista de agendamentos em tempo real
        this.addAppointmentToList(data);
        
        // Atualizar contador de pendentes
        this.incrementPendingCounter();
        
        // Criar notificação desktop se permitido
        this.showDesktopNotification('Novo Agendamento', `${client_name} - ${service}`);
        
        this.dispatchCustomEvent('admin:new_appointment', data);
    }
    
    handleAppointmentCancelledByClient(data) {
        const { appointment_id, client_name, reason } = data;
        
        this.showNotification(
            'warning',
            'Agendamento Cancelado',
            `${client_name} cancelou o agendamento. Motivo: ${reason}`
        );
        
        // Remover ou marcar como cancelado na UI
        this.markAppointmentAsCancelled(appointment_id);
        
        this.dispatchCustomEvent('admin:appointment_cancelled', data);
    }
    
    handleNewCustomer(data) {
        const { customer_id, name, email, joined_at } = data;
        
        this.showNotification('success', 'Novo Cliente', `${name} se cadastrou no sistema!`);
        
        // Atualizar contador de clientes
        this.updateCustomerCount(1);
        
        this.dispatchCustomEvent('admin:new_customer', data);
    }
    
    handleNewVehicle(data) {
        const { vehicle_id, owner_name, vehicle, plate } = data;
        
        this.showNotification('info', 'Novo Veículo', `${owner_name} cadastrou ${vehicle} (${plate})`);
        
        this.dispatchCustomEvent('admin:new_vehicle', data);
    }
    
    handleStatsUpdate(data) {
        const { stats } = data;
        
        // Atualizar estatísticas no dashboard
        this.updateDashboardStats(stats);
        
        this.dispatchCustomEvent('admin:stats_update', data);
    }
    
    // Métodos de UI para Admin
    addAppointmentToList(appointmentData) {
        const appointmentList = document.querySelector('#admin-appointments-list, .appointments-table tbody');
        
        if (!appointmentList) return;
        
        // Criar elemento do novo agendamento
        const row = document.createElement('tr');
        row.className = 'new-appointment-highlight';
        row.dataset.appointmentId = appointmentData.appointment_id;
        row.innerHTML = `
            <td>${appointmentData.appointment_id}</td>
            <td>${appointmentData.client_name}</td>
            <td>${appointmentData.vehicle}</td>
            <td>${appointmentData.service}</td>
            <td>${appointmentData.date}</td>
            <td>${appointmentData.time}</td>
            <td>R$ ${appointmentData.total_price}</td>
            <td><span class="badge badge-warning">Pendente</span></td>
            <td>
                <button class="btn btn-sm btn-success" onclick="confirmAppointment(${appointmentData.appointment_id})">
                    Confirmar
                </button>
                <button class="btn btn-sm btn-primary" onclick="viewAppointment(${appointmentData.appointment_id})">
                    Ver
                </button>
            </td>
        `;
        
        // Inserir no topo da lista
        appointmentList.insertBefore(row, appointmentList.firstChild);
        
        // Remover destaque após 3 segundos
        setTimeout(() => {
            row.classList.remove('new-appointment-highlight');
        }, 3000);
    }
    
    markAppointmentAsCancelled(appointmentId) {
        const row = document.querySelector(`tr[data-appointment-id="${appointmentId}"]`);
        if (row) {
            const statusBadge = row.querySelector('.badge');
            if (statusBadge) {
                statusBadge.className = 'badge badge-danger';
                statusBadge.textContent = 'Cancelado';
            }
            row.classList.add('cancelled-appointment');
        }
    }
    
    incrementPendingCounter() {
        const pendingCounter = document.querySelector('.pending-appointments-count, #pending-count');
        if (pendingCounter) {
            const currentCount = parseInt(pendingCounter.textContent) || 0;
            pendingCounter.textContent = currentCount + 1;
            
            // Animar o contador
            pendingCounter.classList.add('count-updated');
            setTimeout(() => {
                pendingCounter.classList.remove('count-updated');
            }, 500);
        }
    }
    
    updateCustomerCount(increment) {
        const customerCounter = document.querySelector('.total-customers-count, #customers-count');
        if (customerCounter) {
            const currentCount = parseInt(customerCounter.textContent) || 0;
            customerCounter.textContent = currentCount + increment;
        }
    }
    
    updateDashboardStats(stats) {
        // Atualizar todos os elementos de estatísticas
        Object.keys(stats).forEach(statKey => {
            const element = document.querySelector(`[data-stat="${statKey}"]`);
            if (element) {
                element.textContent = stats[statKey];
                element.classList.add('stat-updated');
                setTimeout(() => {
                    element.classList.remove('stat-updated');
                }, 500);
            }
        });
    }
    
    showNotification(type, title, message) {
        if (typeof toastr !== 'undefined') {
            toastr.options = {
                closeButton: true,
                progressBar: true,
                positionClass: 'toast-top-right',
                timeOut: 5000
            };
            toastr[type](message, title);
        } else {
            console.log(`[ADMIN ${type.toUpperCase()}] ${title}: ${message}`);
            this.createVisualNotification(type, title, message);
        }
    }
    
    createVisualNotification(type, title, message) {
        const notification = document.createElement('div');
        notification.className = `admin-notification notification-${type}`;
        notification.innerHTML = `
            <div class="notification-icon">
                ${this.getNotificationIcon(type)}
            </div>
            <div class="notification-content">
                <strong>${title}</strong>
                <p>${message}</p>
            </div>
            <button class="notification-close">&times;</button>
        `;
        
        const container = document.querySelector('.admin-notifications-container') || document.body;
        container.appendChild(notification);
        
        setTimeout(() => {
            notification.classList.add('fade-out');
            setTimeout(() => notification.remove(), 300);
        }, 5000);
        
        notification.querySelector('.notification-close').addEventListener('click', () => {
            notification.remove();
        });
    }
    
    getNotificationIcon(type) {
        const icons = {
            'info': '📋',
            'success': '✅',
            'warning': '⚠️',
            'error': '❌'
        };
        return icons[type] || '📋';
    }
    
    showConnectionStatus(status) {
        const statusIndicator = document.querySelector('.admin-connection-status');
        if (statusIndicator) {
            statusIndicator.className = `admin-connection-status status-${status}`;
            
            const statusText = {
                'connected': 'Online',
                'disconnected': 'Offline',
                'error': 'Erro'
            };
            
            statusIndicator.textContent = statusText[status] || status;
        }
    }
    
    // Notificações Desktop (Browser Notifications API)
    showDesktopNotification(title, body) {
        if (!('Notification' in window)) return;
        
        if (Notification.permission === 'granted') {
            new Notification(title, {
                body: body,
                icon: '/static/images/logo.png',
                badge: '/static/images/badge.png'
            });
        } else if (Notification.permission !== 'denied') {
            Notification.requestPermission().then(permission => {
                if (permission === 'granted') {
                    new Notification(title, {
                        body: body,
                        icon: '/static/images/logo.png'
                    });
                }
            });
        }
    }
    
    // Som de notificação
    playNotificationSound() {
        if (!this.soundEnabled) return;
        
        const audio = new Audio('/static/sounds/notification.mp3');
        audio.volume = 0.5;
        audio.play().catch(error => {
            console.log('Não foi possível reproduzir som:', error);
        });
    }
    
    loadSoundPreference() {
        const soundPref = localStorage.getItem('admin_sound_enabled');
        this.soundEnabled = soundPref !== 'false';
    }
    
    toggleSound() {
        this.soundEnabled = !this.soundEnabled;
        localStorage.setItem('admin_sound_enabled', this.soundEnabled);
        return this.soundEnabled;
    }
    
    // Heartbeat
    startHeartbeat() {
        this.heartbeatInterval = setInterval(() => {
            if (this.socket && this.socket.readyState === WebSocket.OPEN) {
                this.send({
                    type: 'ping',
                    timestamp: Date.now()
                });
            }
        }, 30000);
    }
    
    stopHeartbeat() {
        if (this.heartbeatInterval) {
            clearInterval(this.heartbeatInterval);
            this.heartbeatInterval = null;
        }
    }
    
    // Reconexão
    scheduleReconnect() {
        if (this.reconnectAttempts >= this.maxReconnectAttempts) {
            console.error('[ADMIN] Máximo de tentativas de reconexão atingido');
            this.showNotification('error', 'Erro de Conexão', 'Não foi possível conectar ao servidor. Recarregue a página.');
            return;
        }
        
        this.reconnectAttempts++;
        console.log(`[ADMIN] Reconectando em ${this.reconnectDelay/1000}s... (${this.reconnectAttempts}/${this.maxReconnectAttempts})`);
        
        setTimeout(() => {
            this.connect();
        }, this.reconnectDelay);
    }
    
    send(data) {
        if (this.socket && this.socket.readyState === WebSocket.OPEN) {
            this.socket.send(JSON.stringify(data));
        } else {
            console.warn('[ADMIN] WebSocket não está conectado');
        }
    }
    
    dispatchCustomEvent(eventName, data = {}) {
        const event = new CustomEvent(eventName, { detail: data });
        window.dispatchEvent(event);
    }
    
    setupEventListeners() {
        document.addEventListener('visibilitychange', () => {
            if (!document.hidden && this.socket.readyState !== WebSocket.OPEN) {
                console.log('[ADMIN] Aba voltou ao foco, reconectando...');
                this.connect();
            }
        });
    }
    
    disconnect() {
        this.isIntentionalClose = true;
        this.stopHeartbeat();
        if (this.socket) {
            this.socket.close();
        }
    }
}

// Inicializar para administradores
document.addEventListener('DOMContentLoaded', () => {
    const isAdmin = document.body.classList.contains('admin-panel') || 
                    document.querySelector('[data-user-role="admin"]');
    
    if (isAdmin) {
        window.autoV7AdminWS = new AutoV7WebSocketAdmin();
        console.log('[ADMIN] WebSocket Admin inicializado');
        
        // Solicitar permissão para notificações desktop
        if ('Notification' in window && Notification.permission === 'default') {
            Notification.requestPermission();
        }
    }
});
