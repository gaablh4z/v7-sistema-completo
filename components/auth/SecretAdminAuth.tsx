"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { useAuth } from "@/contexts/AuthContext"
import { useNotification } from "@/contexts/NotificationContext"
import { Mail, Lock, Eye, EyeOff, Shield, AlertTriangle, Clock } from "lucide-react"
import LoadingSpinner from "@/components/ui/LoadingSpinner"

export default function SecretAdminAuth() {
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [attempts, setAttempts] = useState(0)
  const [isBlocked, setIsBlocked] = useState(false)
  const [blockTimeLeft, setBlockTimeLeft] = useState(0)
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    accessCode: "",
  })

  const { login } = useAuth()
  const { showSuccess, showError } = useNotification()

  // Verificar se está bloqueado ao carregar
  useEffect(() => {
    const blockedUntil = localStorage.getItem("admin_blocked_until")
    if (blockedUntil) {
      const blockTime = Number.parseInt(blockedUntil)
      const now = Date.now()
      if (now < blockTime) {
        setIsBlocked(true)
        setBlockTimeLeft(Math.ceil((blockTime - now) / 1000))
      } else {
        localStorage.removeItem("admin_blocked_until")
        localStorage.removeItem("admin_attempts")
      }
    }

    const savedAttempts = localStorage.getItem("admin_attempts")
    if (savedAttempts) {
      setAttempts(Number.parseInt(savedAttempts))
    }
  }, [])

  // Countdown do bloqueio
  useEffect(() => {
    if (isBlocked && blockTimeLeft > 0) {
      const timer = setInterval(() => {
        setBlockTimeLeft((prev) => {
          if (prev <= 1) {
            setIsBlocked(false)
            localStorage.removeItem("admin_blocked_until")
            localStorage.removeItem("admin_attempts")
            setAttempts(0)
            return 0
          }
          return prev - 1
        })
      }, 1000)

      return () => clearInterval(timer)
    }
  }, [isBlocked, blockTimeLeft])

  // Log de tentativas de acesso
  const logAccessAttempt = (success: boolean, email: string) => {
    const attempt = {
      timestamp: new Date().toISOString(),
      success,
      email,
      ip: "127.0.0.1", // Em produção, pegar IP real
      userAgent: navigator.userAgent,
    }

    const logs = JSON.parse(localStorage.getItem("admin_access_logs") || "[]")
    logs.push(attempt)

    // Manter apenas os últimos 50 logs
    if (logs.length > 50) {
      logs.splice(0, logs.length - 50)
    }

    localStorage.setItem("admin_access_logs", JSON.stringify(logs))
  }

  const handleFailedAttempt = () => {
    const newAttempts = attempts + 1
    setAttempts(newAttempts)
    localStorage.setItem("admin_attempts", newAttempts.toString())

    if (newAttempts >= 3) {
      // Bloquear por 15 minutos
      const blockUntil = Date.now() + 15 * 60 * 1000
      localStorage.setItem("admin_blocked_until", blockUntil.toString())
      setIsBlocked(true)
      setBlockTimeLeft(15 * 60)
      showError("Acesso Bloqueado", "Muitas tentativas falharam. Tente novamente em 15 minutos.")
    } else {
      showError("Acesso Negado", `Credenciais inválidas. ${3 - newAttempts} tentativas restantes.`)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (isBlocked) {
      showError("Acesso Bloqueado", `Aguarde ${Math.ceil(blockTimeLeft / 60)} minutos.`)
      return
    }

    if (!formData.email || !formData.password || !formData.accessCode) {
      showError("Erro", "Todos os campos são obrigatórios.")
      return
    }

    // Verificar código de acesso secreto
    const validAccessCodes = ["V7-ADMIN-2024", "ESTETICA-MASTER", "ACESSO-OPERACIONAL"]
    if (!validAccessCodes.includes(formData.accessCode)) {
      logAccessAttempt(false, formData.email)
      handleFailedAttempt()
      return
    }

    // Verificar se é email administrativo
    const adminEmails = ["admin@v7estetica.com", "gerente@v7estetica.com", "operacional@v7estetica.com"]
    if (!adminEmails.includes(formData.email.toLowerCase())) {
      logAccessAttempt(false, formData.email)
      handleFailedAttempt()
      return
    }

    setLoading(true)

    try {
      await login(formData.email, formData.password)

      // Reset tentativas em caso de sucesso
      localStorage.removeItem("admin_attempts")
      localStorage.removeItem("admin_blocked_until")
      setAttempts(0)

      logAccessAttempt(true, formData.email)
      showSuccess("Acesso Autorizado", "Bem-vindo ao sistema operacional.")
    } catch (error) {
      logAccessAttempt(false, formData.email)
      handleFailedAttempt()
    } finally {
      setLoading(false)
    }
  }

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60)
    const remainingSeconds = seconds % 60
    return `${minutes}:${remainingSeconds.toString().padStart(2, "0")}`
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 via-black to-red-900 p-4">
      <div className="w-full max-w-md">
        {/* Header Discreto */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-red-900 rounded-full flex items-center justify-center mx-auto mb-4">
            <Shield className="w-8 h-8 text-red-400" />
          </div>
          <h1 className="text-2xl font-bold text-white mb-2">Sistema Operacional</h1>
          <p className="text-gray-400 text-sm">Acesso Restrito - V7 Estética</p>
        </div>

        {/* Alerta de Bloqueio */}
        {isBlocked && (
          <Alert className="mb-6 bg-red-900/50 border-red-700">
            <AlertTriangle className="h-4 w-4 text-red-400" />
            <AlertDescription className="text-red-300">
              <div className="flex items-center justify-between">
                <span>Sistema bloqueado temporariamente</span>
                <div className="flex items-center space-x-1">
                  <Clock className="w-4 h-4" />
                  <span className="font-mono">{formatTime(blockTimeLeft)}</span>
                </div>
              </div>
            </AlertDescription>
          </Alert>
        )}

        {/* Alerta de Tentativas */}
        {attempts > 0 && !isBlocked && (
          <Alert className="mb-6 bg-yellow-900/50 border-yellow-700">
            <AlertTriangle className="h-4 w-4 text-yellow-400" />
            <AlertDescription className="text-yellow-300">
              {attempts} tentativa(s) falharam. {3 - attempts} restante(s).
            </AlertDescription>
          </Alert>
        )}

        <Card className="bg-gray-800 border-gray-700 shadow-2xl">
          <CardHeader className="space-y-1 pb-6">
            <CardTitle className="text-xl font-bold text-center text-white">Autenticação Administrativa</CardTitle>
            <CardDescription className="text-center text-gray-400">
              Insira suas credenciais de acesso operacional
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-6">
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Código de Acesso Secreto */}
              <div className="space-y-2">
                <Label htmlFor="accessCode" className="text-gray-300">
                  Código de Acesso
                </Label>
                <div className="relative">
                  <Shield className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    id="accessCode"
                    type="password"
                    placeholder="Código operacional"
                    value={formData.accessCode}
                    onChange={(e) => handleInputChange("accessCode", e.target.value)}
                    className="pl-10 bg-gray-700 border-gray-600 text-white placeholder-gray-400"
                    disabled={isBlocked}
                    required
                  />
                </div>
              </div>

              {/* Email */}
              <div className="space-y-2">
                <Label htmlFor="email" className="text-gray-300">
                  E-mail Operacional
                </Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="operacional@v7estetica.com"
                    value={formData.email}
                    onChange={(e) => handleInputChange("email", e.target.value)}
                    className="pl-10 bg-gray-700 border-gray-600 text-white placeholder-gray-400"
                    disabled={isBlocked}
                    required
                  />
                </div>
              </div>

              {/* Senha */}
              <div className="space-y-2">
                <Label htmlFor="password" className="text-gray-300">
                  Senha Administrativa
                </Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Senha segura"
                    value={formData.password}
                    onChange={(e) => handleInputChange("password", e.target.value)}
                    className="pl-10 pr-10 bg-gray-700 border-gray-600 text-white placeholder-gray-400"
                    disabled={isBlocked}
                    required
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                    onClick={() => setShowPassword(!showPassword)}
                    disabled={isBlocked}
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4 text-gray-400" />
                    ) : (
                      <Eye className="h-4 w-4 text-gray-400" />
                    )}
                  </Button>
                </div>
              </div>

              <Button
                type="submit"
                className="w-full bg-gradient-to-r from-red-700 to-red-900 hover:from-red-800 hover:to-red-950 text-white"
                disabled={loading || isBlocked}
              >
                {loading ? (
                  <div className="flex items-center space-x-2">
                    <LoadingSpinner size="sm" />
                    <span>Verificando...</span>
                  </div>
                ) : (
                  <div className="flex items-center space-x-2">
                    <Shield className="w-4 h-4" />
                    <span>Autorizar Acesso</span>
                  </div>
                )}
              </Button>
            </form>

            {/* Avisos de Segurança */}
            <div className="space-y-3">
              <div className="p-3 rounded-lg bg-red-900/30 border border-red-800">
                <div className="flex items-center space-x-2 mb-2">
                  <Shield className="w-4 h-4 text-red-400" />
                  <span className="font-medium text-red-300 text-sm">Aviso de Segurança</span>
                </div>
                <p className="text-xs text-red-400">
                  • Todas as tentativas de acesso são registradas
                  <br />• IP e localização são monitorados
                  <br />• Acesso não autorizado será reportado
                </p>
              </div>

              <div className="p-3 rounded-lg bg-blue-900/30 border border-blue-800">
                <p className="text-xs text-blue-300">
                  <strong>Demo:</strong> Códigos válidos: V7-ADMIN-2024, ESTETICA-MASTER
                  <br />
                  <strong>Email:</strong> admin@v7estetica.com
                  <br />
                  <strong>Senha:</strong> qualquer senha
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Footer Discreto */}
        <div className="text-center mt-8 text-gray-500 text-xs">
          <p>Sistema V7 • Versão 2.1.0 • Acesso Operacional</p>
          <p className="mt-1">© 2024 V7 Estética Automotiva</p>
        </div>
      </div>
    </div>
  )
}
