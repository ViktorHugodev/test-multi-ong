# Setup Guide - Marketplace Multi-ONG Backend

## Prerequisites

- **Node.js** 18+ and npm
- **Docker** and Docker Compose (for PostgreSQL and Redis)
- **Git**

---

## Quick Start

### 1. Clone and Install Dependencies

```bash
cd back-nestjs
npm install
```

### 2. Environment Configuration

Copy the example environment file:
```bash
cp .env.example .env
```

Edit `.env` with your configuration:
```env
# Database
DATABASE_URL="postgresql://postgres:postgres@localhost:5433/marketplace?schema=public"

# JWT
JWT_SECRET="your-secret-key-change-in-production"
JWT_EXPIRES_IN="7d"

# Redis
REDIS_HOST="localhost"
REDIS_PORT=6379

# App
PORT=3000
NODE_ENV="development"
```

### 3. Start Infrastructure Services

Start PostgreSQL and Redis using Docker:
```bash
docker-compose up -d
```

Verify services are running:
```bash
docker-compose ps
```

Expected output:
```
NAME      IMAGE                   STATUS
db        postgres:16-alpine      Up
redis     redis:7-alpine          Up
```

### 4. Database Setup

Run Prisma migrations:
```bash
npx prisma migrate dev
```

Generate Prisma Client:
```bash
npx prisma generate
```

Seed the database with test data:
```bash
npx prisma db seed
```

This creates:
- 2 ONGs (Artesãos da Esperança, Doceria Solidária)
- 2 ONG managers
- 1 customer user
- 10 products (5 per ONG)

### 5. Start the Application

Development mode (with hot reload):
```bash
npm run start:dev
```

The API will be available at: `http://localhost:3000/api`

---

## Project Structure

```
back-nestjs/
├── src/
│   ├── auth/                    # Authentication module
│   │   ├── decorators/          # Custom decorators (@CurrentUser, etc.)
│   │   ├── dto/                 # Login/Register DTOs
│   │   ├── guards/              # JWT & Organization guards
│   │   ├── strategies/          # JWT strategy
│   │   ├── auth.controller.ts
│   │   ├── auth.service.ts
│   │   └── auth.module.ts
│   │
│   ├── common/                  # Shared utilities
│   │   ├── filters/             # Exception filters
│   │   ├── interceptors/        # Logging, Transform interceptors
│   │   └── pipes/               # Validation pipes
│   │
│   ├── config/                  # Configuration files
│   │   ├── app.config.ts
│   │   ├── database.config.ts
│   │   ├── jwt.config.ts
│   │   └── redis.config.ts
│   │
│   ├── database/                # Database layer
│   │   ├── prisma/
│   │   │   └── prisma.service.ts
│   │   └── repositories/
│   │       └── base.repository.ts
│   │
│   ├── modules/
│   │   ├── organizations/       # Organizations CRUD
│   │   │   ├── dto/
│   │   │   ├── organizations.controller.ts
│   │   │   ├── organizations.service.ts
│   │   │   ├── organizations.repository.ts
│   │   │   └── organizations.module.ts
│   │   │
│   │   ├── products/            # Products with multi-tenancy
│   │   │   ├── dto/
│   │   │   ├── products.controller.ts       # ONG staff only
│   │   │   ├── public-products.controller.ts # Public marketplace
│   │   │   ├── products.service.ts
│   │   │   ├── products.repository.ts
│   │   │   └── products.module.ts
│   │   │
│   │   ├── orders/              # Orders with concurrency control
│   │   │   ├── dto/
│   │   │   ├── orders.controller.ts
│   │   │   ├── orders.service.ts
│   │   │   ├── orders.repository.ts
│   │   │   └── orders.module.ts
│   │   │
│   │   ├── search/              # AI-powered search
│   │   │   ├── llm/
│   │   │   │   └── llm.service.ts
│   │   │   ├── fallback/
│   │   │   │   └── text-search.service.ts
│   │   │   ├── search.controller.ts
│   │   │   ├── search.service.ts
│   │   │   └── search.module.ts
│   │   │
│   │   └── jobs/                # Background jobs (Bull)
│   │       ├── processors/
│   │       │   ├── payment.processor.ts
│   │       │   └── notification.processor.ts
│   │       └── jobs.module.ts
│   │
│   ├── app.module.ts
│   └── main.ts
│
├── prisma/
│   ├── schema.prisma            # Database schema
│   ├── migrations/              # Database migrations
│   └── seed.ts                  # Seed script
│
├── .env                         # Environment variables
├── .env.example                 # Example environment file
├── docker-compose.yaml          # Docker services
├── package.json
├── tsconfig.json
├── API.md                       # API documentation
└── SETUP.md                     # This file
```

---

## Key Features Implemented

### 🔒 Multi-Tenancy
- **Strict isolation** between organizations
- ONG staff can only manage their own products
- Automatic organization filtering in all queries
- Repository-level validation

