// ========================================
// Arquivo: back-nestjs/src/modules/jobs/jobs.module.ts
// Status: ✏️ ATUALIZAR
// Responsabilidade: Configuração completa do sistema de filas
// ========================================

import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bull';
import { ConfigModule, ConfigService } from '@nestjs/config';

// Processors
import { PaymentProcessor } from './processors/payment.processor';
import { NotificationProcessor } from './processors/notification.processor';

// Services
import { PaymentGatewayService } from './services/payment-gateway.service';
import { NotificationService } from './services/notification.service';
import { IdempotencyService } from './services/idempotency.service';
import { JobLogService } from './services/job-log.service';

/**
 * Jobs Module - Sistema de Processamento Assíncrono
 *
 * Arquitetura:
 * - Bull Queue + Redis para gerenciamento de filas
 * - Processadores especializados (Payment, Notification)
 * - Idempotência via Redis
 * - Logging persistente no Prisma
 * - Retry exponencial com DLQ
 *
 * Filas:
 * 1. payment-processing: Processa pagamentos via gateway
 *    - 5 tentativas, backoff 2s-32s
 *    - Rate limit: 10 jobs/segundo
 *
 * 2. notifications: Envia notificações aos clientes
 *    - 3 tentativas, backoff 1s-4s
 *    - Rate limit: 20 jobs/segundo
 *
 * Serviços:
 * - PaymentGatewayService: Simulação de gateway externo
 * - NotificationService: Templates e envio de notificações
 * - IdempotencyService: Cache de jobs processados (Redis)
 * - JobLogService: Histórico e auditoria (Prisma)
 */
@Module({
  imports: [
    ConfigModule,

    // Configuração global do Bull com Redis
    BullModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        redis: {
          host: configService.get('redis.host'),
          port: configService.get('redis.port'),
          password: configService.get('redis.password'),
          db: configService.get('redis.db'),
          maxRetriesPerRequest: 3,
          enableOfflineQueue: true,
          retryStrategy: (times: number) => Math.min(times * 50, 2000),
        },
        defaultJobOptions: {
          removeOnComplete: true,
          attempts: 3,
        },
      }),
      inject: [ConfigService],
    }),

    // Registrar filas individuais
    BullModule.registerQueue(
      {
        name: 'payment-processing',
        defaultJobOptions: {
          attempts: 5, // Retry até 5 vezes
          backoff: {
            type: 'exponential',
            delay: 2000, // 2s, 4s, 8s, 16s, 32s
          },
          removeOnComplete: 100, // Manter últimos 100 completados
          removeOnFail: false, // Dead Letter Queue (manter falhados)
          timeout: 30000, // 30 segundos timeout
        },
        limiter: {
          max: 10, // Máximo 10 jobs por segundo
          duration: 1000,
        },
        settings: {
          lockDuration: 30000, // Lock por 30 segundos
          maxStalledCount: 1, // Mover para failed após 1 stall
          stalledInterval: 30000, // Verificar stalled a cada 30s
        },
      },
      {
        name: 'notifications',
        defaultJobOptions: {
          attempts: 3, // Retry até 3 vezes
          backoff: {
            type: 'exponential',
            delay: 1000, // 1s, 2s, 4s
          },
          removeOnComplete: 50, // Manter últimos 50 completados
          removeOnFail: false, // Manter falhados para retry manual
          timeout: 15000, // 15 segundos timeout
        },
        limiter: {
          max: 20, // Máximo 20 notificações por segundo
          duration: 1000,
        },
        settings: {
          lockDuration: 15000,
          maxStalledCount: 1,
          stalledInterval: 15000,
        },
      },
    ),
  ],

  providers: [
    // Processors
    PaymentProcessor,
    NotificationProcessor,

    // Services
    PaymentGatewayService,
    NotificationService,
    IdempotencyService,
    JobLogService,
  ],

  exports: [
    BullModule, // Permite outros módulos adicionarem jobs
    IdempotencyService,
    JobLogService,
    PaymentGatewayService,
    NotificationService,
  ],
})
export class JobsModule {}

// ========================================
// Configurações Críticas:
//
// Payment Queue:
// - Retry: 5 tentativas (2s, 4s, 8s, 16s, 32s)
// - Rate Limit: 10 jobs/s (protege gateway)
// - Timeout: 30s por job
// - DLQ: Manter falhas para análise
//
// Notification Queue:
// - Retry: 3 tentativas (1s, 2s, 4s)
// - Rate Limit: 20 jobs/s
// - Timeout: 15s por job
// - DLQ: Manter falhas para retry manual
//
// Redis:
// - Connection retry: Automático (50ms-2s backoff)
// - Offline queue: Habilitado
// - Max retries: 3 por request
//
// Lock:
// - Stalled detection: 30s/15s
// - Auto-failover: Após 1 stall
// ========================================
