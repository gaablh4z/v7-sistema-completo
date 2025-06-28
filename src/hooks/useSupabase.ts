"use client"

import { useState } from "react"
import { supabase } from "@/lib/supabase"

export function useSupabase() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Função para buscar usuários
  const getUsers = async () => {
    setLoading(true)
    setError(null)
    try {
      const { data, error } = await supabase.from("users").select("*").order("created_at", { ascending: false })

      if (error) throw error
      return data
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro desconhecido")
      return []
    } finally {
      setLoading(false)
    }
  }

  // Função para buscar agendamentos
  const getAppointments = async () => {
    setLoading(true)
    setError(null)
    try {
      const { data, error } = await supabase
        .from("appointments")
        .select(`
          *,
          users(name, email),
          vehicles(brand, model, year),
          services(name, price, duration_minutes)
        `)
        .order("appointment_date", { ascending: true })

      if (error) throw error
      return data
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro desconhecido")
      return []
    } finally {
      setLoading(false)
    }
  }

  // Função para buscar serviços
  const getServices = async () => {
    setLoading(true)
    setError(null)
    try {
      const { data, error } = await supabase.from("services").select("*").eq("active", true).order("name")

      if (error) throw error
      return data
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro desconhecido")
      return []
    } finally {
      setLoading(false)
    }
  }

  // Função para criar novo agendamento
  const createAppointment = async (appointmentData: any) => {
    setLoading(true)
    setError(null)
    try {
      const { data, error } = await supabase.from("appointments").insert([appointmentData]).select()

      if (error) throw error
      return data[0]
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao criar agendamento")
      return null
    } finally {
      setLoading(false)
    }
  }

  return {
    loading,
    error,
    getUsers,
    getAppointments,
    getServices,
    createAppointment,
  }
}
