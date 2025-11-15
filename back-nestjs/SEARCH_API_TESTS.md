# 🔍 Testes da API de Busca Inteligente

## Rotas Disponíveis

A API de busca agora suporta múltiplas formas de acesso:

### 1. **GET /api/search** (RECOMENDADO)
Busca via query string - ideal para URLs compartilháveis e cache

### 2. **POST /api/search** (NOVO - CORRIGE O 404)
Busca via request body - ideal para queries complexas e privacidade

### 3. **GET /api/search/products** (LEGADO)
Mantido para compatibilidade com código existente

### 4. **GET /api/search/health**
Health check do serviço LLM e circuit breaker

---

## 📋 Exemplos de Teste

### Teste 1: GET com Query String (Simples)

```bash
# Busca básica
curl -X GET "http://localhost:3333/api/search?q=doces+baratos&page=1&pageSize=20"
```

**Resposta Esperada:**
```json
{
  "results": [...],
  "meta": {
    "page": 1,
    "pageSize": 20,
    "total": 45,
    "totalPages": 3,
    "aiSuccess": true,
    "fallbackUsed": false,
    "interpretation": "Resultados para: Categoria = Doces; Palavras-chave: barato",
    "latency": 234
  }
}
```

---

### Teste 2: POST com Request Body (RESOLVE O ERRO 404)

```bash
# Busca via POST (método que estava falhando)
curl -X POST "http://localhost:3333/api/search" \
  -H "Content-Type: application/json" \
  -d '{
    "query": "doces baratos",
    "page": 1,
    "pageSize": 20
  }'
```

**Status Code:** `200 OK` (antes era `404 Not Found`)

---

### Teste 3: Query Vazia

```bash
# GET com query vazia
curl -X GET "http://localhost:3333/api/search?q="
```

**Resposta:**
```json
{
  "results": [],
  "meta": {
    "page": 1,
    "pageSize": 20,
    "total": 0,
    "totalPages": 0,
    "aiSuccess": false,
    "fallbackUsed": false,
    "interpretation": "Query vazia",
    "latency": 0
  }
}
```

---

### Teste 4: Paginação

```bash
# Página 2 com 10 itens por página
curl -X POST "http://localhost:3333/api/search" \
  -H "Content-Type: application/json" \
  -d '{
    "query": "chocolate",
    "page": 2,
    "pageSize": 10
  }'
```

---

### Teste 5: Query Complexa com LLM

```bash
# Query em linguagem natural - testa interpretação do LLM
curl -X POST "http://localhost:3333/api/search" \
  -H "Content-Type: application/json" \
  -d '{
    "query": "quero doces de chocolate abaixo de 15 reais",
    "page": 1,
    "pageSize": 20
  }'
```

**Interpretação Esperada (meta.interpretation):**
```
"Resultados para: Categoria = Doces; Preço ≤ R$ 15.00; Palavras-chave: chocolate"
```

---

### Teste 6: Health Check

```bash
# Verifica se o LLM está disponível
curl -X GET "http://localhost:3333/api/search/health"
```

**Resposta:**
```json
{
  "llmAvailable": true,
  "circuitOpen": false
}
```

**Quando o circuit breaker abre (após 3 falhas):**
```json
{
  "llmAvailable": false,
  "circuitOpen": true
}
```

---

### Teste 7: Rota Legada (Compatibilidade)

```bash
# Rota antiga ainda funciona
curl -X GET "http://localhost:3333/api/search/products?q=chocolate&page=1&pageSize=20"
```

---

## 🧪 Teste de Fallback

### Simular Falha do LLM

Para testar o fallback, você pode:

1. **Desabilitar a chave da OpenAI** temporariamente no `.env`:
```bash
# Comentar ou remover OPENAI_API_KEY
# OPENAI_API_KEY=sk-...
```

2. **Fazer uma busca:**
```bash
curl -X POST "http://localhost:3333/api/search" \
  -H "Content-Type: application/json" \
  -d '{"query": "doces", "page": 1, "pageSize": 20}'
```

3. **Verificar meta.fallbackUsed:**
```json
{
  "meta": {
    "aiSuccess": false,
    "fallbackUsed": true,
    "interpretation": "Resultados para: Palavras-chave: doces"
  }
}
```

---

## 🔐 Segurança

Todas as rotas são **públicas** (`@Public()` decorator):
- ✅ Não requerem autenticação JWT
- ✅ Acessíveis sem token no header
- ✅ Ideal para busca em landing pages e áreas públicas

---

## ⚡ Circuit Breaker

O sistema possui circuit breaker para proteger contra falhas do LLM:

- **Threshold:** 3 falhas consecutivas
- **Timeout:** 2 minutos
- **Comportamento:**
  - Após 3 falhas, abre o circuit
  - Durante 2 minutos, usa apenas fallback textual
  - Após timeout, tenta LLM novamente

**Monitorar logs:**
```bash
# Ver logs de circuit breaker
tail -f logs/application.log | grep "Circuit breaker"
```

---

## 📊 Métricas de Busca

Todas as buscas são registradas no banco de dados:

```sql
SELECT
  query,
  "aiSuccess",
  "fallbackUsed",
  latency,
  "resultsCount",
  "createdAt"
FROM "SearchLog"
ORDER BY "createdAt" DESC
LIMIT 20;
```

---

## ✅ Checklist de Validação

Após implementar as mudanças, execute:

- [ ] **GET /api/search** - Retorna 200 com resultados
- [ ] **POST /api/search** - Retorna 200 (não 404!)
- [ ] **GET /api/search/products** - Rota legada funciona
- [ ] **GET /api/search/health** - Retorna status do LLM
- [ ] **Query vazia** - Retorna array vazio com meta correta
- [ ] **Paginação** - page e pageSize funcionam corretamente
- [ ] **LLM funcionando** - aiSuccess: true, fallbackUsed: false
- [ ] **Fallback funciona** - Ao desabilitar OpenAI, usa busca textual
- [ ] **Circuit breaker** - Após 3 falhas, usa fallback automaticamente
- [ ] **Logs de busca** - SearchLog registra todas as buscas

---

## 🐛 Troubleshooting

### Erro 404 persiste?

1. **Verificar módulo importado:**
```typescript
// app.module.ts deve ter:
import { SearchModule } from './modules/search/search.module';

@Module({
  imports: [
    SearchModule, // ← deve estar aqui
  ]
})
```

2. **Reiniciar servidor:**
```bash
npm run start:dev
```

3. **Verificar prefixo global:**
```typescript
// main.ts
app.setGlobalPrefix('api'); // ← deve estar definido
```

### LLM sempre falha?

1. **Verificar OPENAI_API_KEY no .env**
2. **Verificar saldo da conta OpenAI**
3. **Checar logs:** `tail -f logs/application.log | grep LLM`

### Validação falha no DTO?

```bash
# Certifique-se de enviar Content-Type correto
curl -X POST "http://localhost:3333/api/search" \
  -H "Content-Type: application/json" \  # ← importante!
  -d '{"query": "teste"}'
```

---

## 📚 Documentação Adicional

- **NestJS Controllers:** https://docs.nestjs.com/controllers
- **Validation Pipe:** https://docs.nestjs.com/techniques/validation
- **Circuit Breaker Pattern:** https://martinfowler.com/bliki/CircuitBreaker.html
