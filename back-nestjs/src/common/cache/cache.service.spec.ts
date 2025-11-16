import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { CacheService } from './cache.service';

// Mock Redis
const mockRedis = {
  get: jest.fn(),
  set: jest.fn(),
  setex: jest.fn(),
  del: jest.fn(),
  keys: jest.fn(),
  exists: jest.fn(),
  ttl: jest.fn(),
  incr: jest.fn(),
  flushdb: jest.fn(),
  info: jest.fn(),
  dbsize: jest.fn(),
  on: jest.fn(),
};

// Mock the ioredis module
jest.mock('ioredis', () => {
  return jest.fn().mockImplementation(() => mockRedis);
});

describe('CacheService', () => {
  let service: CacheService;

  const mockConfigService = {
    get: jest.fn((key: string) => {
      const config = {
        REDIS_HOST: 'localhost',
        REDIS_PORT: 6379,
      };
      return config[key];
    }),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CacheService,
        {
          provide: ConfigService,
          useValue: mockConfigService,
        },
      ],
    }).compile();

    service = module.get<CacheService>(CacheService);

    // Initialize Redis connection
    await service.onModuleInit();

    // Clear all mocks
    jest.clearAllMocks();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('get', () => {
    it('should get a value from cache', async () => {
      const testData = { data: 'value', nested: { key: 'test' } };
      mockRedis.get.mockResolvedValue(JSON.stringify(testData));

      const result = await service.get<typeof testData>('test:key');

      expect(result).toEqual(testData);
      expect(mockRedis.get).toHaveBeenCalledWith('test:key');
    });

    it('should return null for non-existent key', async () => {
      mockRedis.get.mockResolvedValue(null);

      const result = await service.get('non:existent');

      expect(result).toBeNull();
    });

    it('should handle cache miss and record metrics', async () => {
      mockRedis.get.mockResolvedValue(null);

      const result = await service.get('missing:key');

      expect(result).toBeNull();
      const metrics = service.getMetrics();
      expect(metrics.misses).toBeGreaterThan(0);
    });

    it('should handle cache hit and record metrics', async () => {
      mockRedis.get.mockResolvedValue(JSON.stringify({ data: 'test' }));

      await service.get('existing:key');

      const metrics = service.getMetrics();
      expect(metrics.hits).toBeGreaterThan(0);
    });

    it('should apply prefix to key when provided', async () => {
      mockRedis.get.mockResolvedValue(null);

      await service.get('key', { prefix: 'products' });

      expect(mockRedis.get).toHaveBeenCalledWith('products:key');
    });

    it('should handle JSON parse errors gracefully', async () => {
      mockRedis.get.mockResolvedValue('invalid json');

      const result = await service.get('invalid:json');

      expect(result).toBeNull();
      const metrics = service.getMetrics();
      expect(metrics.errors).toBeGreaterThan(0);
    });
  });

  describe('set', () => {
    it('should set a value in cache', async () => {
      const testData = { data: 'value' };
      mockRedis.set.mockResolvedValue('OK');

      const result = await service.set('test:key', testData);

      expect(result).toBe(true);
      expect(mockRedis.set).toHaveBeenCalledWith(
        'test:key',
        JSON.stringify(testData),
      );
    });

    it('should set a value with TTL', async () => {
      const testData = { data: 'value' };
      mockRedis.setex.mockResolvedValue('OK');

      const result = await service.set('test:key', testData, { ttl: 300 });

      expect(result).toBe(true);
      expect(mockRedis.setex).toHaveBeenCalledWith(
        'test:key',
        300,
        JSON.stringify(testData),
      );
    });

    it('should apply prefix to key when provided', async () => {
      mockRedis.set.mockResolvedValue('OK');

      await service.set('key', 'value', { prefix: 'products' });

      expect(mockRedis.set).toHaveBeenCalledWith(
        'products:key',
        JSON.stringify('value'),
      );
    });

    it('should record set metrics', async () => {
      mockRedis.set.mockResolvedValue('OK');

      await service.set('test:key', 'value');

      const metrics = service.getMetrics();
      expect(metrics.sets).toBeGreaterThan(0);
    });

    it('should handle set errors gracefully', async () => {
      mockRedis.set.mockRejectedValue(new Error('Redis error'));

      const result = await service.set('error:key', 'value');

      expect(result).toBe(false);
      const metrics = service.getMetrics();
      expect(metrics.errors).toBeGreaterThan(0);
    });
  });

  describe('del', () => {
    it('should delete a key', async () => {
      mockRedis.del.mockResolvedValue(1);

      const result = await service.del('test:key');

      expect(result).toBe(true);
      expect(mockRedis.del).toHaveBeenCalledWith('test:key');
    });

    it('should return false when key does not exist', async () => {
      mockRedis.del.mockResolvedValue(0);

      const result = await service.del('non:existent');

      expect(result).toBe(false);
    });

    it('should record delete metrics', async () => {
      mockRedis.del.mockResolvedValue(1);

      await service.del('test:key');

      const metrics = service.getMetrics();
      expect(metrics.deletes).toBeGreaterThan(0);
    });

    it('should apply prefix to key when provided', async () => {
      mockRedis.del.mockResolvedValue(1);

      await service.del('key', { prefix: 'products' });

      expect(mockRedis.del).toHaveBeenCalledWith('products:key');
    });
  });

  describe('deletePattern', () => {
    it('should delete keys by pattern', async () => {
      mockRedis.keys.mockResolvedValue([
        'products:org1:key1',
        'products:org1:key2',
      ]);
      mockRedis.del.mockResolvedValue(2);

      const result = await service.deletePattern('products:org1:*');

      expect(result).toBe(2);
      expect(mockRedis.keys).toHaveBeenCalledWith('products:org1:*');
      expect(mockRedis.del).toHaveBeenCalledWith(
        'products:org1:key1',
        'products:org1:key2',
      );
    });

    it('should return 0 when no keys match pattern', async () => {
      mockRedis.keys.mockResolvedValue([]);

      const result = await service.deletePattern('nonexistent:*');

      expect(result).toBe(0);
      expect(mockRedis.del).not.toHaveBeenCalled();
    });

    it('should record delete metrics for multiple keys', async () => {
      mockRedis.keys.mockResolvedValue(['key1', 'key2', 'key3']);
      mockRedis.del.mockResolvedValue(3);

      await service.deletePattern('key*');

      const metrics = service.getMetrics();
      expect(metrics.deletes).toBe(3);
    });

    it('should handle errors gracefully', async () => {
      mockRedis.keys.mockRejectedValue(new Error('Redis error'));

      const result = await service.deletePattern('error:*');

      expect(result).toBe(0);
      const metrics = service.getMetrics();
      expect(metrics.errors).toBeGreaterThan(0);
    });
  });

  describe('wrap', () => {
    it('should return cached value on hit', async () => {
      const cachedData = { id: 1, name: 'Cached Product' };
      mockRedis.get.mockResolvedValue(JSON.stringify(cachedData));
      mockRedis.incr.mockResolvedValue(1);

      const fetchFn = jest.fn().mockResolvedValue({ id: 2, name: 'DB Product' });

      const result = await service.wrap('test:key', fetchFn);

      expect(result).toEqual(cachedData);
      expect(fetchFn).not.toHaveBeenCalled();
      expect(mockRedis.incr).toHaveBeenCalledWith('cache:metrics:hits');
    });

    it('should execute function and cache result on miss', async () => {
      mockRedis.get.mockResolvedValue(null);
      mockRedis.incr.mockResolvedValue(1);
      mockRedis.set.mockResolvedValue('OK');

      const dbData = { id: 1, name: 'DB Product' };
      const fetchFn = jest.fn().mockResolvedValue(dbData);

      const result = await service.wrap('test:key', fetchFn, 300);

      expect(result).toEqual(dbData);
      expect(fetchFn).toHaveBeenCalledTimes(1);
      expect(mockRedis.incr).toHaveBeenCalledWith('cache:metrics:misses');
      expect(mockRedis.setex).toHaveBeenCalledWith(
        'test:key',
        300,
        JSON.stringify(dbData),
      );
    });

    it('should cache result without TTL when not provided', async () => {
      mockRedis.get.mockResolvedValue(null);
      mockRedis.incr.mockResolvedValue(1);
      mockRedis.set.mockResolvedValue('OK');

      const fetchFn = jest.fn().mockResolvedValue('data');

      await service.wrap('test:key', fetchFn);

      expect(mockRedis.set).toHaveBeenCalled();
      expect(mockRedis.setex).not.toHaveBeenCalled();
    });
  });

  describe('recordHit and recordMiss', () => {
    it('should record cache hits in Redis', async () => {
      mockRedis.incr.mockResolvedValue(1);

      await service.recordHit();

      expect(mockRedis.incr).toHaveBeenCalledWith('cache:metrics:hits');
    });

    it('should record cache misses in Redis', async () => {
      mockRedis.incr.mockResolvedValue(1);

      await service.recordMiss();

      expect(mockRedis.incr).toHaveBeenCalledWith('cache:metrics:misses');
    });

    it('should handle errors gracefully when recording metrics', async () => {
      mockRedis.incr.mockRejectedValue(new Error('Redis error'));

      // Should not throw
      await expect(service.recordHit()).resolves.toBeUndefined();
      await expect(service.recordMiss()).resolves.toBeUndefined();
    });
  });

  describe('getPersistentMetrics', () => {
    it('should return correct metrics from Redis', async () => {
      mockRedis.get
        .mockResolvedValueOnce('100') // hits
        .mockResolvedValueOnce('25'); // misses

      const metrics = await service.getPersistentMetrics();

      expect(metrics.hits).toBe(100);
      expect(metrics.misses).toBe(25);
      expect(metrics.totalRequests).toBe(125);
      expect(metrics.ratio).toBeCloseTo(0.8, 2);
      expect(metrics.hitRate).toBe('80.00%');
    });

    it('should handle zero requests', async () => {
      mockRedis.get.mockResolvedValue(null);

      const metrics = await service.getPersistentMetrics();

      expect(metrics.hits).toBe(0);
      expect(metrics.misses).toBe(0);
      expect(metrics.ratio).toBe(0);
      expect(metrics.hitRate).toBe('0.00%');
    });

    it('should calculate hit ratio correctly', async () => {
      mockRedis.get
        .mockResolvedValueOnce('2') // hits
        .mockResolvedValueOnce('1'); // misses

      const metrics = await service.getPersistentMetrics();

      expect(metrics.ratio).toBeCloseTo(0.666, 2);
    });

    it('should handle Redis errors gracefully', async () => {
      mockRedis.get.mockRejectedValue(new Error('Redis error'));

      const metrics = await service.getPersistentMetrics();

      expect(metrics.hits).toBe(0);
      expect(metrics.misses).toBe(0);
      expect(metrics.ratio).toBe(0);
    });
  });

  describe('resetPersistentMetrics', () => {
    it('should reset metrics in Redis', async () => {
      mockRedis.set.mockResolvedValue('OK');

      await service.resetPersistentMetrics();

      expect(mockRedis.set).toHaveBeenCalledWith('cache:metrics:hits', '0');
      expect(mockRedis.set).toHaveBeenCalledWith('cache:metrics:misses', '0');
    });

    it('should handle errors gracefully', async () => {
      mockRedis.set.mockRejectedValue(new Error('Redis error'));

      // Should not throw
      await expect(service.resetPersistentMetrics()).resolves.toBeUndefined();
    });
  });

  describe('getMetrics (in-memory)', () => {
    it('should return current in-memory metrics', () => {
      const metrics = service.getMetrics();

      expect(metrics).toHaveProperty('hits');
      expect(metrics).toHaveProperty('misses');
      expect(metrics).toHaveProperty('sets');
      expect(metrics).toHaveProperty('deletes');
      expect(metrics).toHaveProperty('errors');
      expect(metrics).toHaveProperty('hitRate');
      expect(metrics).toHaveProperty('totalRequests');
    });

    it('should calculate hit rate correctly', async () => {
      // Simulate some operations
      mockRedis.get.mockResolvedValue(JSON.stringify({ data: 'test' }));
      await service.get('key1'); // hit
      await service.get('key2'); // hit

      mockRedis.get.mockResolvedValue(null);
      await service.get('key3'); // miss

      const metrics = service.getMetrics();
      expect(metrics.totalRequests).toBe(3);
      expect(metrics.hits).toBe(2);
      expect(metrics.misses).toBe(1);
      expect(parseFloat(metrics.hitRate)).toBeCloseTo(66.67, 1);
    });
  });

  describe('resetMetrics (in-memory)', () => {
    it('should reset all in-memory metrics', async () => {
      // Generate some metrics
      mockRedis.set.mockResolvedValue('OK');
      await service.set('key', 'value');

      // Reset
      service.resetMetrics();

      const metrics = service.getMetrics();
      expect(metrics.hits).toBe(0);
      expect(metrics.misses).toBe(0);
      expect(metrics.sets).toBe(0);
      expect(metrics.deletes).toBe(0);
      expect(metrics.errors).toBe(0);
    });
  });

  describe('exists', () => {
    it('should return true when key exists', async () => {
      mockRedis.exists.mockResolvedValue(1);

      const result = await service.exists('existing:key');

      expect(result).toBe(true);
    });

    it('should return false when key does not exist', async () => {
      mockRedis.exists.mockResolvedValue(0);

      const result = await service.exists('non:existent');

      expect(result).toBe(false);
    });

    it('should apply prefix when provided', async () => {
      mockRedis.exists.mockResolvedValue(1);

      await service.exists('key', { prefix: 'products' });

      expect(mockRedis.exists).toHaveBeenCalledWith('products:key');
    });
  });

  describe('ttl', () => {
    it('should return remaining TTL for a key', async () => {
      mockRedis.ttl.mockResolvedValue(250);

      const result = await service.ttl('key:with:ttl');

      expect(result).toBe(250);
    });

    it('should return -1 for non-existent key', async () => {
      mockRedis.ttl.mockResolvedValue(-2);

      const result = await service.ttl('non:existent');

      expect(result).toBe(-2);
    });

    it('should return -1 for key without TTL', async () => {
      mockRedis.ttl.mockResolvedValue(-1);

      const result = await service.ttl('permanent:key');

      expect(result).toBe(-1);
    });
  });

  describe('clear/flushAll', () => {
    it('should clear all cache entries', async () => {
      mockRedis.flushdb.mockResolvedValue('OK');

      await service.clear();

      expect(mockRedis.flushdb).toHaveBeenCalled();
    });

    it('should handle errors gracefully', async () => {
      mockRedis.flushdb.mockRejectedValue(new Error('Redis error'));

      await expect(service.clear()).resolves.toBeUndefined();

      const metrics = service.getMetrics();
      expect(metrics.errors).toBeGreaterThan(0);
    });
  });

  describe('Multi-tenancy Cache Keys', () => {
    it('should support organization-scoped cache keys', async () => {
      mockRedis.get.mockResolvedValue(JSON.stringify({ data: 'org1' }));

      // Org 1 cache key
      await service.get('products:list:org123:page_1');

      expect(mockRedis.get).toHaveBeenCalledWith(
        'products:list:org123:page_1',
      );
    });

    it('should isolate cache between organizations', async () => {
      mockRedis.set.mockResolvedValue('OK');

      // Cache for org1
      await service.set('products:list:org1:page_1', { items: ['product1'] });

      // Cache for org2
      await service.set('products:list:org2:page_1', { items: ['product2'] });

      // Both should be called with different keys
      expect(mockRedis.set).toHaveBeenCalledWith(
        'products:list:org1:page_1',
        expect.any(String),
      );
      expect(mockRedis.set).toHaveBeenCalledWith(
        'products:list:org2:page_1',
        expect.any(String),
      );
    });

    it('should support pattern-based invalidation for organization', async () => {
      mockRedis.keys.mockResolvedValue([
        'products:list:org123:page_1',
        'products:list:org123:page_2',
      ]);
      mockRedis.del.mockResolvedValue(2);

      // Invalidate all listings for org123
      const result = await service.deletePattern('products:list:org123:*');

      expect(result).toBe(2);
    });
  });
});
