# 🗺️ Roadmap de Desenvolvimento - Marketplace Multi-ONG

## 📊 Visão Geral do Projeto

**Objetivo**: Criar um marketplace robusto e seguro que conecta consumidores com ONGs parceiras, permitindo venda de produtos com multi-tenancy rigoroso, busca inteligente com AI, processamento assíncrono e arquitetura escalável.

**Status Atual**: 🟡 Etapa 1 em progresso (~70% completo)

---

## 🎯 Fases do Projeto

```
├── Fase 0: Setup & Infraestrutura (✅ COMPLETO)
├── Fase 1: MVP - Etapa 1 do Desafio (🟡 70% COMPLETO)
│   ├── Sprint 1: Autenticação & Multi-Tenancy (✅ COMPLETO)
│   ├── Sprint 2: CRUD de Produtos (✅ COMPLETO)
│   ├── Sprint 3: Portal Público & Catálogo (🟡 EM PROGRESSO)
│   ├── Sprint 4: Busca Inteligente (✅ COMPLETO)
│   ├── Sprint 5: Carrinho & Pedidos (🟡 EM PROGRESSO)
│   └── Sprint 6: Logs & Observabilidade (⏳ PENDENTE)
│
├── Fase 2: Arquitetura Avançada - Etapa 2 (⏳ PENDENTE)
│   ├── Sprint 7: Consistência de Estoque (⏳ PENDENTE)
│   ├── Sprint 8: Processamento Assíncrono (⏳ PENDENTE)
│   └── Sprint 9: Feature Avançada (Escolher 1) (⏳ PENDENTE)
│
└── Fase 3: Testes & Documentação Final (⏳ PENDENTE)
```

---

## 📂 Estrutura do Projeto

```
marketplace-multi-ong/
│
├── back-nestjs/                    # Backend NestJS
│   ├── prisma/
│   │   ├── schema.prisma          ✅ Implementado
│   │   ├── migrations/            ✅ Implementado
│   │   └── seed.ts                ✅ Implementado
│   │
│   ├── src/
│   │   ├── auth/                  ✅ Implementado
│   │   │   ├── decorators/        ✅ Implementado
│   │   │   ├── guards/            ✅ Implementado
│   │   │   ├── strategies/        ✅ Implementado
│   │   │   └── dto/               ✅ Implementado
│   │   │
│   │   ├── modules/
│   │   │   ├── products/          ✅ Implementado
│   │   │   ├── orders/            ✅ Implementado
│   │   │   ├── organizations/     ✅ Implementado
│   │   │   ├── search/            ✅ Implementado
│   │   │   └── jobs/              ✅ Implementado
│   │   │
│   │   ├── common/                ✅ Implementado
│   │   ├── config/                ✅ Implementado
│   │   └── database/              ✅ Implementado
│   │
│   ├── docker-compose.yaml        ✅ Implementado
│   └── package.json               ✅ Implementado
│
├── front-next/                    # Frontend Next.js 14
│   ├── src/
│   │   ├── app/
│   │   │   ├── (auth)/            ✅ Implementado
│   │   │   │   ├── login/         ✅ Implementado
│   │   │   │   └── register/      ✅ Implementado
│   │   │   │
│   │   │   ├── (public)/          🟡 Parcial
│   │   │   │   ├── page.tsx       ⏳ Em Progresso
│   │   │   │   ├── products/      ⏳ Pendente
│   │   │   │   ├── cart/          🟡 Básico Implementado
│   │   │   │   └── checkout/      ⏳ Pendente
│   │   │   │
│   │   │   └── (dashboard)/       ⏳ Pendente
│   │   │       ├── products/      ⏳ Pendente
│   │   │       └── orders/        ⏳ Pendente
│   │   │
│   │   ├── components/
│   │   │   ├── auth/              ✅ Implementado
│   │   │   ├── products/          🟡 Básico
│   │   │   ├── cart/              🟡 Básico
│   │   │   ├── layout/            ✅ Implementado
│   │   │   └── ui/                ✅ Implementado
│   │   │
│   │   ├── lib/
│   │   │   ├── api/               ✅ Implementado
│   │   │   ├── hooks/             ✅ Implementado
│   │   │   ├── utils/             🟡 Parcial
│   │   │   └── validations/       🟡 Básico
│   │   │
│   │   └── types/                 ✅ Implementado
│   │
│   └── package.json               ✅ Implementado
│
├── .env.example                   ✅ Implementado
├── README.md                      🟡 Básico (Precisa expandir)
└── docker-compose.yml             ✅ Implementado
```

**Legenda:**
- ✅ Implementado e Funcional
- 🟡 Parcialmente Implementado
- ⏳ Pendente
- ❌ Não Implementado

---

## 📋 Checklist Detalhado por Fase

### Fase 0: Setup & Infraestrutura ✅ COMPLETO

#### 0.1 Ambiente de Desenvolvimento
- [x] Configurar Docker Compose
- [x] PostgreSQL container
- [x] Redis container
- [x] Variáveis de ambiente (.env)
- [x] Scripts de inicialização

#### 0.2 Backend - NestJS
- [x] Inicializar projeto NestJS
- [x] Configurar TypeScript
- [x] Instalar dependências essenciais
  - [x] Prisma
  - [x] JWT/Passport
  - [x] class-validator
  - [x] Bull/BullMQ
- [x] Configurar estrutura de pastas

#### 0.3 Frontend - Next.js
- [x] Inicializar projeto Next.js 14
- [x] Configurar TypeScript
- [x] Instalar shadcn/ui
- [x] Configurar Tailwind CSS
- [x] Instalar dependências
  - [x] React Query
  - [x] React Hook Form
  - [x] Zod
