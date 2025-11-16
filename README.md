# 🛍️ Multi-ONG Marketplace

> Plataforma de marketplace multi-tenant para organizações sem fins lucrativos (ONGs) venderem produtos e serviços, com busca inteligente baseada em IA e controle robusto de estoque.

[![NestJS](https://img.shields.io/badge/NestJS-11.0-E0234E?logo=nestjs)](https://nestjs.com/)
[![Next.js](https://img.shields.io/badge/Next.js-15.5-000000?logo=next.js)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.7-3178C6?logo=typescript)](https://www.typescriptlang.org/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-16-336791?logo=postgresql)](https://www.postgresql.org/)
[![Redis](https://img.shields.io/badge/Redis-7-DC382D?logo=redis)](https://redis.io/)

---

## 📋 Índice

- [Visão Geral](#-visão-geral)
- [Arquitetura](#-arquitetura)
- [Tecnologias](#-tecnologias)
- [Pré-requisitos](#-pré-requisitos)
- [Instalação e Configuração](#-instalação-e-configuração)
- [Executando Localmente](#-executando-localmente)
- [Esquema do Banco de Dados](#-esquema-do-banco-de-dados)
- [Rotas da API](#-rotas-da-api)
- [Busca Inteligente com IA](#-busca-inteligente-com-ia)
- [Sistema de Logs](#-sistema-de-logs)
- [Controle de Concorrência de Estoque](#-controle-de-concorrência-de-estoque)
- [Processamento Assíncrono](#-processamento-assíncrono)
- [Idempotência](#-idempotência)
- [Cache Distribuído](#-cache-distribuído)
- [Testes](#-testes)
- [Decisões de Design](#-decisões-de-design)
- [Trade-offs e Limitações](#-trade-offs-e-limitações)
- [Próximos Passos](#-próximos-passos)

---

## 🎯 Visão Geral

O **Multi-ONG Marketplace** é uma plataforma completa que permite que múltiplas organizações sem fins lucrativos (ONGs) gerenciem e vendam seus produtos em um marketplace unificado.

### Principais Funcionalidades

✅ **Autenticação e Autorização** - JWT com refresh tokens e múltiplos níveis de acesso  
✅ **Gestão de Produtos** - CRUD completo com soft delete e controle de estoque  
✅ **Sistema de Pedidos** - Validação de estoque com locks pessimistas e processamento assíncrono  
✅ **Busca Inteligente** - Processamento de linguagem natural com OpenAI e fallback automático  
✅ **Cache Distribuído** - Redis para cache de listagens com invalidação inteligente  

---

## 🏗️ Arquitetura

### Diagrama Simplificado

```
┌──────────────┐
│  Next.js     │
│  Frontend    │
└──────┬───────┘
       │ REST API
       ▼
┌──────────────┐     ┌──────────┐     ┌──────────┐
│   NestJS     │────▶│PostgreSQL│     │  OpenAI  │
│   Backend    │     └──────────┘     └──────────┘
└──────┬───────┘
       │
       ▼
┌──────────────┐
│    Redis     │
│ Cache+Queue  │
└──────────────┘
```

Para diagramas detalhados, consulte [ARCHITECTURE.md](./docs/ARCHITECTURE.md).

---

## 🛠️ Tecnologias

### Backend
- **NestJS 11.0** - Framework principal
- **Prisma 6.19** - ORM e migrations
- **PostgreSQL 16** - Banco de dados
- **Redis 7** - Cache e filas
- **Bull 4.16** - Processamento assíncrono
- **Winston 3.18** - Sistema de logs

### Frontend
- **Next.js 15.5** - Framework React
- **NextAuth 5.0** - Autenticação
- **TanStack Query 5.90** - State management
- **Tailwind CSS 4.x** - Estilização

---

## 📦 Pré-requisitos

- Node.js >= 20.x
- npm >= 10.x
- Docker >= 24.x
- Docker Compose >= 2.x

---

## ⚙️ Instalação e Configuração

### 1. Clonar Repositório

```bash
git clone https://github.com/seu-usuario/test-multi-ong.git
cd test-multi-ong
```

### 2. Configurar Backend

```bash
cd back-nestjs
npm install
cp .env.example .env
```

**Edite o arquivo `.env`:**

```bash
# Database
DATABASE_URL="postgresql://postgres:postgres@localhost:5433/marketplace"

# JWT
JWT_SECRET=your-super-secret-jwt-key-change-in-production
JWT_REFRESH_SECRET=your-super-secret-refresh-key-change-in-production

# OpenAI (para busca inteligente)
OPENAI_API_KEY=sk-your-openai-api-key-here
OPENAI_TIMEOUT=3000

# Redis
REDIS_HOST=localhost
REDIS_PORT=6379

# Server
PORT=3333
NODE_ENV=development
```

### 3. Configurar Frontend

```bash
cd ../front-next
npm install
cp .env.local.example .env.local
```

**Edite o arquivo `.env.local`:**

```bash
NEXT_PUBLIC_API_URL=http://localhost:3333/api
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-nextauth-secret-key
DATABASE_URL="postgresql://postgres:postgres@localhost:5433/marketplace"
```

---

## 🚀 Executando Localmente

### Usando Docker Compose (Recomendado)

```bash
cd back-nestjs

# Iniciar PostgreSQL e Redis
docker compose up -d

# Verificar status
docker compose ps
```

**Serviços:**
- PostgreSQL: `localhost:5433`
- Redis: `localhost:6379`

### Configurar Banco de Dados

```bash
# Executar migrations
npx prisma migrate dev

# Seed inicial (dados de exemplo)
npx prisma db seed
```

### Iniciar Backend

```bash
npm run start:dev
# Servidor: http://localhost:3333
```

### Iniciar Frontend

```bash
cd ../front-next
npm run dev
# Aplicação: http://localhost:3000
```

### Credenciais de Teste

**Cliente:**
```
Email: customer@test.com
Senha: password123
```

**ONG Manager:**
```
Email: manager@ong1.com
Senha: password123
```

---

## 🗄️ Esquema do Banco de Dados

### Principais Entidades

**Users** - Usuários do sistema (admin, ong_manager, ong_staff, customer)  
**Organizations** - ONGs cadastradas  
**Products** - Produtos das ONGs  
**Orders** - Pedidos dos clientes  
**OrderItems** - Itens de cada pedido  
**SearchLogs** - Logs de buscas realizadas  

### Relacionamentos

- Users N:1 Organizations
- Organizations 1:N Products
- Users 1:N Orders
- Orders 1:N OrderItems
- Products 1:N OrderItems

Para o ERD completo, consulte [DATABASE.md](./docs/DATABASE.md).

---

## 🔌 Rotas da API

Base URL: `http://localhost:3333/api`

### Rotas Públicas

| Método | Endpoint | Descrição |
|--------|----------|-----------|
| `POST` | `/auth/register` | Registrar usuário |
| `POST` | `/auth/login` | Login |
| `GET` | `/public/products` | Listar produtos |
| `GET` | `/public/products/:id` | Detalhes do produto |
| `POST` | `/public/search` | Busca inteligente |
| `GET` | `/organizations` | Listar ONGs |

### Rotas Protegidas (Requerem JWT)

| Método | Endpoint | Descrição | Permissão |
|--------|----------|-----------|-----------|
| `GET` | `/auth/me` | Perfil atual | Todos |
| `POST` | `/products` | Criar produto | ONG |
| `GET` | `/products` | Listar produtos da ONG | ONG |
| `PATCH` | `/products/:id` | Atualizar produto | ONG |
| `POST` | `/orders` | Criar pedido | Cliente |
| `GET` | `/orders` | Meus pedidos | Cliente |

**Exemplo de uso:**

```bash
# Login
curl -X POST http://localhost:3333/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"customer@test.com","password":"password123"}'

# Busca inteligente
curl -X POST http://localhost:3333/api/public/search \
  -H "Content-Type: application/json" \
  -d '{"query":"doces até 50 reais"}'
```

Para documentação completa, consulte [API.md](./docs/API.md) ou o arquivo `back-nestjs/api.http`.

---

## 🤖 Busca Inteligente com IA

### Como Funciona

A busca inteligente usa **OpenAI GPT-4o-mini** para interpretar consultas em linguagem natural e convertê-las em filtros estruturados.

**Fluxo:**

```
Query: "doces artesanais até 50 reais"
   │
   ▼
┌──────────────┐
│ LLM Service  │ ──▶ OpenAI API (timeout: 3s)
└──────────────┘
   │
   ▼
{
  "category": "Doces",
  "priceMax": 50,
  "keywords": ["artesanal"]
}
   │
   ▼
┌──────────────┐
│  Database    │ ──▶ Produtos filtrados
└──────────────┘
```

### Configuração

**Variáveis de Ambiente:**

```bash
OPENAI_API_KEY=sk-your-key-here
OPENAI_API_URL=https://api.openai.com/v1/chat/completions
OPENAI_MODEL=gpt-4o-mini
OPENAI_TIMEOUT=3000  # 3 segundos
```

### Mecanismo de Fallback

Se a IA falhar (timeout, erro, API indisponível), o sistema automaticamente usa **busca textual** tradicional:

```typescript
// Circuit Breaker Pattern
if (failureCount >= 3) {
  // Abre circuito por 2 minutos
  useFallback = true;
}
```

**Indicadores na resposta:**

```json
{
  "meta": {
    "aiSuccess": false,
    "fallbackUsed": true,
    "latency": 3005
  }
}
```

### Performance

- **AI Success**: ~250ms
- **Fallback**: ~50ms
- **Timeout**: 3000ms (configurável)

---

## 📊 Sistema de Logs

### Formato dos Logs

**Desenvolvimento** (pretty print):
```
2025-01-15 10:30:45 [info] [ProductsService] Product created
{
  "productId": "uuid",
  "organizationId": "uuid"
}
```

**Produção** (JSON estruturado):
```json
{
  "timestamp": "2025-01-15T10:30:45.123Z",
  "level": "info",
  "context": "ProductsService",
  "message": "Product created",
  "productId": "uuid",
  "organizationId": "uuid"
}
```

### Como Visualizar

**Console (desenvolvimento):**
```bash
npm run start:dev
```

**Arquivos (produção):**
```bash
# Todos os logs
tail -f logs/combined.log

# Apenas erros
tail -f logs/error.log
```

### Configuração

```bash
LOG_LEVEL=info          # debug, info, warn, error
LOG_FORMAT=json         # json ou pretty
LOG_CACHE_ACCESS=false  # Log de cache hits/misses
```

### Logs de Busca

Todas as buscas são registradas na tabela `search_logs`:

```sql
SELECT 
  query,
  ai_success,
  fallback_used,
  latency,
  results_count,
  created_at
FROM search_logs
ORDER BY created_at DESC
LIMIT 10;
```

---

## 🔒 Controle de Concorrência de Estoque

### Problema

Múltiplos clientes tentando comprar o último item simultaneamente podem causar **overselling** (vender mais do que há em estoque).

### Solução Implementada

**1. Lock Pessimista (FOR UPDATE)**

```typescript
// Ordena IDs para prevenir deadlocks
const productIds = items.map(i => i.productId).sort();

// Lock pessimista
await tx.$queryRawUnsafe(
  `SELECT id FROM products WHERE id IN (${placeholders}) FOR UPDATE`,
  ...productIds
);
```

**2. Transação Serializable**

```typescript
await prisma.$transaction(
  async (tx) => {
    // Lock produtos
    // Validar estoque
    // Criar pedido
    // Decrementar estoque atomicamente
  },
  {
    isolationLevel: 'Serializable',
    maxWait: 5000,
    timeout: 10000
  }
);
```

**3. Decremento Atômico**

```typescript
await tx.product.update({
  where: { id: productId },
  data: {
    stockQty: { decrement: quantity }
  }
});
```

### Garantias

✅ **Atomicidade** - Tudo ou nada  
✅ **Consistência** - Estoque sempre correto  
✅ **Isolamento** - Transações não interferem  
✅ **Durabilidade** - Dados persistidos  

### Teste de Concorrência

```bash
npm run test:concurrency
```

O teste simula 3 clientes tentando comprar 10 unidades simultaneamente de um produto com apenas 10 em estoque. Apenas 1 deve ter sucesso.

---

## ⚡ Processamento Assíncrono

### Arquitetura

```
┌─────────────┐
│   Cliente   │
└──────┬──────┘
       │ POST /orders
       ▼
┌──────────────────┐
│  Orders Service  │
│  1. Valida       │
│  2. Cria pedido  │
│  3. Enfileira    │
└──────┬───────────┘
       │ 201 Created (resposta imediata)
       ▼
┌──────────────────┐
│   Bull Queue     │
│   (Redis)        │
└──────┬───────────┘
       │ Processa assincronamente
       ▼
┌──────────────────┐
│ Payment Processor│
│  1. Valida       │
│  2. Processa     │
│  3. Atualiza     │
└──────────────────┘
```

### Implementação

**Enfileirar job:**

```typescript
await this.paymentQueue.add(
  'process-payment',
  { orderId: order.id },
  {
    attempts: 3,
    backoff: {
      type: 'exponential',
      delay: 2000  // 2s, 4s, 8s
    }
  }
);
```

**Processar job:**

```typescript
@Process('process-payment')
async handlePayment(job: Job<{ orderId: string }>) {
  const { orderId } = job.data;
  
  try {
    // Simula processamento de pagamento
    await this.processPayment(orderId);
    
    // Atualiza status
    await this.ordersService.confirmPayment(orderId, {
      transactionId: 'TXN-' + Date.now()
    });
  } catch (error) {
    await this.ordersService.failPayment(orderId, error.message);
    throw error; // Retry automático
  }
}
```

### Benefícios

- **Resposta rápida** - Cliente não espera processamento
- **Resiliência** - Retry automático em caso de falha
- **Escalabilidade** - Processa em background
- **Monitoramento** - Dashboard Bull Board

---

## 🔑 Idempotência

### Problema

Cliente pode enviar o mesmo pedido múltiplas vezes (duplo clique, timeout, retry).

### Solução

**Idempotency Key** - Chave única fornecida pelo cliente:

```typescript
{
  "items": [...],
  "paymentMethod": "credit_card",
  "idempotencyKey": "unique-key-12345"  // UUID gerado pelo cliente
}
```

**Verificação:**

```typescript
if (dto.idempotencyKey) {
  const existingOrder = await prisma.order.findUnique({
    where: { idempotencyKey: dto.idempotencyKey }
  });
  
  if (existingOrder) {
    return existingOrder;  // Retorna pedido existente
  }
}
```

### Garantias

✅ Mesmo pedido não é criado duas vezes  
✅ Cliente recebe resposta consistente  
✅ Estoque não é decrementado duplicadamente  

---

## 💾 Cache Distribuído

### Estratégia

**Cache-Aside Pattern** com Redis:

```
Request ──▶ Cache? ──Yes──▶ Return
              │
              No
              ▼
           Database ──▶ Store in Cache ──▶ Return
```

### Recursos Cacheados

| Recurso | TTL | Invalidação |
|---------|-----|-------------|
| Listagem de produtos | 5 min | CREATE/UPDATE/DELETE |
| Detalhes do produto | 10 min | UPDATE/DELETE |
| Busca pública | 5 min | Qualquer mutação |

### Uso

**Automático com decorator:**

```typescript
@Get()
@Cacheable({ ttl: 300, keyPrefix: 'products:list' })
findAll(@Query() filters: ProductFiltersDto) {
  return this.productsService.findAll(filters);
}
```

**Manual:**

```typescript
const cached = await this.cacheService.get('key');
if (cached) return cached;

const data = await this.fetchData();
await this.cacheService.set('key', data, { ttl: 600 });
return data;
```

### Métricas

```bash
curl http://localhost:3333/api/cache/metrics
```

```json
{
  "inMemory": {
    "hits": 150,
    "misses": 20,
    "hitRate": "88.24%"
  },
  "persistent": {
    "hits": 5200,
    "misses": 980,
    "hitRate": "84.14%"
  }
}
```

Para detalhes, consulte [CACHING_STRATEGY.md](./back-nestjs/docs/CACHING_STRATEGY.md).

---

## 🧪 Testes

### Executar Testes

```bash
cd back-nestjs

# Todos os testes
npm test

# E2E
npm run test:e2e

# Específicos
npm run test:concurrency    # Controle de estoque
npm run test:search         # Busca inteligente
npm run test:security       # Multi-tenancy

# Com cobertura
npm run test:cov
```

### Testes Implementados

**E2E Tests:**
- ✅ `stock-concurrency.e2e-spec.ts` - Prevenção de overselling
- ✅ `intelligent-search.e2e-spec.ts` - Busca com IA e fallback
- ✅ `multi-tenant-security.e2e-spec.ts` - Isolamento de dados
- ✅ `cache-performance.e2e-spec.ts` - Performance de cache

---

## 🎨 Decisões de Design

### 1. Multi-Tenancy por Organization ID

**Decisão:** Usar `organizationId` como chave de isolamento.

**Razão:**
- Simplicidade de implementação
- Performance (single database)
- Facilita queries cross-tenant (admin)

**Alternativas consideradas:**
- Schema por tenant (complexo)
- Database por tenant (caro)

### 2. Lock Pessimista para Estoque

**Decisão:** `SELECT FOR UPDATE` com ordenação de IDs.

**Razão:**
- Garante consistência total
- Previne race conditions
- Simples de implementar

**Trade-off:**
- Menor throughput em alta concorrência
- Possibilidade de deadlocks (mitigado com ordenação)

### 3. Processamento Assíncrono de Pagamentos

**Decisão:** Enfileirar pagamentos com Bull/Redis.

**Razão:**
- Resposta rápida ao cliente
- Retry automático
- Escalabilidade

**Trade-off:**
- Complexidade adicional
- Eventual consistency

### 4. Cache-Aside com Redis

**Decisão:** Cache manual com invalidação explícita.

**Razão:**
- Controle fino sobre o que cachear
- Invalidação precisa
- Flexibilidade

**Alternativas:**
- Write-through (mais complexo)
- Read-through (menos controle)

### 5. Circuit Breaker para IA

**Decisão:** Abrir circuito após 3 falhas por 2 minutos.

**Razão:**
- Protege contra falhas da API externa
- Fallback automático
- Recuperação automática

---

## ⚠️ Trade-offs e Limitações

### Limitações Conhecidas

**1. Cache Staleness**
- Dados podem estar desatualizados por até TTL segundos
- **Mitigação:** TTLs curtos (5-10 min) e invalidação agressiva

**2. Lock Pessimista**
- Reduz throughput em alta concorrência
- **Mitigação:** Ordenação de IDs previne deadlocks

**3. Pattern Matching no Redis**
- `KEYS` pode ser lento com muitas chaves
- **Mitigação:** Usar `SCAN` em produção (próximo passo)

**4. Single Point of Failure**
- Redis único pode causar indisponibilidade
- **Mitigação:** Redis Sentinel ou Cluster (futuro)

**5. Eventual Consistency**
- Pagamentos processados assincronamente
- **Mitigação:** Status claro para o cliente

### Performance

**Benchmarks:**
- Listagem de produtos (cache hit): ~25ms
- Listagem de produtos (cache miss): ~150ms
- Criação de pedido: ~200-500ms
- Busca com IA: ~250ms
- Busca com fallback: ~50ms

---

## 🚀 Próximos Passos

### Curto Prazo (1-2 sprints)

- [ ] Implementar Redis Sentinel para alta disponibilidade
- [ ] Substituir `KEYS` por `SCAN` no cache
- [ ] Adicionar rate limiting por IP
- [ ] Implementar upload de imagens (S3/CloudFlare)
- [ ] Dashboard de métricas em tempo real

### Médio Prazo (1-2 meses)

- [ ] Implementar notificações (email/SMS)
- [ ] Sistema de reviews e avaliações
- [ ] Integração com gateways de pagamento reais
- [ ] Relatórios e analytics para ONGs
- [ ] API GraphQL

### Longo Prazo (3-6 meses)

- [ ] Mobile app (React Native)
- [ ] Sistema de recomendações com ML
- [ ] Multi-região com replicação
- [ ] Marketplace de serviços (além de produtos)
- [ ] Programa de afiliados

---

## 📚 Documentação Adicional

- [Estratégia de Cache](./back-nestjs/docs/CACHING_STRATEGY.md)
- [Exemplos de API](./back-nestjs/api.http)
- [Prisma Schema](./back-nestjs/prisma/schema.prisma)

---

## 📄 Licença

Este projeto é privado e proprietário.

---

## 👥 Contato

Para dúvidas ou sugestões, entre em contato com a equipe de desenvolvimento.

---

**Desenvolvido com ❤️ para apoiar ONGs brasileiras**
