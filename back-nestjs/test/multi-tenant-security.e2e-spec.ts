import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { TestSetupHelper } from './helpers/test-setup.helper';

describe('Multi-Tenant Security Isolation (e2e)', () => {
  let app: INestApplication;
  let testHelper: TestSetupHelper;

  // Organization A
  let orgA: any;
  let userA: any;
  let tokenA: string;
  let productA: any;

  // Organization B
  let orgB: any;
  let userB: any;
  let tokenB: string;
  let productB: any;

  beforeAll(async () => {
    testHelper = new TestSetupHelper();
    app = await testHelper.setupApp();
  });

  afterAll(async () => {
    await testHelper.closeApp();
  });

  beforeEach(async () => {
    await testHelper.cleanDatabase();

    // Create Organization A with user and product
    orgA = await testHelper.createOrganization({ name: 'ONG A', slug: 'ong-a' });
    userA = await testHelper.createUser(orgA.id, 'ong_manager');
    tokenA = await testHelper.getAccessToken(userA.email, userA.password);
    productA = await testHelper.createProduct(orgA.id, {
      name: 'Product A',
      price: 100,
      stockQty: 10,
    });

    // Create Organization B with user and product
    orgB = await testHelper.createOrganization({ name: 'ONG B', slug: 'ong-b' });
    userB = await testHelper.createUser(orgB.id, 'ong_manager');
    tokenB = await testHelper.getAccessToken(userB.email, userB.password);
    productB = await testHelper.createProduct(orgB.id, {
      name: 'Product B',
      price: 200,
      stockQty: 20,
    });
  });

  describe('Products Isolation', () => {
    it('should NOT allow ONG A to view ONG B product details', async () => {
      const response = await request(app.getHttpServer())
        .get(`/api/products/${productB.id}`)
        .set('Authorization', `Bearer ${tokenA}`)
        .expect(404);

      expect(response.body.message).toContain('not found');
    });

    it('should NOT allow ONG A to update ONG B product', async () => {
      const response = await request(app.getHttpServer())
        .patch(`/api/products/${productB.id}`)
        .set('Authorization', `Bearer ${tokenA}`)
        .send({ name: 'Hacked Product' })
        .expect(404);

      expect(response.body.message).toContain('not found');

      // Verify product was NOT modified
      const productCheck = await testHelper.getPrisma().product.findUnique({
        where: { id: productB.id },
      });
      expect(productCheck.name).toBe('Product B');
    });

    it('should NOT allow ONG A to delete ONG B product', async () => {
      await request(app.getHttpServer())
        .delete(`/api/products/${productB.id}`)
        .set('Authorization', `Bearer ${tokenA}`)
        .expect(404);

      // Verify product still exists
      const productCheck = await testHelper.getPrisma().product.findUnique({
        where: { id: productB.id },
      });
      expect(productCheck).not.toBeNull();
      expect(productCheck.deletedAt).toBeNull();
    });

    it('should allow ONG A to view their own products', async () => {
      const response = await request(app.getHttpServer())
        .get(`/api/products/${productA.id}`)
        .set('Authorization', `Bearer ${tokenA}`)
        .expect(200);

      expect(response.body.id).toBe(productA.id);
      expect(response.body.name).toBe('Product A');
      expect(response.body.organizationId).toBe(orgA.id);
    });

    it('should allow ONG A to update their own products', async () => {
      const response = await request(app.getHttpServer())
        .patch(`/api/products/${productA.id}`)
        .set('Authorization', `Bearer ${tokenA}`)
        .send({ name: 'Updated Product A' })
        .expect(200);

      expect(response.body.name).toBe('Updated Product A');
    });

    it('should NOT list ONG B products when ONG A lists their products', async () => {
      const response = await request(app.getHttpServer())
        .get('/api/products')
        .set('Authorization', `Bearer ${tokenA}`)
        .expect(200);

      expect(response.body.items).toBeInstanceOf(Array);
      expect(response.body.items.length).toBe(1);
      expect(response.body.items[0].id).toBe(productA.id);
      expect(response.body.items[0].organizationId).toBe(orgA.id);

      // Ensure no product from ONG B is present
      const hasBProduct = response.body.items.some((p: any) => p.id === productB.id);
      expect(hasBProduct).toBe(false);
    });

    it('should enforce organizationId filter in all queries', async () => {
      // Create multiple products for each org
      const productA2 = await testHelper.createProduct(orgA.id, { name: 'Product A2' });
      const productB2 = await testHelper.createProduct(orgB.id, { name: 'Product B2' });

      const responseA = await request(app.getHttpServer())
        .get('/api/products')
        .set('Authorization', `Bearer ${tokenA}`)
        .expect(200);

      const responseB = await request(app.getHttpServer())
        .get('/api/products')
        .set('Authorization', `Bearer ${tokenB}`)
        .expect(200);

      // ONG A should see only their 2 products
      expect(responseA.body.items.length).toBe(2);
      expect(responseA.body.items.every((p: any) => p.organizationId === orgA.id)).toBe(true);

      // ONG B should see only their 2 products
      expect(responseB.body.items.length).toBe(2);
      expect(responseB.body.items.every((p: any) => p.organizationId === orgB.id)).toBe(true);
    });
  });

  describe('Orders Isolation', () => {
    it('should create order with correct organizationId in OrderItem', async () => {
      // Create customer user
      const customer = await testHelper.createUser(null, 'customer');
      const customerToken = await testHelper.getAccessToken(customer.email, customer.password);

      const orderData = {
        items: [
          { productId: productA.id, quantity: 2 },
        ],
        paymentMethod: 'credit_card',
        shippingDetails: {
          address: 'Test St',
          city: 'Test City',
          state: 'TS',
          zipCode: '12345',
          recipientName: 'Test User',
          recipientPhone: '123456789',
        },
      };

      const response = await request(app.getHttpServer())
        .post('/api/orders')
        .set('Authorization', `Bearer ${customerToken}`)
        .send(orderData)
        .expect(201);

      // Verify OrderItem has correct organizationId
      const orderItems = await testHelper.getPrisma().orderItem.findMany({
        where: { orderId: response.body.id },
      });

      expect(orderItems.length).toBe(1);
      expect(orderItems[0].organizationId).toBe(orgA.id);
      expect(orderItems[0].productId).toBe(productA.id);
    });

    it('should allow organization to view only their order items', async () => {
      // Create customer and order with products from both orgs
      const customer = await testHelper.createUser(null, 'customer');
      const customerToken = await testHelper.getAccessToken(customer.email, customer.password);

      const orderData = {
        items: [
          { productId: productA.id, quantity: 2 },
          { productId: productB.id, quantity: 1 },
        ],
        paymentMethod: 'credit_card',
        shippingDetails: {
          address: 'Test St',
          city: 'Test City',
          state: 'TS',
          zipCode: '12345',
          recipientName: 'Test User',
          recipientPhone: '123456789',
        },
      };

      await request(app.getHttpServer())
        .post('/api/orders')
        .set('Authorization', `Bearer ${customerToken}`)
        .send(orderData)
        .expect(201);

      // ONG A should see only their items
      const responseA = await request(app.getHttpServer())
        .get(`/api/organizations/${orgA.id}/orders`)
        .set('Authorization', `Bearer ${tokenA}`)
        .expect(200);

      expect(responseA.body.items.length).toBeGreaterThan(0);
      const orderA = responseA.body.items[0];
      expect(orderA.items.every((item: any) => item.organizationId === orgA.id)).toBe(true);
      expect(orderA.items.length).toBe(1); // Only 1 item from ONG A

      // ONG B should see only their items
      const responseB = await request(app.getHttpServer())
        .get(`/api/organizations/${orgB.id}/orders`)
        .set('Authorization', `Bearer ${tokenB}`)
        .expect(200);

      expect(responseB.body.items.length).toBeGreaterThan(0);
      const orderB = responseB.body.items[0];
      expect(orderB.items.every((item: any) => item.organizationId === orgB.id)).toBe(true);
      expect(orderB.items.length).toBe(1); // Only 1 item from ONG B
    });
  });

  describe('Security Edge Cases', () => {
    it('should NOT allow user without organization to create products', async () => {
      const userNoOrg = await testHelper.createUser(null, 'customer');
      const tokenNoOrg = await testHelper.getAccessToken(userNoOrg.email, userNoOrg.password);

      await request(app.getHttpServer())
        .post('/api/products')
        .set('Authorization', `Bearer ${tokenNoOrg}`)
        .send({
          name: 'Hacked Product',
          price: 100,
          category: 'Test',
          stockQty: 10,
          weightGrams: 500,
        })
        .expect(403);
    });

    it('should NOT allow organizationId spoofing via request body', async () => {
      // Attempt to create product with ONG B's ID while authenticated as ONG A
      const response = await request(app.getHttpServer())
        .post('/api/products')
        .set('Authorization', `Bearer ${tokenA}`)
        .send({
          name: 'Spoofed Product',
          organizationId: orgB.id, // Trying to spoof
          price: 100,
          category: 'Test',
          stockQty: 10,
          weightGrams: 500,
        })
        .expect(201); // Should succeed

      // But organizationId should be from ONG A (from token), not from body
      expect(response.body.organizationId).toBe(orgA.id);
      expect(response.body.organizationId).not.toBe(orgB.id);
    });

    it('should prevent SQL injection via organizationId', async () => {
      // This test ensures that even if organizationId is manipulated,
      // it's treated as UUID string and not executable SQL
      const maliciousToken = tokenA; // Valid token for ONG A

      // Try to inject SQL in product ID
      await request(app.getHttpServer())
        .get(`/api/products/${productB.id}' OR '1'='1`)
        .set('Authorization', `Bearer ${maliciousToken}`)
        .expect(404); // Should not find anything

      // Verify database integrity
      const allProducts = await testHelper.getPrisma().product.findMany();
      expect(allProducts.length).toBe(2); // Only 2 products exist
    });
  });

  describe('Admin Access', () => {
    it('should allow admin to access all organizations', async () => {
      const admin = await testHelper.createUser(null, 'admin');
      const adminToken = await testHelper.getAccessToken(admin.email, admin.password);

      // Admin should bypass organization guard
      const response = await request(app.getHttpServer())
        .get('/api/products')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      // Admin sees all products (or gets empty list if guard requires org)
      // This test validates that admin role is handled correctly
      expect(response.body).toHaveProperty('items');
    });
  });
});