- [x] Configurar estrutura de pastas

#### 0.4 Database
- [x] Configurar Prisma
- [x] Criar schema inicial
- [x] Configurar migrations
- [x] Criar script de seed

---

### Fase 1: MVP - Etapa 1 do Desafio 🟡 70% COMPLETO

---

#### Sprint 1: Autenticação & Multi-Tenancy ✅ COMPLETO

**Objetivo**: Implementar sistema de autenticação seguro com JWT e garantir isolamento multi-tenant rigoroso.

**Backend:**
- [x] Criar módulo de autenticação
- [x] Implementar estratégia JWT
- [x] Criar Guards (JwtAuthGuard, OrganizationGuard)
- [x] Criar Decorators customizados
  - [x] @CurrentUser()
  - [x] @CurrentOrganization()
  - [x] @Public()
  - [x] @RequiresOrgAccess()
- [x] DTOs de Login e Register
- [x] Service de autenticação
- [x] Controller de autenticação
- [x] Hash de senhas (bcrypt)
- [x] Validação de tokens

**Frontend:**
- [x] Criar páginas de login e registro
- [x] Formulários com validação
- [x] AuthContext/Provider
- [x] Hook useAuth
- [x] API client com interceptor de token
- [x] Redirecionamentos após login

**Database:**
- [x] Tabela users
- [x] Tabela organizations
- [x] Relacionamento user <-> organization

**Testes Críticos:**
- [ ] ⚠️ **PENDENTE**: Teste E2E de registro
- [ ] ⚠️ **PENDENTE**: Teste E2E de login
- [ ] ⚠️ **PENDENTE**: Teste de isolamento multi-tenant
- [ ] ⚠️ **PENDENTE**: Teste de acesso negado cross-org

---

#### Sprint 2: CRUD de Produtos ✅ COMPLETO

**Objetivo**: Implementar CRUD completo de produtos com segurança multi-tenant.

**Backend:**
- [x] Criar módulo de produtos
- [x] ProductRepository com BaseRepository
- [x] ProductService com lógica de negócio
- [x] ProductController (área restrita)
- [x] DTOs (Create, Update, Filters)
- [x] Validações de campos
  - [x] name (3-255 caracteres)
  - [x] price (> 0, decimais)
  - [x] category (enum)
  - [x] stock_qty (>= 0)
  - [x] weight_grams (> 0)
- [x] Soft delete (deletedAt)
- [x] Filtros de listagem
- [x] Paginação

**Frontend:**
- [ ] ⚠️ **PENDENTE**: Dashboard de produtos
- [ ] ⚠️ **PENDENTE**: Listagem de produtos da ONG
- [ ] ⚠️ **PENDENTE**: Formulário de criação
- [ ] ⚠️ **PENDENTE**: Formulário de edição
- [ ] ⚠️ **PENDENTE**: Confirmação de exclusão
- [ ] ⚠️ **PENDENTE**: Upload de imagem

**Database:**
- [x] Tabela products
- [x] Campos obrigatórios
- [x] Índices (organization_id)
- [x] Relacionamento com organizations

**Testes Críticos:**
- [x] ✅ Teste unitário: ProductService.create
- [ ] ⚠️ **PENDENTE**: Teste E2E: Criar produto
- [ ] ⚠️ **PENDENTE**: Teste E2E: Listar produtos (apenas da org)
- [ ] ⚠️ **PENDENTE**: Teste E2E: Tentar acessar produto de outra org (deve falhar)

---

#### Sprint 3: Portal Público & Catálogo 🟡 50% COMPLETO

**Objetivo**: Criar portal público com listagem de produtos de todas as ONGs.

**Backend:**
- [x] PublicProductsController (sem autenticação)
- [x] Endpoint GET /public/products
  - [x] Paginação
  - [x] Filtros manuais (categoria, preço)
  - [x] Apenas produtos ativos
  - [x] Apenas produtos com estoque > 0
  - [x] Incluir info da organização
- [x] Endpoint GET /public/products/:id
- [x] Endpoint GET /public/categories

**Frontend:**
- [ ] ⚠️ **PENDENTE**: Página inicial do marketplace
- [ ] ⚠️ **PENDENTE**: Componente ProductGrid
- [ ] ⚠️ **PENDENTE**: Componente ProductCard
- [ ] ⚠️ **PENDENTE**: Componente ProductFilters
  - [ ] ⚠️ **PENDENTE**: Filtro por categoria
  - [ ] ⚠️ **PENDENTE**: Filtro por faixa de preço
  - [ ] ⚠️ **PENDENTE**: Ordenação (preço, data)
- [ ] ⚠️ **PENDENTE**: Componente Pagination
- [ ] ⚠️ **PENDENTE**: Página de detalhes do produto
- [ ] ⚠️ **PENDENTE**: Skeleton loaders
- [ ] ⚠️ **PENDENTE**: Empty states

**Testes:**
- [ ] ⚠️ **PENDENTE**: Teste E2E: Listar produtos públicos
- [ ] ⚠️ **PENDENTE**: Teste E2E: Filtrar por categoria
- [ ] ⚠️ **PENDENTE**: Teste E2E: Filtrar por preço
- [ ] ⚠️ **PENDENTE**: Teste: Produtos inativos não aparecem

---

#### Sprint 4: Busca Inteligente ✅ COMPLETO

**Objetivo**: Implementar busca com LLM e fallback resiliente.

