import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { TestSetupHelper } from './helpers/test-setup.helper';

describe('Stock Concurrency Control (e2e)', () => {
  let app: INestApplication;
  let testHelper: TestSetupHelper;

  let org: any;
  let customer1: any;
  let customer2: any;
  let customer3: any;
  let token1: string;
  let token2: string;
  let token3: string;

  beforeAll(async () => {
    testHelper = new TestSetupHelper();
    app = await testHelper.setupApp();
  });

  afterAll(async () => {
    await testHelper.closeApp();
  });

  beforeEach(async () => {
    await testHelper.cleanDatabase();

    // Create organization
    org = await testHelper.createOrganization({ name: 'Test ONG' });

    // Create multiple customers
    customer1 = await testHelper.createUser(null, 'customer', { email: 'customer1@test.com' });
    customer2 = await testHelper.createUser(null, 'customer', { email: 'customer2@test.com' });
    customer3 = await testHelper.createUser(null, 'customer', { email: 'customer3@test.com' });

    token1 = await testHelper.getAccessToken(customer1.email, customer1.password);
    token2 = await testHelper.getAccessToken(customer2.email, customer2.password);
    token3 = await testHelper.getAccessToken(customer3.email, customer3.password);
  });

  describe('Preventing Overselling', () => {
    it('should prevent overselling when 2 customers try to buy last items simultaneously', async () => {
      // Create product with limited stock
      const product = await testHelper.createProduct(org.id, {
        name: 'Limited Product',
        stockQty: 10,
        price: 100,
      });

      const orderData1 = {
        items: [{ productId: product.id, quantity: 10 }],
        paymentMethod: 'credit_card',
        shippingDetails: {
          address: 'Test St 1',
          city: 'City',
          state: 'ST',
          zipCode: '12345',
          recipientName: 'Customer 1',
          recipientPhone: '123456789',
        },
      };

      const orderData2 = {
        items: [{ productId: product.id, quantity: 10 }],
        paymentMethod: 'credit_card',
        shippingDetails: {
          address: 'Test St 2',
          city: 'City',
          state: 'ST',
          zipCode: '12345',
          recipientName: 'Customer 2',
          recipientPhone: '987654321',
        },
      };

      // Execute both requests simultaneously
      const [response1, response2] = await Promise.allSettled([
        request(app.getHttpServer())
          .post('/api/orders')
          .set('Authorization', `Bearer ${token1}`)
          .send(orderData1),
        request(app.getHttpServer())
          .post('/api/orders')
          .set('Authorization', `Bearer ${token2}`)
          .send(orderData2),
      ]);

      // One should succeed, one should fail
      const fulfilled = [response1, response2].filter((r) => r.status === 'fulfilled');
      const rejected = [response1, response2].filter((r) => r.status === 'rejected');

      // At least one should succeed
      expect(fulfilled.length).toBeGreaterThanOrEqual(1);

      // Check responses
      let successCount = 0;
      let failCount = 0;

      if (response1.status === 'fulfilled') {
        const res = response1.value as any;
        if (res.status === 201) successCount++;
        else if (res.status === 409) failCount++;
      }

      if (response2.status === 'fulfilled') {
        const res = response2.value as any;
        if (res.status === 201) successCount++;
        else if (res.status === 409) failCount++;
      }

      // Exactly one should succeed, one should fail
      expect(successCount).toBe(1);
      expect(failCount).toBe(1);

      // Verify final stock is correct (should be 0 if one order succeeded)
      const finalProduct = await testHelper.getPrisma().product.findUnique({
        where: { id: product.id },
      });

      expect(finalProduct.stockQty).toBe(0); // All stock consumed by successful order

      // Verify only one order was created
      const orders = await testHelper.getPrisma().order.findMany({
        where: {
          items: {
            some: {
              productId: product.id,
            },
          },
        },
      });

      expect(orders.length).toBe(1);
    });

    it('should handle 3 simultaneous requests for limited stock correctly', async () => {
      // Create product with stock for 2 orders
      const product = await testHelper.createProduct(org.id, {
        name: 'Limited Product',
        stockQty: 15,
        price: 100,
      });

      const createOrderData = (customer: string, quantity: number) => ({
        items: [{ productId: product.id, quantity }],
        paymentMethod: 'credit_card',
        shippingDetails: {
          address: `Test St ${customer}`,
          city: 'City',
          state: 'ST',
          zipCode: '12345',
          recipientName: customer,
          recipientPhone: '123456789',
        },
      });

      // 3 customers try to buy: 8, 8, and 8 items (total 24, but only 15 available)
      const [response1, response2, response3] = await Promise.all([
        request(app.getHttpServer())
          .post('/api/orders')
          .set('Authorization', `Bearer ${token1}`)
          .send(createOrderData('Customer 1', 8)),
        request(app.getHttpServer())
          .post('/api/orders')
          .set('Authorization', `Bearer ${token2}`)
          .send(createOrderData('Customer 2', 8)),
        request(app.getHttpServer())
          .post('/api/orders')
          .set('Authorization', `Bearer ${token3}`)
          .send(createOrderData('Customer 3', 8)),
      ]);

      const responses = [response1, response2, response3];
      const successfulOrders = responses.filter((r) => r.status === 201);
      const failedOrders = responses.filter((r) => r.status === 409);

      // At most 1 order should succeed (8 items), 2 should fail
      expect(successfulOrders.length).toBeLessThanOrEqual(1);
      expect(failedOrders.length).toBeGreaterThanOrEqual(2);

      // Verify stock integrity
      const finalProduct = await testHelper.getPrisma().product.findUnique({
        where: { id: product.id },
      });

      if (successfulOrders.length === 1) {
        expect(finalProduct.stockQty).toBe(7); // 15 - 8 = 7
      } else {
        expect(finalProduct.stockQty).toBe(15); // No order succeeded
      }

      // Verify stock never went negative
      expect(finalProduct.stockQty).toBeGreaterThanOrEqual(0);
    });

    it('should atomically update stock even with high concurrency', async () => {
      // Create product with enough stock
      const product = await testHelper.createProduct(org.id, {
        name: 'Popular Product',
        stockQty: 100,
        price: 50,
      });

      const createOrderData = (quantity: number) => ({
        items: [{ productId: product.id, quantity }],
        paymentMethod: 'credit_card',
        shippingDetails: {
          address: 'Test St',
          city: 'City',
          state: 'ST',
          zipCode: '12345',
          recipientName: 'Customer',
          recipientPhone: '123456789',
        },
      });

      // Create 10 simultaneous orders of 5 items each (total 50 items)
      const requests = Array(10)
        .fill(null)
        .map(() =>
          request(app.getHttpServer())
            .post('/api/orders')
            .set('Authorization', `Bearer ${token1}`)
            .send(createOrderData(5)),
        );

      const responses = await Promise.all(requests);

      // Count successful orders
      const successfulOrders = responses.filter((r) => r.status === 201);

      // Verify final stock
      const finalProduct = await testHelper.getPrisma().product.findUnique({
        where: { id: product.id },
      });

      // Stock should be exactly: 100 - (successfulOrders * 5)
      const expectedStock = 100 - successfulOrders.length * 5;
      expect(finalProduct.stockQty).toBe(expectedStock);

      // Stock should never be negative
      expect(finalProduct.stockQty).toBeGreaterThanOrEqual(0);

      // All successful orders should be persisted
      const persistedOrders = await testHelper.getPrisma().order.findMany({
        where: {
          items: {
            some: {
              productId: product.id,
            },
          },
        },
      });

      expect(persistedOrders.length).toBe(successfulOrders.length);
    });
  });

  describe('Stock Validation', () => {
    it('should return detailed error when stock is insufficient', async () => {
      const product = await testHelper.createProduct(org.id, {
        name: 'Low Stock Product',
        stockQty: 3,
        price: 100,
      });

      const orderData = {
        items: [{ productId: product.id, quantity: 10 }],
        paymentMethod: 'credit_card',
        shippingDetails: {
          address: 'Test St',
          city: 'City',
          state: 'ST',
          zipCode: '12345',
          recipientName: 'Customer',
          recipientPhone: '123456789',
        },
      };

      const response = await request(app.getHttpServer())
        .post('/api/orders')
        .set('Authorization', `Bearer ${token1}`)
        .send(orderData)
        .expect(409);

      // Verify error structure
      expect(response.body.error).toBe('INSUFFICIENT_STOCK');
      expect(response.body.details).toBeInstanceOf(Array);
      expect(response.body.details[0]).toHaveProperty('productId');
      expect(response.body.details[0]).toHaveProperty('productName');
      expect(response.body.details[0]).toHaveProperty('requested');
      expect(response.body.details[0]).toHaveProperty('available');

      expect(response.body.details[0].requested).toBe(10);
      expect(response.body.details[0].available).toBe(3);
    });

    it('should handle multiple products with mixed stock availability', async () => {
      const product1 = await testHelper.createProduct(org.id, {
        name: 'Available Product',
        stockQty: 10,
        price: 50,
      });

      const product2 = await testHelper.createProduct(org.id, {
        name: 'Out of Stock Product',
        stockQty: 2,
        price: 100,
      });

      const orderData = {
        items: [
          { productId: product1.id, quantity: 5 }, // OK
          { productId: product2.id, quantity: 10 }, // Insufficient
        ],
        paymentMethod: 'credit_card',
        shippingDetails: {
          address: 'Test St',
          city: 'City',
          state: 'ST',
          zipCode: '12345',
          recipientName: 'Customer',
          recipientPhone: '123456789',
        },
      };

      const response = await request(app.getHttpServer())
        .post('/api/orders')
        .set('Authorization', `Bearer ${token1}`)
        .send(orderData)
        .expect(409);

      // Should report error for product2
      expect(response.body.details.length).toBe(1);
      expect(response.body.details[0].productId).toBe(product2.id);

      // Verify NO stock was consumed (transaction rollback)
      const finalProduct1 = await testHelper.getPrisma().product.findUnique({
        where: { id: product1.id },
      });
      const finalProduct2 = await testHelper.getPrisma().product.findUnique({
        where: { id: product2.id },
      });

      expect(finalProduct1.stockQty).toBe(10); // Unchanged
      expect(finalProduct2.stockQty).toBe(2); // Unchanged
    });
  });

  describe('Idempotency', () => {
    it('should not create duplicate orders with same idempotencyKey', async () => {
      const product = await testHelper.createProduct(org.id, {
        name: 'Test Product',
        stockQty: 100,
        price: 100,
      });

      const idempotencyKey = `order-${Date.now()}-${Math.random()}`;

      const orderData = {
        items: [{ productId: product.id, quantity: 5 }],
        paymentMethod: 'credit_card',
        idempotencyKey,
        shippingDetails: {
          address: 'Test St',
          city: 'City',
          state: 'ST',
          zipCode: '12345',
          recipientName: 'Customer',
          recipientPhone: '123456789',
        },
      };

      // Send same request twice
      const response1 = await request(app.getHttpServer())
        .post('/api/orders')
        .set('Authorization', `Bearer ${token1}`)
        .send(orderData)
        .expect(201);

      const response2 = await request(app.getHttpServer())
        .post('/api/orders')
        .set('Authorization', `Bearer ${token1}`)
        .send(orderData)
        .expect(201);

      // Should return same order
      expect(response1.body.id).toBe(response2.body.id);

      // Verify only one order was created
      const orders = await testHelper.getPrisma().order.findMany({
        where: { idempotencyKey },
      });

      expect(orders.length).toBe(1);

      // Verify stock was deducted only once
      const finalProduct = await testHelper.getPrisma().product.findUnique({
        where: { id: product.id },
      });

      expect(finalProduct.stockQty).toBe(95); // 100 - 5 = 95 (not 90)
    });

    it('should handle concurrent requests with same idempotencyKey', async () => {
      const product = await testHelper.createProduct(org.id, {
        name: 'Test Product',
        stockQty: 100,
        price: 100,
      });

      const idempotencyKey = `order-${Date.now()}-${Math.random()}`;

      const orderData = {
        items: [{ productId: product.id, quantity: 5 }],
        paymentMethod: 'credit_card',
        idempotencyKey,
        shippingDetails: {
          address: 'Test St',
          city: 'City',
          state: 'ST',
          zipCode: '12345',
          recipientName: 'Customer',
          recipientPhone: '123456789',
        },
      };

      // Send 3 identical requests simultaneously
      const [response1, response2, response3] = await Promise.all([
        request(app.getHttpServer())
          .post('/api/orders')
          .set('Authorization', `Bearer ${token1}`)
          .send(orderData),
        request(app.getHttpServer())
          .post('/api/orders')
          .set('Authorization', `Bearer ${token1}`)
          .send(orderData),
        request(app.getHttpServer())
          .post('/api/orders')
          .set('Authorization', `Bearer ${token1}`)
          .send(orderData),
      ]);

      // All should succeed and return same order ID
      expect(response1.status).toBe(201);
      expect(response2.status).toBe(201);
      expect(response3.status).toBe(201);
      expect(response1.body.id).toBe(response2.body.id);
      expect(response2.body.id).toBe(response3.body.id);

      // Verify only one order exists
      const orders = await testHelper.getPrisma().order.findMany({
        where: { idempotencyKey },
      });

      expect(orders.length).toBe(1);

      // Verify stock deducted only once
      const finalProduct = await testHelper.getPrisma().product.findUnique({
        where: { id: product.id },
      });

      expect(finalProduct.stockQty).toBe(95);
    });
  });

  describe('Transaction Rollback', () => {
    it('should rollback entire transaction if any item has insufficient stock', async () => {
      const product1 = await testHelper.createProduct(org.id, {
        name: 'Product 1',
        stockQty: 10,
        price: 50,
      });

      const product2 = await testHelper.createProduct(org.id, {
        name: 'Product 2',
        stockQty: 5,
        price: 100,
      });

      const orderData = {
        items: [
          { productId: product1.id, quantity: 5 }, // OK
          { productId: product2.id, quantity: 10 }, // Will fail
        ],
        paymentMethod: 'credit_card',
        shippingDetails: {
          address: 'Test St',
          city: 'City',
          state: 'ST',
          zipCode: '12345',
          recipientName: 'Customer',
          recipientPhone: '123456789',
        },
      };

      await request(app.getHttpServer())
        .post('/api/orders')
        .set('Authorization', `Bearer ${token1}`)
        .send(orderData)
        .expect(409);

      // Verify NO order was created
      const orders = await testHelper.getPrisma().order.findMany();
      expect(orders.length).toBe(0);

      // Verify NO order items were created
      const orderItems = await testHelper.getPrisma().orderItem.findMany();
      expect(orderItems.length).toBe(0);

      // Verify stock unchanged for both products
      const finalProduct1 = await testHelper.getPrisma().product.findUnique({
        where: { id: product1.id },
      });
      const finalProduct2 = await testHelper.getPrisma().product.findUnique({
        where: { id: product2.id },
      });

      expect(finalProduct1.stockQty).toBe(10); // Unchanged
      expect(finalProduct2.stockQty).toBe(5); // Unchanged
    });
  });
});
