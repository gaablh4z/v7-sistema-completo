"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Shield, Clock, MapPin, Monitor, AlertTriangle } from "lucide-react"

interface AccessLog {
  timestamp: string
  success: boolean
  email: string
  ip: string
  userAgent: string
}

export default function AccessLogger() {
  const [logs, setLogs] = useState<AccessLog[]>([])
  const [suspiciousActivity, setSuspiciousActivity] = useState(false)

  useEffect(() => {
    loadLogs()
    checkSuspiciousActivity()
  }, [])

  const loadLogs = () => {
    const savedLogs = JSON.parse(localStorage.getItem("admin_access_logs") || "[]")
    setLogs(savedLogs.slice(-20)) // Últimos 20 logs
  }

  const checkSuspiciousActivity = () => {
    const logs = JSON.parse(localStorage.getItem("admin_access_logs") || "[]")
    const recentLogs = logs.filter((log: AccessLog) => {
      const logTime = new Date(log.timestamp).getTime()
      const oneHourAgo = Date.now() - 60 * 60 * 1000
      return logTime > oneHourAgo
    })

    const failedAttempts = recentLogs.filter((log: AccessLog) => !log.success)
    setSuspiciousActivity(failedAttempts.length >= 3)
  }

  const clearLogs = () => {
    localStorage.removeItem("admin_access_logs")
    setLogs([])
    setSuspiciousActivity(false)
  }

  const exportLogs = () => {
    const dataStr = JSON.stringify(logs, null, 2)
    const dataBlob = new Blob([dataStr], { type: "application/json" })
    const url = URL.createObjectURL(dataBlob)
    const link = document.createElement("a")
    link.href = url
    link.download = `v7-access-logs-${new Date().toISOString().split("T")[0]}.json`
    link.click()
  }

  const getDeviceInfo = (userAgent: string) => {
    if (userAgent.includes("Mobile")) return "📱 Mobile"
    if (userAgent.includes("Chrome")) return "💻 Chrome"
    if (userAgent.includes("Firefox")) return "🦊 Firefox"
    if (userAgent.includes("Safari")) return "🧭 Safari"
    return "🖥️ Desktop"
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold flex items-center space-x-2">
            <Shield className="w-6 h-6" />
            <span>Monitor de Segurança</span>
          </h1>
          <p className="text-gray-600">Logs de acesso administrativo</p>
        </div>
        <div className="flex space-x-2">
          <Button variant="outline" onClick={exportLogs}>
            Exportar Logs
          </Button>
          <Button variant="destructive" onClick={clearLogs}>
            Limpar Logs
          </Button>
        </div>
      </div>

      {/* Alerta de Atividade Suspeita */}
      {suspiciousActivity && (
        <Card className="border-red-200 bg-red-50">
          <CardContent className="p-4">
            <div className="flex items-center space-x-3">
              <AlertTriangle className="w-5 h-5 text-red-600" />
              <div>
                <p className="font-medium text-red-800">Atividade Suspeita Detectada</p>
                <p className="text-sm text-red-600">Múltiplas tentativas de acesso falharam na última hora</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Estatísticas */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="text-center">
              <p className="text-2xl font-bold text-green-600">{logs.filter((log) => log.success).length}</p>
              <p className="text-sm text-gray-600">Acessos Válidos</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-center">
              <p className="text-2xl font-bold text-red-600">{logs.filter((log) => !log.success).length}</p>
              <p className="text-sm text-gray-600">Tentativas Falharam</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-center">
              <p className="text-2xl font-bold text-blue-600">{new Set(logs.map((log) => log.ip)).size}</p>
              <p className="text-sm text-gray-600">IPs Únicos</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-center">
              <p className="text-2xl font-bold text-purple-600">{logs.length}</p>
              <p className="text-sm text-gray-600">Total de Logs</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Lista de Logs */}
      <Card>
        <CardHeader>
          <CardTitle>Histórico de Acessos</CardTitle>
        </CardHeader>
        <CardContent>
          {logs.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <Shield className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>Nenhum log de acesso registrado</p>
            </div>
          ) : (
            <div className="space-y-3">
              {logs.reverse().map((log, index) => (
                <div
                  key={index}
                  className={`p-4 rounded-lg border ${
                    log.success ? "bg-green-50 border-green-200" : "bg-red-50 border-red-200"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <Badge variant={log.success ? "default" : "destructive"}>
                        {log.success ? "✓ Sucesso" : "✗ Falhou"}
                      </Badge>
                      <span className="font-medium">{log.email}</span>
                    </div>
                    <div className="flex items-center space-x-4 text-sm text-gray-600">
                      <div className="flex items-center space-x-1">
                        <Clock className="w-4 h-4" />
                        <span>{new Date(log.timestamp).toLocaleString("pt-BR")}</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <MapPin className="w-4 h-4" />
                        <span>{log.ip}</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <Monitor className="w-4 h-4" />
                        <span>{getDeviceInfo(log.userAgent)}</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
