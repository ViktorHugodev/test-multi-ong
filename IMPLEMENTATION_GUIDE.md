# Guia de Implementação - ERP Multi-Tenant

## Funcionalidades Implementadas

### 1. Controle de Estoque com Transações Atômicas

**Backend:**
- ✅ Exception customizada `InsufficientStockException` com detalhes de produtos sem estoque
- ✅ Transações atômicas com Prisma usando `Serializable` isolation level
- ✅ Lock pessimista com `FOR UPDATE` para prevenir race conditions
- ✅ Validação de estoque antes de criar pedidos
- ✅ Decremento atômico de estoque
- ✅ Logging detalhado de erros de estoque

**Frontend:**
- ✅ Hook `useCheckout` para processar pedidos
- ✅ Componente `InsufficientStockError` para exibir erros de estoque
- ✅ Opções para ajustar quantidades ou remover itens sem estoque
- ✅ Tratamento de erro com feedback visual

**Localização:**
- Backend: `back-nestjs/src/modules/orders/`
- Frontend: `front-next/src/lib/hooks/use-checkout.ts`
- Frontend: `front-next/src/components/checkout/insufficient-stock-error.tsx`

---

### 2. NextAuth v5 (Auth.js)

**Backend:**
- ✅ Endpoint `/auth/nextauth/validate` para validação de credenciais
- ✅ Método `validateUserCredentials` no AuthService
- ✅ Compatibilidade com JWT existente

**Frontend:**
- ✅ Configuração do NextAuth v5 em `src/auth.ts`
- ✅ API routes em `src/app/api/auth/[...nextauth]/route.ts`
- ✅ Middleware para proteção de rotas
- ✅ SessionProvider configurado
- ✅ Hook `useAuthNextAuth` para login/logout
- ✅ Types customizados para User e Session

**Localização:**
- Backend: `back-nestjs/src/auth/auth.controller.ts`
- Frontend: `front-next/src/auth.ts`
- Frontend: `front-next/middleware.ts`
- Frontend: `front-next/src/lib/hooks/use-auth-nextauth.tsx`

**Migração:**
- O sistema antigo de auth ainda funciona
- Para migrar, substitua `useAuth()` por `useAuthNextAuth()` nos componentes
- Configure `NEXTAUTH_SECRET` no `.env.local`

---

### 3. Sistema de Busca Inteligente com OpenAI

**Backend:**
- ✅ Integração com OpenAI GPT-4o-mini
- ✅ Circuit Breaker para fallback automático
- ✅ Fallback para busca por texto simples
- ✅ Logging de todas as buscas
- ✅ Endpoint público `/search/products`
- ✅ Endpoint de health `/search/health`

**Frontend:**
- ✅ Hook `useSearch` com debounce
- ✅ Hook `useDebounce` reutilizável
- ✅ Suporte para paginação
- ✅ Metadata sobre método de busca utilizado

**Localização:**
- Backend: `back-nestjs/src/modules/search/`
- Frontend: `front-next/src/lib/hooks/use-search.ts`

**Circuit Breaker:**
- Após 3 falhas consecutivas, usa apenas fallback por 2 minutos
- Tenta novamente automaticamente após o timeout

---

## Configuração

### Backend (.env)

```env
# Database
DATABASE_URL="postgresql://user:password@localhost:5432/erp_db"

# JWT
JWT_SECRET=your-jwt-secret-key-change-in-production
JWT_REFRESH_SECRET=your-jwt-refresh-secret-key-change-in-production

# OpenAI
OPENAI_API_KEY=sk-your-openai-api-key-here
OPENAI_MODEL=gpt-4o-mini
OPENAI_TIMEOUT=3000

# Redis
REDIS_HOST=localhost
REDIS_PORT=6379

# Server
PORT=3333
NODE_ENV=development
```

### Frontend (.env.local)

```env
NEXT_PUBLIC_API_URL=http://localhost:3333
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-super-secret-key-change-in-production
```

