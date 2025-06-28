import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ValidatedInput } from '@/components/ui/ValidatedInput';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { 
  Shield, 
  Lock, 
  Eye, 
  EyeOff, 
  Settings, 
  AlertTriangle,
  CheckCircle,
  ArrowLeft,
  Clock
} from 'lucide-react';
import { AdminAuth } from '@/lib/adminAuth';
import { useNotification } from '@/contexts/NotificationContext';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import { EmailValidator, PasswordValidator } from '@/lib/authUtils';

interface AdminLoginScreenProps {
  onBackToSelection?: () => void;
  onLoginSuccess?: () => void;
}

export default function AdminLoginScreen({ onBackToSelection, onLoginSuccess }: AdminLoginScreenProps) {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [loading, setLoading] = useState(false);
  const [showChangePassword, setShowChangePassword] = useState(false);
  const [changePasswordData, setChangePasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [adminInfo, setAdminInfo] = useState<any>(null);

  const navigate = useNavigate();
  const { showSuccess, showError, showWarning } = useNotification();

  useEffect(() => {
    // Inicializar admin se necessário
    AdminAuth.initializeAdmin();
    
    // Carregar informações do admin
    const info = AdminAuth.getAdminInfo();
    setAdminInfo(info);

    // Verificar se já está logado
    if (AdminAuth.isAdminLoggedIn()) {
      navigate('/admin/dashboard');
    }
  }, [navigate]);

  const validateEmail = (email: string) => EmailValidator.validate(email);
  const validatePassword = (password: string) => {
    if (!password) {
      return { isValid: false, errors: ['Senha é obrigatória'] };
    }
    return { isValid: true, errors: [] };
  };

  const validateChangePassword = () => {
    const errors: string[] = [];
    
    if (!changePasswordData.currentPassword) {
      errors.push('Senha atual é obrigatória');
    }
    
    const newPasswordValidation = PasswordValidator.validate(changePasswordData.newPassword);
    if (!newPasswordValidation.isValid) {
      errors.push(...newPasswordValidation.errors);
    }
    
    if (changePasswordData.newPassword !== changePasswordData.confirmPassword) {
      errors.push('Nova senha e confirmação não coincidem');
    }
    
    return errors;
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.email || !formData.password) {
      showError('Campos obrigatórios', 'Preencha email e senha');
      return;
    }

    setLoading(true);

    try {
      const result = await AdminAuth.validateAdminLogin(formData.email, formData.password);
      
      if (result.success) {
        showSuccess('Login Admin', 'Acesso autorizado! Redirecionando...');
        
        // Chamar callback se fornecido
        if (onLoginSuccess) {
          onLoginSuccess();
        }
        
        // Pequeno delay para mostrar a mensagem
        setTimeout(() => {
          navigate('/admin/dashboard');
        }, 1500);
        
      } else {
        showError('Acesso Negado', result.message);
        
        if (result.locked) {
          showWarning('Conta Bloqueada', 'Muitas tentativas incorretas detectadas.');
        }
      }
      
    } catch (error) {
      console.error('Erro no login admin:', error);
      showError('Erro do Sistema', 'Erro interno. Contate o suporte técnico.');
    } finally {
      setLoading(false);
    }
  };

  const handleChangePassword = async () => {
    const errors = validateChangePassword();
    
    if (errors.length > 0) {
      showError('Dados inválidos', errors[0]);
      return;
    }

    try {
      const result = AdminAuth.changeAdminPassword(
        changePasswordData.currentPassword,
        changePasswordData.newPassword
      );
      
      if (result.success) {
        showSuccess('Senha Alterada', 'Senha do administrador alterada com sucesso!');
        setShowChangePassword(false);
        setChangePasswordData({
          currentPassword: '',
          newPassword: '',
          confirmPassword: ''
        });
        
        // Atualizar informações
        const info = AdminAuth.getAdminInfo();
        setAdminInfo(info);
        
      } else {
        showError('Erro', result.message);
      }
      
    } catch (error) {
      console.error('Erro ao alterar senha:', error);
      showError('Erro', 'Erro interno ao alterar senha.');
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handlePasswordChange = (field: string, value: string) => {
    setChangePasswordData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900 p-4">
      <Card className="w-full max-w-md shadow-2xl border-2 border-blue-500/30 bg-gray-900/80 backdrop-blur text-white">
        <CardHeader className="text-center space-y-4">
          {onBackToSelection && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onBackToSelection}
              className="absolute top-4 left-4 text-gray-300 hover:text-white"
            >
              <ArrowLeft className="h-4 w-4 mr-1" />
              Voltar
            </Button>
          )}
          
          <div className="flex justify-center">
            <div className="p-4 rounded-full bg-blue-600/20 border border-blue-500/30">
              <Shield className="h-10 w-10 text-blue-400" />
            </div>
          </div>
          
          <div>
            <CardTitle className="text-2xl font-bold text-white flex items-center justify-center gap-2">
              <Lock className="h-6 w-6" />
              Acesso Administrativo
            </CardTitle>
            <p className="text-gray-300 mt-2">
              Área restrita para administradores do sistema
            </p>
          </div>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Informações do Admin */}
          {adminInfo && (
            <div className="bg-blue-900/30 border border-blue-500/30 rounded-lg p-3 text-xs space-y-1">
              <div className="flex items-center gap-2 text-blue-300">
                <Settings className="h-3 w-3" />
                <span className="font-medium">Informações da Conta</span>
              </div>
              <div className="text-gray-300">
                <div>Email: {adminInfo.email}</div>
                {adminInfo.lastLogin && (
                  <div className="flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    Último acesso: {new Date(adminInfo.lastLogin).toLocaleString('pt-BR')}
                  </div>
                )}
              </div>
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-4">
            <ValidatedInput
              label="Email do Administrador"
              type="email"
              placeholder="admin@v7estetica.com"
              validator={validateEmail}
              onChange={(value) => handleInputChange('email', value)}
              className="bg-gray-800/50 border-gray-600 text-white placeholder:text-gray-400"
            />

            <ValidatedInput
              label="Senha de Acesso"
              type="password"
              placeholder="Digite sua senha de administrador"
              validator={validatePassword}
              onChange={(value) => handleInputChange('password', value)}
              showPasswordToggle
              className="bg-gray-800/50 border-gray-600 text-white placeholder:text-gray-400"
            />

            <Button
              type="submit"
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium"
              size="lg"
              disabled={loading}
            >
              {loading ? (
                <LoadingSpinner size="sm" />
              ) : (
                <>
                  <Shield className="h-4 w-4 mr-2" />
                  Acessar Sistema
                </>
              )}
            </Button>
          </form>

          {/* Botão para alterar senha */}
          <div className="pt-4 border-t border-gray-700">
            <Dialog open={showChangePassword} onOpenChange={setShowChangePassword}>
              <DialogTrigger asChild>
                <Button
                  variant="outline"
                  className="w-full border-gray-600 text-gray-300 hover:bg-gray-800 hover:text-white"
                >
                  <Settings className="h-4 w-4 mr-2" />
                  Alterar Senha do Admin
                </Button>
              </DialogTrigger>
              
              <DialogContent className="bg-gray-900 border-gray-700 text-white">
                <DialogHeader>
                  <DialogTitle className="flex items-center gap-2">
                    <Lock className="h-5 w-5 text-blue-400" />
                    Alterar Senha do Administrador
                  </DialogTitle>
                </DialogHeader>
                
                <div className="space-y-4">
                  <div className="bg-yellow-900/30 border border-yellow-500/30 rounded-lg p-3">
                    <div className="flex items-center gap-2 text-yellow-300 text-sm">
                      <AlertTriangle className="h-4 w-4" />
                      <span className="font-medium">Atenção</span>
                    </div>
                    <p className="text-yellow-200 text-xs mt-1">
                      A alteração da senha afetará o acesso administrativo. Guarde a nova senha em local seguro.
                    </p>
                  </div>

                  <ValidatedInput
                    label="Senha Atual"
                    type="password"
                    placeholder="Digite a senha atual"
                    validator={() => ({ isValid: true, errors: [] })}
                    onChange={(value) => handlePasswordChange('currentPassword', value)}
                    showPasswordToggle
                    className="bg-gray-800/50 border-gray-600 text-white"
                  />

                  <ValidatedInput
                    label="Nova Senha"
                    type="password"
                    placeholder="Digite a nova senha"
                    validator={PasswordValidator.validate}
                    onChange={(value) => handlePasswordChange('newPassword', value)}
                    showPasswordToggle
                    strengthMeter
                    className="bg-gray-800/50 border-gray-600 text-white"
                  />

                  <ValidatedInput
                    label="Confirmar Nova Senha"
                    type="password"
                    placeholder="Digite a nova senha novamente"
                    validator={(value) => ({
                      isValid: value === changePasswordData.newPassword,
                      errors: value !== changePasswordData.newPassword ? ['Senhas não coincidem'] : []
                    })}
                    onChange={(value) => handlePasswordChange('confirmPassword', value)}
                    showPasswordToggle
                    className="bg-gray-800/50 border-gray-600 text-white"
                  />

                  <div className="flex gap-2 pt-4">
                    <Button
                      onClick={handleChangePassword}
                      className="flex-1 bg-green-600 hover:bg-green-700"
                    >
                      <CheckCircle className="h-4 w-4 mr-2" />
                      Alterar Senha
                    </Button>
                    
                    <Button
                      variant="outline"
                      onClick={() => setShowChangePassword(false)}
                      className="border-gray-600 text-gray-300 hover:bg-gray-800"
                    >
                      Cancelar
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>

          {/* Informações de segurança */}
          <div className="text-center text-xs text-gray-400 space-y-1 pt-4 border-t border-gray-700">
            <div className="flex items-center justify-center gap-4">
              <div className="flex items-center gap-1">
                <Shield className="h-3 w-3" />
                <span>Acesso Protegido</span>
              </div>
              <div className="flex items-center gap-1">
                <Lock className="h-3 w-3" />
                <span>Sessão Segura</span>
              </div>
            </div>
            <p>⚠️ Acesso monitorado e registrado</p>
            <p className="text-blue-400">
              Credenciais padrão: admin@v7estetica.com / 4dm1nV7@2024
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
