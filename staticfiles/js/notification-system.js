/**
 * Professional Notification System for AutoV7
 * Toast notifications, real-time alerts, and notification center
 */

class NotificationSystem {
    constructor() {
        this.notifications = [];
        this.container = null;
        this.soundEnabled = true;
        this.init();
    }

    init() {
        this.createContainer();
        this.setupEventListeners();
        this.loadSettings();
    }

    createContainer() {
        // Main notification container
        this.container = document.createElement('div');
        this.container.id = 'notification-system';
        this.container.className = 'fixed top-4 right-4 z-50 space-y-2 max-w-sm';
        document.body.appendChild(this.container);

        // Notification center overlay
        const centerOverlay = document.createElement('div');
        centerOverlay.id = 'notification-center-overlay';
        centerOverlay.className = 'fixed inset-0 bg-black bg-opacity-50 hidden z-40';
        centerOverlay.onclick = () => this.closeNotificationCenter();
        document.body.appendChild(centerOverlay);

        // Notification center panel
        const centerPanel = document.createElement('div');
        centerPanel.id = 'notification-center';
        centerPanel.className = 'fixed top-0 right-0 h-full w-96 bg-slate-800 shadow-2xl transform translate-x-full transition-transform duration-300 z-50';
        centerPanel.innerHTML = this.createNotificationCenterHTML();
        document.body.appendChild(centerPanel);
    }

    createNotificationCenterHTML() {
        return `
            <div class="h-full flex flex-col">
                <!-- Header -->
                <div class="flex items-center justify-between p-4 border-b border-slate-700">
                    <h2 class="text-lg font-semibold text-white">Notificações</h2>
                    <div class="flex items-center gap-2">
                        <button onclick="notificationSystem.markAllAsRead()" class="text-slate-400 hover:text-white text-sm">
                            Marcar todas como lidas
                        </button>
                        <button onclick="notificationSystem.closeNotificationCenter()" class="text-slate-400 hover:text-white">
                            <i data-lucide="x" class="w-5 h-5"></i>
                        </button>
                    </div>
                </div>

                <!-- Filters -->
                <div class="p-4 border-b border-slate-700">
                    <div class="flex gap-2">
                        <button class="notification-filter active" data-filter="all">Todas</button>
                        <button class="notification-filter" data-filter="unread">Não lidas</button>
                        <button class="notification-filter" data-filter="important">Importantes</button>
                    </div>
                </div>

                <!-- Notifications List -->
                <div class="flex-1 overflow-y-auto" id="notification-center-list">
                    <div class="p-4 text-center text-slate-400">
                        <i data-lucide="bell" class="w-12 h-12 mx-auto mb-3 opacity-50"></i>
                        <p>Nenhuma notificação</p>
                    </div>
                </div>

                <!-- Footer -->
                <div class="p-4 border-t border-slate-700">
                    <button onclick="notificationSystem.clearAll()" class="w-full text-sm text-red-400 hover:text-red-300">
                        Limpar todas as notificações
                    </button>
                </div>
            </div>
        `;
    }

