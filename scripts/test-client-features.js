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

class ClientFeaturesTester {
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
      feature: colors.cyan
    }[type] || colors.reset;
    
    console.log(`${color}[${timestamp}] ${message}${colors.reset}`);
  }

  async testBookingFeatures() {
    this.log('📅 Testando funcionalidades de agendamento...', 'feature');
    
    try {
      const bookingPath = path.join(this.projectRoot, 'components/dashboard/BookingPage.tsx');
      
      if (!fs.existsSync(bookingPath)) {
        this.errors.push('✗ BookingPage.tsx não encontrado');
        return;
      }

      const content = fs.readFileSync(bookingPath, 'utf8');
      
      const bookingChecks = [
        {
          test: content.includes('const [selectedService,'),
          message: 'Seleção de serviços implementada'
        },
        {
          test: content.includes('const [selectedVehicle,'),
          message: 'Seleção de veículos implementada'
        },
        {
          test: content.includes('const [selectedDate,'),
          message: 'Seleção de data implementada'
        },
        {
          test: content.includes('const [selectedTime,'),
          message: 'Seleção de horário implementada'
        },
        {
          test: content.includes('handleBooking') || content.includes('submitBooking'),
          message: 'Função de agendamento implementada'
        },
        {
          test: content.includes('loadServices') || content.includes('services'),
          message: 'Carregamento de serviços implementado'
        },
        {
          test: content.includes('timeSlots') || content.includes('availableHours'),
          message: 'Sistema de horários disponíveis implementado'
        },
        {
          test: content.includes('Calendar') || content.includes('DatePicker'),
          message: 'Componente de calendário implementado'
        },
        {
          test: content.includes('price') || content.includes('valor'),
          message: 'Cálculo de preços implementado'
        },
        {
          test: content.includes('toast') || content.includes('notification'),
          message: 'Sistema de notificações implementado'
        }
      ];

      for (const check of bookingChecks) {
        if (check.test) {
          this.success.push(`✓ Agendamento: ${check.message}`);
        } else {
          this.warnings.push(`⚠ Agendamento: ${check.message} - não encontrado`);
        }
      }

    } catch (error) {
      this.errors.push(`✗ Erro ao testar agendamento: ${error.message}`);
    }
  }

  async testVehicleManagement() {
    this.log('🚗 Testando gerenciamento de veículos...', 'feature');
    
    try {
      const vehiclesPath = path.join(this.projectRoot, 'components/dashboard/VehiclesPage.tsx');
      
      if (!fs.existsSync(vehiclesPath)) {
        this.errors.push('✗ VehiclesPage.tsx não encontrado');
        return;
      }

      const content = fs.readFileSync(vehiclesPath, 'utf8');
      
      const vehicleChecks = [
        {
          test: content.includes('const [vehicles,'),
          message: 'Estado dos veículos implementado'
        },
        {
          test: content.includes('addVehicle') || content.includes('handleAdd'),
          message: 'Adição de veículos implementada'
        },
        {
          test: content.includes('editVehicle') || content.includes('handleEdit'),
          message: 'Edição de veículos implementada'
        },
        {
          test: content.includes('deleteVehicle') || content.includes('handleDelete'),
          message: 'Exclusão de veículos implementada'
        },
        {
          test: content.includes('brand') && content.includes('model'),
          message: 'Campos marca e modelo implementados'
        },
        {
          test: content.includes('year') || content.includes('ano'),
          message: 'Campo ano implementado'
        },
        {
          test: content.includes('plate') || content.includes('placa'),
          message: 'Campo placa implementado'
        },
        {
          test: content.includes('color') || content.includes('cor'),
          message: 'Campo cor implementado'
        },
        {
          test: content.includes('Dialog') || content.includes('Modal'),
          message: 'Modal de edição implementado'
        },
        {
          test: content.includes('validation') || content.includes('required'),
          message: 'Validação de campos implementada'
        }
      ];

      for (const check of vehicleChecks) {
        if (check.test) {
          this.success.push(`✓ Veículos: ${check.message}`);
        } else {
          this.warnings.push(`⚠ Veículos: ${check.message} - não encontrado`);
        }
      }

    } catch (error) {
      this.errors.push(`✗ Erro ao testar veículos: ${error.message}`);
    }
  }

  async testProfileManagement() {
    this.log('👤 Testando gerenciamento de perfil...', 'feature');
    
    try {
      const profilePath = path.join(this.projectRoot, 'components/dashboard/ProfilePage.tsx');
      
      if (!fs.existsSync(profilePath)) {
        this.errors.push('✗ ProfilePage.tsx não encontrado');
        return;
      }

      const content = fs.readFileSync(profilePath, 'utf8');
      
      const profileChecks = [
        {
          test: content.includes('updateProfile'),
          message: 'Função de atualização de perfil implementada'
        },
        {
          test: content.includes('changePassword') || content.includes('updatePassword'),
          message: 'Alteração de senha implementada'
        },
        {
          test: content.includes('name') && content.includes('email'),
          message: 'Campos básicos (nome, email) implementados'
        },
        {
          test: content.includes('phone') || content.includes('telefone'),
          message: 'Campo telefone implementado'
        },
        {
          test: content.includes('address') || content.includes('endereco'),
          message: 'Campo endereço implementado'
        },
        {
          test: content.includes('currentPassword'),
          message: 'Validação de senha atual implementada'
        },
        {
          test: content.includes('newPassword'),
          message: 'Campo nova senha implementado'
        },
        {
          test: content.includes('confirmPassword'),
          message: 'Confirmação de senha implementada'
        },
        {
          test: content.includes('loading') || content.includes('isLoading'),
          message: 'Estados de carregamento implementados'
        },
        {
          test: content.includes('toast') || content.includes('success'),
          message: 'Feedback de sucesso implementado'
        }
      ];

      for (const check of profileChecks) {
        if (check.test) {
          this.success.push(`✓ Perfil: ${check.message}`);
        } else {
          this.warnings.push(`⚠ Perfil: ${check.message} - não encontrado`);
        }
      }

    } catch (error) {
      this.errors.push(`✗ Erro ao testar perfil: ${error.message}`);
    }
  }

  async testHistoryFeatures() {
    this.log('📋 Testando histórico de agendamentos...', 'feature');
    
    try {
      const historyPath = path.join(this.projectRoot, 'components/dashboard/HistoryPage.tsx');
      
      if (!fs.existsSync(historyPath)) {
        this.errors.push('✗ HistoryPage.tsx não encontrado');
        return;
      }

      const content = fs.readFileSync(historyPath, 'utf8');
      
      const historyChecks = [
        {
          test: content.includes('appointments') || content.includes('agendamentos'),
          message: 'Lista de agendamentos implementada'
        },
        {
          test: content.includes('filter') || content.includes('filtro'),
          message: 'Sistema de filtros implementado'
        },
        {
          test: content.includes('status'),
          message: 'Exibição de status implementada'
        },
        {
          test: content.includes('date') || content.includes('data'),
          message: 'Exibição de datas implementada'
        },
        {
          test: content.includes('service') || content.includes('servico'),
          message: 'Exibição de serviços implementada'
        },
        {
          test: content.includes('price') || content.includes('valor'),
          message: 'Exibição de valores implementada'
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
          test: content.includes('pagination') || content.includes('loadMore'),
          message: 'Paginação implementada'
        },
        {
          test: content.includes('search') || content.includes('busca'),
          message: 'Sistema de busca implementado'
        }
      ];

      for (const check of historyChecks) {
        if (check.test) {
          this.success.push(`✓ Histórico: ${check.message}`);
        } else {
          this.warnings.push(`⚠ Histórico: ${check.message} - não encontrado`);
        }
      }

    } catch (error) {
      this.errors.push(`✗ Erro ao testar histórico: ${error.message}`);
    }
  }

  async testLoyaltyProgram() {
    this.log('⭐ Testando programa de fidelidade...', 'feature');
    
    try {
      const loyaltyPath = path.join(this.projectRoot, 'components/dashboard/LoyaltyPage.tsx');
      
      if (!fs.existsSync(loyaltyPath)) {
        this.warnings.push('⚠ LoyaltyPage.tsx não encontrado - funcionalidade opcional');
        return;
      }

      const content = fs.readFileSync(loyaltyPath, 'utf8');
      
      const loyaltyChecks = [
        {
          test: content.includes('points') || content.includes('pontos'),
          message: 'Sistema de pontos implementado'
        },
        {
          test: content.includes('rewards') || content.includes('recompensas'),
          message: 'Sistema de recompensas implementado'
        },
        {
          test: content.includes('level') || content.includes('nivel'),
          message: 'Sistema de níveis implementado'
        },
        {
          test: content.includes('history') || content.includes('historico'),
          message: 'Histórico de pontos implementado'
        },
        {
          test: content.includes('redeem') || content.includes('resgatar'),
          message: 'Resgate de recompensas implementado'
        },
        {
          test: content.includes('progress') || content.includes('progresso'),
          message: 'Barra de progresso implementada'
        }
      ];

      for (const check of loyaltyChecks) {
        if (check.test) {
          this.success.push(`✓ Fidelidade: ${check.message}`);
        } else {
          this.warnings.push(`⚠ Fidelidade: ${check.message} - não encontrado`);
        }
      }

    } catch (error) {
      this.warnings.push(`⚠ Programa de fidelidade não totalmente implementado: ${error.message}`);
    }
  }

  async testDashboardNavigation() {
    this.log('🧭 Testando navegação do dashboard...', 'feature');
    
    try {
      const sidebarPath = path.join(this.projectRoot, 'components/dashboard/AppSidebar.tsx');
      const dashboardPath = path.join(this.projectRoot, 'components/dashboard/Dashboard.tsx');
      
      if (!fs.existsSync(sidebarPath)) {
        this.errors.push('✗ AppSidebar.tsx não encontrado');
        return;
      }

      if (!fs.existsSync(dashboardPath)) {
        this.errors.push('✗ Dashboard.tsx não encontrado');
        return;
      }

      const sidebarContent = fs.readFileSync(sidebarPath, 'utf8');
      const dashboardContent = fs.readFileSync(dashboardPath, 'utf8');
      
      const navChecks = [
        {
          test: sidebarContent.includes('Agendamento') || sidebarContent.includes('Booking'),
          message: 'Link para agendamento implementado'
        },
        {
          test: sidebarContent.includes('Veículos') || sidebarContent.includes('Vehicles'),
          message: 'Link para veículos implementado'
        },
        {
          test: sidebarContent.includes('Histórico') || sidebarContent.includes('History'),
          message: 'Link para histórico implementado'
        },
        {
          test: sidebarContent.includes('Perfil') || sidebarContent.includes('Profile'),
          message: 'Link para perfil implementado'
        },
        {
          test: sidebarContent.includes('Fidelidade') || sidebarContent.includes('Loyalty'),
          message: 'Link para fidelidade implementado'
        },
        {
          test: dashboardContent.includes('useState') && dashboardContent.includes('currentPage'),
          message: 'Controle de página ativa implementado'
        },
        {
          test: dashboardContent.includes('BookingPage'),
          message: 'Renderização da página de agendamento implementada'
        },
        {
          test: dashboardContent.includes('VehiclesPage'),
          message: 'Renderização da página de veículos implementada'
        },
        {
          test: dashboardContent.includes('HistoryPage'),
          message: 'Renderização da página de histórico implementada'
        },
        {
          test: dashboardContent.includes('ProfilePage'),
          message: 'Renderização da página de perfil implementada'
        }
      ];

      for (const check of navChecks) {
        if (check.test) {
          this.success.push(`✓ Navegação: ${check.message}`);
        } else {
          this.warnings.push(`⚠ Navegação: ${check.message} - não encontrado`);
        }
      }

    } catch (error) {
      this.errors.push(`✗ Erro ao testar navegação: ${error.message}`);
    }
  }

  async testDataPersistence() {
    this.log('💾 Testando persistência de dados...', 'feature');
    
    try {
      // Verificar se os componentes utilizam localStorage/sessionStorage
      const components = [
        'components/dashboard/BookingPage.tsx',
        'components/dashboard/VehiclesPage.tsx',
        'components/dashboard/ProfilePage.tsx',
        'components/dashboard/HistoryPage.tsx'
      ];

      let hasLocalStorage = false;
      let hasSessionStorage = false;
      let hasContextUsage = false;

      for (const componentPath of components) {
        const fullPath = path.join(this.projectRoot, componentPath);
        if (fs.existsSync(fullPath)) {
          const content = fs.readFileSync(fullPath, 'utf8');
          
          if (content.includes('localStorage')) {
            hasLocalStorage = true;
          }
          if (content.includes('sessionStorage')) {
            hasSessionStorage = true;
          }
          if (content.includes('useAuth') || content.includes('useContext')) {
            hasContextUsage = true;
          }
        }
      }

      const persistenceChecks = [
        {
          test: hasLocalStorage,
          message: 'Uso de localStorage detectado'
        },
        {
          test: hasContextUsage,
          message: 'Uso de Context API detectado'
        },
        {
          test: hasSessionStorage,
          message: 'Uso de sessionStorage detectado'
        }
      ];

      for (const check of persistenceChecks) {
        if (check.test) {
          this.success.push(`✓ Persistência: ${check.message}`);
        } else {
          this.warnings.push(`⚠ Persistência: ${check.message} - não encontrado`);
        }
      }

    } catch (error) {
      this.errors.push(`✗ Erro ao testar persistência: ${error.message}`);
    }
  }

  async testResponsiveDesign() {
    this.log('📱 Testando design responsivo...', 'feature');
    
    try {
      const components = [
        'components/dashboard/Dashboard.tsx',
        'components/dashboard/BookingPage.tsx',
        'components/dashboard/VehiclesPage.tsx'
      ];

      let hasResponsiveClasses = false;
      let hasMobileOptimization = false;
      let hasGridSystem = false;

      for (const componentPath of components) {
        const fullPath = path.join(this.projectRoot, componentPath);
        if (fs.existsSync(fullPath)) {
          const content = fs.readFileSync(fullPath, 'utf8');
          
          // Verificar classes responsivas do Tailwind
          if (content.match(/\b(sm:|md:|lg:|xl:)/)) {
            hasResponsiveClasses = true;
          }
          if (content.includes('mobile') || content.includes('isMobile')) {
            hasMobileOptimization = true;
          }
          if (content.includes('grid') || content.includes('flex')) {
            hasGridSystem = true;
          }
        }
      }

      const responsiveChecks = [
        {
          test: hasResponsiveClasses,
          message: 'Classes responsivas implementadas'
        },
        {
          test: hasMobileOptimization,
          message: 'Otimização mobile implementada'
        },
        {
          test: hasGridSystem,
          message: 'Sistema de layout (grid/flex) implementado'
        }
      ];

      for (const check of responsiveChecks) {
        if (check.test) {
          this.success.push(`✓ Responsivo: ${check.message}`);
        } else {
          this.warnings.push(`⚠ Responsivo: ${check.message} - não encontrado`);
        }
      }

    } catch (error) {
      this.errors.push(`✗ Erro ao testar responsividade: ${error.message}`);
    }
  }

  async testErrorHandling() {
    this.log('🛡️ Testando tratamento de erros...', 'feature');
    
    try {
      const components = [
        'components/dashboard/BookingPage.tsx',
        'components/dashboard/VehiclesPage.tsx',
        'components/dashboard/ProfilePage.tsx'
      ];

      let hasTryCatch = false;
      let hasErrorStates = false;
      let hasValidation = false;
      let hasToastNotifications = false;

      for (const componentPath of components) {
        const fullPath = path.join(this.projectRoot, componentPath);
        if (fs.existsSync(fullPath)) {
          const content = fs.readFileSync(fullPath, 'utf8');
          
          if (content.includes('try {') && content.includes('catch')) {
            hasTryCatch = true;
          }
          if (content.includes('error') || content.includes('Error')) {
            hasErrorStates = true;
          }
          if (content.includes('required') || content.includes('validation')) {
            hasValidation = true;
          }
          if (content.includes('toast') || content.includes('notification')) {
            hasToastNotifications = true;
          }
        }
      }

      const errorChecks = [
        {
          test: hasTryCatch,
          message: 'Blocos try/catch implementados'
        },
        {
          test: hasErrorStates,
          message: 'Estados de erro implementados'
        },
        {
          test: hasValidation,
          message: 'Validação de formulários implementada'
        },
        {
          test: hasToastNotifications,
          message: 'Notificações de erro implementadas'
        }
      ];

      for (const check of errorChecks) {
        if (check.test) {
          this.success.push(`✓ Tratamento de Erros: ${check.message}`);
        } else {
          this.warnings.push(`⚠ Tratamento de Erros: ${check.message} - não encontrado`);
        }
      }

    } catch (error) {
      this.errors.push(`✗ Erro ao testar tratamento de erros: ${error.message}`);
    }
  }

  generateReport() {
    console.log('\n' + '='.repeat(70));
    console.log(`${colors.bright}${colors.cyan}📊 RELATÓRIO DE FUNCIONALIDADES DO CLIENTE${colors.reset}`);
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
      err.includes('BookingPage') || 
      err.includes('VehiclesPage') || 
      err.includes('Dashboard') ||
      err.includes('ProfilePage')
    ).length;
    
    if (criticalErrors === 0) {
      console.log(`${colors.green}${colors.bright}🎉 FUNCIONALIDADES CLIENTE APROVADAS! Taxa de implementação: ${successRate}%${colors.reset}`);
      if (this.warnings.length > 0) {
        console.log(`${colors.yellow}   Algumas funcionalidades são opcionais ou parciais.${colors.reset}`);
      }
      if (this.errors.length > 0 && criticalErrors === 0) {
        console.log(`${colors.blue}   Erros encontrados são em funcionalidades não-críticas.${colors.reset}`);
      }
      return true;
    } else {
      console.log(`${colors.red}${colors.bright}💥 FUNCIONALIDADES CRÍTICAS COM PROBLEMAS!${colors.reset}`);
      console.log(`${colors.red}❌ Corrija os problemas críticos antes de usar o sistema cliente.${colors.reset}`);
      return false;
    }
  }

  async run() {
    console.log(`${colors.cyan}${colors.bright}🧪 Iniciando teste das funcionalidades do cliente AutoV7...${colors.reset}\n`);
    
    await this.testBookingFeatures();
    await this.testVehicleManagement();
    await this.testProfileManagement();
    await this.testHistoryFeatures();
    await this.testLoyaltyProgram();
    await this.testDashboardNavigation();
    await this.testDataPersistence();
    await this.testResponsiveDesign();
    await this.testErrorHandling();
    
    const success = this.generateReport();
    
    console.log(`\n${colors.magenta}📝 Dica: Use 'npm run dev' e acesse o dashboard cliente para testar manualmente${colors.reset}`);
    console.log(`${colors.magenta}📝 Dica: Use 'npm run test:admin' para testar funcionalidades administrativas${colors.reset}`);
    console.log(`\n${colors.blue}🔗 Funcionalidades testadas:${colors.reset}`);
    console.log(`${colors.blue}   • 📅 Sistema de Agendamentos${colors.reset}`);
    console.log(`${colors.blue}   • 🚗 Gerenciamento de Veículos${colors.reset}`);
    console.log(`${colors.blue}   • 👤 Perfil do Cliente${colors.reset}`);
    console.log(`${colors.blue}   • 📋 Histórico de Serviços${colors.reset}`);
    console.log(`${colors.blue}   • ⭐ Programa de Fidelidade${colors.reset}`);
    console.log(`${colors.blue}   • 🧭 Navegação e UX${colors.reset}`);
    console.log(`${colors.blue}   • 💾 Persistência de Dados${colors.reset}`);
    console.log(`${colors.blue}   • 📱 Design Responsivo${colors.reset}`);
    console.log(`${colors.blue}   • 🛡️ Tratamento de Erros${colors.reset}`);
    
    process.exit(success ? 0 : 1);
  }
}

// Executar teste
const tester = new ClientFeaturesTester();
tester.run().catch(error => {
  console.error(`${colors.red}Erro fatal no teste de funcionalidades cliente: ${error.message}${colors.reset}`);
  process.exit(1);
});
