"use client"

import { useState } from "react"
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar"
import { AppSidebar } from "@/components/dashboard/AppSidebar"
import DashboardHome from "@/components/dashboard/DashboardHome"
import VehiclesPage from "@/components/dashboard/VehiclesPage"
import BookingPage from "@/components/dashboard/BookingPage"
import HistoryPage from "@/components/dashboard/HistoryPage"
import LoyaltyPage from "@/components/dashboard/LoyaltyPage"
import ProfilePage from "@/components/dashboard/ProfilePage"
import { Menu } from "lucide-react"

export default function Dashboard() {
  const [currentPage, setCurrentPage] = useState("home")

  const renderPage = () => {
    switch (currentPage) {
      case "home":
        return <DashboardHome />
      case "vehicles":
        return <VehiclesPage />
      case "booking":
        return <BookingPage />
      case "history":
        return <HistoryPage />
      case "loyalty":
        return <LoyaltyPage />
      case "profile":
        return <ProfilePage />
      default:
        return <DashboardHome />
    }
  }

  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full">
        <AppSidebar currentPage={currentPage} onPageChange={setCurrentPage} />

        <main className="flex-1 flex flex-col">
          {/* Mobile Header */}
          <div className="lg:hidden flex items-center justify-between p-4 border-b bg-white">
            <SidebarTrigger>
              <Menu className="h-5 w-5" />
            </SidebarTrigger>
            <h1 className="font-semibold">AutoV7</h1>
            <div className="w-10" /> {/* Spacer */}
          </div>

          {/* Page Content */}
          <div className="flex-1 overflow-auto">{renderPage()}</div>
        </main>
      </div>
    </SidebarProvider>
  )
}
