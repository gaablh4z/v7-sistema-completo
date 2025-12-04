# AutoV7 - Sistema de Gerenciamento para Lava-Jato

## 📋 Visão Geral do Sistema

Sistema completo de gerenciamento para lava-jato com funcionalidades de agendamento, gestão de clientes, veículos, serviços e estoque. Desenvolvido em Django com modelo de usuário customizado e interface administrativa moderna.

---

## 🗄️ Estrutura dos Modelos (Models)

### 🧑‍🤝‍🧑 Core - Usuários e Sistema (`core/models.py`)

#### `User` (Usuário Customizado)
- **Herança:** AbstractUser
- **Campos principais:** email (único), telefone, funcao (client/admin/employee)
- **Campos específicos para clientes:** 
  - data_nascimento, endereco, pontos_fidelidade
  - foto_perfil, avaliacao_media, total_servicos
- **Relacionamentos:** OneToMany com Vehicle, Appointment, Notification
- **Métodos:** `is_client()`, `is_admin()`, `is_employee()`

#### `Notification` (Notificações)
- **Relacionamento:** ForeignKey → User
- **Tipos:** appointment, reminder, promotion, system
- **Campos:** titulo, mensagem, tipo, lida, criada_em

#### Modelos de Interface Visual
- **`GalleryImage`** - Galeria de trabalhos realizados
- **`ServiceImage`** - Imagens promocionais de serviços  
- **`HeroImage`** - Banners principais da home
- **`HeroBackground`** - Backgrounds com controle de transparência
- **`ServiceIcon`** - Ícones personalizados com badges e cores

---

### 🚗 Veículos (`vehicles/models.py`)

#### `Vehicle` (Veículo)
- **Relacionamento:** ForeignKey → User (proprietário)
- **Campos:** marca, modelo, ano, cor, placa (único), categoria, quilometragem
- **Categorias disponíveis:** sedan, hatch, suv, pickup, van, motorcycle, other
- **Métodos:** `full_name` (marca + modelo + ano)

#### `VehicleImage`
- **Relacionamento:** ForeignKey → Vehicle
- **Campo especial:** principal (define imagem destacada)

---

### 💼 Serviços (`services/models.py`)

#### `ServiceCategory` (Categoria de Serviços)
- **Campos:** nome (único), descricao, ativo
- **Exemplos:** Lavagem, Enceramento, Polimento

#### `Service` (Serviço)
- **Relacionamento:** ForeignKey → ServiceCategory
- **Campos:** nome, descricao, preco, duracao_minutos
- **Aplicabilidade por tipo de veículo:**
  - aplica_sedan, aplica_suv, aplica_pickup, aplica_moto
- **Método:** `is_available_for_vehicle(vehicle_category)`

#### `ServiceImage`
- **Relacionamento:** ForeignKey → Service
- **Campo:** principal (imagem destacada)

---

### 📦 Estoque (`inventory/models.py`)

#### `ProductCategory` (Categoria de Produtos)
- **Campos:** nome (único), descricao, ativo

#### `Supplier` (Fornecedor)
- **Campos:** nome, pessoa_contato, email, telefone, endereco
- **Relacionamento:** OneToMany com Product

#### `Product` (Produto)
- **Relacionamentos:** ForeignKey → ProductCategory, Supplier
- **Identificação:** sku, codigo_barras (ambos únicos e opcionais)
- **Controle de estoque:** quantidade, quantidade_minima, preco_unitario, preco_custo
- **Localização:** localizacao (posição no estoque)
- **Propriedades úteis:** `is_low_stock`, `is_out_of_stock`

#### `StockMovement` (Movimentação de Estoque)
- **Relacionamento:** ForeignKey → Product, User
- **Tipos de movimentação:** entrada, saida, ajuste, perda, transferencia
- **Auditoria completa:** quantidade_anterior, nova_quantidade, motivo, documento_referencia

#### Sistema de Compras
- **`PurchaseOrder`** - Ordens de compra com controle de status
- **`PurchaseOrderItem`** - Itens das ordens com quantidades

---

### 📅 Agendamentos (`appointments/models.py`)

#### `Appointment` (Agendamento)
- **Relacionamentos:** ForeignKey → User, Vehicle
- **Agendamento:** data_agendamento, horario_agendamento, preco_total
- **Status disponíveis:** pending, confirmed, in_progress, completed, cancelled
- **Controle temporal:** criado_em, iniciado_em, concluido_em
- **Validações complexas:**
  - Horário de funcionamento
  - Detecção de feriados
  - Conflitos de horário considerando duração
  - Limite de agendamentos por cliente/dia

