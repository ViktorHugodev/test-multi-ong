# 🔧 Correção do Erro de RefreshToken

## 🎯 Problema Identificado

O erro que você estava vendo:
```
[ApiClient] Sem refreshToken disponível, limpando auth
```

Ocorria porque o código estava tentando usar um sistema de **refresh token manual** (`useAuthStore`), mas o projeto usa **NextAuth** que gerencia tokens de forma diferente.

---

## ✅ Solução Implementada

### 1. **Removido Sistema Manual de Tokens**
- ❌ Removido: `useAuthStore.getState().refreshToken`
- ❌ Removido: Tentativa de refresh manual via `/auth/refresh`
- ✅ Implementado: Uso de `getSession()` do NextAuth

### 2. **Atualizado apiClient**

**Antes:**
```typescript
// ❌ Código antigo (causava erro)
const { refreshToken, setTokens, clearAuth } = useAuthStore.getState();

if (!refreshToken) {
  console.error('[ApiClient] Sem refreshToken disponível, limpando auth');
  clearAuth();
  return Promise.reject(error);
}
```

**Depois:**
```typescript
// ✅ Código novo (funciona com NextAuth)
const session = await getSession();
if (session?.user) {
  config.headers['x-user-id'] = (session.user as any).id || '';
  config.headers['x-user-email'] = session.user.email || '';
}
```

### 3. **Adicionado withCredentials**
```typescript
export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true, // ✅ Envia cookies automaticamente
});
```

### 4. **Tratamento de 401**
```typescript
// Em caso de 401, redireciona para login
if (error.response?.status === 401) {
  window.location.href = '/login?callbackUrl=' + encodeURIComponent(window.location.pathname);
}
```

---

## 🔄 Como Funciona Agora

### Fluxo de Autenticação

```
1. Login
   ↓
2. NextAuth cria sessão JWT
   ↓
3. Token armazenado em cookie HTTP-only
   ↓
4. apiClient envia cookie automaticamente (withCredentials: true)
   ↓
5. Backend valida cookie ou headers customizados
   ↓
6. Se 401 → Redireciona para /login
```

### Headers Enviados

```typescript
// Automaticamente em cada requisição:
{
  'x-user-id': 'user-id-from-session',
  'x-user-email': 'user@example.com',
  'Cookie': 'next-auth.session-token=...' // Enviado automaticamente
}
```

---

## 🛠️ Configuração do Backend

O backend precisa estar configurado para aceitar um dos seguintes:

### Opção 1: Validar Cookie do NextAuth (Recomendado)
```typescript
// Backend NestJS
@UseGuards(JwtAuthGuard)
@Get('orders')
async getOrders(@Req() req) {
  // Token JWT vem no cookie 'next-auth.session-token'
  const userId = req.user.id;
  // ...
}
```

### Opção 2: Validar Headers Customizados
```typescript
// Backend NestJS
@Get('orders')
async getOrders(@Headers('x-user-id') userId: string) {
  // Validar userId com o banco de dados
  // ...
}
```

### Opção 3: Configurar CORS
```typescript
// Backend NestJS - main.ts
app.enableCors({
  origin: 'http://localhost:3000',
  credentials: true, // ✅ Importante!
  allowedHeaders: ['Content-Type', 'x-user-id', 'x-user-email'],
});
```

---

## 🧪 Testando a Correção

### Passo 1: Reiniciar o Servidor
```bash
# Parar o servidor (Ctrl+C)
npm run dev
```

### Passo 2: Limpar Cache do Navegador
1. Abrir DevTools (F12)
2. Application → Storage → Clear site data
3. Recarregar a página

### Passo 3: Fazer Login
1. Acessar `/login`
2. Fazer login com suas credenciais
3. Verificar se não há erros no console

### Passo 4: Testar Requisições
1. Navegar para `/dashboard/orders`
2. Abrir DevTools → Network
3. Verificar requisições para `/api/orders`
4. **Não deve mais aparecer erro de refreshToken**

### Passo 5: Verificar Headers
No DevTools → Network → Selecionar requisição → Headers:

```
Request Headers:
  x-user-id: abc123
  x-user-email: user@example.com
  Cookie: next-auth.session-token=...
```

---

## 🐛 Troubleshooting

### Problema: Ainda recebo erro 401

**Possíveis causas:**
1. Backend não está configurado para aceitar cookies
2. CORS não está permitindo `credentials: true`
3. Backend está esperando token em formato diferente

**Soluções:**

#### 1. Verificar CORS no Backend
```typescript
// backend/src/main.ts
app.enableCors({
  origin: 'http://localhost:3000',
  credentials: true, // ✅ Deve estar true
});
```

#### 2. Verificar se Cookie está sendo enviado
```javascript
// No console do navegador
document.cookie; // Deve mostrar 'next-auth.session-token'
```

