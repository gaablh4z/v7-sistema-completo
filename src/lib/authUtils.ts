// Utilitários para validação e armazenamento
export interface ValidationResult {
  isValid: boolean;
  errors: string[];
}

export interface UserData {
  id: string;
  name: string;
  email: string;
  password?: string; // Hash da senha
  phone?: string;
  createdAt: string;
  lastLogin?: string;
  emailVerified: boolean;
  profile?: {
    avatar?: string;
    preferences?: Record<string, any>;
  };
}

export class EmailValidator {
  private static readonly EMAIL_REGEX = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;
  
  static validate(email: string): ValidationResult {
    const errors: string[] = [];
    
    if (!email) {
      errors.push("E-mail é obrigatório");
    } else {
      if (email.length > 254) {
        errors.push("E-mail muito longo (máximo 254 caracteres)");
      }
      
      if (!this.EMAIL_REGEX.test(email)) {
        errors.push("Formato de e-mail inválido");
      }
      
      // Validação adicional de domínios suspeitos
      const suspiciousDomains = ['tempmail.org', '10minutemail.com', 'guerrillamail.com'];
      const domain = email.split('@')[1]?.toLowerCase();
      if (domain && suspiciousDomains.includes(domain)) {
        errors.push("E-mail temporário não é permitido");
      }
    }
    
    return {
      isValid: errors.length === 0,
      errors
    };
  }
}

export class PasswordValidator {
  static validate(password: string): ValidationResult {
    const errors: string[] = [];
    
    if (!password) {
      errors.push("Senha é obrigatória");
      return { isValid: false, errors };
    }
    
    if (password.length < 8) {
      errors.push("Senha deve ter pelo menos 8 caracteres");
    }
    
    if (password.length > 128) {
      errors.push("Senha muito longa (máximo 128 caracteres)");
    }
    
    if (!/[a-z]/.test(password)) {
      errors.push("Senha deve conter pelo menos uma letra minúscula");
    }
    
    if (!/[A-Z]/.test(password)) {
      errors.push("Senha deve conter pelo menos uma letra maiúscula");
    }
    
    if (!/\d/.test(password)) {
      errors.push("Senha deve conter pelo menos um número");
    }
    
    if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) {
      errors.push("Senha deve conter pelo menos um caractere especial");
    }
    
    // Verificar senhas comuns
    const commonPasswords = [
      'password', '123456', '123456789', 'qwerty', 'abc123', 
      'password123', 'admin', 'letmein', 'welcome', 'monkey'
    ];
    
    if (commonPasswords.includes(password.toLowerCase())) {
      errors.push("Senha muito comum, escolha uma senha mais segura");
    }
    
    return {
      isValid: errors.length === 0,
      errors
    };
  }
  
  static getStrength(password: string): {
    score: number; // 0-4
    label: string;
    color: string;
  } {
    let score = 0;
    
    if (password.length >= 8) score++;
    if (password.length >= 12) score++;
    if (/[a-z]/.test(password) && /[A-Z]/.test(password)) score++;
    if (/\d/.test(password)) score++;
    if (/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) score++;
    
    const labels = ['Muito Fraca', 'Fraca', 'Regular', 'Forte', 'Muito Forte'];
    const colors = ['#ef4444', '#f97316', '#eab308', '#22c55e', '#16a34a'];
    
    return {
      score: Math.min(score, 4),
      label: labels[Math.min(score, 4)],
      color: colors[Math.min(score, 4)]
    };
  }
}

export class UserStorage {
  private static readonly STORAGE_KEY = 'autov7_users';
  private static readonly CURRENT_USER_KEY = 'autov7_current_user';
  private static readonly SESSION_KEY = 'autov7_session';
  
  static getAllUsers(): UserData[] {
    try {
      const users = localStorage.getItem(this.STORAGE_KEY);
      return users ? JSON.parse(users) : [];
    } catch (error) {
      console.error('Erro ao carregar usuários:', error);
      return [];
    }
  }
  
  static saveUser(userData: Omit<UserData, 'id' | 'createdAt'>): UserData {
    const users = this.getAllUsers();
    const newUser: UserData = {
      ...userData,
      id: this.generateId(),
      createdAt: new Date().toISOString(),
      emailVerified: false
    };
    
    users.push(newUser);
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(users));
    
    return newUser;
  }
  
  static findUserByEmail(email: string): UserData | null {
    const users = this.getAllUsers();
    return users.find(user => user.email.toLowerCase() === email.toLowerCase()) || null;
  }
  
  static updateUser(userId: string, updates: Partial<UserData>): UserData | null {
    const users = this.getAllUsers();
    const userIndex = users.findIndex(user => user.id === userId);
    
    if (userIndex === -1) return null;
    
    users[userIndex] = { ...users[userIndex], ...updates };
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(users));
    
    return users[userIndex];
  }
  
  static setCurrentUser(user: UserData): void {
    const session = {
      userId: user.id,
      loginTime: new Date().toISOString(),
      expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString() // 24h
    };
    
    localStorage.setItem(this.CURRENT_USER_KEY, JSON.stringify(user));
    localStorage.setItem(this.SESSION_KEY, JSON.stringify(session));
  }
  
  static getCurrentUser(): UserData | null {
    try {
      const session = localStorage.getItem(this.SESSION_KEY);
      if (!session) return null;
      
      const sessionData = JSON.parse(session);
      if (new Date() > new Date(sessionData.expiresAt)) {
        this.clearCurrentUser();
        return null;
      }
      
      const user = localStorage.getItem(this.CURRENT_USER_KEY);
      return user ? JSON.parse(user) : null;
    } catch (error) {
      console.error('Erro ao carregar usuário atual:', error);
      return null;
    }
  }
  
  static clearCurrentUser(): void {
    localStorage.removeItem(this.CURRENT_USER_KEY);
    localStorage.removeItem(this.SESSION_KEY);
  }
  
  static isSessionValid(): boolean {
    try {
      const session = localStorage.getItem(this.SESSION_KEY);
      if (!session) return false;
      
      const sessionData = JSON.parse(session);
      return new Date() <= new Date(sessionData.expiresAt);
    } catch (error) {
      return false;
    }
  }
  
  private static generateId(): string {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
  }
  
  // Método para exportar dados (LGPD compliance)
  static exportUserData(userId: string): UserData | null {
    const users = this.getAllUsers();
    return users.find(user => user.id === userId) || null;
  }
  
  // Método para deletar usuário (LGPD compliance)
  static deleteUser(userId: string): boolean {
    const users = this.getAllUsers();
    const filteredUsers = users.filter(user => user.id !== userId);
    
    if (filteredUsers.length === users.length) return false;
    
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(filteredUsers));
    
    // Se for o usuário atual, fazer logout
    const currentUser = this.getCurrentUser();
    if (currentUser?.id === userId) {
      this.clearCurrentUser();
    }
    
    return true;
  }
}

export class PasswordHelper {
  static hashPassword(password: string): string {
    // Simples hash para demonstração - em produção use bcrypt ou similar
    let hash = 0;
    for (let i = 0; i < password.length; i++) {
      const char = password.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32bit integer
    }
    return Math.abs(hash).toString(36) + password.length.toString(36);
  }
  
  static verifyPassword(password: string, hash: string): boolean {
    return this.hashPassword(password) === hash;
  }
}
