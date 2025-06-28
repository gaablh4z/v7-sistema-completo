"use client"

import { useState, useEffect, useCallback } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
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
import { Plus, Edit, Trash2, Package, AlertTriangle, History, TrendingUp, TrendingDown } from "lucide-react"
import { supabase } from "@/lib/supabase"
import LoadingSpinner from "@/components/ui/LoadingSpinner"
import { useNotification } from "@/contexts/NotificationContext"

interface Product {
  id: string
  name: string
  description: string
  category: string
  quantity: number
  min_quantity: number
  unit_price: number
  supplier: string
  created_at: string
  updated_at: string
}

interface StockMovement {
  id: string
  product_id: string
  type: 'entrada' | 'saida' | 'ajuste'
  quantity: number
  reason: string
  created_at: string
  product: { name: string }
}

export default function InventoryManagement() {
  const [products, setProducts] = useState<Product[]>([])
  const [movements, setMovements] = useState<StockMovement[]>([])
  const [loading, setLoading] = useState(true)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [isMovementDialogOpen, setIsMovementDialogOpen] = useState(false)
  const [isHistoryDialogOpen, setIsHistoryDialogOpen] = useState(false)
  const [editingProduct, setEditingProduct] = useState<Product | null>(null)
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [productToDelete, setProductToDelete] = useState<Product | null>(null)
  
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    category: "",
    quantity: 0,
    min_quantity: 5,
    unit_price: 0,
    supplier: "",
  })

  const [movementData, setMovementData] = useState({
    type: 'entrada' as 'entrada' | 'saida' | 'ajuste',
    quantity: 0,
    reason: "",
  })

  const { showSuccess, showError } = useNotification()

  const loadProducts = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from("inventory")
        .select("*")
        .order("name")

      if (error) throw error
      setProducts(data || [])
    } catch (error) {
      console.error("Error loading products:", error)
      showError("Erro", "Falha ao carregar produtos")
    }
  }, [showError])

  const loadMovements = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from("stock_movements")
        .select(`
          *,
          inventory!inner(name)
        `)
        .order("created_at", { ascending: false })
        .limit(50)

      if (error) throw error
      
      const formattedMovements = data?.map(movement => ({
        ...movement,
        product: { name: movement.inventory.name }
      })) || []
      
      setMovements(formattedMovements)
    } catch (error) {
      console.error("Error loading movements:", error)
      showError("Erro", "Falha ao carregar movimentações")
    }
  }, [showError])

  useEffect(() => {
    const initializeData = async () => {
      setLoading(true)
      await Promise.all([loadProducts(), loadMovements()])
      setLoading(false)
    }
    initializeData()
  }, [loadProducts, loadMovements])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.name || !formData.category || formData.unit_price <= 0) {
      showError("Erro", "Preencha todos os campos obrigatórios")
      return
    }

    try {
      if (editingProduct) {
        const { error } = await supabase
          .from("inventory")
          .update({
            name: formData.name,
            description: formData.description,
            category: formData.category,
            quantity: formData.quantity,
            min_quantity: formData.min_quantity,
            unit_price: formData.unit_price,
            supplier: formData.supplier,
            updated_at: new Date().toISOString(),
          })
          .eq("id", editingProduct.id)

        if (error) throw error
        showSuccess("Produto atualizado com sucesso!")
      } else {
        const { error } = await supabase.from("inventory").insert([
          {
            name: formData.name,
            description: formData.description,
            category: formData.category,
            quantity: formData.quantity,
            min_quantity: formData.min_quantity,
            unit_price: formData.unit_price,
            supplier: formData.supplier,
          }
        ])

        if (error) throw error
        showSuccess("Produto criado com sucesso!")
      }

      resetForm()
      loadProducts()
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
      // Calcular nova quantidade
      let newQuantity = selectedProduct.quantity
      switch (movementData.type) {
        case 'entrada':
          newQuantity += movementData.quantity
          break
        case 'saida':
          newQuantity -= movementData.quantity
          break
        case 'ajuste':
          newQuantity = movementData.quantity
          break
      }

      if (newQuantity < 0) {
        showError("Erro", "Quantidade resultante não pode ser negativa")
        return
      }

      // Registrar movimento
      const { error: movementError } = await supabase.from("stock_movements").insert([
        {
          product_id: selectedProduct.id,
          type: movementData.type,
          quantity: movementData.quantity,
          reason: movementData.reason,
        }
      ])

      if (movementError) throw movementError

      // Atualizar estoque
      const { error: updateError } = await supabase
        .from("inventory")
        .update({ 
          quantity: newQuantity,
          updated_at: new Date().toISOString()
        })
        .eq("id", selectedProduct.id)

      if (updateError) throw updateError

      showSuccess("Movimentação registrada com sucesso!")
      setIsMovementDialogOpen(false)
      setMovementData({ type: 'entrada', quantity: 0, reason: "" })
      loadProducts()
      loadMovements()
    } catch (error) {
      console.error("Erro ao registrar movimentação:", error)
      showError("Erro", "Falha ao registrar movimentação")
    }
  }

  const handleDelete = async () => {
    if (!productToDelete) return

    try {
      const { error } = await supabase
        .from("inventory")
        .delete()
        .eq("id", productToDelete.id)

      if (error) throw error

      showSuccess("Produto excluído com sucesso!")
      setDeleteDialogOpen(false)
      setProductToDelete(null)
      loadProducts()
    } catch (error) {
      console.error("Error deleting product:", error)
      showError("Erro", "Falha ao excluir produto")
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
    })
    setEditingProduct(null)
    setIsDialogOpen(false)
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
    })
    setEditingProduct(product)
    setIsDialogOpen(true)
  }

  const getStockStatus = (product: Product) => {
    if (product.quantity === 0) {
      return { status: "Sem estoque", color: "bg-red-500", textColor: "text-red-700" }
    } else if (product.quantity <= product.min_quantity) {
      return { status: "Estoque baixo", color: "bg-yellow-500", textColor: "text-yellow-700" }
    }
    return { status: "Normal", color: "bg-green-500", textColor: "text-green-700" }
  }

  const lowStockProducts = products.filter(p => p.quantity <= p.min_quantity)
  const totalValue = products.reduce((sum, p) => sum + (p.quantity * p.unit_price), 0)
  const categories = [...new Set(products.map(p => p.category))]

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <LoadingSpinner size="lg" />
      </div>
    )
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Gerenciar Estoque</h1>
          <p className="text-gray-600">Controle produtos e movimentações</p>
        </div>
        <div className="flex gap-2">
          <Button onClick={() => setIsHistoryDialogOpen(true)} variant="outline">
            <History className="w-4 h-4 mr-2" />
            Histórico
          </Button>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={() => setEditingProduct(null)}>
                <Plus className="w-4 h-4 mr-2" />
                Novo Produto
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px]">
              <DialogHeader>
                <DialogTitle>{editingProduct ? "Editar Produto" : "Novo Produto"}</DialogTitle>
                <DialogDescription>
                  {editingProduct ? "Atualize as informações do produto" : "Adicione um novo produto ao estoque"}
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Nome do Produto *</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="Ex: Shampoo Automotivo"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Descrição</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Descrição do produto..."
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="category">Categoria *</Label>
                    <Input
                      id="category"
                      value={formData.category}
                      onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                      placeholder="Ex: Químicos"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="supplier">Fornecedor</Label>
                    <Input
                      id="supplier"
                      value={formData.supplier}
                      onChange={(e) => setFormData({ ...formData, supplier: e.target.value })}
                      placeholder="Nome do fornecedor"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="quantity">Quantidade</Label>
                    <Input
                      id="quantity"
                      type="number"
                      min="0"
                      value={formData.quantity}
                      onChange={(e) => setFormData({ ...formData, quantity: parseInt(e.target.value) })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="min_quantity">Estoque Mínimo</Label>
                    <Input
                      id="min_quantity"
                      type="number"
                      min="0"
                      value={formData.min_quantity}
                      onChange={(e) => setFormData({ ...formData, min_quantity: parseInt(e.target.value) })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="unit_price">Preço Unitário (R$) *</Label>
                    <Input
                      id="unit_price"
                      type="number"
                      step="0.01"
                      min="0"
                      value={formData.unit_price}
                      onChange={(e) => setFormData({ ...formData, unit_price: parseFloat(e.target.value) })}
                      required
                    />
                  </div>
                </div>

                <div className="flex justify-end space-x-2 pt-4">
                  <Button type="button" variant="outline" onClick={resetForm}>
                    Cancelar
                  </Button>
                  <Button type="submit">
                    {editingProduct ? "Atualizar Produto" : "Criar Produto"}
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Alerts */}
      {lowStockProducts.length > 0 && (
        <Card className="border-yellow-200 bg-yellow-50">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 text-yellow-800">
              <AlertTriangle className="w-5 h-5" />
              <span className="font-medium">
                {lowStockProducts.length} produto(s) com estoque baixo ou zerado
              </span>
            </div>
            <div className="mt-2 flex flex-wrap gap-2">
              {lowStockProducts.map(product => (
                <Badge key={product.id} variant="secondary" className="text-yellow-700">
                  {product.name} ({product.quantity} restante)
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total de Produtos</p>
                <p className="text-2xl font-bold">{products.length}</p>
              </div>
              <Package className="w-8 h-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Valor Total</p>
                <p className="text-2xl font-bold">R$ {totalValue.toFixed(2).replace(".", ",")}</p>
              </div>
              <TrendingUp className="w-8 h-8 text-green-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Estoque Baixo</p>
                <p className="text-2xl font-bold text-yellow-600">{lowStockProducts.length}</p>
              </div>
              <AlertTriangle className="w-8 h-8 text-yellow-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Categorias</p>
                <p className="text-2xl font-bold">{categories.length}</p>
              </div>
              <TrendingDown className="w-8 h-8 text-purple-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Products by Category */}
      {categories.map((category) => (
        <Card key={category}>
          <CardHeader>
            <CardTitle>{category}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {products
                .filter((product) => product.category === category)
                .map((product) => {
                  const stockStatus = getStockStatus(product)
                  return (
                    <Card key={product.id} className="overflow-hidden">
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between mb-3">
                          <h3 className="font-semibold">{product.name}</h3>
                          <div className="flex items-center space-x-1">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => {
                                setSelectedProduct(product)
                                setIsMovementDialogOpen(true)
                              }}
                            >
                              <Package className="w-4 h-4" />
                            </Button>
                            <Button variant="ghost" size="sm" onClick={() => startEdit(product)}>
                              <Edit className="w-4 h-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => {
                                setProductToDelete(product)
                                setDeleteDialogOpen(true)
                              }}
                            >
                              <Trash2 className="w-4 h-4 text-red-500" />
                            </Button>
                          </div>
                        </div>

                        {product.description && (
                          <p className="text-sm text-gray-600 mb-3">{product.description}</p>
                        )}

                        <div className="space-y-2">
                          <div className="flex justify-between items-center">
                            <span className="text-sm">Quantidade:</span>
                            <div className="flex items-center gap-2">
                              <span className="font-medium">{product.quantity}</span>
                              <Badge
                                className={`${stockStatus.color} text-white text-xs`}
                              >
                                {stockStatus.status}
                              </Badge>
                            </div>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="text-sm">Preço unitário:</span>
                            <span className="font-medium">
                              R$ {product.unit_price.toFixed(2).replace(".", ",")}
                            </span>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="text-sm">Valor total:</span>
                            <span className="font-medium">
                              R$ {(product.quantity * product.unit_price).toFixed(2).replace(".", ",")}
                            </span>
                          </div>
                          {product.supplier && (
                            <div className="flex justify-between items-center">
                              <span className="text-sm">Fornecedor:</span>
                              <span className="text-sm">{product.supplier}</span>
                            </div>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  )
                })}
            </div>
          </CardContent>
        </Card>
      ))}

      {/* Movement Dialog */}
      <Dialog open={isMovementDialogOpen} onOpenChange={setIsMovementDialogOpen}>
        <DialogContent className="sm:max-w-[400px]">
          <DialogHeader>
            <DialogTitle>Movimentar Estoque</DialogTitle>
            <DialogDescription>
              Produto: {selectedProduct?.name}
              <br />
              Estoque atual: {selectedProduct?.quantity}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleMovement} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="movement-type">Tipo de Movimentação</Label>
              <Select
                value={movementData.type}
                onValueChange={(value: 'entrada' | 'saida' | 'ajuste') =>
                  setMovementData({ ...movementData, type: value })
                }
              >
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

            <div className="space-y-2">
              <Label htmlFor="movement-quantity">
                {movementData.type === 'ajuste' ? 'Nova Quantidade' : 'Quantidade'}
              </Label>
              <Input
                id="movement-quantity"
                type="number"
                min="1"
                value={movementData.quantity}
                onChange={(e) => setMovementData({ ...movementData, quantity: parseInt(e.target.value) })}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="movement-reason">Motivo</Label>
              <Textarea
                id="movement-reason"
                value={movementData.reason}
                onChange={(e) => setMovementData({ ...movementData, reason: e.target.value })}
                placeholder="Motivo da movimentação..."
                required
              />
            </div>

            <div className="flex justify-end space-x-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setIsMovementDialogOpen(false)
                  setMovementData({ type: 'entrada', quantity: 0, reason: "" })
                }}
              >
                Cancelar
              </Button>
              <Button type="submit">Confirmar Movimentação</Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* History Dialog */}
      <Dialog open={isHistoryDialogOpen} onOpenChange={setIsHistoryDialogOpen}>
        <DialogContent className="sm:max-w-[600px] max-h-[600px] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Histórico de Movimentações</DialogTitle>
            <DialogDescription>Últimas 50 movimentações</DialogDescription>
          </DialogHeader>
          <div className="space-y-3">
            {movements.map((movement) => (
              <div key={movement.id} className="flex justify-between items-center p-3 border rounded">
                <div>
                  <div className="font-medium">{movement.product.name}</div>
                  <div className="text-sm text-gray-600">{movement.reason}</div>
                  <div className="text-xs text-gray-500">
                    {new Date(movement.created_at).toLocaleString("pt-BR")}
                  </div>
                </div>
                <div className="text-right">
                  <Badge
                    variant={
                      movement.type === 'entrada'
                        ? 'default'
                        : movement.type === 'saida'
                        ? 'destructive'
                        : 'secondary'
                    }
                  >
                    {movement.type.toUpperCase()}
                  </Badge>
                  <div className="text-sm font-medium mt-1">
                    {movement.type === 'entrada' ? '+' : movement.type === 'saida' ? '-' : ''}
                    {movement.quantity}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar Exclusão</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir o produto &quot;{productToDelete?.name}&quot;?
              Esta ação não pode ser desfeita.
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
