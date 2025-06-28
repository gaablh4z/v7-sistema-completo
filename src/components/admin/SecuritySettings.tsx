"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Shield, AlertTriangle, Lock, Eye } from "lucide-react"
import AccessLogger from "@/components/auth/AccessLogger"

export default function SecuritySettings() {
  const [maintenanceMode, setMaintenanceMode] = useState(false)
  const [showAccessLogs, setShowAccessLogs] = useState(false)
  const [showPermissions, setShowPermissions] = useState(false)
  const [showAuditLog, setShowAuditLog] = useState(false)
  const [securitySettings, setSecuritySettings] = useState({
    maxLoginAttempts: 3,
    lockoutDuration: 15,
    sessionTimeout: 60,
    requireStrongPassword: true,
    enableAccessLogging: true,
    alertOnFailedAttempts: true,
    enablePermissions: true,
    auditLogRetention: 30,
  })

  // Sistema de permissões
  const [userPermissions, setUserPermissions] = useState([
    {
      id: "1",
      email: "admin@v7estetica.com",
      role: "super_admin",
      permissions: ["read", "write", "delete", "manage_users", "system_config"],
      status: "active"
    },
    {
      id: "2", 
      email: "operador@v7estetica.com",
      role: "operator",
      permissions: ["read", "write"],
      status: "active"
    }
  ])

  // Log de auditoria simulado
  const [auditLogs] = useState([
    {
      id: "1",
      timestamp: new Date().toISOString(),
      user: "admin@v7estetica.com",
      action: "user_login",
      details: "Login realizado com sucesso",
      ip: "192.168.1.100"
    },
    {
      id: "2",
      timestamp: new Date(Date.now() - 3600000).toISOString(),
      user: "operador@v7estetica.com", 
      action: "customer_create",
      details: "Novo cliente criado: João Silva",
      ip: "192.168.1.101"
    },
    {
      id: "3",
      timestamp: new Date(Date.now() - 7200000).toISOString(),
      user: "admin@v7estetica.com",
      action: "service_update",
      details: "Serviço atualizado: Lavagem Completa",
      ip: "192.168.1.100"
    }
  ])

  const toggleMaintenanceMode = () => {
    setMaintenanceMode(!maintenanceMode)
    if (!maintenanceMode) {
      // Ativar modo manutenção
      localStorage.setItem("maintenance_mode", "true")
    } else {
      // Desativar modo manutenção
      localStorage.removeItem("maintenance_mode")
    }
  }

  const generateNewAccessCode = () => {
    const codes = [
      "V7-ADMIN-" + Math.random().toString(36).substr(2, 6).toUpperCase(),
      "ESTETICA-" + Math.random().toString(36).substr(2, 8).toUpperCase(),
      "OPERACIONAL-" + Math.random().toString(36).substr(2, 6).toUpperCase(),
    ]
    return codes[Math.floor(Math.random() * codes.length)]
  }

  const [newAccessCode] = useState(generateNewAccessCode())

  const updatePermission = (userId: string, permission: string, granted: boolean) => {
    setUserPermissions(prev => prev.map(user => {
      if (user.id === userId) {
        const updatedPermissions = granted 
          ? [...user.permissions, permission]
          : user.permissions.filter(p => p !== permission)
        return { ...user, permissions: updatedPermissions }
      }
      return user
    }))
  }

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold flex items-center space-x-2">
          <Shield className="w-8 h-8" />
          <span>Configurações de Segurança</span>
        </h1>
        <p className="text-gray-600">Gerencie a segurança e acesso do sistema</p>
      </div>

      {/* Modo Manutenção */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <AlertTriangle className="w-5 h-5" />
            <span>Modo Manutenção</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-medium">Ativar Modo Manutenção</h4>
              <p className="text-sm text-gray-600">Bloqueia o acesso de clientes e exibe página de manutenção</p>
            </div>
            <Switch checked={maintenanceMode} onCheckedChange={toggleMaintenanceMode} />
          </div>

          {maintenanceMode && (
            <Alert className="bg-orange-50 border-orange-200">
              <AlertTriangle className="h-4 w-4 text-orange-600" />
              <AlertDescription className="text-orange-800">
                <strong>Sistema em Manutenção:</strong> Apenas administradores podem acessar.
                <br />
                Código de emergência: <code className="bg-orange-200 px-1 rounded">V7-EMERGENCY-ACCESS</code>
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>

      {/* Configurações de Acesso */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Lock className="w-5 h-5" />
            <span>Controle de Acesso</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="maxAttempts">Máximo de Tentativas de Login</Label>
              <Input
                id="maxAttempts"
                type="number"
                value={securitySettings.maxLoginAttempts}
                onChange={(e) =>
                  setSecuritySettings({
                    ...securitySettings,
                    maxLoginAttempts: Number.parseInt(e.target.value),
                  })
                }
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="lockoutDuration">Duração do Bloqueio (minutos)</Label>
              <Input
                id="lockoutDuration"
                type="number"
                value={securitySettings.lockoutDuration}
                onChange={(e) =>
                  setSecuritySettings({
                    ...securitySettings,
                    lockoutDuration: Number.parseInt(e.target.value),
                  })
                }
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="sessionTimeout">Timeout da Sessão (minutos)</Label>
              <Input
                id="sessionTimeout"
                type="number"
                value={securitySettings.sessionTimeout}
                onChange={(e) =>
                  setSecuritySettings({
                    ...securitySettings,
                    sessionTimeout: Number.parseInt(e.target.value),
                  })
                }
              />
            </div>

            <div className="space-y-2">
              <Label>Novo Código de Acesso</Label>
              <div className="flex space-x-2">
                <Input value={newAccessCode} readOnly className="bg-gray-50" />
                <Button variant="outline" onClick={() => window.location.reload()}>
                  Gerar Novo
                </Button>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-medium">Exigir Senha Forte</h4>
                <p className="text-sm text-gray-600">Mínimo 8 caracteres, números e símbolos</p>
              </div>
              <Switch
                checked={securitySettings.requireStrongPassword}
                onCheckedChange={(checked) =>
                  setSecuritySettings({ ...securitySettings, requireStrongPassword: checked })
                }
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-medium">Log de Acessos</h4>
                <p className="text-sm text-gray-600">Registrar todas as tentativas de login</p>
              </div>
              <Switch
                checked={securitySettings.enableAccessLogging}
                onCheckedChange={(checked) =>
                  setSecuritySettings({ ...securitySettings, enableAccessLogging: checked })
                }
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-medium">Alertas de Segurança</h4>
                <p className="text-sm text-gray-600">Notificar sobre tentativas suspeitas</p>
              </div>
              <Switch
                checked={securitySettings.alertOnFailedAttempts}
                onCheckedChange={(checked) =>
                  setSecuritySettings({ ...securitySettings, alertOnFailedAttempts: checked })
                }
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Monitor de Segurança */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Eye className="w-5 h-5" />
              <span>Monitor de Segurança</span>
            </div>
            <Button variant="outline" onClick={() => setShowAccessLogs(!showAccessLogs)}>
              {showAccessLogs ? "Ocultar" : "Ver"} Logs
            </Button>
          </CardTitle>
        </CardHeader>
        {showAccessLogs && (
          <CardContent>
            <AccessLogger />
          </CardContent>
        )}
      </Card>

      {/* URLs Secretas */}
      <Card>
        <CardHeader>
          <CardTitle>URLs de Acesso</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>URL Administrativa (Secreta)</Label>
            <div className="flex space-x-2">
              <Input value="/acesso/operacional/dashboard-interno" readOnly className="bg-gray-50 font-mono text-sm" />
              <Button
                variant="outline"
                onClick={() =>
                  navigator.clipboard.writeText(window.location.origin + "/acesso/operacional/dashboard-interno")
                }
              >
                Copiar
              </Button>
            </div>
          </div>

          <div className="space-y-2">
            <Label>URL de Manutenção</Label>
            <div className="flex space-x-2">
              <Input value="/manutencao" readOnly className="bg-gray-50 font-mono text-sm" />
              <Button
                variant="outline"
                onClick={() => navigator.clipboard.writeText(window.location.origin + "/manutencao")}
              >
                Copiar
              </Button>
            </div>
          </div>

          <Alert className="bg-blue-50 border-blue-200">
            <Shield className="h-4 w-4 text-blue-600" />
            <AlertDescription className="text-blue-800">
              <strong>Importante:</strong> Nunca compartilhe essas URLs publicamente. Elas devem ser acessadas apenas
              por administradores autorizados.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>

      {/* Sistema de Permissões */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Shield className="w-5 h-5" />
              <span>Sistema de Permissões</span>
            </div>
            <Button
              variant="outline"
              onClick={() => setShowPermissions(!showPermissions)}
            >
              {showPermissions ? "Ocultar" : "Exibir"}
            </Button>
          </CardTitle>
        </CardHeader>
        {showPermissions && (
          <CardContent>
            <div className="space-y-4">
              {userPermissions.map((user) => (
                <Card key={user.id} className="p-4">
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <h4 className="font-semibold">{user.email}</h4>
                      <Badge variant={user.role === 'super_admin' ? 'default' : 'secondary'}>
                        {user.role}
                      </Badge>
                    </div>
                    <Badge variant={user.status === 'active' ? 'default' : 'destructive'}>
                      {user.status}
                    </Badge>
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    {['read', 'write', 'delete', 'manage_users', 'system_config'].map((permission) => (
                      <div key={permission} className="flex items-center space-x-2">
                        <Switch
                          checked={user.permissions.includes(permission)}
                          onCheckedChange={(checked) => updatePermission(user.id, permission, checked)}
                        />
                        <Label className="text-sm">{permission.replace('_', ' ')}</Label>
                      </div>
                    ))}
                  </div>
                </Card>
              ))}
            </div>
          </CardContent>
        )}
      </Card>

      {/* Log de Auditoria */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Eye className="w-5 h-5" />
              <span>Log de Auditoria</span>
            </div>
            <Button
              variant="outline"
              onClick={() => setShowAuditLog(!showAuditLog)}
            >
              {showAuditLog ? "Ocultar" : "Exibir"}
            </Button>
          </CardTitle>
        </CardHeader>
        {showAuditLog && (
          <CardContent>
            <div className="space-y-3">
              {auditLogs.map((log) => (
                <div key={log.id} className="flex justify-between items-center p-3 border rounded">
                  <div>
                    <div className="font-medium">{log.action.replace('_', ' ')}</div>
                    <div className="text-sm text-gray-600">{log.details}</div>
                    <div className="text-xs text-gray-500">
                      {new Date(log.timestamp).toLocaleString("pt-BR")} - IP: {log.ip}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-medium">{log.user}</div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        )}
      </Card>

      {/* Configurações de Auditoria */}
      <Card>
        <CardHeader>
          <CardTitle>Configurações de Auditoria</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <Label>Log de Auditoria</Label>
              <p className="text-sm text-gray-600">Registrar todas as ações dos usuários</p>
            </div>
            <Switch
              checked={securitySettings.enableAccessLogging}
              onCheckedChange={(checked) =>
                setSecuritySettings({
                  ...securitySettings,
                  enableAccessLogging: checked,
                })
              }
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="auditRetention">Retenção do Log (dias)</Label>
            <Input
              id="auditRetention"
              type="number"
              value={securitySettings.auditLogRetention}
              onChange={(e) =>
                setSecuritySettings({
                  ...securitySettings,
                  auditLogRetention: parseInt(e.target.value),
                })
              }
            />
          </div>
        </CardContent>
      </Card>

      {/* Políticas de Senha */}
      <Card>
        <CardHeader>
          <CardTitle>Políticas de Senha</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <Label>Exigir Senha Forte</Label>
              <p className="text-sm text-gray-600">Mínimo 8 caracteres, maiúscula, minúscula e número</p>
            </div>
            <Switch
              checked={securitySettings.requireStrongPassword}
              onCheckedChange={(checked) =>
                setSecuritySettings({
                  ...securitySettings,
                  requireStrongPassword: checked,
                })
              }
            />
          </div>

          <Alert>
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              Políticas de senha ativas: Senhas devem ter pelo menos 8 caracteres, incluindo letras maiúsculas, 
              minúsculas, números e símbolos especiais.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>

      {/* Salvar Configurações */}
      <div className="flex justify-end">
        <Button size="lg" className="bg-green-600 hover:bg-green-700">
          Salvar Configurações de Segurança
        </Button>
      </div>
    </div>
  )
}
