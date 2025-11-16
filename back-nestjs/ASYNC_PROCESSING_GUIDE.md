# Guia de Processamento Assíncrono - Bull Queue

## Visão Geral

Sistema completo de processamento assíncrono para pedidos usando Bull Queue, Redis e PostgreSQL, com:

- ✅ **Processamento não-bloqueante**: Resposta imediata (~200ms) na criação de pedidos
- ✅ **Idempotência**: Nenhum pagamento ou notificação duplicado
- ✅ **Resiliência**: Retry automático com exponential backoff
- ✅ **Observabilidade**: Logs completos em PostgreSQL + Winston
- ✅ **Dead Letter Queue**: Análise de falhas
- ✅ **Rate Limiting**: Proteção do gateway de pagamento

---

## Arquitetura

```
┌─────────────┐
│   Cliente   │
└─────┬───────┘
      │ POST /api/orders
      ▼
┌─────────────────────┐
│  OrdersController   │
└─────────┬───────────┘
          │
          ▼
┌─────────────────────┐
│  OrdersService      │  ◄── Transaction ACID (create order + baixar estoque)
└─────────┬───────────┘
          │
          ├─────► Response 201 (200ms) ◄─── NÃO BLOQUEIA
          │
          └─────► Enqueue Jobs ────┐
                                    │
          ┌─────────────────────────┘
          │
          ├─► Payment Queue ────► PaymentProcessor ────► Gateway Simulado
          │                              │
          │                              ├─► Success: Order.confirmed + Notification
          │                              └─► Failure: Retry (transient) OR DLQ (permanent)
          │
          └─► Notification Queue ──► NotificationProcessor ──► Templates + Log
```

---

## Novos Models Prisma

### Payment
Rastreia tentativas e status de pagamento:

```typescript
{
  id: string
  orderId: string
  amount: Decimal
  status: 'pending' | 'processing' | 'approved' | 'failed' | 'refunded'
  gatewayResponse: Json
  transactionId: string (único)
  attempts: number
  processedAt: DateTime
}
```

### Notification
Histórico de notificações enviadas:

```typescript
{
  id: string
  orderId: string
  type: 'order_created' | 'payment_approved' | 'payment_failed' | ...
  recipient: string (email)
  status: 'pending' | 'sent' | 'failed'
  message: string
  attempts: number
  sentAt: DateTime
}
```

### JobLog
Auditoria completa de processamento:

```typescript
{
  id: string
  jobId: string (único)
  queue: 'payment-processing' | 'notifications'
  jobType: string
  payload: Json
  status: 'pending' | 'processing' | 'completed' | 'failed' | 'retrying'
  result: Json
  error: string
  attempts: number
  processedAt: DateTime
}
```

---

## Configuração

### 1. Variáveis de Ambiente

Adicione ao seu `.env`:

```bash
# Redis
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=
REDIS_DB=0

# Payment Gateway Simulation
PAYMENT_SUCCESS_RATE=0.85
PAYMENT_TRANSIENT_FAIL_RATE=0.10
PAYMENT_PERMANENT_FAIL_RATE=0.05
PAYMENT_MIN_DELAY=500
PAYMENT_MAX_DELAY=3000

# Queue Configuration
QUEUE_PAYMENT_MAX_RETRIES=5
QUEUE_PAYMENT_BACKOFF_DELAY=2000
QUEUE_NOTIFICATION_MAX_RETRIES=3
QUEUE_NOTIFICATION_BACKOFF_DELAY=1000
QUEUE_JOB_LOG_TTL=604800
```

### 2. Rodar Serviços

```bash
# Subir Redis e PostgreSQL
cd back-nestjs
docker-compose up -d

# Rodar migrations
npx prisma migrate dev

# Iniciar aplicação
npm run start:dev
```

---

## Fluxo Completo de Uso

### 1. Criar Pedido (Assíncrono)

