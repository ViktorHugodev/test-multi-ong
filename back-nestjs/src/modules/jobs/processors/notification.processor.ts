// ========================================
// Arquivo: back-nestjs/src/modules/jobs/processors/notification.processor.ts
// Status: ✏️ IMPLEMENTAR
// Responsabilidade: Processar envio de notificações de forma assíncrona
// ========================================

import {
  Processor,
  Process,
  OnQueueActive,
  OnQueueCompleted,
  OnQueueFailed,
} from '@nestjs/bull';
import { Injectable, Logger } from '@nestjs/common';
import type { Job } from 'bull';
import { NotificationService } from '../services/notification.service';
import { IdempotencyService } from '../services/idempotency.service';
import { JobLogService } from '../services/job-log.service';
import { SendNotificationDto } from '../dto/send-notification.dto';

/**
 * Notification Processor
 *
 * Processa notificações de forma assíncrona com:
 * - Idempotência via Redis
 * - Retry automático em falhas
 * - Templates dinâmicos por tipo
 * - Logging estruturado
 * - Tracking de tentativas
 *
 * Tipos de notificação:
 * - order_created: Pedido criado
 * - payment_processing: Pagamento em processamento
 * - payment_approved: Pagamento aprovado
 * - payment_failed: Pagamento falhou
 * - order_confirmed: Pedido confirmado
 *
 * Fluxo:
 * 1. Verificar idempotência
 * 2. Criar JobLog
 * 3. Enviar notificação (simulado)
 * 4. Persistir resultado
 * 5. Atualizar JobLog
 */
@Processor('notifications')
@Injectable()
export class NotificationProcessor {
  private readonly logger = new Logger(NotificationProcessor.name);

  constructor(
    private readonly notificationService: NotificationService,
    private readonly idempotencyService: IdempotencyService,
    private readonly jobLogService: JobLogService,
  ) {}

  @Process('send-notification')
  async handleNotification(job: Job<SendNotificationDto>) {
    const {
      orderId,
      type,
      recipient,
      idempotencyKey,
      orderNumber,
      amount,
      transactionId,
      metadata,
    } = job.data;
    const startTime = Date.now();

    this.logger.log(
      `[Job ${job.id}] Sending ${type} notification to ${recipient} for order ${orderId} (attempt ${job.attemptsMade + 1}/${job.opts.attempts})`,
    );

    // 1. CRIAR JOB LOG
    await this.jobLogService.createLog(
      String(job.id),
      'notifications',
      'send-notification',
      job.data,
    );

    await this.jobLogService.markAsProcessing(
      String(job.id),
      job.attemptsMade + 1,
    );

    try {
      // 2. VERIFICAR IDEMPOTÊNCIA
      const idempotencyKeyFinal =
        idempotencyKey ||
        this.idempotencyService.generateKey(orderId, `notification:${type}`);

      const cachedResult =
        await this.idempotencyService.checkJobProcessed(idempotencyKeyFinal);

      if (cachedResult) {
        this.logger.warn(
          `[Job ${job.id}] Notification already sent: ${type} for order ${orderId}`,
        );

        await this.jobLogService.updateLog(String(job.id), 'completed', {
          skipped: true,
          reason: 'Already sent',
          cachedResult,
        });

        return cachedResult;
      }

      // 3. ENVIAR NOTIFICAÇÃO
      this.logger.log(
        `[Job ${job.id}] Processing notification ${type} for order ${orderId}`,
      );

      const notification = await this.notificationService.sendNotification({
        orderId,
        type,
        recipient,
        orderNumber,
        amount,
        transactionId,
      });

      const duration = Date.now() - startTime;

      this.logger.log(
        `[Job ${job.id}] ✅ Notification ${type} sent successfully to ${recipient} (${duration}ms)`,
      );

      const successResult = {
        success: true,
        notificationId: notification.id,
        type,
        recipient,
        duration,
        sentAt: notification.sentAt,
      };

      // 4. ATUALIZAR JOB LOG E IDEMPOTÊNCIA
      await this.jobLogService.updateLog(
        String(job.id),
        'completed',
        successResult,
      );
      await this.idempotencyService.markJobAsProcessed(
        idempotencyKeyFinal,
        successResult,
      );

      return successResult;
    } catch (error) {
      const duration = Date.now() - startTime;

      // 5. TRATAMENTO DE ERROS
      this.logger.error(
        `[Job ${job.id}] ❌ Error sending ${type} notification to ${recipient} (${duration}ms):`,
        error.message,
      );

      // Marcar como retry no JobLog
      await this.jobLogService.markAsRetrying(
        String(job.id),
        job.attemptsMade + 1,
        error.message,
      );

      // Lançar erro para Bull fazer retry automático
      throw error;
    }
  }

  @OnQueueActive()
  onActive(job: Job) {
    this.logger.debug(
      `[Queue] Job ${job.id} started sending ${job.data.type} notification for order ${job.data.orderId}`,
    );
  }

  @OnQueueCompleted()
  onCompleted(job: Job, result: any) {
    const duration = Date.now() - job.timestamp;

    this.logger.log(
      `[Queue] Job ${job.id} completed - ${job.data.type} notification for order ${job.data.orderId} - Duration: ${duration}ms`,
    );
  }

  @OnQueueFailed()
  async onFailed(job: Job, error: Error) {
    const duration = Date.now() - job.timestamp;

    this.logger.error(
      `[Queue] Job ${job.id} failed - ${job.data.type} notification for order ${job.data.orderId} after ${job.attemptsMade} attempts - Duration: ${duration}ms`,
    );

    // Se esgotou todas as tentativas
    if (job.attemptsMade >= (job.opts.attempts || 3)) {
      this.logger.error(
        `[Queue] Job ${job.id} exhausted all ${job.attemptsMade} retry attempts - Moving to DLQ`,
      );

      await this.jobLogService.updateLog(
        String(job.id),
        'failed',
        undefined,
        `Exhausted all ${job.attemptsMade} retry attempts: ${error.message}`,
      );

      // Opcional: Enviar alerta para equipe de suporte
      this.logger.error(
        `[ALERT] Failed to send ${job.data.type} notification to ${job.data.recipient} for order ${job.data.orderId}`,
      );
    }
  }
}

// ========================================
// Configurações Críticas:
// - Idempotência: Evita envio duplicado
// - Retry exponencial: 1s, 2s, 4s (3 tentativas)
// - Templates dinâmicos: Por tipo de notificação
// - Tracking: Tentativas e timestamps persistidos
// - DLQ: Notificações falhadas mantidas para análise
// ========================================

// ========================================
// Cenários de Falha Cobertos:
// - Notificação já enviada: Skip (idempotência)
// - Erro de rede: Retry automático
// - Serviço indisponível: Retry automático
// - Tentativas esgotadas: Move para DLQ + alerta
// - Redis down: Fail open (envia)
// ========================================
