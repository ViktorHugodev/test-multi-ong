import {
  Injectable,
  ConflictException,
  NotFoundException,
  BadRequestException,
  Logger,
} from '@nestjs/common';
import { PrismaService } from '@/database/prisma/prisma.service';
import { OrdersRepository } from './orders.repository';
import { CreateOrderDto } from './dto/create-order.dto';
import { InjectQueue } from '@nestjs/bull';
import type { Queue } from 'bull';
import {
  InsufficientStockException,
  StockError,
} from './exceptions/insufficient-stock.exception';

@Injectable()
export class OrdersService {
  private readonly logger = new Logger(OrdersService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly repository: OrdersRepository,
    @InjectQueue('payment-processing') private paymentQueue: Queue,
    @InjectQueue('notifications') private notificationQueue: Queue,
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
        // 1. ORDENAR IDs para prevenir deadlocks
        const productIds = dto.items
          .map((item) => item.productId)
          .sort();

        // 2. LOCK PESSIMISTA usando queryRawUnsafe com placeholders posicionais
        // Isso resolve o problema de type casting UUID
        const placeholders = productIds.map((_, index) => `$${index + 1}`).join(',');

        await tx.$queryRawUnsafe(
          `SELECT id FROM products WHERE id IN (${placeholders}) FOR UPDATE`,
          ...productIds
        );

        // 3. Buscar produtos (agora já estão locked)
        const products = await tx.product.findMany({
          where: {
            id: { in: productIds },
            deletedAt: null,
            isActive: true,
          },
        });

        // 4. VALIDATE STOCK
        const stockErrors: StockError[] = [];

        for (const item of dto.items) {
          const product = products.find((p) => p.id === item.productId);

          if (!product) {
            throw new NotFoundException(
              `Product ${item.productId} not found`,
            );
          }

          if (product.stockQty < item.quantity) {
            stockErrors.push({
              productId: product.id,
              productName: product.name,
              requested: item.quantity,
              available: product.stockQty,
            });
          }
        }

        if (stockErrors.length > 0) {
          this.logger.warn('Insufficient stock detected', { stockErrors });
          throw new InsufficientStockException(stockErrors);
        }

        // 5. CALCULATE TOTAL
        const totalAmount = dto.items.reduce((sum, item) => {
          const product = products.find((p) => p.id === item.productId);
          if (!product) return sum;
          return sum + Number(product.price) * item.quantity;
        }, 0);

        // 6. GENERATE ORDER NUMBER
        const orderNumber = await this.generateOrderNumber(tx);

        // 7. CREATE ORDER
        const order = await tx.order.create({
          data: {
            customerId: userId,
            orderNumber,
            status: 'payment_processing',
            totalAmount,
            shippingDetails: dto.shippingDetails,
            paymentMethod: dto.paymentMethod,
            idempotencyKey: dto.idempotencyKey,
          },
        });

        // 8. CREATE ORDER ITEMS + ATOMIC STOCK DECREMENT
        for (const item of dto.items) {
          const product = products.find((p) => p.id === item.productId);
          if (!product) continue;

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
      // DISPATCH ASYNC JOBS (não bloqueia resposta)
      await this.dispatchAsyncJobs(order);

      return {
        ...order,
        message: 'Pedido criado com sucesso. Processamento em andamento.',
        estimatedProcessingTime: '2-5 segundos',
      };
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

  /**
   * Dispara jobs assíncronos após criação do pedido
   * - Payment processing
   * - Order created notification
   */
  private async dispatchAsyncJobs(order: any) {
    const idempotencyKey = `order:${order.id}`;

    try {
      // 1. Job de processamento de pagamento
      await this.paymentQueue.add(
        'process-payment',
        {
          orderId: order.id,
          amount: Number(order.totalAmount),
          orderNumber: order.orderNumber,
          idempotencyKey: `${idempotencyKey}:payment`,
        },
        {
          attempts: 5,
          backoff: {
            type: 'exponential',
            delay: 2000,
          },
        },
      );

      this.logger.log(`Payment job enqueued for order ${order.id}`);

      // 2. Job de notificação de pedido criado
      const customer = await this.prisma.user.findUnique({
        where: { id: order.customerId },
        select: { email: true },
      });

      await this.notificationQueue.add(
        'send-notification',
        {
          orderId: order.id,
          type: 'order_created',
          recipient: customer?.email || 'customer@example.com',
          orderNumber: order.orderNumber,
          amount: Number(order.totalAmount),
          idempotencyKey: `${idempotencyKey}:notification:order_created`,
        },
        {
          attempts: 3,
          backoff: {
            type: 'exponential',
            delay: 1000,
          },
        },
      );

      this.logger.log(`Order created notification job enqueued for order ${order.id}`);
    } catch (error) {
      this.logger.error(
        `Error enqueuing async jobs for order ${order.id}:`,
        error.message,
      );
      // Não bloquear a criação do pedido se enfileiramento falhar
    }
  }

  /**
   * Busca status completo de processamento assíncrono do pedido
   */
  async getOrderProcessingStatus(orderId: string, userId: string) {
    const order = await this.prisma.order.findUnique({
      where: { id: orderId },
      include: {
        items: {
          include: {
            product: {
              select: {
                name: true,
                imageUrl: true,
              },
            },
          },
        },
        payments: {
          orderBy: { createdAt: 'desc' },
        },
        notifications: {
          orderBy: { createdAt: 'desc' },
        },
        customer: {
          select: {
            id: true,
            email: true,
            fullName: true,
          },
        },
      },
    });

    if (!order) {
      throw new NotFoundException('Order not found');
    }

    // Verificar se usuário é dono do pedido
    if (order.customerId !== userId) {
      throw new NotFoundException('Order not found');
    }

    return order;
  }

  /**
   * Retentar pagamento manualmente
   */
  async retryPayment(orderId: string, userId: string) {
    const order = await this.prisma.order.findUnique({
      where: { id: orderId },
      include: {
        customer: {
          select: {
            id: true,
            email: true,
          },
        },
      },
    });

    if (!order) {
      throw new NotFoundException('Order not found');
    }

    // Verificar se usuário é dono do pedido
    if (order.customerId !== userId) {
      throw new NotFoundException('Order not found');
    }

    // Verificar se pedido pode ser retentado
    if (order.status === 'confirmed') {
      throw new BadRequestException('Order is already confirmed');
    }

    if (order.status === 'cancelled') {
      throw new BadRequestException('Order is cancelled');
    }

    // Atualizar status para payment_processing
    await this.prisma.order.update({
      where: { id: orderId },
      data: { status: 'payment_processing' },
    });

    // Enfileirar novo job de pagamento
    await this.paymentQueue.add(
      'process-payment',
      {
        orderId: order.id,
        amount: Number(order.totalAmount),
        orderNumber: order.orderNumber,
        customerEmail: order.customer.email,
        idempotencyKey: `order:${order.id}:payment:retry:${Date.now()}`,
      },
      {
        attempts: 5,
        backoff: {
          type: 'exponential',
          delay: 2000,
        },
      },
    );

    this.logger.log(`Payment retry job enqueued for order ${orderId}`);

    return {
      message: 'Retry de pagamento iniciado',
      orderId,
      status: 'payment_processing',
    };
  }

  // Métodos auxiliares mantidos para compatibilidade
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

  private async generateOrderNumber(tx?: any): Promise<string> {
    const prismaClient = tx || this.prisma;
    const date = new Date();
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');

    // Contar pedidos criados hoje para gerar sequência
    const startOfDay = new Date(date.setHours(0, 0, 0, 0));
    const count = await prismaClient.order.count({
      where: {
        createdAt: {
          gte: startOfDay,
        },
      },
    });

    const sequence = String(count + 1).padStart(4, '0');
    return `ORD-${year}${month}${day}-${sequence}`;
  }
}
