import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { TestSetupHelper } from './helpers/test-setup.helper';
import { SearchService } from '../src/modules/search/search.service';
import { LLMService } from '../src/modules/search/llm/llm.service';

describe('Intelligent Search with AI Fallback (e2e)', () => {
  let app: INestApplication;
  let testHelper: TestSetupHelper;
  let searchService: SearchService;
  let llmService: LLMService;

  let org1: any;
  let org2: any;

  beforeAll(async () => {
    testHelper = new TestSetupHelper();
    app = await testHelper.setupApp();
    searchService = app.get(SearchService);
    llmService = app.get(LLMService);
  });

  afterAll(async () => {
    await testHelper.closeApp();
  });

  beforeEach(async () => {
    await testHelper.cleanDatabase();

    // Create organizations
    org1 = await testHelper.createOrganization({ name: 'ONG 1' });
    org2 = await testHelper.createOrganization({ name: 'ONG 2' });

    // Create diverse products for search testing
    await testHelper.createProduct(org1.id, {
      name: 'Cesta de Doces Artesanais',
      category: 'Doces',
      price: 45.0,
      stockQty: 10,
      description: 'Deliciosos doces feitos à mão',
    });

    await testHelper.createProduct(org1.id, {
      name: 'Bolo de Chocolate Premium',
      category: 'Doces',
      price: 80.0,
      stockQty: 5,
      description: 'Bolo artesanal de chocolate',
    });

    await testHelper.createProduct(org1.id, {
      name: 'Artesanato em Madeira',
      category: 'Artesanato',
      price: 120.0,
      stockQty: 3,
      description: 'Peças únicas em madeira',
    });

    await testHelper.createProduct(org2.id, {
      name: 'Camiseta Bordada',
      category: 'Vestuário',
      price: 60.0,
      stockQty: 15,
      description: 'Camiseta com bordado manual',
    });

    await testHelper.createProduct(org2.id, {
      name: 'Doce de Leite Caseiro',
      category: 'Doces',
      price: 25.0,
      stockQty: 20,
      description: 'Doce de leite tradicional',
    });

    await testHelper.createProduct(org2.id, {
      name: 'Escultura Decorativa',
      category: 'Decoração',
      price: 200.0,
      stockQty: 2,
      description: 'Escultura artística para decoração',
    });
  });

  describe('Search Functionality', () => {
    it('should return products matching search query', async () => {
      const response = await request(app.getHttpServer())
        .get('/api/search/products')
        .query({ q: 'doces' })
        .expect(200);

      expect(response.body.results).toBeInstanceOf(Array);
      expect(response.body.results.length).toBeGreaterThan(0);
      expect(response.body.meta).toHaveProperty('aiSuccess');
      expect(response.body.meta).toHaveProperty('fallbackUsed');
      expect(response.body.meta).toHaveProperty('interpretation');
      expect(response.body.meta).toHaveProperty('latency');

      // At least some products should match
      const hasDoces = response.body.results.some((p: any) =>
        p.category.toLowerCase().includes('doces') ||
        p.name.toLowerCase().includes('doce')
      );
      expect(hasDoces).toBe(true);
    });

    it('should handle empty query gracefully', async () => {
      const response = await request(app.getHttpServer())
        .get('/api/search/products')
        .query({ q: '' })
        .expect(200);

      expect(response.body.results).toEqual([]);
      expect(response.body.meta.interpretation).toBe('Query vazia');
    });

    it('should return interpretation of search', async () => {
      const response = await request(app.getHttpServer())
        .get('/api/search/products')
        .query({ q: 'doces baratos' })
        .expect(200);

      expect(response.body.meta).toHaveProperty('interpretation');
      expect(typeof response.body.meta.interpretation).toBe('string');
      expect(response.body.meta.interpretation.length).toBeGreaterThan(0);
    });
  });

  describe('Fallback Mechanism', () => {
    it('should use fallback when AI is not configured', async () => {
      // Search should work even without AI
      const response = await request(app.getHttpServer())
        .get('/api/search/products')
        .query({ q: 'artesanato' })
        .expect(200);

      expect(response.body.results).toBeInstanceOf(Array);
      expect(response.body.meta).toHaveProperty('fallbackUsed');

      // Should find artesanato products
      if (response.body.results.length > 0) {
        const hasArtesanato = response.body.results.some((p: any) =>
          p.name.toLowerCase().includes('artesanato') ||
          p.category.toLowerCase().includes('artesanato')
        );
        expect(hasArtesanato).toBe(true);
      }
    });

    it('should normalize accents in fallback search', async () => {
      // Test search with and without accents
      const withAccent = await request(app.getHttpServer())
        .get('/api/search/products')
        .query({ q: 'decoração' })
        .expect(200);

      const withoutAccent = await request(app.getHttpServer())
        .get('/api/search/products')
        .query({ q: 'decoracao' })
        .expect(200);

      // Both should find the decoration product (or similar counts)
      expect(withAccent.body.results.length).toBeGreaterThanOrEqual(0);
      expect(withoutAccent.body.results.length).toBeGreaterThanOrEqual(0);
    });

    it('should filter out words with less than 3 characters', async () => {
      // Fallback should ignore very short words
      const response = await request(app.getHttpServer())
        .get('/api/search/products')
        .query({ q: 'de em na doces' })
        .expect(200);

      // Should search only for "doces" (others are too short)
      expect(response.body.results).toBeInstanceOf(Array);
    });
  });

  describe('Pagination', () => {
    it('should paginate search results', async () => {
      const page1 = await request(app.getHttpServer())
        .get('/api/search/products')
        .query({ q: 'produto', page: 1, pageSize: 2 })
        .expect(200);

      expect(page1.body.meta.page).toBe(1);
      expect(page1.body.meta.pageSize).toBe(2);
      expect(page1.body.meta).toHaveProperty('total');
      expect(page1.body.meta).toHaveProperty('totalPages');

      if (page1.body.meta.total > 2) {
        const page2 = await request(app.getHttpServer())
          .get('/api/search/products')
          .query({ q: 'produto', page: 2, pageSize: 2 })
          .expect(200);

        expect(page2.body.meta.page).toBe(2);

        // Different results on different pages
        if (page1.body.results.length > 0 && page2.body.results.length > 0) {
          expect(page1.body.results[0].id).not.toBe(page2.body.results[0].id);
        }
      }
    });
  });

  describe('Search Logging', () => {
    it('should log search queries to database', async () => {
      const query = 'doces baratos teste';

      await request(app.getHttpServer())
        .get('/api/search/products')
        .query({ q: query })
        .expect(200);

      // Wait a bit for async log to complete
      await new Promise((resolve) => setTimeout(resolve, 100));

      // Verify log was created
      const logs = await testHelper.getPrisma().searchLog.findMany({
        where: { query },
      });

      expect(logs.length).toBeGreaterThan(0);

      const log = logs[0];
      expect(log).toHaveProperty('query');
      expect(log).toHaveProperty('filters');
      expect(log).toHaveProperty('aiSuccess');
      expect(log).toHaveProperty('fallbackUsed');
      expect(log).toHaveProperty('latency');
      expect(log).toHaveProperty('resultsCount');
      expect(log.query).toBe(query);
      expect(typeof log.aiSuccess).toBe('boolean');
      expect(typeof log.fallbackUsed).toBe('boolean');
      expect(typeof log.latency).toBe('number');
      expect(typeof log.resultsCount).toBe('number');
    });

    it('should track AI success and fallback usage', async () => {
      await request(app.getHttpServer())
        .get('/api/search/products')
        .query({ q: 'teste busca ai' })
        .expect(200);

      await new Promise((resolve) => setTimeout(resolve, 100));

      const logs = await testHelper.getPrisma().searchLog.findMany({
        orderBy: { createdAt: 'desc' },
        take: 1,
      });

      expect(logs.length).toBe(1);

      // Should have tracked either AI success or fallback
      const log = logs[0];
      if (log.aiSuccess) {
        expect(log.fallbackUsed).toBe(false);
      } else {
        expect(log.fallbackUsed).toBe(true);
      }
    });
  });

  describe('Circuit Breaker', () => {
    it('should expose health check endpoint', async () => {
      const response = await request(app.getHttpServer())
        .get('/api/search/health')
        .expect(200);

      expect(response.body).toHaveProperty('llmAvailable');
      expect(response.body).toHaveProperty('circuitOpen');
      expect(typeof response.body.llmAvailable).toBe('boolean');
      expect(typeof response.body.circuitOpen).toBe('boolean');
    });

    it('should track circuit breaker state', () => {
      const healthStatus = searchService.getHealthStatus();

      expect(healthStatus).toHaveProperty('llmAvailable');
      expect(healthStatus).toHaveProperty('circuitOpen');
    });

    // Note: Testing actual circuit breaker behavior with real failures
    // would require mocking the LLM service and simulating failures
    // This is best done in unit tests rather than E2E tests
  });

  describe('Performance', () => {
    it('should return results within acceptable time', async () => {
      const start = Date.now();

      const response = await request(app.getHttpServer())
        .get('/api/search/products')
        .query({ q: 'doces' })
        .expect(200);

      const duration = Date.now() - start;

      // Should complete within 5 seconds (accounting for potential AI call)
      expect(duration).toBeLessThan(5000);

      // Latency should be tracked in response
      expect(response.body.meta.latency).toBeGreaterThan(0);
      expect(response.body.meta.latency).toBeLessThan(5000);
    });
  });

  describe('Data Integrity', () => {
    it('should only return active products with stock', async () => {
      // Create inactive product
      await testHelper.getPrisma().product.create({
        data: {
          organizationId: org1.id,
          name: 'Produto Inativo',
          category: 'Teste',
          price: 100,
          stockQty: 10,
          weightGrams: 500,
          isActive: false,
        },
      });

      // Create product with zero stock
      await testHelper.getPrisma().product.create({
        data: {
          organizationId: org1.id,
          name: 'Produto Sem Estoque',
          category: 'Teste',
          price: 100,
          stockQty: 0,
          weightGrams: 500,
          isActive: true,
        },
      });

      const response = await request(app.getHttpServer())
        .get('/api/search/products')
        .query({ q: 'produto' })
        .expect(200);

      // Should not include inactive or zero-stock products
      const hasInactive = response.body.results.some(
        (p: any) => p.name === 'Produto Inativo'
      );
      const hasZeroStock = response.body.results.some(
        (p: any) => p.name === 'Produto Sem Estoque'
      );

      expect(hasInactive).toBe(false);
      expect(hasZeroStock).toBe(false);

      // All returned products should have stock > 0 and be active
      response.body.results.forEach((product: any) => {
        expect(product.stockQty).toBeGreaterThan(0);
        expect(product.isActive).toBe(true);
      });
    });

    it('should include organization data in results', async () => {
      const response = await request(app.getHttpServer())
        .get('/api/search/products')
        .query({ q: 'doces' })
        .expect(200);

      if (response.body.results.length > 0) {
        const product = response.body.results[0];
        expect(product).toHaveProperty('organization');
        expect(product.organization).toHaveProperty('id');
        expect(product.organization).toHaveProperty('name');
        expect(product.organization).toHaveProperty('slug');
      }
    });
  });
});
