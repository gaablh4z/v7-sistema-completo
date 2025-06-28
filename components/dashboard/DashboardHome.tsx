"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Calendar, Car, Star, Gift } from "lucide-react"
import { useWeather } from "@/contexts/WeatherContext"

export default function DashboardHome() {
  const { weather } = useWeather()
  const [stats, setStats] = useState({
    totalServices: 12,
    loyaltyPoints: 350,
    nextAppointment: null as any,
    recentServices: [] as any[],
  })

  useEffect(() => {
    // Load user stats
    const mockStats = {
      totalServices: 12,
      loyaltyPoints: 350,
      nextAppointment: {
        id: 1,
        service: "Lavagem Completa",
        date: "2024-01-20",
        time: "14:00",
        status: "confirmed",
      },
      recentServices: [
        {
          id: 1,
          service: "Polimento",
          date: "2024-01-10",
          rating: 5,
          price: 199.9,
        },
        {
          id: 2,
          service: "Lavagem Simples",
          date: "2024-01-05",
          rating: 4,
          price: 49.9,
        },
      ],
    }
    setStats(mockStats)
  }, [])

  return (
    <div className="p-6 space-y-6">
      {/* Welcome Section */}
      <div className="space-y-2">
        <h1 className="text-3xl font-bold">Bem-vindo de volta!</h1>
        <p className="text-gray-600">Aqui está um resumo da sua conta</p>
      </div>

      {/* Weather Card */}
      {weather && (
        <Card className="bg-gradient-to-r from-blue-500 to-blue-600 text-white">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold">Clima Hoje</h3>
                <p className="text-blue-100">
                  {weather.description} • {weather.temperature}°C
                </p>
                <p className="text-sm text-blue-100 mt-2">{weather.recommendation}</p>
              </div>
              <div className="text-4xl">{weather.icon}</div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-4">
              <div className="p-3 bg-blue-100 rounded-full">
                <Car className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Serviços Realizados</p>
                <p className="text-2xl font-bold">{stats.totalServices}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-4">
              <div className="p-3 bg-green-100 rounded-full">
                <Gift className="w-6 h-6 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Pontos de Fidelidade</p>
                <p className="text-2xl font-bold">{stats.loyaltyPoints}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-4">
              <div className="p-3 bg-yellow-100 rounded-full">
                <Star className="w-6 h-6 text-yellow-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Avaliação Média</p>
                <p className="text-2xl font-bold">4.8</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Next Appointment */}
      {stats.nextAppointment && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Calendar className="w-5 h-5" />
              <span>Próximo Agendamento</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-semibold">{stats.nextAppointment.service}</h3>
                <p className="text-gray-600">
                  {new Date(stats.nextAppointment.date).toLocaleDateString("pt-BR")} às {stats.nextAppointment.time}
                </p>
              </div>
              <div className="flex items-center space-x-2">
                <Badge variant="secondary">
                  {stats.nextAppointment.status === "confirmed" ? "Confirmado" : "Pendente"}
                </Badge>
                <Button variant="outline" size="sm">
                  Reagendar
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Recent Services */}
      <Card>
        <CardHeader>
          <CardTitle>Serviços Recentes</CardTitle>
          <CardDescription>Seus últimos serviços realizados</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {stats.recentServices.map((service) => (
              <div key={service.id} className="flex items-center justify-between p-4 border rounded-lg">
                <div>
                  <h4 className="font-medium">{service.service}</h4>
                  <p className="text-sm text-gray-600">{new Date(service.date).toLocaleDateString("pt-BR")}</p>
                </div>
                <div className="flex items-center space-x-4">
                  <div className="flex items-center space-x-1">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className={`w-4 h-4 ${i < service.rating ? "text-yellow-400 fill-current" : "text-gray-300"}`}
                      />
                    ))}
                  </div>
                  <p className="font-medium">R$ {service.price.toFixed(2).replace(".", ",")}</p>
                </div>
              </div>
            ))}
          </div>
          <div className="mt-4">
            <Button variant="outline" className="w-full">
              Ver Histórico Completo
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Button size="lg" className="h-16">
          <Calendar className="w-5 h-5 mr-2" />
          Agendar Novo Serviço
        </Button>
        <Button variant="outline" size="lg" className="h-16">
          <Car className="w-5 h-5 mr-2" />
          Gerenciar Veículos
        </Button>
      </div>
    </div>
  )
}
