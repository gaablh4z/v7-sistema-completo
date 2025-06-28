"use client"

import { createContext, useContext, type ReactNode } from "react"
import { toast } from "@/hooks/use-toast"

interface NotificationContextType {
  showSuccess: (title: string, message?: string) => void
  showError: (title: string, message?: string) => void
  showInfo: (title: string, message?: string) => void
  showWarning: (title: string, message?: string) => void
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined)

export function NotificationProvider({ children }: { children: ReactNode }) {
  const showSuccess = (title: string, message?: string) => {
    toast({
      title,
      description: message,
      variant: "default",
    })
  }

  const showError = (title: string, message?: string) => {
    toast({
      title,
      description: message,
      variant: "destructive",
    })
  }

  const showInfo = (title: string, message?: string) => {
    toast({
      title,
      description: message,
      variant: "default",
    })
  }

  const showWarning = (title: string, message?: string) => {
    toast({
      title,
      description: message,
      variant: "destructive",
    })
  }

  return (
    <NotificationContext.Provider
      value={{
        showSuccess,
        showError,
        showInfo,
        showWarning,
      }}
    >
      {children}
    </NotificationContext.Provider>
  )
}

export function useNotification() {
  const context = useContext(NotificationContext)
  if (context === undefined) {
    throw new Error("useNotification must be used within a NotificationProvider")
  }
  return context
}
