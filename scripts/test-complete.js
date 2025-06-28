#!/usr/bin/env node

const { spawn } = require('child_process');
const path = require('path');

// Cores para console
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
  magenta: '\x1b[35m'
};

class CompleteTester {
  constructor() {
    this.steps = [
      { name: 'Lint', command: 'npm', args: ['run', 'lint'], critical: false },
      { name: 'Build', command: 'npm', args: ['run', 'build'], critical: true },
      { name: 'System Test', command: 'node', args: ['scripts/test-system.js'], critical: true }
    ];
    this.results = [];
  }

  log(message, type = 'info') {
    const timestamp = new Date().toLocaleTimeString();
    const color = {
      success: colors.green,
      error: colors.red,
      warning: colors.yellow,
      info: colors.blue,
      step: colors.cyan
    }[type] || colors.reset;
    
    console.log(`${color}[${timestamp}] ${message}${colors.reset}`);
  }

  async runCommand(step) {
    return new Promise((resolve) => {
      this.log(`🚀 Executando: ${step.name}`, 'step');
      
      const process = spawn(step.command, step.args, {
        stdio: 'pipe',
        shell: true,
        cwd: path.resolve(__dirname, '..')
      });
      
      let stdout = '';
      let stderr = '';
      
      process.stdout.on('data', (data) => {
        stdout += data.toString();
      });
      
      process.stderr.on('data', (data) => {
        stderr += data.toString();
      });
      
      process.on('close', (code) => {
        const result = {
          ...step,
          success: code === 0,
          code,
          stdout,
          stderr,
          duration: Date.now()
        };
        
        resolve(result);
      });
      
      process.on('error', (error) => {
        resolve({
          ...step,
          success: false,
          code: -1,
          error: error.message,
          duration: Date.now()
        });
      });
    });
  }

  async runAllTests() {
    console.log(`${colors.cyan}${colors.bright}🧪 Iniciando teste completo do sistema AutoV7...${colors.reset}\n`);
    
    for (const step of this.steps) {
      const startTime = Date.now();
      const result = await this.runCommand(step);
      result.duration = Date.now() - startTime;
      
      this.results.push(result);
      
      if (result.success) {
        this.log(`✅ ${step.name} concluído em ${(result.duration / 1000).toFixed(1)}s`, 'success');
      } else {
        const level = step.critical ? 'error' : 'warning';
        this.log(`${step.critical ? '❌' : '⚠️'} ${step.name} falhou (código: ${result.code})`, level);
        
        if (step.critical) {
          this.log('💥 Teste crítico falhou, parando execução...', 'error');
          break;
        }
      }
    }
  }

  showDetailedErrors() {
    const failedSteps = this.results.filter(r => !r.success);
    
    if (failedSteps.length > 0) {
      console.log(`\n${colors.red}${colors.bright}📋 DETALHES DOS ERROS:${colors.reset}`);
      
      failedSteps.forEach(step => {
        console.log(`\n${colors.red}❌ ${step.name}:${colors.reset}`);
        
        if (step.stderr) {
          console.log(`${colors.red}STDERR:${colors.reset}`);
          console.log(step.stderr.split('\n').slice(0, 10).join('\n')); // Primeiras 10 linhas
        }
        
        if (step.stdout && step.stdout.includes('error')) {
          console.log(`${colors.red}STDOUT (erros):${colors.reset}`);
          const errorLines = step.stdout.split('\n').filter(line => 
            line.toLowerCase().includes('error') || 
            line.toLowerCase().includes('failed') ||
            line.includes('✗')
          );
          console.log(errorLines.slice(0, 5).join('\n')); // Primeiros 5 erros
        }
      });
    }
  }

  generateReport() {
    console.log('\n' + '='.repeat(70));
    console.log(`${colors.bright}${colors.cyan}📊 RELATÓRIO COMPLETO DE TESTE DO SISTEMA${colors.reset}`);
    console.log('='.repeat(70));
    
    const successful = this.results.filter(r => r.success);
    const failed = this.results.filter(r => !r.success);
    const criticalFailed = failed.filter(r => r.critical);
    
    console.log(`\n${colors.bright}📈 RESUMO:${colors.reset}`);
    console.log(`  • Testes executados: ${this.results.length}/${this.steps.length}`);
    console.log(`  • Sucessos: ${colors.green}${successful.length}${colors.reset}`);
    console.log(`  • Falhas: ${colors.red}${failed.length}${colors.reset}`);
    console.log(`  • Falhas críticas: ${colors.red}${criticalFailed.length}${colors.reset}`);
    
    console.log(`\n${colors.bright}⏱️ TEMPOS DE EXECUÇÃO:${colors.reset}`);
    this.results.forEach(result => {
      const status = result.success ? `${colors.green}✓${colors.reset}` : `${colors.red}✗${colors.reset}`;
      const time = `${(result.duration / 1000).toFixed(1)}s`;
      console.log(`  ${status} ${result.name}: ${time}`);
    });
    
    // Mostrar detalhes dos erros se houver
    this.showDetailedErrors();
    
    console.log('\n' + '='.repeat(70));
    
    if (criticalFailed.length === 0) {
      console.log(`${colors.green}${colors.bright}🎉 SISTEMA APROVADO EM TODOS OS TESTES CRÍTICOS!${colors.reset}`);
      
      if (failed.length > 0) {
        console.log(`${colors.yellow}⚠️ Alguns testes opcionais falharam, mas sistema funcional.${colors.reset}`);
      } else {
        console.log(`${colors.green}🌟 Todos os testes passaram com sucesso!${colors.reset}`);
      }
      
      console.log(`\n${colors.cyan}🚀 Próximos passos:${colors.reset}`);
      console.log(`${colors.cyan}   1. Execute "npm run dev" para iniciar desenvolvimento${colors.reset}`);
      console.log(`${colors.cyan}   2. Acesse http://localhost:3000 para testar o sistema${colors.reset}`);
      console.log(`${colors.cyan}   3. Use "npm run test:routes" para testar as rotas${colors.reset}`);
      
      return true;
    } else {
      console.log(`${colors.red}${colors.bright}💥 SISTEMA COM PROBLEMAS CRÍTICOS!${colors.reset}`);
      console.log(`${colors.red}❌ Corrija os erros críticos antes de usar o sistema.${colors.reset}`);
      
      console.log(`\n${colors.yellow}🔧 Dicas para correção:${colors.reset}`);
      console.log(`${colors.yellow}   1. Verifique as mensagens de erro acima${colors.reset}`);
      console.log(`${colors.yellow}   2. Execute "npm install" se houver problemas de dependência${colors.reset}`);
      console.log(`${colors.yellow}   3. Verifique a sintaxe dos arquivos TypeScript/React${colors.reset}`);
      
      return false;
    }
  }

  async run() {
    console.log(`${colors.magenta}${colors.bright}╔════════════════════════════════════════════════════════════╗${colors.reset}`);
    console.log(`${colors.magenta}${colors.bright}║                    AUTOV7 SYSTEM TESTER                    ║${colors.reset}`);
    console.log(`${colors.magenta}${colors.bright}║              Teste completo do sistema                     ║${colors.reset}`);
    console.log(`${colors.magenta}${colors.bright}╚════════════════════════════════════════════════════════════╝${colors.reset}\n`);
    
    await this.runAllTests();
    const success = this.generateReport();
    
    process.exit(success ? 0 : 1);
  }
}

// Executar teste completo
const tester = new CompleteTester();
tester.run().catch(error => {
  console.error(`${colors.red}Erro fatal no teste completo: ${error.message}${colors.reset}`);
  process.exit(1);
});
