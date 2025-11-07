import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../database/prisma/prisma.service';
import { BaseRepository } from '../../database/repositories/base.repository';
import { Order, OrderStatus } from '@prisma/client';

@Injectable()
export class OrdersRepository extends BaseRepository<Order> {
  constructor(prisma: PrismaService) {
    super(prisma);
  }

  getModel() {
    return this.prisma.order;
  }

  async findByCustomer(customerId: string): Promise<Order[]> {
    return this.prisma.order.findMany({
      where: { customerId, deletedAt: null },
      include: {
        items: {
          include: {
            product: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findByIdWithItems(orderId: string): Promise<Order | null> {
    return this.prisma.order.findUnique({
      where: { id: orderId },
      include: {
        items: {
          include: {
            product: true,
          },
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
  }

  async findByIdempotencyKey(key: string): Promise<Order | null> {
    return this.prisma.order.findUnique({
      where: { idempotencyKey: key },
      include: {
        items: true,
      },
    });
  }

  async updateStatus(orderId: string, status: OrderStatus): Promise<Order> {
    return this.prisma.order.update({
      where: { id: orderId },
      data: { status },
    });
  }

  /**
   * Generate unique order number
   */
  async generateOrderNumber(): Promise<string> {
    const date = new Date();
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');

    // Count orders today
    const startOfDay = new Date(date.setHours(0, 0, 0, 0));
    const count = await this.prisma.order.count({
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
