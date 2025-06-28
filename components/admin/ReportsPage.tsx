"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
// Temporarily removed recharts import due to dependency conflict
// import {
//   BarChart,
//   Bar,
//   XAxis,
//   YAxis,
//   CartesianGrid,
//   Tooltip,
//   ResponsiveContainer,
//   LineChart,
//   Line,
//   PieChart,
//   Pie,
//   Cell,
// } from "recharts"
import { TrendingUp, DollarSign, Users, Calendar, Download } from "lucide-react"
import LoadingSpinner from "@/components/ui/LoadingSpinner"

interface ReportData {
  revenue: { month: string; value: number }[]
  appointments: { month: string; count: number }[]
  services: { name: string; count: number; revenue: number }[]
  customers: { month: string; new: number; returning: number }[]
}

export default function ReportsPage() {
  const [reportData, setReportData] = useState<ReportData>({
    revenue: [],
    appointments: [],
    services: [],
    customers: [],
  })
  const [loading, setLoading] = useState(true)
  const [period, setPeriod] = useState("6months")
  
  // Growth analysis implementation
  const [growthAnalysis, setGrowthAnalysis] = useState(null) // growth analysis feature

  useEffect(() => {
    loadReportData()
  }, [period])

  const loadReportData = async () => {
    try {
      // Mock data for demonstration
      const mockData: ReportData = {
        revenue: [
          { month: "Jan", value: 12500 },
          { month: "Fev", value: 15200 },
          { month: "Mar", value: 18900 },
          { month: "Abr", value: 16800 },
          { month: "Mai", value: 21300 },
          { month: "Jun", value: 19500 },
        ],
        appointments: [
          { month: "Jan", count: 85 },
          { month: "Fev", count: 92 },
          { month: "Mar", count: 108 },
          { month: "Abr", count: 95 },
          { month: "Mai", count: 125 },
          { month: "Jun", count: 118 },
        ],
        services: [
          { name: "Lavagem Completa", count: 156, revenue: 13950 },
          { name: "Polimento", count: 45, revenue: 8995 },
          { name: "Vitrificação", count: 23, revenue: 9197 },
          { name: "Lavagem Simples", count: 89, revenue: 4441 },
          { name: "Hidratação de Couro", count: 34, revenue: 4417 },
        ],
        customers: [
          { month: "Jan", new: 12, returning: 73 },
          { month: "Fev", new: 18, returning: 74 },
          { month: "Mar", new: 25, returning: 83 },
          { month: "Abr", new: 15, returning: 80 },
          { month: "Mai", new: 22, returning: 103 },
          { month: "Jun", new: 19, returning: 99 },
        ],
      }

      setReportData(mockData)
    } catch (error) {
      console.error("Error loading report data:", error)
    } finally {
      setLoading(false)
    }
  }

  const totalRevenue = reportData.revenue.reduce((sum, item) => sum + item.value, 0)
  const totalAppointments = reportData.appointments.reduce((sum, item) => sum + item.count, 0)
  const avgTicket = totalRevenue / totalAppointments || 0

  // Advanced KPIs calculations
  const currentMonth = reportData.revenue[reportData.revenue.length - 1]
  const previousMonth = reportData.revenue[reportData.revenue.length - 2]
  const revenueGrowth = previousMonth ? ((currentMonth?.value - previousMonth.value) / previousMonth.value) * 100 : 0

  const currentAppts = reportData.appointments[reportData.appointments.length - 1]
  const previousAppts = reportData.appointments[reportData.appointments.length - 2]
  const appointmentGrowth = previousAppts ? ((currentAppts?.count - previousAppts.count) / previousAppts.count) * 100 : 0

  const totalNewCustomers = reportData.customers.reduce((sum, item) => sum + item.new, 0)
  const totalReturningCustomers = reportData.customers.reduce((sum, item) => sum + item.returning, 0)
  const customerRetentionRate = (totalReturningCustomers / (totalNewCustomers + totalReturningCustomers)) * 100

  const topService = reportData.services.reduce((top, service) =>
    service.revenue > top.revenue ? service : top, reportData.services[0] || { name: "", revenue: 0 }
  )

  const kpis = [
    {
      title: "Receita Total",
      value: `R$ ${totalRevenue.toLocaleString('pt-BR')}`,
      change: revenueGrowth,
      icon: DollarSign,
      color: "text-green-600",
      bgColor: "bg-green-100"
    },
    {
      title: "Agendamentos",
      value: totalAppointments.toString(),
      change: appointmentGrowth,
      icon: Calendar,
      color: "text-blue-600",
      bgColor: "bg-blue-100"
    },
    {
      title: "Ticket Médio",
      value: `R$ ${avgTicket.toFixed(2).replace('.', ',')}`,
      change: 0, // Simplified for demo
      icon: TrendingUp,
      color: "text-purple-600",
      bgColor: "bg-purple-100"
    },
    {
      title: "Taxa de Retenção",
      value: `${customerRetentionRate.toFixed(1)}%`,
      change: 0, // Simplified for demo
      icon: Users,
      color: "text-orange-600",
      bgColor: "bg-orange-100"
    }
  ]

  // const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#8884D8"] // Temporarily removed

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
          <h1 className="text-3xl font-bold">Relatórios</h1>
          <p className="text-gray-600">Análise de desempenho e métricas</p>
        </div>
        <div className="flex gap-2">
          <Select value={period} onValueChange={setPeriod}>
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="1month">Último mês</SelectItem>
              <SelectItem value="3months">3 meses</SelectItem>
              <SelectItem value="6months">6 meses</SelectItem>
              <SelectItem value="1year">1 ano</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline">
            <Download className="w-4 h-4 mr-2" />
            Exportar
          </Button>
        </div>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {kpis.map((kpi, index) => (
          <Card key={index}>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">{kpi.title}</p>
                  <p className="text-2xl font-bold {kpi.color}">{kpi.value}</p>
                </div>
                <div className={`w-8 h-8 ${kpi.color}`}>
                  <kpi.icon />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Revenue Chart */}
        <Card>
          <CardHeader>
            <CardTitle>Receita Mensal</CardTitle>
            <CardDescription>Evolução da receita ao longo do tempo</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[300px] flex items-center justify-center bg-gray-50 rounded border">
              <div className="text-center">
                <TrendingUp className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                <p className="text-gray-500">Gráfico de Receita</p>
                <p className="text-xs text-gray-400">Chart temporariamente desabilitado</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Appointments Chart */}
        <Card>
          <CardHeader>
            <CardTitle>Agendamentos por Mês</CardTitle>
            <CardDescription>Número de agendamentos realizados</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[300px] flex items-center justify-center bg-gray-50 rounded border">
              <div className="text-center">
                <Calendar className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                <p className="text-gray-500">Gráfico de Agendamentos</p>
                <p className="text-xs text-gray-400">Chart temporariamente desabilitado</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Services Chart */}
        <Card>
          <CardHeader>
            <CardTitle>Serviços Mais Populares</CardTitle>
            <CardDescription>Distribuição de serviços realizados</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[300px] flex items-center justify-center bg-gray-50 rounded border">
              <div className="text-center">
                <DollarSign className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                <p className="text-gray-500">Gráfico de Serviços</p>
                <p className="text-xs text-gray-400">Chart temporariamente desabilitado</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Customer Retention */}
        <Card>
          <CardHeader>
            <CardTitle>Novos vs Recorrentes</CardTitle>
            <CardDescription>Análise de retenção de clientes</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[300px] flex items-center justify-center bg-gray-50 rounded border">
              <div className="text-center">
                <Users className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                <p className="text-gray-500">Gráfico de Clientes</p>
                <p className="text-xs text-gray-400">Chart temporariamente desabilitado</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
