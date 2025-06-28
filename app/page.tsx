"use client"

import { useState, useEffect } from "react"
import { AuthProvider } from "@/contexts/AuthContext"
import { NotificationProvider } from "@/contexts/NotificationContext"
import { WeatherProvider } from "@/contexts/WeatherContext"
import ClientAuthScreen from "@/components/auth/ClientAuthScreen"
import Dashboard from "@/components/dashboard/Dashboard"
import { useAuth } from "@/contexts/AuthContext"
import { Toaster } from "@/components/ui/toaster"
import LoadingSpinner from "@/components/ui/LoadingSpinner"
import OfflineIndicator from "@/components/ui/OfflineIndicator"

function AppContent() {
  const { user, loading } = useAuth()
  const [isOnline, setIsOnline] = useState(true)

  useEffect(() => {
    // Network status monitoring only (remove service worker registration)
    const handleOnline = () => setIsOnline(true)
    const handleOffline = () => setIsOnline(false)

    setIsOnline(navigator.onLine)

    window.addEventListener("online", handleOnline)
    window.addEventListener("offline", handleOffline)

    return () => {
      window.removeEventListener("online", handleOnline)
      window.removeEventListener("offline", handleOffline)
    }
  }, [])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
        <LoadingSpinner size="lg" />
      </div>
    )
  }

  if (!user) {
    return <ClientAuthScreen />
  }

  // Redirecionar admin para rota específica
  if (user.role === "admin") {
    window.location.href = "/admin"
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
        <LoadingSpinner size="lg" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Dashboard />
      {!isOnline && <OfflineIndicator />}
      <Toaster />
    </div>
  )
}

export default function App() {
  return (
    <AuthProvider>
      <NotificationProvider>
        <WeatherProvider>
          <AppContent />
        </WeatherProvider>
      </NotificationProvider>
    </AuthProvider>
  )
}
