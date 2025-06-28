// Sistema de gerenciamento de estoque local
export interface Product {
  id: string;
  name: string;
  description: string;
  category: string;
  quantity: number;
  min_quantity: number;
  unit_price: number;
  supplier: string;
  sku?: string;
  location?: string;
  created_at: string;
  updated_at: string;
}

export interface StockMovement {
  id: string;
  product_id: string;
  type: 'entrada' | 'saida' | 'ajuste';
  quantity: number;
  previous_quantity: number;
  new_quantity: number;
  reason: string;
  user: string;
  created_at: string;
}

export interface StockAlert {
  id: string;
  product_id: string;
  type: 'low_stock' | 'out_of_stock' | 'expired';
  message: string;
  created_at: string;
  resolved: boolean;
}

class InventoryStorage {
  private static readonly PRODUCTS_KEY = 'v7_inventory_products';
  private static readonly MOVEMENTS_KEY = 'v7_inventory_movements';
  private static readonly ALERTS_KEY = 'v7_inventory_alerts';

  // Dados de exemplo para demonstração
  private static getDefaultProducts(): Product[] {
    return [
      {
        id: '1',
        name: 'Shampoo Profissional',
        description: 'Shampoo para lavagem profissional de veículos',
        category: 'Produtos de Limpeza',
        quantity: 50,
        min_quantity: 10,
        unit_price: 15.90,
        supplier: 'Clean Car Produtos',
        sku: 'SHP-001',
        location: 'Estoque A - Prateleira 1',
        created_at: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
        updated_at: new Date().toISOString()
      },
      {
        id: '2',
        name: 'Cera Premium',
        description: 'Cera de carnaúba premium para proteção da pintura',
        category: 'Enceramento',
        quantity: 8,
        min_quantity: 5,
        unit_price: 89.90,
        supplier: 'AutoShine Brasil',
        sku: 'CER-002',
        location: 'Estoque A - Prateleira 2',
        created_at: new Date(Date.now() - 25 * 24 * 60 * 60 * 1000).toISOString(),
        updated_at: new Date().toISOString()
      },
      {
        id: '3',
        name: 'Microfibra 40x60cm',
        description: 'Pano de microfibra para secagem e acabamento',
        category: 'Acessórios',
        quantity: 25,
        min_quantity: 15,
        unit_price: 12.50,
        supplier: 'Microfibra Tech',
        sku: 'MIC-003',
        location: 'Estoque B - Gaveta 1',
        created_at: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000).toISOString(),
        updated_at: new Date().toISOString()
      },
      {
        id: '4',
        name: 'Desengraxante Concentrado',
        description: 'Desengraxante para limpeza pesada de motor e chassi',
        category: 'Produtos de Limpeza',
        quantity: 3,
        min_quantity: 8,
        unit_price: 25.90,
        supplier: 'Clean Car Produtos',
        sku: 'DES-004',
        location: 'Estoque A - Prateleira 3',
        created_at: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString(),
        updated_at: new Date().toISOString()
      },
      {
        id: '5',
        name: 'Pneu Pretinho',
        description: 'Renovador de pneus com proteção UV',
        category: 'Renovadores',
        quantity: 0,
        min_quantity: 6,
        unit_price: 18.90,
        supplier: 'AutoShine Brasil',
        sku: 'PNE-005',
        location: 'Estoque A - Prateleira 4',
        created_at: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
        updated_at: new Date().toISOString()
      }
    ];
  }

  // Operações com produtos
  static getAllProducts(): Product[] {
    const stored = localStorage.getItem(this.PRODUCTS_KEY);
    if (!stored) {
      const defaultProducts = this.getDefaultProducts();
      this.saveProducts(defaultProducts);
      return defaultProducts;
    }
    return JSON.parse(stored);
  }

  static saveProducts(products: Product[]): void {
    localStorage.setItem(this.PRODUCTS_KEY, JSON.stringify(products));
  }

  static addProduct(product: Omit<Product, 'id' | 'created_at' | 'updated_at'>): Product {
    const products = this.getAllProducts();
    const newProduct: Product = {
      ...product,
      id: Date.now().toString(),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    
    products.push(newProduct);
    this.saveProducts(products);
    this.checkLowStock(newProduct);
    
    return newProduct;
  }

  static updateProduct(id: string, updates: Partial<Product>): Product | null {
    const products = this.getAllProducts();
    const index = products.findIndex(p => p.id === id);
    
    if (index === -1) return null;
    
    const updatedProduct = {
      ...products[index],
      ...updates,
      updated_at: new Date().toISOString()
    };
    
    products[index] = updatedProduct;
    this.saveProducts(products);
    this.checkLowStock(updatedProduct);
    
    return updatedProduct;
  }

  static deleteProduct(id: string): boolean {
    const products = this.getAllProducts();
    const filteredProducts = products.filter(p => p.id !== id);
    
    if (filteredProducts.length === products.length) return false;
    
    this.saveProducts(filteredProducts);
    
    // Remover movimentações relacionadas
    const movements = this.getAllMovements();
    const filteredMovements = movements.filter(m => m.product_id !== id);
    this.saveMovements(filteredMovements);
    
    return true;
  }

  static getProductById(id: string): Product | null {
    const products = this.getAllProducts();
    return products.find(p => p.id === id) || null;
  }

  // Operações com movimentações
  static getAllMovements(): StockMovement[] {
    const stored = localStorage.getItem(this.MOVEMENTS_KEY);
    return stored ? JSON.parse(stored) : [];
  }

  static saveMovements(movements: StockMovement[]): void {
    localStorage.setItem(this.MOVEMENTS_KEY, JSON.stringify(movements));
  }

  static addMovement(movement: Omit<StockMovement, 'id' | 'created_at'>): StockMovement {
    const movements = this.getAllMovements();
    const newMovement: StockMovement = {
      ...movement,
      id: Date.now().toString(),
      created_at: new Date().toISOString()
    };
    
    movements.unshift(newMovement); // Adicionar no início para ordem cronológica
    this.saveMovements(movements);
    
    return newMovement;
  }

  static getMovementsByProductId(productId: string): StockMovement[] {
    const movements = this.getAllMovements();
    return movements.filter(m => m.product_id === productId);
  }

  // Operações de estoque
  static updateStock(productId: string, type: 'entrada' | 'saida' | 'ajuste', quantity: number, reason: string, user: string = 'Admin'): boolean {
    const product = this.getProductById(productId);
    if (!product) return false;

    const previousQuantity = product.quantity;
    let newQuantity = previousQuantity;

    switch (type) {
      case 'entrada':
        newQuantity = previousQuantity + quantity;
        break;
      case 'saida':
        newQuantity = Math.max(0, previousQuantity - quantity);
        break;
      case 'ajuste':
        newQuantity = quantity;
        break;
    }

    // Atualizar produto
    this.updateProduct(productId, { quantity: newQuantity });

    // Registrar movimentação
    this.addMovement({
      product_id: productId,
      type,
      quantity: type === 'ajuste' ? newQuantity : quantity,
      previous_quantity: previousQuantity,
      new_quantity: newQuantity,
      reason,
      user
    });

    return true;
  }

  // Sistema de alertas
  static getAllAlerts(): StockAlert[] {
    const stored = localStorage.getItem(this.ALERTS_KEY);
    return stored ? JSON.parse(stored) : [];
  }

  static saveAlerts(alerts: StockAlert[]): void {
    localStorage.setItem(this.ALERTS_KEY, JSON.stringify(alerts));
  }

  static checkLowStock(product: Product): void {
    const alerts = this.getAllAlerts();
    
    // Remover alertas antigos para este produto
    const filteredAlerts = alerts.filter(a => a.product_id !== product.id);
    
    // Verificar se precisa criar novos alertas
    if (product.quantity === 0) {
      filteredAlerts.push({
        id: Date.now().toString(),
        product_id: product.id,
        type: 'out_of_stock',
        message: `Produto "${product.name}" está em falta!`,
        created_at: new Date().toISOString(),
        resolved: false
      });
    } else if (product.quantity <= product.min_quantity) {
      filteredAlerts.push({
        id: Date.now().toString(),
        product_id: product.id,
        type: 'low_stock',
        message: `Produto "${product.name}" com estoque baixo (${product.quantity} unidades)`,
        created_at: new Date().toISOString(),
        resolved: false
      });
    }
    
    this.saveAlerts(filteredAlerts);
  }

  static checkAllProductsStock(): void {
    const products = this.getAllProducts();
    products.forEach(product => this.checkLowStock(product));
  }

  static resolveAlert(alertId: string): void {
    const alerts = this.getAllAlerts();
    const alert = alerts.find(a => a.id === alertId);
    if (alert) {
      alert.resolved = true;
      this.saveAlerts(alerts);
    }
  }

  static getUnresolvedAlerts(): StockAlert[] {
    return this.getAllAlerts().filter(a => !a.resolved);
  }

  // Relatórios e estatísticas
  static getInventoryValue(): number {
    const products = this.getAllProducts();
    return products.reduce((total, product) => total + (product.quantity * product.unit_price), 0);
  }

  static getProductsByCategory(): { [category: string]: Product[] } {
    const products = this.getAllProducts();
    return products.reduce((acc, product) => {
      if (!acc[product.category]) {
        acc[product.category] = [];
      }
      acc[product.category].push(product);
      return acc;
    }, {} as { [category: string]: Product[] });
  }

  static getLowStockProducts(): Product[] {
    const products = this.getAllProducts();
    return products.filter(p => p.quantity <= p.min_quantity);
  }

  static getOutOfStockProducts(): Product[] {
    const products = this.getAllProducts();
    return products.filter(p => p.quantity === 0);
  }

  // Backup e restauração
  static exportData(): string {
    const data = {
      products: this.getAllProducts(),
      movements: this.getAllMovements(),
      alerts: this.getAllAlerts(),
      exportedAt: new Date().toISOString()
    };
    return JSON.stringify(data, null, 2);
  }

  static importData(jsonData: string): boolean {
    try {
      const data = JSON.parse(jsonData);
      
      if (data.products) this.saveProducts(data.products);
      if (data.movements) this.saveMovements(data.movements);
      if (data.alerts) this.saveAlerts(data.alerts);
      
      return true;
    } catch (error) {
      console.error('Erro ao importar dados:', error);
      return false;
    }
  }

  // Limpar dados (para testes)
  static clearAllData(): void {
    localStorage.removeItem(this.PRODUCTS_KEY);
    localStorage.removeItem(this.MOVEMENTS_KEY);
    localStorage.removeItem(this.ALERTS_KEY);
  }
}

export { InventoryStorage };