**Backend:**
- [x] Criar módulo de busca
- [x] LLMService
  - [x] Integração com API LLM (OpenAI/Anthropic)
  - [x] Timeout configurável (3s)
  - [x] Prompt engineering
  - [x] Parsing de resposta JSON
- [x] TextSearchService (fallback)
  - [x] Busca por ILIKE em name/description
- [x] SearchService (orquestração)
  - [x] Tentar LLM primeiro
  - [x] Fallback em caso de erro/timeout
  - [x] Retornar metadados
- [x] SearchController
- [x] Logging de buscas
  - [x] query original
  - [x] filtros gerados
  - [x] ai_success (boolean)
  - [x] fallback_used (boolean)
  - [x] latency

**Frontend:**
- [ ] ⚠️ **PENDENTE**: SearchBar component
- [ ] ⚠️ **PENDENTE**: Debounce de input
- [ ] ⚠️ **PENDENTE**: Exibir interpretação da busca
- [ ] ⚠️ **PENDENTE**: Indicador de AI/Fallback
- [ ] ⚠️ **PENDENTE**: Loading states
- [ ] ⚠️ **PENDENTE**: Histórico de buscas

**Testes:**
- [ ] ⚠️ **PENDENTE**: Teste E2E: Busca com AI funcionando
- [ ] ⚠️ **PENDENTE**: Teste E2E: Busca com timeout (fallback)
- [ ] ⚠️ **PENDENTE**: Teste: Parsing de JSON inválido (fallback)
- [ ] ⚠️ **PENDENTE**: Teste: Logs de busca sendo criados

---

#### Sprint 5: Carrinho & Pedidos 🟡 40% COMPLETO

**Objetivo**: Permitir usuários adicionarem produtos ao carrinho e criarem pedidos.

**Backend:**
- [x] Criar módulo de pedidos
- [x] OrderRepository
- [x] OrderService
  - [x] Método createOrder (básico)
  - [ ] ⚠️ **PENDENTE**: Validação de estoque
  - [ ] ⚠️ **PENDENTE**: Cálculo de totais
  - [ ] ⚠️ **PENDENTE**: Snapshot de preços
- [x] OrderController
- [x] DTOs (CreateOrder, OrderItem)
- [ ] ⚠️ **PENDENTE**: Geração de order_number único
- [ ] ⚠️ **PENDENTE**: Status do pedido (pending, processing, confirmed, cancelled)

**Frontend:**
- [x] Hook useCart (Zustand)
  - [x] addItem
  - [x] removeItem
  - [x] updateQuantity
  - [x] clearCart
  - [x] Persistência em localStorage
- [x] Página de carrinho (básica)
- [ ] ⚠️ **PENDENTE**: CartItem component completo
- [ ] ⚠️ **PENDENTE**: CartSummary component
- [ ] ⚠️ **PENDENTE**: Página de checkout
- [ ] ⚠️ **PENDENTE**: Formulário de dados de entrega
- [ ] ⚠️ **PENDENTE**: Confirmação de pedido
- [ ] ⚠️ **PENDENTE**: Página de sucesso
- [ ] ⚠️ **PENDENTE**: Página de histórico de pedidos

**Database:**
- [x] Tabela orders
- [x] Tabela order_items
- [x] Relacionamentos
- [ ] ⚠️ **PENDENTE**: Índices otimizados

**Testes:**
- [ ] ⚠️ **PENDENTE**: Teste E2E: Adicionar ao carrinho
- [ ] ⚠️ **PENDENTE**: Teste E2E: Criar pedido
- [ ] ⚠️ **PENDENTE**: Teste E2E: Ver histórico de pedidos
- [ ] ⚠️ **PENDENTE**: Teste: Snapshot de preços no pedido

---

#### Sprint 6: Logs & Observabilidade ⏳ PENDENTE

**Objetivo**: Implementar logging estruturado para todas as operações.

**Backend:**
- [ ] ⚠️ **PENDENTE**: Configurar Winston
- [ ] ⚠️ **PENDENTE**: Formato JSON para logs
- [ ] ⚠️ **PENDENTE**: LoggingInterceptor global
  - [ ] ⚠️ **PENDENTE**: timestamp
  - [ ] ⚠️ **PENDENTE**: método
  - [ ] ⚠️ **PENDENTE**: rota
  - [ ] ⚠️ **PENDENTE**: status
  - [ ] ⚠️ **PENDENTE**: latência
  - [ ] ⚠️ **PENDENTE**: userId
  - [ ] ⚠️ **PENDENTE**: organizationId
  - [ ] ⚠️ **PENDENTE**: correlationId
- [ ] ⚠️ **PENDENTE**: Logs específicos para:
  - [ ] ⚠️ **PENDENTE**: Autenticação
  - [x] Buscas inteligentes (já implementado)
  - [ ] ⚠️ **PENDENTE**: Criação de pedidos
  - [ ] ⚠️ **PENDENTE**: Erros e exceções
- [ ] ⚠️ **PENDENTE**: Rotação de logs
- [ ] ⚠️ **PENDENTE**: Níveis de log (info, warn, error)

**Visualização:**
- [ ] ⚠️ **PENDENTE**: Documentar como visualizar logs
- [ ] ⚠️ **PENDENTE**: Exemplos de queries úteis

**Testes:**
- [ ] ⚠️ **PENDENTE**: Verificar formato dos logs
- [ ] ⚠️ **PENDENTE**: Teste: Logs contêm campos obrigatórios

---

### ✅ Checkpoint: Etapa 1 - MVP Completo

