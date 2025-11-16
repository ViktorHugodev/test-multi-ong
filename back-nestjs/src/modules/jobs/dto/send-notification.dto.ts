// ========================================
// Arquivo: back-nestjs/src/modules/jobs/dto/send-notification.dto.ts
// Status: 🆕 CRIAR
// Responsabilidade: DTO para payload do job de notificação
// ========================================

import { IsString, IsEnum, IsOptional, IsNumber } from 'class-validator';
import { NotificationType } from '@prisma/client';

/**
 * DTO para Job de Envio de Notificação
 *
 * Define a estrutura do payload para jobs de notificação
 * (email, SMS, push, etc.)
 */
export class SendNotificationDto {
  /**
   * ID do pedido relacionado
   */
  @IsString()
  orderId: string;

  /**
   * Tipo da notificação
   */
  @IsEnum(NotificationType)
  type: NotificationType;

  /**
   * Destinatário (email, telefone, etc.)
   */
  @IsString()
  recipient: string;

  /**
   * Chave de idempotência (opcional)
   */
  @IsOptional()
  @IsString()
  idempotencyKey?: string;

  /**
   * Número do pedido (para incluir na mensagem)
   */
  @IsOptional()
  @IsString()
  orderNumber?: string;

  /**
   * Valor do pedido (para incluir na mensagem)
   */
  @IsOptional()
  @IsNumber()
  amount?: number;

  /**
   * ID da transação (para notificações de pagamento aprovado)
   */
  @IsOptional()
  @IsString()
  transactionId?: string;

  /**
   * Metadados adicionais
   */
  @IsOptional()
  metadata?: Record<string, any>;
}
