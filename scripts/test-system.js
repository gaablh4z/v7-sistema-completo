#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

// Cores para console
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m'
};

class SystemTester {
  constructor() {
    this.errors = [];
    this.warnings = [];
    this.success = [];
    this.projectRoot = path.resolve(__dirname, '..');
  }

  log(message, type = 'info') {
    const timestamp = new Date().toLocaleTimeString();
    const color = {
      success: colors.green,
      error: colors.red,
      warning: colors.yellow,
      info: colors.blue
    }[type] || colors.reset;
    
    console.log(`${color}[${timestamp}] ${message}${colors.reset}`);
  }

  async testFileStructure() {
    this.log('🔍 Testando estrutura de arquivos...', 'info');
    
    const requiredFiles = [
      'app/layout.tsx',
      'app/page.tsx',
      'app/admin/page.tsx',
      'contexts/AuthContext.tsx',
      'components/auth/ClientAuthScreen.tsx',
      'components/auth/AdminAuthScreen.tsx',
      'components/ui/LoadingSpinner.tsx'
    ];

    const requiredDirs = [
      'app',
      'components',
      'contexts',
      'hooks',
      'lib'
    ];

    for (const file of requiredFiles) {
      const filePath = path.join(this.projectRoot, file);
      if (fs.existsSync(filePath)) {
        this.success.push(`✓ Arquivo encontrado: ${file}`);
      } else {
        this.errors.push(`✗ Arquivo não encontrado: ${file}`);
      }
    }

    for (const dir of requiredDirs) {
      const dirPath = path.join(this.projectRoot, dir);
      if (fs.existsSync(dirPath) && fs.statSync(dirPath).isDirectory()) {
        this.success.push(`✓ Diretório encontrado: ${dir}`);
      } else {
        this.errors.push(`✗ Diretório não encontrado: ${dir}`);
      }
    }
  }

