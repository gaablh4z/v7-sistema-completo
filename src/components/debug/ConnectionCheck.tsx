"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { supabase } from "@/lib/supabase"
import { CheckCircle, XCircle, RefreshCw } from "lucide-react"

export function ConnectionCheck() {
  const [status, setStatus] = useState<"checking" | "connected" | "error">("checking")
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [supabaseUrl, setSupabaseUrl] = useState<string | null>(null)

  const checkConnection = async () => {
    setStatus("checking")
    setErrorMessage(null)

    try {
      // Verificar se as variáveis de ambiente estão definidas
      const url = process.env.NEXT_PUBLIC_SUPABASE_URL
      setSupabaseUrl(url || "Não definido")

      // Tentar fazer uma consulta simples
      const { data, error } = await supabase.from("users").select("count").limit(1)

      if (error) {
        throw error
      }

      setStatus("connected")
    } catch (error) {
      console.error("Erro de conexão:", error)
      setStatus("error")
      setErrorMessage(error instanceof Error ? error.message : "Erro desconhecido")
    }
  }

  useEffect(() => {
    checkConnection()
  }, [])

  return (
    <Card className={status === "error" ? "border-red-300" : status === "connected" ? "border-green-300" : ""}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          {status === "checking" ? (
            <RefreshCw className="h-5 w-5 animate-spin" />
          ) : status === "connected" ? (
            <CheckCircle className="h-5 w-5 text-green-500" />
          ) : (
            <XCircle className="h-5 w-5 text-red-500" />
          )}
          Status da Conexão com Supabase
        </CardTitle>
        <CardDescription>Verificando a conexão com o banco de dados Supabase</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">Status:</span>
            <span
              className={`text-sm ${
                status === "connected" ? "text-green-600" : status === "error" ? "text-red-600" : "text-yellow-600"
              }`}
            >
              {status === "connected" ? "Conectado" : status === "error" ? "Erro de Conexão" : "Verificando..."}
            </span>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">URL do Supabase:</span>
            <span className="text-sm font-mono">{supabaseUrl || "Carregando..."}</span>
          </div>

          {errorMessage && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-md mt-2">
              <p className="text-sm text-red-700">{errorMessage}</p>
            </div>
          )}
        </div>

        <Button onClick={checkConnection} size="sm" className="w-full">
          <RefreshCw className={`h-4 w-4 mr-2 ${status === "checking" ? "animate-spin" : ""}`} />
          Verificar Novamente
        </Button>

        <div className="text-xs text-gray-500">
          <p>Se estiver tendo problemas de conexão:</p>
          <ol className="list-decimal list-inside space-y-1 mt-1">
            <li>Verifique se o arquivo .env.local está configurado corretamente</li>
            <li>Confirme se as credenciais do Supabase estão corretas</li>
            <li>Verifique se o servidor Supabase está online</li>
          </ol>
        </div>
      </CardContent>
    </Card>
  )
}
