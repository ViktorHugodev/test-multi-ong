# Análise e Correções - Variáveis de Ambiente e Rotas

## 📋 Resumo Executivo

Análise completa das variáveis de ambiente e rotas da aplicação Marketplace Multi-ONG, identificando e corrigindo inconsistências críticas entre front-end e back-end.

---

## 🔍 Problemas Identificados

### Front-end (Next.js)

#### ❌ Crítico
1. **Ausência de arquivos de ambiente**
   - Não existia `.env.local` ou `.env.example`
   - URL da API estava hardcoded no código

2. **Rotas de produtos incorretas**
   - Front-end tentava acessar `/organizations/:orgId/products`
   - Back-end usa `/products` com extração automática do orgId via JWT
   - Métodos HTTP incorretos (PUT vs PATCH)

#### ⚠️ Atenção
- Falta de documentação sobre variáveis de ambiente necessárias

### Back-end (NestJS)

#### ❌ Crítico
1. **Inconsistência em variáveis JWT**
   - `.env` usava `JWT_EXPIRATION`
   - `.env.example` usava `JWT_EXPIRES_IN`
   - Código esperava `JWT_EXPIRES_IN`

2. **Porta inconsistente**
   - `.env` configurado com porta `3333`
   - `.env.example` configurado com porta `3000`

3. **CORS não configurado**
   - Faltava variável `FRONTEND_URL` para configuração de CORS

---

## ✅ Correções Implementadas

### 1. Front-end - Variáveis de Ambiente

**Criado: `/front-next/.env.local`**
```env
NEXT_PUBLIC_API_URL=http://localhost:3333/api
NEXT_PUBLIC_APP_NAME="Marketplace Multi-ONG"
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

**Criado: `/front-next/.env.example`**
```env
NEXT_PUBLIC_API_URL=http://localhost:3333/api
NEXT_PUBLIC_APP_NAME="Marketplace Multi-ONG"
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### 2. Front-end - Rotas de Produtos

**Arquivo: `/front-next/src/lib/api/products.ts`**

#### Antes ❌
```typescript
getMyProducts: async (orgId: string, filters?: ProductFilters) => {
  const response = await apiClient.get(`/organizations/${orgId}/products`, ...);
}

createProduct: async (orgId: string, data: CreateProductDto) => {
  const response = await apiClient.post(`/organizations/${orgId}/products`, ...);
}

updateProduct: async (orgId: string, id: string, data: UpdateProductDto) => {
  const response = await apiClient.put(`/organizations/${orgId}/products/${id}`, ...);
}
```

#### Depois ✅
```typescript
// orgId é extraído automaticamente do JWT pelo backend
getMyProducts: async (filters?: ProductFilters) => {
  const response = await apiClient.get('/products', ...);
}

createProduct: async (data: CreateProductDto) => {
  const response = await apiClient.post('/products', ...);
}

updateProduct: async (id: string, data: UpdateProductDto) => {
  const response = await apiClient.patch(`/products/${id}`, ...); // PUT → PATCH
}
```

### 3. Back-end - Variáveis de Ambiente

**Atualizado: `/back-nestjs/.env`**
```env
DATABASE_URL="postgresql://postgres:postgres@localhost:5433/marketplace?schema=public"

JWT_SECRET="your-super-secret-jwt-key-change-in-production"
JWT_EXPIRES_IN="7d"  # ✅ Corrigido de JWT_EXPIRATION

NODE_ENV=development
PORT=3333

# ✅ Adicionado para CORS
FRONTEND_URL=http://localhost:3000
```

**Atualizado: `/back-nestjs/.env.example`**
```env
DATABASE_URL="postgresql://postgres:postgres@localhost:5433/marketplace?schema=public"

JWT_SECRET="your-secret-key-change-in-production"
JWT_EXPIRES_IN="7d"

REDIS_HOST="localhost"
REDIS_PORT=6379

PORT=3333  # ✅ Corrigido de 3000
NODE_ENV="development"

# ✅ Adicionado para CORS
FRONTEND_URL=http://localhost:3000
```

---

## 📊 Mapeamento de Rotas

### Rotas de Autenticação ✅
| Método | Endpoint | Front-end | Back-end | Status |
|--------|----------|-----------|----------|--------|
| POST | `/api/auth/register` | ✅ | ✅ | OK |
| POST | `/api/auth/login` | ✅ | ✅ | OK |
| GET | `/api/auth/me` | ✅ | ✅ | OK |

