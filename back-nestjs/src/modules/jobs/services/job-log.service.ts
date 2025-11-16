// ========================================
// Arquivo: back-nestjs/src/modules/jobs/services/job-log.service.ts
// Status: 🆕 CRIAR
// Responsabilidade: Persistir histórico de processamento de jobs
// ========================================

import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '@/database/prisma/prisma.service';
import { JobStatus } from '@prisma/client';

/**
 * Serviço de Log de Jobs
 *
 * Responsável por persistir o histórico completo de processamento de jobs
 * no banco de dados para auditoria e troubleshooting.
 *
 * @example
 * const log = await this.jobLogService.createLog(job.id, 'payment-processing', 'process-payment', job.data);
 * // ... processar job
 * await this.jobLogService.updateLog(job.id, 'completed', result);
 */
@Injectable()
export class JobLogService {
  private readonly logger = new Logger(JobLogService.name);

  constructor(private readonly prisma: PrismaService) {}

  /**
   * Cria um novo log de job
   *
   * @param jobId - ID do job do Bull
   * @param queue - Nome da fila
   * @param jobType - Tipo/nome do processo
   * @param payload - Dados do job
   * @returns Log criado
   */
  async createLog(
    jobId: string,
    queue: string,
    jobType: string,
    payload: any,
  ) {
    try {
      return await this.prisma.jobLog.create({
        data: {
          jobId,
          queue,
          jobType,
          payload,
          status: 'pending',
          attempts: 0,
        },
      });
    } catch (error) {
      this.logger.error(
        `Error creating job log for job ${jobId}:`,
        error.message,
      );
      // Não lançar erro para não bloquear o processamento
      return null;
    }
  }

  /**
   * Atualiza o status de um job
   *
   * @param jobId - ID do job
   * @param status - Novo status
   * @param result - Resultado do processamento (opcional)
   * @param error - Mensagem de erro (opcional)
   * @param attempts - Número de tentativas (opcional)
   */
  async updateLog(
    jobId: string,
    status: JobStatus,
    result?: any,
    error?: string,
    attempts?: number,
  ) {
    try {
      const updateData: any = {
        status,
        updatedAt: new Date(),
      };

      if (result !== undefined) {
        updateData.result = result;
      }

      if (error) {
        updateData.error = error;
      }

      if (attempts !== undefined) {
        updateData.attempts = attempts;
      }

      if (status === 'completed' || status === 'failed') {
        updateData.processedAt = new Date();
      }

      return await this.prisma.jobLog.update({
        where: { jobId },
        data: updateData,
      });
    } catch (error) {
      this.logger.error(
        `Error updating job log for job ${jobId}:`,
        error.message,
      );
      return null;
    }
  }

  /**
   * Marca job como em processamento
   *
   * @param jobId - ID do job
   * @param attempts - Número da tentativa atual
   */
  async markAsProcessing(jobId: string, attempts: number) {
    return this.updateLog(jobId, 'processing', undefined, undefined, attempts);
  }

  /**
   * Marca job como em retry
   *
   * @param jobId - ID do job
   * @param attempts - Número de tentativas
   * @param error - Mensagem de erro que causou o retry
   */
  async markAsRetrying(jobId: string, attempts: number, error: string) {
    return this.updateLog(jobId, 'retrying', undefined, error, attempts);
  }

  /**
   * Busca histórico de jobs de um pedido
   *
   * @param orderId - ID do pedido
   * @returns Lista de logs relacionados ao pedido
   */
  async getJobHistory(orderId: string) {
    try {
      return await this.prisma.jobLog.findMany({
        where: {
          payload: {
            path: ['orderId'],
            equals: orderId,
          },
        },
        orderBy: {
          createdAt: 'desc',
        },
      });
    } catch (error) {
      this.logger.error(
        `Error fetching job history for order ${orderId}:`,
        error.message,
      );
      return [];
    }
  }

  /**
   * Busca logs de jobs falhados
   *
   * @param queue - Nome da fila (opcional)
   * @param limit - Limite de registros (padrão: 100)
   */
  async getFailedJobs(queue?: string, limit = 100) {
    try {
      return await this.prisma.jobLog.findMany({
        where: {
          status: 'failed',
          ...(queue && { queue }),
        },
        orderBy: {
          createdAt: 'desc',
        },
        take: limit,
      });
    } catch (error) {
      this.logger.error('Error fetching failed jobs:', error.message);
      return [];
    }
  }

  /**
   * Busca estatísticas de processamento
   *
   * @param queue - Nome da fila (opcional)
   */
  async getStats(queue?: string) {
    try {
      const whereClause = queue ? { queue } : {};

      const [total, completed, failed, pending, processing, retrying] =
        await Promise.all([
          this.prisma.jobLog.count({ where: whereClause }),
          this.prisma.jobLog.count({
            where: { ...whereClause, status: 'completed' },
          }),
          this.prisma.jobLog.count({
            where: { ...whereClause, status: 'failed' },
          }),
          this.prisma.jobLog.count({
            where: { ...whereClause, status: 'pending' },
          }),
          this.prisma.jobLog.count({
            where: { ...whereClause, status: 'processing' },
          }),
          this.prisma.jobLog.count({
            where: { ...whereClause, status: 'retrying' },
          }),
        ]);

      const successRate =
        total > 0 ? ((completed / total) * 100).toFixed(2) : '0.00';

      return {
        total,
        completed,
        failed,
        pending,
        processing,
        retrying,
        successRate: `${successRate}%`,
      };
    } catch (error) {
      this.logger.error('Error fetching job stats:', error.message);
      return {
        total: 0,
        completed: 0,
        failed: 0,
        pending: 0,
        processing: 0,
        retrying: 0,
        successRate: '0.00%',
      };
    }
  }

  /**
   * Busca um log específico pelo jobId
   *
   * @param jobId - ID do job
   */
  async findByJobId(jobId: string) {
    try {
      return await this.prisma.jobLog.findUnique({
        where: { jobId },
      });
    } catch (error) {
      this.logger.error(
        `Error finding job log for job ${jobId}:`,
        error.message,
      );
      return null;
    }
  }

  /**
   * Limpa logs antigos (para manutenção)
   *
   * @param daysOld - Dias de idade para limpeza (padrão: 30)
   * @param keepFailed - Manter logs de falhas (padrão: true)
   */
  async cleanOldLogs(daysOld = 30, keepFailed = true) {
    try {
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - daysOld);

      const whereClause: any = {
        createdAt: { lt: cutoffDate },
      };

      if (keepFailed) {
        whereClause.status = { not: 'failed' };
      }

      const result = await this.prisma.jobLog.deleteMany({
        where: whereClause,
      });

      this.logger.log(
        `Cleaned ${result.count} old job logs (older than ${daysOld} days)`,
      );

      return result.count;
    } catch (error) {
      this.logger.error('Error cleaning old job logs:', error.message);
      return 0;
    }
  }
}

// ========================================
// Configurações Críticas:
// - Logs não bloqueiam processamento: Erros são apenas logados
// - Índices otimizados: Busca por orderId, queue+status, jobType
// - Cleanup automático: Método para limpar logs antigos
// - Estatísticas: Taxa de sucesso e distribuição de status
// ========================================

// ========================================
// Cenários de Falha Cobertos:
// - Erro ao criar log: Não bloqueia job
// - Erro ao atualizar: Apenas loga o problema
// - Busca de histórico falha: Retorna array vazio
// - Stats com erro: Retorna valores zerados
// ========================================