**Critérios de Aceitação:**
- [ ] ⚠️ **PENDENTE**: Usuário pode se registrar como ONG
- [ ] ⚠️ **PENDENTE**: ONG pode fazer login
- [ ] ⚠️ **PENDENTE**: ONG pode criar/editar/deletar produtos
- [ ] ⚠️ **PENDENTE**: Multi-tenancy testado (ONG A não vê produtos da ONG B)
- [ ] ⚠️ **PENDENTE**: Portal público exibe produtos de todas as ONGs
- [ ] ⚠️ **PENDENTE**: Filtros manuais funcionam
- [ ] ⚠️ **PENDENTE**: Busca inteligente funciona com AI + fallback
- [ ] ⚠️ **PENDENTE**: Consumidor pode adicionar ao carrinho
- [ ] ⚠️ **PENDENTE**: Consumidor pode criar pedido
- [ ] ⚠️ **PENDENTE**: Logs estruturados funcionando

---

### Fase 2: Arquitetura Avançada - Etapa 2 ⏳ PENDENTE

---

#### Sprint 7: Consistência de Estoque & Concorrência ⏳ PENDENTE

**Objetivo**: Garantir que estoque nunca fique negativo, mesmo sob alta concorrência.

**Backend:**
- [ ] ⚠️ **PENDENTE**: Refatorar OrderService.createOrder
  - [ ] ⚠️ **PENDENTE**: Implementar transação de banco
  - [ ] ⚠️ **PENDENTE**: Lock pessimista (FOR UPDATE)
  - [ ] ⚠️ **PENDENTE**: Validar estoque dentro da transação
  - [ ] ⚠️ **PENDENTE**: Baixa atômica de estoque
  - [ ] ⚠️ **PENDENTE**: Rollback em caso de erro
- [ ] ⚠️ **PENDENTE**: Configurar isolation level (Serializable)
- [ ] ⚠️ **PENDENTE**: Tratar deadlocks
- [ ] ⚠️ **PENDENTE**: Timeout de transação
- [ ] ⚠️ **PENDENTE**: Mensagens de erro claras
  - [ ] ⚠️ **PENDENTE**: Estoque insuficiente
  - [ ] ⚠️ **PENDENTE**: Timeout de lock
  - [ ] ⚠️ **PENDENTE**: Produto não encontrado

**Database:**
- [ ] ⚠️ **PENDENTE**: Índices para performance de locks
- [ ] ⚠️ **PENDENTE**: Constraint check (stock_qty >= 0)

**Testes Críticos:**
- [ ] ⚠️ **PENDENTE**: Teste de carga: 100 requisições simultâneas
- [ ] ⚠️ **PENDENTE**: Teste: Estoque nunca fica negativo
- [ ] ⚠️ **PENDENTE**: Teste: Apenas N pedidos bem-sucedidos para estoque N
- [ ] ⚠️ **PENDENTE**: Teste: Rollback em caso de falha
- [ ] ⚠️ **PENDENTE**: Teste: Deadlock handling

**Documentação:**
- [ ] ⚠️ **PENDENTE**: Explicar estratégia de locks
- [ ] ⚠️ **PENDENTE**: Diagrama de fluxo de transação
- [ ] ⚠️ **PENDENTE**: Trade-offs da solução

---

#### Sprint 8: Processamento Assíncrono & Resiliência ⏳ PENDENTE

**Objetivo**: Processar pagamentos e notificações de forma assíncrona com retry.

**Infraestrutura:**
- [ ] ⚠️ **PENDENTE**: Configurar Redis no docker-compose
- [ ] ⚠️ **PENDENTE**: Configurar Bull/BullMQ

**Backend:**
- [x] Criar módulo de jobs (estrutura básica existe)
- [ ] ⚠️ **PENDENTE**: PaymentProcessor
  - [ ] ⚠️ **PENDENTE**: Simular chamada a gateway
  - [ ] ⚠️ **PENDENTE**: Delay configurável
  - [ ] ⚠️ **PENDENTE**: Taxa de falha simulada
  - [ ] ⚠️ **PENDENTE**: Atualizar status do pedido
  - [ ] ⚠️ **PENDENTE**: Idempotência (checar se já processado)
- [ ] ⚠️ **PENDENTE**: NotificationProcessor
  - [ ] ⚠️ **PENDENTE**: Log de notificação para ONG
  - [ ] ⚠️ **PENDENTE**: Log de notificação para cliente
  - [ ] ⚠️ **PENDENTE**: Idempotência
- [ ] ⚠️ **PENDENTE**: Configurar filas
  - [ ] ⚠️ **PENDENTE**: payment-queue
  - [ ] ⚠️ **PENDENTE**: notification-queue
- [ ] ⚠️ **PENDENTE**: Retry strategies
  - [ ] ⚠️ **PENDENTE**: Exponential backoff
  - [ ] ⚠️ **PENDENTE**: Máximo de tentativas (3x)
- [ ] ⚠️ **PENDENTE**: Dead Letter Queue
- [ ] ⚠️ **PENDENTE**: Integrar com OrderService
  - [ ] ⚠️ **PENDENTE**: Enfileirar job após pedido criado
  - [ ] ⚠️ **PENDENTE**: Não bloquear resposta HTTP

**Monitoramento:**
- [ ] ⚠️ **PENDENTE**: Bull Board (UI para monitorar filas)
- [ ] ⚠️ **PENDENTE**: Logs de jobs
  - [ ] ⚠️ **PENDENTE**: Início
  - [ ] ⚠️ **PENDENTE**: Sucesso
  - [ ] ⚠️ **PENDENTE**: Falha
  - [ ] ⚠️ **PENDENTE**: Retentativa

