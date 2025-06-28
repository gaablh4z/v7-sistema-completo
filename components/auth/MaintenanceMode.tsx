"use client"

import { useState, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Wrench, Clock, Shield } from "lucide-react"

export default function MaintenanceMode() {
  const [adminCode, setAdminCode] = useState("")
  const [showAdminAccess, setShowAdminAccess] = useState(false)

  const handleAdminAccess = () => {
    if (adminCode === "V7-EMERGENCY-ACCESS") {
      // Redirecionar para área administrativa secreta
      window.location.href = "/acesso/operacional/dashboard-interno"
    }
  }

  // Sequência secreta para mostrar acesso admin (Konami code style)
  useEffect(() => {
    let sequence = ""
    const secretSequence = "admin"

    const handleKeyPress = (e: KeyboardEvent) => {
      sequence += e.key.toLowerCase()
      if (sequence.length > secretSequence.length) {
        sequence = sequence.slice(-secretSequence.length)
      }
      if (sequence === secretSequence) {
        setShowAdminAccess(true)
      }
    }

    window.addEventListener("keydown", handleKeyPress)
    return () => window.removeEventListener("keydown", handleKeyPress)
  }, [])

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-100 to-gray-300 p-4">
      <div className="w-full max-w-md text-center">
        <div className="mb-8">
          <img src="/images/v7-logo.png" alt="V7 Estética Automotiva" className="h-20 mx-auto object-contain mb-6" />
        </div>

        <Card className="shadow-xl">
          <CardContent className="p-8">
            <div className="mb-6">
              <Wrench className="w-16 h-16 text-orange-500 mx-auto mb-4" />
              <h1 className="text-2xl font-bold text-gray-900 mb-2">Sistema em Manutenção</h1>
              <p className="text-gray-600">Estamos realizando melhorias no sistema. Voltaremos em breve!</p>
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-center space-x-2 text-gray-500">
                <Clock className="w-4 h-4" />
                <span className="text-sm">Previsão: 2-3 horas</span>
              </div>

              <div className="text-sm text-gray-500">
                <p>Para emergências, entre em contato:</p>
                <p className="font-medium">(11) 99999-9999</p>
              </div>

              {/* Acesso Admin Oculto */}
              {showAdminAccess && (
                <div className="mt-6 p-4 bg-red-50 border border-red-200 rounded-lg">
                  <div className="flex items-center space-x-2 mb-2">
                    <Shield className="w-4 h-4 text-red-600" />
                    <span className="text-sm font-medium text-red-800">Acesso de Emergência</span>
                  </div>
                  <div className="flex space-x-2">
                    <Input
                      type="password"
                      placeholder="Código de emergência"
                      value={adminCode}
                      onChange={(e) => setAdminCode(e.target.value)}
                      className="text-sm"
                    />
                    <Button size="sm" onClick={handleAdminAccess} className="bg-red-600 hover:bg-red-700">
                      Acessar
                    </Button>
                  </div>
                  <p className="text-xs text-red-600 mt-1">Demo: V7-EMERGENCY-ACCESS</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        <div className="mt-8 text-gray-500 text-sm">
          <p>© 2024 V7 Estética Automotiva</p>
        </div>
      </div>
    </div>
  )
}