#### `AppointmentService` (Serviços do Agendamento)
- **Relacionamento:** Many-to-Many entre Appointment e Service
- **Campos:** preco, concluido (controle individual)

#### `WorkingHours` (Horários de Funcionamento)
- **Configuração:** dia_semana, horario_inicio, horario_fim, aberto
- **Controle:** 7 dias da semana com horários flexíveis

#### `Holiday` (Feriados)
- **Campos:** data, nome, recorrente
- **Funcionalidade:** bloqueia agendamentos em feriados

#### `AppointmentReview` (Avaliações)
- **Relacionamento:** OneToOne → Appointment
- **Avaliação:** nota de 1-5 estrelas + comentário

---

## 🌐 Estrutura de URLs

### URLs Principais (`autov7_backend/urls.py`)
```
/                          # Home pública
/sobre/                    # Página institucional
/admin/                    # Django Admin tradicional
/accounts/login/           # Login customizado
/accounts/logout/          # Logout
/dashboard/               # Dashboard do cliente
/admin-panel/             # Interface administrativa moderna
```

### URLs do Painel Administrativo (`core/admin_new_urls.py`)
```
/admin-panel/                              # Dashboard administrativo
/admin-panel/clientes/                     # Gestão de clientes (interface cards)
/admin-panel/clientes/criar/               # Criar novo cliente
/admin-panel/clientes/<id>/veiculos/       # Veículos específicos do cliente
/admin-panel/agendamentos/                 # Gestão de agendamentos
/admin-panel/servicos/                     # Gestão de serviços
/admin-panel/estoque/                      # Gestão de estoque
/admin-panel/estoque/criar/                # Criar produto (SKU/código opcional)
/admin-panel/estoque/<id>/editar/          # Editar produto
/admin-panel/estoque/<id>/ajustar/         # Ajustar quantidades
/admin-panel/relatorios/                   # Relatórios gerenciais
```

### URLs do Dashboard do Cliente (`core/dashboard_urls.py`)
```
/dashboard/                    # Dashboard principal
/dashboard/booking/           # Agendamento de serviços
/dashboard/vehicles/          # Gerenciar veículos pessoais
/dashboard/appointments/      # Histórico de agendamentos
/dashboard/profile/          # Perfil e configurações
```

---

## ⚙️ Views de Gerenciamento

### Views Administrativas (`core/admin_new_views.py`)

#### Gestão de Clientes
- **`clientes_view`** - Interface redesenhada com cards dos clientes
- **`cliente_veiculos_view`** - Visualização detalhada dos veículos por cliente
- **`criar_cliente`**, **`editar_cliente`** - CRUD completo de clientes

#### Gestão de Agendamentos
- **`agendamentos_view`** - Lista e gestão centralizada de agendamentos
- **`alterar_status_agendamento`** - Controle de status dos agendamentos

#### Gestão de Estoque
- **`estoque_view`** - Listagem de produtos com filtros
- **`criar_produto_view`** - Criação de produtos (SKU/código de barras opcional)
- **`editar_produto_view`**, **`excluir_produto_view`** - CRUD de produtos
- **`ajustar_estoque_view`** - Ajuste manual de quantidades

#### Gestão de Serviços
- **`servicos_view`** - Listagem e gestão de serviços
- **`criar_servico`**, **`editar_servico`** - CRUD de serviços

### Views do Dashboard Cliente (`core/dashboard_views.py`)

#### Interface do Cliente
- **`dashboard_home`** - Dashboard principal com estatísticas
- **`booking_page`** - Sistema de agendamento com calendário interativo
- **`vehicles_page`** - Gerenciamento pessoal de veículos
- **`appointments_page`** - Histórico completo de agendamentos
- **`profile_page`** - Perfil e configurações pessoais

#### APIs AJAX
- **`get_calendar_availability`** - Disponibilidade em tempo real do calendário
- **`get_time_slots`** - Horários disponíveis por data
- **`dashboard_stats`** - Estatísticas personalizadas do cliente

---

## 🔧 Funcionalidades Especiais

### 1. Validação Complexa de Agendamentos
- **Horários de funcionamento:** Verifica se está dentro do expediente
- **Detecção de conflitos:** Considera duração dos serviços para evitar sobreposições
- **Validação de feriados:** Bloqueia agendamentos em dias não úteis
- **Limite por cliente:** Máximo de agendamentos por cliente/dia