---

## Como Usar

### Controle de Estoque

```tsx
import { useCheckout } from '@/lib/hooks/use-checkout';
import { InsufficientStockError } from '@/components/checkout/insufficient-stock-error';

function CheckoutPage() {
  const { 
    isProcessing, 
    stockErrors, 
    processCheckout, 
    removeUnavailableItems, 
    adjustQuantities 
  } = useCheckout();

  if (stockErrors.length > 0) {
    return (
      <InsufficientStockError
        errors={stockErrors}
        onRemoveItems={removeUnavailableItems}
        onAdjustQuantities={adjustQuantities}
        onCancel={() => router.push('/cart')}
      />
    );
  }

  // ... resto do checkout
}
```

### NextAuth

```tsx
import { useAuthNextAuth } from '@/lib/hooks/use-auth-nextauth';

function LoginPage() {
  const { login, isLoading } = useAuthNextAuth();

  const handleLogin = async (email: string, password: string) => {
    const success = await login(email, password);
    if (success) {
      // Redirect será feito automaticamente
    }
  };
}
```

### Busca Inteligente

```tsx
import { useSearch } from '@/lib/hooks/use-search';

function SearchPage() {
  const { 
    query, 
    setQuery, 
    results, 
    metadata, 
    isLoading 
  } = useSearch();

  return (
    <div>
      <input 
        value={query} 
        onChange={(e) => setQuery(e.target.value)} 
      />
      
      {metadata && (
        <div>
          {metadata.searchMethod === 'llm' ? '✨ Busca Inteligente' : '🔍 Busca Simples'}
          <p>{metadata.interpretation}</p>
        </div>
      )}

      {results.map(product => (
        <ProductCard key={product.id} product={product} />
      ))}
    </div>
  );
}
```

---

## Testes

### Teste de Concorrência de Estoque

```bash
# Backend
cd back-nestjs
npm test -- orders.service.spec.ts
```

### Teste Manual de Busca

```bash
# Com OpenAI configurado
curl "http://localhost:3333/search/products?q=doces+até+50+reais"

# Verificar health
curl "http://localhost:3333/search/health"
```

---

## Próximos Passos

1. **Adicionar testes E2E** para fluxo completo de checkout
2. **Criar componente de busca** visual no frontend
3. **Implementar analytics** para queries de busca
4. **Adicionar cache** para queries comuns
5. **Melhorar prompts** do OpenAI baseado em logs

---

## Troubleshooting

### OpenAI retorna erro 429 (rate limit)
- Verificar se API key está correta
- Circuit breaker abrirá automaticamente e usará fallback
- Considerar upgrade de tier na OpenAI

### Erros de estoque mesmo com stock disponível
- Verificar isolation level do banco
- Verificar logs de transação
- Executar teste de concorrência

### NextAuth não persiste sessão
- Verificar `NEXTAUTH_SECRET` está definido
- Verificar cookies estão sendo setados
- Verificar middleware não está bloqueando

---

## Arquitetura

```
Backend (NestJS)
├── Auth Module
│   ├── JWT Strategy (existente)
│   └── NextAuth Validation (novo)
├── Orders Module
│   ├── Atomic Transactions
│   ├── Stock Validation
│   └── Exception Handling
└── Search Module
    ├── LLM Service (OpenAI)
    ├── Text Search Service (Fallback)
    ├── Circuit Breaker
    └── Search Logging

Frontend (Next.js 14)
├── NextAuth v5
│   ├── Credentials Provider
│   ├── Session Management
│   └── Middleware Protection
├── Hooks
│   ├── useCheckout
│   ├── useSearch
│   ├── useAuthNextAuth
│   └── useDebounce
└── Components
    ├── InsufficientStockError
    └── (search components - TBD)
```

---

**Autor:** Claude AI  
**Data:** 2025-01-14  
**Versão:** 1.0
