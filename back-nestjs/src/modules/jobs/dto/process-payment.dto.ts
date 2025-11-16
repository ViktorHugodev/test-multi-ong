// ========================================
// Arquivo: back-nestjs/src/modules/jobs/dto/process-payment.dto.ts
// Status: 🆕 CRIAR
// Responsabilidade: DTO para payload do job de pagamento
// ========================================

import { IsString, IsNumber, IsOptional, Min } from 'class-validator';

/**
 * DTO para Job de Processamento de Pagamento
 *
 * Define a estrutura do payload que será enfileirado
 * no Bull Queue para processamento assíncrono.
 */
export class ProcessPaymentDto {
  /**
   * ID do pedido a ser processado
   */
  @IsString()
  orderId: string;

  /**
   * Valor total do pagamento
   */
  @IsNumber()
  @Min(0.01)
  amount: number;

  /**
   * Chave de idempotência (opcional)
   * Se não fornecida, será gerada automaticamente
   */
  @IsOptional()
  @IsString()
  idempotencyKey?: string;

  /**
   * Número do pedido (para logs e notificações)
   */
  @IsOptional()
  @IsString()
  orderNumber?: string;

  /**
   * Email do cliente (para notificações)
   */
  @IsOptional()
  @IsString()
  customerEmail?: string;
}
