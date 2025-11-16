# 🔧 Correção de Autenticação - Guia de Teste

## O que foi corrigido

### Problema identificado
O Zustand store **não persistia** os tokens entre reloads da página, causando erro 401 em `/api/orders` após qualquer reload ou navegação que resetasse o estado.

### Solução implementada
1. ✅ Adicionado middleware `persist` ao Zustand para salvar tokens no `localStorage`
2. ✅ Melhorado tratamento de erro no login quando tokens não são obtidos
3. ✅ Adicionados logs de debug em todo o fluxo de autenticação

---

## Como testar

### 1. Limpar estado anterior
Antes de testar, limpe o localStorage antigo:

```javascript
// No console do navegador (F12)
localStorage.clear();
```

### 2. Fazer login
1. Acesse `http://localhost:3000/login`
2. Faça login com suas credenciais
3. **Verifique o console** - deve aparecer:
   ```
   [LoginForm] Tokens obtidos e salvos com sucesso
   [AuthStore] Salvando tokens: { hasAccessToken: true, hasRefreshToken: true }
   ```

### 3. Verificar localStorage
No console do navegador:

```javascript
// Deve retornar um objeto com accessToken e refreshToken
JSON.parse(localStorage.getItem('auth-storage'))
```

Exemplo esperado:
```json
{
  "state": {
    "user": { "email": "...", ... },
    "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  },
  "version": 0
}
```

### 4. Testar requisições protegidas
1. Navegue para `/dashboard/orders` (Meus Pedidos)
2. **Verifique o console** - deve aparecer:
   ```
   [ApiClient] Request para /orders com token (eyJhbGciOiJIUzI1Ni...)
   ```
3. A página deve carregar os pedidos sem erro 401

### 5. Testar persistência após reload
1. **Recarregue a página** (F5 ou Ctrl+R)
2. **Verifique o console** - deve aparecer:
   ```
   [ApiClient] Request para /orders com token (eyJhbGciOiJIUzI1Ni...)
   ```
3. Os pedidos devem continuar carregando normalmente

### 6. Testar navegação entre rotas
1. Navegue: Dashboard → Produtos → Pedidos → Perfil
2. Em cada rota protegida, verifique que não há erro 401
3. Todos os logs devem mostrar "com token"

---

## Logs esperados (fluxo completo)

### Login bem-sucedido:
```
[LoginForm] Tokens obtidos e salvos com sucesso
[AuthStore] Salvando tokens: { hasAccessToken: true, hasRefreshToken: true }
```

### Requisição protegida:
```
[ApiClient] Request para /orders com token (eyJhbGciOiJIUzI1Ni...)
```

### Erro 401 com refresh automático:
```
[ApiClient] Erro 401 detectado: { url: '/orders', message: 'JWT token expired' }
[ApiClient] Tentando refresh do token...
[ApiClient] Refresh bem-sucedido, retentando requisição
[AuthStore] Salvando tokens: { hasAccessToken: true, hasRefreshToken: true }
```

### Erro 401 sem refreshToken:
```
[ApiClient] Erro 401 detectado: { url: '/orders', message: 'Invalid JWT token' }
[ApiClient] Sem refreshToken disponível, limpando auth
[AuthStore] Limpando autenticação
```

---

## Problemas conhecidos e soluções

### ❌ Ainda vejo "SEM TOKEN" no console
**Causa:** localStorage não foi hidratado ainda (SSR)  
**Solução:** Aguarde 1-2 segundos após o reload. O Zustand hidrata o estado do localStorage após o mount do componente.

### ❌ Erro "Login parcial: algumas funcionalidades podem não funcionar"
**Causa:** A chamada `authApi.login()` falhou  
**Verificar:**
1. Backend está rodando em `http://localhost:3333`?
2. Endpoint `/api/auth/login` está funcionando?
3. Verifique o console do backend para erros

### ❌ Tokens salvos mas ainda recebo 401
**Causa:** Token pode estar expirado ou inválido  
**Solução:**
1. Verifique a data de expiração do token:
   ```javascript
   const token = JSON.parse(localStorage.getItem('auth-storage')).state.accessToken;
   const payload = JSON.parse(atob(token.split('.')[1]));
   console.log('Expira em:', new Date(payload.exp * 1000));
   ```
2. Se expirado, faça logout e login novamente

---

## Comandos úteis para debug

### Ver estado completo do auth:
```javascript
console.log(useAuthStore.getState());
```

### Limpar autenticação manualmente:
```javascript
useAuthStore.getState().clearAuth();
```

### Verificar se token é válido:
```javascript
const token = JSON.parse(localStorage.getItem('auth-storage')).state.accessToken;
const payload = JSON.parse(atob(token.split('.')[1]));
console.log('Token payload:', payload);
console.log('Expira em:', new Date(payload.exp * 1000));
console.log('Válido?', Date.now() < payload.exp * 1000);
```

---

## Próximos passos (opcional)

Se ainda houver problemas, considere:

1. **Migrar para cookies httpOnly** (mais seguro)
2. **Implementar renovação automática de token antes de expirar**
3. **Adicionar interceptor global de erro para redirecionar ao login**
4. **Sincronizar logout entre abas** (usando `storage` event)

---

## Arquivos modificados

- ✅ `/src/stores/auth-store.ts` - Adicionado persist
- ✅ `/src/components/auth/login-form.tsx` - Melhorado tratamento de erro
- ✅ `/src/lib/api/client.ts` - Adicionados logs de debug
