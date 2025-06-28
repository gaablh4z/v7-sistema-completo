# 🧪 Sistema de Testes AutoV7

Este diretório contém scripts automatizados para testar todo o sistema AutoV7, incluindo funcionalidades de cliente e admin, detectando problemas antes mesmo de usar o navegador.

## 📋 Comandos Disponíveis

### 🚀 Teste Completo (Recomendado)
```bash
npm run test:complete
# ou
npm test
```
**Executa**: Lint → Build → Testes do Sistema
**Uso**: Teste base do sistema (estrutura, build, componentes)

### 🎯 Teste de Todas as Funcionalidades
```bash
npm run test:all
```
**Executa**: Teste Completo + Funcionalidades Cliente + Funcionalidades Admin
**Uso**: Teste completo de todo o sistema e suas funcionalidades

### 🔍 Testes de Funcionalidades

#### Funcionalidades do Cliente
```bash
npm run test:client
```
**Testa**:
- ✅ 📅 Sistema de Agendamentos
- ✅ 🚗 Gerenciamento de Veículos  
- ✅ 👤 Perfil do Cliente
- ✅ 📋 Histórico de Serviços
- ✅ ⭐ Programa de Fidelidade
- ✅ 🧭 Navegação e UX
- ✅ 💾 Persistência de Dados
- ✅ 📱 Design Responsivo
- ✅ 🛡️ Tratamento de Erros

#### Funcionalidades Administrativas
```bash
npm run test:admin
```
**Testa**:
- ✅ 👥 Gerenciamento de Clientes
- ✅ 📅 Gerenciamento de Agendamentos
- ✅ 🛠️ Gerenciamento de Serviços
- ✅ 📦 Gerenciamento de Estoque
- ✅ 📊 Relatórios e Análises
- ✅ ⚙️ Configurações e Segurança
- ✅ 💬 Suporte por Chat
- ✅ 🏠 Dashboard Administrativo
- ✅ 🗄️ Gerenciamento de Banco

#### Ambas as Funcionalidades
```bash
npm run test:features
```
**Executa**: test:client + test:admin

### 🔍 Testes Individuais

#### Teste do Sistema Base
```bash
npm run test:system
```
**Verifica**:
- ✅ Estrutura de arquivos e diretórios
- ✅ Imports e dependências
- ✅ Contexto de autenticação
- ✅ Rotas e páginas
- ✅ Componentes principais
- ✅ Saída do build

#### Teste de Rotas (Servidor Local)
```bash
npm run test:routes
```
**Verifica**:
- ✅ Servidor rodando em localhost:3000
- ✅ Todas as rotas respondendo
- ✅ Status HTTP das páginas
- ✅ Conteúdo básico das páginas

**⚠️ Requisito**: Execute `npm run dev` em outro terminal primeiro

#### Build + Lint + Sistema Base
```bash
npm run test:build
```
**Executa**: Lint → Build → Teste do Sistema (sem funcionalidades)

## 📊 Interpretando os Resultados

### 🟢 Funcionalidades Aprovadas
```
🎉 FUNCIONALIDADES CLIENTE/ADMIN APROVADAS! Taxa de implementação: 85%
```
- ✅ Funcionalidades críticas implementadas
- ✅ Sistema pronto para uso
- ⚠️ Pode ter funcionalidades opcionais não implementadas

### 🔴 Funcionalidades com Problemas
```
💥 FUNCIONALIDADES CRÍTICAS COM PROBLEMAS!
```
- ❌ Funcionalidades críticas falharam
- 🚫 Área específica pode não funcionar
- 🔧 Corrija erros antes de usar

### 🟡 Funcionalidades Parciais
```
⚠️ Algumas funcionalidades são opcionais ou parciais
```
- ✅ Funcionalidades principais OK
- ⚠️ Funcionalidades secundárias incompletas
- 🎯 Sistema utilizável com limitações

## 🎯 Fluxo de Trabalho Recomendado

### 1. Desenvolvimento Inicial
```bash
# Verificar base do sistema
npm run test:complete

# Verificar funcionalidades específicas
npm run test:client
npm run test:admin
```

### 2. Desenvolvimento Completo
```bash
# Teste completo de tudo
npm run test:all
```

### 3. Testes Durante Desenvolvimento
```bash
# Terminal 1:
npm run dev

# Terminal 2:
npm run test:routes

# Após mudanças:
npm run test:client  # ou test:admin
```

### 4. Antes de Commit/Deploy
```bash
npm run test:all
```

## 🔧 Troubleshooting

### Funcionalidades Cliente
- **Agendamento não funciona**: Verificar BookingPage.tsx
- **Veículos com problema**: Verificar VehiclesPage.tsx  
- **Perfil não salva**: Verificar ProfilePage.tsx e AuthContext
- **Histórico vazio**: Verificar HistoryPage.tsx e localStorage

### Funcionalidades Admin
- **Clientes não carregam**: Verificar CustomersManagement.tsx
- **Agendamentos admin**: Verificar AppointmentsManagement.tsx
- **Relatórios quebrados**: Verificar ReportsPage.tsx
- **Dashboard vazio**: Verificar AdminDashboard.tsx

### Problemas Gerais
- **Erro de rota**: `npm run test:routes`
- **Erro de build**: `npm run test:build`
- **Dependências**: `npm install --legacy-peer-deps`

## 📁 Estrutura dos Scripts

```
scripts/
├── test-system.js           # Testa estrutura base e código
├── test-routes.js           # Testa rotas HTTP  
├── test-complete.js         # Orquestra testes base
├── test-client-features.js  # Testa funcionalidades cliente
├── test-admin-features.js   # Testa funcionalidades admin
└── README.md               # Esta documentação
```

## 🚀 Próximos Passos

### Após Testes Base Passarem:
1. **Iniciar desenvolvimento**: `npm run dev`
2. **Acessar sistema**: http://localhost:3000
3. **Login cliente**: email qualquer + senha qualquer
4. **Login admin**: admin@v7estetica.com + senha qualquer

### Após Testes de Funcionalidades Passarem:
1. **Testar agendamento**: Fazer um agendamento completo
2. **Testar veículos**: Adicionar/editar veículos
3. **Testar admin**: Gerenciar clientes e agendamentos
4. **Testar relatórios**: Visualizar estatísticas

## 💡 Dicas de Uso

### Cores dos Resultados
- 🟢 **Verde**: Funcionalidade implementada e funcionando
- 🟡 **Amarelo**: Funcionalidade parcial ou opcional
- 🔴 **Vermelho**: Funcionalidade crítica com problemas

### Frequência de Testes
- 🔄 **test:system**: A cada mudança estrutural
- 🔄 **test:client/admin**: A cada nova funcionalidade
- 🔄 **test:all**: Antes de commits importantes
- 🔄 **test:routes**: Durante desenvolvimento ativo

### Prioridades de Correção
1. � **Erros críticos**: Sistema não funciona
2. 🟡 **Avisos importantes**: Funcionalidades limitadas  
3. 🟡 **Funcionalidades opcionais**: Melhorias futuras

## 📈 Métricas de Qualidade

- **Taxa de Implementação**: % de funcionalidades implementadas
- **Funcionalidades Críticas**: Agendamento, Clientes, Veículos, Perfil
- **Funcionalidades Opcionais**: Fidelidade, Chat, Estoque, Relatórios avançados
- **Cobertura de Testes**: Estrutura + Funcionalidades + Rotas
