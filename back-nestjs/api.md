# API Documentation - Multi-ONG Marketplace

## Base URL
```
http://localhost:3000/api
```

## Autenticação
A maioria das rotas requer autenticação via JWT Bearer Token.

**Header de Autenticação:**
```
Authorization: Bearer {token}
```

---

## Índice

1. [Autenticação](#autenticação)
2. [Organizações](#organizações)
3. [Produtos Privado](#produtos-privado)
4. [Produtos Público](#produtos-público)
5. [Pedidos](#pedidos)
6. [Pedidos da Organização](#pedidos-da-organização)
7. [Busca](#busca)
8. [Health Check](#health-check)

---

## Autenticação

### POST /api/auth/register
Registra um novo usuário no sistema.

**Autenticação:** Não requerida (Pública)

**Body:**
```json
{
  "email": "user@example.com",
  "password": "password123",
  "fullName": "Nome Completo",
  "role": "customer",
  "organizationId": "optional-org-id",
  "organization": {
    "name": "Nome da ONG",
    "description": "Descrição da ONG",
    "email": "ong@example.com",
    "phone": "+5511999999999"
  }
}
```

**Validações:**
- email: Email válido
- password: Mínimo 8 caracteres
- fullName: 3-100 caracteres
- role: admin | ong_manager | ong_staff | customer
- organization.name: 3-100 caracteres
- organization.description: 0-1000 caracteres (opcional)

**Resposta de Sucesso (201):**
```json
{
  "user": {
    "id": "uuid",
    "email": "user@example.com",
    "fullName": "Nome Completo",
    "role": "customer"
  },
  "token": "jwt-token"
}
```

---

### POST /api/auth/login
Autentica um usuário e retorna um token JWT.

**Autenticação:** Não requerida (Pública)

**Body:**
```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

**Validações:**
- email: Email válido
- password: Mínimo 6 caracteres

**Resposta de Sucesso (200):**
```json
{
  "user": {
    "id": "uuid",
    "email": "user@example.com",
    "fullName": "Nome Completo",
    "role": "customer"
  },
  "token": "jwt-token"
}
```

---

### GET /api/auth/me
Retorna informações do usuário autenticado.

**Autenticação:** Requerida

**Headers:**
```
Authorization: Bearer {token}
```

**Resposta de Sucesso (200):**
```json
{
  "id": "uuid",
  "email": "user@example.com",
  "fullName": "Nome Completo",
  "role": "customer",
  "organizationId": "uuid",
  "organization": {
    "id": "uuid",
    "name": "Nome da ONG",
    "slug": "nome-da-ong"
  }
}
```

---

## Organizações

### POST /api/organizations
Cria uma nova organização.

**Autenticação:** Requerida

**Body:**
```json
{
  "name": "Nome da ONG",
  "slug": "nome-da-ong",
  "description": "Descrição da organização",
  "email": "contato@ong.com",
  "phone": "+5511999999999",
  "logoUrl": "https://example.com/logo.png"
}
```

**Validações:**
- name: String obrigatória
- slug: String obrigatória
- description: String opcional
- email: Email válido
- phone: String opcional
- logoUrl: URL válida (opcional)

**Resposta de Sucesso (201):**
```json
{
  "id": "uuid",
  "name": "Nome da ONG",
  "slug": "nome-da-ong",
  "description": "Descrição da organização",
  "email": "contato@ong.com",
  "phone": "+5511999999999",
  "logoUrl": "https://example.com/logo.png",
  "isActive": true,
  "createdAt": "2024-01-01T00:00:00.000Z",
  "updatedAt": "2024-01-01T00:00:00.000Z"
}
```

---

### GET /api/organizations
Lista todas as organizações ativas.

**Autenticação:** Não requerida (Pública)

**Resposta de Sucesso (200):**
```json
[
  {
    "id": "uuid",
    "name": "Nome da ONG",
    "slug": "nome-da-ong",
    "description": "Descrição",
    "email": "contato@ong.com",
    "phone": "+5511999999999",
    "logoUrl": "https://example.com/logo.png",
    "isActive": true,
    "createdAt": "2024-01-01T00:00:00.000Z",
    "updatedAt": "2024-01-01T00:00:00.000Z"
  }
]
```

---

### GET /api/organizations/:id
Busca uma organização por ID.

**Autenticação:** Não requerida (Pública)

**Parâmetros de URL:**
- id: UUID da organização

**Resposta de Sucesso (200):**
```json
{
  "id": "uuid",
  "name": "Nome da ONG",
  "slug": "nome-da-ong",
  "description": "Descrição",
  "email": "contato@ong.com",
  "phone": "+5511999999999",
  "logoUrl": "https://example.com/logo.png",
  "isActive": true,
  "createdAt": "2024-01-01T00:00:00.000Z",
  "updatedAt": "2024-01-01T00:00:00.000Z"
}
```

---

### GET /api/organizations/slug/:slug
Busca uma organização por slug.

**Autenticação:** Não requerida (Pública)

**Parâmetros de URL:**
- slug: Slug da organização

**Resposta de Sucesso (200):**
```json
{
  "id": "uuid",
  "name": "Nome da ONG",
  "slug": "nome-da-ong",
  "description": "Descrição",
  "email": "contato@ong.com",
  "phone": "+5511999999999",
  "logoUrl": "https://example.com/logo.png",
  "isActive": true,
  "createdAt": "2024-01-01T00:00:00.000Z",
  "updatedAt": "2024-01-01T00:00:00.000Z"
}
```

---

### PATCH /api/organizations/:id
Atualiza uma organização.

**Autenticação:** Requerida

**Parâmetros de URL:**
- id: UUID da organização

**Body (todos os campos são opcionais):**
```json
{
  "name": "Novo Nome",
  "slug": "novo-slug",
  "description": "Nova descrição",
  "email": "novo@email.com",
  "phone": "+5511888888888",
  "logoUrl": "https://example.com/new-logo.png",
  "isActive": false
}
```

**Resposta de Sucesso (200):**
```json
{
  "id": "uuid",
  "name": "Novo Nome",
  "slug": "novo-slug",
  "description": "Nova descrição",
  "email": "novo@email.com",
  "phone": "+5511888888888",
  "logoUrl": "https://example.com/new-logo.png",
  "isActive": false,
  "createdAt": "2024-01-01T00:00:00.000Z",
  "updatedAt": "2024-01-02T00:00:00.000Z"
}
```

---

### DELETE /api/organizations/:id
Remove uma organização.

**Autenticação:** Requerida

**Parâmetros de URL:**
- id: UUID da organização

**Resposta de Sucesso (200):**
```json
{
  "message": "Organization deleted successfully"
}
```

---

## Produtos Privado

**Nota:** Todas as rotas de produtos privados requerem autenticação e acesso à organização.

### POST /api/products
Cria um novo produto para a organização do usuário autenticado.

**Autenticação:** Requerida + Acesso à Organização

**Body:**
```json
{
  "name": "Nome do Produto",
  "description": "Descrição do produto",
  "price": 29.99,
  "category": "alimentos",
  "imageUrl": "https://example.com/product.jpg",
  "stockQty": 100,
  "weightGrams": 500,
  "sku": "PROD-001"
}
```

**Validações:**
- name: String obrigatória
- description: String opcional
- price: Number com máximo 2 casas decimais, mínimo 0
- category: String obrigatória
- imageUrl: URL válida (opcional)
- stockQty: Integer, mínimo 0
- weightGrams: Integer, mínimo 0
- sku: String opcional

**Resposta de Sucesso (201):**
```json
{
  "id": "uuid",
  "name": "Nome do Produto",
  "description": "Descrição do produto",
  "price": 29.99,
  "category": "alimentos",
  "imageUrl": "https://example.com/product.jpg",
  "stockQty": 100,
  "weightGrams": 500,
  "sku": "PROD-001",
  "organizationId": "uuid",
  "isActive": true,
  "createdAt": "2024-01-01T00:00:00.000Z",
  "updatedAt": "2024-01-01T00:00:00.000Z"
}
```

---

### GET /api/products
Lista produtos da organização do usuário autenticado.

**Autenticação:** Requerida + Acesso à Organização

**Query Parameters (todos opcionais):**
- category: String - Filtrar por categoria
- search: String - Buscar por nome ou descrição
- minPrice: Number - Preço mínimo
- maxPrice: Number - Preço máximo
- organizationId: String - ID da organização
- page: Number - Número da página (padrão: 1)
- limit: Number - Itens por página (padrão: 20)

**Exemplo:**
```
GET /api/products?category=alimentos&page=1&limit=10
```

**Resposta de Sucesso (200):**
```json
{
  "data": [
    {
      "id": "uuid",
      "name": "Nome do Produto",
      "description": "Descrição",
      "price": 29.99,
      "category": "alimentos",
      "imageUrl": "https://example.com/product.jpg",
      "stockQty": 100,
      "weightGrams": 500,
      "sku": "PROD-001",
      "organizationId": "uuid",
      "isActive": true,
      "createdAt": "2024-01-01T00:00:00.000Z",
      "updatedAt": "2024-01-01T00:00:00.000Z"
    }
  ],
  "meta": {
    "total": 50,
    "page": 1,
    "limit": 10,
    "totalPages": 5
  }
}
```

---

### GET /api/products/:id
Busca um produto específico da organização.

**Autenticação:** Requerida + Acesso à Organização

**Parâmetros de URL:**
- id: UUID do produto

**Resposta de Sucesso (200):**
```json
{
  "id": "uuid",
  "name": "Nome do Produto",
  "description": "Descrição",
  "price": 29.99,
  "category": "alimentos",
  "imageUrl": "https://example.com/product.jpg",
  "stockQty": 100,
  "weightGrams": 500,
  "sku": "PROD-001",
  "organizationId": "uuid",
  "isActive": true,
  "createdAt": "2024-01-01T00:00:00.000Z",
  "updatedAt": "2024-01-01T00:00:00.000Z"
}
```

---

### PATCH /api/products/:id
Atualiza um produto da organização.

**Autenticação:** Requerida + Acesso à Organização

**Parâmetros de URL:**
- id: UUID do produto

**Body (todos os campos são opcionais):**
```json
{
  "name": "Novo Nome",
  "description": "Nova descrição",
  "price": 39.99,
  "category": "bebidas",
  "imageUrl": "https://example.com/new-product.jpg",
  "stockQty": 50,
  "weightGrams": 750,
  "sku": "PROD-002",
  "isActive": false
}
```

**Resposta de Sucesso (200):**
```json
{
  "id": "uuid",
  "name": "Novo Nome",
  "description": "Nova descrição",
  "price": 39.99,
  "category": "bebidas",
  "imageUrl": "https://example.com/new-product.jpg",
  "stockQty": 50,
  "weightGrams": 750,
  "sku": "PROD-002",
  "organizationId": "uuid",
  "isActive": false,
  "createdAt": "2024-01-01T00:00:00.000Z",
  "updatedAt": "2024-01-02T00:00:00.000Z"
}
```

---

### DELETE /api/products/:id
Remove um produto da organização.

**Autenticação:** Requerida + Acesso à Organização

**Parâmetros de URL:**
- id: UUID do produto

**Resposta de Sucesso (200):**
```json
{
  "message": "Product deleted successfully"
}
```

---

## Produtos Público

### GET /api/public/products
Lista produtos públicos de todas as organizações (marketplace).

**Autenticação:** Não requerida (Pública)

**Query Parameters (todos opcionais):**
- category: String - Filtrar por categoria
- search: String - Buscar por nome ou descrição
- minPrice: Number - Preço mínimo
- maxPrice: Number - Preço máximo
- organizationId: String - Filtrar por organização
- page: Number - Número da página (padrão: 1)
- limit: Number - Itens por página (padrão: 20)

**Exemplo:**
```
GET /api/public/products?category=alimentos&organizationId=uuid&page=1&limit=20
```

**Resposta de Sucesso (200):**
```json
{
  "data": [
    {
      "id": "uuid",
      "name": "Nome do Produto",
      "description": "Descrição",
      "price": 29.99,
      "category": "alimentos",
      "imageUrl": "https://example.com/product.jpg",
      "stockQty": 100,
      "weightGrams": 500,
      "sku": "PROD-001",
      "organizationId": "uuid",
      "organization": {
        "id": "uuid",
        "name": "Nome da ONG",
        "slug": "nome-da-ong"
      },
      "isActive": true,
      "createdAt": "2024-01-01T00:00:00.000Z",
      "updatedAt": "2024-01-01T00:00:00.000Z"
    }
  ],
  "meta": {
    "total": 100,
    "page": 1,
    "limit": 20,
    "totalPages": 5
  }
}
```

---

### GET /api/public/products/:id
Busca um produto público por ID.

**Autenticação:** Não requerida (Pública)

**Parâmetros de URL:**
- id: UUID do produto

**Resposta de Sucesso (200):**
```json
{
  "id": "uuid",
  "name": "Nome do Produto",
  "description": "Descrição",
  "price": 29.99,
  "category": "alimentos",
  "imageUrl": "https://example.com/product.jpg",
  "stockQty": 100,
  "weightGrams": 500,
  "sku": "PROD-001",
  "organizationId": "uuid",
  "organization": {
    "id": "uuid",
    "name": "Nome da ONG",
    "slug": "nome-da-ong",
    "logoUrl": "https://example.com/logo.png"
  },
  "isActive": true,
  "createdAt": "2024-01-01T00:00:00.000Z",
  "updatedAt": "2024-01-01T00:00:00.000Z"
}
```

---

## Pedidos

### POST /api/orders
Cria um novo pedido para o usuário autenticado.

**Autenticação:** Requerida

**Body:**
```json
{
  "items": [
    {
      "productId": "uuid",
      "quantity": 2
    },
    {
      "productId": "uuid",
      "quantity": 1
    }
  ],
  "shippingDetails": {
    "address": "Rua Exemplo, 123",
    "city": "São Paulo",
    "state": "SP",
    "zipCode": "01234-567",
    "recipientName": "João Silva",
    "recipientPhone": "+5511999999999"
  },
  "paymentMethod": "credit_card",
  "idempotencyKey": "unique-key-123"
}
```

**Validações:**
- items: Array obrigatório, cada item deve ter:
  - productId: String obrigatória
  - quantity: Integer, mínimo 1
- shippingDetails: Objeto opcional com todos os campos obrigatórios se fornecido
- paymentMethod: String obrigatória
- idempotencyKey: String opcional (para evitar duplicação)

**Resposta de Sucesso (201):**
```json
{
  "id": "uuid",
  "userId": "uuid",
  "status": "pending",
  "totalAmount": 89.97,
  "items": [
    {
      "id": "uuid",
      "productId": "uuid",
      "quantity": 2,
      "unitPrice": 29.99,
      "subtotal": 59.98,
      "product": {
        "name": "Nome do Produto",
        "imageUrl": "https://example.com/product.jpg"
      }
    }
  ],
  "shippingDetails": {
    "address": "Rua Exemplo, 123",
    "city": "São Paulo",
    "state": "SP",
    "zipCode": "01234-567",
    "recipientName": "João Silva",
    "recipientPhone": "+5511999999999"
  },
  "paymentMethod": "credit_card",
  "createdAt": "2024-01-01T00:00:00.000Z",
  "updatedAt": "2024-01-01T00:00:00.000Z"
}
```

---

### GET /api/orders
Lista pedidos do usuário autenticado.

**Autenticação:** Requerida

**Query Parameters (todos opcionais):**
- page: Number - Número da página (padrão: 1)
- pageSize: Number - Itens por página (padrão: 20)

**Exemplo:**
```
GET /api/orders?page=1&pageSize=10
```

**Resposta de Sucesso (200):**
```json
{
  "data": [
    {
      "id": "uuid",
      "userId": "uuid",
      "status": "pending",
      "totalAmount": 89.97,
      "items": [
        {
          "id": "uuid",
          "productId": "uuid",
          "quantity": 2,
          "unitPrice": 29.99,
          "subtotal": 59.98,
          "product": {
            "name": "Nome do Produto",
            "imageUrl": "https://example.com/product.jpg"
          }
        }
      ],
      "createdAt": "2024-01-01T00:00:00.000Z"
    }
  ],
  "meta": {
    "total": 15,
    "page": 1,
    "pageSize": 10,
    "totalPages": 2
  }
}
```

---

### GET /api/orders/:id
Busca um pedido específico do usuário autenticado.

**Autenticação:** Requerida

**Parâmetros de URL:**
- id: UUID do pedido

**Resposta de Sucesso (200):**
```json
{
  "id": "uuid",
  "userId": "uuid",
  "status": "pending",
  "totalAmount": 89.97,
  "items": [
    {
      "id": "uuid",
      "productId": "uuid",
      "quantity": 2,
      "unitPrice": 29.99,
      "subtotal": 59.98,
      "product": {
        "id": "uuid",
        "name": "Nome do Produto",
        "imageUrl": "https://example.com/product.jpg",
        "category": "alimentos"
      }
    }
  ],
  "shippingDetails": {
    "address": "Rua Exemplo, 123",
    "city": "São Paulo",
    "state": "SP",
    "zipCode": "01234-567",
    "recipientName": "João Silva",
    "recipientPhone": "+5511999999999"
  },
  "paymentMethod": "credit_card",
  "createdAt": "2024-01-01T00:00:00.000Z",
  "updatedAt": "2024-01-01T00:00:00.000Z"
}
```

---

## Pedidos da Organização

### GET /api/organizations/:orgId/orders
Lista pedidos de uma organização específica.

**Autenticação:** Requerida + Acesso à Organização

**Parâmetros de URL:**
- orgId: UUID da organização

**Query Parameters (todos opcionais):**
- page: Number - Número da página (padrão: 1)
- pageSize: Number - Itens por página (padrão: 20)

**Exemplo:**
```
GET /api/organizations/uuid/orders?page=1&pageSize=20
```

**Resposta de Sucesso (200):**
```json
{
  "data": [
    {
      "id": "uuid",
      "userId": "uuid",
      "status": "pending",
      "totalAmount": 89.97,
      "items": [
        {
          "id": "uuid",
          "productId": "uuid",
          "quantity": 2,
          "unitPrice": 29.99,
          "subtotal": 59.98,
          "product": {
            "name": "Nome do Produto",
            "organizationId": "uuid"
          }
        }
      ],
      "user": {
        "id": "uuid",
        "fullName": "João Silva",
        "email": "joao@example.com"
      },
      "createdAt": "2024-01-01T00:00:00.000Z"
    }
  ],
  "meta": {
    "total": 50,
    "page": 1,
    "pageSize": 20,
    "totalPages": 3
  }
}
```

---

## Busca

### POST /api/public/search
Realiza busca inteligente de produtos no marketplace.

**Autenticação:** Não requerida (Pública)

**Body:**
```json
{
  "query": "alimentos orgânicos"
}
```

**Query Parameters (todos opcionais):**
- page: Number - Número da página (padrão: 1)
- pageSize: Number - Itens por página (padrão: 20)

**Exemplo:**
```
POST /api/public/search?page=1&pageSize=20
```

**Validações:**
- query: String obrigatória

**Resposta de Sucesso (200):**
```json
{
  "data": [
    {
      "id": "uuid",
      "name": "Produto Encontrado",
      "description": "Descrição do produto",
      "price": 29.99,
      "category": "alimentos",
      "imageUrl": "https://example.com/product.jpg",
      "organizationId": "uuid",
      "organization": {
        "name": "Nome da ONG",
        "slug": "nome-da-ong"
      },
      "relevanceScore": 0.95
    }
  ],
  "meta": {
    "total": 25,
    "page": 1,
    "pageSize": 20,
    "totalPages": 2,
    "query": "alimentos orgânicos"
  }
}
```

---

## Health Check

### GET /api
Verifica se a API está funcionando.

**Autenticação:** Não requerida (Pública)

**Resposta de Sucesso (200):**
```json
{
  "message": "Hello World!"
}
```

---

## Códigos de Status HTTP

- **200 OK**: Requisição bem-sucedida
- **201 Created**: Recurso criado com sucesso
- **400 Bad Request**: Dados inválidos na requisição
- **401 Unauthorized**: Autenticação necessária ou token inválido
- **403 Forbidden**: Sem permissão para acessar o recurso
- **404 Not Found**: Recurso não encontrado
- **409 Conflict**: Conflito (ex: email já cadastrado)
- **422 Unprocessable Entity**: Validação falhou
- **500 Internal Server Error**: Erro no servidor

---

## Erros

Formato padrão de erro:

```json
{
  "statusCode": 400,
  "message": "Validation failed",
  "error": "Bad Request",
  "details": [
    {
      "field": "email",
      "message": "email must be a valid email"
    }
  ]
}
```