```bash
curl -X POST http://localhost:3333/api/orders \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "items": [
      {
        "productId": "uuid-do-produto",
        "quantity": 2
      }
    ],
    "shippingDetails": {
      "address": "Rua Exemplo, 123",
      "city": "São Paulo",
      "state": "SP",
      "zipCode": "01234-567"
    },
    "paymentMethod": "credit_card"
  }'
```

**Resposta Imediata** (~200ms):

```json
{
  "id": "order-uuid",
  "orderNumber": "ORD-20250116-0001",
  "status": "pending",
  "totalAmount": 150.00,
  "createdAt": "2025-01-16T10:30:00.000Z",
  "message": "Pedido criado com sucesso. Processamento em andamento.",
  "estimatedProcessingTime": "2-5 segundos"
}
```

### 2. Consultar Status de Processamento

```bash
curl http://localhost:3333/api/orders/{ORDER_ID}/status \
  -H "Authorization: Bearer YOUR_TOKEN"
```

**Resposta Detalhada**:

```json
{
  "id": "order-uuid",
  "orderNumber": "ORD-20250116-0001",
  "status": "confirmed",
  "totalAmount": 150.00,
  "transactionId": "TXN-1737026400000-ABC123",
  "paidAt": "2025-01-16T10:30:03.500Z",

  "customer": {
    "id": "user-uuid",
    "email": "customer@example.com",
    "fullName": "João Silva"
  },

  "payments": [
    {
      "id": "payment-uuid",
      "amount": 150.00,
      "status": "approved",
      "transactionId": "TXN-1737026400000-ABC123",
      "attempts": 1,
      "processedAt": "2025-01-16T10:30:03.500Z",
      "gatewayResponse": {
        "status": "APPROVED",
        "message": "Pagamento aprovado com sucesso",
        "processingTime": 2341
      }
    }
  ],

  "notifications": [
    {
      "id": "notif-1",
      "type": "order_created",
      "recipient": "customer@example.com",
      "status": "sent",
      "sentAt": "2025-01-16T10:30:01.200Z"
    },
    {
      "id": "notif-2",
      "type": "payment_approved",
      "recipient": "customer@example.com",
      "status": "sent",
      "sentAt": "2025-01-16T10:30:04.100Z"
    }
  ]
}
```

### 3. Retentar Pagamento (Caso Falhe)

```bash
curl -X POST http://localhost:3333/api/orders/{ORDER_ID}/retry-payment \
  -H "Authorization: Bearer YOUR_TOKEN"
```

**Resposta**:

```json
{
  "message": "Retry de pagamento iniciado",
  "orderId": "order-uuid",
  "status": "payment_processing"
}
```

---

## Cenários de Teste

### ✅ Cenário 1: Sucesso Total (85%)

1. Criar pedido
2. Aguardar 2-5 segundos
3. Consultar `/orders/:id/status`
4. Verificar:
   - `order.status = "confirmed"`
   - `payment.status = "approved"`
   - `payment.transactionId` presente
   - 2 notificações enviadas

### ⚠️ Cenário 2: Falha Transitória (10%)

1. Criar pedido
2. Pagamento falha com erro de rede
3. Sistema retenta automaticamente (2s, 4s, 8s...)
4. Após 1-3 tentativas, sucesso
5. Verificar `payment.attempts > 1`

### ❌ Cenário 3: Falha Permanente (5%)

1. Criar pedido
2. Pagamento recusado (cartão inválido)
3. Sistema NÃO retenta
4. Verificar:
   - `order.status = "failed"`
   - `payment.status = "failed"`
   - `payment.gatewayResponse.error` contém motivo
   - Notificação de falha enviada

### 🔄 Cenário 4: Retry Manual

1. Pedido com falha permanente
2. Chamar `POST /orders/:id/retry-payment`
3. Novo job enfileirado
4. Sistema processa novamente

### 🛡️ Cenário 5: Idempotência

1. Criar pedido
2. Durante processamento, servidor reinicia
3. Job é reprocessado
4. Sistema detecta idempotência via Redis
5. Não cria pagamento duplicado

