"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"
import { supabase } from "@/lib/supabase"

interface User {
  id: string
  name: string
  email: string
  role: "client" | "admin"
  phone?: string
  address?: string
  avatar?: string
  createdAt: Date
}

interface AuthContextType {
  user: User | null
  loading: boolean
  login: (email: string, password: string) => Promise<void>
  register: (data: RegisterData) => Promise<void>
  logout: () => void
  updateProfile: (data: Partial<User>) => Promise<void>
}

interface RegisterData {
  name: string
  email: string
  password: string
  phone?: string
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Check for existing session
    const savedUser = localStorage.getItem("user")
    if (savedUser) {
      try {
        setUser(JSON.parse(savedUser))
      } catch (error) {
        console.error("Error parsing saved user:", error)
        localStorage.removeItem("user")
      }
    }
    setLoading(false)
  }, [])

  const login = async (email: string, password: string) => {
    setLoading(true)

    try {
      // Modo de demonstração - sempre permitir login
      console.log("🔧 Modo demonstração ativo - Simulando login para:", email)
      
      // Determinar role baseado no email
      const isAdmin = email === "admin@v7estetica.com" || email.includes("admin")
      
      const demoUser: User = {
        id: "demo-" + Date.now(),
        name: isAdmin ? "Administrador" : email.split("@")[0] || "Usuario Demo",
        email,
        role: isAdmin ? "admin" : "client",
        phone: "(11) 99999-9999",
        createdAt: new Date(),
      }

      setUser(demoUser)
      localStorage.setItem("user", JSON.stringify(demoUser))
      
      console.log("✅ Login realizado com sucesso:", demoUser.name)

    } catch (error) {
      console.error("Erro durante login:", error)
      throw new Error("Falha no login. Tente novamente.")
    } finally {
      setLoading(false)
    }
  }

  const register = async (data: RegisterData) => {
    setLoading(true)

    try {
      // Modo de demonstração - sempre permitir registro
      console.log("🔧 Modo demonstração ativo - Criando usuário:", data.name)
      
      const demoUser: User = {
        id: "demo-" + Date.now(),
        name: data.name,
        email: data.email,
        role: "client" as const,
        phone: data.phone,
        createdAt: new Date(),
      }

      setUser(demoUser)
      localStorage.setItem("user", JSON.stringify(demoUser))
      
      console.log("✅ Usuário criado com sucesso:", demoUser.name)
      
    } catch (error) {
      console.error("Erro durante registro:", error)
      throw new Error("Falha no registro. Tente novamente.")
    } finally {
      setLoading(false)
    }
  }

  const logout = () => {
    setUser(null)
    localStorage.removeItem("user")
    localStorage.removeItem("vehicles")
    localStorage.removeItem("appointments")
  }

  const updateProfile = async (data: Partial<User>) => {
    if (!user) return

    try {
      console.log("🔧 Modo demonstração ativo - Atualizando perfil:", data)
      
      const updatedUser = { ...user, ...data }
      setUser(updatedUser)
      localStorage.setItem("user", JSON.stringify(updatedUser))
      
      console.log("✅ Perfil atualizado com sucesso")
      
    } catch (error) {
      console.error("Erro ao atualizar perfil:", error)
      throw new Error("Falha ao atualizar perfil. Tente novamente.")
    }
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        login,
        register,
        logout,
        updateProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
