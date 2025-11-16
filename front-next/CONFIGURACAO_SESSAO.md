# 🔐 Configuração de Tempo de Expiração da Sessão e JWT

## 🎯 Problema Resolvido

O erro **401 Unauthorized** após pouco tempo de uso indica que o token JWT está expirando. Esta configuração permite ajustar o tempo de expiração.

---

## ⚙️ Configurações Implementadas

### 1. **Variáveis de Ambiente**

Arquivo: `.env.local`

```bash
# Session Configuration (in seconds)
# Default: 30 days = 2592000 seconds
# 1 hour = 3600, 1 day = 86400, 7 days = 604800, 30 days = 2592000
SESSION_MAX_AGE=2592000
JWT_MAX_AGE=2592000
```

### 2. **Arquivo de Configuração**

Arquivo: `src/auth.config.ts`

```typescript
// Configurações de tempo de expiração (em segundos)
const SESSION_MAX_AGE = Number(process.env.SESSION_MAX_AGE) || 30 * 24 * 60 * 60; // Default: 30 days
const JWT_MAX_AGE = Number(process.env.JWT_MAX_AGE) || 30 * 24 * 60 * 60; // Default: 30 days

export const authConfig = {
  session: {
    strategy: 'jwt',
    maxAge: SESSION_MAX_AGE, // Tempo de expiração da sessão
    updateAge: 24 * 60 * 60, // Atualizar sessão a cada 24 horas
  },
  jwt: {
    maxAge: JWT_MAX_AGE, // Tempo de expiração do token JWT
  },
  // ...
};
```

---

## 📊 Tempos de Expiração Recomendados

### Desenvolvimento
```bash
# 1 dia (mais seguro para testes)
SESSION_MAX_AGE=86400
JWT_MAX_AGE=86400
```

### Produção - Uso Normal
```bash
# 7 dias (equilíbrio entre segurança e conveniência)
SESSION_MAX_AGE=604800
JWT_MAX_AGE=604800
```

### Produção - Uso Intenso
```bash
# 30 dias (máxima conveniência)
SESSION_MAX_AGE=2592000
JWT_MAX_AGE=2592000
```

### Aplicações Sensíveis
```bash
# 1 hora (máxima segurança)
SESSION_MAX_AGE=3600
JWT_MAX_AGE=3600
```

---

## 🔢 Tabela de Conversão

| Tempo        | Segundos  | Variável           |
|--------------|-----------|-------------------|
| 15 minutos   | 900       | `900`             |
| 30 minutos   | 1800      | `1800`            |
| 1 hora       | 3600      | `3600`            |
| 6 horas      | 21600     | `21600`           |
| 12 horas     | 43200     | `43200`           |
| 1 dia        | 86400     | `86400`           |
| 3 dias       | 259200    | `259200`          |
| 7 dias       | 604800    | `604800`          |
| 14 dias      | 1209600   | `1209600`         |
| 30 dias      | 2592000   | `2592000`         |
| 60 dias      | 5184000   | `5184000`         |
| 90 dias      | 7776000   | `7776000`         |

---

## 🚀 Como Aplicar as Mudanças

### Passo 1: Editar `.env.local`

```bash
# Abrir o arquivo
nano .env.local

# Ou usar seu editor preferido
code .env.local
```

### Passo 2: Ajustar os Valores

```bash
# Exemplo: Aumentar para 7 dias
SESSION_MAX_AGE=604800
JWT_MAX_AGE=604800
```

### Passo 3: Reiniciar o Servidor

```bash
# Parar o servidor (Ctrl+C)
# Iniciar novamente
npm run dev
```

### Passo 4: Fazer Logout e Login

```bash
# 1. Fazer logout da aplicação
# 2. Fazer login novamente
# 3. O novo token terá o tempo de expiração atualizado
```

---

## 🔍 Como Verificar se Está Funcionando

### 1. Verificar o Token JWT

Abra o DevTools do navegador:

```javascript
// Console do navegador
// Verificar o token
localStorage.getItem('token');

// Ou verificar os cookies
document.cookie;
```

### 2. Decodificar o Token JWT

