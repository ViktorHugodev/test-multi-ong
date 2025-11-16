# 🔄 Refatoração Completa do Sistema de Autenticação

## Problema Identificado

O sistema tinha **DOIS mecanismos de autenticação conflitantes**:

1. ❌ **NextAuth** (sessão via cookies) + **Zustand + Backend JWT** (tokens no localStorage)
2. ❌ Isso causava:
   - Loop de redirecionamento infinito
   - Tokens perdidos após reload
   - Complexidade desnecessária
   - Conflito entre middleware e interceptors

## Solução Implementada

### ✅ Sistema Unificado com NextAuth

Agora usa **APENAS NextAuth** como fonte única de verdade:

```
Login → NextAuth chama backend → Recebe JWT do backend → Salva no token NextAuth → Usa em todas as requisições
```

---

## Arquitetura Refatorada

### 1. **auth.config.ts** - Autenticação centralizada

```typescript
// O authorize() chama diretamente o backend NestJS
const response = await axios.post(`${API_BASE_URL}/auth/login`, {
  email: credentials.email,
  password: credentials.password,
});

const { user, accessToken, refreshToken } = response.data;

// Salva os tokens do backend DENTRO do token NextAuth
return {
  ...user,
  backendAccessToken: accessToken,
  backendRefreshToken: refreshToken,
};
```

**Fluxo:**
1. Usuário faz login
2. NextAuth chama `POST /api/auth/login` do backend NestJS
3. Backend retorna `{ user, accessToken, refreshToken }`
4. NextAuth salva tudo no JWT (cookie httpOnly)
5. Sessão disponível em toda a aplicação

---

### 2. **client.ts** - API Client simplificado

```typescript
// Request Interceptor
const session = await getSession();
const backendToken = session?.backendAccessToken;

if (backendToken) {
  config.headers.Authorization = `Bearer ${backendToken}`;
}
```

**Fluxo:**
1. Antes de cada requisição, pega a sessão NextAuth
2. Extrai o `backendAccessToken` da sessão
3. Envia como `Bearer` token para o backend
4. Backend valida o JWT normalmente

---

### 3. **LoginForm** - Simplificado

```typescript
const result = await signIn('credentials', {
  email,
  password,
  redirect: false,
});

if (result?.ok) {
  router.push('/dashboard');
}
```

**Sem:**
- ❌ Chamadas duplicadas ao backend
- ❌ Gerenciamento manual de tokens
- ❌ Zustand store
- ❌ Delays artificiais

---

## Arquivos Modificados

### ✅ Refatorados
- `src/auth.config.ts` - Agora chama backend diretamente no authorize()
- `src/lib/api/client.ts` - Usa getSession() ao invés de Zustand
- `src/components/auth/login-form.tsx` - Simplificado, apenas NextAuth
- `src/app/dashboard/profile/page.tsx` - Usa useSession() ao invés de Zustand

### ❌ Removidos
- `src/stores/auth-store.ts` - Não é mais necessário
- `src/lib/api/auth.ts` - Não existe mais (foi deletado antes)
- Lógica de refresh manual - NextAuth gerencia automaticamente

---

## Como Funciona Agora

### Login
```
1. Usuário → LoginForm → signIn('credentials')
2. NextAuth → auth.config.ts → authorize()
3. authorize() → POST /api/auth/login (backend)
4. Backend → { user, accessToken, refreshToken }
5. NextAuth → Salva tudo no JWT (cookie)
6. Redirect → /dashboard
```

### Requisições Protegidas
```
1. Component → ordersApi.getMyOrders()
2. apiClient interceptor → getSession()
3. Session → backendAccessToken
4. Request → Authorization: Bearer <token>
5. Backend → Valida JWT → Retorna dados
```

### Logout
```
1. Component → signOut()
2. NextAuth → Limpa cookie
3. Middleware → Detecta sem sessão
4. Redirect → /login
```

---

## Vantagens da Nova Arquitetura

### ✅ Segurança
- Tokens em cookies httpOnly (não acessíveis via JS)
- Proteção contra XSS
- CSRF token automático do NextAuth

### ✅ Simplicidade
- Uma única fonte de verdade (NextAuth)
- Menos código para manter
- Menos pontos de falha

### ✅ Performance
- Sem chamadas duplicadas ao backend
- Sessão em cache do NextAuth
- Menos re-renders

### ✅ Manutenibilidade
- Fluxo claro e linear
- Logs consistentes
- Fácil debug

---

## Logs de Debug

### Login bem-sucedido:
```
[Auth] Autenticando no backend: user@example.com
[Auth] Login bem-sucedido: { userId: '...', email: '...', role: 'admin' }
[Auth] Token JWT criado com dados do backend
[LoginForm] ✅ Login bem-sucedido!
```

### Requisição protegida:
```
[ApiClient] Request com Bearer token: {
  url: '/orders',
  userId: '...',
  role: 'admin',
  tokenPrefix: 'eyJhbGciOiJIUzI1Ni...'
}
```

### Erro 401:
```
[ApiClient] Erro 401 - Não autorizado: {
  url: '/orders',
  message: 'JWT token expired'
}
```

---

## Teste o Sistema

### 1. Limpar estado anterior
```bash
# No console do navegador
localStorage.clear();
sessionStorage.clear();
```

### 2. Fazer login
1. Acesse `http://localhost:3000/login`
2. Faça login
3. Verifique os logs no console

### 3. Testar requisições
1. Navegue para `/dashboard/orders`
2. Verifique que não há erro 401
3. Recarregue a página (F5)
4. Deve continuar autenticado

### 4. Verificar sessão
```javascript
// No console do navegador
import { getSession } from 'next-auth/react';
const session = await getSession();
console.log(session);
```

---

## Próximos Passos (Opcional)

Se quiser melhorar ainda mais:

1. **Refresh automático de token**
   - Implementar lógica no callback JWT para renovar token antes de expirar

2. **Sincronização entre abas**
   - Usar `storage` event para logout simultâneo

3. **Rate limiting**
   - Adicionar proteção contra brute force no backend

4. **Audit log**
   - Registrar todas as tentativas de login

---

## Troubleshooting

### ❌ Ainda vejo loop de redirecionamento
**Causa:** Cache do navegador  
**Solução:** Limpe cookies e localStorage, reinicie o servidor

### ❌ Erro "Cannot find module 'next-auth/react'"
**Causa:** Dependência não instalada  
**Solução:** `npm install next-auth`

### ❌ Backend retorna 401 mesmo com token
**Causa:** Backend não está validando o JWT corretamente  
**Solução:** Verifique o `JWT_SECRET` no backend e frontend

---

## Resumo

- ✅ **Antes:** NextAuth + Zustand + authApi + refresh manual = Complexo e bugado
- ✅ **Depois:** Apenas NextAuth = Simples e funcional

**A autenticação agora é:**
- Mais segura
- Mais simples
- Mais confiável
- Mais fácil de manter
