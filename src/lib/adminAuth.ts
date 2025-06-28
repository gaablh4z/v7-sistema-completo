// Sistema de autenticação admin seguro
export interface AdminCredentials {
  email: string;
  password: string;
  lastChanged: string;
  loginAttempts: number;
  locked: boolean;
  lastLogin?: string;
}

export class AdminAuth {
  private static readonly ADMIN_KEY = 'autov7_admin_credentials';
  private static readonly SESSION_KEY = 'autov7_admin_session';
  private static readonly MAX_ATTEMPTS = 5;
  private static readonly LOCKOUT_TIME = 15 * 60 * 1000; // 15 minutos

  // Credenciais padrão do admin (primeiro acesso)
  private static readonly DEFAULT_ADMIN: AdminCredentials = {
    email: 'admin@v7estetica.com',
    password: '4dm1nV7@2024', // Senha complexa padrão
    lastChanged: new Date().toISOString(),
    loginAttempts: 0,
    locked: false
  };

  static initializeAdmin(): void {
    const existing = this.getAdminCredentials();
    if (!existing) {
      // Hash da senha padrão
      const hashedPassword = this.hashPassword(this.DEFAULT_ADMIN.password);
      const adminCreds: AdminCredentials = {
        ...this.DEFAULT_ADMIN,
        password: hashedPassword
      };
      
      localStorage.setItem(this.ADMIN_KEY, JSON.stringify(adminCreds));
      console.log('🔧 Admin inicializado com credenciais padrão');
      console.log('📧 Email: admin@v7estetica.com');
      console.log('🔑 Senha: 4dm1nV7@2024');
    }
  }

  static getAdminCredentials(): AdminCredentials | null {
    try {
      const creds = localStorage.getItem(this.ADMIN_KEY);
      return creds ? JSON.parse(creds) : null;
    } catch (error) {
      console.error('Erro ao carregar credenciais admin:', error);
      return null;
    }
  }

  static async validateAdminLogin(email: string, password: string): Promise<{
    success: boolean;
    message: string;
    locked?: boolean;
  }> {
    const creds = this.getAdminCredentials();
    
    if (!creds) {
      return { success: false, message: 'Credenciais admin não encontradas' };
    }

    // Verificar se está bloqueado
    if (creds.locked) {
      const lockoutExpired = new Date().getTime() - new Date(creds.lastChanged).getTime() > this.LOCKOUT_TIME;
      if (!lockoutExpired) {
        const remainingTime = Math.ceil((this.LOCKOUT_TIME - (new Date().getTime() - new Date(creds.lastChanged).getTime())) / 60000);
        return { 
          success: false, 
          message: `Conta bloqueada. Tente novamente em ${remainingTime} minutos.`,
          locked: true 
        };
      } else {
        // Desbloquear após tempo de bloqueio
        creds.locked = false;
        creds.loginAttempts = 0;
      }
    }

    // Verificar email (deve ser exato)
    if (email !== creds.email) {
      this.incrementAttempts(creds);
      return { success: false, message: 'Email de administrador inválido' };
    }

    // Verificar senha
    const isValidPassword = this.verifyPassword(password, creds.password);
    if (!isValidPassword) {
      this.incrementAttempts(creds);
      const remainingAttempts = this.MAX_ATTEMPTS - creds.loginAttempts;
      
      if (remainingAttempts <= 0) {
        creds.locked = true;
        creds.lastChanged = new Date().toISOString();
        this.saveAdminCredentials(creds);
        return { 
          success: false, 
          message: 'Muitas tentativas incorretas. Conta bloqueada por 15 minutos.',
          locked: true 
        };
      }
      
      return { 
        success: false, 
        message: `Senha incorreta. ${remainingAttempts} tentativa(s) restante(s).` 
      };
    }

    // Login bem-sucedido
    creds.loginAttempts = 0;
    creds.locked = false;
    creds.lastLogin = new Date().toISOString();
    this.saveAdminCredentials(creds);

    // Criar sessão admin
    this.createAdminSession();

    return { success: true, message: 'Login admin realizado com sucesso' };
  }

  static changeAdminPassword(currentPassword: string, newPassword: string): {
    success: boolean;
    message: string;
  } {
    const creds = this.getAdminCredentials();
    
    if (!creds) {
      return { success: false, message: 'Credenciais admin não encontradas' };
    }

    // Verificar senha atual
    if (!this.verifyPassword(currentPassword, creds.password)) {
      return { success: false, message: 'Senha atual incorreta' };
    }

    // Validar nova senha
    const validation = this.validateNewPassword(newPassword);
    if (!validation.isValid) {
      return { success: false, message: validation.errors[0] };
    }

    // Atualizar senha
    creds.password = this.hashPassword(newPassword);
    creds.lastChanged = new Date().toISOString();
    this.saveAdminCredentials(creds);

    console.log('🔑 Senha admin alterada com sucesso');
    return { success: true, message: 'Senha alterada com sucesso' };
  }

  static createAdminSession(): void {
    const session = {
      type: 'admin',
      loginTime: new Date().toISOString(),
      expiresAt: new Date(Date.now() + 8 * 60 * 60 * 1000).toISOString() // 8h para admin
    };
    
    localStorage.setItem(this.SESSION_KEY, JSON.stringify(session));
  }

  static isAdminLoggedIn(): boolean {
    try {
      const session = localStorage.getItem(this.SESSION_KEY);
      if (!session) return false;
      
      const sessionData = JSON.parse(session);
      if (sessionData.type !== 'admin') return false;
      
      return new Date() <= new Date(sessionData.expiresAt);
    } catch (error) {
      return false;
    }
  }

  static logoutAdmin(): void {
    localStorage.removeItem(this.SESSION_KEY);
    console.log('🚪 Logout admin realizado');
  }

  static getAdminInfo(): { email: string; lastLogin?: string; lastChanged: string } | null {
    const creds = this.getAdminCredentials();
    if (!creds) return null;
    
    return {
      email: creds.email,
      lastLogin: creds.lastLogin,
      lastChanged: creds.lastChanged
    };
  }

  private static incrementAttempts(creds: AdminCredentials): void {
    creds.loginAttempts++;
    this.saveAdminCredentials(creds);
  }

  private static saveAdminCredentials(creds: AdminCredentials): void {
    localStorage.setItem(this.ADMIN_KEY, JSON.stringify(creds));
  }

  private static hashPassword(password: string): string {
    // Hash simples para demonstração - em produção use bcrypt
    let hash = 0;
    const salt = 'v7admin2024';
    const combined = password + salt;
    
    for (let i = 0; i < combined.length; i++) {
      const char = combined.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash;
    }
    
    return Math.abs(hash).toString(36) + combined.length.toString(36);
  }

  private static verifyPassword(password: string, hash: string): boolean {
    return this.hashPassword(password) === hash;
  }

  private static validateNewPassword(password: string): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];
    
    if (password.length < 8) {
      errors.push('Nova senha deve ter pelo menos 8 caracteres');
    }
    
    if (!/[A-Z]/.test(password)) {
      errors.push('Nova senha deve conter pelo menos uma letra maiúscula');
    }
    
    if (!/[a-z]/.test(password)) {
      errors.push('Nova senha deve conter pelo menos uma letra minúscula');
    }
    
    if (!/\d/.test(password)) {
      errors.push('Nova senha deve conter pelo menos um número');
    }
    
    if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) {
      errors.push('Nova senha deve conter pelo menos um caractere especial');
    }

    // Verificar se não é igual à senha padrão
    if (password === this.DEFAULT_ADMIN.password) {
      errors.push('Nova senha não pode ser igual à senha padrão');
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }
}
