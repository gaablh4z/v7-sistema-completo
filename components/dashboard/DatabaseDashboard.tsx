"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { LoadingSpinner } from "@/components/ui/LoadingSpinner"
import { useSupabase } from "@/hooks/useSupabase"
import { Calendar, Users, Car, Settings, RefreshCw } from "lucide-react"

interface User {
  id: string
  name: string
  email: string
  role: string
  created_at: string
}

interface Appointment {
  id: string
  appointment_date: string
  appointment_time: string
  status: string
  total_price: number
  users: { name: string; email: string }
  vehicles: { brand: string; model: string; year: number }
  services: { name: string; price: number; duration_minutes: number }
}

interface Service {
  id: string
  name: string
  price: number
  duration_minutes: number
  active: boolean
}

export function DatabaseDashboard() {
  const { loading, error, getUsers, getAppointments, getServices } = useSupabase()
  const [users, setUsers] = useState<User[]>([])
  const [appointments, setAppointments] = useState<Appointment[]>([])
  const [services, setServices] = useState<Service[]>([])
  const [refreshing, setRefreshing] = useState(false)

  const loadData = async () => {
    setRefreshing(true)
    try {
      const [usersData, appointmentsData, servicesData] = await Promise.all([
        getUsers(),
        getAppointments(),
        getServices(),
      ])

      setUsers(usersData || [])
      setAppointments(appointmentsData || [])
      setServices(servicesData || [])
    } catch (err) {
      console.error("Erro ao carregar dados:", err)
    } finally {
      setRefreshing(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [])

  const getStatusColor = (status: string) => {
    switch (status) {
      case "confirmed":
        return "bg-green-100 text-green-800"
      case "pending":
        return "bg-yellow-100 text-yellow-800"
      case "cancelled":
        return "bg-red-100 text-red-800"
      case "completed":
        return "bg-blue-100 text-blue-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(value)
  }

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString("pt-BR")
  }

  if (loading && !refreshing) {
    return (
      <div className="flex items-center justify-center h-64">
        <LoadingSpinner />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Dashboard do Banco de Dados</h1>
          <p className="text-gray-600 dark:text-gray-400">Dados em tempo real do Supabase</p>
        </div>
        <Button onClick={loadData} disabled={refreshing} className="flex items-center gap-2">
          <RefreshCw className={`h-4 w-4 ${refreshing ? "animate-spin" : ""}`} />
          Atualizar
        </Button>
      </div>

      {/* Error Display */}
      {error && (
        <Card className="border-red-200 bg-red-50">
          <CardContent className="pt-6">
            <p className="text-red-600">Erro: {error}</p>
          </CardContent>
        </Card>
      )}

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total de Usuários</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{users.length}</div>
            <p className="text-xs text-muted-foreground">
              {users.filter((u) => u.role === "client").length} clientes,{" "}
              {users.filter((u) => u.role === "admin").length} admins
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Agendamentos</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{appointments.length}</div>
            <p className="text-xs text-muted-foreground">
              {appointments.filter((a) => a.status === "confirmed").length} confirmados
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Serviços Ativos</CardTitle>
            <Car className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{services.length}</div>
            <p className="text-xs text-muted-foreground">
              Preço médio:{" "}
              {services.length > 0
                ? formatCurrency(services.reduce((acc, s) => acc + s.price, 0) / services.length)
                : "R$ 0,00"}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Receita Total</CardTitle>
            <Settings className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatCurrency(appointments.reduce((acc, a) => acc + (a.total_price || 0), 0))}
            </div>
            <p className="text-xs text-muted-foreground">Todos os agendamentos</p>
          </CardContent>
        </Card>
      </div>

      {/* Recent Appointments */}
      <Card>
        <CardHeader>
          <CardTitle>Agendamentos Recentes</CardTitle>
          <CardDescription>Últimos agendamentos do sistema</CardDescription>
        </CardHeader>
        <CardContent>
          {appointments.length === 0 ? (
            <p className="text-center text-gray-500 py-8">Nenhum agendamento encontrado</p>
          ) : (
            <div className="space-y-4">
              {appointments.slice(0, 5).map((appointment) => (
                <div key={appointment.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <h3 className="font-medium">{appointment.users?.name || "Cliente não encontrado"}</h3>
                      <Badge className={getStatusColor(appointment.status)}>{appointment.status}</Badge>
                    </div>
                    <p className="text-sm text-gray-600">
                      {appointment.vehicles?.brand} {appointment.vehicles?.model} ({appointment.vehicles?.year})
                    </p>
                    <p className="text-sm text-gray-500">
                      {appointment.services?.name} - {formatDate(appointment.appointment_date)} às{" "}
                      {appointment.appointment_time}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-medium">{formatCurrency(appointment.total_price || 0)}</p>
                    <p className="text-sm text-gray-500">{appointment.services?.duration_minutes}min</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Services List */}
      <Card>
        <CardHeader>
          <CardTitle>Serviços Disponíveis</CardTitle>
          <CardDescription>Lista de todos os serviços ativos</CardDescription>
        </CardHeader>
        <CardContent>
          {services.length === 0 ? (
            <p className="text-center text-gray-500 py-8">Nenhum serviço encontrado</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {services.map((service) => (
                <div key={service.id} className="p-4 border rounded-lg">
                  <h3 className="font-medium">{service.name}</h3>
                  <p className="text-lg font-bold text-blue-600">{formatCurrency(service.price)}</p>
                  <p className="text-sm text-gray-500">Duração: {service.duration_minutes} minutos</p>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
