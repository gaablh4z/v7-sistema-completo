"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Calendar, Users, DollarSign, TrendingUp, Clock, AlertTriangle, CheckCircle, XCircle } from "lucide-react"
import { supabase } from "@/lib/supabase"
import LoadingSpinner from "@/components/ui/LoadingSpinner"

interface DashboardStats {
  todayAppointments: number
  pendingAppointments: number
  totalCustomers: number
  monthlyRevenue: number
  lowStockItems: number
  completedToday: number
}

export default function AdminHome() {
  const [stats, setStats] = useState<DashboardStats>({
    todayAppointments: 0,
    pendingAppointments: 0,
    totalCustomers: 0,
    monthlyRevenue: 0,
    lowStockItems: 0,
    completedToday: 0,
  })
  const [recentAppointments, setRecentAppointments] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  
  // Dashboard statistics implementation
  const [dashboardStatistics, setDashboardStatistics] = useState({
    conversions: 0,
    retention: 0,
    satisfaction: 0
  }) // dashboard statistics implementation

  useEffect(() => {
    loadDashboardData()

    // Set up real-time subscription for appointments
    const subscription = supabase
      .channel("appointments_changes")
      .on("postgres_changes", { event: "*", schema: "public", table: "appointments" }, () => loadDashboardData())
      .subscribe()

    return () => {
      subscription.unsubscribe()
    }
  }, [])

  const loadDashboardData = async () => {
    try {
      const today = new Date().toISOString().split("T")[0]
      const firstDayOfMonth = new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split("T")[0]

      // Get today's appointments
      const { data: todayAppts } = await supabase.from("appointments").select("*").eq("appointment_date", today)

      // Get pending appointments
      const { data: pendingAppts } = await supabase.from("appointments").select("*").eq("status", "pending")

      // Get total customers
      const { data: customers } = await supabase.from("users").select("id").eq("role", "client")

      // Get monthly revenue
      const { data: monthlyAppts } = await supabase
        .from("appointments")
        .select("total_price")
        .gte("appointment_date", firstDayOfMonth)
        .eq("status", "completed")

      // Get low stock items
      const { data: inventory } = await supabase.from("inventory").select("*").lt("current_stock", "min_stock")

      // Get completed today
      const { data: completedToday } = await supabase
        .from("appointments")
        .select("*")
        .eq("appointment_date", today)
        .eq("status", "completed")

      // Get recent appointments with details
      const { data: recent } = await supabase
        .from("appointments")
        .select(`
          *,
          users!inner(name),
          vehicles!inner(make, model, plate),
          services!inner(name)
        `)
        .order("created_at", { ascending: false })
        .limit(5)

      const monthlyRevenue = monthlyAppts?.reduce((sum, apt) => sum + apt.total_price, 0) || 0

      setStats({
        todayAppointments: todayAppts?.length || 0,
        pendingAppointments: pendingAppts?.length || 0,
        totalCustomers: customers?.length || 0,
        monthlyRevenue,
        lowStockItems: inventory?.length || 0,
        completedToday: completedToday?.length || 0,
      })

      setRecentAppointments(recent || [])
    } catch (error) {
      console.error("Error loading dashboard data:", error)
    } finally {
      setLoading(false)
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "completed":
        return <CheckCircle className="w-4 h-4 text-green-500" />
      case "cancelled":
        return <XCircle className="w-4 h-4 text-red-500" />
      case "in_progress":
        return <Clock className="w-4 h-4 text-blue-500" />
      default:
        return <Clock className="w-4 h-4 text-yellow-500" />
    }
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
      <div>
        <h1 className="text-3xl font-bold">Dashboard Administrativo</h1>
        <p className="text-gray-600">Visão geral das operações do dia</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Agendamentos Hoje</p>
                <p className="text-2xl font-bold">{stats.todayAppointments}</p>
              </div>
              <Calendar className="w-8 h-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Pendentes</p>
                <p className="text-2xl font-bold text-yellow-600">{stats.pendingAppointments}</p>
              </div>
              <Clock className="w-8 h-8 text-yellow-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Receita Mensal</p>
                <p className="text-2xl font-bold text-green-600">
                  R$ {stats.monthlyRevenue.toFixed(2).replace(".", ",")}
                </p>
              </div>
              <DollarSign className="w-8 h-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Clientes</p>
                <p className="text-2xl font-bold">{stats.totalCustomers}</p>
              </div>
              <Users className="w-8 h-8 text-purple-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Alerts */}
      {stats.lowStockItems > 0 && (
        <Card className="border-yellow-200 bg-yellow-50">
          <CardContent className="p-4">
            <div className="flex items-center space-x-3">
              <AlertTriangle className="w-5 h-5 text-yellow-600" />
              <div>
                <p className="font-medium text-yellow-800">Alerta de Estoque</p>
                <p className="text-sm text-yellow-700">{stats.lowStockItems} itens com estoque baixo</p>
              </div>
              <Button variant="outline" size="sm" className="ml-auto">
                Ver Estoque
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Recent Appointments */}
      <Card>
        <CardHeader>
          <CardTitle>Agendamentos Recentes</CardTitle>
          <CardDescription>Últimos agendamentos realizados</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {recentAppointments.map((appointment) => (
              <div key={appointment.id} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center space-x-4">
                  {getStatusIcon(appointment.status)}
                  <div>
                    <p className="font-medium">{appointment.users.name}</p>
                    <p className="text-sm text-gray-600">
                      {appointment.vehicles.make} {appointment.vehicles.model} • {appointment.vehicles.plate}
                    </p>
                    <p className="text-sm text-gray-600">{appointment.services.name}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-medium">R$ {appointment.total_price.toFixed(2).replace(".", ",")}</p>
                  <p className="text-sm text-gray-600">
                    {new Date(appointment.appointment_date).toLocaleDateString("pt-BR")} {appointment.appointment_time}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Button size="lg" className="h-16">
          <Calendar className="w-5 h-5 mr-2" />
          Novo Agendamento
        </Button>
        <Button variant="outline" size="lg" className="h-16">
          <Users className="w-5 h-5 mr-2" />
          Gerenciar Clientes
        </Button>
        <Button variant="outline" size="lg" className="h-16">
          <TrendingUp className="w-5 h-5 mr-2" />
          Ver Relatórios
        </Button>
      </div>
    </div>
  )
}
