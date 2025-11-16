// ========================================
// Arquivo: back-nestjs/src/modules/jobs/services/payment-gateway.service.ts
// Status: 🆕 CRIAR
// Responsabilidade: Simulação realística de gateway de pagamento
// ========================================

import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

export enum PaymentErrorType {
  TRANSIENT = 'TRANSIENT', // Retry possível
  PERMANENT = 'PERMANENT', // Não retry
}

export class PaymentError extends Error {
  constructor(
    message: string,
    public readonly type: PaymentErrorType,
    public readonly code: string,
  ) {
    super(message);
    this.name = 'PaymentError';
  }
}

export interface PaymentResult {
  success: boolean;
  transactionId?: string;
  gatewayResponse: {
    status: string;
    message: string;
    timestamp: string;
    amount: number;
    processingTime: number;
    authCode?: string;
  };
}

/**
 * Serviço de Gateway de Pagamento (SIMULADO)
 *
 * Simula comportamento realístico de um gateway de pagamento externo:
 * - 85% taxa de sucesso
 * - 10% falhas transitórias (network, timeout)
 * - 5% falhas permanentes (cartão recusado, saldo insuficiente)
 * - Delays aleatórios entre 500ms-3s
 * - Logging estruturado completo
 *
 * @example
 * const result = await this.paymentGateway.processPayment(orderId, amount);
 * if (result.success) {
 *   console.log('Pagamento aprovado:', result.transactionId);
 * }
 */
@Injectable()
export class PaymentGatewayService {
  private readonly logger = new Logger(PaymentGatewayService.name);

  // Configurações via environment
  private readonly successRate: number;
  private readonly transientFailRate: number;
  private readonly permanentFailRate: number;
  private readonly minDelay: number;
  private readonly maxDelay: number;

  constructor(private readonly configService: ConfigService) {
    this.successRate = parseFloat(
      this.configService.get('PAYMENT_SUCCESS_RATE') || '0.85',
    );
    this.transientFailRate = parseFloat(
      this.configService.get('PAYMENT_TRANSIENT_FAIL_RATE') || '0.10',
    );
    this.permanentFailRate = parseFloat(
      this.configService.get('PAYMENT_PERMANENT_FAIL_RATE') || '0.05',
    );
    this.minDelay = parseInt(
      this.configService.get('PAYMENT_MIN_DELAY') || '500',
      10,
    );
    this.maxDelay = parseInt(
      this.configService.get('PAYMENT_MAX_DELAY') || '3000',
      10,
    );

    this.logger.log(
      `Payment Gateway initialized - Success: ${this.successRate * 100}%, Transient: ${this.transientFailRate * 100}%, Permanent: ${this.permanentFailRate * 100}%`,
    );
  }

  /**
   * Processa um pagamento (SIMULADO)
   *
   * @param orderId - ID do pedido
   * @param amount - Valor a ser cobrado
   * @returns Resultado do processamento
   * @throws PaymentError em caso de falha transitória ou permanente
   */
  async processPayment(
    orderId: string,
    amount: number,
  ): Promise<PaymentResult> {
    const startTime = Date.now();

    this.logger.log(
      `[Gateway] Processing payment for order ${orderId} - Amount: R$ ${amount.toFixed(2)}`,
    );

    // Simular delay de rede (500ms - 3s)
    const delay = this.getRandomDelay();
    await this.sleep(delay);

    // Determinar resultado baseado em probabilidades
    const random = Math.random();
    const processingTime = Date.now() - startTime;

    // SUCESSO (85%)
    if (random < this.successRate) {
      return this.generateSuccessResponse(orderId, amount, processingTime);
    }

    // FALHA TRANSITÓRIA (10%) - RETRY POSSÍVEL
    if (random < this.successRate + this.transientFailRate) {
      throw this.generateTransientError(orderId, processingTime);
    }

    // FALHA PERMANENTE (5%) - NÃO RETRY
    throw this.generatePermanentError(orderId, processingTime);
  }

  /**
   * Gera resposta de sucesso
   */
  private generateSuccessResponse(
    orderId: string,
    amount: number,
    processingTime: number,
  ): PaymentResult {
    const transactionId = this.generateTransactionId();
    const authCode = this.generateAuthCode();

    this.logger.log(
      `[Gateway] ✅ Payment APPROVED for order ${orderId} - TxnID: ${transactionId} - Time: ${processingTime}ms`,
    );

    return {
      success: true,
      transactionId,
      gatewayResponse: {
        status: 'APPROVED',
        message: 'Pagamento aprovado com sucesso',
        timestamp: new Date().toISOString(),
        amount,
        processingTime,
        authCode,
      },
    };
  }

