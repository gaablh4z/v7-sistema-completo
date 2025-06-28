#!/usr/bin/env node

const http = require('http');
const { spawn } = require('child_process');

// Cores para console
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m'
};

class RoutesTester {
  constructor() {
    this.baseUrl = 'http://localhost:3000';
    this.routes = [
      { path: '/', name: 'Página inicial (login cliente)', critical: true },
      { path: '/admin', name: 'Login administrativo', critical: true },
      { path: '/debug', name: 'Página de debug', critical: false },
      { path: '/test-funcionalidades', name: 'Teste de funcionalidades', critical: false },
      { path: '/manutencao', name: 'Página de manutenção', critical: false },
      { path: '/acesso/operacional', name: 'Acesso operacional', critical: false },
      { path: '/demo-funcionalidades', name: 'Demo funcionalidades', critical: false }
    ];
    this.results = [];
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

  async checkServerRunning() {
    return new Promise((resolve) => {
      const req = http.get(this.baseUrl, (res) => {
        resolve(true);
      });
      
      req.on('error', () => {
        resolve(false);
      });
      
      req.setTimeout(2000, () => {
        req.destroy();
        resolve(false);
      });
    });
  }

  async testRoute(route) {
    return new Promise((resolve) => {
      const url = `${this.baseUrl}${route.path}`;
      
      const req = http.get(url, (res) => {
        let data = '';
        
        res.on('data', chunk => {
          data += chunk;
        });
        
        res.on('end', () => {
          const result = {
            ...route,
            status: res.statusCode,
            success: res.statusCode === 200,
            hasContent: data.length > 0,
            hasReactRoot: data.includes('__next') || data.includes('react'),
            hasTitle: data.includes('<title>'),
            size: data.length
          };
          
          resolve(result);
        });
      });
      
      req.on('error', (error) => {
        resolve({
          ...route,
          status: 0,
          success: false,
          error: error.message
        });
      });
      
      req.setTimeout(5000, () => {
        req.destroy();
        resolve({
          ...route,
          status: 0,
          success: false,
          error: 'Timeout'
        });
      });
    });
  }

  async runTests() {
    this.log('🌐 Testando rotas do sistema...', 'info');
    
    // Verificar se o servidor está rodando
    const serverRunning = await this.checkServerRunning();
    if (!serverRunning) {
      this.log('❌ Servidor não está rodando em http://localhost:3000', 'error');
      this.log('💡 Execute "npm run dev" em outro terminal primeiro', 'warning');
      return false;
    }
    
    this.log('✅ Servidor detectado, testando rotas...', 'success');
    
    // Testar cada rota
    for (const route of this.routes) {
      this.log(`🔍 Testando: ${route.path}`, 'info');
      const result = await this.testRoute(route);
      this.results.push(result);
      
      if (result.success) {
        this.log(`✅ ${route.name}: OK (${result.status})`, 'success');
      } else {
        const level = route.critical ? 'error' : 'warning';
        this.log(`${route.critical ? '❌' : '⚠️'} ${route.name}: FALHOU (${result.status || 'ERROR'})`, level);
        if (result.error) {
          this.log(`   Erro: ${result.error}`, level);
        }
      }
    }
    
    return true;
  }

  generateReport() {
    console.log('\n' + '='.repeat(60));
    console.log(`${colors.bright}${colors.cyan}📊 RELATÓRIO DE TESTE DE ROTAS${colors.reset}`);
    console.log('='.repeat(60));
    
    const successful = this.results.filter(r => r.success);
    const failed = this.results.filter(r => !r.success);
    const criticalFailed = failed.filter(r => r.critical);
    
    console.log(`\n${colors.green}✅ Rotas funcionando: ${successful.length}/${this.results.length}${colors.reset}`);
    
    if (successful.length > 0) {
      console.log(`\n${colors.green}${colors.bright}🟢 ROTAS OK:${colors.reset}`);
      successful.forEach(route => {
        const sizeKB = (route.size / 1024).toFixed(1);
        console.log(`  ${colors.green}✓ ${route.path} - ${route.name} (${sizeKB}KB)${colors.reset}`);
      });
    }
    
    if (failed.length > 0) {
      console.log(`\n${colors.red}${colors.bright}🔴 ROTAS COM PROBLEMA:${colors.reset}`);
      failed.forEach(route => {
        const color = route.critical ? colors.red : colors.yellow;
        const icon = route.critical ? '❌' : '⚠️';
        console.log(`  ${color}${icon} ${route.path} - ${route.name} (Status: ${route.status || 'ERROR'})${colors.reset}`);
        if (route.error) {
          console.log(`    ${color}   Erro: ${route.error}${colors.reset}`);
        }
      });
    }
    
    console.log('\n' + '='.repeat(60));
    
    if (criticalFailed.length === 0) {
      console.log(`${colors.green}${colors.bright}🎉 ROTAS CRÍTICAS APROVADAS!${colors.reset}`);
      if (failed.length > 0) {
        console.log(`${colors.yellow}   Algumas rotas opcionais falharam, mas sistema funcional.${colors.reset}`);
      }
      return true;
    } else {
      console.log(`${colors.red}${colors.bright}💥 ROTAS CRÍTICAS FALHARAM! Sistema pode não funcionar corretamente.${colors.reset}`);
      return false;
    }
  }

  async run() {
    console.log(`${colors.cyan}${colors.bright}🌍 Iniciando teste de rotas AutoV7...${colors.reset}\n`);
    
    const testsRan = await this.runTests();
    if (!testsRan) {
      process.exit(1);
    }
    
    const success = this.generateReport();
    
    console.log(`\n${colors.blue}💡 Dicas:${colors.reset}`);
    console.log(`${colors.blue}   - Certifique-se de que 'npm run dev' está rodando${colors.reset}`);
    console.log(`${colors.blue}   - Acesse http://localhost:3000 para testar manualmente${colors.reset}`);
    console.log(`${colors.blue}   - Use 'npm run test:complete' para teste completo${colors.reset}`);
    
    process.exit(success ? 0 : 1);
  }
}

// Executar teste
const tester = new RoutesTester();
tester.run().catch(error => {
  console.error(`${colors.red}Erro fatal no teste de rotas: ${error.message}${colors.reset}`);
  process.exit(1);
});
