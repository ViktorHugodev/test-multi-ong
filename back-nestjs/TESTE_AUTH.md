# Teste de Autenticação - Guia Completo

## 🎯 Problema Resolvido

O `JwtAuthGuard` global estava bloqueando rotas públicas e não fornecia mensagens de erro específicas.

## ✅ Correções Aplicadas

1. **JwtAuthGuard atualizado** (`src/auth/guards/jwt-auth.guard.ts`)
   - Adicionado `handleRequest` que respeita `@Public()`
   - Mensagens de erro específicas: token expirado, inválido ou ausente

2. **Rotas públicas agora funcionam**
   - `/api/public/products` não requer autenticação
   - `/api/auth/login` e `/api/auth/register` são públicas

## 🧪 Como Testar

### 1. Reiniciar o servidor
```bash
cd /home/victor/www/test-multi-ong/back-nestjs
npm run start:dev
```

### 2. Testar rota pública (SEM token)
```bash
curl http://localhost:3333/api/public/products?page=1&pageSize=10
```
**Esperado:** Status 200 com lista de produtos

### 3. Fazer login
```bash
curl -X POST http://localhost:3333/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "victor@gmail.com",
    "password": "sua-senha"
  }'
```
**Esperado:** Status 201 com `accessToken` e `refreshToken`

Copie o `accessToken` retornado.

### 4. Testar rota protegida (COM token)
```bash
curl http://localhost:3333/api/products?page=1&pageSize=10 \
  -H "Authorization: Bearer SEU_ACCESS_TOKEN_AQUI"
```
**Esperado:** Status 200 com produtos da organização do usuário

### 5. Testar rota protegida (SEM token)
```bash
curl http://localhost:3333/api/products?page=1&pageSize=10
```
**Esperado:** Status 401 com mensagem `"Missing or invalid authentication token"`

### 6. Testar com token expirado
Aguarde 15 minutos após o login e tente:
```bash
curl http://localhost:3333/api/products?page=1&pageSize=10 \
  -H "Authorization: Bearer TOKEN_ANTIGO"
```
**Esperado:** Status 401 com mensagem `"JWT token expired"`

## 📊 Logs Esperados

### Login bem-sucedido
```
[info] [HTTP] POST /api/auth/login → 201 (userId: xxx, organizationId: yyy)
```

### Rota pública acessada
```
[info] [HTTP] GET /api/public/products → 200 (userId: null, organizationId: null)
```

### Rota protegida com token válido
```
[info] [HTTP] GET /api/products → 200 (userId: xxx, organizationId: yyy)
```

### Rota protegida sem token
```
[error] [HttpExceptionFilter] GET /api/products
UnauthorizedException: Missing or invalid authentication token
```

### Token expirado
```
[error] [HttpExceptionFilter] GET /api/products
UnauthorizedException: JWT token expired
```

## 🔧 Configuração Atual

- **Access Token:** 15 minutos
- **Refresh Token:** 7 dias
- **Guard Global:** `JwtAuthGuard` (todas as rotas protegidas por padrão)
- **Rotas Públicas:** Marcadas com `@Public()`

## 🚨 Próximos Passos (Frontend)

O frontend precisa:

1. **Salvar o `accessToken`** retornado no login
2. **Enviar em todas as requisições protegidas:**
   ```typescript
   headers: {
     'Authorization': `Bearer ${accessToken}`
   }
   ```
3. **Implementar refresh automático** quando receber 401 com `"JWT token expired"`:
   ```typescript
   if (error.response?.data?.message === 'JWT token expired') {
     // Chamar POST /api/auth/refresh com refreshToken
     // Atualizar accessToken
     // Retentar requisição original
   }
   ```

## 📝 Notas Importantes

- **Não use o token do NextAuth** no backend NestJS
- O backend NestJS tem seu **próprio sistema JWT**
- Os tokens são **diferentes** e **não são intercambiáveis**
- Se estiver usando NextAuth no frontend, você precisa:
  - Fazer login no backend NestJS (`/api/auth/login`)
  - Salvar o `accessToken` do Nest
  - Usar esse token nas chamadas ao backend

## 🐛 Troubleshooting

### Problema: Ainda recebo 401 em rotas públicas
**Solução:** Verifique se o controller tem `@Public()` no método ou na classe

### Problema: 401 após alguns minutos
**Causa:** Token expirou (15min)
**Solução:** Implementar refresh no frontend

### Problema: "Invalid JWT token"
**Causa:** Token corrompido ou secret diferente
**Solução:** Verifique se está usando o token correto do backend Nest

### Problema: Frontend envia token do NextAuth
**Causa:** Confusão entre sistemas de auth
**Solução:** Use apenas o token do backend NestJS (`/api/auth/login`)