**Implementation:**
- `OrganizationGuard` enforces organization access
- `@RequiresOrgAccess()` decorator
- `@CurrentOrganization()` decorator
- All product operations include organizationId check

### 🛡️ Concurrency Control
- **Optimistic locking** on stock updates
- Transaction-based order creation
- Prevents overselling under high load

**Implementation:**
```typescript
// Atomic stock update with version check
await prisma.product.update({
  where: {
    id: productId,
    stockQty: { gte: quantity }, // Optimistic lock
  },
  data: {
    stockQty: { decrement: quantity },
  },
});
```

### 🔍 AI-Powered Search
- LLM query parsing (with fallback)
- Analytics and logging
- Natural language queries

**Examples:**
- "doces baratos" → filters by category & price
- "artesanato under $50" → maxPrice filter
- Falls back to text search if AI fails

### ⚡ Async Processing
- **Bull** queues for payments and notifications
- Redis-backed job processing
- Retry logic and error handling

**Processors:**
- `PaymentProcessor` - Payment gateway integration
- `NotificationProcessor` - Email/SMS notifications

### 🔐 Authentication & Authorization
- JWT-based authentication
- Role-based access control
- Global authentication guard (opt-in public)

**Roles:**
- `admin` - Full access
- `ong_manager` - Manage organization
- `ong_staff` - Manage products
- `customer` - Place orders

---

## Database Schema

### Core Models
- **User** - Users with roles
- **Organization** - ONGs
- **Product** - Products (belongs to organization)
- **Order** - Customer orders
- **OrderItem** - Order line items
- **SearchLog** - Search analytics

### Key Relationships
- User → Organization (optional, many-to-one)
- Product → Organization (required, many-to-one)
- Order → User (required, many-to-one)
- OrderItem → Product (required, many-to-one)
- OrderItem → Organization (for multi-ONG orders)

---

## Testing

### Unit Tests
```bash
npm run test
```

### E2E Tests
```bash
npm run test:e2e
```

### Manual Testing

Use the provided test users (see API.md):
```bash
# Login as ONG manager
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "manager@artesaosesperanca.org",
    "password": "password123"
  }'
```

### Load Testing

Test concurrency control:
```bash
# Install artillery
npm install -g artillery

# Create test.yml
artillery quick --count 50 --num 10 \
  http://localhost:3000/api/public/products
```

---

## Prisma Commands

### Generate Prisma Client
```bash
npx prisma generate
```

### Create Migration
```bash
npx prisma migrate dev --name <migration-name>
```

### Reset Database
```bash
npx prisma migrate reset
```

### Open Prisma Studio (GUI)
```bash
npx prisma studio
```

### Run Seed
```bash
npx prisma db seed
```

---

## Development Tips

### Watch Mode
```bash
npm run start:dev
```

### Debug Mode
```bash
npm run start:debug
```
Then attach your debugger to port 9229.

### Logs
All HTTP requests are logged with:
- Method and URL
- Response time
- Status code

Example:
```
[HTTP] → POST /api/orders
[HTTP] ← POST /api/orders - 145ms
```

### Environment Variables
- Use `.env` for local development
- Never commit `.env` to git
- Update `.env.example` when adding new variables

---

## Production Deployment

### Build
```bash
npm run build
```

### Start Production
```bash
npm run start:prod
```

### Environment Variables for Production
```env
NODE_ENV=production
PORT=3000
DATABASE_URL="postgresql://..."
JWT_SECRET="<strong-random-secret>"
REDIS_HOST="your-redis-host"
REDIS_PORT=6379
```

### Recommended Setup
- Use managed PostgreSQL (AWS RDS, DigitalOcean, etc.)
- Use managed Redis (AWS ElastiCache, Redis Cloud, etc.)
- Deploy to: AWS ECS, DigitalOcean App Platform, Railway, Render
- Use environment variables for secrets
- Enable HTTPS
- Set up monitoring (Sentry, DataDog, etc.)

---

## Troubleshooting

### Prisma Client Generation Fails
```bash
# Clear Prisma cache
rm -rf node_modules/.prisma
npx prisma generate
```

### Database Connection Issues
```bash
# Check if PostgreSQL is running
docker-compose ps

# View logs
docker-compose logs db

# Restart services
docker-compose restart
```

### Redis Connection Issues
```bash
# Check Redis
docker-compose logs redis

# Test connection
docker exec -it redis redis-cli ping
```

### Port Already in Use
```bash
# Kill process on port 3000
lsof -ti:3000 | xargs kill -9

# Or change port in .env
PORT=3001
```

---

## Additional Resources

- [NestJS Documentation](https://docs.nestjs.com)
- [Prisma Documentation](https://www.prisma.io/docs)
- [Bull Documentation](https://github.com/OptimalBits/bull)
- [Passport JWT](http://www.passportjs.org/packages/passport-jwt/)

---

## Support

For issues or questions:
1. Check the API documentation (API.md)
2. Review this setup guide
3. Check application logs
4. Verify environment variables