    setupEventListeners() {
        // Filter buttons
        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('notification-filter')) {
                this.filterNotifications(e.target.dataset.filter);
                
                // Update active filter
                document.querySelectorAll('.notification-filter').forEach(btn => {
                    btn.classList.remove('active');
                });
                e.target.classList.add('active');
            }
        });

        // Real-time updates (WebSocket simulation)
        this.startRealTimeUpdates();
    }

    loadSettings() {
        const settings = localStorage.getItem('notification-settings');
        if (settings) {
            const parsed = JSON.parse(settings);
            this.soundEnabled = parsed.soundEnabled !== false;
        }
    }

    saveSettings() {
        localStorage.setItem('notification-settings', JSON.stringify({
            soundEnabled: this.soundEnabled
        }));
    }

    // Main notification methods
    show(message, type = 'info', options = {}) {
        const notification = {
            id: this.generateId(),
            message,
            type,
            timestamp: new Date(),
            read: false,
            important: options.important || false,
            persistent: options.persistent || false,
            actions: options.actions || [],
            ...options
        };

        this.notifications.unshift(notification);
        this.createToast(notification);
        this.updateNotificationCenter();
        this.updateBadge();

        if (this.soundEnabled && type !== 'info') {
            this.playNotificationSound(type);
        }

        return notification.id;
    }

    createToast(notification) {
        const toast = document.createElement('div');
        toast.className = `notification-toast notification-${notification.type} transform transition-all duration-300 translate-x-full`;
        toast.dataset.id = notification.id;
        
        const typeIcons = {
            success: 'check-circle',
            error: 'x-circle',
            warning: 'alert-triangle',
            info: 'info',
            system: 'settings'
        };

        const typeColors = {
            success: 'bg-green-600 border-green-500',
            error: 'bg-red-600 border-red-500',
            warning: 'bg-yellow-600 border-yellow-500',
            info: 'bg-blue-600 border-blue-500',
            system: 'bg-purple-600 border-purple-500'
        };

        toast.innerHTML = `
            <div class="flex items-start gap-3 p-4 rounded-lg shadow-lg ${typeColors[notification.type]} border-l-4 text-white max-w-sm">
                <div class="flex-shrink-0">
                    <i data-lucide="${typeIcons[notification.type]}" class="w-5 h-5"></i>
                </div>
                <div class="flex-1 min-w-0">
                    ${notification.title ? `<h4 class="font-semibold text-sm mb-1">${notification.title}</h4>` : ''}
                    <p class="text-sm opacity-90">${notification.message}</p>
                    ${notification.actions.length > 0 ? this.createToastActions(notification.actions) : ''}
                </div>
                <button onclick="notificationSystem.dismissToast('${notification.id}')" class="flex-shrink-0 text-white hover:text-gray-200">
                    <i data-lucide="x" class="w-4 h-4"></i>
                </button>
            </div>
        `;

        this.container.appendChild(toast);
        
        // Initialize icons
        if (typeof lucide !== 'undefined') {
            lucide.createIcons();
        }

        // Animate in
        setTimeout(() => {
            toast.classList.remove('translate-x-full');
        }, 100);

        // Auto-dismiss (unless persistent)
        if (!notification.persistent) {
            setTimeout(() => {
                this.dismissToast(notification.id);
            }, notification.duration || 5000);
        }
    }

    createToastActions(actions) {
        return `
            <div class="flex gap-2 mt-2">
                ${actions.map(action => `
                    <button onclick="${action.onclick}" class="px-2 py-1 text-xs bg-white bg-opacity-20 hover:bg-opacity-30 rounded transition-colors">
                        ${action.label}
                    </button>
                `).join('')}
            </div>
        `;
    }

    dismissToast(id) {
        const toast = document.querySelector(`[data-id="${id}"]`);
        if (toast) {
            toast.classList.add('translate-x-full');
            setTimeout(() => {
                toast.remove();
            }, 300);
        }
    }

    updateNotificationCenter() {
        const list = document.getElementById('notification-center-list');
        if (!list) return;

        if (this.notifications.length === 0) {
            list.innerHTML = `
                <div class="p-4 text-center text-slate-400">
                    <i data-lucide="bell" class="w-12 h-12 mx-auto mb-3 opacity-50"></i>
                    <p>Nenhuma notificação</p>
                </div>
            `;
            return;
        }

        list.innerHTML = this.notifications.map(notification => `
            <div class="notification-item ${notification.read ? 'read' : 'unread'} ${notification.important ? 'important' : ''}" data-id="${notification.id}">
                <div class="flex items-start gap-3 p-4 hover:bg-slate-700 transition-colors">
                    <div class="flex-shrink-0">
                        <div class="w-8 h-8 rounded-full bg-${this.getTypeColor(notification.type)}-600 flex items-center justify-center">
                            <i data-lucide="${this.getTypeIcon(notification.type)}" class="w-4 h-4 text-white"></i>
                        </div>
                    </div>
                    <div class="flex-1 min-w-0">
                        ${notification.title ? `<h4 class="font-medium text-white text-sm mb-1">${notification.title}</h4>` : ''}
                        <p class="text-sm text-slate-300">${notification.message}</p>
                        <p class="text-xs text-slate-500 mt-1">${this.formatTime(notification.timestamp)}</p>
                    </div>
                    <div class="flex items-center gap-2">
                        ${!notification.read ? '<div class="w-2 h-2 bg-blue-500 rounded-full"></div>' : ''}
                        <button onclick="notificationSystem.removeNotification('${notification.id}')" class="text-slate-400 hover:text-red-400">
                            <i data-lucide="x" class="w-4 h-4"></i>
                        </button>
                    </div>
                </div>
            </div>
        `).join('');

        if (typeof lucide !== 'undefined') {
            lucide.createIcons();
        }
    }

    updateBadge() {
        const unreadCount = this.notifications.filter(n => !n.read).length;
        const badges = document.querySelectorAll('.notification-badge');
        
        badges.forEach(badge => {
            if (unreadCount > 0) {
                badge.textContent = unreadCount > 99 ? '99+' : unreadCount;
                badge.classList.remove('hidden');
            } else {
                badge.classList.add('hidden');
            }
        });
    }

    openNotificationCenter() {
        document.getElementById('notification-center-overlay').classList.remove('hidden');
        document.getElementById('notification-center').classList.remove('translate-x-full');
        
        // Mark visible notifications as read
        this.notifications.forEach(notification => {
            if (!notification.read) {
                notification.read = true;
            }
        });
        
        this.updateNotificationCenter();
        this.updateBadge();
    }

    closeNotificationCenter() {
        document.getElementById('notification-center-overlay').classList.add('hidden');
        document.getElementById('notification-center').classList.add('translate-x-full');
    }

    filterNotifications(filter) {
        const items = document.querySelectorAll('.notification-item');
        
        items.forEach(item => {
            const notification = this.notifications.find(n => n.id === item.dataset.id);
            let show = false;
            
            switch(filter) {
                case 'all':
                    show = true;
                    break;
                case 'unread':
                    show = !notification.read;
                    break;
                case 'important':
                    show = notification.important;
                    break;
            }
            
            item.style.display = show ? 'block' : 'none';
        });
    }

    markAllAsRead() {
        this.notifications.forEach(notification => {
            notification.read = true;
        });
        this.updateNotificationCenter();
        this.updateBadge();
    }

    removeNotification(id) {
        this.notifications = this.notifications.filter(n => n.id !== id);
        this.updateNotificationCenter();
        this.updateBadge();
    }

    clearAll() {
        if (confirm('Tem certeza que deseja limpar todas as notificações?')) {
            this.notifications = [];
            this.updateNotificationCenter();
            this.updateBadge();
        }
    }

    startRealTimeUpdates() {
        // Simulate real-time notifications
        setInterval(() => {
            this.checkForUpdates();
        }, 30000); // Check every 30 seconds
    }

    checkForUpdates() {
        // This would typically fetch from your API
        fetch('/admin-panel/api/notifications/')
            .then(response => response.json())
            .then(data => {
                data.notifications?.forEach(notification => {
                    // Only show if it's newer than our last notification
                    if (!this.notifications.find(n => n.id === notification.id)) {
                        this.show(notification.message, notification.type, {
                            title: notification.title,
                            important: notification.important
                        });
                    }
                });
            })
            .catch(error => {
                console.error('Error checking for notifications:', error);
            });
    }

    playNotificationSound(type) {
        if (!this.soundEnabled) return;
        
        // Create audio context for modern browsers
        try {
            const audioContext = new (window.AudioContext || window.webkitAudioContext)();
            const oscillator = audioContext.createOscillator();
            const gainNode = audioContext.createGain();
            
            oscillator.connect(gainNode);
            gainNode.connect(audioContext.destination);
            
            // Different tones for different types
            const frequencies = {
                success: 800,
                error: 400,
                warning: 600,
                system: 1000
            };
            
            oscillator.frequency.value = frequencies[type] || 500;
            oscillator.type = 'sine';
            
            gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
            gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5);
            
            oscillator.start(audioContext.currentTime);
            oscillator.stop(audioContext.currentTime + 0.5);
        } catch (error) {
            console.log('Audio notification not supported');
        }
    }

    // Utility methods
    generateId() {
        return 'notification_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    }

    getTypeColor(type) {
        const colors = {
            success: 'green',
            error: 'red',
            warning: 'yellow',
            info: 'blue',
            system: 'purple'
        };
        return colors[type] || 'blue';
    }

    getTypeIcon(type) {
        const icons = {
            success: 'check-circle',
            error: 'x-circle',
            warning: 'alert-triangle',
            info: 'info',
            system: 'settings'
        };
        return icons[type] || 'info';
    }

    formatTime(timestamp) {
        const now = new Date();
        const diff = now - timestamp;
        const minutes = Math.floor(diff / 60000);
        const hours = Math.floor(minutes / 60);
        const days = Math.floor(hours / 24);
        
        if (days > 0) return `${days}d atrás`;
        if (hours > 0) return `${hours}h atrás`;
        if (minutes > 0) return `${minutes}min atrás`;
        return 'Agora';
    }

    // Public API methods
    success(message, options = {}) {
        return this.show(message, 'success', options);
    }

    error(message, options = {}) {
        return this.show(message, 'error', options);
    }

    warning(message, options = {}) {
        return this.show(message, 'warning', options);
    }

    info(message, options = {}) {
        return this.show(message, 'info', options);
    }

    system(message, options = {}) {
        return this.show(message, 'system', options);
    }
}

