"use client"

import { useState, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"
import { Star, Search, Calendar, Car, Download } from "lucide-react"
import { useAuth } from "@/contexts/AuthContext"
import { useNotification } from "@/contexts/NotificationContext"
import { supabase } from "@/lib/supabase"
import LoadingSpinner from "@/components/ui/LoadingSpinner"

interface AppointmentHistory {
  id: string
  appointment_date: string
  appointment_time: string
  status: string
  total_price: number
  notes?: string
  queue_position: number
  vehicle: {
    make: string
    model: string
    plate: string
  }
  services: {
    name: string
    price: number
  }[]
  review?: {
    rating: number
    comment: string
  }
}

export default function HistoryPage() {
  const [appointments, setAppointments] = useState<AppointmentHistory[]>([])
  const [filteredAppointments, setFilteredAppointments] = useState<AppointmentHistory[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [selectedAppointment, setSelectedAppointment] = useState<AppointmentHistory | null>(null)
  const [reviewDialog, setReviewDialog] = useState(false)
  const [rating, setRating] = useState(0)
  const [comment, setComment] = useState("")
  const [rescheduleDialog, setRescheduleDialog] = useState(false)
  const [rescheduleData, setRescheduleData] = useState({
    date: "",
    time: "",
  })
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage] = useState(5) // pagination implementation

  const { user } = useAuth()
  const { showSuccess, showError } = useNotification()

  useEffect(() => {
    loadAppointments()
  }, [user])

  useEffect(() => {
    filterAppointments()
  }, [appointments, searchTerm, statusFilter])

  const loadAppointments = async () => {
    if (!user) return

    try {
      console.log("🔧 Modo demonstração ativo - Carregando histórico mock")
      
      // Dados mock para demonstração
      const mockAppointments: AppointmentHistory[] = [
        {
          id: "1",
          appointment_date: "2024-01-15",
          appointment_time: "10:00",
          status: "completed",
          total_price: 85,
          notes: "Serviço concluído com sucesso",
          queue_position: 1,
          vehicle: {
            make: "Toyota",
            model: "Corolla", 
            plate: "ABC-1234"
          },
          services: [
            {
              name: "Lavagem Completa",
              price: 35
            },
            {
              name: "Enceramento", 
              price: 50
            }
          ],
          review: {
            rating: 5,
            comment: "Excelente serviço!"
          }
        },
        {
          id: "2", 
          appointment_date: "2024-01-20",
          appointment_time: "14:30",
          status: "confirmed",
          total_price: 35,
          notes: "Agendamento confirmado",
          queue_position: 2,
          vehicle: {
            make: "Honda",
            model: "Civic",
            plate: "XYZ-5678"
          },
          services: [
            {
              name: "Lavagem Completa",
              price: 35
            }
          ]
        }
      ]
      
      setAppointments(mockAppointments)
    } catch (error) {
      console.error("Error loading appointments:", error)
      // Removido showError automático  
    } finally {
      setLoading(false)
    }
  }

  const filterAppointments = () => {
    let filtered = appointments

    if (searchTerm) {
      filtered = filtered.filter(
        (apt) =>
          apt.vehicle.make.toLowerCase().includes(searchTerm.toLowerCase()) ||
          apt.vehicle.model.toLowerCase().includes(searchTerm.toLowerCase()) ||
          apt.vehicle.plate.toLowerCase().includes(searchTerm.toLowerCase()) ||
          apt.services.some((service) => service.name.toLowerCase().includes(searchTerm.toLowerCase())),
      )
    }

    if (statusFilter !== "all") {
      filtered = filtered.filter((apt) => apt.status === statusFilter)
    }

    setFilteredAppointments(filtered)
  }

  // Pagination logic
  const totalPages = Math.ceil(filteredAppointments.length / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const paginatedAppointments = filteredAppointments.slice(startIndex, startIndex + itemsPerPage)

  const goToPage = (page: number) => {
    setCurrentPage(page)
  }

  const getStatusBadge = (status: string) => {
    const statusMap = {
      pending: { label: "Pendente", variant: "secondary" as const },
      confirmed: { label: "Confirmado", variant: "default" as const },
      in_progress: { label: "Em Andamento", variant: "default" as const },
      completed: { label: "Concluído", variant: "default" as const },
      cancelled: { label: "Cancelado", variant: "destructive" as const },
    }

    const statusInfo = statusMap[status as keyof typeof statusMap] || {
      label: status,
      variant: "secondary" as const,
    }

    return <Badge variant={statusInfo.variant}>{statusInfo.label}</Badge>
  }

  const handleReview = async () => {
    if (!selectedAppointment || rating === 0) {
      showError("Erro", "Selecione uma avaliação")
      return
    }

    try {
      const { error } = await supabase.from("reviews").insert([
        {
          user_id: user?.id,
          appointment_id: selectedAppointment.id,
          rating,
          comment,
        },
      ])

      if (error) throw error

      showSuccess("Avaliação enviada com sucesso!")
      setReviewDialog(false)
      setRating(0)
      setComment("")
      loadAppointments()
    } catch (error) {
      console.error("Error submitting review:", error)
      showError("Erro", "Falha ao enviar avaliação")
    }
  }

  const handleReschedule = async (appointmentId: string) => {
    try {
      if (!rescheduleData.date || !rescheduleData.time) {
        showError("Erro", "Selecione uma nova data e horário")
        return
      }

      // In demo mode, just update local state
      setAppointments((prev) =>
        prev.map((apt) =>
          apt.id === appointmentId
            ? { ...apt, appointment_date: rescheduleData.date, appointment_time: rescheduleData.time }
            : apt,
        ),
      )

      showSuccess("Agendamento reagendado com sucesso!")
      setRescheduleDialog(false)
      setRescheduleData({ date: "", time: "" })
    } catch (error) {
      console.error("Error rescheduling appointment:", error)
      showError("Erro", "Falha ao reagendar")
    }
  }

  const handleCancel = async (appointmentId: string) => {
    try {
      // In demo mode, just update local state
      setAppointments((prev) =>
        prev.map((apt) => (apt.id === appointmentId ? { ...apt, status: "cancelled" } : apt)),
      )

      showSuccess("Agendamento cancelado com sucesso!")
    } catch (error) {
      console.error("Error cancelling appointment:", error)
      showError("Erro", "Falha ao cancelar agendamento")
    }
  }

  const exportToPDF = () => {
    // In a real app, implement PDF export
    showSuccess("Relatório exportado!", "Funcionalidade em desenvolvimento")
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
          <h1 className="text-3xl font-bold">Histórico de Serviços</h1>
          <p className="text-gray-600">Acompanhe todos os seus agendamentos</p>
        </div>
        <Button onClick={exportToPDF} variant="outline">
          <Download className="w-4 h-4 mr-2" />
          Exportar PDF
        </Button>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Buscar por veículo ou serviço..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full md:w-48">
                <SelectValue placeholder="Filtrar por status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos os Status</SelectItem>
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
      {filteredAppointments.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Calendar className="w-16 h-16 text-gray-400 mb-4" />
            <h3 className="text-lg font-semibold mb-2">Nenhum agendamento encontrado</h3>
            <p className="text-gray-600 text-center mb-4">
              {searchTerm || statusFilter !== "all"
                ? "Tente ajustar os filtros de busca"
                : "Você ainda não possui agendamentos"}
            </p>
            <Button>Agendar Primeiro Serviço</Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {paginatedAppointments.map((appointment) => (
            <Card key={appointment.id} className="overflow-hidden">
              <CardContent className="p-6">
                <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="flex items-center text-sm text-gray-600">
                        <Calendar className="w-4 h-4 mr-1" />
                        {new Date(appointment.appointment_date).toLocaleDateString("pt-BR")} às{" "}
                        {appointment.appointment_time}
                      </div>
                      {getStatusBadge(appointment.status)}
                      {appointment.queue_position && (
                        <Badge variant="outline">Posição: {appointment.queue_position}</Badge>
                      )}
                    </div>

                    <div className="flex items-center gap-3 mb-3">
                      <Car className="w-5 h-5 text-gray-400" />
                      <span className="font-medium">
                        {appointment.vehicle.make} {appointment.vehicle.model}
                      </span>
                      <Badge variant="secondary">{appointment.vehicle.plate}</Badge>
                    </div>

                    <div className="space-y-1">
                      <h4 className="font-medium">Serviços:</h4>
                      {appointment.services.map((service, index) => (
                        <div key={index} className="flex justify-between text-sm">
                          <span>{service.name}</span>
                          <span>R$ {service.price.toFixed(2).replace(".", ",")}</span>
                        </div>
                      ))}
                    </div>

                    {appointment.notes && (
                      <div className="mt-3 p-3 bg-gray-50 rounded-lg">
                        <p className="text-sm text-gray-600">{appointment.notes}</p>
                      </div>
                    )}
                  </div>

                  <div className="flex flex-col items-end gap-3">
                    <div className="text-right">
                      <p className="text-2xl font-bold text-blue-600">
                        R$ {appointment.total_price.toFixed(2).replace(".", ",")}
                      </p>
                    </div>

                    {appointment.review ? (
                      <div className="flex items-center gap-1">
                        {[...Array(5)].map((_, i) => (
                          <Star
                            key={i}
                            className={`w-4 h-4 ${
                              i < appointment.review!.rating ? "text-yellow-400 fill-current" : "text-gray-300"
                            }`}
                          />
                        ))}
                        <span className="text-sm text-gray-600 ml-2">Avaliado</span>
                      </div>
                    ) : appointment.status === "completed" ? (
                      <Dialog open={reviewDialog} onOpenChange={setReviewDialog}>
                        <DialogTrigger asChild>
                          <Button variant="outline" size="sm" onClick={() => setSelectedAppointment(appointment)}>
                            <Star className="w-4 h-4 mr-2" />
                            Avaliar
                          </Button>
                        </DialogTrigger>
                        <DialogContent>
                          <DialogHeader>
                            <DialogTitle>Avaliar Serviço</DialogTitle>
                            <DialogDescription>Como foi sua experiência com nossos serviços?</DialogDescription>
                          </DialogHeader>
                          <div className="space-y-4">
                            <div>
                              <label className="text-sm font-medium">Avaliação</label>
                              <div className="flex gap-1 mt-2">
                                {[1, 2, 3, 4, 5].map((star) => (
                                  <button key={star} type="button" onClick={() => setRating(star)} className="p-1">
                                    <Star
                                      className={`w-6 h-6 ${
                                        star <= rating ? "text-yellow-400 fill-current" : "text-gray-300"
                                      }`}
                                    />
                                  </button>
                                ))}
                              </div>
                            </div>
                            <div>
                              <label className="text-sm font-medium">Comentário (Opcional)</label>
                              <Textarea
                                value={comment}
                                onChange={(e) => setComment(e.target.value)}
                                placeholder="Conte-nos sobre sua experiência..."
                                className="mt-2"
                              />
                            </div>
                            <div className="flex justify-end gap-2">
                              <Button variant="outline" onClick={() => setReviewDialog(false)}>
                                Cancelar
                              </Button>
                              <Button onClick={handleReview} disabled={rating === 0}>
                                Enviar Avaliação
                              </Button>
                            </div>
                          </div>
                        </DialogContent>
                      </Dialog>
                    ) : (
                      <div className="flex gap-2">
                        {appointment.status === "pending" && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              setSelectedAppointment(appointment)
                              setRescheduleDialog(true)
                            }}
                          >
                            Reagendar
                          </Button>
                        )}
                        {(appointment.status === "pending" || appointment.status === "confirmed") && (
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => handleCancel(appointment.id)}
                          >
                            Cancelar
                          </Button>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Pagination */}
      <div className="flex justify-between items-center py-4">
        <div>
          Exibindo{" "}
          <span className="font-semibold">
            {startIndex + 1} - {Math.min(startIndex + itemsPerPage, filteredAppointments.length)}{" "}
          </span>
          de {filteredAppointments.length} agendamentos
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => goToPage(currentPage - 1)}
            disabled={currentPage === 1}
          >
            Anterior
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => goToPage(currentPage + 1)}
            disabled={currentPage === totalPages}
          >
            Próximo
          </Button>
        </div>
      </div>

      {/* Reschedule Dialog */}
      <Dialog open={rescheduleDialog} onOpenChange={setRescheduleDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reagendar Serviço</DialogTitle>
            <DialogDescription>Selecione uma nova data e horário para o seu serviço</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium">Data</label>
              <Input
                type="date"
                value={rescheduleData.date}
                onChange={(e) => setRescheduleData({ ...rescheduleData, date: e.target.value })}
                className="mt-2"
              />
            </div>
            <div>
              <label className="text-sm font-medium">Horário</label>
              <Input
                type="time"
                value={rescheduleData.time}
                onChange={(e) => setRescheduleData({ ...rescheduleData, time: e.target.value })}
                className="mt-2"
              />
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setRescheduleDialog(false)}>
                Cancelar
              </Button>
              <Button
                onClick={() => handleReschedule(selectedAppointment!.id)}
                disabled={!rescheduleData.date || !rescheduleData.time}
              >
                Confirmar Reagendamento
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
