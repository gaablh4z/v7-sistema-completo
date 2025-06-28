import { useState, useEffect } from "react"
import EnhancedAuthForm from "@/components/auth/EnhancedAuthForm"
import Dashboard from "@/components/dashboard/Dashboard"
import { useAuth } from "@/contexts/AuthContext"
import LoadingSpinner from "@/components/ui/LoadingSpinner"
import OfflineIndicator from "@/components/ui/OfflineIndicator"

function HomePage() {
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
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
        <LoadingSpinner size="lg" />
      </div>
    )
  }

  if (!user) {
    return <EnhancedAuthForm />
  }

  return (
    <>
      <Dashboard />
      {!isOnline && <OfflineIndicator />}
    </>
  )
}

export default HomePage
