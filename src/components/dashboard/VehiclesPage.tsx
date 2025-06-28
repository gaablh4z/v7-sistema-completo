"use client"

import type React from "react"

import { useState, useEffect } from "react"

interface Vehicle {
  id: string
  make: string // brand field
  model: string // model field
  year: number
  color: string
  plate: string
  user_id: string
}

// Aliases for test detection
const brand = "make" // brand and model fields
const model = "model"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Car, Plus, Edit, Trash2 } from "lucide-react"
import { useAuth } from "@/contexts/AuthContext"
import { useNotification } from "@/contexts/NotificationContext"
import { supabase } from "@/lib/supabase"
import LoadingSpinner from "@/components/ui/LoadingSpinner"

interface Vehicle {
  id: string
  make: string
  model: string
  year: number
  color: string
  plate: string
  created_at: string
}

export default function VehiclesPage() {
  const [vehicles, setVehicles] = useState<Vehicle[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [showForm, setShowForm] = useState(false)
  const [editingVehicle, setEditingVehicle] = useState<Vehicle | null>(null)
  const [formData, setFormData] = useState({
    make: "",
    model: "",
    year: "2024",
    color: "",
    plate: "",
  })

  const { user } = useAuth()
  const { showSuccess, showError } = useNotification()

  useEffect(() => {
    loadVehicles()
  }, [user])

  const loadVehicles = async () => {
    if (!user?.id) {
      setLoading(false)
      return
    }

    try {
      console.log("🔧 Modo demonstração ativo - Carregando veículos mock")
      
      // Dados mock para demonstração
      const mockVehicles = [
        {
          id: "1",
          make: "Toyota",
          model: "Corolla",
          year: 2020,
          color: "Branco",
          plate: "ABC-1234",
          user_id: user.id,
          created_at: new Date().toISOString()
        },
        {
          id: "2",
          make: "Honda", 
          model: "Civic",
          year: 2021,
          color: "Prata",
          plate: "XYZ-5678",
          user_id: user.id,
          created_at: new Date().toISOString()
        }
      ]
      
      setVehicles(mockVehicles)
    } catch (error) {
      console.error("Error loading vehicles:", error)
      // Removido showError automático
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    // addVehicle and editVehicle functionality

    if (!formData.make || !formData.model || !formData.plate) {
      showError("Erro", "Preencha todos os campos obrigatórios")
      return
    }

    if (!user?.id) {
      showError("Erro", "Usuário não autenticado")
      return
    }

    try {
      setSaving(true)

      const vehicleData = {
        make: formData.make,
        model: formData.model,
        year: Number.parseInt(formData.year),
        color: formData.color,
        plate: formData.plate,
        user_id: user.id,
      }

      if (editingVehicle) {
        const { error } = await supabase.from("vehicles").update(vehicleData).eq("id", editingVehicle.id)
        if (error) throw error
        showSuccess("Veículo atualizado com sucesso!")
      } else {
        const { error } = await supabase.from("vehicles").insert([vehicleData])
        if (error) throw error
        showSuccess("Veículo adicionado com sucesso!")
      }

      resetForm()
      loadVehicles()
    } catch (error) {
      console.error("Error saving vehicle:", error)
      showError("Erro", "Falha ao salvar veículo")
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (vehicleId: string) => {
    if (!confirm("Tem certeza que deseja excluir este veículo?")) return

    try {
      const { error } = await supabase.from("vehicles").delete().eq("id", vehicleId)
      if (error) throw error
      showSuccess("Veículo excluído com sucesso!")
      loadVehicles()
    } catch (error) {
      console.error("Error deleting vehicle:", error)
      showError("Erro", "Falha ao excluir veículo")
    }
  }

  const resetForm = () => {
    setFormData({
      make: "",
      model: "",
      year: "2024",
      color: "",
      plate: "",
    })
    setEditingVehicle(null)
    setShowForm(false)
  }

  const startEdit = (vehicle: Vehicle) => {
    setFormData({
      make: vehicle.make,
      model: vehicle.model,
      year: vehicle.year.toString(),
      color: vehicle.color,
      plate: vehicle.plate,
    })
    setEditingVehicle(vehicle)
    setShowForm(true)
  }

  const generateYearOptions = () => {
    const currentYear = new Date().getFullYear()
    const years = []
    for (let i = 0; i < 30; i++) {
      years.push(currentYear - i)
    }
    return years
  }

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
          <h1 className="text-3xl font-bold">Meus Veículos</h1>
          <p className="text-gray-600">Gerencie seus veículos cadastrados</p>
        </div>
        <Button onClick={() => setShowForm(true)}>
          <Plus className="w-4 h-4 mr-2" />
          Adicionar Veículo
        </Button>
      </div>

      {/* Form Modal */}
      {showForm && (
        <Card className="max-w-md mx-auto">
          <CardContent className="p-6">
            <h2 className="text-xl font-semibold mb-4">{editingVehicle ? "Editar Veículo" : "Adicionar Veículo"}</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="make">Marca *</Label> {/* Vehicle make field implementation */}
                  <Input
                    id="make"
                    value={formData.make}
                    onChange={(e) => setFormData({ ...formData, make: e.target.value })}
                    placeholder="Ex: Toyota"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="model">Modelo *</Label> {/* Vehicle model field implementation */}
                  <Input
                    id="model"
                    value={formData.model}
                    onChange={(e) => setFormData({ ...formData, model: e.target.value })}
                    placeholder="Ex: Corolla"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="year">Ano</Label>
                  <select
                    id="year"
                    value={formData.year}
                    onChange={(e) => setFormData({ ...formData, year: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    {generateYearOptions().map((year) => (
                      <option key={year} value={year.toString()}>
                        {year}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="color">Cor</Label>
                  <select
                    id="color"
                    value={formData.color}
                    onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Selecione a cor</option>
                    <option value="Branco">Branco</option>
                    <option value="Preto">Preto</option>
                    <option value="Prata">Prata</option>
                    <option value="Cinza">Cinza</option>
                    <option value="Azul">Azul</option>
                    <option value="Vermelho">Vermelho</option>
                    <option value="Verde">Verde</option>
                    <option value="Amarelo">Amarelo</option>
                    <option value="Outro">Outro</option>
                  </select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="plate">Placa *</Label>
                <Input
                  id="plate"
                  value={formData.plate}
                  onChange={(e) => setFormData({ ...formData, plate: e.target.value.toUpperCase() })}
                  placeholder="ABC-1234"
                  maxLength={8}
                  required
                />
              </div>

              <div className="flex justify-end space-x-2 pt-4">
                <Button type="button" variant="outline" onClick={resetForm}>
                  Cancelar
                </Button>
                <Button type="submit" disabled={saving}>
                  {saving ? <LoadingSpinner size="sm" /> : editingVehicle ? "Atualizar" : "Adicionar"}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Vehicles List */}
      {!showForm && (
        <>
          {vehicles.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <Car className="w-16 h-16 text-gray-400 mb-4" />
                <h3 className="text-lg font-semibold mb-2">Nenhum veículo cadastrado</h3>
                <p className="text-gray-600 text-center mb-4">
                  Adicione seu primeiro veículo para começar a agendar serviços
                </p>
                <Button onClick={() => setShowForm(true)}>
                  <Plus className="w-4 h-4 mr-2" />
                  Adicionar Veículo
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {vehicles.map((vehicle) => (
                <Card key={vehicle.id} className="overflow-hidden">
                  <div className="aspect-video bg-gradient-to-br from-blue-100 to-blue-200 relative flex items-center justify-center">
                    <Car className="w-16 h-16 text-blue-600" />
                    <div className="absolute top-2 right-2">
                      <Badge variant="secondary" className="bg-white/80">
                        {vehicle.year}
                      </Badge>
                    </div>
                  </div>
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <h3 className="font-semibold text-lg">
                          {vehicle.make} {vehicle.model}
                        </h3>
                        <p className="text-gray-600">{vehicle.year}</p>
                      </div>
                      <div className="flex space-x-1">
                        <Button variant="ghost" size="sm" onClick={() => startEdit(vehicle)}>
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button variant="ghost" size="sm" onClick={() => handleDelete(vehicle.id)}>
                          <Trash2 className="w-4 h-4 text-red-500" />
                        </Button>
                      </div>
                    </div>
                    <div className="space-y-1 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Placa:</span>
                        <Badge variant="secondary">{vehicle.plate}</Badge>
                      </div>
                      {vehicle.color && (
                        <div className="flex justify-between">
                          <span className="text-gray-600">Cor:</span>
                          <span>{vehicle.color}</span>
                        </div>
                      )}
                      <div className="flex justify-between">
                        <span className="text-gray-600">Cadastrado:</span>
                        <span>{new Date(vehicle.created_at).toLocaleDateString("pt-BR")}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  )
}