Use o site [jwt.io](https://jwt.io) para decodificar o token e verificar o campo `exp` (expiration):

```json
{
  "exp": 1700000000,  // Timestamp Unix de expiração
  "iat": 1697408000,  // Timestamp Unix de criação
  "id": "user-id",
  "email": "user@example.com"
}
```

### 3. Calcular o Tempo de Expiração

```javascript
// No console do navegador
const token = 'seu-token-jwt';
const decoded = JSON.parse(atob(token.split('.')[1]));
const expirationDate = new Date(decoded.exp * 1000);
const creationDate = new Date(decoded.iat * 1000);
const durationInDays = (decoded.exp - decoded.iat) / (24 * 60 * 60);

console.log('Criado em:', creationDate);
console.log('Expira em:', expirationDate);
console.log('Duração:', durationInDays, 'dias');
```

---

## 🛡️ Considerações de Segurança

### ⚠️ Tokens de Longa Duração

**Riscos:**
- Se o token for roubado, o atacante terá acesso por mais tempo
- Maior janela de oportunidade para ataques

**Mitigações:**
- Usar HTTPS em produção
- Implementar refresh tokens
- Monitorar atividades suspeitas
- Implementar logout em todos os dispositivos

### ✅ Tokens de Curta Duração

**Vantagens:**
- Menor janela de exposição em caso de roubo
- Maior segurança

**Desvantagens:**
- Usuários precisam fazer login com mais frequência
- Pior experiência do usuário

### 🎯 Recomendação Balanceada

```bash
# Sessão: 7 dias
SESSION_MAX_AGE=604800

# JWT: 7 dias
JWT_MAX_AGE=604800

# Atualização: 24 horas (já configurado no código)
# Isso significa que se o usuário usar a aplicação diariamente,
# a sessão será renovada automaticamente
```

---

## 🔄 Atualização Automática da Sessão

A configuração `updateAge: 24 * 60 * 60` significa que:

1. **Se o usuário usar a aplicação dentro de 24 horas**, a sessão será renovada automaticamente
2. **Se o usuário ficar inativo por mais de 24 horas**, a sessão não será renovada
3. **Após o tempo máximo (maxAge)**, a sessão expira independentemente da atividade

### Exemplo de Fluxo

```
Dia 1: Login → Token válido por 7 dias
Dia 2: Uso → Token renovado por mais 7 dias (total: 8 dias)
Dia 3: Uso → Token renovado por mais 7 dias (total: 9 dias)
...
Dia 10: Sem uso por 7 dias → Token expira → Requer novo login
```

---

## 🐛 Troubleshooting

### Problema: Token ainda expira rápido

**Possíveis causas:**
1. Servidor não foi reiniciado após mudança no `.env.local`
2. Cache do navegador com token antigo
3. Configuração do backend diferente

**Soluções:**
```bash
# 1. Limpar cache do Next.js
rm -rf .next

# 2. Reinstalar dependências
rm -rf node_modules
npm install

# 3. Reiniciar servidor
npm run dev

# 4. Limpar cookies do navegador
# DevTools → Application → Cookies → Clear All
```

### Problema: Erro ao fazer login

**Possível causa:** Sintaxe incorreta no `.env.local`

**Solução:**
```bash
# Verificar se não há espaços extras
SESSION_MAX_AGE=604800  # ✅ Correto
SESSION_MAX_AGE = 604800  # ❌ Incorreto (espaços)
SESSION_MAX_AGE="604800"  # ✅ Correto (com aspas)
```

### Problema: 401 em algumas rotas mas não em outras

**Possível causa:** Middleware não está propagando o token corretamente

**Solução:** Verificar o arquivo `middleware.ts`:

```typescript
// Verificar se o token está sendo propagado
export async function middleware(request: NextRequest) {
  const token = await getToken({ req: request });
  
  if (!token) {
    return NextResponse.redirect(new URL('/login', request.url));
  }
  
  // Propagar token nos headers
  const response = NextResponse.next();
  response.headers.set('x-user-id', token.id as string);
  response.headers.set('x-user-role', token.role as string);
  
  return response;
}
```

---

## 📝 Checklist de Implementação

- [x] Adicionar variáveis `SESSION_MAX_AGE` e `JWT_MAX_AGE` no `.env.local`
- [x] Atualizar `auth.config.ts` para usar as variáveis de ambiente
- [x] Adicionar configuração `jwt.maxAge`
- [x] Adicionar configuração `session.updateAge`
- [x] Documentar tempos de expiração recomendados
- [ ] Reiniciar o servidor de desenvolvimento
- [ ] Fazer logout e login novamente
- [ ] Testar se o token não expira mais rapidamente
- [ ] Verificar logs do backend para confirmar

---

## 🔗 Referências

- [NextAuth.js - Session Configuration](https://next-auth.js.org/configuration/options#session)
- [NextAuth.js - JWT Configuration](https://next-auth.js.org/configuration/options#jwt)
- [JWT.io - Token Decoder](https://jwt.io)
- [OWASP - Session Management](https://owasp.org/www-community/controls/Session_Management_Cheat_Sheet)

---

## 📞 Suporte

Se você ainda estiver enfrentando problemas:

1. Verifique os logs do servidor Next.js
2. Verifique os logs do backend (se houver)
3. Use o DevTools para inspecionar os cookies e tokens
4. Verifique se há erros no console do navegador

---

**Data:** 15 de Novembro de 2024  
**Versão:** 1.0.0  
**Status:** ✅ Implementado
