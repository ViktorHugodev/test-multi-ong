# 🗺️ Roadmap - Marketplace Multi-ONG

## 📋 Visão Geral

Este roadmap organiza o desenvolvimento do Marketplace Multi-ONG em fases, seguindo boas práticas de arquitetura e entrega incremental de valor.

**Stack Tecnológica:**
- **Backend**: NestJS + TypeScript + Prisma + PostgreSQL + Redis + Bull/BullMQ
- **Frontend**: Next.js 14 (App Router) + TypeScript + shadcn/ui + Tailwind CSS + TanStack Query

---

## 🎯 Fase 1: MVP (Minimum Viable Product)

### Sprint 1: Setup Inicial & Autenticação ✅ COMPLETO

**Backend:**
- [x] Configuração inicial do projeto NestJS
- [x] Setup do Prisma com PostgreSQL
- [x] Modelo de dados multi-tenant (Organization, User, Product, Order)
- [x] Sistema de autenticação JWT
- [x] Guards e decoradores para multi-tenancy
- [x] Módulo de organizações (ONGs)

**Frontend:**
- [x] Configuração inicial do projeto Next.js 14
- [x] Setup shadcn/ui e Tailwind CSS
- [x] Configuração TanStack Query
- [x] API client com Axios
- [x] Sistema de autenticação (login/register)
- [x] Layout base e navegação

---

### Sprint 2: Gestão de Produtos (ONG) ✅ COMPLETO

**Backend:**
- [x] CRUD completo de produtos
- [x] Validação com class-validator e DTOs
- [x] Filtros automáticos por organizationId
- [x] Upload de imagens (opcional MVP)
- [x] Endpoints privados para ONGs

**Frontend:**
- [x] Dashboard da ONG
- [x] Listagem de produtos da ONG
- [x] Formulários de criação/edição de produtos
- [x] Validação de formulários

---

### Sprint 3: Portal Público & Catálogo ✅ COMPLETO

**Backend:**
- [x] Endpoint GET /public/products (com filtros e paginação)
- [x] Endpoint GET /public/products/:id
- [x] Endpoint GET /public/categories
- [x] Response DTOs otimizados

**Frontend:**
- [x] Página inicial do marketplace
- [x] **ProductGrid component** - Grid responsivo de produtos (1 col mobile, 2-3 tablet, 4 desktop)
- [x] **ProductCard component** - Card de produto com imagem, nome, preço, categoria, ONG e botão "Ver Detalhes"
- [x] **ProductFilters component** - Filtros por categoria, faixa de preço e ordenação
- [x] **Pagination component** - Paginação com controles Previous/Next e números de página
- [x] Página de detalhes do produto com:
  - Layout com imagem grande e detalhes
  - Informações completas (nome, descrição, preço, categoria, estoque, peso, SKU)
  - Informações da ONG vendedora
  - Seletor de quantidade
  - Botão "Adicionar ao Carrinho"
  - Breadcrumb de navegação
- [x] Skeleton loaders durante carregamento
- [x] Empty states quando não há produtos
- [x] Responsividade mobile/tablet/desktop

**Componentes Criados:**
- `front-next/src/components/products/product-card.tsx` - Card de produto
- `front-next/src/components/products/product-grid.tsx` - Grid de produtos
- `front-next/src/components/products/product-filters.tsx` - Filtros de busca
- `front-next/src/components/ui/pagination.tsx` - Componente de paginação
- `front-next/src/app/(public)/page.tsx` - Página inicial do marketplace
- `front-next/src/app/(public)/products/[id]/page.tsx` - Página de detalhes do produto

---

### Sprint 4: Sistema de Pedidos (Backend) 🔄 PRÓXIMA

**Backend:**
- [ ] Modelo OrderItem e relacionamentos
- [ ] Endpoint POST /orders (criar pedido)
- [ ] Endpoint GET /orders (listar meus pedidos)
- [ ] Endpoint GET /orders/:id (detalhes do pedido)
- [ ] Validação de estoque ao criar pedido
- [ ] Cálculo automático de totais
- [ ] Status de pedido (PENDING, PAID, SHIPPED, DELIVERED, CANCELLED)

