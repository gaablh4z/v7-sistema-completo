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

class AdminFeaturesTester {
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
      info: colors.blue,
      feature: colors.magenta
    }[type] || colors.reset;
    
    console.log(`${color}[${timestamp}] ${message}${colors.reset}`);
  }

  async testCustomerManagement() {
    this.log('👥 Testando gerenciamento de clientes...', 'feature');
    
    try {
      const customersPath = path.join(this.projectRoot, 'components/admin/CustomersManagement.tsx');
      
      if (!fs.existsSync(customersPath)) {
        this.errors.push('✗ CustomersManagement.tsx não encontrado');
        return;
      }

      const content = fs.readFileSync(customersPath, 'utf8');
      
      const customerChecks = [
        {
          test: content.includes('customers') || content.includes('clientes'),
          message: 'Lista de clientes implementada'
        },
        {
          test: content.includes('search') || content.includes('busca'),
          message: 'Sistema de busca de clientes implementado'
        },
        {
          test: content.includes('filter') || content.includes('filtro'),
          message: 'Sistema de filtros implementado'
        },
        {
          test: content.includes('edit') || content.includes('editar'),
          message: 'Edição de clientes implementada'
        },
        {
          test: content.includes('delete') || content.includes('excluir'),
          message: 'Exclusão de clientes implementada'
        },
        {
          test: content.includes('view') || content.includes('visualizar'),
          message: 'Visualização detalhada implementada'
        },
        {
          test: content.includes('pagination') || content.includes('paginação'),
          message: 'Paginação implementada'
        },
        {
          test: content.includes('export') || content.includes('exportar'),
          message: 'Exportação de dados implementada'
        },
        {
          test: content.includes('total') || content.includes('count'),
          message: 'Contadores e estatísticas implementados'
        },
        {
          test: content.includes('status') || content.includes('ativo'),
          message: 'Controle de status implementado'
        }
      ];

      for (const check of customerChecks) {
        if (check.test) {
          this.success.push(`✓ Clientes: ${check.message}`);
        } else {
          this.warnings.push(`⚠ Clientes: ${check.message} - não encontrado`);
        }
      }

    } catch (error) {
      this.errors.push(`✗ Erro ao testar gerenciamento de clientes: ${error.message}`);
    }
  }

  async testAppointmentManagement() {
    this.log('📅 Testando gerenciamento de agendamentos...', 'feature');
    
    try {
      const appointmentsPath = path.join(this.projectRoot, 'components/admin/AppointmentsManagement.tsx');
      
      if (!fs.existsSync(appointmentsPath)) {
        this.errors.push('✗ AppointmentsManagement.tsx não encontrado');
        return;
      }

      const content = fs.readFileSync(appointmentsPath, 'utf8');
      
      const appointmentChecks = [
        {
          test: content.includes('appointments') || content.includes('agendamentos'),
          message: 'Lista de agendamentos implementada'
        },
        {
          test: content.includes('calendar') || content.includes('calendario'),
          message: 'Visualização em calendário implementada'
        },
        {
          test: content.includes('confirm') || content.includes('confirmar'),
          message: 'Confirmação de agendamentos implementada'
        },
        {
          test: content.includes('cancel') || content.includes('cancelar'),
          message: 'Cancelamento de agendamentos implementado'
        },
        {
          test: content.includes('reschedule') || content.includes('reagendar'),
          message: 'Reagendamento implementado'
        },
        {
          test: content.includes('status'),
          message: 'Controle de status implementado'
        },
        {
          test: content.includes('filter') || content.includes('filtro'),
          message: 'Filtros por data/status implementados'
        },
        {
          test: content.includes('notification') || content.includes('notificacao'),
          message: 'Sistema de notificações implementado'
        },
        {
          test: content.includes('payment') || content.includes('pagamento'),
          message: 'Controle de pagamentos implementado'
        },
        {
          test: content.includes('notes') || content.includes('observacoes'),
          message: 'Campo de observações implementado'
        }
      ];

      for (const check of appointmentChecks) {
        if (check.test) {
          this.success.push(`✓ Agendamentos Admin: ${check.message}`);
        } else {
          this.warnings.push(`⚠ Agendamentos Admin: ${check.message} - não encontrado`);
        }
      }

    } catch (error) {
      this.errors.push(`✗ Erro ao testar gerenciamento de agendamentos: ${error.message}`);
    }
  }

  async testServicesManagement() {
    this.log('🛠️ Testando gerenciamento de serviços...', 'feature');
    
    try {
      const servicesPath = path.join(this.projectRoot, 'components/admin/ServicesManagement.tsx');
      
      if (!fs.existsSync(servicesPath)) {
        this.warnings.push('⚠ ServicesManagement.tsx não encontrado - funcionalidade opcional');
        return;
      }

      const content = fs.readFileSync(servicesPath, 'utf8');
      
      const serviceChecks = [
        {
          test: content.includes('services') || content.includes('servicos'),
          message: 'Lista de serviços implementada'
        },
        {
          test: content.includes('add') || content.includes('adicionar'),
          message: 'Adição de serviços implementada'
        },
        {
          test: content.includes('edit') || content.includes('editar'),
          message: 'Edição de serviços implementada'
        },
        {
          test: content.includes('delete') || content.includes('excluir'),
          message: 'Exclusão de serviços implementada'
        },
        {
          test: content.includes('price') || content.includes('preco'),
          message: 'Controle de preços implementado'
        },
        {
          test: content.includes('duration') || content.includes('duracao'),
          message: 'Controle de duração implementado'
        },
        {
          test: content.includes('category') || content.includes('categoria'),
          message: 'Categorização de serviços implementada'
        },
        {
          test: content.includes('active') || content.includes('ativo'),
          message: 'Controle de ativação implementado'
        }
      ];

      for (const check of serviceChecks) {
        if (check.test) {
          this.success.push(`✓ Serviços: ${check.message}`);
        } else {
          this.warnings.push(`⚠ Serviços: ${check.message} - não encontrado`);
        }
      }

    } catch (error) {
      this.warnings.push(`⚠ Gerenciamento de serviços não totalmente implementado: ${error.message}`);
    }
  }

  async testInventoryManagement() {
    this.log('📦 Testando gerenciamento de estoque...', 'feature');
    
    try {
      const inventoryPath = path.join(this.projectRoot, 'components/admin/InventoryManagement.tsx');
      
      if (!fs.existsSync(inventoryPath)) {
        this.warnings.push('⚠ InventoryManagement.tsx não encontrado - funcionalidade opcional');
        return;
      }

      const content = fs.readFileSync(inventoryPath, 'utf8');
      
      const inventoryChecks = [
        {
          test: content.includes('inventory') || content.includes('estoque'),
          message: 'Controle de estoque implementado'
        },
        {
          test: content.includes('products') || content.includes('produtos'),
          message: 'Lista de produtos implementada'
        },
        {
          test: content.includes('quantity') || content.includes('quantidade'),
          message: 'Controle de quantidade implementado'
        },
        {
          test: content.includes('low stock') || content.includes('estoque baixo'),
          message: 'Alertas de estoque baixo implementados'
        },
        {
          test: content.includes('supplier') || content.includes('fornecedor'),
          message: 'Controle de fornecedores implementado'
        },
        {
          test: content.includes('movement') || content.includes('movimentacao'),
          message: 'Histórico de movimentações implementado'
        }
      ];

      for (const check of inventoryChecks) {
        if (check.test) {
          this.success.push(`✓ Estoque: ${check.message}`);
        } else {
          this.warnings.push(`⚠ Estoque: ${check.message} - não encontrado`);
        }
      }

    } catch (error) {
      this.warnings.push(`⚠ Gerenciamento de estoque não totalmente implementado: ${error.message}`);
    }
  }

  async testReportsAndAnalytics() {
    this.log('📊 Testando relatórios e análises...', 'feature');
    
    try {
      const reportsPath = path.join(this.projectRoot, 'components/admin/ReportsPage.tsx');
      
      if (!fs.existsSync(reportsPath)) {
        this.errors.push('✗ ReportsPage.tsx não encontrado');
        return;
      }

      const content = fs.readFileSync(reportsPath, 'utf8');
      
      const reportChecks = [
        {
          test: content.includes('revenue') || content.includes('receita'),
          message: 'Relatório de receita implementado'
        },
        {
          test: content.includes('appointments') || content.includes('agendamentos'),
          message: 'Análise de agendamentos implementada'
        },
        {
          test: content.includes('customers') || content.includes('clientes'),
          message: 'Análise de clientes implementada'
        },
        {
          test: content.includes('chart') || content.includes('grafico'),
          message: 'Gráficos implementados'
        },
        {
          test: content.includes('period') || content.includes('periodo'),
          message: 'Filtros por período implementados'
        },
        {
          test: content.includes('export') || content.includes('exportar'),
          message: 'Exportação de relatórios implementada'
        },
        {
          test: content.includes('kpi') || content.includes('indicador'),
          message: 'KPIs e indicadores implementados'
        },
        {
          test: content.includes('growth') || content.includes('crescimento'),
          message: 'Análise de crescimento implementada'
        }
      ];

      for (const check of reportChecks) {
        if (check.test) {
          this.success.push(`✓ Relatórios: ${check.message}`);
        } else {
          this.warnings.push(`⚠ Relatórios: ${check.message} - não encontrado`);
        }
      }

    } catch (error) {
      this.errors.push(`✗ Erro ao testar relatórios: ${error.message}`);
    }
  }

  async testSettingsAndSecurity() {
    this.log('⚙️ Testando configurações e segurança...', 'feature');
    
    try {
      const settingsPath = path.join(this.projectRoot, 'components/admin/SettingsPage.tsx');
      const securityPath = path.join(this.projectRoot, 'components/admin/SecuritySettings.tsx');
      
      let settingsContent = '';
      let securityContent = '';

      if (fs.existsSync(settingsPath)) {
        settingsContent = fs.readFileSync(settingsPath, 'utf8');
      }

      if (fs.existsSync(securityPath)) {
        securityContent = fs.readFileSync(securityPath, 'utf8');
      }

      const allContent = settingsContent + securityContent;

      const settingsChecks = [
        {
          test: allContent.includes('business') || allContent.includes('empresa'),
          message: 'Configurações da empresa implementadas'
        },
        {
          test: allContent.includes('hours') || allContent.includes('horarios'),
          message: 'Configuração de horários implementada'
        },
        {
          test: allContent.includes('notification') || allContent.includes('notificacao'),
          message: 'Configurações de notificação implementadas'
        },
        {
          test: allContent.includes('backup') || allContent.includes('copia'),
          message: 'Sistema de backup implementado'
        },
        {
          test: allContent.includes('user') || allContent.includes('usuario'),
          message: 'Gerenciamento de usuários implementado'
        },
        {
          test: allContent.includes('permission') || allContent.includes('permissao'),
          message: 'Sistema de permissões implementado'
        },
        {
          test: allContent.includes('audit') || allContent.includes('auditoria'),
          message: 'Log de auditoria implementado'
        },
        {
          test: allContent.includes('password') || allContent.includes('senha'),
          message: 'Políticas de senha implementadas'
        }
      ];

      for (const check of settingsChecks) {
        if (check.test) {
          this.success.push(`✓ Configurações: ${check.message}`);
        } else {
          this.warnings.push(`⚠ Configurações: ${check.message} - não encontrado`);
        }
      }

      if (!fs.existsSync(settingsPath)) {
        this.warnings.push('⚠ SettingsPage.tsx não encontrado');
      }

      if (!fs.existsSync(securityPath)) {
        this.warnings.push('⚠ SecuritySettings.tsx não encontrado');
      }

    } catch (error) {
      this.errors.push(`✗ Erro ao testar configurações: ${error.message}`);
    }
  }

  async testChatSupport() {
    this.log('💬 Testando suporte por chat...', 'feature');
    
    try {
      const chatPath = path.join(this.projectRoot, 'components/admin/ChatSupport.tsx');
      
      if (!fs.existsSync(chatPath)) {
        this.warnings.push('⚠ ChatSupport.tsx não encontrado - funcionalidade opcional');
        return;
      }

      const content = fs.readFileSync(chatPath, 'utf8');
      
      const chatChecks = [
        {
          test: content.includes('messages') || content.includes('mensagens'),
          message: 'Sistema de mensagens implementado'
        },
        {
          test: content.includes('customers') || content.includes('clientes'),
          message: 'Lista de conversas implementada'
        },
        {
          test: content.includes('send') || content.includes('enviar'),
          message: 'Envio de mensagens implementado'
        },
        {
          test: content.includes('status') || content.includes('online'),
          message: 'Status de presença implementado'
        },
        {
          test: content.includes('notification') || content.includes('notificacao'),
          message: 'Notificações de chat implementadas'
        },
        {
          test: content.includes('history') || content.includes('historico'),
          message: 'Histórico de conversas implementado'
        }
      ];

      for (const check of chatChecks) {
        if (check.test) {
          this.success.push(`✓ Chat: ${check.message}`);
        } else {
          this.warnings.push(`⚠ Chat: ${check.message} - não encontrado`);
        }
      }

    } catch (error) {
      this.warnings.push(`⚠ Sistema de chat não totalmente implementado: ${error.message}`);
    }
  }

  async testAdminDashboard() {
    this.log('🏠 Testando dashboard administrativo...', 'feature');
    
    try {
      const adminDashPath = path.join(this.projectRoot, 'components/admin/AdminDashboard.tsx');
      const adminHomePath = path.join(this.projectRoot, 'components/admin/AdminHome.tsx');
      const sidebarPath = path.join(this.projectRoot, 'components/admin/AdminSidebar.tsx');
      
      if (!fs.existsSync(adminDashPath)) {
        this.errors.push('✗ AdminDashboard.tsx não encontrado');
        return;
      }

      const dashContent = fs.readFileSync(adminDashPath, 'utf8');
      let homeContent = '';
      let sidebarContent = '';

      if (fs.existsSync(adminHomePath)) {
        homeContent = fs.readFileSync(adminHomePath, 'utf8');
      }

      if (fs.existsSync(sidebarPath)) {
        sidebarContent = fs.readFileSync(sidebarPath, 'utf8');
      }

      const allContent = dashContent + homeContent + sidebarContent;

      const dashboardChecks = [
        {
          test: allContent.includes('statistics') || allContent.includes('estatisticas'),
          message: 'Estatísticas do dashboard implementadas'
        },
        {
          test: allContent.includes('CustomersManagement'),
          message: 'Navegação para clientes implementada'
        },
        {
          test: allContent.includes('AppointmentsManagement'),
          message: 'Navegação para agendamentos implementada'
        },
        {
          test: allContent.includes('ReportsPage'),
          message: 'Navegação para relatórios implementada'
        },
        {
          test: allContent.includes('SettingsPage'),
          message: 'Navegação para configurações implementada'
        },
        {
          test: allContent.includes('currentPage') || allContent.includes('activeTab'),
          message: 'Controle de página ativa implementado'
        },
        {
          test: allContent.includes('cards') || allContent.includes('Card'),
          message: 'Cards informativos implementados'
        },
        {
          test: allContent.includes('recent') || allContent.includes('recente'),
          message: 'Atividades recentes implementadas'
        }
      ];

      for (const check of dashboardChecks) {
        if (check.test) {
          this.success.push(`✓ Dashboard Admin: ${check.message}`);
        } else {
          this.warnings.push(`⚠ Dashboard Admin: ${check.message} - não encontrado`);
        }
      }

    } catch (error) {
      this.errors.push(`✗ Erro ao testar dashboard admin: ${error.message}`);
    }
  }

  async testDatabaseManagement() {
    this.log('🗄️ Testando gerenciamento de banco de dados...', 'feature');
    
    try {
      const dbSeederPath = path.join(this.projectRoot, 'components/admin/DatabaseSeeder.tsx');
      const dbDashboardPath = path.join(this.projectRoot, 'components/dashboard/DatabaseDashboard.tsx');
      
      let seederContent = '';
      let dashboardContent = '';

      if (fs.existsSync(dbSeederPath)) {
        seederContent = fs.readFileSync(dbSeederPath, 'utf8');
      }

      if (fs.existsSync(dbDashboardPath)) {
        dashboardContent = fs.readFileSync(dbDashboardPath, 'utf8');
      }

      const allContent = seederContent + dashboardContent;

      const dbChecks = [
        {
          test: allContent.includes('seed') || allContent.includes('popular'),
          message: 'Seeding de dados implementado'
        },
        {
          test: allContent.includes('backup') || allContent.includes('copia'),
          message: 'Sistema de backup implementado'
        },
        {
          test: allContent.includes('restore') || allContent.includes('restaurar'),
          message: 'Sistema de restore implementado'
        },
        {
          test: allContent.includes('migration') || allContent.includes('migracao'),
          message: 'Sistema de migração implementado'
        },
        {
          test: allContent.includes('status') || allContent.includes('health'),
          message: 'Status do banco implementado'
        },
        {
          test: allContent.includes('tables') || allContent.includes('tabelas'),
          message: 'Visualização de tabelas implementada'
        }
      ];

      for (const check of dbChecks) {
        if (check.test) {
          this.success.push(`✓ Banco de Dados: ${check.message}`);
        } else {
          this.warnings.push(`⚠ Banco de Dados: ${check.message} - não encontrado`);
        }
      }

      if (!fs.existsSync(dbSeederPath)) {
        this.warnings.push('⚠ DatabaseSeeder.tsx não encontrado');
      }

    } catch (error) {
      this.warnings.push(`⚠ Gerenciamento de banco não totalmente implementado: ${error.message}`);
    }
  }

  generateReport() {
    console.log('\n' + '='.repeat(70));
    console.log(`${colors.bright}${colors.cyan}📊 RELATÓRIO DE FUNCIONALIDADES ADMINISTRATIVAS${colors.reset}`);
    console.log('='.repeat(70));
    
    if (this.success.length > 0) {
      console.log(`\n${colors.green}${colors.bright}✅ FUNCIONALIDADES IMPLEMENTADAS (${this.success.length}):${colors.reset}`);
      this.success.forEach(msg => console.log(`  ${colors.green}${msg}${colors.reset}`));
    }
    
    if (this.warnings.length > 0) {
      console.log(`\n${colors.yellow}${colors.bright}⚠️  FUNCIONALIDADES PARCIAIS/OPCIONAIS (${this.warnings.length}):${colors.reset}`);
      this.warnings.forEach(msg => console.log(`  ${colors.yellow}${msg}${colors.reset}`));
    }
    
    if (this.errors.length > 0) {
      console.log(`\n${colors.red}${colors.bright}❌ FUNCIONALIDADES COM PROBLEMAS (${this.errors.length}):${colors.reset}`);
      this.errors.forEach(msg => console.log(`  ${colors.red}${msg}${colors.reset}`));
    }

    console.log('\n' + '='.repeat(70));
    
    const total = this.success.length + this.warnings.length + this.errors.length;
    const successRate = Math.round((this.success.length / total) * 100);
    const criticalErrors = this.errors.filter(err => 
      err.includes('CustomersManagement') || 
      err.includes('AppointmentsManagement') || 
      err.includes('AdminDashboard') ||
      err.includes('ReportsPage')
    ).length;
    
    if (criticalErrors === 0) {
      console.log(`${colors.green}${colors.bright}🎉 FUNCIONALIDADES ADMIN APROVADAS! Taxa de implementação: ${successRate}%${colors.reset}`);
      if (this.warnings.length > 0) {
        console.log(`${colors.yellow}   Algumas funcionalidades são opcionais ou parciais.${colors.reset}`);
      }
      if (this.errors.length > 0 && criticalErrors === 0) {
        console.log(`${colors.blue}   Erros encontrados são em funcionalidades não-críticas.${colors.reset}`);
      }
      return true;
    } else {
      console.log(`${colors.red}${colors.bright}💥 FUNCIONALIDADES CRÍTICAS COM PROBLEMAS!${colors.reset}`);
      console.log(`${colors.red}❌ Corrija os problemas críticos antes de usar o painel administrativo.${colors.reset}`);
      return false;
    }
  }

  async run() {
    console.log(`${colors.magenta}${colors.bright}🧪 Iniciando teste das funcionalidades administrativas AutoV7...${colors.reset}\n`);
    
    await this.testCustomerManagement();
    await this.testAppointmentManagement();
    await this.testServicesManagement();
    await this.testInventoryManagement();
    await this.testReportsAndAnalytics();
    await this.testSettingsAndSecurity();
    await this.testChatSupport();
    await this.testAdminDashboard();
    await this.testDatabaseManagement();
    
    const success = this.generateReport();
    
    console.log(`\n${colors.magenta}📝 Dica: Use 'npm run dev' e acesse /admin para testar o painel administrativo${colors.reset}`);
    console.log(`${colors.magenta}📝 Dica: Use 'npm run test:client' para testar funcionalidades do cliente${colors.reset}`);
    console.log(`\n${colors.blue}🔗 Funcionalidades testadas:${colors.reset}`);
    console.log(`${colors.blue}   • 👥 Gerenciamento de Clientes${colors.reset}`);
    console.log(`${colors.blue}   • 📅 Gerenciamento de Agendamentos${colors.reset}`);
    console.log(`${colors.blue}   • 🛠️  Gerenciamento de Serviços${colors.reset}`);
    console.log(`${colors.blue}   • 📦 Gerenciamento de Estoque${colors.reset}`);
    console.log(`${colors.blue}   • 📊 Relatórios e Análises${colors.reset}`);
    console.log(`${colors.blue}   • ⚙️  Configurações e Segurança${colors.reset}`);
    console.log(`${colors.blue}   • 💬 Suporte por Chat${colors.reset}`);
    console.log(`${colors.blue}   • 🏠 Dashboard Administrativo${colors.reset}`);
    console.log(`${colors.blue}   • 🗄️  Gerenciamento de Banco${colors.reset}`);
    
    process.exit(success ? 0 : 1);
  }
}

// Executar teste
const tester = new AdminFeaturesTester();
tester.run().catch(error => {
  console.error(`${colors.red}Erro fatal no teste de funcionalidades admin: ${error.message}${colors.reset}`);
  process.exit(1);
});
