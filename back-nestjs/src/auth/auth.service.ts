import {
  Injectable,
  UnauthorizedException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../database/prisma/prisma.service';
import * as bcrypt from 'bcrypt';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { JwtPayload } from './strategies/jwt.strategy';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
  ) {}

  async register(registerDto: RegisterDto) {
    // Verificar se email já existe
    const existingUser = await this.prisma.user.findUnique({
      where: { email: registerDto.email },
    });

    if (existingUser) {
      throw new ConflictException('Email already registered');
    }

    const hashedPassword = await bcrypt.hash(registerDto.password, 10);

    // Se role é ong_manager, criar organização
    let organizationId: string | null = null;

    if (registerDto.role === 'ong_manager') {
      if (!registerDto.organization) {
        throw new BadRequestException(
          'Organization data is required for ong_manager role',
        );
      }

      // Verificar se email da org já existe
      const existingOrg = await this.prisma.organization.findUnique({
        where: { email: registerDto.organization.email },
      });

      if (existingOrg) {
        throw new ConflictException('Organization email already registered');
      }

      // Criar organização
      const org = await this.prisma.organization.create({
        data: {
          name: registerDto.organization.name,
          slug: this.generateSlug(registerDto.organization.name),
          description: registerDto.organization.description,
          email: registerDto.organization.email,
          phone: registerDto.organization.phone,
        },
      });
      organizationId = org.id;
    } else if (registerDto.organizationId) {
      // Para outros roles, usar organizationId se fornecido
      organizationId = registerDto.organizationId;
    }

    // Criar usuário
    const user = await this.prisma.user.create({
      data: {
        email: registerDto.email,
        passwordHash: hashedPassword,
        fullName: registerDto.fullName,
        role: registerDto.role,
        organizationId,
      },
      include: {
        organization: true,
      },
    });

    const token = this.generateToken(user);

    return {
      user: this.sanitizeUser(user),
      organization: user.organization,
      token,
      expiresIn: '7d',
    };
  }

  async login(loginDto: LoginDto) {
    const user = await this.prisma.user.findUnique({
      where: { email: loginDto.email },
      include: { organization: true },
    });

    if (!user || !user.isActive) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const isPasswordValid = await bcrypt.compare(
      loginDto.password,
      user.passwordHash,
    );

    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const token = this.generateToken(user);

    return {
      user: this.sanitizeUser(user),
      token,
      expiresIn: '7d',
    };
  }

  async getProfile(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: { organization: true },
    });

    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    return this.sanitizeUser(user);
  }

  async validateUser(userId: string) {
    return this.prisma.user.findUnique({
      where: { id: userId },
      include: { organization: true },
    });
  }

  private generateToken(user: any): string {
    const payload: JwtPayload = {
      sub: user.id,
      email: user.email,
      role: user.role,
      organizationId: user.organizationId,
    };

    return this.jwtService.sign(payload);
  }

  private sanitizeUser(user: any) {
    const { passwordHash, ...sanitized } = user;
    return sanitized;
  }

  private generateSlug(name: string): string {
    return name
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');
  }
}
