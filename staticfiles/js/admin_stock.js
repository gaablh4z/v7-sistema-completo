// Sistema de Gestão de Estoque - Debug Version
console.log('Carregando admin_stock.js...');

function stockManager() {
    return {
        // Dados
        products: [],
        filteredProducts: [],
        stats: {
            total_produtos: 0,
            produtos_sem_estoque: 0,
            produtos_estoque_baixo: 0,
            valor_total: 0
        },
        apiStatus: 'Não testado',
        
        // Filtros
        filters: {
            search: '',
            categoria: '',
            status: ''
        },
        
        // Inicialização
        async init() {
            console.log('Inicializando stockManager...');
            this.apiStatus = 'Iniciando...';
            
            try {
                await this.loadProducts();
                await this.loadStats();
                this.apiStatus = 'Conectado';
                console.log('stockManager inicializado com sucesso!');
            } catch (error) {
                console.error('Erro ao inicializar:', error);
                this.apiStatus = 'Erro: ' + error.message;
            }
        },
        
        // Carregar dados
        async loadProducts() {
            try {
                console.log('Carregando produtos...');
                const response = await fetch('/admin-panel/api/produtos/', {
                    headers: {
                        'Accept': 'application/json'
                    }
                });
                
                if (!response.ok) {
                    throw new Error(`HTTP ${response.status}: ${response.statusText}`);
                }
                
                const data = await response.json();
                this.products = data.map(produto => ({
                    ...produto,
                    quantidade_minima: produto.quantidade_minima || 5
                }));
                
                console.log('Produtos carregados:', this.products.length);
                this.filterProducts();
            } catch (error) {
                console.error('Erro ao carregar produtos:', error);
                this.showNotification('Erro ao carregar produtos: ' + error.message, 'error');
                // Dados de exemplo para teste
                this.products = [
                    {
                        id: 1,
                        nome: 'Produto Teste',
                        categoria: 'teste',
                        quantidade: 10,
                        quantidade_minima: 5,
                        preco_unitario: 25.90
                    }
                ];
                this.filterProducts();
            }
        },
        
        async loadStats() {
            try {
                console.log('Carregando estatísticas...');
                const response = await fetch('/admin-panel/api/estoque/estatisticas/');
                if (response.ok) {
                    this.stats = await response.json();
                } else {
                    throw new Error('Falha ao carregar estatísticas');
                }
            } catch (error) {
                console.error('Erro ao carregar estatísticas:', error);
                // Calcular estatísticas localmente
                this.stats = {
                    total_produtos: this.products.length,
                    produtos_sem_estoque: this.products.filter(p => p.quantidade === 0).length,
                    produtos_estoque_baixo: this.products.filter(p => p.quantidade > 0 && p.quantidade <= p.quantidade_minima).length,
                    valor_total: this.products.reduce((total, p) => total + (p.preco_unitario * p.quantidade), 0)
                };
            }
        },
        
        // Teste de API
        async testAPI() {
            this.apiStatus = 'Testando...';
            try {
                const response = await fetch('/admin-panel/api/produtos/', {
                    method: 'GET',
                    headers: {
                        'Accept': 'application/json'
                    }
                });
                
                if (response.ok) {
                    const data = await response.json();
                    this.apiStatus = `API OK - ${data.length} produtos`;
                    this.showNotification('API funcionando corretamente!', 'success');
                } else {
                    this.apiStatus = `Erro HTTP ${response.status}`;
                    this.showNotification(`Erro na API: ${response.status}`, 'error');
                }
            } catch (error) {
                this.apiStatus = 'Erro de conexão';
                this.showNotification('Erro de conexão com a API', 'error');
                console.error('Erro no teste da API:', error);
            }
        },
        
        // Filtros e busca
        filterProducts() {
            let filtered = [...this.products];
            
            // Filtro de busca
            if (this.filters.search && this.filters.search.trim()) {
                const search = this.filters.search.toLowerCase().trim();
                filtered = filtered.filter(produto => 
                    produto.nome.toLowerCase().includes(search) ||
                    (produto.sku && produto.sku.toLowerCase().includes(search))
                );
            }
            
            this.filteredProducts = filtered;
        },
        
        // Utilitários
        formatCurrency(value) {
            return new Intl.NumberFormat('pt-BR', {
                style: 'currency',
                currency: 'BRL'
            }).format(value || 0);
        },
        
        showNotification(message, type) {
            type = type || 'info';
            console.log(`${type.toUpperCase()}: ${message}`);
            
            // Criar toast notification
            const toast = document.createElement('div');
            toast.className = 'fixed top-4 right-4 px-6 py-3 rounded-lg text-white z-50 transition-all duration-300 transform translate-x-full';
            
            switch (type) {
                case 'success':
                    toast.className += ' bg-green-500';
                    break;
                case 'error':
                    toast.className += ' bg-red-500';
                    break;
                case 'warning':
                    toast.className += ' bg-yellow-500';
                    break;
                default:
                    toast.className += ' bg-blue-500';
            }
            
            toast.textContent = message;
            document.body.appendChild(toast);
            
            // Animar entrada
            setTimeout(function() {
                toast.classList.remove('translate-x-full');
            }, 100);
            
            // Remover após 3 segundos
            setTimeout(function() {
                toast.classList.add('translate-x-full');
                setTimeout(function() {
                    if (document.body.contains(toast)) {
                        document.body.removeChild(toast);
                    }
                }, 300);
            }, 3000);
        }
    };
}

// Funções globais para compatibilidade
window.showAddProductModal = function() {
    console.log('showAddProductModal chamada');
    alert('Modal de adicionar produto em desenvolvimento...');
};

window.showStockMovementModal = function() {
    console.log('showStockMovementModal chamada');
    alert('Modal de movimentação de estoque em desenvolvimento...');
};

window.exportStock = function() {
    console.log('exportStock chamada');
    window.location.href = '/admin-panel/api/estoque/exportar/';
};

// Registrar a função com Alpine.js
document.addEventListener('DOMContentLoaded', function() {
    console.log('DOM carregado, registrando stockManager');
    
    // Aguardar Alpine.js
    if (typeof Alpine !== 'undefined') {
        console.log('Alpine.js encontrado');
        Alpine.data('stockManager', stockManager);
    } else {
        console.log('Alpine.js não encontrado, aguardando...');
        setTimeout(function() {
            if (typeof Alpine !== 'undefined') {
                console.log('Alpine.js carregado tardiamente');
                Alpine.data('stockManager', stockManager);
            } else {
                console.error('Alpine.js não carregou!');
            }
        }, 1000);
    }
});

console.log('admin_stock.js carregado completamente');