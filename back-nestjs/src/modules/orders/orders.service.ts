import {
  Injectable,
  ConflictException,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '@/database/prisma/prisma.service';
import { OrdersRepository } from './orders.repository';
import { CreateOrderDto } from './dto/create-order.dto';
import { InjectQueue } from '@nestjs/bull';
import { Queue } from 'bull';

@Injectable()
export class OrdersService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly repository: OrdersRepository,
    @InjectQueue('payment') private paymentQueue: Queue,
  ) {}

  async createOrder(userId: string, dto: CreateOrderDto) {
    // Validar que há pelo menos um item
    if (!dto.items || dto.items.length === 0) {
      throw new BadRequestException('Order must have at least one item');
    }

    // Validar idempotência
    if (dto.idempotencyKey) {
      const existingOrder = await this.prisma.order.findUnique({
        where: { idempotencyKey: dto.idempotencyKey },
      });

      if (existingOrder) {
        return existingOrder;
      }
    }

    return this.prisma.$transaction(
      async (tx) => {
        // 1. LOCK PRODUCTS (PESSIMISTIC) - Ordenar IDs para prevenir deadlocks
        const productIds = dto.items
          .map((item) => item.productId)
          .sort();

        // Lock rows com FOR UPDATE
        await tx.$executeRaw`
          SELECT * FROM products
          WHERE id = ANY(${productIds}::uuid[])
          FOR UPDATE
        `;

        // 2. Buscar produtos
        const products = await tx.product.findMany({
          where: {
            id: { in: productIds },
            deletedAt: null,
            isActive: true,
          },
        });

        // 3. VALIDATE STOCK
        const stockErrors: string[] = [];

        for (const item of dto.items) {
          const product = products.find((p) => p.id === item.productId);

          if (!product) {
            throw new NotFoundException(
              `Product ${item.productId} not found`,
            );
          }

          if (product.stockQty < item.quantity) {
            stockErrors.push(
              `${product.name}: requested ${item.quantity}, available ${product.stockQty}`,
            );
          }
        }

        if (stockErrors.length > 0) {
          throw new ConflictException(
            `Insufficient stock: ${stockErrors.join('; ')}`,
          );
        }

        // 4. CALCULATE TOTAL
        const totalAmount = dto.items.reduce((sum, item) => {
          const product = products.find((p) => p.id === item.productId);
          return sum + Number(product.price) * item.quantity;
        }, 0);

        // 5. CREATE ORDER
        const order = await tx.order.create({
          data: {
            customerId: userId,
            orderNumber: this.generateOrderNumber(),
            status: 'payment_processing',
            totalAmount,
            shippingDetails: dto.shippingDetails,
            paymentMethod: dto.paymentMethod,
            idempotencyKey: dto.idempotencyKey,
          },
        });

        // 6. CREATE ORDER ITEMS + ATOMIC STOCK DECREMENT
        for (const item of dto.items) {
          const product = products.find((p) => p.id === item.productId);

          await tx.orderItem.create({
            data: {
              orderId: order.id,
              productId: item.productId,
              organizationId: product.organizationId,
              productName: product.name,
              productPrice: product.price,
              quantity: item.quantity,
              subtotal: Number(product.price) * item.quantity,
              weightGrams: product.weightGrams,
            },
          });

          // ATOMIC DECREMENT
          await tx.product.update({
            where: { id: item.productId },
            data: {
              stockQty: { decrement: item.quantity },
            },
          });
        }

        return order;
      },
      {
        isolationLevel: 'Serializable',
        maxWait: 5000,
        timeout: 10000,
      },
    ).then(async (order) => {
      // ENQUEUE ASYNC PAYMENT JOB (não bloqueia resposta)
      await this.paymentQueue.add(
        'process-payment',
        { orderId: order.id },
        {
          attempts: 3,
          backoff: {
            type: 'exponential',
            delay: 2000,
          },
        },
      );

      return order;
    });
  }

  async findMyOrders(userId: string, page = 1, pageSize = 20) {
    return this.repository.findManyByCustomer(userId, page, pageSize);
  }

  async findOrderById(orderId: string, userId: string) {
    const order = await this.repository.findByIdWithItems(orderId);

    if (!order) {
      throw new NotFoundException('Order not found');
    }

    // Verificar se usuário é dono do pedido
    if (order.customerId !== userId) {
      throw new NotFoundException('Order not found');
    }

    return order;
  }

  async findOrdersByOrganization(
    organizationId: string,
    page = 1,
    pageSize = 20,
  ) {
    return this.repository.findManyByOrganization(
      organizationId,
      page,
      pageSize,
    );
  }

  // Usado pelo PaymentProcessor
  async confirmPayment(orderId: string, transactionData: any) {
    return this.prisma.order.update({
      where: { id: orderId },
      data: {
        status: 'confirmed',
        transactionId: transactionData.transactionId,
        paidAt: new Date(),
      },
    });
  }

  async failPayment(orderId: string, error: string) {
    return this.prisma.order.update({
      where: { id: orderId },
      data: {
        status: 'failed',
      },
    });
  }

  private generateOrderNumber(): string {
    const year = new Date().getFullYear();
    const random = Math.floor(Math.random() * 1000000)
      .toString()
      .padStart(6, '0');
    return `ORD-${year}-${random}`;
  }
}
