// ========================================
// Arquivo: back-nestjs/src/modules/jobs/services/notification.service.ts
// Status: 🆕 CRIAR
// Responsabilidade: Gerenciar templates e envio de notificações
// ========================================

import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '@/database/prisma/prisma.service';
import { NotificationType, NotificationStatus } from '@prisma/client';

export interface NotificationTemplate {
  subject: string;
  message: string;
  metadata?: Record<string, any>;
}

export interface NotificationPayload {
  orderId: string;
  type: NotificationType;
  recipient: string;
  orderNumber?: string;
  amount?: number;
  transactionId?: string;
}

/**
 * Serviço de Notificações
 *
 * Responsável por:
 * - Gerar templates de mensagens por tipo
 * - Simular envio de notificações (email/SMS)
 * - Persistir histórico de notificações
 * - Tracking de tentativas e status
 *
 * @example
 * await this.notificationService.sendNotification({
 *   orderId: 'uuid',
 *   type: 'payment_approved',
 *   recipient: 'customer@example.com'
 * });
 */
@Injectable()
export class NotificationService {
  private readonly logger = new Logger(NotificationService.name);

  constructor(private readonly prisma: PrismaService) {}

  /**
   * Envia uma notificação (SIMULADO)
   *
   * @param payload - Dados da notificação
   * @returns Notification criada no banco
   */
  async sendNotification(payload: NotificationPayload) {
    const template = this.getTemplate(payload.type, payload);

    this.logger.log(
      `[Notification] Sending ${payload.type} to ${payload.recipient} for order ${payload.orderId}`,
    );

    // Simular delay de envio (500ms - 1.5s)
    const delay = Math.floor(Math.random() * 1000) + 500;
    await this.sleep(delay);

    // Simular taxa de sucesso de 95%
    const success = Math.random() > 0.05;

    if (success) {
      this.logger.log(
        `[Notification] ✅ ${payload.type} sent successfully to ${payload.recipient}`,
      );
      this.logger.debug(`Subject: ${template.subject}`);
      this.logger.debug(`Message: ${template.message}`);

      // Persistir notificação como enviada
      return await this.prisma.notification.create({
        data: {
          orderId: payload.orderId,
          type: payload.type,
          recipient: payload.recipient,
          status: 'sent',
          message: template.message,
          metadata: template.metadata,
          sentAt: new Date(),
          attempts: 1,
          lastAttemptAt: new Date(),
        },
      });
    } else {
      this.logger.warn(
        `[Notification] ⚠️  Failed to send ${payload.type} to ${payload.recipient}`,
      );

      // Persistir como falha (será retentado)
      const notification = await this.prisma.notification.create({
        data: {
          orderId: payload.orderId,
          type: payload.type,
          recipient: payload.recipient,
          status: 'failed',
          message: template.message,
          metadata: template.metadata,
          attempts: 1,
          lastAttemptAt: new Date(),
        },
      });

      throw new Error(
        `Failed to send notification: Network error or service unavailable`,
      );
    }
  }

  /**
   * Atualiza tentativa de notificação
   *
   * @param notificationId - ID da notificação
   * @param attempts - Número de tentativas
   * @param success - Se foi bem-sucedida
   */
  async updateAttempt(
    notificationId: string,
    attempts: number,
    success: boolean,
  ) {
    const updateData: any = {
      attempts,
      lastAttemptAt: new Date(),
    };

    if (success) {
      updateData.status = 'sent';
      updateData.sentAt = new Date();
    } else {
      updateData.status = 'failed';
    }

    return await this.prisma.notification.update({
      where: { id: notificationId },
      data: updateData,
    });
  }

  /**
   * Busca notificações de um pedido
   *
   * @param orderId - ID do pedido
   */
  async getNotificationsByOrderId(orderId: string) {
    return await this.prisma.notification.findMany({
      where: { orderId },
      orderBy: { createdAt: 'desc' },
    });
  }

