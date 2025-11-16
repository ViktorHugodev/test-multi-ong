import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { PrismaService } from '../../src/database/prisma/prisma.service';
import { AppModule } from '../../src/app.module';
import * as bcrypt from 'bcrypt';

export interface TestUser {
  id: string;
  email: string;
  password: string;
  role: string;
  organizationId: string | null;
  accessToken?: string;
}

export interface TestOrganization {
  id: string;
  name: string;
  slug: string;
  email: string;
}

export class TestSetupHelper {
  private app: INestApplication;
  private prisma: PrismaService;
  private moduleFixture: TestingModule;

  async setupApp(): Promise<INestApplication> {
    this.moduleFixture = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    this.app = this.moduleFixture.createNestApplication();

    // Apply same global pipes as main app
    this.app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        transform: true,
        forbidNonWhitelisted: false,
        transformOptions: {
          enableImplicitConversion: true,
        },
      }),
    );

    this.app.setGlobalPrefix('api');

    await this.app.init();

    this.prisma = this.app.get(PrismaService);

    return this.app;
  }

  async cleanDatabase(): Promise<void> {
    // Delete in correct order due to foreign keys
    await this.prisma.searchLog.deleteMany({});
    await this.prisma.orderItem.deleteMany({});
    await this.prisma.order.deleteMany({});
    await this.prisma.product.deleteMany({});
    await this.prisma.user.deleteMany({});
    await this.prisma.organization.deleteMany({});
  }

  async createOrganization(data?: Partial<TestOrganization>): Promise<TestOrganization> {
    const slug = data?.slug || `org-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

    const org = await this.prisma.organization.create({
      data: {
        name: data?.name || `Test Organization ${slug}`,
        slug,
        email: data?.email || `${slug}@test.com`,
        description: 'Test organization',
        isActive: true,
      },
    });

    return org;
  }

  async createUser(
    organizationId: string | null,
    role: string = 'ong_manager',
    data?: Partial<TestUser>,
  ): Promise<TestUser> {
    const email = data?.email || `user-${Date.now()}-${Math.random().toString(36).substr(2, 9)}@test.com`;
    const password = data?.password || 'Test@123456';
    const passwordHash = await bcrypt.hash(password, 10);

    const user = await this.prisma.user.create({
      data: {
        email,
        passwordHash,
        fullName: `Test User ${email}`,
        role: role as any,
        organizationId,
        isActive: true,
      },
    });

    return {
      ...user,
      password,
    };
  }

  async getAccessToken(user: TestUser | string, password?: string): Promise<string> {
    const request = require('supertest');

    let email: string;
    let pwd: string;

    if (typeof user === 'string') {
      email = user;
      pwd = password || '';
    } else {
      email = user.email;
      pwd = user.password;
    }

    const response = await request(this.app.getHttpServer())
      .post('/api/auth/login')
      .send({ email, password: pwd })
      .expect(201);

    return response.body.accessToken;
  }

  async createProduct(organizationId: string, data?: any) {
    return this.prisma.product.create({
      data: {
        organizationId,
        name: data?.name || 'Test Product',
        description: data?.description || 'Test Description',
        price: data?.price || 100.0,
        category: data?.category || 'Artesanato',
        imageUrl: data?.imageUrl || 'https://example.com/image.jpg',
        stockQty: data?.stockQty ?? 10,
        weightGrams: data?.weightGrams || 500,
        isActive: true,
      },
    });
  }

  getPrisma(): PrismaService {
    return this.prisma;
  }

  getApp(): INestApplication {
    return this.app;
  }

  async closeApp(): Promise<void> {
    await this.prisma.$disconnect();
    await this.app.close();
  }
}
