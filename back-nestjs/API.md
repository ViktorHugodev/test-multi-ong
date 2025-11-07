# API Documentation - Marketplace Multi-ONG

## Base URL
```
http://localhost:3000/api
```

## Authentication

Most endpoints require JWT authentication. Include the token in the Authorization header:
```
Authorization: Bearer <your-jwt-token>
```

---

## Authentication Endpoints

### Register User
**POST** `/api/auth/register`

**Body:**
```json
{
  "email": "user@example.com",
  "password": "password123",
  "fullName": "John Doe",
  "role": "customer",  // Optional: admin, ong_manager, ong_staff, customer
  "organizationId": "uuid"  // Optional: Required for ONG staff
}
```

**Response:**
```json
{
  "user": {
    "id": "uuid",
    "email": "user@example.com",
    "fullName": "John Doe",
    "role": "customer"
  },
  "token": "jwt-token"
}
```

### Login
**POST** `/api/auth/login`

**Body:**
```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

### Get Profile
**GET** `/api/auth/me`

**Headers:** `Authorization: Bearer <token>`

---

## Organizations Endpoints

### Create Organization
**POST** `/api/organizations`

**Headers:** `Authorization: Bearer <token>`

**Body:**
```json
{
  "name": "ONG Artesanato Local",
  "slug": "artesanato-local",
  "description": "Produção de artesanato tradicional",
  "email": "contato@artesanato.org",
  "phone": "+5538999999999",
  "logoUrl": "https://example.com/logo.png"
}
```

### List Organizations (Public)
**GET** `/api/organizations`

### Get Organization by ID (Public)
**GET** `/api/organizations/:id`

### Get Organization by Slug (Public)
**GET** `/api/organizations/slug/:slug`

### Update Organization
**PATCH** `/api/organizations/:id`

**Headers:** `Authorization: Bearer <token>`

### Delete Organization
**DELETE** `/api/organizations/:id`

**Headers:** `Authorization: Bearer <token>`

---

## Products Endpoints

### Create Product (ONG Staff Only)
**POST** `/api/products`

**Headers:** `Authorization: Bearer <token>`

**Body:**
```json
{
  "name": "Vaso de Cerâmica",
  "description": "Vaso artesanal pintado à mão",
  "price": 45.90,
  "category": "Artesanato",
  "stockQty": 10,
  "weightGrams": 500,
  "sku": "ART-001",
  "imageUrl": "https://example.com/vaso.jpg"
}
```

**Note:** Product is automatically associated with the user's organization.

### List Products (ONG Staff Only)
**GET** `/api/products`

**Headers:** `Authorization: Bearer <token>`

**Query Parameters:**
- `category`: Filter by category
- `search`: Search in name/description
- `minPrice`: Minimum price
- `maxPrice`: Maximum price
- `page`: Page number (default: 1)
- `limit`: Items per page (default: 20)

### Get Product by ID (ONG Staff Only)
**GET** `/api/products/:id`

**Headers:** `Authorization: Bearer <token>`

### Update Product (ONG Staff Only)
**PATCH** `/api/products/:id`

**Headers:** `Authorization: Bearer <token>`

### Delete Product (ONG Staff Only)
**DELETE** `/api/products/:id`

**Headers:** `Authorization: Bearer <token>`

---

## Public Products Endpoints (Marketplace)

### List All Products (Public)
**GET** `/api/public/products`

**Query Parameters:**
- `organizationId`: Filter by organization
- `category`: Filter by category
- `search`: Search in name/description
- `minPrice`: Minimum price
- `maxPrice`: Maximum price
- `page`: Page number (default: 1)
- `limit`: Items per page (default: 20)

**Example:**
```
GET /api/public/products?category=Artesanato&maxPrice=50&page=1&limit=10
```

### Get Product by ID (Public)
**GET** `/api/public/products/:id`

---

## Orders Endpoints

### Create Order
**POST** `/api/orders`

**Headers:** `Authorization: Bearer <token>`

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
    "address": "Rua Example, 123",
    "city": "São Paulo",
    "state": "SP",
    "zipCode": "01234-567",
    "recipientName": "João Silva",
    "recipientPhone": "+5511999999999"
  },
  "paymentMethod": "credit_card",
  "idempotencyKey": "unique-key-123"  // Optional: Prevents duplicate orders
}
```

