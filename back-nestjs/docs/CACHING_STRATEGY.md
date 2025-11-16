# Distributed Caching Strategy

This document describes the Redis-based distributed caching system implemented for the Multi-ONG Marketplace.

## Table of Contents

1. [Overview](#overview)
2. [Architecture](#architecture)
3. [Cached Resources](#cached-resources)
4. [Key Generation Strategy](#key-generation-strategy)
5. [Invalidation Strategies](#invalidation-strategies)
6. [Metrics and Monitoring](#metrics-and-monitoring)
7. [Configuration](#configuration)
8. [Usage Guide](#usage-guide)
9. [Performance Benchmarks](#performance-benchmarks)
10. [Trade-offs and Decisions](#trade-offs-and-decisions)
11. [Troubleshooting](#troubleshooting)
12. [Future Improvements](#future-improvements)

---

## Overview

The caching system optimizes the public marketplace portal by reducing database load and improving response times. It uses a **cache-aside pattern** with Redis as the distributed cache store.

### Key Features

- **Distributed Caching**: Redis-based for horizontal scalability
- **Automatic Cache Management**: `@Cacheable()` decorator for declarative caching
- **Intelligent Invalidation**: Automatic cache invalidation on data mutations
- **Multi-tenancy Support**: Organization-isolated cache keys
- **Persistent Metrics**: Hit/miss ratios stored in Redis (survive restarts)
- **Cache Warming**: Pre-population of popular queries on startup
- **Health Monitoring**: Admin endpoints for cache management

---

## Architecture

```
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│   Controller    │     │    Service      │     │   Repository    │
│  @Cacheable()   │────▶│  Cache Logic    │────▶│   Prisma ORM    │
└─────────────────┘     └─────────────────┘     └─────────────────┘
         │                       │                        │
         ▼                       ▼                        ▼
┌─────────────────────────────────────────────────────────────────┐
│                      CacheService (Redis)                       │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐       │
│  │   GET    │  │   SET    │  │   DEL    │  │ METRICS  │       │
│  │  (hit?)  │  │  (cache) │  │(invalidate)│  │  (INCR) │       │
│  └──────────┘  └──────────┘  └──────────┘  └──────────┘       │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
                    ┌─────────────────┐
                    │     Redis       │
                    │   (ioredis)     │
                    └─────────────────┘
```

### Components

| Component | File | Responsibility |
|-----------|------|----------------|
| **CacheService** | `src/common/cache/cache.service.ts` | Core Redis operations, metrics tracking |
| **CacheModule** | `src/common/cache/cache.module.ts` | Global module registration |
| **CacheController** | `src/common/cache/cache.controller.ts` | Admin endpoints |
| **@Cacheable()** | `src/common/cache/decorators/cacheable.decorator.ts` | Automatic caching decorator |
| **CacheLoggingInterceptor** | `src/common/cache/interceptors/cache-logging.interceptor.ts` | Structured logging |
| **ProductsCacheService** | `src/modules/products/products-cache.service.ts` | Domain-specific caching |

---

## Cached Resources

### 1. Product Listings (Organization-scoped)

- **Endpoint**: `GET /products`
- **TTL**: 5 minutes (300 seconds)
- **Key Pattern**: `products:list:{controllerName}:{methodName}:{organizationId}:{filters}`
- **Invalidation**: On CREATE, UPDATE, or DELETE of any product in the organization
- **Rationale**: High traffic endpoint, moderate change frequency

```typescript
@Get()
@Cacheable({ ttl: 300, keyPrefix: 'products:list' })
findAll(@CurrentOrganization() organizationId: string, @Query() filters: ProductFiltersDto)
```

### 2. Product Details

- **Endpoint**: `GET /products/:id`
- **TTL**: 10 minutes (600 seconds)
- **Key Pattern**: `products:detail:{controllerName}:{methodName}:{organizationId}:id_{productId}`
- **Invalidation**: On UPDATE or DELETE of the specific product
- **Rationale**: Less frequent access, content rarely changes

```typescript
@Get(':id')
@Cacheable({ ttl: 600, keyPrefix: 'products:detail' })
findOne(@Param('id') id: string, @CurrentOrganization() organizationId: string)
```

### 3. Public Product Listings (Marketplace)

- **Endpoint**: `GET /products/public`
- **TTL**: 5 minutes (300 seconds)
- **Key Pattern**: `products:public:{filters}`
- **Invalidation**: On any product mutation
- **Rationale**: Highest traffic endpoint, aggressive caching

### 4. Individual Products (Public)

- **Endpoint**: `GET /products/public/:id`
- **TTL**: 10 minutes (600 seconds)
- **Key Pattern**: `product:{productId}`
- **Invalidation**: On UPDATE or DELETE of specific product

---

## Key Generation Strategy

### Automatic Key Generation (@Cacheable decorator)

The decorator automatically generates unique cache keys based on:

```
{keyPrefix}:{ControllerName}:{MethodName}:{organizationId}:{routeParams}:{queryParams}
```

**Example:**
```
products:list:ProductsController:findAll:org_abc123:category_electronics:page_1:limit_20
```

### Key Components

| Part | Source | Purpose |
|------|--------|---------|
| `keyPrefix` | Decorator option | Domain namespace |
| `ControllerName` | Execution context | Component isolation |
| `MethodName` | Handler name | Method isolation |
| `organizationId` | JWT payload or request | Multi-tenancy isolation |
| `routeParams` | Request params | Resource identification |
| `queryParams` | Request query | Filter/pagination uniqueness |

### Query Parameter Serialization

Parameters are sorted alphabetically and serialized:

```typescript
// Input: { page: 1, limit: 20, category: 'electronics' }
// Output: 'category_electronics:limit_20:page_1'
```

---

## Invalidation Strategies

### Cache-Aside with Write-Through Invalidation

```
┌─────────┐   miss    ┌─────────┐
│  Cache  │◀──────────│ Request │
└─────────┘           └─────────┘
     │ hit                 │
     ▼                     ▼ miss
┌─────────┐         ┌─────────┐
│  Return │         │Database │
└─────────┘         └─────────┘
                          │
                          ▼
                    ┌─────────┐
                    │  Store  │
                    │in Cache │
                    └─────────┘
```

### Invalidation by Operation

| Operation | Invalidation Scope | Example |
|-----------|-------------------|---------|
| **CREATE** | All listings for organization | `products:list:org123:*` |
| **UPDATE** | Specific product + all listings | `product:id123` + `products:list:org123:*` |
| **DELETE** | Specific product + all listings | `product:id123` + `products:list:org123:*` |
| **STOCK_UPDATE** | Specific product only | `product:id123` |

### Implementation Example

```typescript
// ProductsService.update()
async update(id: string, organizationId: string, dto: UpdateProductDto) {
  const product = await this.productsRepository.update(id, dto);

  // Invalidate cache
  await this.cacheService.invalidateOnUpdate(id, organizationId);
  // Internally deletes:
  // - product:{id}
  // - products:list:{organizationId}:*
  // - products:public:*

  return product;
}
```

### Pattern-Based Deletion

Uses Redis `KEYS` command (be cautious with large datasets):

```typescript
await this.cacheService.deletePattern('products:list:org123:*');
// Deletes all matching keys
```

**Note**: Consider using `SCAN` for production with many keys to avoid blocking.

---

## Metrics and Monitoring

### In-Memory Metrics (Current Instance)

```typescript
const metrics = cacheService.getMetrics();
// {
//   hits: 1250,
//   misses: 150,
//   sets: 200,
//   deletes: 50,
//   errors: 2,
//   hitRate: '89.29%',
//   totalRequests: 1400
// }
```

**Characteristics:**
- Fast access
- Resets on application restart
- Instance-specific

### Persistent Metrics (Redis-stored)

```typescript
const metrics = await cacheService.getPersistentMetrics();
// {
//   hits: 5000,
//   misses: 1200,
//   ratio: 0.806,
//   hitRate: '80.65%',
//   totalRequests: 6200
// }
```

**Characteristics:**
- Survives application restarts
- Shared across instances (horizontal scaling)
- Uses Redis INCR for atomic operations
- Stored in: `cache:metrics:hits` and `cache:metrics:misses`

### Admin Endpoints

| Endpoint | Method | Auth | Purpose |
|----------|--------|------|---------|
| `/cache/metrics` | GET | Public | Combined in-memory + persistent metrics |
| `/cache/metrics/persistent` | GET | Public | Persistent metrics only |
| `/cache/metrics/reset` | DELETE | JWT | Reset persistent metrics |
| `/cache/info` | GET | JWT | Redis server information |
| `/cache/stats` | GET | JWT | Cache keys by prefix |
| `/cache/health` | GET | Public | Health check |
| `/cache/clear` | DELETE | JWT | Clear all cache |
| `/cache/pattern/:pattern` | DELETE | JWT | Clear by pattern |

### Example API Responses

```bash
# Get comprehensive metrics
GET /cache/metrics

{
  "statusCode": 200,
  "message": "Cache metrics retrieved successfully",
  "data": {
    "inMemory": {
      "hits": 150,
      "misses": 20,
      "sets": 45,
      "deletes": 10,
      "errors": 0,
      "hitRate": "88.24%",
      "totalRequests": 170
    },
    "persistent": {
      "hits": 5200,
      "misses": 980,
      "ratio": 0.8414,
      "hitRate": "84.14%",
      "totalRequests": 6180
    }
  },
  "timestamp": "2025-01-15T10:30:00.000Z"
}
```

---

## Configuration

### Environment Variables

```bash
# Redis Connection
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=optional

# Cache Behavior
CACHE_WARMING_ENABLED=true
LOG_CACHE_ACCESS=false  # Set to true for detailed logs
```

### TTL Configuration

| Resource | Default TTL | Rationale |
|----------|-------------|-----------|
| Product Listings | 5 min (300s) | High traffic, moderate changes |
| Product Details | 10 min (600s) | Lower traffic, rare changes |
| Search Results | 3 min (180s) | Variable queries, dynamic |
| Public Catalog | 5 min (300s) | Highest traffic, aggressive caching |

### Cache Warming

Preloads popular queries on application startup:

```typescript
// ProductsModule.onModuleInit()
async onModuleInit() {
  await this.productsCacheService.warmCache(async (filters) => {
    return this.productsService.findPublicProducts(filters);
  });
}
```

**Pre-warmed Queries:**
- Default listing (page 1, 20 items)
- Popular categories (Alimentos, Roupas, Artesanato)
- Common price ranges

---

## Usage Guide

### Using @Cacheable() Decorator

```typescript
import { Cacheable } from '../../common/cache/decorators/cacheable.decorator';

@Controller('products')
export class ProductsController {

  @Get()
  @Cacheable({ ttl: 300, keyPrefix: 'products:list' })
  findAll(
    @CurrentOrganization() organizationId: string,
    @Query() filters: ProductFiltersDto
  ) {
    return this.productsService.findByOrganization(organizationId, filters);
  }
}
```

**Decorator Options:**
- `ttl`: Time to live in seconds (default: 300)
- `keyPrefix`: Custom key prefix (default: auto-generated from controller name)

### Manual Caching with CacheService

```typescript
import { CacheService } from '../../common/cache/cache.service';

@Injectable()
export class MyService {
  constructor(private cacheService: CacheService) {}

  async getExpensiveData(id: string) {
    const cacheKey = `expensive:${id}`;

    // Try cache first
    const cached = await this.cacheService.get<DataType>(cacheKey);
    if (cached) return cached;

    // Fetch from source
    const data = await this.fetchFromDatabase(id);

    // Cache for 10 minutes
    await this.cacheService.set(cacheKey, data, { ttl: 600 });

    return data;
  }
}
```

### Using wrap() Method

```typescript
async getProduct(id: string) {
  return this.cacheService.wrap(
    `product:${id}`,
    () => this.repository.findById(id),
    600 // TTL in seconds
  );
}
```

### Adding Cache Logging Interceptor

```typescript
import { CacheLoggingInterceptor } from '../../common/cache/interceptors/cache-logging.interceptor';

@Controller('products')
@UseInterceptors(CacheLoggingInterceptor)
export class ProductsController {
  // All methods will log cache operations
}
```

---

## Performance Benchmarks

### Expected Performance Improvements

| Scenario | Cold Cache | Warm Cache | Improvement |
|----------|-----------|------------|-------------|
| Product Listing (50 items) | ~150ms | ~25ms | >80% |
| Product Detail | ~80ms | ~10ms | >87% |
| Filtered Search | ~200ms | ~30ms | >85% |

### Hit Rate Targets

- **Initial Goal**: >60% hit rate after warm-up
- **Optimal Target**: >80% hit rate in steady state
- **Current Performance**: Varies by usage pattern

### Running Benchmarks

```bash
# Run cache performance tests
npm run test:e2e -- cache-performance.e2e-spec.ts

# Output includes:
# - Cold vs warm cache response times
# - Hit/miss ratios
# - Improvement percentages
```

---

## Trade-offs and Decisions

### Why Redis?

**Pros:**
- Already in infrastructure (Bull/BullMQ)
- High performance (in-memory)
- Native TTL support
- Pattern matching for bulk operations
- Horizontally scalable

**Cons:**
- Additional operational complexity
- Memory constraints
- Network latency (mitigated by local deployment)

### Why Cache-Aside Pattern?

**Pros:**
- Simplicity of implementation
- Fine-grained control over caching logic
- Graceful degradation (fallback to DB on cache failure)
- Flexible invalidation strategies

**Cons:**
- Possible cache staleness
- Cache stampede risk (mitigated by lock mechanism in future)
- Extra round trips on cache miss

### Limitations

1. **Cache Staleness**: Data can be up to TTL seconds old
2. **Pattern Matching Performance**: `KEYS` command can be slow with many keys
3. **No Cache Stampede Protection**: Multiple requests can hit DB simultaneously
4. **Memory Management**: No automatic eviction policy configured

---

## Troubleshooting

### Common Issues

#### 1. Cache Not Working

**Symptoms:** No hit rate improvement

**Solutions:**
```bash
# Check Redis connection
redis-cli ping

# Verify cache keys exist
redis-cli KEYS products:*

# Check logs for errors
LOG_CACHE_ACCESS=true npm run start:dev
```

#### 2. High Miss Rate

**Symptoms:** Hit rate below 50%

**Causes:**
- TTL too short
- High mutation rate invalidating cache
- Diverse query patterns (each unique combination = new cache key)

**Solutions:**
- Increase TTL for stable data
- Implement cache warming for popular queries
- Consider query normalization

#### 3. Stale Data

**Symptoms:** UI shows old data after update

**Solutions:**
- Verify invalidation logic is called
- Check cache key patterns match
- Clear cache manually: `DELETE /cache/clear`

#### 4. Memory Issues

**Solutions:**
```bash
# Check Redis memory usage
redis-cli INFO memory

# Clear specific patterns
DELETE /cache/pattern/products:*

# Monitor key count
GET /cache/stats
```

### Debugging Commands

```bash
# View all cache keys
redis-cli KEYS *

# Check specific key
redis-cli GET products:list:org123:page_1

# View TTL
redis-cli TTL products:list:org123:page_1

# Monitor real-time operations
redis-cli MONITOR
```

---

## Future Improvements

### Short-term (Next Sprint)

- [ ] Implement cache stampede prevention (distributed lock)
- [ ] Add `SCAN` instead of `KEYS` for pattern deletion
- [ ] Configure Redis maxmemory policy (LRU eviction)
- [ ] Add cache size monitoring alerts

### Medium-term (Next Quarter)

- [ ] Implement TTL adjustment based on access frequency
- [ ] Add cache warming scheduler (periodic refresh)
- [ ] Create dashboard for real-time metrics visualization
- [ ] Implement cache preloading for popular searches

### Long-term (Future Releases)

- [ ] Multi-layer caching (L1: in-memory, L2: Redis)
- [ ] GraphQL cache integration
- [ ] Predictive cache warming (ML-based)
- [ ] Cross-region cache replication

---

## API Reference

### CacheService Methods

```typescript
// Basic Operations
get<T>(key: string, options?: CacheOptions): Promise<T | null>
set<T>(key: string, value: T, options?: CacheOptions): Promise<boolean>
del(key: string, options?: CacheOptions): Promise<boolean>
deletePattern(pattern: string): Promise<number>

// Wrapper
wrap<T>(key: string, fn: () => Promise<T>, ttl?: number): Promise<T>

// Persistent Metrics
recordHit(): Promise<void>
recordMiss(): Promise<void>
getPersistentMetrics(): Promise<PersistentCacheMetrics>
resetPersistentMetrics(): Promise<void>

// In-Memory Metrics
getMetrics(): CacheMetrics & { hitRate: string; totalRequests: number }
resetMetrics(): void

// Utility
exists(key: string, options?: CacheOptions): Promise<boolean>
ttl(key: string, options?: CacheOptions): Promise<number>
clear(): Promise<void>
getClient(): Redis
```

### ProductsCacheService Methods

```typescript
// Product Operations
getProduct(productId: string): Promise<Product | null>
setProduct(product: Product): Promise<void>

// Listing Operations
getProductListing(organizationId: string, filters: ProductFiltersDto): Promise<PaginatedResponse | null>
setProductListing(organizationId: string, filters: ProductFiltersDto, data: PaginatedResponse): Promise<void>

// Public Operations
getPublicListing(filters: ProductFiltersDto): Promise<PaginatedResponse | null>
setPublicListing(filters: ProductFiltersDto, data: PaginatedResponse): Promise<void>

// Invalidation
invalidateOnCreate(organizationId: string): Promise<void>
invalidateOnUpdate(productId: string, organizationId: string): Promise<void>
invalidateOnDelete(productId: string, organizationId: string): Promise<void>

// Warming
warmCache(callback: (filters: ProductFiltersDto) => Promise<any>): Promise<void>
```

---

## Conclusion

This caching strategy provides significant performance improvements for the Multi-ONG Marketplace while maintaining data consistency through intelligent invalidation. The combination of automatic caching with the `@Cacheable()` decorator and fine-grained control through `ProductsCacheService` offers flexibility for different use cases.

Key success factors:
- **Proper multi-tenancy isolation** ensures data security
- **Persistent metrics** enable long-term performance monitoring
- **Cache warming** reduces cold start latency
- **Comprehensive invalidation** maintains data consistency

For questions or improvements, please contact the development team or refer to the test suite in `test/cache-performance.e2e-spec.ts`.
