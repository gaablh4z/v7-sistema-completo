# PROJETO AUTOV7 

> **Status: REFATORAÇÃO COMPLETA**  
> **Tecnologia:** Django 5.2 + Python 3.x  
> **Data:** 4 de dezembro de 2025

---

## ESTRUTURA FINAL DO PROJETO

```
v7-sistema-completo/
├── autov7_backend/          # Configurações Django
│   ├── settings.py          # Configurações otimizadas
│   ├── urls.py             # URLs organizadas
│   └── asgi.py             # WebSockets configurados
│
├── core/                   # App principal 
│   ├── models.py           # User, Notification, GalleryImage, ServiceImage, HeroImage, ServiceIcon
│   ├── views.py            # Views principais
│   ├── admin_new_views.py  # Interface admin moderna
│   └── dashboard_views.py  # Dashboard cliente
│
├── vehicles/              # Gestão de veículos
│   └── models.py          # Vehicle, VehicleImage
│
├── services/             # Catálogo de serviços  
│   └── models.py          # ServiceCategory, Service, ServiceImage
│
├── appointments/         # Sistema de agendamentos
│   └── models.py          # Appointment, AppointmentService, Holiday, TimeSlot
│
├── inventory/           # Controle de estoque
│   └── models.py          # ProductCategory, Supplier, Product, StockMovement
│
├── templates/           # Templates HTML otimizados
│   ├── base.html        # Template base
│   ├── home.html        # Página inicial moderna
│   ├── admin_new/       # Interface admin
│   └── dashboard/       # Dashboard cliente
│
├── static/              # Arquivos estáticos organizados
│   ├── css/             # Estilos otimizados
│   ├── js/              # JavaScript puro
│   └── images/          # Imagens do sistema
│
├── media/               # Uploads funcionais
└── docs/                # Documentação atualizada
```

---

### Sistema de Usuários
- **Modelo User customizado** com campos específicos (telefone, funcao, pontos_fidelidade, foto_perfil, etc)
- **Autenticação completa** (login/logout/registro)
- **Níveis de acesso** (Cliente, Admin, Funcionário)
- **Sistema de pontos** de fidelidade
- **Sistema de notificações** (appointment, reminder, promotion, system)

### Gestão de Veículos
- **Cadastro completo** com marca, modelo, ano, placa, categoria
- **Upload de imagens** dos veículos (VehicleImage)
- **Categorias** (Sedan, SUV, Hatch, Pickup, Van, Motocicleta)
- **Sistema de quilometragem** e histórico

### Sistema de Serviços
- **Catálogo completo** de serviços com categorias
- **Preços e durações** configuráveis por serviço
- **Compatibilidade** por tipo de veículo (sedan, suv, pickup, moto)
- **Sistema de imagens** para cada serviço

### Agendamentos
- **Sistema de agendamento** com data, horário e posição na fila
- **Status completo** (pending, confirmed, in_progress, completed, cancelled)
- **Múltiplos serviços** por agendamento
- **Sistema de feriados** e controle de horários disponíveis
- **Timestamps** de criação, atualização, início e conclusão

### Controle de Estoque
- **Gestão de produtos** com categorias e fornecedores
- **Controle de estoque** com quantidade mínima
- **SKU e código de barras** para identificação
- **Movimentação de estoque** com histórico completo
- **Sistema de custos** e preços

### Interface Administrativa
- **Dashboard moderno** com Tailwind CSS
- **Gestão de clientes** e veículos
- **Controle de agendamentos**
- **Relatórios e métricas**
- **Sistema de notificações**

### API REST
- **Endpoints completos** para todas as funcionalidades
- **Autenticação por token**
- **Documentação automática**
- **Filtros e paginação**

### WebSockets (Tempo Real)
- **Comunicação bidirecional** em tempo real
- **Notificações instantâneas** para clientes e admins
- **Status de agendamentos** atualizado automaticamente
- **Sistema de heartbeat** para manter conexões ativas
- **Reconexão automática** em caso de falha
- **Canais separados** para clientes e administradores

---

## MELHORIAS IMPLEMENTADAS

### 1. **Configurações Otimizadas**
```python
# CORS otimizado para produção
CORS_ALLOWED_ORIGINS = [
    "http://localhost:8000",
    "http://127.0.0.1:8000", 
    "http://192.168.15.27:8000"
]

# WebSockets com Django Channels
CHANNEL_LAYERS = {
    'default': {
        'BACKEND': 'channels.layers.InMemoryChannelLayer'
    }
}
```

