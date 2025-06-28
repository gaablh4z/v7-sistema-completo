"use client"

import { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import { User, Shield, Moon, Sun } from "lucide-react"

interface AuthSelectionScreenProps {
  onSelectClient: () => void
  onSelectAdmin: () => void
}

export default function AuthSelectionScreen({ onSelectClient, onSelectAdmin }: AuthSelectionScreenProps) {
  const [darkMode, setDarkMode] = useState(false)

  return (
    <div
      className={`min-h-screen flex items-center justify-center transition-colors duration-300 ${
        darkMode
          ? "bg-gradient-to-br from-gray-900 via-black to-gray-800"
          : "bg-gradient-to-br from-gray-100 via-white to-gray-200"
      } p-4`}
    >
      <div className="w-full max-w-2xl">
        {/* Logo and Header */}
        <div className="text-center mb-12">
          <div className="mb-6">
            <img src="/images/v7-logo.png" alt="V7 Estética Automotiva" className="h-24 mx-auto object-contain" />
          </div>
          <h1
            className={`text-4xl font-bold mb-4 transition-colors duration-300 ${
              darkMode ? "text-white" : "text-gray-900"
            }`}
          >
            V7 Estética Automotiva
          </h1>
          <p className={`text-lg transition-colors duration-300 ${darkMode ? "text-gray-300" : "text-gray-600"}`}>
            Escolha como deseja acessar o sistema
          </p>
        </div>

        {/* Selection Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
          {/* Client Access */}
          <Card
            className={`cursor-pointer transition-all duration-300 hover:scale-105 hover:shadow-2xl ${
              darkMode ? "bg-gray-800 border-gray-700 hover:border-blue-500" : "bg-white hover:border-blue-500"
            }`}
            onClick={onSelectClient}
          >
            <CardContent className="p-8 text-center">
              <div
                className={`w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6 transition-colors duration-300 ${
                  darkMode ? "bg-blue-900" : "bg-blue-100"
                }`}
              >
                <User className={`w-10 h-10 ${darkMode ? "text-blue-400" : "text-blue-600"}`} />
              </div>
              <h2
                className={`text-2xl font-bold mb-4 transition-colors duration-300 ${
                  darkMode ? "text-white" : "text-gray-900"
                }`}
              >
                Portal do Cliente
              </h2>
              <p
                className={`text-lg mb-6 transition-colors duration-300 ${
                  darkMode ? "text-gray-300" : "text-gray-600"
                }`}
              >
                Agende serviços, gerencie seus veículos e acompanhe seu histórico
              </p>
              <Button
                className="w-full bg-gradient-to-r from-blue-600 to-blue-800 hover:from-blue-700 hover:to-blue-900 text-white"
                size="lg"
              >
                Acessar como Cliente
              </Button>
            </CardContent>
          </Card>

          {/* Admin Access */}
          <Card
            className={`cursor-pointer transition-all duration-300 hover:scale-105 hover:shadow-2xl ${
              darkMode ? "bg-gray-800 border-gray-700 hover:border-red-500" : "bg-white hover:border-red-500"
            }`}
            onClick={onSelectAdmin}
          >
            <CardContent className="p-8 text-center">
              <div
                className={`w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6 transition-colors duration-300 ${
                  darkMode ? "bg-red-900" : "bg-red-100"
                }`}
              >
                <Shield className={`w-10 h-10 ${darkMode ? "text-red-400" : "text-red-600"}`} />
              </div>
              <h2
                className={`text-2xl font-bold mb-4 transition-colors duration-300 ${
                  darkMode ? "text-white" : "text-gray-900"
                }`}
              >
                Painel Administrativo
              </h2>
              <p
                className={`text-lg mb-6 transition-colors duration-300 ${
                  darkMode ? "text-gray-300" : "text-gray-600"
                }`}
              >
                Gerencie agendamentos, clientes, serviços e relatórios
              </p>
              <Button
                className="w-full bg-gradient-to-r from-red-600 to-red-800 hover:from-red-700 hover:to-red-900 text-white"
                size="lg"
              >
                Acessar como Admin
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Footer */}
        <div
          className={`text-center space-y-4 transition-colors duration-300 ${
            darkMode ? "text-gray-400" : "text-gray-500"
          }`}
        >
          <div className="flex items-center justify-center space-x-4">
            <div className="flex items-center space-x-2">
              <span className="text-sm">Modo escuro</span>
              <Switch checked={darkMode} onCheckedChange={setDarkMode} className="data-[state=checked]:bg-gray-600" />
              {darkMode ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4" />}
            </div>
          </div>

          <div className="text-sm space-y-1">
            <p>© 2024 V7 Estética Automotiva. Todos os direitos reservados.</p>
            <p>
              Versão 1.0.0 | <span className="text-blue-500 cursor-pointer hover:underline">Suporte</span>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
