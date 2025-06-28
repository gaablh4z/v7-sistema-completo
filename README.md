# Sistema V7 - Aplicação Completa

## Descrição
Este é um sistema completo desenvolvido com Next.js e React, incluindo funcionalidades de autenticação, dashboard administrativo, gerenciamento de estoque, e muito mais.

## Tecnologias Utilizadas
- **Frontend**: Next.js, React, TypeScript
- **Styling**: Tailwind CSS, shadcn/ui
- **Database**: Supabase
- **Build Tool**: Vite
- **Package Manager**: pnpm

## Estrutura do Projeto
```
v7-improved/
├── app/                     # Páginas do Next.js App Router
├── components/              # Componentes React reutilizáveis
│   ├── admin/              # Componentes administrativos
│   ├── auth/               # Componentes de autenticação
│   ├── dashboard/          # Componentes do dashboard
│   └── ui/                 # Componentes UI base
├── contexts/               # Contextos React
├── hooks/                  # Custom hooks
├── lib/                    # Utilitários e configurações
├── public/                 # Arquivos estáticos
├── scripts/                # Scripts de teste e configuração
└── src/                    # Código fonte alternativo (Vite)
```

## Funcionalidades
- ✅ Sistema de autenticação completo
- ✅ Dashboard administrativo
- ✅ Gerenciamento de estoque
- ✅ Sistema de agendamentos
- ✅ Relatórios e analytics
- ✅ Suporte a PWA
- ✅ Interface responsiva
- ✅ Modo escuro/claro

## Como Executar

### Pré-requisitos
- Node.js 18+
- pnpm

### Instalação
```bash
# Clone o repositório
git clone <seu-repositorio>
cd v7-improved

# Instale as dependências
pnpm install

# Configure as variáveis de ambiente
cp .env.example .env.local
# Edite o arquivo .env.local com suas configurações

# Execute em modo de desenvolvimento
pnpm dev
```

### Build para Produção
```bash
# Build da aplicação
pnpm build

# Executar versão de produção
pnpm start
```

## Scripts Disponíveis
- `pnpm dev` - Executa em modo de desenvolvimento
- `pnpm build` - Build para produção
- `pnpm start` - Executa versão de produção
- `pnpm lint` - Executa linting
- `pnpm test` - Executa testes

## Configuração do Banco de Dados
O projeto utiliza Supabase como backend. Configure as seguintes variáveis de ambiente:

```env
NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
```

## Contribuição
1. Fork o projeto
2. Crie uma branch para sua feature (`git checkout -b feature/AmazingFeature`)
3. Commit suas mudanças (`git commit -m 'Add some AmazingFeature'`)
4. Push para a branch (`git push origin feature/AmazingFeature`)
5. Abra um Pull Request

## Licença
Este projeto está sob a licença MIT. Veja o arquivo `LICENSE` para mais detalhes.

## Contato
- Email: gabriellemos.glg27@gmail.com
- GitHub: [@gaablh4z](https://github.com/gaablh4z)
