"use client"

import { Car, Home, Calendar, History, Gift, User, LogOut } from "lucide-react"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"
import { Button } from "@/components/ui/button"
import { useAuth } from "@/contexts/AuthContext"

interface AppSidebarProps {
  currentPage: string
  onPageChange: (page: string) => void
}

const menuItems = [
  {
    id: "home",
    title: "Início",
    icon: Home,
  },
  {
    id: "vehicles",
    title: "Meus Veículos",
    icon: Car,
  },
  {
    id: "booking",
    title: "Agendar Serviço", // Agendamento/Booking link implementation
    icon: Calendar,
  },
  {
    id: "history",
    title: "Histórico",
    icon: History,
  },
  {
    id: "loyalty",
    title: "Programa de Fidelidade",
    icon: Gift,
  },
  {
    id: "profile",
    title: "Perfil",
    icon: User,
  },
]

export function AppSidebar({ currentPage, onPageChange }: AppSidebarProps) {
  const { user, logout } = useAuth()

  return (
    <Sidebar>
      <SidebarHeader className="border-b p-6">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
            <Car className="w-6 h-6 text-white" />
          </div>
          <div>
            <h2 className="font-bold text-lg">AutoV7</h2>
            <p className="text-sm text-gray-600">Estética Automotiva</p>
          </div>
        </div>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              {menuItems.map((item) => (
                <SidebarMenuItem key={item.id}>
                  <SidebarMenuButton
                    onClick={() => onPageChange(item.id)}
                    isActive={currentPage === item.id}
                    className="w-full justify-start"
                  >
                    <item.icon className="w-4 h-4" />
                    <span>{item.title}</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="border-t p-4">
        <div className="space-y-3">
          <div className="text-sm">
            <p className="font-medium">{user?.name}</p>
            <p className="text-gray-600">{user?.email}</p>
          </div>
          <Button variant="outline" size="sm" onClick={logout} className="w-full justify-start">
            <LogOut className="w-4 h-4 mr-2" />
            Sair
          </Button>
        </div>
      </SidebarFooter>
    </Sidebar>
  )
}