  /**
   * Gera template de mensagem baseado no tipo
   *
   * @param type - Tipo da notificação
   * @param payload - Dados para preencher template
   */
  private getTemplate(
    type: NotificationType,
    payload: NotificationPayload,
  ): NotificationTemplate {
    const templates: Record<NotificationType, NotificationTemplate> = {
      order_created: {
        subject: `Pedido ${payload.orderNumber || ''} criado com sucesso!`,
        message: `Olá! Seu pedido ${payload.orderNumber || payload.orderId} foi criado com sucesso e está sendo processado. Você receberá uma confirmação assim que o pagamento for aprovado.`,
        metadata: {
          orderNumber: payload.orderNumber,
          orderId: payload.orderId,
        },
      },

      payment_processing: {
        subject: `Processando pagamento do pedido ${payload.orderNumber || ''}`,
        message: `Estamos processando o pagamento do seu pedido ${payload.orderNumber || payload.orderId}. Aguarde alguns instantes para a confirmação.`,
        metadata: {
          orderNumber: payload.orderNumber,
          orderId: payload.orderId,
          amount: payload.amount,
        },
      },

      payment_approved: {
        subject: `✅ Pagamento aprovado - Pedido ${payload.orderNumber || ''}`,
        message: `Ótimas notícias! O pagamento do seu pedido ${payload.orderNumber || payload.orderId} foi aprovado com sucesso. ${payload.amount ? `Valor: R$ ${payload.amount.toFixed(2)}` : ''}\nCódigo da transação: ${payload.transactionId || 'N/A'}\n\nSeu pedido está confirmado e em breve será enviado.`,
        metadata: {
          orderNumber: payload.orderNumber,
          orderId: payload.orderId,
          amount: payload.amount,
          transactionId: payload.transactionId,
        },
      },

      payment_failed: {
        subject: `❌ Falha no pagamento - Pedido ${payload.orderNumber || ''}`,
        message: `Infelizmente não foi possível processar o pagamento do pedido ${payload.orderNumber || payload.orderId}. Por favor, verifique seus dados de pagamento e tente novamente.\n\nSe o problema persistir, entre em contato com nosso suporte.`,
        metadata: {
          orderNumber: payload.orderNumber,
          orderId: payload.orderId,
          amount: payload.amount,
        },
      },

      order_confirmed: {
        subject: `🎉 Pedido ${payload.orderNumber || ''} confirmado!`,
        message: `Seu pedido ${payload.orderNumber || payload.orderId} foi confirmado com sucesso!\n\nAgora estamos preparando seu pedido para envio. Você receberá atualizações sobre o rastreamento em breve.\n\nObrigado por sua compra!`,
        metadata: {
          orderNumber: payload.orderNumber,
          orderId: payload.orderId,
          amount: payload.amount,
          transactionId: payload.transactionId,
        },
      },
    };

    return templates[type] || {
      subject: 'Notificação do pedido',
      message: `Atualização sobre seu pedido ${payload.orderId}`,
      metadata: payload,
    };
  }

  /**
   * Busca notificações pendentes para retry
   *
   * @param limit - Limite de registros
   */
  async getPendingNotifications(limit = 50) {
    return await this.prisma.notification.findMany({
      where: {
        status: 'pending',
        attempts: { lt: 3 }, // Máximo 3 tentativas
      },
      orderBy: { createdAt: 'asc' },
      take: limit,
    });
  }

  /**
   * Busca notificações falhadas
   *
   * @param limit - Limite de registros
   */
  async getFailedNotifications(limit = 100) {
    return await this.prisma.notification.findMany({
      where: {
        status: 'failed',
      },
      orderBy: { createdAt: 'desc' },
      take: limit,
    });
  }

  /**
   * Estatísticas de notificações
   */
  async getStats() {
    const [total, sent, failed, pending] = await Promise.all([
      this.prisma.notification.count(),
      this.prisma.notification.count({ where: { status: 'sent' } }),
      this.prisma.notification.count({ where: { status: 'failed' } }),
      this.prisma.notification.count({ where: { status: 'pending' } }),
    ]);

    const successRate = total > 0 ? ((sent / total) * 100).toFixed(2) : '0.00';

    return {
      total,
      sent,
      failed,
      pending,
      successRate: `${successRate}%`,
    };
  }

  /**
   * Sleep helper
   */
  private sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}

// ========================================
// Configurações Críticas:
// - Taxa de sucesso: 95% (simulado)
// - Delay: 500ms-1.5s (simula latência de envio)
// - Templates dinâmicos: Por tipo de notificação
// - Tracking: Tentativas e timestamps
// - Retry: Até 3 tentativas automáticas
// ========================================

// ========================================
// Cenários de Falha Cobertos:
// - Envio falha: Persistir como failed para retry
// - Network error: Simula 5% de falha
// - Retry automático: Bull gerencia
// - Histórico completo: Todas tentativas registradas
// ========================================