**Testes:**
- [ ] ⚠️ **PENDENTE**: Teste E2E: Pedido criado → job enfileirado
- [ ] ⚠️ **PENDENTE**: Teste: Job de pagamento processa corretamente
- [ ] ⚠️ **PENDENTE**: Teste: Retry em caso de falha
- [ ] ⚠️ **PENDENTE**: Teste: Idempotência (processar 2x não duplica)
- [ ] ⚠️ **PENDENTE**: Teste: Dead Letter Queue após 3 falhas

**Documentação:**
- [ ] ⚠️ **PENDENTE**: Diagrama de arquitetura assíncrona
- [ ] ⚠️ **PENDENTE**: Explicar fluxo de jobs
- [ ] ⚠️ **PENDENTE**: Como monitorar filas

---

#### Sprint 9: Feature Avançada (Escolher UMA) ⏳ PENDENTE

**Escolha**: Opção B - Caching Distribuído (Recomendado para MVP)

##### 🅱️ Opção B: Otimização e Caching

**Objetivo**: Otimizar performance do portal público com cache Redis.

**Backend:**
- [ ] ⚠️ **PENDENTE**: Criar CacheModule
- [ ] ⚠️ **PENDENTE**: CacheService
  - [ ] ⚠️ **PENDENTE**: get(key)
  - [ ] ⚠️ **PENDENTE**: set(key, value, ttl)
  - [ ] ⚠️ **PENDENTE**: del(key)
  - [ ] ⚠️ **PENDENTE**: invalidate(pattern)
- [ ] ⚠️ **PENDENTE**: CacheInterceptor
- [ ] ⚠️ **PENDENTE**: Estratégias de cache
  - [ ] ⚠️ **PENDENTE**: Listagem de produtos (TTL: 5 min)
  - [ ] ⚠️ **PENDENTE**: Detalhes de produto (TTL: 15 min)
  - [ ] ⚠️ **PENDENTE**: Categorias (TTL: 1 hora)
  - [ ] ⚠️ **PENDENTE**: Resultados de busca (TTL: 10 min)
- [ ] ⚠️ **PENDENTE**: Invalidação de cache
  - [ ] ⚠️ **PENDENTE**: Ao criar produto
  - [ ] ⚠️ **PENDENTE**: Ao atualizar produto
  - [ ] ⚠️ **PENDENTE**: Ao deletar produto
  - [ ] ⚠️ **PENDENTE**: Ao mudar estoque
- [ ] ⚠️ **PENDENTE**: Cache tagging
  - [ ] ⚠️ **PENDENTE**: Tags por categoria
  - [ ] ⚠️ **PENDENTE**: Tags por organização
- [ ] ⚠️ **PENDENTE**: Warming de cache (opcional)

**Métricas:**
- [ ] ⚠️ **PENDENTE**: Hit rate do cache
- [ ] ⚠️ **PENDENTE**: Miss rate do cache
- [ ] ⚠️ **PENDENTE**: Latência com/sem cache

**Testes:**
- [ ] ⚠️ **PENDENTE**: Teste: Cache hit após primeira requisição
- [ ] ⚠️ **PENDENTE**: Teste: Cache miss após TTL expirar
- [ ] ⚠️ **PENDENTE**: Teste: Invalidação após update
- [ ] ⚠️ **PENDENTE**: Load test: Compare performance com/sem cache

**Documentação:**
- [ ] ⚠️ **PENDENTE**: Estratégia de caching explicada
- [ ] ⚠️ **PENDENTE**: TTLs e justificativas
- [ ] ⚠️ **PENDENTE**: Cenários de invalidação
- [ ] ⚠️ **PENDENTE**: Métricas de performance

---

##### 🅰️ Opção A: Busca Avançada (Alternativa)

**Objetivo**: Implementar Full-Text Search para busca mais eficiente.

**Backend:**
- [ ] ⚠️ **PENDENTE**: Configurar extensão pg_trgm no PostgreSQL
- [ ] ⚠️ **PENDENTE**: Criar índices GIN
  - [ ] ⚠️ **PENDENTE**: products.name
  - [ ] ⚠️ **PENDENTE**: products.description
- [ ] ⚠️ **PENDENTE**: Implementar ts_vector search
- [ ] ⚠️ **PENDENTE**: Ranking de relevância
- [ ] ⚠️ **PENDENTE**: Substituir ILIKE por FTS no fallback
- [ ] ⚠️ **PENDENTE**: Benchmark de performance

**Documentação:**
- [ ] ⚠️ **PENDENTE**: Comparativo ILIKE vs FTS
- [ ] ⚠️ **PENDENTE**: Métricas de performance
- [ ] ⚠️ **PENDENTE**: Configuração de índices

---

##### 🅲 Opção C: Logística Multi-Origem (Alternativa)

**Objetivo**: Calcular frete por ONG baseado em peso.

**Backend:**
- [ ] ⚠️ **PENDENTE**: ShippingService
  - [ ] ⚠️ **PENDENTE**: Calcular frete por ONG
  - [ ] ⚠️ **PENDENTE**: Fórmula: base_cost + (weight_kg * cost_per_kg)
- [ ] ⚠️ **PENDENTE**: Configuração de frete por ONG
  - [ ] ⚠️ **PENDENTE**: Adicionar campos à tabela organizations
  - [ ] ⚠️ **PENDENTE**: shipping_base_cost
  - [ ] ⚠️ **PENDENTE**: shipping_cost_per_kg
