/*
 * Copyright 2025 Unicaclub
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 */

import { QueueJobModel } from '../models/AutomationModels';
import { QueueJob } from '../types/AutomationTypes';
import { logger } from '../index';
import { EventEmitter } from 'events';

export class QueueService extends EventEmitter {
  private isProcessing = false;
  private processingInterval: NodeJS.Timeout | null = null;
  private readonly processIntervalMs = 5000; // 5 segundos

  constructor() {
    super();
    this.startProcessing();
  }

  async addJob(
    type: QueueJob['type'],
    data: Record<string, any>,
    options: {
      priority?: number;
      delay?: number;
      maxAttempts?: number;
      scheduledFor?: Date;
    } = {}
  ): Promise<string> {
    try {
      const job = new QueueJobModel({
        type,
        data,
        priority: options.priority || 0,
        maxAttempts: options.maxAttempts || 3,
        scheduledFor: options.scheduledFor || new Date(Date.now() + (options.delay || 0))
      });

      await job.save();
      logger.info(`Queue job added: ${job._id}, type: ${type}, scheduled for: ${job.scheduledFor}`);
      
      return job._id.toString();
    } catch (error) {
      logger.error('Error adding job to queue:', error);
      throw error;
    }
  }

  async scheduleDelayedJob(
    type: QueueJob['type'],
    data: Record<string, any>,
    delayMs: number,
    options: {
      priority?: number;
      maxAttempts?: number;
    } = {}
  ): Promise<string> {
    const scheduledFor = new Date(Date.now() + delayMs);
    return this.addJob(type, data, { ...options, scheduledFor });
  }

  async cancelJob(jobId: string): Promise<boolean> {
    try {
      const result = await QueueJobModel.updateOne(
        { _id: jobId, status: { $in: ['pending', 'processing'] } },
        { status: 'cancelled', updatedAt: new Date() }
      );

      return result.modifiedCount > 0;
    } catch (error) {
      logger.error('Error cancelling job:', error);
      return false;
    }
  }

  async getJobStatus(jobId: string): Promise<QueueJob | null> {
    try {
      return await QueueJobModel.findById(jobId).lean();
    } catch (error) {
      logger.error('Error getting job status:', error);
      return null;
    }
  }

  async retryFailedJob(jobId: string): Promise<boolean> {
    try {
      const job = await QueueJobModel.findById(jobId);
      if (!job || job.status !== 'failed') {
        return false;
      }

      job.status = 'pending';
      job.attempts = 0;
      job.error = undefined;
      job.scheduledFor = new Date();
      job.updatedAt = new Date();

      await job.save();
      return true;
    } catch (error) {
      logger.error('Error retrying job:', error);
      return false;
    }
  }

  private startProcessing(): void {
    if (this.processingInterval) {
      clearInterval(this.processingInterval);
    }

    this.processingInterval = setInterval(() => {
      if (!this.isProcessing) {
        this.processJobs();
      }
    }, this.processIntervalMs);

    logger.info('Queue service started');
  }

  private async processJobs(): Promise<void> {
    this.isProcessing = true;

    try {
      // Buscar jobs pendentes ordenados por prioridade e data de agendamento
      const jobs = await QueueJobModel.find({
        status: 'pending',
        scheduledFor: { $lte: new Date() }
      })
      .sort({ priority: -1, scheduledFor: 1 })
      .limit(10)
      .lean();

      if (jobs.length === 0) {
        this.isProcessing = false;
        return;
      }

      logger.info(`Processing ${jobs.length} queue jobs`);

      // Processar jobs em paralelo (limitado)
      const processingPromises = jobs.map(job => this.processJob(job));
      await Promise.allSettled(processingPromises);

    } catch (error) {
      logger.error('Error processing queue jobs:', error);
    } finally {
      this.isProcessing = false;
    }
  }

  private async processJob(job: QueueJob & { _id: any }): Promise<void> {
    try {
      // Marcar job como processando
      await QueueJobModel.updateOne(
        { _id: job._id },
        { 
          status: 'processing',
          updatedAt: new Date()
        }
      );

      logger.info(`Processing job ${job._id} of type ${job.type}`);

      // Processar baseado no tipo
      let success = false;
      
      switch (job.type) {
        case 'automation':
          success = await this.processAutomationJob(job);
          break;
        case 'campaign':
          success = await this.processCampaignJob(job);
          break;
        case 'message':
          success = await this.processMessageJob(job);
          break;
        case 'webhook':
          success = await this.processWebhookJob(job);
          break;
        default:
          logger.warn(`Unknown job type: ${job.type}`);
          success = false;
      }

      if (success) {
        await QueueJobModel.updateOne(
          { _id: job._id },
          { 
            status: 'completed',
            updatedAt: new Date()
          }
        );
        this.emit('jobCompleted', job);
        logger.info(`Job ${job._id} completed successfully`);
      } else {
        throw new Error('Job processing failed');
      }

    } catch (error) {
      await this.handleJobError(job, error as Error);
    }
  }