### 2. **WebSockets em Tempo Real**
- **Consumers separados** para clientes e administradores
- **Notificações instantâneas** de mudanças de status
- **Sistema de heartbeat** para conexões estáveis
- **Reconexão automática** em caso de falha
- **Broadcasting** para múltiplos usuários simultaneamente

### 3. **Endpoints WebSocket**
```javascript
// Cliente
ws://localhost:8000/ws/client/{user_id}/

// Administrador  
ws://localhost:8000/ws/admin/

// Notificações
ws://localhost:8000/ws/notifications/{user_id}/
```

### 3. **Scripts de Verificação**
- `system_report.py` - Relatório completo do sistema
- `check_system.py` - Verificação detalhada de funcionamento

---

## MODELS IMPLEMENTADOS

### Core App
```python
# User - Modelo customizado de usuário
- email (único), telefone, funcao (client/admin/employee)
- pontos_fidelidade, foto_perfil, avaliacao_media
- aceita_marketing, email_verificado, ultimo_ip_login

# Notification - Sistema de notificações
- usuario, titulo, mensagem, tipo, lida
- tipos: appointment, reminder, promotion, system

# GalleryImage - Galeria de imagens
- titulo, imagem, categoria, destacada, ordem
- categorias: work, before_after, vehicle, detail

# ServiceImage - Imagens dos serviços  
- titulo, imagem, tipo_servico, ativa, ordem
- tipos: washing, detailing, polishing, ceramic, etc

# HeroImage - Imagens do hero/banner
- titulo, imagem, ativa, ordem

# ServiceIcon - Ícones dos serviços
- nome, icone, ativo
```

### Vehicles App
```python
# Vehicle - Veículos dos clientes
- usuario, marca, modelo, ano, cor, placa
- categoria (sedan, hatch, suv, pickup, van, motorcycle)
- quilometragem, ativo

# VehicleImage - Imagens dos veículos
- veiculo, imagem, descricao, principal
```

### Services App
```python
# ServiceCategory - Categorias de serviços
- nome, descricao, ativo

# Service - Serviços oferecidos
- categoria, nome, descricao, preco, duracao_minutos
- aplica_sedan, aplica_suv, aplica_pickup, aplica_moto
- método is_available_for_vehicle()

# ServiceImage - Imagens dos serviços
- servico, imagem, descricao, principal
```

### Appointments App
```python
# Appointment - Agendamentos
- usuario, veiculo, data_agendamento, horario_agendamento
- situacao (pending, confirmed, in_progress, completed, cancelled)
- preco_total, observacoes, posicao_fila
- timestamps: criado_em, atualizado_em, iniciado_em, concluido_em

# AppointmentService - Serviços do agendamento
- agendamento, servico, preco

# Holiday - Feriados e dias não úteis
- data, nome, recorrente

# TimeSlot - Horários disponíveis
- hora_inicio, hora_fim, ativo, capacidade_maxima
```

### Inventory App
```python
# ProductCategory - Categorias de produtos
- nome, descricao, ativo

# Supplier - Fornecedores
- nome, pessoa_contato, email, telefone, endereco

# Product - Produtos em estoque
- nome, categoria, fornecedor, sku, codigo_barras
- quantidade, quantidade_minima, preco_unitario, preco_custo
- localizacao, ativo

# StockMovement - Movimentação de estoque
- produto, quantidade, tipo_movimento, preco_unitario
- usuario, observacao, data_movimento
```

---

## URLS FUNCIONAIS

| URL | Descrição | Status |
|-----|-----------|---------|
| `http://127.0.0.1:8000/` | Página inicial | FUNCIONANDO |
| `http://127.0.0.1:8000/admin/` | Django Admin | FUNCIONANDO |
| `http://127.0.0.1:8000/admin-panel/` | Painel administrativo | FUNCIONANDO |
| `http://127.0.0.1:8000/dashboard/` | Dashboard cliente | FUNCIONANDO |
| `http://127.0.0.1:8000/api/status/` | Status da API | FUNCIONANDO |

---

## COMANDOS ESSENCIAIS

```bash
# Iniciar servidor
python manage.py runserver 0.0.0.0:8000

# Criar superusuário  
python manage.py createsuperuser

# Popular dados de exemplo
python manage.py populate_db

# Verificar sistema
python system_report.py

# Aplicar migrações
python manage.py migrate
```