**Frontend:**
- [ ] Hook useCart (Zustand ou Context) ✅ JÁ CRIADO
- [ ] Estrutura básica de types para pedidos

---

### Sprint 5: Carrinho & Checkout (Frontend) ⏳ PENDENTE

**Frontend:**
- [ ] Página de carrinho completa
  - [ ] Lista de itens com imagem, nome, preço, quantidade
  - [ ] Botão para remover itens
  - [ ] Atualização de quantidade
  - [ ] Cálculo de subtotal e total
- [ ] Página de checkout
  - [ ] Formulário de endereço de entrega
  - [ ] Resumo do pedido
  - [ ] Botão "Finalizar Pedido"
- [ ] Validação de estoque em tempo real
- [ ] Página de confirmação de pedido
- [ ] Integração com API de pedidos

**Validações Importantes:**
- [ ] Verificar estoque antes de permitir adicionar ao carrinho
- [ ] Limitar quantidade máxima por produto
- [ ] Exibir mensagens de erro claras
- [ ] Impedir finalização com estoque insuficiente

---

### Sprint 6: Logs Estruturados ⏳ PENDENTE

**Backend:**
- [ ] Configuração do Winston
- [ ] LoggingInterceptor global
- [ ] Logs estruturados em JSON
- [ ] Contexto de logs (requestId, userId, organizationId)
- [ ] Integração com sistema de observabilidade (opcional)

**Métricas de Logs:**
- [ ] Request/Response logs
- [ ] Error logs com stack traces
- [ ] Performance metrics
- [ ] Business events (pedido criado, produto atualizado, etc.)

---

## 🚀 Fase 2: Arquitetura Avançada

### Sprint 7: Consistência de Estoque ⏳ PENDENTE

**Backend:**
- [ ] Implementar locks pessimistas (Prisma)
- [ ] Transaction manager para operações críticas
- [ ] Testes de concorrência de estoque
- [ ] Retry logic para falhas transientes

**Cenários de Teste:**
- [ ] Múltiplos usuários comprando o mesmo produto simultaneamente
- [ ] Estoque insuficiente durante checkout
- [ ] Rollback de estoque em caso de falha no pagamento

---

### Sprint 8: Processamento Assíncrono ⏳ PENDENTE

**Backend:**
- [ ] Configuração BullMQ + Redis
- [ ] Job: Envio de e-mail de confirmação
- [ ] Job: Atualização de estoque em lote
- [ ] Job: Limpeza de carrinhos abandonados
- [ ] Dashboard de jobs (opcional)

**Jobs Implementados:**
- [ ] EmailJob - Envio de e-mails transacionais
- [ ] StockUpdateJob - Sincronização de estoque
- [ ] CartCleanupJob - Limpeza de carrinhos antigos (>7 dias)

---

### Sprint 9: Feature Avançada (Escolher 1) ⏳ PENDENTE

#### Opção A: Caching Distribuído (RECOMENDADO)
**Backend:**
- [ ] Configuração Redis para cache
- [ ] CacheInterceptor customizado
- [ ] Cache de listagens de produtos (TTL: 5min)
- [ ] Cache de detalhes de produtos (TTL: 10min)
- [ ] Invalidação de cache ao atualizar produto

#### Opção B: Sistema de Pagamentos
**Backend:**
- [ ] Integração com Stripe/Mercado Pago (sandbox)
- [ ] Webhook handlers
- [ ] Status de pagamento (PENDING, APPROVED, FAILED)
- [ ] Atualização de pedido após pagamento

**Frontend:**
- [ ] Página de pagamento
- [ ] Integração com gateway
- [ ] Feedback visual do status