// CSS for notification system
const notificationCSS = `
.notification-toast {
    pointer-events: auto;
}

.notification-filter {
    padding: 0.5rem 1rem;
    border-radius: 0.375rem;
    font-size: 0.875rem;
    color: #94a3b8;
    background: transparent;
    border: 1px solid transparent;
    transition: all 0.2s ease;
}

.notification-filter:hover {
    color: #e2e8f0;
    background: rgba(51, 65, 85, 0.5);
}

.notification-filter.active {
    color: #3b82f6;
    background: rgba(59, 130, 246, 0.1);
    border-color: rgba(59, 130, 246, 0.3);
}

.notification-item.unread {
    background: rgba(59, 130, 246, 0.05);
    border-left: 3px solid #3b82f6;
}

.notification-item.important {
    background: rgba(239, 68, 68, 0.05);
    border-left: 3px solid #ef4444;
}

.notification-badge {
    position: absolute;
    top: -2px;
    right: -2px;
    background: #ef4444;
    color: white;
    border-radius: 9999px;
    font-size: 0.75rem;
    font-weight: 600;
    padding: 0.125rem 0.375rem;
    min-width: 1.25rem;
    height: 1.25rem;
    display: flex;
    align-items: center;
    justify-content: center;
}
`;

// Initialize notification system
let notificationSystem;

document.addEventListener('DOMContentLoaded', function() {
    // Inject CSS
    const style = document.createElement('style');
    style.textContent = notificationCSS;
    document.head.appendChild(style);
    
    // Initialize system
    notificationSystem = new NotificationSystem();
    
    // Make it globally available
    window.notificationSystem = notificationSystem;
    
    // Update notification button click handler
    const notificationButton = document.querySelector('button[onclick="toggleNotifications()"]');
    if (notificationButton) {
        notificationButton.onclick = () => notificationSystem.openNotificationCenter();
    }
});

// Export for module systems
if (typeof module !== 'undefined' && module.exports) {
    module.exports = NotificationSystem;
}