// ========================================
// Arquivo: back-nestjs/src/config/queue.config.ts
// Status: 🆕 CRIAR
// Responsabilidade: Configuração centralizada das filas Bull
// ========================================

import { registerAs } from '@nestjs/config';

export default registerAs('queue', () => ({
  payment: {
    name: 'payment-processing',
    limiter: {
      max: 10, // Máximo 10 jobs por segundo
      duration: 1000,
    },
    defaultJobOptions: {
      attempts: 5, // Retry até 5 vezes
      backoff: {
        type: 'exponential' as const,
        delay: 2000, // 2s, 4s, 8s, 16s, 32s
      },
      removeOnComplete: 100, // Manter últimos 100 jobs completados
      removeOnFail: false, // Manter jobs falhados para análise (DLQ)
      timeout: 30000, // 30 segundos timeout
    },
    settings: {
      lockDuration: 30000, // Lock por 30 segundos
      maxStalledCount: 1, // Mover para failed após 1 tentativa
      stalledInterval: 30000, // Verificar stalled a cada 30s
    },
  },
  notification: {
    name: 'notifications',
    limiter: {
      max: 20, // Máximo 20 notificações por segundo
      duration: 1000,
    },
    defaultJobOptions: {
      attempts: 3, // Retry até 3 vezes
      backoff: {
        type: 'exponential' as const,
        delay: 1000, // 1s, 2s, 4s
      },
      removeOnComplete: 50, // Manter últimos 50 jobs completados
      removeOnFail: false, // Manter falhas para retry manual
      timeout: 15000, // 15 segundos timeout
    },
    settings: {
      lockDuration: 15000,
      maxStalledCount: 1,
      stalledInterval: 15000,
    },
  },
}));

// ========================================
// Configurações Críticas:
// - Exponential backoff: Previne sobrecarga em falhas
// - Rate limiting: Protege gateway de pagamento
// - DLQ (removeOnFail: false): Análise de falhas
// - Lock duration: Previne processamento duplicado
// ========================================
