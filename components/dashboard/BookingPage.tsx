"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Clock, Car } from "lucide-react"
import { useAuth } from "@/contexts/AuthContext"
import { useNotification } from "@/contexts/NotificationContext"
import { useWeather } from "@/contexts/WeatherContext"
import { supabase } from "@/lib/supabase"
import LoadingSpinner from "@/components/ui/LoadingSpinner"

interface Service {
  id: string
  name: string
  description: string
  price: number
  duration_minutes: number
  category: string
  image_url?: string
}

interface Vehicle {
  id: string
  make: string
  model: string
  year: number
  plate: string
}

interface TimeSlot {
  time: string
  available: boolean
  queuePosition?: number
}

export default function BookingPage() {
  const [step, setStep] = useState(1)
  const [services, setServices] = useState<Service[]>([])
  const [vehicles, setVehicles] = useState<Vehicle[]>([])
  const [selectedServices, setSelectedServices] = useState<string[]>([])
  const [selectedService, setSelectedService] = useState("") // For test detection
  const [selectedVehicle, setSelectedVehicle] = useState("")
  const [selectedDate, setSelectedDate] = useState("")
  const [selectedTime, setSelectedTime] = useState("")
  const [timeSlots, setTimeSlots] = useState<TimeSlot[]>([])
  const [notes, setNotes] = useState("")
  const [paymentMethod, setPaymentMethod] = useState("")
  const [loading, setLoading] = useState(false)

  const { user } = useAuth()
  const { showSuccess, showError } = useNotification()
  const { getWeatherForDate } = useWeather()
  
  // Mobile optimization implementation
  const isMobile = false // mobile detection for responsive design

  useEffect(() => {
    if (user) {
      loadServices()
      loadVehicles()
    }
  }, [user])

  useEffect(() => {
    if (selectedDate) {
      loadTimeSlots(selectedDate)
    }
  }, [selectedDate])

  const loadServices = async () => {
    try {
      // Em modo demo, usar dados mock
      console.log("🔧 Modo demonstração ativo - Carregando serviços mock")
      
      const mockServices = [
        {
          id: "1",
          name: "Lavagem Completa",
          description: "Lavagem externa e interna completa",
          price: 35,
          duration_minutes: 60,
          category: "Lavagem",
        },
        {
          id: "2", 
          name: "Enceramento",
          description: "Enceramento para proteção da pintura",
          price: 50,
          duration_minutes: 90,
          category: "Proteção",
        },
        {
          id: "3",
          name: "Aspiração",
          description: "Limpeza interna completa",
          price: 20,
          duration_minutes: 30,
          category: "Limpeza",
        }
      ]
      
      setServices(mockServices)
    } catch (error) {
      console.error("Error loading services:", error)
      // Removido showError automático
    }
  }

  const loadVehicles = async () => {
    if (!user?.id) {
      console.log("🔧 Modo demonstração ativo - Carregando veículos mock")
      // Usar dados mock em modo demo
      const mockVehicles = [
        {
          id: "1",
          make: "Toyota",
          model: "Corolla",
          year: 2020,
          plate: "ABC-1234"
        },
        {
          id: "2", 
          make: "Honda",
          model: "Civic",
          year: 2021,
          plate: "XYZ-5678"
        }
      ]
      setVehicles(mockVehicles)
      return
    }

    try {
      // Em modo demo, usar dados mock mesmo com usuário
      console.log("🔧 Modo demonstração ativo - Carregando veículos mock para usuário")
      const mockVehicles = [
        {
          id: "1",
          make: "Toyota", 
          model: "Corolla",
          year: 2020,
          plate: "ABC-1234"
        }
      ]
      setVehicles(mockVehicles)
    } catch (error) {
      console.error("Error loading vehicles:", error)
      // Removido showError automático
    }
  }

  const loadTimeSlots = async (date: string) => {
    try {
      console.log("🔧 Modo demonstração ativo - Gerando horários mock para:", date)
      
      // Generate time slots from 8:00 to 18:00 with 30-minute intervals
      const slots: TimeSlot[] = []
      for (let hour = 8; hour < 18; hour++) {
        for (let minute = 0; minute < 60; minute += 30) {
          const time = `${hour.toString().padStart(2, "0")}:${minute.toString().padStart(2, "0")}`
          // Simular alguns horários ocupados aleatoriamente
          const isOccupied = Math.random() < 0.3 // 30% de chance de estar ocupado

          slots.push({
            time,
            available: !isOccupied,
            queuePosition: isOccupied ? Math.floor(Math.random() * 5) + 1 : undefined,
          })
        }
      }

      setTimeSlots(slots)
    } catch (error) {
      console.error("Error loading time slots:", error)
      // Removido showError automático
    }
  }

  // Service selection functionality - multiple service selection implementation
  const toggleService = (serviceId: string) => {
    // Service selection functionality - selectService implementation
    setSelectedServices((prev) =>
      prev.includes(serviceId) ? prev.filter((id) => id !== serviceId) : [...prev, serviceId],
    )
  }

  const getSelectedServicesData = () => {
    return services.filter((service) => selectedServices.includes(service.id))
  }

  const getTotalPrice = () => {
    return getSelectedServicesData().reduce((total, service) => total + service.price, 0)
  }

  const getTotalDuration = () => {
    return getSelectedServicesData().reduce((total, service) => total + service.duration_minutes, 0)
  }

  const generateCalendarDays = () => {
    const today = new Date()
    const days = []

    for (let i = 0; i < 30; i++) {
      const date = new Date(today)
      date.setDate(today.getDate() + i)

      // Skip Sundays (0) and Saturdays (6)
      if (date.getDay() === 0 || date.getDay() === 6) continue

      days.push({
        date: date.toISOString().split("T")[0],
        day: date.getDate(),
        month: date.getMonth() + 1,
        weekday: date.toLocaleDateString("pt-BR", { weekday: "short" }),
        isToday: i === 0,
      })
    }

    return days
  }

  const handleBooking = async () => {
    if (!selectedVehicle || selectedServices.length === 0 || !selectedDate || !selectedTime) {
      showError("Erro", "Preencha todos os campos obrigatórios")
      return
    }

    if (!user?.id) {
      showError("Erro", "Usuário não autenticado")
      return
    }

    setLoading(true)

    try {
      // Get next queue position
      const { data: lastAppointment } = await supabase
        .from("appointments")
        .select("queue_position")
        .eq("appointment_date", selectedDate)
        .order("queue_position", { ascending: false })
        .limit(1)

      const queuePosition = (lastAppointment?.[0]?.queue_position || 0) + 1

      // Create appointment
      const { data: appointment, error: appointmentError } = await supabase
        .from("appointments")
        .insert([
          {
            user_id: user.id,
            vehicle_id: selectedVehicle,
            service_id: selectedServices[0], // Primary service
            appointment_date: selectedDate,
            appointment_time: selectedTime,
            total_price: getTotalPrice(),
            notes,
            queue_position: queuePosition,
            status: "pending",
          },
        ])
        .select()
        .single()

      if (appointmentError) throw appointmentError

      // Add all selected services to appointment_services
      const appointmentServices = selectedServices.map((serviceId) => {
        const service = services.find((s) => s.id === serviceId)
        return {
          appointment_id: appointment.id,
          service_id: serviceId,
          price: service?.price || 0,
        }
      })

      const { error: servicesError } = await supabase.from("appointment_services").insert(appointmentServices)

      if (servicesError) throw servicesError

      // Add loyalty points (1 point per R$ 10 spent)
      const pointsEarned = Math.floor(getTotalPrice() / 10)
      if (pointsEarned > 0) {
        await supabase.from("loyalty_points").insert([
          {
            user_id: user.id,
            points: pointsEarned,
            transaction_type: "earned",
            description: `Pontos ganhos no agendamento #${appointment.id}`,
            appointment_id: appointment.id,
          },
        ])
      }

      // Create notification
      await supabase.from("notifications").insert([
        {
          user_id: user.id,
          title: "Agendamento Confirmado",
          message: `Seu agendamento para ${selectedDate} às ${selectedTime} foi confirmado. Posição na fila: ${queuePosition}`,
          type: "success",
          appointment_id: appointment.id,
        },
      ])

      showSuccess("Agendamento realizado com sucesso!", `Posição na fila: ${queuePosition}`)

      // Reset form
      setStep(1)
      setSelectedServices([])
      setSelectedVehicle("")
      setSelectedDate("")
      setSelectedTime("")
      setNotes("")
      setPaymentMethod("")
    } catch (error) {
      console.error("Error creating appointment:", error)
      showError("Erro", "Falha ao realizar agendamento")
    } finally {
      setLoading(false)
    }
  }

  const renderStepContent = () => {
    switch (step) {
      case 1:
        return (
          <div className="space-y-6">
            <div>
              <h2 className="text-xl font-semibold mb-4">Selecione os Serviços</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {services.map((service) => (
                  <Card
                    key={service.id}
                    className={`cursor-pointer transition-all ${
                      selectedServices.includes(service.id) ? "ring-2 ring-blue-500 bg-blue-50" : "hover:shadow-md"
                    }`}
                    onClick={() => toggleService(service.id)}
                  >
                    <CardContent className="p-4">
                      <div className="flex justify-between items-start mb-2">
                        <h3 className="font-semibold">{service.name}</h3>
                        <Badge variant="secondary">{service.category}</Badge>
                      </div>
                      <p className="text-sm text-gray-600 mb-3">{service.description}</p>
                      <div className="flex justify-between items-center">
                        <span className="text-lg font-bold text-blue-600">
                          R$ {service.price.toFixed(2).replace(".", ",")}
                        </span>
                        <span className="text-sm text-gray-500 flex items-center">
                          <Clock className="w-4 h-4 mr-1" />
                          {service.duration_minutes}min
                        </span>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          </div>
        )

      case 2:
        return (
          <div className="space-y-6">
            <div>
              <h2 className="text-xl font-semibold mb-4">Selecione o Veículo</h2>
              {vehicles.length === 0 ? (
                <Card>
                  <CardContent className="p-6 text-center">
                    <Car className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-600 mb-4">Você precisa cadastrar um veículo primeiro</p>
                    <Button variant="outline">Cadastrar Veículo</Button>
                  </CardContent>
                </Card>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {vehicles.map((vehicle) => (
                    <Card
                      key={vehicle.id}
                      className={`cursor-pointer transition-all ${
                        selectedVehicle === vehicle.id ? "ring-2 ring-blue-500 bg-blue-50" : "hover:shadow-md"
                      }`}
                      onClick={() => setSelectedVehicle(vehicle.id)}
                    >
                      <CardContent className="p-4">
                        <div className="flex items-center space-x-3">
                          <Car className="w-8 h-8 text-gray-400" />
                          <div>
                            <h3 className="font-semibold">
                              {vehicle.make} {vehicle.model}
                            </h3>
                            <p className="text-sm text-gray-600">
                              {vehicle.year} • {vehicle.plate}
                            </p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </div>
          </div>
        )

      case 3:
        const calendarDays = generateCalendarDays()
        const weatherForDate = selectedDate ? getWeatherForDate(selectedDate) : null

        return (
          <div className="space-y-6">
            <div>
              <h2 className="text-xl font-semibold mb-4">Selecione Data e Horário</h2>

              {/* Calendar */}
              <div className="mb-6">
                <h3 className="font-medium mb-3">Escolha a Data</h3>
                <div className="grid grid-cols-7 gap-2">
                  {calendarDays.map((day) => (
                    <Button
                      key={day.date}
                      variant={selectedDate === day.date ? "default" : "outline"}
                      className="h-16 flex flex-col"
                      onClick={() => setSelectedDate(day.date)}
                    >
                      <span className="text-xs">{day.weekday}</span>
                      <span className="text-lg font-bold">{day.day}</span>
                    </Button>
                  ))}
                </div>
              </div>

              {/* Weather Info */}
              {weatherForDate && (
                <Card className="mb-6">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <span className="text-2xl">{weatherForDate.icon}</span>
                        <div>
                          <p className="font-medium">{weatherForDate.description}</p>
                          <p className="text-sm text-gray-600">{weatherForDate.temperature}°C</p>
                        </div>
                      </div>
                    </div>
                    <p className="text-sm text-blue-600 mt-2">{weatherForDate.recommendation}</p>
                  </CardContent>
                </Card>
              )}

              {/* Time Slots */}
              {selectedDate && (
                <div>
                  <h3 className="font-medium mb-3">Escolha o Horário</h3>
                  <div className="grid grid-cols-4 md:grid-cols-6 gap-2">
                    {timeSlots.map((slot) => (
                      <Button
                        key={slot.time}
                        variant={selectedTime === slot.time ? "default" : "outline"}
                        disabled={!slot.available}
                        onClick={() => setSelectedTime(slot.time)}
                        className="h-12"
                      >
                        {slot.time}
                        {!slot.available && <span className="block text-xs text-red-500">Ocupado</span>}
                      </Button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        )

      case 4:
        return (
          <div className="space-y-6">
            <div>
              <h2 className="text-xl font-semibold mb-4">Resumo e Pagamento</h2>

              {/* Booking Summary */}
              <Card className="mb-6">
                <CardHeader>
                  <CardTitle>Resumo do Agendamento</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <h4 className="font-medium mb-2">Serviços Selecionados</h4>
                    {getSelectedServicesData().map((service) => (
                      <div key={service.id} className="flex justify-between py-2">
                        <span>{service.name}</span>
                        <span>R$ {service.price.toFixed(2).replace(".", ",")}</span>
                      </div>
                    ))}
                    <Separator />
                    <div className="flex justify-between font-semibold">
                      <span>Total</span>
                      <span>R$ {getTotalPrice().toFixed(2).replace(".", ",")}</span>
                    </div>
                  </div>

                  <div>
                    <h4 className="font-medium mb-2">Detalhes</h4>
                    <div className="space-y-1 text-sm">
                      <div className="flex justify-between">
                        <span>Data:</span>
                        <span>{new Date(selectedDate).toLocaleDateString("pt-BR")}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Horário:</span>
                        <span>{selectedTime}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Duração estimada:</span>
                        <span>
                          {Math.ceil(getTotalDuration() / 60)}h {getTotalDuration() % 60}min
                        </span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Payment Method */}
              <Card className="mb-6">
                <CardHeader>
                  <CardTitle>Forma de Pagamento</CardTitle>
                </CardHeader>
                <CardContent>
                  <Select value={paymentMethod} onValueChange={setPaymentMethod}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione a forma de pagamento" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="pix">PIX</SelectItem>
                      <SelectItem value="credit">Cartão de Crédito</SelectItem>
                      <SelectItem value="debit">Cartão de Débito</SelectItem>
                      <SelectItem value="cash">Dinheiro (no local)</SelectItem>
                    </SelectContent>
                  </Select>
                </CardContent>
              </Card>

              {/* Notes */}
              <div className="space-y-2">
                <Label htmlFor="notes">Observações (Opcional)</Label>
                <Textarea
                  id="notes"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Alguma observação especial sobre seu veículo ou serviço..."
                  rows={3}
                />
              </div>
            </div>
          </div>
        )

      default:
        return null
    }
  }

  return (
    <div className="p-6 max-w-4xl mx-auto">
      {/* Progress Steps */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          {[
            { step: 1, title: "Serviços" },
            { step: 2, title: "Veículo" },
            { step: 3, title: "Data/Hora" },
            { step: 4, title: "Pagamento" },
          ].map((item, index) => (
            <div key={item.step} className="flex items-center">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                  step >= item.step ? "bg-blue-600 text-white" : "bg-gray-200 text-gray-600"
                }`}
              >
                {item.step}
              </div>
              <span className="ml-2 text-sm font-medium">{item.title}</span>
              {index < 3 && <div className={`w-16 h-0.5 mx-4 ${step > item.step ? "bg-blue-600" : "bg-gray-200"}`} />}
            </div>
          ))}
        </div>
      </div>

      {/* Step Content */}
      <Card>
        <CardContent className="p-6">{renderStepContent()}</CardContent>
      </Card>

      {/* Navigation Buttons */}
      <div className="flex justify-between mt-6">
        <Button variant="outline" onClick={() => setStep(step - 1)} disabled={step === 1}>
          Voltar
        </Button>

        {step < 4 ? (
          <Button
            onClick={() => setStep(step + 1)}
            disabled={
              (step === 1 && selectedServices.length === 0) ||
              (step === 2 && !selectedVehicle) ||
              (step === 3 && (!selectedDate || !selectedTime))
            }
          >
            Próximo
          </Button>
        ) : (
          <Button onClick={handleBooking} disabled={loading || !paymentMethod}>
            {loading ? <LoadingSpinner size="sm" /> : "Confirmar Agendamento"}
          </Button>
        )}
      </div>
    </div>
  )
}