---

## Monitoramento e Logs

### Logs Winston (Console)

```bash
# Acompanhar processamento
npm run start:dev

# Logs estruturados:
[PaymentProcessor] Processing payment for order abc123 (attempt 1/5)
[Gateway] ✅ Payment APPROVED - TxnID: TXN-123 - Time: 2341ms
[NotificationProcessor] ✅ Notification payment_approved sent successfully
```

### Consultar JobLogs (PostgreSQL)

```sql
-- Histórico completo de um pedido
SELECT * FROM job_logs
WHERE payload->>'orderId' = 'order-uuid'
ORDER BY created_at DESC;

-- Jobs falhados nas últimas 24h
SELECT * FROM job_logs
WHERE status = 'failed'
  AND created_at > NOW() - INTERVAL '24 hours'
ORDER BY created_at DESC;

-- Taxa de sucesso por fila
SELECT
  queue,
  COUNT(*) as total,
  COUNT(*) FILTER (WHERE status = 'completed') as completed,
  COUNT(*) FILTER (WHERE status = 'failed') as failed,
  ROUND(100.0 * COUNT(*) FILTER (WHERE status = 'completed') / COUNT(*), 2) as success_rate
FROM job_logs
GROUP BY queue;
```

---

## Troubleshooting

### Redis não conecta

```bash
# Verificar se Redis está rodando
docker ps | grep redis

# Logs do Redis
docker logs redis

# Testar conexão
redis-cli ping
# Deve retornar: PONG
```

### Jobs não processam

```bash
# Verificar filas no Redis
redis-cli

> KEYS bull:payment-processing:*
> LLEN bull:payment-processing:wait
> LLEN bull:payment-processing:active
> LLEN bull:payment-processing:failed
```

### Limpar DLQ (Dead Letter Queue)

```bash
# Via Redis CLI
redis-cli

> DEL bull:payment-processing:failed
> DEL bull:notifications:failed

# Via código (JobLogService)
await jobLogService.cleanOldLogs(30, true); // Limpa logs >30 dias, mantém falhas
```

### Resetar Idempotência

```bash
redis-cli

> KEYS idempotency:*
> DEL idempotency:order-uuid:payment
```

---

## Performance

| Métrica | Valor | Descrição |
|---------|-------|-----------|
| **Latência Criação Pedido** | ~200ms | Resposta síncrona (apenas DB write) |
| **Latência Pagamento** | 2-5s | Processamento assíncrono completo |
| **Throughput Payment** | 10 jobs/s | Rate limit configurável |
| **Throughput Notification** | 20 jobs/s | Rate limit configurável |
| **Retry Backoff** | 2s → 32s | Exponencial (5 tentativas) |
| **TTL Idempotência** | 7 dias | Cache Redis |
| **DLQ Retention** | Indefinido | Manter falhas para análise |

---

## Segurança

- ✅ **Sem credenciais em código**: Tudo via `.env`
- ✅ **Redis password**: Configurável (produção)
- ✅ **Idempotency keys**: Previne duplicação
- ✅ **Transaction isolation**: `Serializable` para pedidos
- ✅ **Rate limiting**: Protege gateway de sobrecarga
- ✅ **Error sanitization**: Não expor stack traces ao cliente

---

## Próximos Passos (Opcional)

1. **Bull Board**: UI para monitorar filas
   ```bash
   npm install @bull-board/express
   ```

2. **Metrics**: Prometheus + Grafana
   ```typescript
   // Exportar métricas de filas
   ```

3. **Webhooks**: Notificar cliente quando pagamento completar

4. **Circuit Breaker**: Para gateway de pagamento real

5. **Distributed Tracing**: OpenTelemetry para rastrear jobs

---

## Contato

Para dúvidas ou suporte, consulte a documentação ou abra uma issue no repositório.

**Commit**: `feat: implement async order processing with Bull Queue`
**Branch**: `claude/async-order-processing-bull-01CAQtetRJJUg5VFWHcTephq`
