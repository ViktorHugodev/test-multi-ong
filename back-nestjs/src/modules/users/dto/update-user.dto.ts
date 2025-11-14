import { IsEnum, IsOptional, IsUUID } from 'class-validator';
import { UserRole } from '@prisma/client';

export class UpdateUserDto {
  @IsOptional()
  @IsEnum(UserRole)
  role?: UserRole;

  @IsOptional()
  @IsUUID()
  organizationId?: string;

  // IMPORTANTE: Não permitir alteração de email/password aqui
  // Criar endpoints específicos para essas operações sensíveis
}