#### Opção C: Sistema de Notificações
**Backend:**
- [ ] WebSockets (Socket.IO)
- [ ] Notificações em tempo real
- [ ] Eventos: novo pedido, mudança de status, etc.

**Frontend:**
- [ ] Toast notifications
- [ ] Badge de notificações não lidas
- [ ] Painel de notificações

---

## 📊 Métricas de Sucesso

### Fase 1 (MVP)
- ✅ Usuários podem se cadastrar e fazer login
- ✅ ONGs podem gerenciar seus produtos
- ✅ Consumidores podem navegar e filtrar produtos
- ✅ Consumidores podem ver detalhes dos produtos
- ⏳ Consumidores podem adicionar produtos ao carrinho e finalizar pedidos
- ⏳ Sistema possui logs estruturados

### Fase 2 (Arquitetura Avançada)
- ⏳ Estoque consistente mesmo com múltiplos pedidos simultâneos
- ⏳ Processamento assíncrono funcional (jobs executando)
- ⏳ Feature avançada implementada e testada

---

## 🎓 Diferenciais para Avaliação

### Obrigatórios (MVP)
- ✅ Multi-tenancy implementado corretamente
- ✅ Arquitetura limpa e organizada
- ✅ Validações e tratamento de erros
- ✅ TypeScript strict mode
- ⏳ Testes unitários (mínimo 50% coverage)
- ⏳ README com instruções de setup

### Diferenciais (Fase 2)
- ⏳ Consistência de dados (locks, transactions)
- ⏳ Processamento assíncrono (jobs)
- ⏳ Caching inteligente
- ⏳ Logs estruturados
- ⏳ Documentação técnica (decisões arquiteturais)
- ⏳ Deploy em produção (Railway, Vercel, etc.)

---

## 📝 Notas de Desenvolvimento

### Padrões de Código
- **Components** (frontend): `export function ComponentName()`
- **Pages** (frontend): arrow function + `export default`
- **Interfaces**: prefixo `I` (ex: `IProductCardProps`)
- **Types**: prefixo `T` (ex: `TUserRole`)
- **Naming**: kebab-case para arquivos, PascalCase para components
- **Imports**: ordenados (React/Next → External → Components → Utils/Types)

### Multi-Tenancy (CRÍTICO)
- ✅ NUNCA enviar `organization_id` do frontend
- ✅ Backend deriva `organizationId` do JWT automaticamente
- ✅ Guards aplicam filtros por organização em todas as queries
- ✅ Repositories isolam dados automaticamente

### Integração Frontend/Backend
- ✅ Usar TanStack Query para todas as requisições
- ✅ API client configurado com interceptors
- ✅ Tratamento de erros centralizado
- ✅ Loading states e skeleton loaders
- ✅ Empty states para listas vazias

---

## 🔄 Status Atual

**Progresso Geral**: ~75% Fase 1 (MVP)

**Sprint Atual**: Sprint 3 ✅ COMPLETO

**Próxima Sprint**: Sprint 5 (Carrinho & Checkout Frontend)

**Última Atualização**: 2025-11-11

---

## 🚦 Próximos Passos

1. **Sprint 5** - Implementar carrinho e checkout completo no frontend
2. **Sprint 6** - Adicionar logs estruturados com Winston
3. **Sprint 7** - Garantir consistência de estoque com locks
4. **Sprint 8** - Implementar jobs assíncronos com BullMQ
5. **Sprint 9** - Escolher e implementar feature avançada (Caching recomendado)
6. **Testes** - Atingir 50%+ de coverage
7. **Documentação** - README completo e docs técnicas
8. **Deploy** - Ambiente de produção

---

## 📚 Referências

- [NestJS Documentation](https://docs.nestjs.com)
- [Prisma Documentation](https://www.prisma.io/docs)
- [Next.js 14 Documentation](https://nextjs.org/docs)
- [shadcn/ui Components](https://ui.shadcn.com)
- [TanStack Query](https://tanstack.com/query/latest)

---

**Desenvolvido para vaga: Senior Full-Stack Developer**
