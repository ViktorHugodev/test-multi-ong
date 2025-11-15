import { Test, TestingModule } from '@nestjs/testing';
import { ForbiddenException, NotFoundException } from '@nestjs/common';
import { ProductsService } from './products.service';
import { ProductsRepository } from './products.repository';

describe('ProductsService', () => {
  let service: ProductsService;
  let repository: ProductsRepository;

  const mockProductsRepository = {
    create: jest.fn(),
    findByOrganization: jest.fn(),
    findPublicProducts: jest.fn(),
    findById: jest.fn(),
    findByIdWithOrganization: jest.fn(),
    update: jest.fn(),
    softDelete: jest.fn(),
    updateStockWithLock: jest.fn(),
  };

  const mockOrganizationId = '123e4567-e89b-12d3-a456-426614174000';
  const mockProductId = '123e4567-e89b-12d3-a456-426614174001';

  const mockProduct = {
    id: mockProductId,
    organizationId: mockOrganizationId,
    name: 'Test Product',
    description: 'Test Description',
    price: 100.0,
    category: 'Artesanato',
    imageUrl: 'https://example.com/image.jpg',
    stockQty: 10,
    weightGrams: 500,
    sku: null,
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date(),
    deletedAt: null,
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ProductsService,
        {
          provide: ProductsRepository,
          useValue: mockProductsRepository,
        },
      ],
    }).compile();

    service = module.get<ProductsService>(ProductsService);
    repository = module.get<ProductsRepository>(ProductsRepository);

    // Clear mocks before each test
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    const createProductDto = {
      name: 'Test Product',
      description: 'Test Description',
      price: 100.0,
      category: 'Artesanato',
      imageUrl: 'https://example.com/image.jpg',
      stockQty: 10,
      weightGrams: 500,
    };

    it('should create a product successfully', async () => {
      mockProductsRepository.create.mockResolvedValue(mockProduct);

      const result = await service.create(mockOrganizationId, createProductDto);

      expect(result).toEqual(mockProduct);
      expect(mockProductsRepository.create).toHaveBeenCalledWith({
        ...createProductDto,
        organizationId: mockOrganizationId,
      });
      expect(mockProductsRepository.create).toHaveBeenCalledTimes(1);
    });

    it('should throw ForbiddenException when organizationId is not provided', async () => {
      await expect(service.create(null, createProductDto)).rejects.toThrow(
        ForbiddenException,
      );

      expect(mockProductsRepository.create).not.toHaveBeenCalled();
    });

    it('should throw ForbiddenException when organizationId is undefined', async () => {
      await expect(service.create(undefined, createProductDto)).rejects.toThrow(
        ForbiddenException,
      );

      expect(mockProductsRepository.create).not.toHaveBeenCalled();
    });

    it('should always use organizationId from parameter, not DTO', async () => {
      const dtoWithOrgId = {
        ...createProductDto,
        organizationId: 'malicious-org-id',
      } as any;

      mockProductsRepository.create.mockResolvedValue(mockProduct);

      await service.create(mockOrganizationId, dtoWithOrgId);

      // Should use organizationId from parameter, ignoring the one in DTO
      expect(mockProductsRepository.create).toHaveBeenCalledWith(
        expect.objectContaining({
          organizationId: mockOrganizationId,
        }),
      );
    });
  });

  describe('findByOrganization', () => {
    it('should return products for valid organizationId', async () => {
      const mockResponse = {
        items: [mockProduct],
        meta: {
          page: 1,
          pageSize: 20,
          total: 1,
          totalPages: 1,
        },
      };

      mockProductsRepository.findByOrganization.mockResolvedValue(mockResponse);

      const result = await service.findByOrganization(mockOrganizationId);

      expect(result).toEqual(mockResponse);
      expect(mockProductsRepository.findByOrganization).toHaveBeenCalledWith(
        mockOrganizationId,
        undefined,
      );
    });

    it('should throw ForbiddenException when organizationId is not provided', async () => {
      await expect(service.findByOrganization(null)).rejects.toThrow(
        ForbiddenException,
      );

      expect(mockProductsRepository.findByOrganization).not.toHaveBeenCalled();
    });

    it('should pass filters to repository', async () => {
      const filters = {
        category: 'Artesanato',
        minPrice: 50,
        maxPrice: 150,
      };

      mockProductsRepository.findByOrganization.mockResolvedValue({
        items: [],
        meta: { page: 1, pageSize: 20, total: 0, totalPages: 0 },
      });

      await service.findByOrganization(mockOrganizationId, filters);

      expect(mockProductsRepository.findByOrganization).toHaveBeenCalledWith(
        mockOrganizationId,
        filters,
      );
    });
  });

  describe('findPublicProducts', () => {
    it('should return public products', async () => {
      const mockResponse = {
        items: [mockProduct],
        meta: {
          page: 1,
          pageSize: 20,
          total: 1,
          totalPages: 1,
        },
      };

      mockProductsRepository.findPublicProducts.mockResolvedValue(mockResponse);

      const result = await service.findPublicProducts();

      expect(result).toEqual(mockResponse);
      expect(mockProductsRepository.findPublicProducts).toHaveBeenCalledWith(
        undefined,
      );
    });

    it('should pass filters to repository', async () => {
      const filters = { category: 'Doces' };

      mockProductsRepository.findPublicProducts.mockResolvedValue({
        items: [],
        meta: { page: 1, pageSize: 20, total: 0, totalPages: 0 },
      });

      await service.findPublicProducts(filters);

      expect(mockProductsRepository.findPublicProducts).toHaveBeenCalledWith(
        filters,
      );
    });
  });

  describe('findOne', () => {
    it('should return product when organizationId is provided and matches', async () => {
      mockProductsRepository.findByIdWithOrganization.mockResolvedValue(
        mockProduct,
      );

      const result = await service.findOne(mockProductId, mockOrganizationId);

      expect(result).toEqual(mockProduct);
      expect(
        mockProductsRepository.findByIdWithOrganization,
      ).toHaveBeenCalledWith(mockProductId, mockOrganizationId);
    });

    it('should return product when no organizationId provided (public access)', async () => {
      mockProductsRepository.findById.mockResolvedValue(mockProduct);

      const result = await service.findOne(mockProductId);

      expect(result).toEqual(mockProduct);
      expect(mockProductsRepository.findById).toHaveBeenCalledWith(
        mockProductId,
      );
    });

    it('should throw NotFoundException when product not found', async () => {
      mockProductsRepository.findByIdWithOrganization.mockResolvedValue(null);

      await expect(
        service.findOne(mockProductId, mockOrganizationId),
      ).rejects.toThrow(NotFoundException);
    });

    it('should throw NotFoundException when product does not belong to organization', async () => {
      mockProductsRepository.findByIdWithOrganization.mockResolvedValue(null);

      await expect(
        service.findOne(mockProductId, 'different-org-id'),
      ).rejects.toThrow(NotFoundException);

      expect(
        mockProductsRepository.findByIdWithOrganization,
      ).toHaveBeenCalledWith(mockProductId, 'different-org-id');
    });
  });

  describe('update', () => {
    const updateProductDto = {
      name: 'Updated Product',
      price: 150.0,
    };

    it('should update product successfully when ownership is verified', async () => {
      mockProductsRepository.findByIdWithOrganization.mockResolvedValue(
        mockProduct,
      );
      mockProductsRepository.update.mockResolvedValue({
        ...mockProduct,
        ...updateProductDto,
      });

      const result = await service.update(
        mockProductId,
        mockOrganizationId,
        updateProductDto,
      );

      expect(result.name).toBe(updateProductDto.name);
      expect(mockProductsRepository.findByIdWithOrganization).toHaveBeenCalledWith(
        mockProductId,
        mockOrganizationId,
      );
      expect(mockProductsRepository.update).toHaveBeenCalledWith(
        mockProductId,
        updateProductDto,
      );
    });

    it('should throw ForbiddenException when organizationId is not provided', async () => {
      await expect(
        service.update(mockProductId, null, updateProductDto),
      ).rejects.toThrow(ForbiddenException);

      expect(
        mockProductsRepository.findByIdWithOrganization,
      ).not.toHaveBeenCalled();
      expect(mockProductsRepository.update).not.toHaveBeenCalled();
    });

    it('should throw NotFoundException when product does not belong to organization', async () => {
      mockProductsRepository.findByIdWithOrganization.mockResolvedValue(null);

      await expect(
        service.update(mockProductId, 'different-org-id', updateProductDto),
      ).rejects.toThrow(NotFoundException);

      expect(mockProductsRepository.update).not.toHaveBeenCalled();
    });

    it('should verify ownership before updating', async () => {
      mockProductsRepository.findByIdWithOrganization.mockResolvedValue(null);

      await expect(
        service.update(mockProductId, mockOrganizationId, updateProductDto),
      ).rejects.toThrow(NotFoundException);

      // Verify ownership check was called
      expect(
        mockProductsRepository.findByIdWithOrganization,
      ).toHaveBeenCalledWith(mockProductId, mockOrganizationId);

      // Update should not be called if ownership check fails
      expect(mockProductsRepository.update).not.toHaveBeenCalled();
    });
  });

  describe('remove', () => {
    it('should soft delete product when ownership is verified', async () => {
      mockProductsRepository.findByIdWithOrganization.mockResolvedValue(
        mockProduct,
      );
      mockProductsRepository.softDelete.mockResolvedValue({
        ...mockProduct,
        deletedAt: new Date(),
      });

      const result = await service.remove(mockProductId, mockOrganizationId);

      expect(result.deletedAt).not.toBeNull();
      expect(mockProductsRepository.findByIdWithOrganization).toHaveBeenCalledWith(
        mockProductId,
        mockOrganizationId,
      );
      expect(mockProductsRepository.softDelete).toHaveBeenCalledWith(
        mockProductId,
      );
    });

    it('should throw ForbiddenException when organizationId is not provided', async () => {
      await expect(service.remove(mockProductId, null)).rejects.toThrow(
        ForbiddenException,
      );

      expect(
        mockProductsRepository.findByIdWithOrganization,
      ).not.toHaveBeenCalled();
      expect(mockProductsRepository.softDelete).not.toHaveBeenCalled();
    });

    it('should throw NotFoundException when product does not belong to organization', async () => {
      mockProductsRepository.findByIdWithOrganization.mockResolvedValue(null);

      await expect(
        service.remove(mockProductId, 'different-org-id'),
      ).rejects.toThrow(NotFoundException);

      expect(mockProductsRepository.softDelete).not.toHaveBeenCalled();
    });

    it('should verify ownership before deleting', async () => {
      mockProductsRepository.findByIdWithOrganization.mockResolvedValue(null);

      await expect(
        service.remove(mockProductId, mockOrganizationId),
      ).rejects.toThrow(NotFoundException);

      // Verify ownership check was called
      expect(
        mockProductsRepository.findByIdWithOrganization,
      ).toHaveBeenCalledWith(mockProductId, mockOrganizationId);

      // Delete should not be called if ownership check fails
      expect(mockProductsRepository.softDelete).not.toHaveBeenCalled();
    });
  });

  describe('reserveStock', () => {
    it('should reserve stock with concurrency control', async () => {
      const updatedProduct = { ...mockProduct, stockQty: 5 };
      mockProductsRepository.updateStockWithLock.mockResolvedValue(
        updatedProduct,
      );

      const result = await service.reserveStock(
        mockProductId,
        mockOrganizationId,
        5,
      );

      expect(result).toEqual(updatedProduct);
      expect(mockProductsRepository.updateStockWithLock).toHaveBeenCalledWith(
        mockProductId,
        mockOrganizationId,
        5,
      );
    });

    it('should delegate to repository for stock locking logic', async () => {
      mockProductsRepository.updateStockWithLock.mockResolvedValue(mockProduct);

      await service.reserveStock(mockProductId, mockOrganizationId, 3);

      expect(mockProductsRepository.updateStockWithLock).toHaveBeenCalledTimes(
        1,
      );
    });
  });

  describe('Multi-tenancy Security', () => {
    it('should never allow creating product without organizationId', async () => {
      const createDto = {
        name: 'Test',
        price: 100,
        category: 'Test',
        stockQty: 10,
        weightGrams: 500,
      };

      await expect(service.create(null, createDto)).rejects.toThrow(
        ForbiddenException,
      );
      await expect(service.create(undefined, createDto)).rejects.toThrow(
        ForbiddenException,
      );
      await expect(service.create('', createDto)).rejects.toThrow(
        ForbiddenException,
      );
    });

    it('should never allow updating product without organizationId', async () => {
      const updateDto = { name: 'Updated' };

      await expect(service.update('id', null, updateDto)).rejects.toThrow(
        ForbiddenException,
      );
      await expect(service.update('id', undefined, updateDto)).rejects.toThrow(
        ForbiddenException,
      );
      await expect(service.update('id', '', updateDto)).rejects.toThrow(
        ForbiddenException,
      );
    });

    it('should never allow deleting product without organizationId', async () => {
      await expect(service.remove('id', null)).rejects.toThrow(
        ForbiddenException,
      );
      await expect(service.remove('id', undefined)).rejects.toThrow(
        ForbiddenException,
      );
      await expect(service.remove('id', '')).rejects.toThrow(
        ForbiddenException,
      );
    });

    it('should always verify ownership before modifying products', async () => {
      mockProductsRepository.findByIdWithOrganization.mockResolvedValue(null);

      // Update
      await expect(
        service.update('id', 'org-id', { name: 'Test' }),
      ).rejects.toThrow(NotFoundException);

      expect(mockProductsRepository.findByIdWithOrganization).toHaveBeenCalled();
      expect(mockProductsRepository.update).not.toHaveBeenCalled();

      jest.clearAllMocks();

      // Delete
      await expect(service.remove('id', 'org-id')).rejects.toThrow(
        NotFoundException,
      );

      expect(mockProductsRepository.findByIdWithOrganization).toHaveBeenCalled();
      expect(mockProductsRepository.softDelete).not.toHaveBeenCalled();
    });
  });
});
