// ========================================
// Arquivo: back-nestjs/src/modules/jobs/services/idempotency.service.ts
// Status: 🆕 CRIAR
// Responsabilidade: Garantir idempotência no processamento de jobs
// ========================================

import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Redis from 'ioredis';

/**
 * Serviço de Idempotência
 *
 * Garante que jobs não sejam processados múltiplas vezes usando Redis como cache.
 * Utiliza TTL de 7 dias para limpeza automática de chaves antigas.
 *
 * @example
 * const key = this.idempotencyService.generateKey(orderId, 'payment');
 * const alreadyProcessed = await this.idempotencyService.checkJobProcessed(key);
 * if (alreadyProcessed) return alreadyProcessed;
 *
 * // Processar job...
 * await this.idempotencyService.markJobAsProcessed(key, result);
 */
@Injectable()
export class IdempotencyService {
  private readonly logger = new Logger(IdempotencyService.name);
  private readonly redis: Redis;
  private readonly TTL_SECONDS = 7 * 24 * 60 * 60; // 7 dias

  constructor(private readonly configService: ConfigService) {
    this.redis = new Redis({
      host: this.configService.get('redis.host'),
      port: this.configService.get('redis.port'),
      password: this.configService.get('redis.password'),
      db: this.configService.get('redis.db'),
      maxRetriesPerRequest: 3,
      enableOfflineQueue: true,
      retryStrategy: (times: number) => Math.min(times * 50, 2000),
    });

    this.redis.on('connect', () => {
      this.logger.log('Redis connected for idempotency service');
    });

    this.redis.on('error', (error) => {
      this.logger.error('Redis connection error:', error);
    });
  }

  /**
   * Gera chave única para idempotência
   *
   * @param orderId - ID do pedido
   * @param jobType - Tipo do job (ex: 'payment', 'notification:order_created')
   * @returns Chave no formato: idempotency:{orderId}:{jobType}
   */
  generateKey(orderId: string, jobType: string): string {
    return `idempotency:${orderId}:${jobType}`;
  }

  /**
   * Verifica se um job já foi processado
   *
   * @param key - Chave de idempotência
   * @returns Resultado do processamento anterior ou null se não processado
   */
  async checkJobProcessed(key: string): Promise<any | null> {
    try {
      const result = await this.redis.get(key);

      if (result) {
        this.logger.warn(`Job already processed: ${key}`);
        return JSON.parse(result);
      }

      return null;
    } catch (error) {
      this.logger.error(`Error checking idempotency for key ${key}:`, error);
      // Em caso de erro no Redis, permitir processamento
      // (fail open para evitar bloqueio total)
      return null;
    }
  }

  /**
   * Marca um job como processado e armazena o resultado
   *
   * @param key - Chave de idempotência
   * @param result - Resultado do processamento (será serializado em JSON)
   */
  async markJobAsProcessed(key: string, result: any): Promise<void> {
    try {
      const serialized = JSON.stringify({
        result,
        processedAt: new Date().toISOString(),
      });

      await this.redis.setex(key, this.TTL_SECONDS, serialized);

      this.logger.debug(`Job marked as processed: ${key}`);
    } catch (error) {
      this.logger.error(`Error marking job as processed for key ${key}:`, error);
      // Não lançar erro para não bloquear o fluxo
    }
  }

  /**
   * Remove uma chave de idempotência (útil para retry manual)
   *
   * @param key - Chave de idempotência
   */
  async removeKey(key: string): Promise<void> {
    try {
      await this.redis.del(key);
      this.logger.debug(`Idempotency key removed: ${key}`);
    } catch (error) {
      this.logger.error(`Error removing idempotency key ${key}:`, error);
    }
  }

  /**
   * Obtém estatísticas de uso da idempotência
   */
  async getStats(): Promise<{ totalKeys: number; memoryUsed: string }> {
    try {
      const keys = await this.redis.keys('idempotency:*');
      const info = await this.redis.info('memory');
      const memoryMatch = info.match(/used_memory_human:(.+)/);

      return {
        totalKeys: keys.length,
        memoryUsed: memoryMatch ? memoryMatch[1].trim() : 'unknown',
      };
    } catch (error) {
      this.logger.error('Error getting idempotency stats:', error);
      return { totalKeys: 0, memoryUsed: 'unknown' };
    }
  }

  /**
   * Cleanup - desconectar Redis ao destruir serviço
   */
  async onModuleDestroy() {
    await this.redis.quit();
  }
}

// ========================================
// Configurações Críticas:
// - TTL de 7 dias: Balanceia entre segurança e uso de memória
// - Fail open: Em caso de erro Redis, permite processamento
// - Serialização JSON: Armazena resultado completo para cache
// - Logging estruturado: Rastreabilidade completa
// ========================================

// ========================================
// Cenários de Falha Cobertos:
// - Redis indisponível: Fail open (permite processamento)
// - Timeout: Retry automático com backoff
// - Chave expirada: Retorna null (reprocessa)
// - Serialização inválida: Log error e retorna null
// ========================================
