/**
 * Sistema de Toggle da Sidebar Profissional - SEM BOOTSTRAP
 * Versão limpa sem dependências externas
 */

document.addEventListener('DOMContentLoaded', function() {
    // Elementos principais
    const sidebar = document.getElementById('sidebar');
    const overlay = document.getElementById('sidebarOverlay');
    
    if (!sidebar) {
        console.log('Sidebar não encontrada');
        return;
    }
    
    console.log('Sidebar inicializada com sucesso');
    
    // Estado
    let isCollapsed = localStorage.getItem('sidebarCollapsed') === 'true';
    
    // Aplicar estado inicial para desktop
    if (isCollapsed && window.innerWidth > 992) {
        sidebar.classList.add('collapsed');
    }
    
    // Função para toggle mobile - GLOBAL
    window.toggleSidebar = function() {
        console.log('Toggle sidebar mobile');
        if (window.innerWidth <= 992) {
            sidebar.classList.toggle('show');
            if (overlay) {
                overlay.classList.toggle('show');
            }
        }
    };
    
    // Função para toggle desktop - GLOBAL
    window.toggleSidebarCollapse = function() {
        console.log('Toggle sidebar collapse');
        if (window.innerWidth > 992) {
            sidebar.classList.toggle('collapsed');
            isCollapsed = sidebar.classList.contains('collapsed');
            localStorage.setItem('sidebarCollapsed', isCollapsed);
        }
    };
    
    // Função para toggle do menu do usuário
    window.toggleUserMenu = function() {
        const dropdown = document.getElementById('userDropdown');
        if (dropdown) {
            dropdown.style.display = dropdown.style.display === 'none' ? 'block' : 'none';
        }
    };
    
    // Fechar sidebar mobile ao clicar fora
    document.addEventListener('click', function(e) {
        if (window.innerWidth <= 992) {
            if (!sidebar.contains(e.target) && !e.target.closest('[onclick*="toggleSidebar"]')) {
                sidebar.classList.remove('show');
                if (overlay) {
                    overlay.classList.remove('show');
                }
            }
        }
        
        // Fechar user dropdown ao clicar fora
        const dropdown = document.getElementById('userDropdown');
        const userProfile = document.querySelector('.user-profile');
        if (dropdown && !userProfile.contains(e.target)) {
            dropdown.style.display = 'none';
        }
    });
    
    // ESC para fechar mobile
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape') {
            if (window.innerWidth <= 992) {
                sidebar.classList.remove('show');
                if (overlay) {
                    overlay.classList.remove('show');
                }
            }
            
            // Fechar user dropdown
            const dropdown = document.getElementById('userDropdown');
            if (dropdown) {
                dropdown.style.display = 'none';
            }
        }
    });
    
    // Handle resize
    window.addEventListener('resize', function() {
        if (window.innerWidth > 992) {
            // Desktop: remover estado mobile
            sidebar.classList.remove('show');
            if (overlay) {
                overlay.classList.remove('show');
            }
            // Aplicar collapsed se salvo
            if (isCollapsed) {
                sidebar.classList.add('collapsed');
            }
        } else {
            // Mobile: remover collapsed
            sidebar.classList.remove('collapsed');
        }
    });
    
    // Inicializar Lucide icons quando disponível
    setTimeout(function() {
        if (typeof lucide !== 'undefined') {
            lucide.createIcons();
        }
    }, 500);
    
    // Marcar link ativo
    const currentPath = window.location.pathname;
    const navLinks = document.querySelectorAll('.nav-link-custom');
    
    navLinks.forEach(function(link) {
        const href = link.getAttribute('href');
        link.classList.remove('active');
        
        if (href && currentPath.includes(href) && href !== '/admin-panel/') {
            link.classList.add('active');
        } else if (href === '/admin-panel/' && currentPath === '/admin-panel/') {
            link.classList.add('active');
        }
    });
    
    // Melhorias visuais simples
    navLinks.forEach(function(link) {
        link.addEventListener('mouseenter', function() {
            if (!this.classList.contains('active')) {
                this.style.transform = 'translateX(4px)';
            }
        });
        
        link.addEventListener('mouseleave', function() {
            if (!this.classList.contains('active')) {
                this.style.transform = 'translateX(0)';
            }
        });
    });
    
    console.log('Sidebar sistema carregado completamente');
});