import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import AdminLoginScreen from "@/components/auth/AdminLoginScreen"
import AdminDashboard from "@/components/admin/AdminDashboard"
import { AdminAuth } from "@/lib/adminAuth"
import LoadingSpinner from "@/components/ui/LoadingSpinner"
import OfflineIndicator from "@/components/ui/OfflineIndicator"

function AdminPage() {
  const [isAdminLoggedIn, setIsAdminLoggedIn] = useState(false)
  const [loading, setLoading] = useState(true)
  const [isOnline, setIsOnline] = useState(true)
  const navigate = useNavigate()

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

  useEffect(() => {
    // Verificar se admin está logado
    const checkAdminAuth = () => {
      setLoading(true)
      const isLoggedIn = AdminAuth.isAdminLoggedIn()
      setIsAdminLoggedIn(isLoggedIn)
      setLoading(false)
    }

    checkAdminAuth()

    // Verificar periodicamente se a sessão ainda é válida
    const interval = setInterval(checkAdminAuth, 30000) // Check every 30 seconds

    return () => clearInterval(interval)
  }, [])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100">
        <LoadingSpinner size="lg" />
      </div>
    )
  }

  const handleAdminLoginSuccess = () => {
    setIsAdminLoggedIn(true)
  }

  if (!isAdminLoggedIn) {
    return <AdminLoginScreen onLoginSuccess={handleAdminLoginSuccess} />
  }

  return (
    <>
      <AdminDashboard />
      {!isOnline && <OfflineIndicator />}
    </>
  )
}

export default AdminPage
