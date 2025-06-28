import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ValidatedInput } from '@/components/ui/ValidatedInput';
import { Separator } from '@/components/ui/separator';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { 
  Mail, 
  Lock, 
  User, 
  Phone, 
  ArrowLeft, 
  Eye, 
  EyeOff,
  CheckCircle,
  AlertTriangle,
  Shield,
  Smartphone
} from 'lucide-react';
import { EmailValidator, PasswordValidator, UserStorage, PasswordHelper, UserData } from '@/lib/authUtils';
import { useAuth } from '@/contexts/AuthContext';
import { useNotification } from '@/contexts/NotificationContext';
import LoadingSpinner from '@/components/ui/LoadingSpinner';

interface EnhancedAuthFormProps {
  onBackToSelection?: () => void;
}

interface FormData {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
  phone: string;
  acceptTerms: boolean;
}

export default function EnhancedAuthForm({ onBackToSelection }: EnhancedAuthFormProps) {
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<FormData>({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    phone: '',
    acceptTerms: false
  });
  const [formErrors, setFormErrors] = useState<Partial<FormData>>({});
  const [step, setStep] = useState(1); // Para cadastro multi-step
  const [showForgotPassword, setShowForgotPassword] = useState(false);

  const { login } = useAuth();
  const { showSuccess, showError, showInfo, showWarning } = useNotification();

  // Validações em tempo real
  const validateEmail = (email: string) => EmailValidator.validate(email);
  const validatePassword = (password: string) => PasswordValidator.validate(password);
  
  const validateConfirmPassword = (confirmPassword: string) => {
    if (!confirmPassword) {
      return { isValid: false, errors: ['Confirmação de senha é obrigatória'] };
    }
    if (confirmPassword !== formData.password) {
      return { isValid: false, errors: ['Senhas não coincidem'] };
    }
    return { isValid: true, errors: [] };
  };

  const validateName = (name: string) => {
    const errors: string[] = [];
    if (!name.trim()) {
      errors.push('Nome é obrigatório');
    } else if (name.trim().length < 2) {
      errors.push('Nome deve ter pelo menos 2 caracteres');
    } else if (name.trim().length > 50) {
      errors.push('Nome deve ter no máximo 50 caracteres');
    }
    return { isValid: errors.length === 0, errors };
  };

  const validatePhone = (phone: string) => {
    const errors: string[] = [];
    if (phone && !/^\(\d{2}\)\s\d{4,5}-\d{4}$/.test(phone)) {
      errors.push('Formato: (11) 99999-9999');
    }
    return { isValid: errors.length === 0, errors };
  };

  // Formatação do telefone
  const formatPhone = (value: string) => {
    const numbers = value.replace(/\D/g, '');
    if (numbers.length <= 2) return numbers;
    if (numbers.length <= 6) return `(${numbers.slice(0, 2)}) ${numbers.slice(2)}`;
    if (numbers.length <= 10) return `(${numbers.slice(0, 2)}) ${numbers.slice(2, 6)}-${numbers.slice(6)}`;
    return `(${numbers.slice(0, 2)}) ${numbers.slice(2, 7)}-${numbers.slice(7, 11)}`;
  };

  const handleInputChange = (field: keyof FormData, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: field === 'phone' ? formatPhone(value) : value
    }));
    
    // Limpar erro do campo quando usuário começar a digitar
    if (formErrors[field]) {
      setFormErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };

  const validateForm = (): boolean => {
    const errors: Partial<FormData> = {};

    // Validar email
    const emailValidation = validateEmail(formData.email);
    if (!emailValidation.isValid) {
      errors.email = emailValidation.errors[0];
    }

    // Validar senha
    const passwordValidation = validatePassword(formData.password);
    if (!passwordValidation.isValid) {
      errors.password = passwordValidation.errors[0];
    }

    if (!isLogin) {
      // Validações adicionais para cadastro
      const nameValidation = validateName(formData.name);
      if (!nameValidation.isValid) {
        errors.name = nameValidation.errors[0];
      }

      const confirmPasswordValidation = validateConfirmPassword(formData.confirmPassword);
      if (!confirmPasswordValidation.isValid) {
        errors.confirmPassword = confirmPasswordValidation.errors[0];
      }

      if (formData.phone) {
        const phoneValidation = validatePhone(formData.phone);
        if (!phoneValidation.isValid) {
          errors.phone = phoneValidation.errors[0];
        }
      }

      if (!formData.acceptTerms) {
        showError('Termos de Uso', 'Você deve aceitar os termos de uso para continuar.');
        return false;
      }
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    // Verificar se está tentando fazer login como admin
    if (isLogin && (formData.email === 'admin@v7estetica.com' || formData.email.includes('admin'))) {
      showWarning(
        'Acesso Administrativo',
        'Para acessar o painel administrativo, use a página de login admin.'
      );
      return;
    }

    setLoading(true);

    try {
      if (isLogin) {
        // Login
        const user = UserStorage.findUserByEmail(formData.email);
        if (!user) {
          throw new Error('E-mail não encontrado. Deseja criar uma conta?');
        }

        // Verificar senha (simulação - em produção use hash seguro)
        const isValidPassword = PasswordHelper.verifyPassword(formData.password, user.password || '');
        if (!isValidPassword) {
          throw new Error('Senha incorreta.');
        }

        // Atualizar último login
        const updatedUser = UserStorage.updateUser(user.id, {
          lastLogin: new Date().toISOString()
        });

        UserStorage.setCurrentUser(updatedUser!);
        await login(formData.email, formData.password);
        
        showSuccess(
          'Login realizado com sucesso!', 
          `Bem-vindo(a) de volta, ${user.name}!`
        );

      } else {
        // Cadastro
        const existingUser = UserStorage.findUserByEmail(formData.email);
        if (existingUser) {
          throw new Error('E-mail já cadastrado. Faça login ou use outro e-mail.');
        }

        // Criar novo usuário
        const newUser = UserStorage.saveUser({
          name: formData.name,
          email: formData.email,
          phone: formData.phone || undefined,
          password: PasswordHelper.hashPassword(formData.password),
          emailVerified: false
        });

        UserStorage.setCurrentUser(newUser);
        
        showSuccess(
          'Conta criada com sucesso!',
          `Bem-vindo(a), ${newUser.name}! Sua conta foi criada.`
        );

        // Simular envio de e-mail de verificação
        setTimeout(() => {
          showInfo(
            'Verificação de E-mail',
            'Um e-mail de verificação foi enviado. Verifique sua caixa de entrada.'
          );
        }, 2000);

        // Fazer login automático após cadastro
        await login(formData.email, formData.password);
      }

    } catch (error) {
      console.error('Erro de autenticação:', error);
      const message = error instanceof Error ? error.message : 'Erro desconhecido';
      showError('Erro de Autenticação', message);
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = () => {
    if (!formData.email) {
      showError('E-mail necessário', 'Digite seu e-mail primeiro.');
      return;
    }

    const emailValidation = validateEmail(formData.email);
    if (!emailValidation.isValid) {
      showError('E-mail inválido', 'Digite um e-mail válido.');
      return;
    }

    // Simular envio de e-mail
    showSuccess(
      'E-mail enviado!',
      'Instruções para redefinir sua senha foram enviadas para seu e-mail.'
    );
    setShowForgotPassword(false);
  };

  const getFormProgress = () => {
    if (isLogin) return 100;
    
    const fields = ['name', 'email', 'password', 'confirmPassword'];
    const filled = fields.filter(field => formData[field as keyof FormData]).length;
    return (filled / fields.length) * 100;
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-purple-50 p-4">
      <Card className="w-full max-w-md shadow-xl border-0 bg-white/80 backdrop-blur">
        <CardHeader className="text-center space-y-4">
          {onBackToSelection && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onBackToSelection}
              className="absolute top-4 left-4"
            >
              <ArrowLeft className="h-4 w-4 mr-1" />
              Voltar
            </Button>
          )}
          
          <div className="flex justify-center">
            <div className="p-3 rounded-full bg-blue-100">
              <User className="h-8 w-8 text-blue-600" />
            </div>
          </div>
          
          <div>
            <CardTitle className="text-2xl font-bold text-gray-900">
              {isLogin ? 'Entrar na sua conta' : 'Criar nova conta'}
            </CardTitle>
            <p className="text-gray-600 mt-2">
              {isLogin 
                ? 'Bem-vindo de volta! Faça login para continuar.' 
                : 'Preencha seus dados para criar sua conta.'
              }
            </p>
          </div>

          {!isLogin && (
            <div className="space-y-2">
              <div className="flex justify-between text-xs text-gray-500">
                <span>Progresso do cadastro</span>
                <span>{Math.round(getFormProgress())}%</span>
              </div>
              <Progress value={getFormProgress()} className="h-2" />
            </div>
          )}
        </CardHeader>

        <CardContent className="space-y-4">
          <form onSubmit={handleSubmit} className="space-y-4">
            {!isLogin && (
              <ValidatedInput
                label="Nome completo"
                type="text"
                placeholder="Digite seu nome"
                validator={validateName}
                onChange={(value) => handleInputChange('name', value)}
                error={formErrors.name}
                helperText="Como você gostaria de ser chamado?"
              />
            )}

            <ValidatedInput
              label="E-mail"
              type="email"
              placeholder="seu@email.com"
              validator={validateEmail}
              onChange={(value) => handleInputChange('email', value)}
              error={formErrors.email}
              helperText="Usaremos este e-mail para contato e recuperação de senha"
            />

            <ValidatedInput
              label="Senha"
              type="password"
              placeholder="Digite sua senha"
              validator={validatePassword}
              onChange={(value) => handleInputChange('password', value)}
              error={formErrors.password}
              showPasswordToggle
              strengthMeter={!isLogin}
              helperText={isLogin ? undefined : "Mínimo 8 caracteres com letras, números e símbolos"}
            />

            {!isLogin && (
              <>
                <ValidatedInput
                  label="Confirmar senha"
                  type="password"
                  placeholder="Digite a senha novamente"
                  validator={validateConfirmPassword}
                  onChange={(value) => handleInputChange('confirmPassword', value)}
                  error={formErrors.confirmPassword}
                  showPasswordToggle
                />

                <ValidatedInput
                  label="Telefone (opcional)"
                  type="tel"
                  placeholder="(11) 99999-9999"
                  validator={validatePhone}
                  onChange={(value) => handleInputChange('phone', value)}
                  error={formErrors.phone}
                  helperText="Para contato sobre seus agendamentos"
                />

                <div className="flex items-center space-x-2 p-4 bg-gray-50 rounded-lg">
                  <Switch
                    id="terms"
                    checked={formData.acceptTerms}
                    onCheckedChange={(checked) => 
                      setFormData(prev => ({ ...prev, acceptTerms: checked }))
                    }
                  />
                  <Label htmlFor="terms" className="text-sm text-gray-700">
                    Aceito os{' '}
                    <button
                      type="button"
                      className="text-blue-600 hover:underline"
                      onClick={() => showInfo('Termos de Uso', 'Termos de uso e política de privacidade...')}
                    >
                      termos de uso
                    </button>
                    {' '}e{' '}
                    <button
                      type="button"
                      className="text-blue-600 hover:underline"
                      onClick={() => showInfo('Política de Privacidade', 'Política de privacidade e proteção de dados...')}
                    >
                      política de privacidade
                    </button>
                  </Label>
                </div>
              </>
            )}

            <Button
              type="submit"
              className="w-full bg-blue-600 hover:bg-blue-700"
              size="lg"
              disabled={loading}
            >
              {loading ? (
                <LoadingSpinner size="sm" />
              ) : (
                <>
                  {isLogin ? (
                    <>
                      <Lock className="h-4 w-4 mr-2" />
                      Entrar
                    </>
                  ) : (
                    <>
                      <User className="h-4 w-4 mr-2" />
                      Criar conta
                    </>
                  )}
                </>
              )}
            </Button>
          </form>

          {isLogin && (
            <div className="text-center">
              <button
                type="button"
                onClick={handleForgotPassword}
                className="text-sm text-blue-600 hover:underline"
              >
                Esqueceu sua senha?
              </button>
            </div>
          )}

          <Separator />

          <div className="text-center space-y-4">
            <p className="text-sm text-gray-600">
              {isLogin ? 'Não tem uma conta?' : 'Já tem uma conta?'}
            </p>
            <Button
              type="button"
              variant="outline"
              className="w-full"
              onClick={() => {
                setIsLogin(!isLogin);
                setFormErrors({});
                setFormData({
                  name: '',
                  email: formData.email, // Manter email
                  password: '',
                  confirmPassword: '',
                  phone: '',
                  acceptTerms: false
                });
              }}
            >
              {isLogin ? 'Criar nova conta' : 'Fazer login'}
            </Button>
          </div>

          {/* Indicadores de segurança */}
          <div className="flex items-center justify-center space-x-4 text-xs text-gray-500 pt-4 border-t">
            <div className="flex items-center space-x-1">
              <Shield className="h-3 w-3" />
              <span>Dados protegidos</span>
            </div>
            <div className="flex items-center space-x-1">
              <Lock className="h-3 w-3" />
              <span>Conexão segura</span>
            </div>
          </div>

          {/* Link para painel admin */}
          <div className="text-center pt-4 border-t mt-4">
            <button
              type="button"
              className="text-xs text-gray-500 hover:text-gray-700 transition-colors"
              onClick={() => window.location.href = '/admin'}
            >
              Acesso Administrativo
            </button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