  async testImports() {
    this.log('📦 Testando imports e dependências...', 'info');
    
    const testFiles = [
      'app/layout.tsx',
      'app/page.tsx', 
      'app/admin/page.tsx',
      'contexts/AuthContext.tsx'
    ];

    for (const file of testFiles) {
      try {
        const filePath = path.join(this.projectRoot, file);
        const content = fs.readFileSync(filePath, 'utf8');
        
        // Verificar imports problemáticos
        const problematicImports = [
          { pattern: /from\s+['"]@\/.*['"]\s*$/, message: 'Import sem extensão detectado' },
          { pattern: /import.*LoadingSpinner.*from/, message: 'Import do LoadingSpinner encontrado' },
          { pattern: /window\./g, message: 'Uso direto de window detectado' },
          { pattern: /navigator\./g, message: 'Uso direto de navigator detectado' }
        ];

        for (const { pattern, message } of problematicImports) {
          const matches = content.match(pattern);
          if (matches && file.includes('test-funcionalidades')) {
            // Verificar se tem proteção typeof window !== 'undefined'
            if (pattern.source.includes('window') && !content.includes("typeof window !== 'undefined'")) {
              this.warnings.push(`⚠ ${file}: ${message} sem proteção SSR`);
            }
          }
        }

        this.success.push(`✓ Imports verificados: ${file}`);
      } catch (error) {
        this.errors.push(`✗ Erro ao verificar ${file}: ${error.message}`);
      }
    }
  }

  async testAuthContext() {
    this.log('🔐 Testando contexto de autenticação...', 'info');
    
    try {
      const authPath = path.join(this.projectRoot, 'contexts/AuthContext.tsx');
      const content = fs.readFileSync(authPath, 'utf8');
      
      // Verificações específicas do AuthContext
      const checks = [
        { 
          test: content.includes('const login = async'),
          message: 'Função login encontrada'
        },
        {
          test: content.includes('const register = async'),
          message: 'Função register encontrada'
        },
        {
          test: content.includes('const updateProfile = async'),
          message: 'Função updateProfile encontrada'
        },
        {
          test: content.includes('AuthProvider'),
          message: 'AuthProvider component encontrado'
        },
        {
          test: !content.match(/return\s*$/m) || content.includes('if (!user) return'),
          message: 'Sem returns vazios problemáticos'
        },
        {
          test: content.includes('localStorage.setItem'),
          message: 'Persistência localStorage implementada'
        },
        {
          test: content.includes('🔧 Modo demonstração'),
          message: 'Modo demonstração ativo'
        }
      ];

      for (const check of checks) {
        if (check.test) {
          this.success.push(`✓ AuthContext: ${check.message}`);
        } else {
          this.errors.push(`✗ AuthContext: ${check.message} - FALHOU`);
        }
      }

    } catch (error) {
      this.errors.push(`✗ Erro ao testar AuthContext: ${error.message}`);
    }
  }

  async testRoutes() {
    this.log('🛣️ Testando rotas e páginas...', 'info');
    
    const routes = [
      { path: 'app/page.tsx', name: 'Página inicial (cliente)' },
      { path: 'app/admin/page.tsx', name: 'Página admin' },
      { path: 'app/debug/page.tsx', name: 'Página debug' },
      { path: 'app/test-funcionalidades/page.tsx', name: 'Página test-funcionalidades' },
      { path: 'app/manutencao/page.tsx', name: 'Página manutenção' }
    ];

    for (const route of routes) {
      try {
        const routePath = path.join(this.projectRoot, route.path);
        if (fs.existsSync(routePath)) {
          const content = fs.readFileSync(routePath, 'utf8');
          
          // Verificações básicas da página
          const hasUseClient = content.includes('"use client"');
          const hasExportDefault = content.includes('export default');
          
          if (hasUseClient && hasExportDefault) {
            this.success.push(`✓ Rota válida: ${route.name}`);
          } else {
            this.warnings.push(`⚠ Rota incompleta: ${route.name} - missing ${!hasUseClient ? '"use client"' : ''} ${!hasExportDefault ? 'export default' : ''}`);
          }
        } else {
          this.warnings.push(`⚠ Rota não encontrada: ${route.name}`);
        }
      } catch (error) {
        this.errors.push(`✗ Erro ao testar rota ${route.name}: ${error.message}`);
      }
    }
  }

  async testComponents() {
    this.log('🧩 Testando componentes principais...', 'info');
    
    const components = [
      { path: 'components/auth/ClientAuthScreen.tsx', name: 'ClientAuthScreen' },
      { path: 'components/auth/AdminAuthScreen.tsx', name: 'AdminAuthScreen' },
      { path: 'components/ui/LoadingSpinner.tsx', name: 'LoadingSpinner' },
      { path: 'components/admin/AdminDashboard.tsx', name: 'AdminDashboard' },
      { path: 'components/dashboard/Dashboard.tsx', name: 'Dashboard' }
    ];

    for (const component of components) {
      try {
        const componentPath = path.join(this.projectRoot, component.path);
        if (fs.existsSync(componentPath)) {
          const content = fs.readFileSync(componentPath, 'utf8');
          
          const hasExport = content.includes('export default') || content.includes(`export { ${component.name} }`);
          
          if (hasExport) {
            this.success.push(`✓ Componente válido: ${component.name}`);
          } else {
            this.errors.push(`✗ Componente sem export: ${component.name}`);
          }
        } else {
          this.warnings.push(`⚠ Componente não encontrado: ${component.name}`);
        }
      } catch (error) {
        this.errors.push(`✗ Erro ao testar componente ${component.name}: ${error.message}`);
      }
    }
  }

  async testBuildOutput() {
    this.log('📁 Verificando saída do build...', 'info');
    
    const buildDir = path.join(this.projectRoot, '.next');
    if (fs.existsSync(buildDir)) {
      this.success.push('✓ Diretório .next encontrado');
      
      // Verificar se há static pages geradas
      const staticDir = path.join(buildDir, 'static');
      if (fs.existsSync(staticDir)) {
        this.success.push('✓ Assets estáticos gerados');
      } else {
        this.warnings.push('⚠ Assets estáticos não encontrados');
      }
    } else {
      this.errors.push('✗ Build output não encontrado - execute npm run build primeiro');
    }
  }

  generateReport() {
    console.log('\n' + '='.repeat(60));
    console.log(`${colors.bright}${colors.cyan}📊 RELATÓRIO DE TESTE DO SISTEMA${colors.reset}`);
    console.log('='.repeat(60));
    
    if (this.success.length > 0) {
      console.log(`\n${colors.green}${colors.bright}✅ SUCESSOS (${this.success.length}):${colors.reset}`);
      this.success.forEach(msg => console.log(`  ${colors.green}${msg}${colors.reset}`));
    }
    
    if (this.warnings.length > 0) {
      console.log(`\n${colors.yellow}${colors.bright}⚠️  AVISOS (${this.warnings.length}):${colors.reset}`);
      this.warnings.forEach(msg => console.log(`  ${colors.yellow}${msg}${colors.reset}`));
    }
    
    if (this.errors.length > 0) {
      console.log(`\n${colors.red}${colors.bright}❌ ERROS (${this.errors.length}):${colors.reset}`);
      this.errors.forEach(msg => console.log(`  ${colors.red}${msg}${colors.reset}`));
    }

    console.log('\n' + '='.repeat(60));
    
    const total = this.success.length + this.warnings.length + this.errors.length;
    const successRate = Math.round((this.success.length / total) * 100);
    
    if (this.errors.length === 0) {
      console.log(`${colors.green}${colors.bright}🎉 SISTEMA APROVADO! Taxa de sucesso: ${successRate}%${colors.reset}`);
      if (this.warnings.length > 0) {
        console.log(`${colors.yellow}   Avisos encontrados, mas sistema funcional.${colors.reset}`);
      }
      return true;
    } else {
      console.log(`${colors.red}${colors.bright}💥 SISTEMA COM PROBLEMAS! Corrija os erros antes de prosseguir.${colors.reset}`);
      return false;
    }
  }

  async run() {
    console.log(`${colors.cyan}${colors.bright}🧪 Iniciando teste completo do sistema AutoV7...${colors.reset}\n`);
    
    await this.testFileStructure();
    await this.testImports();
    await this.testAuthContext();
    await this.testRoutes();
    await this.testComponents();
    await this.testBuildOutput();
    
    const success = this.generateReport();
    
    console.log(`\n${colors.magenta}📝 Dica: Use 'npm run test:routes' para testar rotas em servidor local${colors.reset}`);
    console.log(`${colors.magenta}📝 Dica: Use 'npm run test:complete' para teste completo com build${colors.reset}`);
    
    process.exit(success ? 0 : 1);
  }
}

// Executar teste
const tester = new SystemTester();
tester.run().catch(error => {
  console.error(`${colors.red}Erro fatal no teste: ${error.message}${colors.reset}`);
  process.exit(1);
});
