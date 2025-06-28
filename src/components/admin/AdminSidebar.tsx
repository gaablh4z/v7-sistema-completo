"use client"

import { Home, Calendar, Users, Settings, BarChart3, Package, MessageSquare, Car, LogOut, Wrench } from "lucide-react"
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
import { Badge } from "@/components/ui/badge"
import { useAuth } from "@/contexts/AuthContext"

interface AdminSidebarProps {
  currentPage: string
  onPageChange: (page: string) => void
}

const menuItems = [
  {
    id: "home",
    title: "Dashboard",
    icon: Home,
  },
  {
    id: "appointments",
    title: "Agendamentos",
    icon: Calendar,
    badge: "5", // New appointments
  },
  {
    id: "customers",
    title: "Clientes",
    icon: Users,
  },
  {
    id: "services",
    title: "Serviços",
    icon: Wrench,
  },
  {
    id: "inventory",
    title: "Estoque",
    icon: Package,
    badge: "3", // Low stock items
  },
  {
    id: "chat",
    title: "Chat Suporte",
    icon: MessageSquare,
    badge: "2", // Unread messages
  },
  {
    id: "reports",
    title: "Relatórios",
    icon: BarChart3,
  },
  {
    id: "settings",
    title: "Configurações",
    icon: Settings,
  },
]

export function AdminSidebar({ currentPage, onPageChange }: AdminSidebarProps) {
  const { user, logout } = useAuth()

  return (
    <Sidebar>
      <SidebarHeader className="border-b p-6">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-red-600 rounded-lg flex items-center justify-center">
            <Car className="w-6 h-6 text-white" />
          </div>
          <div>
            <h2 className="font-bold text-lg">AutoV7 Admin</h2>
            <p className="text-sm text-gray-600">Painel Administrativo</p>
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
                    <span className="flex-1">{item.title}</span>
                    {item.badge && (
                      <Badge variant="destructive" className="ml-auto">
                        {item.badge}
                      </Badge>
                    )}
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
            <p className="text-gray-600">Administrador</p>
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
