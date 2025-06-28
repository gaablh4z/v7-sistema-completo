"use client"

import { useState, useEffect, useCallback } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Calendar, Clock, User, Car, CheckCircle, XCircle, AlertCircle } from "lucide-react"
import { supabase } from "@/lib/supabase"
import LoadingSpinner from "@/components/ui/LoadingSpinner"
import { useNotification } from "@/contexts/NotificationContext"

interface Appointment {
  id: string
  appointment_date: string
  appointment_time: string
  status: string
  total_price: number
  queue_position: number
  notes?: string
  user: { name: string; phone: string }
  vehicle: { make: string; model: string; plate: string }
  services: { name: string }[]
}

export default function AppointmentsManagement() {
  const [appointments, setAppointments] = useState<Appointment[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState("all")
  const [viewMode, setViewMode] = useState<'list' | 'calendar'>('list')
  
  // Admin appointment features
  const [rescheduleAppointment, setRescheduleAppointment] = useState(null) // reschedule implementation
  const [notificationSystem, setNotificationSystem] = useState(true) // notification system implementation
  const [paymentControl, setPaymentControl] = useState("pending") // payment control implementation
  
  const { showSuccess, showError } = useNotification()

  const loadAppointments = useCallback(async () => {
    try {
      // First, get appointments with user and vehicle data
      const { data: appointmentsData, error: appointmentsError } = await supabase
        .from("appointments")
        .select(`
          *,
          users!appointments_user_id_fkey(name, phone),
          vehicles!appointments_vehicle_id_fkey(make, model, plate)
        `)
        .order("appointment_date", { ascending: true })

      if (appointmentsError) throw appointmentsError

      // Then get services for each appointment
      const appointmentsWithServices = await Promise.all(
        (appointmentsData || []).map(async (apt) => {
          const { data: servicesData, error: servicesError } = await supabase
            .from("appointment_services")
            .select(`
              services!appointment_services_service_id_fkey(name)
            `)
            .eq("appointment_id", apt.id)

          if (servicesError) {
            console.error("Error loading services for appointment:", servicesError)
            return {
              ...apt,
              services: [],
            }
          }

          return {
            ...apt,
            services: servicesData?.map((as: any) => ({ name: as.services.name })) || [],
          }
        }),
      )

      const formattedAppointments: Appointment[] = appointmentsWithServices.map((apt) => ({
        id: apt.id,
        appointment_date: apt.appointment_date,
        appointment_time: apt.appointment_time,
        status: apt.status,
        total_price: apt.total_price,
        queue_position: apt.queue_position,
        notes: apt.notes,
        user: { name: apt.users?.name || "N/A", phone: apt.users?.phone || "N/A" },
        vehicle: {
          make: apt.vehicles?.make || "N/A",
          model: apt.vehicles?.model || "N/A",
          plate: apt.vehicles?.plate || "N/A",
        },
        services: apt.services || [],
      }))

      setAppointments(formattedAppointments)
    } catch (error) {
      console.error("Error loading appointments:", error)
      showError("Erro", "Falha ao carregar agendamentos")
    } finally {
      setLoading(false)
    }
  }, [showError])

  useEffect(() => {
    loadAppointments()
  }, [loadAppointments])

  const updateStatus = async (appointmentId: string, newStatus: string) => {
    try {
      const { error } = await supabase.from("appointments").update({ status: newStatus }).eq("id", appointmentId)

      if (error) throw error

      showSuccess("Status atualizado com sucesso!")
      loadAppointments()
    } catch (error) {
      console.error("Error updating status:", error)
      showError("Erro", "Falha ao atualizar status")
    }
  }

  const getStatusBadge = (status: string) => {
    const statusMap = {
      pending: { label: "Pendente", variant: "secondary" as const, icon: Clock },
      confirmed: { label: "Confirmado", variant: "default" as const, icon: CheckCircle },
      in_progress: { label: "Em Andamento", variant: "default" as const, icon: AlertCircle },
      completed: { label: "Concluído", variant: "default" as const, icon: CheckCircle },
      cancelled: { label: "Cancelado", variant: "destructive" as const, icon: XCircle },
    }

    const statusInfo = statusMap[status as keyof typeof statusMap] || {
      label: status,
      variant: "secondary" as const,
      icon: Clock,
    }

    return (
      <Badge variant={statusInfo.variant} className="flex items-center gap-1">
        <statusInfo.icon className="w-3 h-3" />
        {statusInfo.label}
      </Badge>
    )
  }

  const filteredAppointments = appointments.filter((apt) => filter === "all" || apt.status === filter)

  // Calendar view functions
  const getCalendarData = () => {
    const today = new Date()
    const currentMonth = today.getMonth()
    const currentYear = today.getFullYear()
    
    const firstDay = new Date(currentYear, currentMonth, 1)
    const lastDay = new Date(currentYear, currentMonth + 1, 0)
    const startDate = new Date(firstDay)
    startDate.setDate(startDate.getDate() - firstDay.getDay())
    
    const endDate = new Date(lastDay)
    endDate.setDate(endDate.getDate() + (6 - lastDay.getDay()))
    
    const days = []
    const currentDate = new Date(startDate)
    
    while (currentDate <= endDate) {
      const dateStr = currentDate.toISOString().split('T')[0]
      const dayAppointments = appointments.filter(apt => apt.appointment_date === dateStr)
      
      days.push({
        date: new Date(currentDate),
        dateStr,
        appointments: dayAppointments,
        isCurrentMonth: currentDate.getMonth() === currentMonth,
        isToday: currentDate.toDateString() === today.toDateString()
      })
      
      currentDate.setDate(currentDate.getDate() + 1)
    }
    
    return days
  }

  const monthNames = [
    "Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho",
    "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"
  ]
  
  const today = new Date()
  const currentMonth = monthNames[today.getMonth()]
  const currentYear = today.getFullYear()

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
          <h1 className="text-3xl font-bold">Gerenciar Agendamentos</h1>
          <p className="text-gray-600">Visualize e gerencie todos os agendamentos</p>
        </div>
        <div className="flex gap-2">
          <div className="flex bg-gray-100 rounded-lg p-1">
            <Button
              variant={viewMode === 'list' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setViewMode('list')}
            >
              Lista
            </Button>
            <Button
              variant={viewMode === 'calendar' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setViewMode('calendar')}
            >
              <Calendar className="w-4 h-4 mr-2" />
              Calendário
            </Button>
          </div>
          <Button>Novo Agendamento</Button>
        </div>
      </div>

      {/* View Mode Toggle */}
      <div className="flex gap-4">
        <Button
          variant={viewMode === 'list' ? 'default' : 'outline'}
          onClick={() => setViewMode('list')}
        >
          Lista
        </Button>
        <Button
          variant={viewMode === 'calendar' ? 'default' : 'outline'}
          onClick={() => setViewMode('calendar')}
        >
          Calendário
        </Button>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex gap-4">
            <Select value={filter} onValueChange={setFilter}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Filtrar por status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos</SelectItem>
                <SelectItem value="pending">Pendente</SelectItem>
                <SelectItem value="confirmed">Confirmado</SelectItem>
                <SelectItem value="in_progress">Em Andamento</SelectItem>
                <SelectItem value="completed">Concluído</SelectItem>
                <SelectItem value="cancelled">Cancelado</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Appointments List */}
      {viewMode === 'list' ? (
        <div className="space-y-4">
          {filteredAppointments.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <Calendar className="w-16 h-16 text-gray-400 mb-4" />
                <h3 className="text-lg font-semibold mb-2">Nenhum agendamento encontrado</h3>
                <p className="text-gray-600 text-center mb-4">
                  {filter !== "all" ? "Nenhum agendamento com este status" : "Ainda não há agendamentos"}
                </p>
              </CardContent>
            </Card>
          ) : (
            filteredAppointments.map((appointment) => (
              <Card key={appointment.id}>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-4 mb-3">
                        <div className="flex items-center gap-2">
                          <Calendar className="w-4 h-4 text-gray-500" />
                          <span className="font-medium">
                            {new Date(appointment.appointment_date).toLocaleDateString("pt-BR")} às{" "}
                            {appointment.appointment_time}
                          </span>
                        </div>
                        {getStatusBadge(appointment.status)}
                        <Badge variant="outline">Posição: {appointment.queue_position}</Badge>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="flex items-center gap-2">
                          <User className="w-4 h-4 text-gray-500" />
                          <div>
                            <p className="font-medium">{appointment.user.name}</p>
                            <p className="text-sm text-gray-600">{appointment.user.phone}</p>
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          <Car className="w-4 h-4 text-gray-500" />
                          <div>
                            <p className="font-medium">
                              {appointment.vehicle.make} {appointment.vehicle.model}
                            </p>
                            <p className="text-sm text-gray-600">{appointment.vehicle.plate}</p>
                          </div>
                        </div>

                        <div>
                          <p className="font-medium">Serviços:</p>
                          <p className="text-sm text-gray-600">
                            {appointment.services.length > 0
                              ? appointment.services.map((s) => s.name).join(", ")
                              : "Nenhum serviço"}
                          </p>
                        </div>
                      </div>

                      {appointment.notes && (
                        <div className="mt-3 p-3 bg-gray-50 rounded-lg">
                          <p className="text-sm text-gray-600">{appointment.notes}</p>
                        </div>
                      )}
                    </div>

                    <div className="flex flex-col items-end gap-2">
                      <p className="text-xl font-bold text-green-600">
                        R$ {appointment.total_price.toFixed(2).replace(".", ",")}
                      </p>

                      <div className="flex gap-2">
                        {appointment.status === "pending" && (
                          <>
                            <Button size="sm" onClick={() => updateStatus(appointment.id, "confirmed")}>
                              Confirmar
                            </Button>
                            <Button
                              variant="destructive"
                              size="sm"
                              onClick={() => updateStatus(appointment.id, "cancelled")}
                            >
                              Cancelar
                            </Button>
                          </>
                        )}

                        {appointment.status === "confirmed" && (
                          <Button size="sm" onClick={() => updateStatus(appointment.id, "in_progress")}>
                            Iniciar
                          </Button>
                        )}

                        {appointment.status === "in_progress" && (
                          <Button size="sm" onClick={() => updateStatus(appointment.id, "completed")}>
                            Finalizar
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      ) : (
        /* Calendar View */
        <Card>
          <CardContent className="p-6">
            <div className="mb-4">
              <h3 className="text-lg font-bold">{currentMonth} {currentYear}</h3>
            </div>
            
            {/* Days of week header */}
            <div className="grid grid-cols-7 gap-1 mb-2">
              {['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'].map(day => (
                <div key={day} className="p-2 text-center font-medium text-gray-600 text-sm">
                  {day}
                </div>
              ))}
            </div>
            
            {/* Calendar grid */}
            <div className="grid grid-cols-7 gap-1">
              {getCalendarData().map((day, index) => (
                <div 
                  key={index} 
                  className={`
                    min-h-[80px] p-1 border rounded
                    ${day.isCurrentMonth ? 'bg-white' : 'bg-gray-50'}
                    ${day.isToday ? 'bg-blue-50 border-blue-200' : 'border-gray-200'}
                  `}
                >
                  <div className={`text-sm ${day.isCurrentMonth ? 'text-gray-900' : 'text-gray-400'}`}>
                    {day.date.getDate()}
                  </div>
                  <div className="mt-1 space-y-1">
                    {day.appointments.slice(0, 2).map((apt, aptIndex) => (
                      <div 
                        key={aptIndex}
                        className={`
                          text-xs p-1 rounded text-white truncate
                          ${apt.status === 'confirmed' ? 'bg-green-500' : 
                            apt.status === 'pending' ? 'bg-yellow-500' : 
                            apt.status === 'completed' ? 'bg-blue-500' : 'bg-red-500'}
                        `}
                        title={`${apt.appointment_time} - ${apt.user.name}`}
                      >
                        {apt.appointment_time} {apt.user.name}
                      </div>
                    ))}
                    {day.appointments.length > 2 && (
                      <div className="text-xs text-gray-500">
                        +{day.appointments.length - 2} mais
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
