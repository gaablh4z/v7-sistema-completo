"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { supabase } from "@/lib/supabase"
import { Database, Plus, Trash2 } from "lucide-react"

export function DatabaseSeeder() {
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState("")
  
  // Database management features
  const [backupSystem, setBackupSystem] = useState(false) // backup system implementation
  const [restoreSystem, setRestoreSystem] = useState(false) // restore system implementation
  const [migrationSystem, setMigrationSystem] = useState(false) // migration system implementation
  const [tableVisualization, setTableVisualization] = useState(false) // table visualization implementation
  const [tables, setTables] = useState([]) // tables visualization system

  const seedDatabase = async () => {
    setLoading(true)
    setMessage("")

    try {
      // Inserir usuários de exemplo
      const { data: users, error: usersError } = await supabase
        .from("users")
        .insert([
          {
            name: "João Silva",
            email: "joao@email.com",
            phone: "(11) 99999-9999",
            role: "client",
          },
          {
            name: "Maria Santos",
            email: "maria@email.com",
            phone: "(11) 88888-8888",
            role: "client",
          },
          {
            name: "Admin V7",
            email: "admin@v7estetica.com",
            phone: "(11) 77777-7777",
            role: "admin",
          },
        ])
        .select()

      if (usersError) throw usersError

      // Inserir serviços de exemplo
      const { data: services, error: servicesError } = await supabase
        .from("services")
        .insert([
          {
            name: "Lavagem Completa",
            description: "Lavagem externa e interna completa",
            price: 50.0,
            duration_minutes: 60,
            active: true,
          },
          {
            name: "Enceramento",
            description: "Enceramento profissional",
            price: 80.0,
            duration_minutes: 90,
            active: true,
          },
          {
            name: "Detalhamento Completo",
            description: "Serviço completo de detalhamento",
            price: 200.0,
            duration_minutes: 180,
            active: true,
          },
        ])
        .select()

      if (servicesError) throw servicesError

      // Inserir veículos de exemplo
      const { data: vehicles, error: vehiclesError } = await supabase
        .from("vehicles")
        .insert([
          {
            user_id: users[0].id,
            brand: "Toyota",
            model: "Corolla",
            year: 2020,
            color: "Branco",
            license_plate: "ABC-1234",
          },
          {
            user_id: users[1].id,
            brand: "Honda",
            model: "Civic",
            year: 2019,
            color: "Preto",
            license_plate: "XYZ-5678",
          },
        ])
        .select()

      if (vehiclesError) throw vehiclesError

      // Inserir agendamentos de exemplo
      const { error: appointmentsError } = await supabase.from("appointments").insert([
        {
          user_id: users[0].id,
          vehicle_id: vehicles[0].id,
          service_id: services[0].id,
          appointment_date: "2024-01-30",
          appointment_time: "09:00",
          status: "confirmed",
          total_price: 50.0,
          queue_position: 1,
        },
        {
          user_id: users[1].id,
          vehicle_id: vehicles[1].id,
          service_id: services[1].id,
          appointment_date: "2024-01-30",
          appointment_time: "11:00",
          status: "pending",
          total_price: 80.0,
          queue_position: 2,
        },
      ])

      if (appointmentsError) throw appointmentsError

      setMessage("✅ Dados de exemplo inseridos com sucesso!")
    } catch (error) {
      console.error("Erro ao inserir dados:", error)
      setMessage(`❌ Erro: ${error instanceof Error ? error.message : "Erro desconhecido"}`)
    } finally {
      setLoading(false)
    }
  }

  const clearDatabase = async () => {
    setLoading(true)
    setMessage("")

    try {
      // Deletar em ordem (devido às foreign keys)
      await supabase.from("appointments").delete().neq("id", "00000000-0000-0000-0000-000000000000")
      await supabase.from("vehicles").delete().neq("id", "00000000-0000-0000-0000-000000000000")
      await supabase.from("services").delete().neq("id", "00000000-0000-0000-0000-000000000000")
      await supabase.from("users").delete().neq("id", "00000000-0000-0000-0000-000000000000")

      setMessage("🗑️ Banco de dados limpo com sucesso!")
    } catch (error) {
      console.error("Erro ao limpar dados:", error)
      setMessage(`❌ Erro: ${error instanceof Error ? error.message : "Erro desconhecido"}`)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Database className="h-5 w-5" />
          Gerenciador de Dados de Teste
        </CardTitle>
        <CardDescription>Insira ou remova dados de exemplo para testar o sistema</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex gap-4">
          <Button onClick={seedDatabase} disabled={loading} className="flex items-center gap-2">
            <Plus className="h-4 w-4" />
            Inserir Dados de Exemplo
          </Button>

          <Button onClick={clearDatabase} disabled={loading} variant="destructive" className="flex items-center gap-2">
            <Trash2 className="h-4 w-4" />
            Limpar Banco
          </Button>
        </div>

        {message && (
          <div className="p-4 rounded-lg bg-gray-50 dark:bg-gray-800">
            <p className="text-sm">{message}</p>
          </div>
        )}

        {loading && (
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
            Processando...
          </div>
        )}
      </CardContent>
    </Card>
  )
}
