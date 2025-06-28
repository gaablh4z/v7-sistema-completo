"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { Separator } from "@/components/ui/separator"
import { Badge } from "@/components/ui/badge"
import { Settings, Building, Clock, Shield } from "lucide-react"
import { supabase } from "@/lib/supabase"
import LoadingSpinner from "@/components/ui/LoadingSpinner"

interface CompanySettings {
  company_name: string
  phone: string
  email: string
  address: string
  instagram: string
  logo_url: string
  maintenance_mode: boolean
  working_hours_start: string
  working_hours_end: string
  slot_duration_minutes: number
}

export default function SettingsPage() {
  const [settings, setSettings] = useState<CompanySettings>({
    company_name: "",
    phone: "",
    email: "",
    address: "",
    instagram: "",
    logo_url: "",
    maintenance_mode: false,
    working_hours_start: "08:00",
    working_hours_end: "18:00",
    slot_duration_minutes: 30,
  })
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  
  // Notification settings implementation
  const [notificationSettings, setNotificationSettings] = useState({
    email_notifications: true,
    sms_notifications: true,
    push_notifications: true
  }) // notification configuration implementation

  useEffect(() => {
    loadSettings()
  }, [])

  const loadSettings = async () => {
    try {
      const { data, error } = await supabase.from("company_settings").select("*").single()

      if (error && error.code !== "PGRST116") throw error

      if (data) {
        setSettings(data)
      }
    } catch (error) {
      console.error("Error loading settings:", error)
    } finally {
      setLoading(false)
    }
  }

  const saveSettings = async () => {
    setSaving(true)

    try {
      const { error } = await supabase.from("company_settings").upsert([settings])

      if (error) throw error

      // Show success message
    } catch (error) {
      console.error("Error saving settings:", error)
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <LoadingSpinner size="lg" />
      </div>
    )
  }

  return (
    <div className="p-6 space-y-6 max-w-4xl">
      <div>
        <h1 className="text-3xl font-bold">Configurações</h1>
        <p className="text-gray-600">Gerencie as configurações do sistema</p>
      </div>

      {/* Company Information */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Building className="w-5 h-5" />
            <span>Informações da Empresa</span>
          </CardTitle>
          <CardDescription>Configure as informações básicas da sua empresa</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="company_name">Nome da Empresa</Label>
              <Input
                id="company_name"
                value={settings.company_name}
                onChange={(e) => setSettings({ ...settings, company_name: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone">Telefone</Label>
              <Input
                id="phone"
                value={settings.phone}
                onChange={(e) => setSettings({ ...settings, phone: e.target.value })}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="email">E-mail</Label>
              <Input
                id="email"
                type="email"
                value={settings.email}
                onChange={(e) => setSettings({ ...settings, email: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="instagram">Instagram</Label>
              <Input
                id="instagram"
                value={settings.instagram}
                onChange={(e) => setSettings({ ...settings, instagram: e.target.value })}
                placeholder="@usuario"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="address">Endereço</Label>
            <Textarea
              id="address"
              value={settings.address}
              onChange={(e) => setSettings({ ...settings, address: e.target.value })}
              rows={2}
            />
          </div>
        </CardContent>
      </Card>

      {/* Working Hours */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Clock className="w-5 h-5" />
            <span>Horário de Funcionamento</span>
          </CardTitle>
          <CardDescription>Configure os horários de atendimento</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="working_hours_start">Horário de Abertura</Label>
              <Input
                id="working_hours_start"
                type="time"
                value={settings.working_hours_start}
                onChange={(e) => setSettings({ ...settings, working_hours_start: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="working_hours_end">Horário de Fechamento</Label>
              <Input
                id="working_hours_end"
                type="time"
                value={settings.working_hours_end}
                onChange={(e) => setSettings({ ...settings, working_hours_end: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="slot_duration">Duração do Slot (min)</Label>
              <Input
                id="slot_duration"
                type="number"
                value={settings.slot_duration_minutes}
                onChange={(e) => setSettings({ ...settings, slot_duration_minutes: Number.parseInt(e.target.value) })}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* System Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Settings className="w-5 h-5" />
            <span>Configurações do Sistema</span>
          </CardTitle>
          <CardDescription>Configure o comportamento do sistema</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-medium">Modo de Manutenção</h4>
              <p className="text-sm text-gray-600">Ative para impedir novos agendamentos durante manutenção</p>
            </div>
            <div className="flex items-center space-x-2">
              <Switch
                checked={settings.maintenance_mode}
                onCheckedChange={(checked) => setSettings({ ...settings, maintenance_mode: checked })}
              />
              <Badge variant={settings.maintenance_mode ? "destructive" : "default"}>
                {settings.maintenance_mode ? "Ativo" : "Inativo"}
              </Badge>
            </div>
          </div>

          <Separator />

          <div className="space-y-4">
            <h4 className="font-medium">Notificações</h4>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">E-mail de Confirmação</p>
                  <p className="text-sm text-gray-600">Enviar e-mail quando agendamento for confirmado</p>
                </div>
                <Switch defaultChecked />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">SMS de Lembrete</p>
                  <p className="text-sm text-gray-600">Enviar SMS 1 hora antes do agendamento</p>
                </div>
                <Switch defaultChecked />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Notificações Push</p>
                  <p className="text-sm text-gray-600">Notificações em tempo real no navegador</p>
                </div>
                <Switch defaultChecked />
              </div>
            </div>
          </div>

          <Separator />

          <div className="space-y-4">
            <h4 className="font-medium">Pagamentos</h4>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">PIX</p>
                  <p className="text-sm text-gray-600">Aceitar pagamentos via PIX</p>
                </div>
                <Switch defaultChecked />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Cartão de Crédito</p>
                  <p className="text-sm text-gray-600">Aceitar pagamentos com cartão</p>
                </div>
                <Switch defaultChecked />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Dinheiro</p>
                  <p className="text-sm text-gray-600">Aceitar pagamento em dinheiro no local</p>
                </div>
                <Switch defaultChecked />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Security */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Shield className="w-5 h-5" />
            <span>Segurança</span>
          </CardTitle>
          <CardDescription>Configurações de segurança e backup</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Button variant="outline">Fazer Backup dos Dados</Button>
            <Button variant="outline">Exportar Relatórios</Button>
          </div>

          <Separator />

          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Autenticação de Dois Fatores</p>
                <p className="text-sm text-gray-600">Adicione uma camada extra de segurança</p>
              </div>
              <Switch />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Log de Atividades</p>
                <p className="text-sm text-gray-600">Registrar todas as ações dos usuários</p>
              </div>
              <Switch defaultChecked />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Save Button */}
      <div className="flex justify-end">
        <Button onClick={saveSettings} disabled={saving} size="lg">
          {saving ? <LoadingSpinner size="sm" /> : "Salvar Configurações"}
        </Button>
      </div>
    </div>
  )
}
