"use client"

import { useState, useEffect, useCallback } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { 
  Plus, 
  Edit, 
  Trash2, 
  Package, 
  AlertTriangle, 
  History, 
  TrendingUp, 
  TrendingDown,
  Search,
  Filter,
  Download,
  Upload,
  BarChart3,
  AlertCircle,
  CheckCircle,
  Minus,
  RotateCcw,
  Eye,
  ShoppingCart,
  DollarSign
} from "lucide-react"
import { InventoryStorage, Product, StockMovement, StockAlert } from "@/lib/inventoryStorage"
import LoadingSpinner from "@/components/ui/LoadingSpinner"
import { useNotification } from "@/contexts/NotificationContext"

const CATEGORIES = [
  'Produtos de Limpeza',
  'Enceramento',
  'Acessórios',
  'Renovadores',
  'Ferramentas',
  'Equipamentos',
  'Outros'
]

export default function InventoryManagement() {
  const [products, setProducts] = useState<Product[]>([])
  const [movements, setMovements] = useState<StockMovement[]>([])
  const [alerts, setAlerts] = useState<StockAlert[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [categoryFilter, setCategoryFilter] = useState("")
  const [activeTab, setActiveTab] = useState("products")
  
  // Dialogs
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [isMovementDialogOpen, setIsMovementDialogOpen] = useState(false)
  const [isHistoryDialogOpen, setIsHistoryDialogOpen] = useState(false)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  
  // States
  const [editingProduct, setEditingProduct] = useState<Product | null>(null)
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null)
  const [productToDelete, setProductToDelete] = useState<Product | null>(null)
  
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    category: "",
    quantity: 0,
    min_quantity: 5,
    unit_price: 0,
    supplier: "",
    sku: "",
    location: "",
  })

  const [movementData, setMovementData] = useState({
    type: 'entrada' as 'entrada' | 'saida' | 'ajuste',
    quantity: 0,
    reason: "",
  })

  const { showSuccess, showError, showInfo } = useNotification()

  const loadData = useCallback(() => {
    try {
      // Carregar produtos
      const productsData = InventoryStorage.getAllProducts()
      setProducts(productsData)
      
      // Carregar movimentações
      const movementsData = InventoryStorage.getAllMovements()
      setMovements(movementsData)
      
      // Carregar alertas
      const alertsData = InventoryStorage.getUnresolvedAlerts()
      setAlerts(alertsData)
      
      // Verificar estoque baixo
      InventoryStorage.checkAllProductsStock()
      
    } catch (error) {
      console.error("Error loading data:", error)
      showError("Erro", "Falha ao carregar dados do estoque")
    }
  }, [showError])

  useEffect(() => {
    setLoading(true)
    loadData()
    setLoading(false)
  }, [loadData])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.name || !formData.category || formData.unit_price <= 0) {
      showError("Erro", "Preencha todos os campos obrigatórios")
      return
    }

    try {
      if (editingProduct) {
        InventoryStorage.updateProduct(editingProduct.id, {
          name: formData.name,
          description: formData.description,
          category: formData.category,
          quantity: formData.quantity,
          min_quantity: formData.min_quantity,
          unit_price: formData.unit_price,
          supplier: formData.supplier,
          sku: formData.sku,
          location: formData.location,
        })
        showSuccess("Produto atualizado com sucesso!")
      } else {
        InventoryStorage.addProduct({
          name: formData.name,
          description: formData.description,
          category: formData.category,
          quantity: formData.quantity,
          min_quantity: formData.min_quantity,
          unit_price: formData.unit_price,
          supplier: formData.supplier,
          sku: formData.sku,
          location: formData.location,
        })
        showSuccess("Produto criado com sucesso!")
      }

      resetForm()
      loadData()
    } catch (error) {
      console.error("Erro ao salvar produto:", error)
      showError("Erro", "Falha ao salvar produto")
    }
  }

  const handleMovement = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!selectedProduct || movementData.quantity <= 0) {
      showError("Erro", "Preencha todos os campos obrigatórios")
      return
    }

    try {
      const success = InventoryStorage.updateStock(
        selectedProduct.id,
        movementData.type,
        movementData.quantity,
        movementData.reason
      )

      if (success) {
        showSuccess(`Movimentação de ${movementData.type} registrada com sucesso!`)
        resetMovementForm()
        loadData()
      } else {
        showError("Erro", "Falha ao registrar movimentação")
      }
    } catch (error) {
      console.error("Erro ao registrar movimentação:", error)
      showError("Erro", "Falha ao registrar movimentação")
    }
  }

  const handleDelete = async () => {
    if (!productToDelete) return

    try {
      const success = InventoryStorage.deleteProduct(productToDelete.id)
      if (success) {
        showSuccess("Produto excluído com sucesso!")
        loadData()
      } else {
        showError("Erro", "Falha ao excluir produto")
      }
    } catch (error) {
      console.error("Erro ao excluir produto:", error)
      showError("Erro", "Falha ao excluir produto")
    } finally {
      setDeleteDialogOpen(false)
      setProductToDelete(null)
    }
  }

  const resetForm = () => {
    setFormData({
      name: "",
      description: "",
      category: "",
      quantity: 0,
      min_quantity: 5,
      unit_price: 0,
      supplier: "",
      sku: "",
      location: "",
    })
    setEditingProduct(null)
    setIsDialogOpen(false)
  }

  const resetMovementForm = () => {
    setMovementData({
      type: 'entrada',
      quantity: 0,
      reason: "",
    })
    setSelectedProduct(null)
    setIsMovementDialogOpen(false)
  }

  const startEdit = (product: Product) => {
    setFormData({
      name: product.name,
      description: product.description,
      category: product.category,
      quantity: product.quantity,
      min_quantity: product.min_quantity,
      unit_price: product.unit_price,
      supplier: product.supplier,
      sku: product.sku || "",
      location: product.location || "",
    })
    setEditingProduct(product)
    setIsDialogOpen(true)
  }

  const openMovementDialog = (product: Product) => {
    setSelectedProduct(product)
    setIsMovementDialogOpen(true)
  }

  const viewHistory = (product: Product) => {
    setSelectedProduct(product)
    setIsHistoryDialogOpen(true)
  }

  const getStockStatus = (product: Product) => {
    if (product.quantity === 0) {
      return { status: "Sem estoque", color: "bg-red-500", textColor: "text-red-700" }
    } else if (product.quantity <= product.min_quantity) {
      return { status: "Estoque baixo", color: "bg-yellow-500", textColor: "text-yellow-700" }
    }
    return { status: "Normal", color: "bg-green-500", textColor: "text-green-700" }
  }

  const exportData = () => {
    const data = InventoryStorage.exportData()
    const blob = new Blob([data], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `estoque_backup_${new Date().toISOString().split('T')[0]}.json`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
    showSuccess("Backup exportado com sucesso!")
  }

  // Filtros
  const filteredProducts = products.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         product.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (product.sku && product.sku.toLowerCase().includes(searchTerm.toLowerCase()))
    const matchesCategory = !categoryFilter || product.category === categoryFilter
    return matchesSearch && matchesCategory
  })

  // Estatísticas
  const lowStockProducts = InventoryStorage.getLowStockProducts()
  const outOfStockProducts = InventoryStorage.getOutOfStockProducts()
  const totalValue = InventoryStorage.getInventoryValue()
  const categories = InventoryStorage.getProductsByCategory()

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <LoadingSpinner size="lg" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header com estatísticas */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Package className="h-8 w-8 text-blue-500" />
              <div>
                <p className="text-sm font-medium text-gray-600">Total de Produtos</p>
                <p className="text-2xl font-bold">{products.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <DollarSign className="h-8 w-8 text-green-500" />
              <div>
                <p className="text-sm font-medium text-gray-600">Valor Total</p>
                <p className="text-2xl font-bold">R$ {totalValue.toFixed(2)}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <AlertTriangle className="h-8 w-8 text-yellow-500" />
              <div>
                <p className="text-sm font-medium text-gray-600">Estoque Baixo</p>
                <p className="text-2xl font-bold text-yellow-600">{lowStockProducts.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <AlertCircle className="h-8 w-8 text-red-500" />
              <div>
                <p className="text-sm font-medium text-gray-600">Sem Estoque</p>
                <p className="text-2xl font-bold text-red-600">{outOfStockProducts.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Alertas */}
      {alerts.length > 0 && (
        <Card className="border-yellow-200 bg-yellow-50">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2 text-yellow-800">
              <AlertTriangle className="h-5 w-5" />
              <span>Alertas de Estoque</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {alerts.map(alert => (
                <div key={alert.id} className="flex items-center justify-between p-2 bg-white rounded border">
                  <span className="text-sm">{alert.message}</span>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => {
                      InventoryStorage.resolveAlert(alert.id)
                      loadData()
                    }}
                  >
                    Resolver
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Tabs principais */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="products">Produtos</TabsTrigger>
          <TabsTrigger value="movements">Movimentações</TabsTrigger>
          <TabsTrigger value="reports">Relatórios</TabsTrigger>
        </TabsList>

        <TabsContent value="products" className="space-y-4">
          {/* Barra de ações */}
          <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
            <div className="flex gap-2 flex-1 max-w-md">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Buscar produtos..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="Categoria" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Todas</SelectItem>
                  {CATEGORIES.map(cat => (
                    <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="flex gap-2">
              <Button variant="outline" onClick={exportData}>
                <Download className="h-4 w-4 mr-2" />
                Exportar
              </Button>
              <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogTrigger asChild>
                  <Button>
                    <Plus className="h-4 w-4 mr-2" />
                    Novo Produto
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-2xl">
                  <DialogHeader>
                    <DialogTitle>
                      {editingProduct ? "Editar Produto" : "Novo Produto"}
                    </DialogTitle>
                    <DialogDescription>
                      Preencha os dados do produto para adicionar ao estoque.
                    </DialogDescription>
                  </DialogHeader>
                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="name">Nome *</Label>
                        <Input
                          id="name"
                          value={formData.name}
                          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                          required
                        />
                      </div>
                      <div>
                        <Label htmlFor="sku">SKU</Label>
                        <Input
                          id="sku"
                          value={formData.sku}
                          onChange={(e) => setFormData({ ...formData, sku: e.target.value })}
                          placeholder="Ex: PRD-001"
                        />
                      </div>
                    </div>

                    <div>
                      <Label htmlFor="description">Descrição</Label>
                      <Textarea
                        id="description"
                        value={formData.description}
                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                        rows={3}
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="category">Categoria *</Label>
                        <Select value={formData.category} onValueChange={(value) => setFormData({ ...formData, category: value })}>
                          <SelectTrigger>
                            <SelectValue placeholder="Selecione..." />
                          </SelectTrigger>
                          <SelectContent>
                            {CATEGORIES.map(cat => (
                              <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label htmlFor="supplier">Fornecedor</Label>
                        <Input
                          id="supplier"
                          value={formData.supplier}
                          onChange={(e) => setFormData({ ...formData, supplier: e.target.value })}
                        />
                      </div>
                    </div>

                    <div>
                      <Label htmlFor="location">Localização</Label>
                      <Input
                        id="location"
                        value={formData.location}
                        onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                        placeholder="Ex: Estoque A - Prateleira 1"
                      />
                    </div>

                    <div className="grid grid-cols-3 gap-4">
                      <div>
                        <Label htmlFor="quantity">Quantidade</Label>
                        <Input
                          id="quantity"
                          type="number"
                          min="0"
                          value={formData.quantity}
                          onChange={(e) => setFormData({ ...formData, quantity: parseInt(e.target.value) || 0 })}
                        />
                      </div>
                      <div>
                        <Label htmlFor="min_quantity">Estoque Mínimo</Label>
                        <Input
                          id="min_quantity"
                          type="number"
                          min="0"
                          value={formData.min_quantity}
                          onChange={(e) => setFormData({ ...formData, min_quantity: parseInt(e.target.value) || 0 })}
                        />
                      </div>
                      <div>
                        <Label htmlFor="unit_price">Preço Unitário *</Label>
                        <Input
                          id="unit_price"
                          type="number"
                          min="0"
                          step="0.01"
                          value={formData.unit_price}
                          onChange={(e) => setFormData({ ...formData, unit_price: parseFloat(e.target.value) || 0 })}
                          required
                        />
                      </div>
                    </div>

                    <div className="flex justify-end space-x-2">
                      <Button type="button" variant="outline" onClick={resetForm}>
                        Cancelar
                      </Button>
                      <Button type="submit">
                        {editingProduct ? "Atualizar" : "Criar"}
                      </Button>
                    </div>
                  </form>
                </DialogContent>
              </Dialog>
            </div>
          </div>

          {/* Tabela de produtos */}
          <Card>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Produto</TableHead>
                    <TableHead>Categoria</TableHead>
                    <TableHead>Estoque</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Preço</TableHead>
                    <TableHead>Valor Total</TableHead>
                    <TableHead>Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredProducts.map((product) => {
                    const stockStatus = getStockStatus(product)
                    return (
                      <TableRow key={product.id}>
                        <TableCell>
                          <div>
                            <div className="font-medium">{product.name}</div>
                            {product.sku && <div className="text-sm text-gray-500">SKU: {product.sku}</div>}
                            {product.location && <div className="text-sm text-gray-500">{product.location}</div>}
                          </div>
                        </TableCell>
                        <TableCell>{product.category}</TableCell>
                        <TableCell>
                          <div>
                            <div className="font-medium">{product.quantity}</div>
                            <div className="text-sm text-gray-500">Mín: {product.min_quantity}</div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge className={`${stockStatus.color} text-white`}>
                            {stockStatus.status}
                          </Badge>
                        </TableCell>
                        <TableCell>R$ {product.unit_price.toFixed(2)}</TableCell>
                        <TableCell>R$ {(product.quantity * product.unit_price).toFixed(2)}</TableCell>
                        <TableCell>
                          <div className="flex space-x-1">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => startEdit(product)}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => openMovementDialog(product)}
                            >
                              <ShoppingCart className="h-4 w-4" />
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => viewHistory(product)}
                            >
                              <History className="h-4 w-4" />
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => {
                                setProductToDelete(product)
                                setDeleteDialogOpen(true)
                              }}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    )
                  })}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="movements" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Últimas Movimentações</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Data</TableHead>
                    <TableHead>Produto</TableHead>
                    <TableHead>Tipo</TableHead>
                    <TableHead>Quantidade</TableHead>
                    <TableHead>Motivo</TableHead>
                    <TableHead>Usuário</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {movements.slice(0, 20).map((movement) => {
                    const product = products.find(p => p.id === movement.product_id)
                    return (
                      <TableRow key={movement.id}>
                        <TableCell>
                          {new Date(movement.created_at).toLocaleDateString('pt-BR')}
                        </TableCell>
                        <TableCell>{product?.name || 'Produto não encontrado'}</TableCell>
                        <TableCell>
                          <Badge variant={
                            movement.type === 'entrada' ? 'default' :
                            movement.type === 'saida' ? 'destructive' : 'secondary'
                          }>
                            {movement.type === 'entrada' ? 'Entrada' :
                             movement.type === 'saida' ? 'Saída' : 'Ajuste'}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center space-x-1">
                            {movement.type === 'entrada' ? (
                              <TrendingUp className="h-4 w-4 text-green-500" />
                            ) : movement.type === 'saida' ? (
                              <TrendingDown className="h-4 w-4 text-red-500" />
                            ) : (
                              <RotateCcw className="h-4 w-4 text-blue-500" />
                            )}
                            <span>{movement.quantity}</span>
                          </div>
                        </TableCell>
                        <TableCell>{movement.reason}</TableCell>
                        <TableCell>{movement.user}</TableCell>
                      </TableRow>
                    )
                  })}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="reports" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Produtos por Categoria</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {Object.entries(categories).map(([category, categoryProducts]) => (
                    <div key={category} className="flex justify-between items-center">
                      <span className="font-medium">{category}</span>
                      <Badge>{categoryProducts.length} produtos</Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Produtos com Estoque Baixo</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {lowStockProducts.map(product => (
                    <div key={product.id} className="flex justify-between items-center">
                      <div>
                        <div className="font-medium">{product.name}</div>
                        <div className="text-sm text-gray-500">{product.quantity} unidades</div>
                      </div>
                      <Button
                        size="sm"
                        onClick={() => openMovementDialog(product)}
                      >
                        Repor
                      </Button>
                    </div>
                  ))}
                  {lowStockProducts.length === 0 && (
                    <div className="text-center text-gray-500 py-4">
                      <CheckCircle className="h-8 w-8 mx-auto text-green-500 mb-2" />
                      Todos os produtos estão com estoque adequado!
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      {/* Dialog de Movimentação */}
      <Dialog open={isMovementDialogOpen} onOpenChange={setIsMovementDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Movimentação de Estoque</DialogTitle>
            <DialogDescription>
              {selectedProduct && `Produto: ${selectedProduct.name} (Estoque atual: ${selectedProduct.quantity})`}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleMovement} className="space-y-4">
            <div>
              <Label htmlFor="movement-type">Tipo de Movimentação</Label>
              <Select value={movementData.type} onValueChange={(value: 'entrada' | 'saida' | 'ajuste') => setMovementData({ ...movementData, type: value })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="entrada">Entrada</SelectItem>
                  <SelectItem value="saida">Saída</SelectItem>
                  <SelectItem value="ajuste">Ajuste</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="movement-quantity">
                {movementData.type === 'ajuste' ? 'Nova Quantidade' : 'Quantidade'}
              </Label>
              <Input
                id="movement-quantity"
                type="number"
                min="0"
                value={movementData.quantity}
                onChange={(e) => setMovementData({ ...movementData, quantity: parseInt(e.target.value) || 0 })}
                required
              />
            </div>

            <div>
              <Label htmlFor="movement-reason">Motivo</Label>
              <Textarea
                id="movement-reason"
                value={movementData.reason}
                onChange={(e) => setMovementData({ ...movementData, reason: e.target.value })}
                placeholder="Descreva o motivo da movimentação..."
                required
              />
            </div>

            <div className="flex justify-end space-x-2">
              <Button type="button" variant="outline" onClick={resetMovementForm}>
                Cancelar
              </Button>
              <Button type="submit">Registrar</Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Dialog de Histórico */}
      <Dialog open={isHistoryDialogOpen} onOpenChange={setIsHistoryDialogOpen}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>Histórico de Movimentações</DialogTitle>
            <DialogDescription>
              {selectedProduct && `Produto: ${selectedProduct.name}`}
            </DialogDescription>
          </DialogHeader>
          <div className="max-h-96 overflow-y-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Data</TableHead>
                  <TableHead>Tipo</TableHead>
                  <TableHead>Qtd. Anterior</TableHead>
                  <TableHead>Qtd. Movimentada</TableHead>
                  <TableHead>Qtd. Nova</TableHead>
                  <TableHead>Motivo</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {selectedProduct && InventoryStorage.getMovementsByProductId(selectedProduct.id).map((movement) => (
                  <TableRow key={movement.id}>
                    <TableCell>{new Date(movement.created_at).toLocaleString('pt-BR')}</TableCell>
                    <TableCell>
                      <Badge variant={
                        movement.type === 'entrada' ? 'default' :
                        movement.type === 'saida' ? 'destructive' : 'secondary'
                      }>
                        {movement.type === 'entrada' ? 'Entrada' :
                         movement.type === 'saida' ? 'Saída' : 'Ajuste'}
                      </Badge>
                    </TableCell>
                    <TableCell>{movement.previous_quantity}</TableCell>
                    <TableCell>{movement.quantity}</TableCell>
                    <TableCell>{movement.new_quantity}</TableCell>
                    <TableCell>{movement.reason}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </DialogContent>
      </Dialog>

      {/* Dialog de Confirmação de Exclusão */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar Exclusão</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir o produto "{productToDelete?.name}"?
              Esta ação não pode ser desfeita e todas as movimentações relacionadas serão removidas.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-red-600 hover:bg-red-700">
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