### 2. Gestão Inteligente de Estoque
- **Controle de estoque mínimo:** Alertas automáticos para reposição
- **Histórico completo:** Rastreamento de todas as movimentações
- **Auditoria:** Registro detalhado de quem, quando e por quê
- **Ordens de compra:** Sistema integrado para reposição

### 3. Interface Moderna e Responsiva
- **Dashboard administrativo:** Cards responsivos com Tailwind CSS
- **Interface do cliente:** Calendário interativo e formulários intuitivos
- **Sistema de notificações:** Feedback em tempo real
- **Alpine.js:** Interatividade sem complexidade

### 4. Segurança e Controle
- **Modelo de usuário customizado:** Níveis de acesso diferenciados
- **Validações robustas:** Regras de negócio implementadas no modelo
- **Controle de permissões:** Acesso baseado em função do usuário
- **Auditoria completa:** Logs de todas as operações importantes

---

## 🏗️ Arquitetura do Sistema

### Apps Django
- **`core`** - Usuários, autenticação e views principais
- **`vehicles`** - Gestão de veículos dos clientes
- **`services`** - Catálogo de serviços oferecidos
- **`inventory`** - Controle de estoque e compras
- **`appointments`** - Sistema de agendamentos

### Tecnologias Utilizadas
- **Backend:** Django 5.2, Python
- **Banco de dados:** SQLite (desenvolvimento)
- **Frontend:** Tailwind CSS, Alpine.js
- **Autenticação:** Django Auth com modelo customizado
- **Validações:** Django Forms + validações customizadas

### Configurações Importantes
- **`AUTH_USER_MODEL = 'core.User'`** - Modelo de usuário customizado
- **Timezone:** Configurado para horário brasileiro
- **Media files:** Upload de imagens para veículos, produtos e galeria
- **Static files:** Servidos corretamente em desenvolvimento

---

## 🚀 Como Executar

1. **Instalar dependências:**
   ```bash
   pip install -r requirements.txt
   ```

2. **Aplicar migrações:**
   ```bash
   python manage.py migrate
   ```

3. **Criar superusuário:**
   ```bash
   python manage.py createsuperuser
   ```

4. **Executar servidor:**
   ```bash
   python manage.py runserver
   ```

5. **Acessar:**
   - Site público: http://127.0.0.1:8000/
   - Dashboard cliente: http://127.0.0.1:8000/dashboard/

---

O projeto está estruturado de forma modular, com cada app tendo responsabilidades bem definidas e relacionamentos claros entre os modelos, seguindo as melhores práticas do Django para sistemas de gestão empresarial.
- **`appointments`** - Sistema de agendamentos

### Tecnologias Utilizadas
- **Backend:** Django 5.2, Python
- **Banco de dados:** SQLite (desenvolvimento)
- **Frontend:** Tailwind CSS, Alpine.js
- **Autenticação:** Django Auth com modelo customizado
- **Validações:** Django Forms + validações customizadas
- **Uploads**: Django File Handling
- **API**: REST API completa

## Estrutura do Projeto
```
autov7_backend/
├── core/                   # App principal (usuários, dashboard)
├── vehicles/              # Gerenciamento de veículos
├── services/             # Catálogo de serviços
├── appointments/         # Sistema de agendamentos
├── inventory/           # Controle de estoque
├── templates/           # Templates HTML
├── media/              # Arquivos de mídia
└── autov7_backend/     # Configurações Django
```

## Funcionalidades Detalhadas

### Sistema de Usuários
- ✅ Cadastro e autenticação de clientes
- ✅ Perfis personalizados com foto
- ✅ Sistema de funções (Cliente, Admin, Funcionário)
- ✅ Programa de fidelidade com pontos

### Gerenciamento de Veículos
- ✅ Cadastro completo de veículos
- ✅ Múltiplas categorias (Sedan, SUV, Hatch, etc.)
- ✅ Upload de fotos dos veículos
- ✅ Histórico de serviços por veículo

### Sistema de Agendamentos
- ✅ Agendamento online com calendário
- ✅ Múltiplos serviços por agendamento
- ✅ Sistema de filas e controle de tempo
- ✅ Status em tempo real
- ✅ Avaliações e comentários

### Controle de Estoque
- ✅ Cadastro de produtos e materiais
- ✅ Controle de estoque com alertas
- ✅ Fornecedores e ordens de compra
- ✅ Movimentações e relatórios

## Como Executar

### Pré-requisitos
- Python 3.8+
- pip ou pipenv
- SQLite (padrão) ou PostgreSQL

