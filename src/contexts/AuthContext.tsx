"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"
import { UserStorage, UserData } from "@/lib/authUtils"

interface User {
  id: string
  name: string
  email: string
  role: "client" | "admin"
  phone?: string
  address?: string
  avatar?: string
  createdAt: Date
  emailVerified?: boolean
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

  // Converter UserData para User (sempre como cliente)
  const convertToUser = (userData: UserData): User => ({
    id: userData.id,
    name: userData.name,
    email: userData.email,
    role: 'client' as const, // Sempre cliente neste contexto
    phone: userData.phone,
    avatar: userData.profile?.avatar,
    createdAt: new Date(userData.createdAt),
    emailVerified: userData.emailVerified
  });

  useEffect(() => {
    // Verificar sessão existente
    console.log('AuthContext useEffect iniciado')
    try {
      if (UserStorage.isSessionValid()) {
        const currentUser = UserStorage.getCurrentUser();
        if (currentUser) {
          setUser(convertToUser(currentUser));
        }
      } else {
        UserStorage.clearCurrentUser();
      }
    } catch (error) {
      console.error('Erro no AuthContext useEffect:', error)
    }
    setLoading(false);
    console.log('AuthContext useEffect finalizado')
  }, [])

  const login = async (email: string, password: string) => {
    setLoading(true)

    try {
      // Verificar se o usuário existe no armazenamento local
      const userData = UserStorage.findUserByEmail(email);
      
      if (userData) {
        // Usuário encontrado no storage local
        const updatedUser = UserStorage.updateUser(userData.id, {
          lastLogin: new Date().toISOString()
        });
        
        if (updatedUser) {
          UserStorage.setCurrentUser(updatedUser);
          setUser(convertToUser(updatedUser));
          console.log("✅ Login realizado com sucesso:", updatedUser.name);
          return;
        }
      }
      
      // Fallback: Modo de demonstração - sempre permitir login como cliente
      console.log("🔧 Modo demonstração ativo - Simulando login de cliente para:", email)
      
      const demoUser: User = {
        id: "demo-" + Date.now(),
        name: email.split("@")[0] || "Usuario Demo",
        email,
        role: "client" as const, // Sempre cliente
        phone: "(11) 99999-9999",
        createdAt: new Date(),
        emailVerified: true
      }

      setUser(demoUser)
      
      // Salvar no storage também para consistência
      const userDataToStore: UserData = {
        id: demoUser.id,
        name: demoUser.name,
        email: demoUser.email,
        phone: demoUser.phone,
        createdAt: demoUser.createdAt.toISOString(),
        lastLogin: new Date().toISOString(),
        emailVerified: true
      };
      
      UserStorage.setCurrentUser(userDataToStore);
      
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
    UserStorage.clearCurrentUser()
    
    // Limpar dados relacionados
    localStorage.removeItem("vehicles")
    localStorage.removeItem("appointments")
    
    console.log("✅ Logout realizado com sucesso")
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
