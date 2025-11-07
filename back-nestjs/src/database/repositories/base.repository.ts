import { PrismaService } from '../prisma/prisma.service';

export abstract class BaseRepository<T> {
  constructor(protected readonly prisma: PrismaService) {}

  abstract getModel(): any;

  async findById(id: string): Promise<T | null> {
    return this.getModel().findUnique({ where: { id } });
  }

  async findMany(options?: any): Promise<T[]> {
    return this.getModel().findMany(options);
  }

  async create(data: any): Promise<T> {
    return this.getModel().create({ data });
  }

  async update(id: string, data: any): Promise<T> {
    return this.getModel().update({
      where: { id },
      data,
    });
  }

  async delete(id: string): Promise<T> {
    return this.getModel().delete({ where: { id } });
  }

  async softDelete(id: string): Promise<T> {
    return this.getModel().update({
      where: { id },
      data: { deletedAt: new Date() },
    });
  }

  async count(options?: any): Promise<number> {
    return this.getModel().count(options);
  }
}
