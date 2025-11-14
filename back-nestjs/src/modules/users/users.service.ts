import {
  Injectable,
  ForbiddenException,
  NotFoundException,
  Logger,
} from '@nestjs/common';
import { PrismaService } from '../../database/prisma/prisma.service';
import { UpdateUserDto } from './dto/update-user.dto';
import { UserRole } from '@prisma/client';

@Injectable()
export class UsersService {
  private readonly logger = new Logger(UsersService.name);

  constructor(private prisma: PrismaService) {}

  async updateUser(userId: string, updateUserDto: UpdateUserDto) {
    this.logger.log({
      message: 'Updating user',
      userId,
      changes: updateUserDto,
    });

    // Validação: verificar se user existe
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Validação: se mudar organization, verificar se org existe
    if (updateUserDto.organizationId) {
      const orgExists = await this.prisma.organization.findUnique({
        where: { id: updateUserDto.organizationId },
      });

      if (!orgExists) {
        throw new NotFoundException('Organization not found');
      }
    }

    // REGRA DE NEGÓCIO: Apenas ADMIN pode se tornar ADMIN
    if (updateUserDto.role === UserRole.admin && user.role !== UserRole.admin) {
      throw new ForbiddenException('Only admins can assign admin role');
    }

    const updatedUser = await this.prisma.user.update({
      where: { id: userId },
      data: updateUserDto,
      select: {
        id: true,
        email: true,
        fullName: true,
        role: true,
        organizationId: true,
        isActive: true,
        createdAt: true,
        updatedAt: true,
        organization: {
          select: {
            id: true,
            name: true,
            slug: true,
          },
        },
      },
    });

    this.logger.log({
      message: 'User updated successfully',
      userId,
    });

    return updatedUser;
  }

  async findById(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        fullName: true,
        role: true,
        organizationId: true,
        isActive: true,
        createdAt: true,
        updatedAt: true,
        organization: {
          select: {
            id: true,
            name: true,
            slug: true,
          },
        },
      },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return user;
  }

  getAvailableRoles() {
    return Object.values(UserRole);
  }
}