### Rotas de Produtos Públicos ✅
| Método | Endpoint | Front-end | Back-end | Status |
|--------|----------|-----------|----------|--------|
| GET | `/api/public/products` | ✅ | ✅ | OK |
| GET | `/api/public/products/:id` | ✅ | ✅ | OK |

### Rotas de Produtos Privados (ONG) ✅
| Método | Endpoint | Front-end | Back-end | Status |
|--------|----------|-----------|----------|--------|
| GET | `/api/products` | ✅ Corrigido | ✅ | OK |
| GET | `/api/products/:id` | ✅ Adicionado | ✅ | OK |
| POST | `/api/products` | ✅ Corrigido | ✅ | OK |
| PATCH | `/api/products/:id` | ✅ Corrigido | ✅ | OK |
| DELETE | `/api/products/:id` | ✅ Corrigido | ✅ | OK |

### Rotas de Organizações ✅
| Método | Endpoint | Front-end | Back-end | Status |
|--------|----------|-----------|----------|--------|
| GET | `/api/organizations` | - | ✅ | OK |
| GET | `/api/organizations/:id` | - | ✅ | OK |
| GET | `/api/organizations/slug/:slug` | - | ✅ | OK |
| POST | `/api/organizations` | - | ✅ | OK |
| PATCH | `/api/organizations/:id` | - | ✅ | OK |
| DELETE | `/api/organizations/:id` | - | ✅ | OK |

### Rotas de Pedidos ✅
| Método | Endpoint | Front-end | Back-end | Status |
|--------|----------|-----------|----------|--------|
| POST | `/api/orders` | ✅ | ✅ | OK |
| GET | `/api/orders` | ✅ | ✅ | OK |
| GET | `/api/orders/:id` | ✅ | ✅ | OK |
| GET | `/api/organizations/:orgId/orders` | ✅ | ✅ | OK |

### Rotas de Busca ✅
| Método | Endpoint | Front-end | Back-end | Status |
|--------|----------|-----------|----------|--------|
| POST | `/api/public/search` | ✅ | ✅ | OK |

---

## 🔐 Segurança e Multi-tenancy

### Extração Automática de Contexto
O back-end utiliza guards e decorators para extrair automaticamente o contexto da organização:

```typescript
@Controller('products')
@UseGuards(JwtAuthGuard, OrganizationGuard)
@RequiresOrgAccess()
export class ProductsController {
  @Post()
  create(
    @CurrentOrganization() organizationId: string, // ✅ Extraído do JWT
    @Body() createProductDto: CreateProductDto,
  ) {
    return this.productsService.create(organizationId, createProductDto);
  }
}
```

### Benefícios
- ✅ Não é necessário passar `orgId` nas requisições do front-end
- ✅ Impossível acessar dados de outra organização
- ✅ Código mais limpo e seguro
- ✅ Menos parâmetros nas chamadas de API

---

## 📝 Próximos Passos Recomendados

### Imediato
- [ ] Reiniciar o servidor back-end para aplicar novas variáveis de ambiente
- [ ] Reiniciar o servidor front-end para carregar `.env.local`
- [ ] Testar autenticação e criação de produtos

### Curto Prazo
- [ ] Adicionar validação de variáveis de ambiente no startup
- [ ] Criar testes de integração para rotas críticas
- [ ] Documentar fluxo de autenticação e multi-tenancy

### Médio Prazo
- [ ] Implementar refresh token
- [ ] Adicionar rate limiting
- [ ] Configurar variáveis de ambiente para produção

---

## 🚀 Como Testar

### 1. Reiniciar Servidores
```bash
# Back-end
cd back-nestjs
npm run start:dev

# Front-end
cd front-next
npm run dev
```

### 2. Testar Fluxo Completo
1. Registrar usuário como ONG Manager
2. Fazer login
3. Criar produto (sem passar orgId)
4. Listar produtos da organização
5. Atualizar produto
6. Deletar produto

### 3. Verificar Logs
- Back-end deve mostrar: `🚀 Application is running on: http://localhost:3333/api`
- Front-end deve mostrar: `✓ Ready on http://localhost:3000`

---

## 📚 Referências

- [Next.js Environment Variables](https://nextjs.org/docs/basic-features/environment-variables)
- [NestJS Configuration](https://docs.nestjs.com/techniques/configuration)
- [JWT Best Practices](https://tools.ietf.org/html/rfc8725)

---

**Data da Análise:** 11/11/2025  
**Status:** ✅ Correções Implementadas  
**Impacto:** Alto - Resolve problemas críticos de comunicação front-back