**Features:**
- ✅ Automatic stock reservation
- ✅ Optimistic locking to prevent overselling
- ✅ Transaction rollback if any item is unavailable
- ✅ Idempotency support

### List Customer Orders
**GET** `/api/orders`

**Headers:** `Authorization: Bearer <token>`

### Get Order by ID
**GET** `/api/orders/:id`

**Headers:** `Authorization: Bearer <token>`

### Cancel Order
**PATCH** `/api/orders/:id/cancel`

**Headers:** `Authorization: Bearer <token>`

**Note:** Only pending orders can be cancelled. Stock is automatically returned.

---

## Search Endpoints

### Intelligent Search (Public)
**GET** `/api/search?q=<query>`

**Query Parameters:**
- `q`: Search query (natural language)

**Examples:**
```
GET /api/search?q=doces baratos
GET /api/search?q=artesanato under $50
GET /api/search?q=decoracao
```

**Response:**
```json
{
  "query": "doces baratos",
  "filters": {
    "category": "Doces",
    "search": "baratos"
  },
  "aiSuccess": true,
  "fallbackUsed": false,
  "results": [...],
  "total": 15,
  "latency": 45
}
```

**Features:**
- ✅ AI-powered query parsing
- ✅ Automatic fallback to text search
- ✅ Search logging for analytics

### Search Analytics
**GET** `/api/search/analytics?limit=100`

**Response:**
```json
{
  "total": 1000,
  "aiSuccessRate": "85.50",
  "avgLatency": "52.30",
  "recentSearches": [...]
}
```

---

## Multi-Tenancy & Security Features

### 🔒 Strict Multi-Tenancy Isolation
- Each organization's data is completely isolated
- ONG staff can only access their own organization's products
- Automatic organization filtering on all queries
- Validation at repository level

### 🛡️ Concurrency Control
- Optimistic locking on product stock updates
- Transaction-based order creation
- Prevents overselling even under high load
- Automatic rollback on conflicts

### 🔐 Authentication & Authorization
- JWT-based authentication
- Role-based access control (admin, ong_manager, ong_staff, customer)
- Organization-level permissions
- Protected endpoints by default (opt-in public access)

---

## Testing the API

### 1. Start the services
```bash
# Start PostgreSQL and Redis
docker-compose up -d

# Run migrations
npx prisma migrate dev

# Seed database
npx prisma db seed

# Start application
npm run start:dev
```

### 2. Test Authentication
```bash
# Register a customer
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "customer@test.com",
    "password": "password123",
    "fullName": "Test Customer",
    "role": "customer"
  }'

# Login
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "customer@test.com",
    "password": "password123"
  }'
```

### 3. Browse Products (Public)
```bash
curl http://localhost:3000/api/public/products
```

### 4. Search Products
```bash
curl "http://localhost:3000/api/search?q=artesanato"
```

### 5. Create Order
```bash
curl -X POST http://localhost:3000/api/orders \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <your-token>" \
  -d '{
    "items": [
      {"productId": "<product-id>", "quantity": 1}
    ],
    "paymentMethod": "credit_card"
  }'
```

---

## Default Test Users (from seed)

### ONG Manager 1
- **Email:** manager@artesaosesperanca.org
- **Password:** password123
- **Organization:** Artesãos da Esperança

### ONG Manager 2
- **Email:** manager@doceriasolidaria.org
- **Password:** password123
- **Organization:** Doceria Solidária

### Customer
- **Email:** customer@example.com
- **Password:** password123

---

## Error Responses

All errors follow this format:
```json
{
  "statusCode": 400,
  "timestamp": "2025-01-15T10:30:00.000Z",
  "path": "/api/orders",
  "method": "POST",
  "message": "Insufficient stock for product Vaso de Cerâmica. Available: 5"
}
```

Common status codes:
- `400` - Bad Request (validation error)
- `401` - Unauthorized (missing/invalid token)
- `403` - Forbidden (insufficient permissions)
- `404` - Not Found
- `409` - Conflict (e.g., duplicate, stock unavailable)
- `500` - Internal Server Error
