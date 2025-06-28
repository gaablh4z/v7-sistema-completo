"use client"

import type React from "react"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { Switch } from "@/components/ui/switch"
import { useAuth } from "@/contexts/AuthContext"
import { useNotification } from "@/contexts/NotificationContext"
import { Mail, Lock, Eye, EyeOff, Shield, Moon, Sun, ArrowLeft } from "lucide-react"
import LoadingSpinner from "@/components/ui/LoadingSpinner"

interface AdminAuthScreenProps {
  onBackToSelection?: () => void
}

export default function AdminAuthScreen({ onBackToSelection }: AdminAuthScreenProps) {
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [darkMode, setDarkMode] = useState(false)
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  })

  const { login } = useAuth()
  const { showSuccess, showError } = useNotification()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.email || !formData.password) {
      showError("Erro", "Por favor, preencha todos os campos obrigatórios.")
      return
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(formData.email)) {
      showError("Erro", "Por favor, insira um e-mail válido.")
      return
    }

    if (formData.password.length < 6) {
      showError("Erro", "A senha deve ter pelo menos 6 caracteres.")
      return
    }

    setLoading(true)

    try {
      await login(formData.email, formData.password)
      showSuccess("Login realizado com sucesso!", "Bem-vindo(a) ao painel administrativo!")
    } catch (error) {
      showError("Erro de Autenticação", "E-mail ou senha inválidos. Tente novamente.")
    } finally {
      setLoading(false)
    }
  }

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const handleForgotPassword = () => {
    showSuccess("E-mail enviado!", "Verifique sua caixa de entrada para redefinir sua senha.")
  }

  return (
    <div
      className={`min-h-screen flex items-center justify-center transition-colors duration-300 ${
        darkMode
          ? "bg-gradient-to-br from-gray-900 via-black to-gray-800"
          : "bg-gradient-to-br from-red-50 via-orange-50 to-yellow-50"
      } p-4`}
    >
      <div className="w-full max-w-md">
        {/* Back Button - Only show if onBackToSelection is provided */}
        {onBackToSelection && (
          <Button
            variant="ghost"
            onClick={onBackToSelection}
            className={`mb-4 transition-colors duration-300 ${
              darkMode ? "text-gray-300 hover:text-white" : "text-gray-600 hover:text-gray-900"
            }`}
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Voltar
          </Button>
        )}

        {/* Logo and Header */}
        <div className="text-center mb-8">
          <div className="mb-4">
            <img src="/images/v7-logo.png" alt="V7 Estética Automotiva" className="h-20 mx-auto object-contain" />
          </div>
          <h1
            className={`text-3xl font-bold mb-2 transition-colors duration-300 ${
              darkMode ? "text-white" : "text-gray-900"
            }`}
          >
            V7 Estética Automotiva
          </h1>
          <p className={`transition-colors duration-300 ${darkMode ? "text-gray-300" : "text-gray-600"}`}>
            Painel Administrativo
          </p>
          <div className="flex items-center justify-center mt-4 space-x-2">
            <Shield className={`w-4 h-4 ${darkMode ? "text-red-400" : "text-red-500"}`} />
            <span className={`text-sm ${darkMode ? "text-red-400" : "text-red-500"}`}>Acesso Restrito</span>
          </div>
        </div>

        <Card
          className={`shadow-2xl border-0 transition-colors duration-300 ${
            darkMode ? "bg-gray-800 text-white border-red-800" : "bg-white border-red-200"
          }`}
        >
          <CardHeader className="space-y-1 pb-6">
            <CardTitle
              className={`text-2xl font-bold text-center transition-colors duration-300 ${
                darkMode ? "text-white" : "text-gray-900"
              }`}
            >
              Acesso Administrativo
            </CardTitle>
            <CardDescription
              className={`text-center transition-colors duration-300 ${darkMode ? "text-gray-300" : "text-gray-600"}`}
            >
              Entre com suas credenciais de administrador
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-6">
            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email" className={darkMode ? "text-gray-300" : "text-gray-700"}>
                  E-mail Administrativo
                </Label>
                <div className="relative">
                  <Mail className={`absolute left-3 top-3 h-4 w-4 ${darkMode ? "text-gray-400" : "text-gray-400"}`} />
                  <Input
                    id="email"
                    type="email"
                    placeholder="admin@v7estetica.com"
                    value={formData.email}
                    onChange={(e) => handleInputChange("email", e.target.value)}
                    className={`pl-10 transition-colors duration-300 ${
                      darkMode
                        ? "bg-gray-700 border-gray-600 text-white placeholder-gray-400"
                        : "bg-white border-gray-300"
                    }`}
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="password" className={darkMode ? "text-gray-300" : "text-gray-700"}>
                  Senha
                </Label>
                <div className="relative">
                  <Lock className={`absolute left-3 top-3 h-4 w-4 ${darkMode ? "text-gray-400" : "text-gray-400"}`} />
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Sua senha administrativa"
                    value={formData.password}
                    onChange={(e) => handleInputChange("password", e.target.value)}
                    className={`pl-10 pr-10 transition-colors duration-300 ${
                      darkMode
                        ? "bg-gray-700 border-gray-600 text-white placeholder-gray-400"
                        : "bg-white border-gray-300"
                    }`}
                    required
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? (
                      <EyeOff className={`h-4 w-4 ${darkMode ? "text-gray-400" : "text-gray-400"}`} />
                    ) : (
                      <Eye className={`h-4 w-4 ${darkMode ? "text-gray-400" : "text-gray-400"}`} />
                    )}
                  </Button>
                </div>
              </div>

              <div className="text-right">
                <Button
                  variant="link"
                  className={`px-0 text-sm transition-colors duration-300 ${
                    darkMode ? "text-red-400 hover:text-red-300" : "text-red-600 hover:text-red-500"
                  }`}
                  type="button"
                  onClick={handleForgotPassword}
                >
                  Esqueceu sua senha?
                </Button>
              </div>

              <Button
                type="submit"
                className="w-full bg-gradient-to-r from-red-600 to-red-800 hover:from-red-700 hover:to-red-900 text-white transition-all duration-300 transform hover:scale-105"
                disabled={loading}
              >
                {loading ? (
                  <div className="flex items-center space-x-2">
                    <LoadingSpinner size="sm" />
                    <span>Verificando...</span>
                  </div>
                ) : (
                  <div className="flex items-center space-x-2">
                    <Shield className="w-4 h-4" />
                    <span>Entrar no Sistema</span>
                  </div>
                )}
              </Button>
            </form>

            <Separator className={darkMode ? "border-gray-600" : "border-gray-300"} />

            {/* Security Notice */}
            <div
              className={`p-4 rounded-lg text-sm transition-colors duration-300 ${
                darkMode
                  ? "bg-red-900/30 text-red-300 border border-red-800"
                  : "bg-red-50 text-red-800 border border-red-200"
              }`}
            >
              <div className="flex items-center space-x-2 mb-2">
                <Shield className="w-4 h-4" />
                <span className="font-medium">Aviso de Segurança</span>
              </div>
              <p className="text-xs">
                Este é um acesso restrito para administradores. Todas as ações são registradas e monitoradas.
              </p>
            </div>

            {/* Demo Credentials */}
            <div
              className={`p-3 rounded-lg text-xs transition-colors duration-300 ${
                darkMode
                  ? "bg-blue-900/30 text-blue-300 border border-blue-800"
                  : "bg-blue-50 text-blue-800 border border-blue-200"
              }`}
            >
              <p className="font-medium mb-1">🔑 Credenciais de demonstração:</p>
              <p>🛡️ Admin: admin@v7estetica.com</p>
              <p>🔒 Senha: qualquer senha</p>
            </div>
          </CardContent>
        </Card>

        {/* Footer */}
        <div
          className={`text-center mt-8 space-y-4 transition-colors duration-300 ${
            darkMode ? "text-gray-400" : "text-gray-500"
          }`}
        >
          <div className="flex items-center justify-center space-x-4">
            <div className="flex items-center space-x-2">
              <span className="text-sm">Modo escuro</span>
              <Switch checked={darkMode} onCheckedChange={setDarkMode} className="data-[state=checked]:bg-red-600" />
              {darkMode ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4" />}
            </div>
          </div>

          <div className="text-sm space-y-1">
            <p>© 2024 V7 Estética Automotiva. Todos os direitos reservados.</p>
            <p>
              Versão 1.0.0 | <span className="text-red-500 cursor-pointer hover:underline">Suporte Técnico</span>
            </p>
            <p className="pt-2">
              <a 
                href="/" 
                className="text-blue-500 hover:text-blue-600 hover:underline text-xs font-medium"
              >
                👤 Área do Cliente
              </a>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