- [ ] ⚠️ **PENDENTE**: Atualizar OrderService
  - [ ] ⚠️ **PENDENTE**: Agrupar itens por ONG
  - [ ] ⚠️ **PENDENTE**: Calcular peso total por ONG
  - [ ] ⚠️ **PENDENTE**: Calcular frete por ONG
  - [ ] ⚠️ **PENDENTE**: Armazenar breakdown de frete

**Frontend:**
- [ ] ⚠️ **PENDENTE**: Exibir frete por ONG no carrinho
- [ ] ⚠️ **PENDENTE**: Exibir frete total
- [ ] ⚠️ **PENDENTE**: Agrupar itens por ONG visualmente
- [ ] ⚠️ **PENDENTE**: Configuração de frete (admin ONG)

**Database:**
- [ ] ⚠️ **PENDENTE**: shipping_breakdown (JSONB) em orders

**Documentação:**
- [ ] ⚠️ **PENDENTE**: Lógica de cálculo de frete
- [ ] ⚠️ **PENDENTE**: Exemplo de breakdown

---

### Fase 3: Testes & Documentação Final ⏳ PENDENTE

---

#### Sprint 10: Testes Automatizados ⏳ PENDENTE

**Objetivo**: Garantir cobertura de testes nas áreas críticas.

**Backend - Testes Unitários:**
- [ ] ⚠️ **PENDENTE**: AuthService
  - [ ] ⚠️ **PENDENTE**: register
  - [ ] ⚠️ **PENDENTE**: login
  - [ ] ⚠️ **PENDENTE**: validateUser
- [ ] ⚠️ **PENDENTE**: ProductService
  - [ ] ⚠️ **PENDENTE**: create
  - [ ] ⚠️ **PENDENTE**: findAll (com filtros)
  - [ ] ⚠️ **PENDENTE**: update
  - [ ] ⚠️ **PENDENTE**: delete
- [ ] ⚠️ **PENDENTE**: OrderService
  - [ ] ⚠️ **PENDENTE**: createOrder (com transação)
  - [ ] ⚠️ **PENDENTE**: validação de estoque
  - [ ] ⚠️ **PENDENTE**: cálculo de totais
- [ ] ⚠️ **PENDENTE**: SearchService
  - [ ] ⚠️ **PENDENTE**: intelligentSearch
  - [ ] ⚠️ **PENDENTE**: fallback
- [ ] ⚠️ **PENDENTE**: LLMService
  - [ ] ⚠️ **PENDENTE**: extractFilters
  - [ ] ⚠️ **PENDENTE**: timeout handling

**Backend - Testes de Integração:**
- [ ] ⚠️ **PENDENTE**: POST /auth/register
- [ ] ⚠️ **PENDENTE**: POST /auth/login
- [ ] ⚠️ **PENDENTE**: GET /products (com autenticação)
- [ ] ⚠️ **PENDENTE**: POST /products
- [ ] ⚠️ **PENDENTE**: GET /public/products
- [ ] ⚠️ **PENDENTE**: POST /public/search
- [ ] ⚠️ **PENDENTE**: POST /orders

**Backend - Testes E2E:**
- [ ] ⚠️ **PENDENTE**: Fluxo completo: Register → Login → Create Product → Public View
- [ ] ⚠️ **PENDENTE**: Fluxo de pedido: Add to Cart → Checkout → Create Order
- [ ] ⚠️ **PENDENTE**: Multi-tenancy: ONG A não acessa dados da ONG B
- [ ] ⚠️ **PENDENTE**: Concorrência: Múltiplos pedidos simultâneos
- [ ] ⚠️ **PENDENTE**: Busca: AI success e fallback

**Frontend - Testes (Opcional):**
- [ ] ⚠️ **PENDENTE**: Testes de componentes críticos
- [ ] ⚠️ **PENDENTE**: Testes de hooks (useAuth, useCart)
- [ ] ⚠️ **PENDENTE**: Testes de formulários

**Meta de Cobertura:**
- [ ] ⚠️ **PENDENTE**: Backend: Mínimo 70% de cobertura
- [ ] ⚠️ **PENDENTE**: Áreas críticas: 90%+ de cobertura
  - [ ] ⚠️ **PENDENTE**: Autenticação
  - [ ] ⚠️ **PENDENTE**: Multi-tenancy
  - [ ] ⚠️ **PENDENTE**: Criação de pedidos
  - [ ] ⚠️ **PENDENTE**: Controle de estoque

---

#### Sprint 11: Documentação Final ⏳ PENDENTE

**Objetivo**: Criar documentação completa e profissional para submissão.

**README.md Principal:**
- [ ] ⚠️ **PENDENTE**: Título e descrição do projeto
- [ ] ⚠️ **PENDENTE**: Badges (build status, cobertura, etc.)
- [ ] ⚠️ **PENDENTE**: Índice
- [ ] ⚠️ **PENDENTE**: Screenshots/GIFs
- [ ] ⚠️ **PENDENTE**: Pré-requisitos
- [ ] ⚠️ **PENDENTE**: Instalação passo a passo
  - [ ] ⚠️ **PENDENTE**: Clone do repositório
  - [ ] ⚠️ **PENDENTE**: Configuração de .env
  - [ ] ⚠️ **PENDENTE**: Docker Compose up
  - [ ] ⚠️ **PENDENTE**: Migrations
  - [ ] ⚠️ **PENDENTE**: Seed
- [ ] ⚠️ **PENDENTE**: Uso
  - [ ] ⚠️ **PENDENTE**: Acessar frontend
  - [ ] ⚠️ **PENDENTE**: Acessar backend
  - [ ] ⚠️ **PENDENTE**: Credenciais de teste
