"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Plus, Edit, Trash2, Clock, DollarSign } from "lucide-react"
import { supabase } from "@/lib/supabase"
import LoadingSpinner from "@/components/ui/LoadingSpinner"

interface Service {
  id: string
  name: string
  description: string
  price: number
  duration_minutes: number
  category: string
  active: boolean
  image_url?: string
}

export default function ServicesManagement() {
  const [services, setServices] = useState<Service[]>([])
  const [loading, setLoading] = useState(true)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingService, setEditingService] = useState<Service | null>(null)
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    price: 0,
    duration_minutes: 30,
    category: "",
    active: true,
  })

  useEffect(() => {
    loadServices()
  }, [])

  const loadServices = async () => {
    try {
      const { data, error } = await supabase.from("services").select("*").order("category", { ascending: true })

      if (error) throw error
      setServices(data || [])
    } catch (error) {
      console.error("Error loading services:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (serviceId: string) => {
    if (!confirm("Tem certeza que deseja excluir este serviço?")) return

    try {
      const { error } = await supabase.from("services").delete().eq("id", serviceId)

      if (error) throw error
      loadServices()
    } catch (error) {
      console.error("Error deleting service:", error)
    }
  }

  const toggleActive = async (serviceId: string, active: boolean) => {
    try {
      const { error } = await supabase.from("services").update({ active }).eq("id", serviceId)

      if (error) throw error
      loadServices()
    } catch (error) {
      console.error("Error updating service:", error)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.name || !formData.category || formData.price <= 0) {
      alert("Preencha todos os campos obrigatórios")
      return
    }

    try {
      if (editingService) {
        // Editar serviço existente
        const { error } = await supabase
          .from("services")
          .update({
            name: formData.name,
            description: formData.description,
            price: formData.price,
            duration_minutes: formData.duration_minutes,
            category: formData.category,
            active: formData.active,
          })
          .eq("id", editingService.id)

        if (error) throw error
        console.log("Serviço atualizado com sucesso!")
      } else {
        // Criar novo serviço
        const { error } = await supabase.from("services").insert([
          {
            name: formData.name,
            description: formData.description,
            price: formData.price,
            duration_minutes: formData.duration_minutes,
            category: formData.category,
            active: formData.active,
          }
        ])

        if (error) throw error
        console.log("Serviço criado com sucesso!")
        // Service successfully added to database
      }

      resetForm()
      loadServices()
    } catch (error) {
      console.error("Erro ao salvar serviço:", error)
      alert("Erro ao salvar serviço")
    }
  }

  const resetForm = () => {
    setFormData({
      name: "",
      description: "",
      price: 0,
      duration_minutes: 30,
      category: "",
      active: true,
    })
    setEditingService(null)
    setIsDialogOpen(false)
  }

  const startEdit = (service: Service) => {
    setFormData({
      name: service.name,
      description: service.description,
      price: service.price,
      duration_minutes: service.duration_minutes,
      category: service.category,
      active: service.active,
    })
    setEditingService(service)
    setIsDialogOpen(true)
  }

  const categories = [...new Set(services.map((s) => s.category))]

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
          <h1 className="text-3xl font-bold">Gerenciar Serviços</h1>
          <p className="text-gray-600">Configure os serviços oferecidos</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => setEditingService(null)}>
              <Plus className="w-4 h-4 mr-2" />
              Novo Serviço
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>{editingService ? "Editar Serviço" : "Novo Serviço"}</DialogTitle>
              <DialogDescription>
                {editingService ? "Atualize as informações do serviço" : "Adicione um novo serviço"}
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Nome do Serviço</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Descrição</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={3}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="price">Preço (R$)</Label>
                  <Input
                    id="price"
                    type="number"
                    step="0.01"
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: Number.parseFloat(e.target.value) })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="duration">Duração (min)</Label>
                  <Input
                    id="duration"
                    type="number"
                    value={formData.duration_minutes}
                    onChange={(e) => setFormData({ ...formData, duration_minutes: Number.parseInt(e.target.value) })}
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="category">Categoria</Label>
                <Input
                  id="category"
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  required
                />
              </div>

              <div className="flex items-center space-x-2">
                <Switch
                  id="active"
                  checked={formData.active}
                  onCheckedChange={(checked) => setFormData({ ...formData, active: checked })}
                />
                <Label htmlFor="active">Serviço ativo</Label>
              </div>

              <div className="flex justify-end space-x-2 pt-4">
                <Button type="button" variant="outline" onClick={resetForm}>
                  Cancelar
                </Button>
                <Button type="submit">
                  {editingService ? "Atualizar Serviço" : "Criar Serviço"}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Services by Category */}
      {categories.map((category) => (
        <Card key={category}>
          <CardHeader>
            <CardTitle>{category}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {services
                .filter((service) => service.category === category)
                .map((service) => (
                  <Card key={service.id} className={`${!service.active ? "opacity-60" : ""}`}>
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between mb-3">
                        <h3 className="font-semibold">{service.name}</h3>
                        <div className="flex items-center space-x-1">
                          <Switch
                            checked={service.active}
                            onCheckedChange={(checked) => toggleActive(service.id, checked)}
                          />
                          <Button variant="ghost" size="sm" onClick={() => startEdit(service)}>
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button variant="ghost" size="sm" onClick={() => handleDelete(service.id)}>
                            <Trash2 className="w-4 h-4 text-red-500" />
                          </Button>
                        </div>
                      </div>

                      <p className="text-sm text-gray-600 mb-3">{service.description}</p>

                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                          <div className="flex items-center space-x-1 text-sm">
                            <DollarSign className="w-4 h-4 text-green-600" />
                            <span className="font-medium">R$ {service.price.toFixed(2).replace(".", ",")}</span>
                          </div>
                          <div className="flex items-center space-x-1 text-sm">
                            <Clock className="w-4 h-4 text-blue-600" />
                            <span>{service.duration_minutes}min</span>
                          </div>
                        </div>
                        <Badge variant={service.active ? "default" : "secondary"}>
                          {service.active ? "Ativo" : "Inativo"}
                        </Badge>
                      </div>
                    </CardContent>
                  </Card>
                ))}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
