"use client"

import { useState, useEffect } from "react"
import { AuthProvider } from "@/contexts/AuthContext"
import { NotificationProvider } from "@/contexts/NotificationContext"
import { WeatherProvider } from "@/contexts/WeatherContext"
import AdminAuthScreen from "@/components/auth/AdminAuthScreen"
import AdminDashboard from "@/components/admin/AdminDashboard"
import { useAuth } from "@/contexts/AuthContext"
import { Toaster } from "@/components/ui/toaster"
import LoadingSpinner from "@/components/ui/LoadingSpinner"
import OfflineIndicator from "@/components/ui/OfflineIndicator"

function AdminContent() {
  const { user, loading } = useAuth()
  const [isOnline, setIsOnline] = useState(true)

  useEffect(() => {
    // Network status monitoring
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
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-red-50 to-orange-100">
        <LoadingSpinner size="lg" />
      </div>
    )
  }

  if (!user) {
    return <AdminAuthScreen />
  }

  // Redirecionar cliente para rota principal
  if (user.role === "client") {
    window.location.href = "/"
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-red-50 to-orange-100">
        <LoadingSpinner size="lg" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <AdminDashboard />
      {!isOnline && <OfflineIndicator />}
      <Toaster />
    </div>
  )
}

export default function AdminPage() {
  return (
    <AuthProvider>
      <NotificationProvider>
        <WeatherProvider>
          <AdminContent />
        </WeatherProvider>
      </NotificationProvider>
    </AuthProvider>
  )
}