### Instalação
```bash
# Clone o repositório
git clone <seu-repositorio>
cd v7-sistema-completo

# Instale as dependências
pip install -r requirements.txt

# Configure o banco de dados
python manage.py migrate

# Crie um superusuário
python manage.py createsuperuser

# Execute o servidor de desenvolvimento
python manage.py runserver
```

### Usando Scripts de Gerenciamento
```bash
# Windows
manage.bat runserver

# Linux/Mac
./manage_project.sh runserver

# PowerShell
./manage_project.ps1 runserver
```

### Configuração Inicial
```bash
# Popular banco de dados com dados de exemplo
python manage.py populate_db

# Criar categorias de serviços padrão
python manage.py shell
>>> from services.models import ServiceCategory
>>> ServiceCategory.objects.create(name="Lavagem Externa", description="Serviços de lavagem externa")
>>> ServiceCategory.objects.create(name="Enceramento", description="Serviços de enceramento e proteção")
```

## Configuração do Ambiente

### Variáveis de Ambiente (.env)
```env
SECRET_KEY=sua-chave-secreta-aqui
DEBUG=True
ALLOWED_HOSTS=localhost,127.0.0.1

# Banco de dados (opcional - usa SQLite por padrão)
DATABASE_URL=postgres://user:password@localhost:5432/autov7
```

### Configuração do Banco de Dados
Por padrão usa SQLite. Para PostgreSQL:
```python
DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.postgresql',
        'NAME': 'autov7',
        'USER': 'seu-usuario',
        'PASSWORD': 'sua-senha',
        'HOST': 'localhost',
        'PORT': '5432',
    }
}
```

## URLs Principais

### Interface do Cliente
- `/` - Página inicial
- `/dashboard/` - Dashboard do cliente
- `/dashboard/vehicles/` - Gerenciar veículos
- `/dashboard/booking/` - Fazer agendamento
- `/dashboard/profile/` - Perfil do usuário

### Interface Administrativa
- `/admin/` - Django Admin
- `/admin/dashboard/` - Dashboard administrativo
- `/api/` - Endpoints da API REST

## API REST

### Endpoints Principais
```
GET /api/users/ - Lista usuários
GET /api/vehicles/ - Lista veículos do usuário
GET /api/services/ - Lista serviços disponíveis
GET /api/appointments/ - Lista agendamentos
POST /api/appointments/ - Criar agendamento
GET /api/notifications/ - Notificações do usuário
```

### Autenticação
```bash
# Login e obter token
curl -X POST http://localhost:8000/api/auth/login/ \
  -H "Content-Type: application/json" \
  -d '{"email": "user@example.com", "password": "senha123"}'

# Usar token nas requisições
curl -H "Authorization: Token seu-token-aqui" \
  http://localhost:8000/api/appointments/
```

## Estrutura de Dados

### Usuários
- Informações pessoais completas
- Sistema de pontos de fidelidade
- Múltiplas funções (cliente/admin)

### Veículos
- Dados técnicos (marca, modelo, ano)
- Categorização automática
- Histórico de serviços

### Agendamentos
- Data e horário
- Múltiplos serviços
- Sistema de aprovação
- Avaliações pós-serviço

## Deploy em Produção

### Configurações de Produção
```python
DEBUG = False
ALLOWED_HOSTS = ['seu-dominio.com']
SECURE_SSL_REDIRECT = True
SECURE_HSTS_SECONDS = 31536000
```

### Comandos para Deploy
```bash
# Coletar arquivos estáticos
python manage.py collectstatic

# Aplicar migrações
python manage.py migrate

# Criar superusuário
python manage.py createsuperuser
```

## Contribuição
1. Faça um fork do projeto
2. Crie uma branch para sua funcionalidade (`git checkout -b feature/NovaFuncionalidade`)
3. Commit suas alterações (`git commit -m 'Adiciona nova funcionalidade'`)
4. Push para a branch (`git push origin feature/NovaFuncionalidade`)
5. Abra um Pull Request

## Licença
Este projeto está sob a licença MIT. Consulte o arquivo `LICENSE` para mais detalhes.

## Suporte
Para dúvidas ou suporte:
- Email: gabriellemos.glg27@gmail.com
- GitHub: [@gaablh4z](https://github.com/gaablh4z)
- Issues: Use o sistema de Issues do GitHub

## Changelog
- **v1.0.0** - Versão inicial com funcionalidades básicas
- **v1.1.0** - Sistema de notificações e melhorias na UI
- **v1.2.0** - API REST completa e documentação