- [ ] ⚠️ **PENDENTE**: Arquitetura
  - [ ] ⚠️ **PENDENTE**: Diagrama de componentes
  - [ ] ⚠️ **PENDENTE**: Diagrama de fluxo
  - [ ] ⚠️ **PENDENTE**: Stack tecnológica
- [ ] ⚠️ **PENDENTE**: Database
  - [ ] ⚠️ **PENDENTE**: ERD (diagrama de entidades)
  - [ ] ⚠️ **PENDENTE**: Descrição de tabelas principais
- [ ] ⚠️ **PENDENTE**: API
  - [ ] ⚠️ **PENDENTE**: Endpoints principais
  - [ ] ⚠️ **PENDENTE**: Exemplos de requisições
  - [ ] ⚠️ **PENDENTE**: Autenticação
- [ ] ⚠️ **PENDENTE**: Busca Inteligente
  - [ ] ⚠️ **PENDENTE**: Como configurar LLM
  - [ ] ⚠️ **PENDENTE**: Variáveis de ambiente
  - [ ] ⚠️ **PENDENTE**: Timeout e fallback
  - [ ] ⚠️ **PENDENTE**: Exemplos de uso
- [ ] ⚠️ **PENDENTE**: Logs
  - [ ] ⚠️ **PENDENTE**: Formato dos logs
  - [ ] ⚠️ **PENDENTE**: Como visualizar
  - [ ] ⚠️ **PENDENTE**: Exemplos de queries
- [ ] ⚠️ **PENDENTE**: Etapa 2 (se aplicável)
  - [ ] ⚠️ **PENDENTE**: Diagrama de arquitetura assíncrona
  - [ ] ⚠️ **PENDENTE**: Explicação de concorrência
  - [ ] ⚠️ **PENDENTE**: Fluxo de jobs
  - [ ] ⚠️ **PENDENTE**: Idempotência
  - [ ] ⚠️ **PENDENTE**: Feature avançada escolhida
- [ ] ⚠️ **PENDENTE**: Decisões Técnicas
  - [ ] ⚠️ **PENDENTE**: Por que NestJS/Next.js
  - [ ] ⚠️ **PENDENTE**: Por que Prisma
  - [ ] ⚠️ **PENDENTE**: Estratégia de multi-tenancy
  - [ ] ⚠️ **PENDENTE**: Trade-offs
- [ ] ⚠️ **PENDENTE**: Limitações Conhecidas
- [ ] ⚠️ **PENDENTE**: Próximos Passos / Roadmap Futuro
- [ ] ⚠️ **PENDENTE**: Testes
  - [ ] ⚠️ **PENDENTE**: Como rodar
  - [ ] ⚠️ **PENDENTE**: Cobertura
- [ ] ⚠️ **PENDENTE**: Contribuição (se aplicável)
- [ ] ⚠️ **PENDENTE**: Licença
- [ ] ⚠️ **PENDENTE**: Contato

**Documentação Adicional:**
- [ ] ⚠️ **PENDENTE**: API.md (documentação detalhada de endpoints)
- [ ] ⚠️ **PENDENTE**: ARCHITECTURE.md (decisões arquiteturais)
- [ ] ⚠️ **PENDENTE**: DEPLOYMENT.md (guia de deploy)
- [ ] ⚠️ **PENDENTE**: CONTRIBUTING.md (se aplicável)

**Code Quality:**
- [ ] ⚠️ **PENDENTE**: Remover console.logs
- [ ] ⚠️ **PENDENTE**: Remover comentários desnecessários
- [ ] ⚠️ **PENDENTE**: Formatar código (Prettier)
- [ ] ⚠️ **PENDENTE**: Lint (ESLint) sem warnings
- [ ] ⚠️ **PENDENTE**: Remover código comentado
- [ ] ⚠️ **PENDENTE**: Remover imports não utilizados

**Verificações Finais:**
- [ ] ⚠️ **PENDENTE**: .env.example atualizado
- [ ] ⚠️ **PENDENTE**: .gitignore correto
- [ ] ⚠️ **PENDENTE**: Sem credenciais reais no código
- [ ] ⚠️ **PENDENTE**: Docker Compose funciona em máquina limpa
- [ ] ⚠️ **PENDENTE**: Seed cria dados de teste
- [ ] ⚠️ **PENDENTE**: Todos os scripts funcionam

---

#### Sprint 12: Polish & Submission ⏳ PENDENTE

**Checklist Final:**
- [ ] ⚠️ **PENDENTE**: Teste completo do fluxo E2E em ambiente limpo
- [ ] ⚠️ **PENDENTE**: Review de todos os documentos
- [ ] ⚠️ **PENDENTE**: Verificar se todas as etapas do desafio foram cumpridas
- [ ] ⚠️ **PENDENTE**: Criar repositório GitHub público
- [ ] ⚠️ **PENDENTE**: Push de todo o código
- [ ] ⚠️ **PENDENTE**: Criar releases/tags (v1.0.0)
- [ ] ⚠️ **PENDENTE**: Verificar README no GitHub
- [ ] ⚠️ **PENDENTE**: Adicionar LICENSE (se aplicável)
- [ ] ⚠️ **PENDENTE**: Screenshots no README
- [ ] ⚠️ **PENDENTE**: Verificar links
- [ ] ⚠️ **PENDENTE**: Review final de código
- [ ] ⚠️ **PENDENTE**: Submissão do link do repositório

---

## 📊 Progresso Geral

