import { useState, useEffect } from "react"
import AdminDashboard from "@/components/admin/AdminDashboard"
import { AdminAuth } from "@/lib/adminAuth"
import LoadingSpinner from "@/components/ui/LoadingSpinner"
import OfflineIndicator from "@/components/ui/OfflineIndicator"

function AdminDashboardPage() {
  const [isOnline, setIsOnline] = useState(true)
  const [adminInfo, setAdminInfo] = useState<any>(null)

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
    // Carregar informações do admin
    const info = AdminAuth.getAdminInfo()
    setAdminInfo(info)
  }, [])

  return (
    <>
      {!isOnline && <OfflineIndicator />}
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-indigo-50">
        <AdminDashboard />
      </div>
    </>
  )
}

export default AdminDashboardPage
