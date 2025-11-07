import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ConflictException,
} from '@nestjs/common';
import { OrdersRepository } from './orders.repository';
import { ProductsRepository } from '../products/products.repository';
import { PrismaService } from '../../database/prisma/prisma.service';
import { CreateOrderDto } from './dto/create-order.dto';

@Injectable()
export class OrdersService {
  constructor(
    private readonly ordersRepository: OrdersRepository,
    private readonly productsRepository: ProductsRepository,
    private readonly prisma: PrismaService,
  ) {}

  /**
   * Create order with concurrency control and transaction
   * Prevents overselling using optimistic locking
   */
  async create(customerId: string, createOrderDto: CreateOrderDto) {
    // Check idempotency
    if (createOrderDto.idempotencyKey) {
      const existing = await this.ordersRepository.findByIdempotencyKey(
        createOrderDto.idempotencyKey,
      );
      if (existing) {
        return existing;
      }
    }

    // Validate items
    if (!createOrderDto.items || createOrderDto.items.length === 0) {
      throw new BadRequestException('Order must contain at least one item');
    }

    // Use Prisma transaction for atomicity
    return this.prisma.$transaction(async (tx) => {
      const orderItems = [];
      let totalAmount = 0;

      // Process each item with stock reservation
      for (const item of createOrderDto.items) {
        // Fetch product with lock (SELECT FOR UPDATE)
        const product = await tx.product.findUnique({
          where: { id: item.productId },
        });

        if (!product) {
          throw new NotFoundException(
            `Product ${item.productId} not found`,
          );
        }

        if (!product.isActive) {
          throw new BadRequestException(
            `Product ${product.name} is not available`,
          );
        }

        if (product.stockQty < item.quantity) {
          throw new ConflictException(
            `Insufficient stock for product ${product.name}. Available: ${product.stockQty}`,
          );
        }

        // Calculate item total
        const itemTotal = Number(product.price) * item.quantity;
        totalAmount += itemTotal;

        // Reserve stock atomically
        await tx.product.update({
          where: {
            id: item.productId,
            stockQty: { gte: item.quantity }, // Optimistic lock
          },
          data: {
            stockQty: { decrement: item.quantity },
          },
        });

        orderItems.push({
          productId: product.id,
          organizationId: product.organizationId,
          productName: product.name,
          productPrice: product.price,
          quantity: item.quantity,
          subtotal: itemTotal,
          weightGrams: product.weightGrams * item.quantity,
        });
      }

      // Generate order number
      const orderNumber = await this.ordersRepository.generateOrderNumber();

      // Create order
      const order = await tx.order.create({
        data: {
          orderNumber,
          customerId,
          status: 'pending',
          totalAmount,
          shippingDetails: createOrderDto.shippingDetails || {},
          paymentMethod: createOrderDto.paymentMethod,
          idempotencyKey: createOrderDto.idempotencyKey,
          items: {
            create: orderItems,
          },
        },
        include: {
          items: {
            include: {
              product: true,
            },
          },
        },
      });

      return order;
    });
  }

  async findByCustomer(customerId: string) {
    return this.ordersRepository.findByCustomer(customerId);
  }

  async findOne(id: string, customerId?: string) {
    const order = await this.ordersRepository.findByIdWithItems(id);

    if (!order) {
      throw new NotFoundException(`Order with ID ${id} not found`);
    }

    // Verify customer owns this order
    if (customerId && order.customerId !== customerId) {
      throw new NotFoundException(`Order with ID ${id} not found`);
    }

    return order;
  }

  async updateStatus(id: string, status: string) {
    const order = await this.ordersRepository.findById(id);
    if (!order) {
      throw new NotFoundException(`Order with ID ${id} not found`);
    }

    return this.ordersRepository.updateStatus(id, status as any);
  }

  async cancelOrder(id: string, customerId: string) {
    const order = await this.findOne(id, customerId);

    if (order.status !== 'pending') {
      throw new BadRequestException(
        'Only pending orders can be cancelled',
      );
    }

    // Return stock to products
    await this.prisma.$transaction(async (tx) => {
      for (const item of order.items) {
        await tx.product.update({
          where: { id: item.productId },
          data: {
            stockQty: { increment: item.quantity },
          },
        });
      }

      await tx.order.update({
        where: { id },
        data: { status: 'cancelled' },
      });
    });

    return this.findOne(id);
  }
}