```
┌──────────────────────────────────────────┐
│  FASE 0: Setup & Infraestrutura          │
│  ████████████████████████  100%  ✅      │
└──────────────────────────────────────────┘

┌──────────────────────────────────────────┐
│  FASE 1: MVP - Etapa 1                   │
│  ██████████████░░░░░░░░░░  70%   🟡      │
│                                          │
│  Sprint 1: Auth & Multi-Tenancy   ✅     │
│  Sprint 2: CRUD Produtos          ✅     │
│  Sprint 3: Portal Público         🟡     │
│  Sprint 4: Busca Inteligente      ✅     │
│  Sprint 5: Carrinho & Pedidos     🟡     │
│  Sprint 6: Logs                   ⏳     │
└──────────────────────────────────────────┘

┌──────────────────────────────────────────┐
│  FASE 2: Arquitetura Avançada - Etapa 2  │
│  ░░░░░░░░░░░░░░░░░░░░░░░░  0%    ⏳      │
│                                          │
│  Sprint 7: Consistência Estoque   ⏳     │
│  Sprint 8: Processamento Async    ⏳     │
│  Sprint 9: Feature Avançada       ⏳     │
└──────────────────────────────────────────┘

┌──────────────────────────────────────────┐
│  FASE 3: Testes & Documentação           │
│  ░░░░░░░░░░░░░░░░░░░░░░░░  0%    ⏳      │
│                                          │
│  Sprint 10: Testes                ⏳     │
│  Sprint 11: Documentação          ⏳     │
│  Sprint 12: Polish & Submission   ⏳     │
└──────────────────────────────────────────┘

PROGRESSO TOTAL: ████████░░░░░░░░░░░  35%
```

---

## 🎯 Próximos Passos Imediatos

### 🔥 Prioridade ALTA (Para completar Etapa 1)

1. **Sprint 3: Completar Portal Público**
   - [ ] Criar página inicial do marketplace
   - [ ] Implementar ProductGrid e ProductCard
   - [ ] Implementar filtros de categoria e preço
   - [ ] Adicionar paginação

2. **Sprint 5: Completar Carrinho & Pedidos**
   - [ ] Finalizar página de carrinho
   - [ ] Criar página de checkout
   - [ ] Implementar validação de estoque (básica)
   - [ ] Criar página de confirmação

3. **Sprint 6: Logs Estruturados**
   - [ ] Configurar Winston
   - [ ] Implementar LoggingInterceptor
   - [ ] Adicionar logs específicos

4. **Dashboard da ONG (Faltando)**
   - [ ] Criar área de gestão de produtos
   - [ ] Listar produtos da ONG
   - [ ] Formulário de criação
   - [ ] Formulário de edição

### ⚠️ Prioridade MÉDIA (Para qualidade da Etapa 1)

5. **Testes Críticos**
   - [ ] Testes E2E de multi-tenancy
   - [ ] Testes de criação de pedido
   - [ ] Testes de busca

6. **Documentação MVP**
   - [ ] Atualizar README com instruções completas
   - [ ] Documentar endpoints da API
   - [ ] Adicionar screenshots

### 🚀 Prioridade BAIXA (Etapa 2)

7. **Sprint 7: Consistência de Estoque**
8. **Sprint 8: Processamento Assíncrono**
9. **Sprint 9: Feature Avançada (Caching recomendado)**

---

## ⚡ Quick Start para Continuar Desenvolvimento

```bash
# 1. Verificar status dos servidores
lsof -i:3333  # Backend
lsof -i:3000  # Frontend

# 2. Iniciar servidores (se não estiverem rodando)
cd back-nestjs && npm run start:dev &
cd front-next && npm run dev &

# 3. Verificar banco de dados
cd back-nestjs
npx prisma studio

# 4. Ver logs em tempo real
tail -f back-nestjs/logs/app.log  # (quando implementado)

# 5. Rodar testes
cd back-nestjs
npm run test
npm run test:e2e

# 6. Rodar migrations
npx prisma migrate dev

# 7. Resetar banco (cuidado!)
npx prisma migrate reset
```

---

## 📌 Notas Importantes

### ✅ O Que Está Funcionando Bem
- Autenticação com JWT
- Multi-tenancy no backend
- Busca inteligente com LLM + fallback
- CRUD de produtos
- Estrutura de projetos bem organizada
- Docker Compose configurado

### ⚠️ Pontos de Atenção
- **Frontend**: Falta implementar muitas páginas (dashboard ONG, checkout, etc.)
- **Testes**: Praticamente sem testes automatizados
- **Logs**: Não implementado ainda
- **Documentação**: README básico, precisa expandir
- **Etapa 2**: Não iniciada (concorrência, async, caching)

### 🎯 Para Impressionar nos Testes
1. **Multi-tenancy impecável**: Testes rigorosos provando isolamento
2. **Busca inteligente funcionando**: Com fallback resiliente
3. **Concorrência de estoque**: Provar que não oversell
4. **Async jobs com retry**: Idempotência correta
5. **Documentação excelente**: README completo, diagramas, decisões técnicas
6. **Testes abrangentes**: Cobertura alta em áreas críticas

---

## 🔗 Referências e Recursos

- [Documentação NestJS](https://docs.nestjs.com/)
- [Documentação Next.js 14](https://nextjs.org/docs)
- [Prisma Docs](https://www.prisma.io/docs)
- [BullMQ Docs](https://docs.bullmq.io/)
- [PostgreSQL Concurrency](https://www.postgresql.org/docs/current/mvcc.html)
- [Multi-Tenancy Patterns](https://docs.microsoft.com/en-us/azure/architecture/guide/multitenant/considerations/tenancy-models)

---

**Última Atualização**: 11/11/2025 - 14:30  
**Versão**: 1.0.0  
**Autor**: Victor (Tech Lead)