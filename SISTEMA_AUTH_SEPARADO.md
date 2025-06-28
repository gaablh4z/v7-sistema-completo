# Sistema de Autenticação Separado - Cliente vs Admin

## Problema Resolvido

O sistema anteriormente misturava autenticação de clientes e administradores, permitindo que clientes logados fossem redirecionados para o painel administrativo. Isso representava um problema de segurança e fluxo de usuário.

## Solução Implementada

### 1. Separação Completa dos Sistemas de Autenticação

#### Autenticação de Clientes (`AuthContext.tsx`)
- Contexto exclusivo para clientes
- Nunca cria usuários com role "admin"
- Usa `UserStorage` para persistência local
- Validação robusta de email/senha
- Sistema de registro completo

#### Autenticação de Admin (`AdminAuth.ts`)
- Sistema independente para administradores
- Credenciais únicas (admin@v7estetica.com)
- Bloqueio após tentativas incorretas
- Possibilidade de alteração de senha
- Sessão administrativa separada

### 2. Componentes Específicos

#### `EnhancedAuthForm` (Clientes)
- Formulário para login/cadastro de clientes
- Validação para impedir login admin
- Aviso se tentar usar credenciais administrativas
- Link para acesso administrativo

#### `AdminLoginScreen` (Admin)
- Formulário exclusivo para administradores
- Integração com `AdminAuth`
- Funcionalidade de alteração de senha
- Validação robusta de credenciais

### 3. Roteamento Protegido

#### Rota `/admin`
- Página de login administrativo
- Redireciona para dashboard se já logado

#### Rota `/admin/dashboard`
- Protegida por `AdminProtectedRoute`
- Acesso apenas para admin autenticado
- Redireciona para `/admin` se não autenticado

### 4. Prevenção de Acesso Cruzado

#### No Login de Clientes
- Detecta tentativas de login com credenciais admin
- Exibe aviso e sugere página administrativa
- Nunca permite acesso ao painel admin

#### No Login Admin
- Sistema completamente separado
- Não interfere com sessões de cliente
- Credenciais únicas e seguras

## Fluxo de Uso

### Cliente
1. Acessa `/` (página inicial)
2. Faz login/cadastro no `EnhancedAuthForm`
3. Acessa dashboard do cliente
4. Se tentar usar credenciais admin, recebe aviso

### Administrador
1. Acessa `/admin` diretamente ou via link na página cliente
2. Faz login no `AdminLoginScreen`
3. É redirecionado para `/admin/dashboard`
4. Pode alterar sua senha através do modal

## Recursos de Segurança

### Para Admin
- ✅ Credencial única (admin@v7estetica.com)
- ✅ Bloqueio após 3 tentativas incorretas
- ✅ Sessão administrativa separada
- ✅ Possibilidade de alteração de senha
- ✅ Validação robusta de credenciais
- ✅ Timeout de sessão

### Para Clientes
- ✅ Validação forte de email/senha
- ✅ Hash de senhas (simulado)
- ✅ Prevenção de ataques de força bruta
- ✅ Validação de domínios de email
- ✅ Política de senhas seguras

## Arquivos Modificados

### Páginas
- `src/pages/AdminPage.tsx` - Agora usa `AdminAuth`
- `src/pages/AdminDashboardPage.tsx` - Nova página para dashboard admin
- `src/pages/HomePage.tsx` - Removida lógica de admin

### Componentes
- `src/components/auth/AdminLoginScreen.tsx` - Login exclusivo admin
- `src/components/auth/EnhancedAuthForm.tsx` - Prevenção de login admin
- `src/components/auth/AdminProtectedRoute.tsx` - Proteção de rotas admin

### Contextos e Libs
- `src/contexts/AuthContext.tsx` - Exclusivo para clientes
- `src/lib/adminAuth.ts` - Sistema admin independente

### Roteamento
- `src/App.tsx` - Rota protegida `/admin/dashboard`

## Testagem

Para testar o sistema:

1. **Teste Cliente:**
   - Acesse `/`
   - Tente fazer login com `admin@v7estetica.com`
   - Verifique que recebe aviso e não é redirecionado

2. **Teste Admin:**
   - Acesse `/admin`
   - Faça login com `admin@v7estetica.com` e senha padrão
   - Verifique redirecionamento para `/admin/dashboard`
   - Teste alteração de senha

3. **Teste Proteção:**
   - Tente acessar `/admin/dashboard` sem estar logado
   - Verifique redirecionamento para `/admin`

## Credenciais Padrão

**Admin:**
- Email: `admin@v7estetica.com`
- Senha: `V7Admin2024!` (pode ser alterada)

A senha pode ser alterada através do modal "Alterar Senha" na tela de login administrativo.