---

## ARQUIVOS IMPORTANTES

### Configuração do Projeto
```python
# autov7_backend/settings.py
- Configurações do Django (database, apps, middleware)
- CORS configurado para produção e desenvolvimento
- Django Channels para WebSockets
- Configurações de media e static files
- Sistema de autenticação customizado

# autov7_backend/urls.py  
- Roteamento principal do projeto
- Include das URLs de cada app
- Configuração para servir arquivos de media

# autov7_backend/asgi.py
- Configuração ASGI para WebSockets
- Routing para consumers de tempo real
- Suporte a HTTP e WebSocket

# autov7_backend/routing.py
- Roteamento específico dos WebSockets
- Consumers para clientes e administradores
- Sistema de notificações em tempo real
```

### Gerenciamento do Projeto
```python
# manage.py
- Script principal do Django
- Comandos administrativos (runserver, migrate, etc)
- Interface de linha de comando

# requirements.txt
- Dependências do projeto
- Django 5.2, Channels, Pillow, etc
- Versões específicas para estabilidade

# db.sqlite3
- Banco de dados SQLite
- Contém todos os dados do sistema
- Estrutura completa das tabelas
```

### Scripts de Verificação
```python
# system_report.py
- Relatório completo do sistema
- Verifica status de todas as funcionalidades
- Analisa integridade dos dados
- Gera estatísticas de uso

# check_system.py
- Verificação detalhada de funcionamento
- Testa conexões e configurações
- Valida estrutura do banco
- Diagnóstico de problemas
```

### Core App - Funcionalidades Base
```python
# core/models.py
- User: modelo customizado com roles e funcionalidades específicas
- Notification: sistema de notificações em tempo real
- GalleryImage: galeria de imagens do site
- ServiceImage: imagens específicas dos serviços

# core/views.py
- Views principais (home, sobre, contato)
- Autenticação e registro de usuários
- API endpoints básicos
- Gerenciamento de sessões

# core/admin_new_views.py
- Interface administrativa moderna
- Dashboard com métricas e relatórios
- Gestão de usuários e permissões
- Painel de controle unificado

# core/dashboard_views.py
- Dashboard específico para clientes
- Área do cliente com agendamentos
- Histórico de serviços
- Gestão de veículos pessoais

# core/auth_views.py
- Sistema de autenticação completo
- Login, logout, registro
- Recuperação de senha
- Validação de e-mail

# core/consumers.py
- WebSocket consumers para tempo real
- Notificações instantâneas
- Chat e comunicação bidirecional
- Sistema de heartbeat
```

### Templates e Interface
```html
# templates/base.html
- Template base do projeto
- Estrutura HTML comum
- Inclusão de CSS e JavaScript
- Navigation e footer padrão

# templates/home.html
- Página inicial do site
- Hero section com imagens dinâmicas
- Catálogo de serviços
- Formulário de contato

# templates/admin_new/
- Interface administrativa moderna
- Dashboard com gráficos e métricas
- Formulários de gestão
- Tabelas de dados responsivas

# templates/dashboard/
- Área do cliente
- Agendamentos e histórico
- Gestão de veículos
- Perfil do usuário
```

### Arquivos Estáticos
```css
# static/css/
- styles.css: estilos principais do site
- admin.css: estilos da área administrativa
- dashboard.css: estilos do dashboard cliente
- Responsividade e temas

# static/js/
- main.js: funcionalidades gerais
- admin.js: scripts da área administrativa
- dashboard.js: funcionalidades do cliente
- websocket.js: comunicação em tempo real

# static/images/
- Imagens do sistema
- Ícones e assets
- Logos e elementos visuais
```

### Cada App e Suas Responsabilidades
```python
# vehicles/
- models.py: Vehicle e VehicleImage
- views.py: CRUD de veículos
- admin.py: gestão administrativa

# services/
- models.py: Service, ServiceCategory e ServiceImage  
- views.py: catálogo e API de serviços
- admin.py: gestão de serviços

# appointments/
- models.py: Appointment, Holiday, TimeSlot
- views.py: sistema de agendamento
- admin.py: gestão de agendamentos

# inventory/
- models.py: Product, Supplier, StockMovement
- views.py: controle de estoque
- admin.py: gestão de inventário
```

---
