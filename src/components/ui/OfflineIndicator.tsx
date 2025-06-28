"use client"

import { WifiOff } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"

export default function OfflineIndicator() {
  return (
    <div className="fixed bottom-4 left-4 right-4 z-50 md:left-auto md:right-4 md:w-96">
      <Alert className="bg-yellow-50 border-yellow-200">
        <WifiOff className="h-4 w-4 text-yellow-600" />
        <AlertDescription className="text-yellow-800">
          Você está offline. Algumas funcionalidades podem não estar disponíveis.
        </AlertDescription>
      </Alert>
    </div>
  )
}