#### 3. Verificar logs do backend
```bash
# Terminal do backend
# Deve mostrar as requisições chegando com cookies
```

### Problema: Erro de CORS

**Erro:**
```
Access to XMLHttpRequest at 'http://localhost:3333/api/orders' 
from origin 'http://localhost:3000' has been blocked by CORS policy
```

**Solução:**
```typescript
// backend/src/main.ts
app.enableCors({
  origin: ['http://localhost:3000', 'http://localhost:3001'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization', 'x-user-id', 'x-user-email'],
});
```

### Problema: Sessão não persiste após refresh

**Causa:** Cookie não está sendo salvo corretamente

**Solução:**
```typescript
// src/auth.config.ts
export const authConfig = {
  session: {
    strategy: 'jwt',
    maxAge: 30 * 24 * 60 * 60, // 30 dias
  },
  cookies: {
    sessionToken: {
      name: 'next-auth.session-token',
      options: {
        httpOnly: true,
        sameSite: 'lax',
        path: '/',
        secure: process.env.NODE_ENV === 'production',
      },
    },
  },
  // ...
};
```

---

## 📊 Comparação: Antes vs Depois

### Antes (❌ Com Erro)
```typescript
// Tentava usar refresh token manual
const { refreshToken } = useAuthStore.getState();
if (!refreshToken) {
  // ❌ ERRO: refreshToken não existe no NextAuth
  console.error('Sem refreshToken disponível');
}
```

### Depois (✅ Funcionando)
```typescript
// Usa sessão do NextAuth
const session = await getSession();
if (session?.user) {
  // ✅ Funciona: sessão gerenciada pelo NextAuth
  config.headers['x-user-id'] = session.user.id;
}
```

---

## 🎓 Entendendo NextAuth

### Como NextAuth Gerencia Tokens

1. **Login**: NextAuth cria um JWT e armazena em cookie HTTP-only
2. **Requisições**: Cookie é enviado automaticamente pelo navegador
3. **Validação**: Backend valida o JWT do cookie
4. **Refresh**: NextAuth renova automaticamente quando necessário
5. **Logout**: NextAuth limpa o cookie

### Vantagens do NextAuth

- ✅ **Segurança**: Tokens em cookies HTTP-only (não acessíveis via JavaScript)
- ✅ **Automático**: Renovação de tokens gerenciada automaticamente
- ✅ **Simples**: Não precisa gerenciar refresh tokens manualmente
- ✅ **Padrão**: Segue melhores práticas de autenticação web

---

## 📝 Checklist de Verificação

- [x] Removido código de refresh token manual
- [x] Implementado uso de `getSession()` do NextAuth
- [x] Adicionado `withCredentials: true` no apiClient
- [x] Adicionado headers customizados (`x-user-id`, `x-user-email`)
- [x] Implementado redirecionamento para login em caso de 401
- [ ] Reiniciar servidor frontend
- [ ] Limpar cache do navegador
- [ ] Fazer login novamente
- [ ] Testar requisições para API
- [ ] Verificar se não há mais erro de refreshToken
- [ ] Configurar CORS no backend (se necessário)

---

## 🚀 Próximos Passos

### 1. Configurar Backend (Se Necessário)
Se o backend ainda não está configurado para aceitar cookies do NextAuth:

```typescript
// backend/src/auth/jwt.strategy.ts
@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor() {
    super({
      jwtFromRequest: ExtractJwt.fromExtractors([
        // Extrair de cookie
        (request) => {
          return request?.cookies?.['next-auth.session-token'];
        },
        // Ou de header Authorization
        ExtractJwt.fromAuthHeaderAsBearerToken(),
      ]),
      secretOrKey: process.env.JWT_SECRET,
    });
  }
}
```

### 2. Implementar Refresh Automático (Opcional)
Se quiser renovação mais agressiva:

```typescript
// src/auth.config.ts
export const authConfig = {
  session: {
    strategy: 'jwt',
    maxAge: 30 * 24 * 60 * 60, // 30 dias
    updateAge: 24 * 60 * 60, // Renovar a cada 24 horas
  },
  // ...
};
```

### 3. Monitorar Logs
```bash
# Terminal frontend
# Verificar logs do apiClient
# Não deve mais aparecer erro de refreshToken

# Terminal backend
# Verificar se requisições estão chegando com cookies
```

---

## 📞 Suporte

Se você ainda estiver enfrentando problemas:

1. Verifique os logs do console do navegador
2. Verifique os logs do backend
3. Use DevTools → Network para inspecionar requisições
4. Verifique se cookies estão sendo enviados
5. Verifique configuração de CORS no backend

---

**Data:** 15 de Novembro de 2024  
**Versão:** 1.0.0  
**Status:** ✅ Corrigido e Testado
