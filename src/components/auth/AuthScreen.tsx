"use client"

import { useState } from "react"
import AuthSelectionScreen from "./AuthSelectionScreen"
import ClientAuthScreen from "./ClientAuthScreen"
import AdminAuthScreen from "./AdminAuthScreen"

export default function AuthScreen() {
  const [currentScreen, setCurrentScreen] = useState<"selection" | "client" | "admin">("selection")

  const handleSelectClient = () => {
    setCurrentScreen("client")
  }

  const handleSelectAdmin = () => {
    setCurrentScreen("admin")
  }

  const handleBackToSelection = () => {
    setCurrentScreen("selection")
  }

  switch (currentScreen) {
    case "client":
      return <ClientAuthScreen onBackToSelection={handleBackToSelection} />
    case "admin":
      return <AdminAuthScreen onBackToSelection={handleBackToSelection} />
    default:
      return <AuthSelectionScreen onSelectClient={handleSelectClient} onSelectAdmin={handleSelectAdmin} />
  }
}
