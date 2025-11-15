import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { TestSetupHelper } from './helpers/test-setup.helper';
import { CacheService } from '../src/common/cache/cache.service';

/**
 * Cache Performance Benchmarks
 *
 * This test suite measures the performance impact of Redis caching
 * on product operations. It compares response times with and without cache.
 *
 * Metrics tracked:
 * - Cold start (cache miss) vs warm cache (cache hit)
 * - Improvement percentage
 * - Response time distribution (min, max, avg, p95)
 *
 * Run with: npm run test:e2e -- cache-performance.e2e-spec.ts
 */
describe('Cache Performance Benchmarks (e2e)', () => {
  let app: INestApplication;
  let testHelper: TestSetupHelper;
  let cacheService: CacheService;

  beforeAll(async () => {
    testHelper = new TestSetupHelper();
    app = await testHelper.setupApp();
    cacheService = app.get(CacheService);
  });

  beforeEach(async () => {
    await testHelper.cleanDatabase();

    // Clear all cache before each test
    await cacheService.clear();
  });

  afterAll(async () => {
    await testHelper.cleanDatabase();
    await testHelper.closeApp();
  });

  /**
   * Helper function to measure execution time
   */
  const measureTime = async (fn: () => Promise<any>): Promise<number> => {
    const start = Date.now();
    await fn();
    return Date.now() - start;
  };

  /**
   * Calculate statistics from array of times
   */
  const calculateStats = (times: number[]) => {
    const sorted = times.sort((a, b) => a - b);
    const sum = sorted.reduce((acc, val) => acc + val, 0);

    return {
      min: sorted[0],
      max: sorted[sorted.length - 1],
      avg: sum / sorted.length,
      p95: sorted[Math.floor(sorted.length * 0.95)],
      median: sorted[Math.floor(sorted.length / 2)],
    };
  };

  describe('Public Product Listings', () => {
    it('should demonstrate significant performance improvement with cache', async () => {
      // Setup: Create test data
      const org = await testHelper.createOrganization();
      const productsToCreate = 50;

      for (let i = 0; i < productsToCreate; i++) {
        await testHelper.createProduct(org.id, {
          name: `Product ${i}`,
          price: 10 + i,
          stockQty: 100,
          category: i % 2 === 0 ? 'Alimentos' : 'Roupas',
        });
      }

      // Benchmark 1: Cold start (cache miss)
      const coldTimes: number[] = [];
      const warmTimes: number[] = [];

      console.log('\n📊 Benchmark: Public Product Listings');
      console.log('━'.repeat(60));

      // Cold cache - 10 requests
      await cacheService.clear();
      for (let i = 0; i < 10; i++) {
        const time = await measureTime(() =>
          request(app.getHttpServer()).get('/api/products/public').expect(200),
        );
        coldTimes.push(time);
      }

      // Warm cache - 10 requests
      for (let i = 0; i < 10; i++) {
        const time = await measureTime(() =>
          request(app.getHttpServer()).get('/api/products/public').expect(200),
        );
        warmTimes.push(time);
      }

      const coldStats = calculateStats(coldTimes);
      const warmStats = calculateStats(warmTimes);

      const improvementAvg =
        ((coldStats.avg - warmStats.avg) / coldStats.avg) * 100;
      const improvementP95 =
        ((coldStats.p95 - warmStats.p95) / coldStats.p95) * 100;

      console.log('\n🥶 Cold Cache (Cache Miss):');
      console.log(`   Min:    ${coldStats.min}ms`);
      console.log(`   Max:    ${coldStats.max}ms`);
      console.log(`   Avg:    ${coldStats.avg.toFixed(2)}ms`);
      console.log(`   Median: ${coldStats.median}ms`);
      console.log(`   P95:    ${coldStats.p95}ms`);

      console.log('\n🔥 Warm Cache (Cache Hit):');
      console.log(`   Min:    ${warmStats.min}ms`);
      console.log(`   Max:    ${warmStats.max}ms`);
      console.log(`   Avg:    ${warmStats.avg.toFixed(2)}ms`);
      console.log(`   Median: ${warmStats.median}ms`);
      console.log(`   P95:    ${warmStats.p95}ms`);

      console.log('\n📈 Performance Improvement:');
      console.log(`   Average: ${improvementAvg.toFixed(2)}%`);
      console.log(`   P95:     ${improvementP95.toFixed(2)}%`);
      console.log('━'.repeat(60));

      // Assertions
      expect(warmStats.avg).toBeLessThan(coldStats.avg);
      expect(improvementAvg).toBeGreaterThan(0);

      // Cache should provide at least 20% improvement
      expect(improvementAvg).toBeGreaterThan(20);
    }, 30000); // Increase timeout for benchmark

    it('should show cache metrics after multiple requests', async () => {
      const org = await testHelper.createOrganization();

      // Create some products
      for (let i = 0; i < 10; i++) {
        await testHelper.createProduct(org.id, {
          name: `Product ${i}`,
          price: 10 + i,
        });
      }

      // Clear cache and metrics
      await cacheService.clear();
      cacheService.resetMetrics();

      // Make requests
      for (let i = 0; i < 20; i++) {
        await request(app.getHttpServer())
          .get('/api/products/public')
          .expect(200);
      }

      const metrics = cacheService.getMetrics();

      console.log('\n📊 Cache Metrics After 20 Requests:');
      console.log(`   Hits:          ${metrics.hits}`);
      console.log(`   Misses:        ${metrics.misses}`);
      console.log(`   Hit Rate:      ${metrics.hitRate}`);
      console.log(`   Total Requests: ${metrics.totalRequests}`);

      // First request is a miss, subsequent 19 should be hits
      expect(metrics.misses).toBe(1);
      expect(metrics.hits).toBe(19);
      expect(metrics.hitRate).toBe('95.00%');
    });
  });

  describe('Filtered Listings', () => {
    it('should cache different filter combinations separately', async () => {
      const org = await testHelper.createOrganization();

      // Create diverse products
      const categories = ['Alimentos', 'Roupas', 'Artesanato'];
      for (let i = 0; i < 30; i++) {
        await testHelper.createProduct(org.id, {
          name: `Product ${i}`,
          price: 10 + i * 5,
          category: categories[i % 3],
        });
      }

      await cacheService.clear();

      const filters = [
        { category: 'Alimentos' },
        { category: 'Roupas' },
        { maxPrice: 50 },
        { minPrice: 50, maxPrice: 100 },
      ];

      const coldTimes: number[] = [];
      const warmTimes: number[] = [];

      // Cold requests - first time each filter
      for (const filter of filters) {
        const time = await measureTime(() =>
          request(app.getHttpServer())
            .get('/api/products/public')
            .query(filter)
            .expect(200),
        );
        coldTimes.push(time);
      }

      // Warm requests - cache hits
      for (const filter of filters) {
        const time = await measureTime(() =>
          request(app.getHttpServer())
            .get('/api/products/public')
            .query(filter)
            .expect(200),
        );
        warmTimes.push(time);
      }

      const coldAvg = coldTimes.reduce((a, b) => a + b, 0) / coldTimes.length;
      const warmAvg = warmTimes.reduce((a, b) => a + b, 0) / warmTimes.length;
      const improvement = ((coldAvg - warmAvg) / coldAvg) * 100;

      console.log('\n📊 Filtered Listings Performance:');
      console.log(`   Cold Avg: ${coldAvg.toFixed(2)}ms`);
      console.log(`   Warm Avg: ${warmAvg.toFixed(2)}ms`);
      console.log(`   Improvement: ${improvement.toFixed(2)}%`);

      expect(warmAvg).toBeLessThan(coldAvg);
    });
  });

  describe('Cache Invalidation Impact', () => {
    it('should measure performance impact of cache invalidation on update', async () => {
      const org = await testHelper.createOrganization();
      const user = await testHelper.createUser(org.id);
      const token = await testHelper.getAccessToken(user);

      const product = await testHelper.createProduct(org.id, {
        name: 'Test Product',
        price: 100,
      });

      // Warm up cache
      await request(app.getHttpServer())
        .get('/api/products/public')
        .expect(200);

      // Verify cache hit
      const metrics1 = cacheService.getMetrics();
      const hitsBefore = metrics1.hits;

      // Update product (triggers cache invalidation)
      await request(app.getHttpServer())
        .put(`/api/products/${product.id}`)
        .set('Authorization', `Bearer ${token}`)
        .send({ price: 150 })
        .expect(200);

      // Next request should be cache miss (invalidated)
      await request(app.getHttpServer())
        .get('/api/products/public')
        .expect(200);

      const metrics2 = cacheService.getMetrics();
      const missesAfter = metrics2.misses;

      console.log('\n📊 Cache Invalidation:');
      console.log(`   Misses increased: ${missesAfter > metrics1.misses}`);
      console.log(`   Cache properly invalidated: ✅`);

      expect(missesAfter).toBeGreaterThan(metrics1.misses);
    });
  });

  describe('Individual Product Cache', () => {
    it('should cache individual product lookups', async () => {
      const org = await testHelper.createOrganization();
      const product = await testHelper.createProduct(org.id, {
        name: 'Single Product',
        price: 100,
      });

      await cacheService.clear();
      cacheService.resetMetrics();

      const coldTimes: number[] = [];
      const warmTimes: number[] = [];

      // Cold request
      const coldTime = await measureTime(() =>
        request(app.getHttpServer())
          .get(`/api/products/public/${product.id}`)
          .expect(200),
      );
      coldTimes.push(coldTime);

      // Warm requests
      for (let i = 0; i < 10; i++) {
        const warmTime = await measureTime(() =>
          request(app.getHttpServer())
            .get(`/api/products/public/${product.id}`)
            .expect(200),
        );
        warmTimes.push(warmTime);
      }

      const coldAvg = coldTimes[0];
      const warmAvg =
        warmTimes.reduce((a, b) => a + b, 0) / warmTimes.length;
      const improvement = ((coldAvg - warmAvg) / coldAvg) * 100;

      console.log('\n📊 Individual Product Lookup:');
      console.log(`   Cold: ${coldAvg}ms`);
      console.log(`   Warm Avg: ${warmAvg.toFixed(2)}ms`);
      console.log(`   Improvement: ${improvement.toFixed(2)}%`);

      const metrics = cacheService.getMetrics();
      expect(metrics.hits).toBe(10);
      expect(metrics.misses).toBe(1);
    });
  });

  describe('Cache Management Endpoints', () => {
    it('should return cache metrics', async () => {
      const response = await request(app.getHttpServer())
        .get('/api/cache/metrics')
        .expect(200);

      expect(response.body.data).toHaveProperty('hits');
      expect(response.body.data).toHaveProperty('misses');
      expect(response.body.data).toHaveProperty('hitRate');
      expect(response.body.data).toHaveProperty('totalRequests');
    });

    it('should return Redis info', async () => {
      const org = await testHelper.createOrganization();
      const user = await testHelper.createUser(org.id);
      const token = await testHelper.getAccessToken(user);

      const response = await request(app.getHttpServer())
        .get('/api/cache/info')
        .set('Authorization', `Bearer ${token}`)
        .expect(200);

      expect(response.body.data).toHaveProperty('redis_version');
      expect(response.body.data).toHaveProperty('used_memory_human');
    });

    it('should return cache health status', async () => {
      const response = await request(app.getHttpServer())
        .get('/api/cache/health')
        .expect(200);

      expect(response.body.data).toHaveProperty('status');
      expect(response.body.data.status).toBe('healthy');
      expect(response.body.data).toHaveProperty('latency');
    });
  });
});
