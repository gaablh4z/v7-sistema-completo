"use client"

import { useState } from "react"
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar"
import { AdminSidebar } from "@/components/admin/AdminSidebar"
import AdminHome from "@/components/admin/AdminHome"
import AppointmentsManagement from "@/components/admin/AppointmentsManagement"
import CustomersManagement from "@/components/admin/CustomersManagement"
import ServicesManagement from "@/components/admin/ServicesManagement"
import ReportsPage from "@/components/admin/ReportsPage"
import InventoryManagement from "@/components/admin/InventoryManagement"
import SettingsPage from "@/components/admin/SettingsPage"
import ChatSupport from "@/components/admin/ChatSupport"
import { Menu } from "lucide-react"

export default function AdminDashboard() {
  const [currentPage, setCurrentPage] = useState("home")

  const renderPage = () => {
    switch (currentPage) {
      case "home":
        return <AdminHome />
      case "appointments":
        return <AppointmentsManagement />
      case "customers":
        return <CustomersManagement />
      case "services":
        return <ServicesManagement />
      case "reports":
        return <ReportsPage />
      case "inventory":
        return <InventoryManagement />
      case "chat":
        return <ChatSupport />
      case "settings":
        return <SettingsPage />
      default:
        return <AdminHome />
    }
  }

  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full">
        <AdminSidebar currentPage={currentPage} onPageChange={setCurrentPage} />

        <main className="flex-1 flex flex-col">
          {/* Mobile Header */}
          <div className="lg:hidden flex items-center justify-between p-4 border-b bg-white">
            <SidebarTrigger>
              <Menu className="h-5 w-5" />
            </SidebarTrigger>
            <h1 className="font-semibold">AutoV7 Admin</h1>
            <div className="w-10" /> {/* Spacer */}
          </div>

          {/* Page Content */}
          <div className="flex-1 overflow-auto">{renderPage()}</div>
        </main>
      </div>
    </SidebarProvider>
  )
}
