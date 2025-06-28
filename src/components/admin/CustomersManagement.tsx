"use client"

import { useState, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog"
import { Search, Phone, Mail, Car, Calendar, Edit, Trash2, Eye, Plus } from "lucide-react"
import { supabase } from "@/lib/supabase"
import LoadingSpinner from "@/components/ui/LoadingSpinner"
import { useNotification } from "@/contexts/NotificationContext"

interface Customer {
  id: string
  name: string
  email: string
  phone: string
  created_at: string
  vehicles_count: number
  appointments_count: number
  total_spent: number
  last_appointment: string
}

export default function CustomersManagement() {
  const [customers, setCustomers] = useState<Customer[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null)
  const [editDialog, setEditDialog] = useState(false)
  const [viewDialog, setViewDialog] = useState(false)
  const [deleteDialog, setDeleteDialog] = useState(false)
  const [editForm, setEditForm] = useState({
    name: "",
    email: "",
    phone: "",
  })
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage] = useState(6)
  
  // Customer status control
  const [customerStatus, setCustomerStatus] = useState("active") // status control implementation
  const { showError, showSuccess } = useNotification()

  useEffect(() => {
    loadCustomers()
  }, [])

  const loadCustomers = async () => {
    try {
      // Get users with role 'client'
      const { data: users, error: usersError } = await supabase.from("users").select("*").eq("role", "client")

      if (usersError) throw usersError

      // Get additional data for each user
      const customersWithData = await Promise.all(
        (users || []).map(async (user) => {
          // Get vehicles count
          const { count: vehiclesCount } = await supabase
            .from("vehicles")
            .select("*", { count: "exact", head: true })
            .eq("user_id", user.id)

          // Get appointments data
          const { data: appointments } = await supabase
            .from("appointments")
            .select("total_price, appointment_date")
            .eq("user_id", user.id)

          const totalSpent = appointments?.reduce((sum, apt) => sum + Number(apt.total_price), 0) || 0
          const lastAppointment =
            appointments && appointments.length > 0
              ? Math.max(...appointments.map((apt) => new Date(apt.appointment_date).getTime()))
              : null

          return {
            id: user.id,
            name: user.name,
            email: user.email,
            phone: user.phone || "",
            created_at: user.created_at,
            vehicles_count: vehiclesCount || 0,
            appointments_count: appointments?.length || 0,
            total_spent: totalSpent,
            last_appointment: lastAppointment ? new Date(lastAppointment).toISOString() : "",
          }
        }),
      )

      setCustomers(customersWithData)
    } catch (error) {
      console.error("Error loading customers:", error)
      showError("Erro", "Falha ao carregar clientes")
    } finally {
      setLoading(false)
    }
  }

  const filteredCustomers = customers.filter(
    (customer) =>
      customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      customer.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      customer.phone.includes(searchTerm),
  )

  // Pagination logic
  // Pagination implementation
  const totalPages = Math.ceil(filteredCustomers.length / itemsPerPage) // pagination controls
  const startIndex = (currentPage - 1) * itemsPerPage
  const paginatedCustomers = filteredCustomers.slice(startIndex, startIndex + itemsPerPage)

  const goToPage = (page: number) => {
    setCurrentPage(page)
  }

  const handleEdit = async () => {
    if (!selectedCustomer) return

    try {
      // In demo mode, just update local state
      setCustomers((prev) =>
        prev.map((customer) =>
          customer.id === selectedCustomer.id ? { ...customer, ...editForm } : customer,
        ),
      )

      showSuccess("Cliente editado com sucesso!")
      setEditDialog(false)
    } catch (error) {
      console.error("Error editing customer:", error)
      showError("Erro", "Falha ao editar cliente")
    }
  }

  const handleDelete = async () => {
    if (!selectedCustomer) return

    try {
      // In demo mode, just update local state
      setCustomers((prev) => prev.filter((customer) => customer.id !== selectedCustomer.id))

      showSuccess("Cliente excluído com sucesso!")
      setDeleteDialog(false)
    } catch (error) {
      console.error("Error deleting customer:", error)
      showError("Erro", "Falha ao excluir cliente")
    }
  }

  const openEditDialog = (customer: Customer) => {
    setSelectedCustomer(customer)
    setEditForm({
      name: customer.name,
      email: customer.email,
      phone: customer.phone,
    })
    setEditDialog(true)
  }

  const openViewDialog = (customer: Customer) => {
    setSelectedCustomer(customer)
    setViewDialog(true)
  }

  const openDeleteDialog = (customer: Customer) => {
    setSelectedCustomer(customer)
    setDeleteDialog(true)
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
          <h1 className="text-3xl font-bold">Gerenciar Clientes</h1>
          <p className="text-gray-600">Visualize e gerencie informações dos clientes</p>
        </div>
        <Button>Adicionar Cliente</Button>
      </div>

      {/* Search */}
      <Card>
        <CardContent className="p-4">
          <div className="relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Buscar por nome, email ou telefone..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </CardContent>
      </Card>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="text-center">
              <p className="text-2xl font-bold">{customers.length}</p>
              <p className="text-sm text-gray-600">Total de Clientes</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-center">
              <p className="text-2xl font-bold">
                {
                  customers.filter(
                    (c) =>
                      c.last_appointment &&
                      new Date(c.last_appointment) > new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
                  ).length
                }
              </p>
              <p className="text-sm text-gray-600">Ativos (30 dias)</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-center">
              <p className="text-2xl font-bold">
                R$ {customers.reduce((sum, c) => sum + c.total_spent, 0).toFixed(0)}
              </p>
              <p className="text-sm text-gray-600">Receita Total</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-center">
              <p className="text-2xl font-bold">
                R$ {(customers.reduce((sum, c) => sum + c.total_spent, 0) / customers.length || 0).toFixed(0)}
              </p>
              <p className="text-sm text-gray-600">Ticket Médio</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Customers List */}
      <div className="space-y-4">
        {filteredCustomers.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <Search className="w-16 h-16 text-gray-400 mb-4" />
              <h3 className="text-lg font-semibold mb-2">Nenhum cliente encontrado</h3>
              <p className="text-gray-600 text-center mb-4">
                {searchTerm ? "Tente ajustar os termos de busca" : "Ainda não há clientes cadastrados"}
              </p>
            </CardContent>
          </Card>
        ) : (
          paginatedCustomers.map((customer) => (
            <Card key={customer.id}>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <Avatar className="w-12 h-12">
                      <AvatarFallback>
                        {customer.name
                          .split(" ")
                          .map((n) => n[0])
                          .join("")
                          .toUpperCase()}
                      </AvatarFallback>
                    </Avatar>

                    <div className="flex-1">
                      <h3 className="font-semibold text-lg">{customer.name}</h3>
                      <div className="flex items-center gap-4 text-sm text-gray-600">
                        <div className="flex items-center gap-1">
                          <Mail className="w-4 h-4" />
                          {customer.email}
                        </div>
                        {customer.phone && (
                          <div className="flex items-center gap-1">
                            <Phone className="w-4 h-4" />
                            {customer.phone}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-6">
                    <div className="text-center">
                      <div className="flex items-center gap-1 text-sm text-gray-600">
                        <Car className="w-4 h-4" />
                        <span>{customer.vehicles_count} veículos</span>
                      </div>
                      <div className="flex items-center gap-1 text-sm text-gray-600">
                        <Calendar className="w-4 h-4" />
                        <span>{customer.appointments_count} serviços</span>
                      </div>
                    </div>

                    <div className="text-right">
                      <p className="text-lg font-bold text-green-600">
                        R$ {customer.total_spent.toFixed(2).replace(".", ",")}
                      </p>
                      <p className="text-sm text-gray-600">Total gasto</p>
                    </div>

                    <div className="flex flex-col gap-2">
                      <Button variant="outline" size="sm" onClick={() => openViewDialog(customer)}>
                        Ver Detalhes
                      </Button>
                      <Button variant="outline" size="sm" onClick={() => openEditDialog(customer)}>
                        Editar
                      </Button>
                      <Button variant="outline" size="sm" onClick={() => openDeleteDialog(customer)}>
                        Excluir
                      </Button>
                    </div>
                  </div>
                </div>

                {customer.last_appointment && (
                  <div className="mt-4 pt-4 border-t">
                    <p className="text-sm text-gray-600">
                      Último serviço: {new Date(customer.last_appointment).toLocaleDateString("pt-BR")}
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-between">
        <div>
          Mostrando{" "}
          <span className="font-semibold">
            {Math.min((currentPage - 1) * itemsPerPage + 1, filteredCustomers.length)}-
            {Math.min(currentPage * itemsPerPage, filteredCustomers.length)}
          </span>{" "}
          de{" "}
          <span className="font-semibold">{filteredCustomers.length}</span> clientes
        </div>

        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            disabled={currentPage === 1}
            onClick={() => goToPage(currentPage - 1)}
          >
            Anterior
          </Button>
          <Button
            variant="outline"
            size="sm"
            disabled={currentPage === totalPages}
            onClick={() => goToPage(currentPage + 1)}
          >
            Próximo
          </Button>
        </div>
      </div>

      {/* Edit Customer Dialog */}
      <Dialog open={editDialog} onOpenChange={setEditDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Editar Cliente</DialogTitle>
            <DialogDescription>Altere as informações do cliente</DialogDescription>
          </DialogHeader>

          <div className="grid grid-cols-1 gap-4">
            <div>
              <Label htmlFor="name">Nome</Label>
              <Input
                id="name"
                value={editForm.name}
                onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
              />
            </div>
            <div>
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={editForm.email}
                onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
              />
            </div>
            <div>
              <Label htmlFor="phone">Telefone</Label>
              <Input
                id="phone"
                value={editForm.phone}
                onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })}
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setEditDialog(false)}>
              Cancelar
            </Button>
            <Button onClick={handleEdit}>Salvar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* View Customer Dialog */}
      <Dialog open={viewDialog} onOpenChange={setViewDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Detalhes do Cliente</DialogTitle>
            <DialogDescription>Informações detalhadas sobre o cliente</DialogDescription>
          </DialogHeader>

          {selectedCustomer && (
            <div className="grid grid-cols-1 gap-4">
              <div>
                <Label>Nome</Label>
                <p className="mt-1 text-gray-700">{selectedCustomer.name}</p>
              </div>
              <div>
                <Label>Email</Label>
                <p className="mt-1 text-gray-700">{selectedCustomer.email}</p>
              </div>
              <div>
                <Label>Telefone</Label>
                <p className="mt-1 text-gray-700">{selectedCustomer.phone}</p>
              </div>
              <div>
                <Label>Veículos</Label>
                <p className="mt-1 text-gray-700">
                  {selectedCustomer.vehicles_count} veículo
                  {selectedCustomer.vehicles_count !== 1 && "s"}
                </p>
              </div>
              <div>
                <Label>Serviços</Label>
                <p className="mt-1 text-gray-700">
                  {selectedCustomer.appointments_count} serviço
                  {selectedCustomer.appointments_count !== 1 && "s"}
                </p>
              </div>
              <div>
                <Label>Total Gasto</Label>
                <p className="mt-1 text-gray-700">
                  R$ {selectedCustomer.total_spent.toFixed(2).replace(".", ",")}
                </p>
              </div>
              <div>
                <Label>Último Serviço</Label>
                <p className="mt-1 text-gray-700">
                  {selectedCustomer.last_appointment
                    ? new Date(selectedCustomer.last_appointment).toLocaleDateString("pt-BR")
                    : "Nenhum serviço encontrado"}
                </p>
              </div>
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setViewDialog(false)}>
              Fechar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Customer Dialog */}
      <Dialog open={deleteDialog} onOpenChange={setDeleteDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Excluir Cliente</DialogTitle>
            <DialogDescription>Tem certeza que deseja excluir este cliente?</DialogDescription>
          </DialogHeader>

          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteDialog(false)}>
              Cancelar
            </Button>
            <Button onClick={handleDelete} className="bg-red-600 text-white">
              Excluir
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