  private async handleJobError(job: QueueJob & { _id: any }, error: Error): Promise<void> {
    const attempts = job.attempts + 1;
    
    if (attempts >= job.maxAttempts) {
      // Job falhou definitivamente
      await QueueJobModel.updateOne(
        { _id: job._id },
        { 
          status: 'failed',
          attempts,
          error: error.message,
          updatedAt: new Date()
        }
      );
      this.emit('jobFailed', job, error);
      logger.error(`Job ${job._id} failed permanently:`, error);
    } else {
      // Reagendar para nova tentativa
      const nextAttemptDelay = Math.pow(2, attempts) * 60000; // Backoff exponencial
      const scheduledFor = new Date(Date.now() + nextAttemptDelay);
      
      await QueueJobModel.updateOne(
        { _id: job._id },
        { 
          status: 'pending',
          attempts,
          scheduledFor,
          error: error.message,
          updatedAt: new Date()
        }
      );
      
      this.emit('jobRetry', job, attempts);
      logger.warn(`Job ${job._id} failed, scheduling retry ${attempts}/${job.maxAttempts} for ${scheduledFor}`);
    }
  }

  private async processAutomationJob(job: QueueJob): Promise<boolean> {
    try {
      // Emitir evento para que o AutomationEngine processe
      this.emit('processAutomation', job.data);
      return true;
    } catch (error) {
      logger.error('Error processing automation job:', error);
      return false;
    }
  }

  private async processCampaignJob(job: QueueJob): Promise<boolean> {
    try {
      // Emitir evento para que o CampaignService processe
      this.emit('processCampaign', job.data);
      return true;
    } catch (error) {
      logger.error('Error processing campaign job:', error);
      return false;
    }
  }

  private async processMessageJob(job: QueueJob): Promise<boolean> {
    try {
      // Emitir evento para que o MessageService processe
      this.emit('processMessage', job.data);
      return true;
    } catch (error) {
      logger.error('Error processing message job:', error);
      return false;
    }
  }

  private async processWebhookJob(job: QueueJob): Promise<boolean> {
    try {
      const { url, method = 'POST', headers = {}, data } = job.data;
      
      const axios = require('axios');
      const response = await axios({
        method,
        url,
        headers: {
          'Content-Type': 'application/json',
          ...headers
        },
        data,
        timeout: 30000
      });

      if (response.status >= 200 && response.status < 300) {
        return true;
      } else {
        throw new Error(`Webhook returned status ${response.status}`);
      }
    } catch (error) {
      logger.error('Error processing webhook job:', error);
      return false;
    }
  }

  async getQueueStats(): Promise<{
    pending: number;
    processing: number;
    completed: number;
    failed: number;
  }> {
    try {
      const stats = await QueueJobModel.aggregate([
        {
          $group: {
            _id: '$status',
            count: { $sum: 1 }
          }
        }
      ]);

      const result = {
        pending: 0,
        processing: 0,
        completed: 0,
        failed: 0
      };

      stats.forEach(stat => {
        if (stat._id in result) {
          result[stat._id as keyof typeof result] = stat.count;
        }
      });

      return result;
    } catch (error) {
      logger.error('Error getting queue stats:', error);
      return { pending: 0, processing: 0, completed: 0, failed: 0 };
    }
  }

  async clearCompletedJobs(olderThanDays = 7): Promise<number> {
    try {
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - olderThanDays);

      const result = await QueueJobModel.deleteMany({
        status: 'completed',
        updatedAt: { $lt: cutoffDate }
      });

      logger.info(`Cleared ${result.deletedCount} completed jobs older than ${olderThanDays} days`);
      return result.deletedCount || 0;
    } catch (error) {
      logger.error('Error clearing completed jobs:', error);
      return 0;
    }
  }

  stop(): void {
    if (this.processingInterval) {
      clearInterval(this.processingInterval);
      this.processingInterval = null;
    }
    logger.info('Queue service stopped');
  }
}

export const queueService = new QueueService();