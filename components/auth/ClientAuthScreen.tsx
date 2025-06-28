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
import { Mail, Lock, User, Phone, Eye, EyeOff, Moon, Sun, ArrowLeft, AlertCircle } from "lucide-react"
import LoadingSpinner from "@/components/ui/LoadingSpinner"

interface ClientAuthScreenProps {
  onBackToSelection?: () => void
}

export default function ClientAuthScreen({ onBackToSelection }: ClientAuthScreenProps) {
  const [isLogin, setIsLogin] = useState(true)
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [darkMode, setDarkMode] = useState(false)
  const [loginError, setLoginError] = useState<string | null>(null)
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    phone: "",
  })

  const { login, register } = useAuth()
  const { showSuccess, showError } = useNotification()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoginError(null)

    if (!formData.email || !formData.password) {
      showError("Erro", "Por favor, preencha todos os campos obrigatórios.")
      return
    }

    if (!isLogin && !formData.name) {
      showError("Erro", "Nome é obrigatório para cadastro.")
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
      if (isLogin) {
        await login(formData.email, formData.password)
        showSuccess("Login realizado com sucesso!", `Bem-vindo(a), ${formData.name || formData.email.split("@")[0]}!`)
      } else {
        await register(formData)
        showSuccess("Conta criada com sucesso!", "Você já pode fazer login.")
      }
    } catch (error) {
      console.error("Erro de autenticação:", error)
      setLoginError(error instanceof Error ? error.message : "Erro de conexão. Verifique sua internet.")
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

  const handleGoogleLogin = () => {
    showSuccess("Login com Google", "Funcionalidade em desenvolvimento.")
  }

  return (
    <div
      className={`min-h-screen flex items-center justify-center transition-colors duration-300 ${
        darkMode
          ? "bg-gradient-to-br from-gray-900 via-black to-gray-800"
          : "bg-gradient-to-br from-gray-100 via-white to-gray-200"
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
            Portal do Cliente
          </p>
        </div>

        {/* Erro de conexão */}
        {loginError && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-start gap-2">
            <AlertCircle className="w-5 h-5 text-red-600 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-red-800">Erro de conexão</p>
              <p className="text-xs text-red-700">{loginError}</p>
              <p className="text-xs text-red-600 mt-1">
                Verifique sua conexão com a internet ou tente novamente mais tarde.
              </p>
            </div>
          </div>
        )}

        <Card
          className={`shadow-2xl border-0 transition-colors duration-300 ${
            darkMode ? "bg-gray-800 text-white" : "bg-white"
          }`}
        >
          <CardHeader className="space-y-1 pb-6">
            <CardTitle
              className={`text-2xl font-bold text-center transition-colors duration-300 ${
                darkMode ? "text-white" : "text-gray-900"
              }`}
            >
              {isLogin ? "Entrar" : "Criar Conta"}
            </CardTitle>
            <CardDescription
              className={`text-center transition-colors duration-300 ${darkMode ? "text-gray-300" : "text-gray-600"}`}
            >
              {isLogin ? "Acesse sua conta para agendar serviços" : "Cadastre-se para começar a usar nossos serviços"}
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-6">
            {/* Social Login */}
            <div className="space-y-3">
              <Button
                variant="outline"
                className={`w-full transition-colors duration-300 ${
                  darkMode
                    ? "border-gray-600 text-gray-300 hover:bg-gray-700"
                    : "border-gray-300 text-gray-700 hover:bg-gray-50"
                }`}
                type="button"
                onClick={handleGoogleLogin}
              >
                <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
                  <path
                    fill="currentColor"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="currentColor"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="currentColor"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                  />
                  <path
                    fill="currentColor"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  />
                </svg>
                Continuar com Google
              </Button>
            </div>

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <Separator className={darkMode ? "border-gray-600" : "border-gray-300"} />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span
                  className={`px-2 transition-colors duration-300 ${
                    darkMode ? "bg-gray-800 text-gray-400" : "bg-white text-gray-500"
                  }`}
                >
                  ou
                </span>
              </div>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              {!isLogin && (
                <div className="space-y-2">
                  <Label htmlFor="name" className={darkMode ? "text-gray-300" : "text-gray-700"}>
                    Nome Completo
                  </Label>
                  <div className="relative">
                    <User className={`absolute left-3 top-3 h-4 w-4 ${darkMode ? "text-gray-400" : "text-gray-400"}`} />
                    <Input
                      id="name"
                      type="text"
                      placeholder="Seu nome completo"
                      value={formData.name}
                      onChange={(e) => handleInputChange("name", e.target.value)}
                      className={`pl-10 transition-colors duration-300 ${
                        darkMode
                          ? "bg-gray-700 border-gray-600 text-white placeholder-gray-400"
                          : "bg-white border-gray-300"
                      }`}
                      required={!isLogin}
                    />
                  </div>
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="email" className={darkMode ? "text-gray-300" : "text-gray-700"}>
                  E-mail
                </Label>
                <div className="relative">
                  <Mail className={`absolute left-3 top-3 h-4 w-4 ${darkMode ? "text-gray-400" : "text-gray-400"}`} />
                  <Input
                    id="email"
                    type="email"
                    placeholder="seu@email.com"
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

              {!isLogin && (
                <div className="space-y-2">
                  <Label htmlFor="phone" className={darkMode ? "text-gray-300" : "text-gray-700"}>
                    Telefone (Opcional)
                  </Label>
                  <div className="relative">
                    <Phone
                      className={`absolute left-3 top-3 h-4 w-4 ${darkMode ? "text-gray-400" : "text-gray-400"}`}
                    />
                    <Input
                      id="phone"
                      type="tel"
                      placeholder="(11) 99999-9999"
                      value={formData.phone}
                      onChange={(e) => handleInputChange("phone", e.target.value)}
                      className={`pl-10 transition-colors duration-300 ${
                        darkMode
                          ? "bg-gray-700 border-gray-600 text-white placeholder-gray-400"
                          : "bg-white border-gray-300"
                      }`}
                    />
                  </div>
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="password" className={darkMode ? "text-gray-300" : "text-gray-700"}>
                  Senha
                </Label>
                <div className="relative">
                  <Lock className={`absolute left-3 top-3 h-4 w-4 ${darkMode ? "text-gray-400" : "text-gray-400"}`} />
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Sua senha"
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

              {isLogin && (
                <div className="text-right">
                  <Button
                    variant="link"
                    className={`px-0 text-sm transition-colors duration-300 ${
                      darkMode ? "text-blue-400 hover:text-blue-300" : "text-blue-600 hover:text-blue-500"
                    }`}
                    type="button"
                    onClick={handleForgotPassword}
                  >
                    Esqueceu sua senha?
                  </Button>
                </div>
              )}

              <Button
                type="submit"
                className="w-full bg-gradient-to-r from-gray-700 to-gray-900 hover:from-gray-800 hover:to-black text-white transition-all duration-300 transform hover:scale-105"
                disabled={loading}
              >
                {loading ? (
                  <div className="flex items-center space-x-2">
                    <LoadingSpinner size="sm" />
                    <span>Entrando...</span>
                  </div>
                ) : isLogin ? (
                  "Entrar"
                ) : (
                  "Criar Conta"
                )}
              </Button>
            </form>

            <div className="text-center">
              <span
                className={`text-sm transition-colors duration-300 ${darkMode ? "text-gray-300" : "text-gray-600"}`}
              >
                {isLogin ? "Não tem uma conta?" : "Já tem uma conta?"}
              </span>
              <Button
                variant="link"
                className={`px-1 text-sm transition-colors duration-300 ${
                  darkMode ? "text-blue-400 hover:text-blue-300" : "text-blue-600 hover:text-blue-500"
                }`}
                onClick={() => setIsLogin(!isLogin)}
              >
                {isLogin ? "Cadastre-se" : "Faça login"}
              </Button>
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
              <p>👤 Cliente: qualquer@email.com</p>
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
              <Switch checked={darkMode} onCheckedChange={setDarkMode} className="data-[state=checked]:bg-blue-600" />
              {darkMode ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4" />}
            </div>
          </div>

          <div className="text-sm space-y-1">
            <p>© 2024 V7 Estética Automotiva. Todos os direitos reservados.</p>
            <p>
              Versão 1.0.0 | <span className="text-blue-500 cursor-pointer hover:underline">Suporte</span>
            </p>
            <p className="pt-2">
              <a 
                href="/admin" 
                className="text-orange-500 hover:text-orange-600 hover:underline text-xs font-medium"
              >
                🔐 Acesso Administrativo
              </a>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
