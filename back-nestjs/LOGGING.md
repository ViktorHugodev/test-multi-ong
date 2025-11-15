# 📊 Sistema de Logging e Observabilidade

## 📋 Índice

- [Visão Geral](#visão-geral)
- [Arquitetura de Logging](#arquitetura-de-logging)
- [Logs Estruturados HTTP](#logs-estruturados-http)
- [Logs de Busca Inteligente](#logs-de-busca-inteligente)
- [Configuração Winston](#configuração-winston)
- [Jobs e Dead Letter Queue](#jobs-e-dead-letter-queue)
- [Variáveis de Ambiente](#variáveis-de-ambiente)
- [Exemplos de Uso](#exemplos-de-uso)
- [Monitoramento](#monitoramento)

---

## 📊 Visão Geral

O sistema de logging foi implementado seguindo **best practices** de observabilidade em produção:

- ✅ **Logs estruturados em JSON** para fácil parsing
- ✅ **Winston logger** com formatação customizável
- ✅ **Tracking de usuários** e organizações
- ✅ **Métricas de performance** (latência)
- ✅ **Dead Letter Queue** para jobs falhados
- ✅ **Logs específicos** para busca inteligente

### Características

- **Formato JSON em produção** para integração com ferramentas (ELK, Datadog, CloudWatch)
- **Formato legível em desenvolvimento** para debugging
- **Campos obrigatórios** conforme requisitos do desafio
- **Logs de jobs assíncronos** com rastreamento de tentativas

---

## 🏗️ Arquitetura de Logging

```
┌─────────────────────────────────────────────────────────┐
│                   HTTP Request                          │
└───────────────────────┬─────────────────────────────────┘
                        │
                        ▼
          ┌─────────────────────────────┐
          │   LoggingInterceptor        │
          │  (Global Interceptor)       │
          └─────────────┬───────────────┘
                        │
          ┌─────────────┴───────────────┐
          │                             │
          ▼                             ▼
   ┌──────────────┐            ┌──────────────┐
   │   Winston    │            │  SearchLog   │
   │   Logger     │            │  (Database)  │
   └──────────────┘            └──────────────┘
          │                             │
          ▼                             ▼
   ┌──────────────┐            ┌──────────────┐
   │   Console    │            │  AI Search   │
   │   /File      │            │  Analytics   │
   └──────────────┘            └──────────────┘
```

---

## 📝 Logs Estruturados HTTP

### Localização

**Arquivo**: `src/common/interceptors/logging.interceptor.ts`

### Campos Registrados

Todos os logs HTTP incluem os seguintes campos conforme requisito do desafio:

```typescript
{
  timestamp: "2025-01-15T12:34:56.789Z",    // ISO 8601
  route: "/api/products",                    // Rota acessada
  method: "GET",                             // Método HTTP
  status: 200,                               // Status code
  latency: 45,                               // Latência em ms
  userId: "uuid-do-usuario",                 // ID do usuário (se autenticado)
  organizationId: "uuid-da-ong",             // ID da organização (se aplicável)
  userAgent: "Mozilla/5.0...",               // User agent
  ip: "192.168.1.1"                          // IP do cliente
}
```

### Logs de Erro

Em caso de erro, campos adicionais são incluídos:

```typescript
{
  // ... campos normais ...
  error: "Error message",                    // Mensagem de erro
  stack: "Error stack trace..."              // Stack trace (apenas em dev)
}
```

### Formato por Ambiente

**Desenvolvimento** (`NODE_ENV=development`):
```
[2025-01-15 12:34:56] [info] [HTTP] ← GET /api/products - 200 - 45ms - User: uuid - Org: uuid
```

**Produção** (`NODE_ENV=production`):
```json
{"timestamp":"2025-01-15T12:34:56.789Z","route":"/api/products","method":"GET","status":200,"latency":45,"userId":"uuid","organizationId":"uuid"}
```

### Forçar Formato JSON

Para forçar formato JSON mesmo em desenvolvimento:

```bash
LOG_FORMAT=json npm run start:dev
```

---

## 🔍 Logs de Busca Inteligente

### Localização

**Tabela**: `search_logs` (PostgreSQL)
**Service**: `src/modules/search/search.service.ts`

### Campos Persistidos

```sql
CREATE TABLE search_logs (
  id              UUID PRIMARY KEY,
  query           TEXT,           -- Texto de entrada do usuário
  filters         JSONB,          -- Filtros gerados pela AI
  ai_success      BOOLEAN,        -- Se AI funcionou
  fallback_used   BOOLEAN,        -- Se fallback foi usado
  latency         INTEGER,        -- Latência em ms
  results_count   INTEGER,        -- Quantidade de resultados
  created_at      TIMESTAMP
);
```

### Exemplo de Registro

```json
{
  "id": "uuid",
  "query": "doces até 50 reais",
  "filters": {
    "category": "Doces",
    "priceMax": 50,
    "keywords": ["doce"]
  },
  "aiSuccess": true,
  "fallbackUsed": false,
  "latency": 850,
  "resultsCount": 12,
  "createdAt": "2025-01-15T12:34:56Z"
}
```

### Analytics

Estes logs permitem análises como:

```sql
-- Taxa de sucesso da AI
SELECT
  COUNT(*) FILTER (WHERE ai_success = true) * 100.0 / COUNT(*) as success_rate
FROM search_logs;

-- Latência média AI vs Fallback
SELECT
  ai_success,
  AVG(latency) as avg_latency
FROM search_logs
GROUP BY ai_success;

-- Queries mais populares
SELECT
  query,
  COUNT(*) as count
FROM search_logs
GROUP BY query
ORDER BY count DESC
LIMIT 10;
```

---

## ⚙️ Configuração Winston

### Localização

**Arquivo**: `src/common/logger/winston-logger.config.ts`

### Níveis de Log

```
error   → Erros críticos
warn    → Avisos importantes
info    → Informações gerais (padrão)
debug   → Debug detalhado
verbose → Logs verbosos
```

### Transports

#### Desenvolvimento

- ✅ Console com formatação colorida e pretty-print
- ✅ Stack traces completos

#### Produção

- ✅ Console em formato JSON
- ✅ Arquivo `logs/error.log` para erros
- ✅ Arquivo `logs/combined.log` para todos os logs
- ❌ Stack traces omitidos por segurança

### Customização

```typescript
// main.ts
const app = await NestFactory.create(AppModule, {
  logger: winstonLoggerConfig,
});
```

### Estrutura de Diretórios

```
back-nestjs/
├── logs/                   # Criado automaticamente em produção
│   ├── error.log          # Apenas erros
│   └── combined.log       # Todos os logs
```

---

## 🔄 Jobs e Dead Letter Queue

### Localização

**Arquivo**: `src/modules/jobs/jobs.module.ts`

### Configuração de Filas

#### Payment Queue

```typescript
{
  name: 'payment',
  defaultJobOptions: {
    attempts: 3,                    // 3 tentativas
    backoff: {
      type: 'exponential',          // 2s, 4s, 8s
      delay: 2000
    },
    removeOnComplete: true,         // Limpa jobs bem-sucedidos
    removeOnFail: false            // ⚠️ Dead Letter Queue
  },
  settings: {
    lockDuration: 30000,           // Lock de 30s
    maxStalledCount: 1,            // Máximo 1 tentativa stalled
    stalledInterval: 30000         // Verifica a cada 30s
  }
}
```

#### Notification Queue

Configuração similar à Payment Queue.

### Dead Letter Queue (DLQ)

**Como Funciona**:

1. Job falha após 3 tentativas
2. Job é movido para estado `failed`
3. Job **NÃO é removido** (`removeOnFail: false`)
4. Job fica disponível para análise e reprocessamento manual

### Acessar Jobs Falhados

#### Via Redis CLI

```bash
# Conectar ao Redis
redis-cli

# Listar jobs falhados da fila payment
LRANGE bull:payment:failed 0 -1

# Ver detalhes de um job
GET bull:payment:{job-id}
```

#### Via Bull Board (Opcional)

Instalar Bull Board para UI visual:

```bash
npm install @bull-board/api @bull-board/express
```

### Reprocessar Jobs Falhados

```typescript
// Exemplo: service para reprocessar jobs
async retryFailedJobs() {
  const queue = this.paymentQueue;
  const failed = await queue.getFailed();

  for (const job of failed) {
    await job.retry();
  }
}
```

### Monitoramento de Jobs

```typescript
// Listeners no PaymentProcessor
@OnQueueFailed()
handleFailed(job: Job, error: Error) {
  this.logger.error(`Job ${job.id} failed permanently`, {
    jobId: job.id,
    orderId: job.data.orderId,
    error: error.message,
    attempts: job.attemptsMade,
  });
}

@OnQueueStalled()
handleStalled(job: Job) {
  this.logger.warn(`Job ${job.id} stalled`, {
    jobId: job.id,
    orderId: job.data.orderId,
  });
}
```

---

## 🌍 Variáveis de Ambiente

### .env.example

```bash
# Logging
LOG_LEVEL=info              # error|warn|info|debug|verbose
LOG_FORMAT=json             # json|pretty (auto em prod/dev)

# Server
NODE_ENV=production         # production|development|test
PORT=3333
```

### Configurações Recomendadas

#### Desenvolvimento

```bash
NODE_ENV=development
LOG_LEVEL=debug
LOG_FORMAT=pretty
```

#### Produção

```bash
NODE_ENV=production
LOG_LEVEL=info
LOG_FORMAT=json
```

#### Testes

```bash
NODE_ENV=test
LOG_LEVEL=error             # Silenciar logs em testes
```

---

## 💡 Exemplos de Uso

### Log Manual em Services

```typescript
import { Logger } from '@nestjs/common';

export class ProductsService {
  private readonly logger = new Logger(ProductsService.name);

  async create(data) {
    this.logger.log('Creating product', {
      organizationId: data.organizationId,
      productName: data.name
    });

    // ... logic ...

    this.logger.log('Product created successfully', {
      productId: product.id
    });
  }

  async handleError(error) {
    this.logger.error('Failed to create product', {
      error: error.message,
      stack: error.stack,
    });
  }
}
```

### Log de Métricas Customizadas

```typescript
// Exemplo: tracking de performance
const startTime = Date.now();

await someOperation();

this.logger.log('Operation completed', {
  operation: 'someOperation',
  duration: Date.now() - startTime,
  success: true,
});
```

### Log Condicional

```typescript
if (process.env.NODE_ENV === 'development') {
  this.logger.debug('Detailed debug info', { data });
}
```

---

## 📈 Monitoramento

### Integração com Ferramentas

#### Elasticsearch + Kibana (ELK)

```bash
# Enviar logs para Elasticsearch
npm install winston-elasticsearch
```

```typescript
// winston-logger.config.ts
import { ElasticsearchTransport } from 'winston-elasticsearch';

new ElasticsearchTransport({
  level: 'info',
  clientOpts: { node: process.env.ELASTICSEARCH_URL },
  index: 'marketplace-logs',
})
```

#### Datadog

```bash
npm install datadog-winston
```

#### AWS CloudWatch

```bash
npm install winston-cloudwatch
```

### Queries Úteis

#### Erros nas últimas 24h

```json
{
  "query": {
    "bool": {
      "must": [
        { "term": { "level": "error" } },
        { "range": { "timestamp": { "gte": "now-24h" } } }
      ]
    }
  }
}
```

#### Latência P95 por rota

```json
{
  "aggs": {
    "routes": {
      "terms": { "field": "route" },
      "aggs": {
        "p95_latency": {
          "percentiles": { "field": "latency", "percents": [95] }
        }
      }
    }
  }
}
```

---

## 🎯 Best Practices

### DO ✅

- ✅ Use logs estruturados (JSON) em produção
- ✅ Inclua IDs rastreáveis (userId, organizationId, orderId)
- ✅ Log métricas de performance (latência)
- ✅ Use níveis apropriados (error para erros, info para eventos)
- ✅ Sanitize dados sensíveis (senhas, tokens)

### DON'T ❌

- ❌ Logar senhas ou tokens
- ❌ Logar dados de cartão de crédito
- ❌ Usar `console.log()` em produção
- ❌ Logar objetos enormes sem necessidade
- ❌ Usar `debug` em produção sem controle

---

## 🔒 Segurança

### Dados Sensíveis

**NUNCA logar**:
- Senhas
- Tokens de autenticação
- Chaves de API
- Dados de cartão de crédito
- CPF completo

**Exemplo de sanitização**:

```typescript
this.logger.log('User logged in', {
  userId: user.id,
  email: user.email.replace(/(.{3}).*(@.*)/, '$1***$2'), // us***@example.com
  // NÃO incluir: password, refreshToken
});
```

---

## 📚 Referências

- [Winston Documentation](https://github.com/winstonjs/winston)
- [NestJS Logging](https://docs.nestjs.com/techniques/logger)
- [Bull Queue Documentation](https://github.com/OptimalBits/bull)
- [Structured Logging Best Practices](https://www.honeycomb.io/blog/structured-logging-and-your-team)
- [The Twelve-Factor App: Logs](https://12factor.net/logs)

---

**Última atualização**: 2025-01-15
**Versão**: 1.0.0