  /**
   * Gera erro transitório (retry possível)
   */
  private generateTransientError(
    orderId: string,
    processingTime: number,
  ): PaymentError {
    const transientErrors = [
      {
        code: 'GATEWAY_TIMEOUT',
        message: 'Gateway timeout - tente novamente',
      },
      {
        code: 'NETWORK_ERROR',
        message: 'Erro de rede na comunicação com o banco',
      },
      {
        code: 'GATEWAY_UNAVAILABLE',
        message: 'Gateway temporariamente indisponível',
      },
      {
        code: 'PROCESSING_ERROR',
        message: 'Erro temporário no processamento',
      },
    ];

    const error =
      transientErrors[Math.floor(Math.random() * transientErrors.length)];

    this.logger.warn(
      `[Gateway] ⚠️  TRANSIENT ERROR for order ${orderId} - ${error.code} - Time: ${processingTime}ms`,
    );

    return new PaymentError(error.message, PaymentErrorType.TRANSIENT, error.code);
  }

  /**
   * Gera erro permanente (não retry)
   */
  private generatePermanentError(
    orderId: string,
    processingTime: number,
  ): PaymentError {
    const permanentErrors = [
      {
        code: 'CARD_DECLINED',
        message: 'Cartão recusado pela operadora',
      },
      {
        code: 'INSUFFICIENT_FUNDS',
        message: 'Saldo insuficiente',
      },
      {
        code: 'INVALID_CARD',
        message: 'Cartão inválido ou expirado',
      },
      {
        code: 'FRAUD_DETECTED',
        message: 'Transação bloqueada por suspeita de fraude',
      },
      {
        code: 'CARD_LIMIT_EXCEEDED',
        message: 'Limite do cartão excedido',
      },
    ];

    const error =
      permanentErrors[Math.floor(Math.random() * permanentErrors.length)];

    this.logger.error(
      `[Gateway] ❌ PERMANENT ERROR for order ${orderId} - ${error.code} - Time: ${processingTime}ms`,
    );

    return new PaymentError(error.message, PaymentErrorType.PERMANENT, error.code);
  }

  /**
   * Gera ID de transação único
   */
  private generateTransactionId(): string {
    const timestamp = Date.now();
    const random = Math.random().toString(36).substring(2, 11).toUpperCase();
    return `TXN-${timestamp}-${random}`;
  }

  /**
   * Gera código de autorização
   */
  private generateAuthCode(): string {
    return Math.random().toString(36).substring(2, 8).toUpperCase();
  }

  /**
   * Gera delay aleatório entre min e max
   */
  private getRandomDelay(): number {
    return (
      Math.floor(Math.random() * (this.maxDelay - this.minDelay + 1)) +
      this.minDelay
    );
  }

  /**
   * Sleep helper
   */
  private sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  /**
   * Valida configurações do gateway
   */
  validateConfig(): boolean {
    const totalRate =
      this.successRate + this.transientFailRate + this.permanentFailRate;

    if (Math.abs(totalRate - 1.0) > 0.01) {
      this.logger.error(
        `Invalid configuration: Total rate = ${totalRate} (should be 1.0)`,
      );
      return false;
    }

    return true;
  }

  /**
   * Retorna estatísticas de configuração
   */
  getConfig() {
    return {
      successRate: `${(this.successRate * 100).toFixed(1)}%`,
      transientFailRate: `${(this.transientFailRate * 100).toFixed(1)}%`,
      permanentFailRate: `${(this.permanentFailRate * 100).toFixed(1)}%`,
      delayRange: `${this.minDelay}ms - ${this.maxDelay}ms`,
    };
  }
}

// ========================================
// Configurações Críticas:
// - Taxa de sucesso: 85% (configurável via env)
// - Falhas transitórias: 10% (network, timeout)
// - Falhas permanentes: 5% (cartão recusado, fraude)
// - Delays: 500ms-3s (simula latência real)
// - Transaction ID: Único e rastreável
// ========================================

// ========================================
// Cenários de Falha Cobertos:
// - Gateway timeout: TRANSIENT (retry)
// - Network error: TRANSIENT (retry)
// - Gateway unavailable: TRANSIENT (retry)
// - Card declined: PERMANENT (não retry)
// - Insufficient funds: PERMANENT (não retry)
// - Invalid card: PERMANENT (não retry)
// - Fraud detected: PERMANENT (não retry)
// - Limit exceeded: PERMANENT (não retry)
// ========================================
