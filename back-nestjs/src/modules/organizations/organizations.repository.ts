import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../database/prisma/prisma.service';
import { BaseRepository } from '../../database/repositories/base.repository';
import { Organization } from '@prisma/client';

@Injectable()
export class OrganizationsRepository extends BaseRepository<Organization> {
  constructor(prisma: PrismaService) {
    super(prisma);
  }

  getModel() {
    return this.prisma.organization;
  }

  async findBySlug(slug: string): Promise<Organization | null> {
    return this.prisma.organization.findUnique({
      where: { slug },
    });
  }

  async findByEmail(email: string): Promise<Organization | null> {
    return this.prisma.organization.findUnique({
      where: { email },
    });
  }

  async findAllActive(): Promise<Organization[]> {
    return this.prisma.organization.findMany({
      where: { isActive: true, deletedAt: null },
      orderBy: { createdAt: 'desc' },
    });
  }
}
