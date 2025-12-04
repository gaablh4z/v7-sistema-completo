/**
 * Script de Emergência - Remove loading infinito
 */

// Remove qualquer loading que possa estar travando
document.addEventListener('DOMContentLoaded', function() {
    console.log('Script de emergência carregado');
    
    // Remove loadings que possam estar travando
    setTimeout(function() {
        const loadings = document.querySelectorAll('.loading-overlay, #loading-overlay, .spinner-border, .loading-spinner');
        loadings.forEach(function(loading) {
            if (loading) {
                loading.remove();
            }
        });
        
        // Remove ${message} que possa estar aparecendo
        const body = document.body;
        if (body && body.innerHTML.includes('${message}')) {
            const messageElements = document.querySelectorAll('*');
            messageElements.forEach(function(el) {
                if (el.textContent && el.textContent.trim() === '${message}') {
                    el.style.display = 'none';
                }
            });
        }
        
        console.log('Limpeza de loading concluída');
    }, 1000);
    
    // Garante que a sidebar funcione mesmo sem outros scripts
    window.toggleSidebar = window.toggleSidebar || function() {
        const sidebar = document.getElementById('sidebar');
        if (sidebar) {
            sidebar.classList.toggle('show');
        }
    };
    
    window.toggleSidebarCollapse = window.toggleSidebarCollapse || function() {
        const sidebar = document.getElementById('sidebar');
        if (sidebar) {
            sidebar.classList.toggle('collapsed');
        }
    };
});

// Remove loading se ainda estiver presente após 3 segundos
setTimeout(function() {
    const stubborn = document.querySelectorAll('[class*="loading"], [id*="loading"], [class*="spinner"]');
    stubborn.forEach(function(el) {
        if (el && el.style) {
            el.style.display = 'none';
        }
    });
    console.log('Limpeza final executada');
}, 3000);