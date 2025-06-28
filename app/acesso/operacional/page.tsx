"use client"

import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Shield, ArrowRight, Lock } from "lucide-react"

export default function AcessoOperacionalPage() {
  const router = useRouter()

  const handleDashboardInterno = () => {
    router.push("/acesso/operacional/dashboard-interno")
  }

  const handleVoltar = () => {
    router.push("/")
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <Card className="border-gray-700 bg-gray-900/50 backdrop-blur">
          <CardHeader className="text-center">
            <div className="mb-4 flex justify-center">
              <div className="p-3 rounded-full bg-orange-500/20 border border-orange-500/30">
                <Shield className="h-8 w-8 text-orange-400" />
              </div>
            </div>
            <CardTitle className="text-2xl font-bold text-white">
              Acesso Operacional
            </CardTitle>
            <CardDescription className="text-gray-300">
              Área restrita para operações administrativas
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button 
              onClick={handleDashboardInterno}
              className="w-full bg-orange-600 hover:bg-orange-700 text-white"
              size="lg"
            >
              <Lock className="h-4 w-4 mr-2" />
              Dashboard Interno
              <ArrowRight className="h-4 w-4 ml-2" />
            </Button>
            
            <Button 
              onClick={handleVoltar}
              variant="outline"
              className="w-full border-gray-600 text-gray-300 hover:bg-gray-800"
            >
              Voltar ao Sistema
            </Button>

            <div className="text-center text-xs text-gray-500 mt-6">
              <p>⚠️ Acesso monitorado e registrado</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
