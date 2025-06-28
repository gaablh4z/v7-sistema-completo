import { useAuth } from "../contexts/AuthContext"
import SecretAdminAuth from "../components/auth/SecretAdminAuth"
import AdminDashboard from "../components/admin/AdminDashboard"
import LoadingSpinner from "../components/ui/LoadingSpinner"

export default function DashboardInternoPage() {
  const { user, loading } = useAuth()

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-900">
        <LoadingSpinner size="lg" />
      </div>
    )
  }

  if (!user || user.role !== "admin") {
    return <SecretAdminAuth />
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <AdminDashboard />
    </div>
  )
}
