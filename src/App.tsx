import { Routes, Route } from 'react-router-dom'
import HomePage from './pages/HomePage'
import AdminPage from './pages/AdminPage'
import AdminDashboardPage from './pages/AdminDashboardPage'
import AdminProtectedRoute from './components/auth/AdminProtectedRoute'
import MaintenancePage from './pages/MaintenancePage'
import DatabaseTestPage from './pages/DatabaseTestPage'
import DebugPage from './pages/DebugPage'
import OperationalAccessPage from './pages/OperationalAccessPage'
import DashboardInternoPage from './pages/DashboardInternoPage'
import TestFuncionalidadesPage from './pages/TestFuncionalidadesPage'
import DemoFuncionalidadesPage from './pages/DemoFuncionalidadesPage'

function App() {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/admin" element={<AdminPage />} />
      <Route 
        path="/admin/dashboard" 
        element={
          <AdminProtectedRoute>
            <AdminDashboardPage />
          </AdminProtectedRoute>
        } 
      />
      <Route path="/manutencao" element={<MaintenancePage />} />
      <Route path="/database-test" element={<DatabaseTestPage />} />
      <Route path="/debug" element={<DebugPage />} />
      <Route path="/acesso/operacional" element={<OperationalAccessPage />} />
      <Route path="/acesso/operacional/dashboard-interno" element={<DashboardInternoPage />} />
      <Route path="/test-funcionalidades" element={<TestFuncionalidadesPage />} />
      <Route path="/demo-funcionalidades" element={<DemoFuncionalidadesPage />} />
    </Routes>
  )
}

export default App
