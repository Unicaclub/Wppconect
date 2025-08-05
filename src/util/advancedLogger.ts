/*
 * Copyright 2025 Unicaclub
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 */

import winston from 'winston';
import path from 'path';
import fs from 'fs';
import { AnalyticsModel } from '../models/AutomationModels';

interface LogContext {
  userId?: string;
  sessionId?: string;
  automationId?: string;
  contactId?: string;
  messageId?: string;
  requestId?: string;
  operation?: string;
  duration?: number;
  errorCode?: string;
  metadata?: Record<string, any>;
}

interface PerformanceMetric {
  operation: string;
  duration: number;
  timestamp: Date;
  success: boolean;
  metadata?: Record<string, any>;
}

class AdvancedLogger {
  private logger: winston.Logger;
  private performanceMetrics: PerformanceMetric[] = [];
  private errorCounts: Map<string, number> = new Map();
  private logDirectory: string;

  constructor() {
    this.logDirectory = path.join(process.cwd(), 'logs');
    this.ensureLogDirectory();
    this.initializeLogger();
    this.startPerformanceMonitoring();
  }

  private ensureLogDirectory(): void {
    if (!fs.existsSync(this.logDirectory)) {
      fs.mkdirSync(this.logDirectory, { recursive: true });
    }
  }

  private initializeLogger(): void {
    // Custom format for structured logging
    const customFormat = winston.format.combine(
      winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss.SSS' }),
      winston.format.errors({ stack: true }),
      winston.format.json(),
      winston.format.prettyPrint()
    );

    // Console format for development
    const consoleFormat = winston.format.combine(
      winston.format.colorize(),
      winston.format.timestamp({ format: 'HH:mm:ss' }),
      winston.format.printf(({ timestamp, level, message, ...meta }) => {
        const metaStr = Object.keys(meta).length ? JSON.stringify(meta) : '';
        return `${timestamp} [${level}] ${message} ${metaStr}`;
      })
    );

    this.logger = winston.createLogger({
      level: process.env.LOG_LEVEL || 'info',
      format: customFormat,
      defaultMeta: {
        service: 'wppconnect-automation',
        version: process.env.npm_package_version || '1.0.0',
        environment: process.env.NODE_ENV || 'development'
      },
      transports: [
        // Console output
        new winston.transports.Console({
          format: process.env.NODE_ENV === 'production' ? customFormat : consoleFormat
        }),
        
        // General application logs
        new winston.transports.File({
          filename: path.join(this.logDirectory, 'application.log'),
          maxsize: 10 * 1024 * 1024, // 10MB
          maxFiles: 5,
          tailable: true
        }),

        // Error logs
        new winston.transports.File({
          filename: path.join(this.logDirectory, 'errors.log'),
          level: 'error',
          maxsize: 10 * 1024 * 1024,
          maxFiles: 10,
          tailable: true
        }),

        // Automation specific logs
        new winston.transports.File({
          filename: path.join(this.logDirectory, 'automation.log'),
          maxsize: 10 * 1024 * 1024,
          maxFiles: 5,
          tailable: true,
          format: winston.format.combine(
            winston.format.timestamp(),
            winston.format.json()
          )
        }),

        // Performance logs
        new winston.transports.File({
          filename: path.join(this.logDirectory, 'performance.log'),
          maxsize: 5 * 1024 * 1024,
          maxFiles: 3,
          tailable: true
        })
      ],

      // Handle uncaught exceptions
      exceptionHandlers: [
        new winston.transports.File({
          filename: path.join(this.logDirectory, 'exceptions.log')
        })
      ],

      // Handle unhandled promise rejections
      rejectionHandlers: [
        new winston.transports.File({
          filename: path.join(this.logDirectory, 'rejections.log')
        })
      ]
    });
  }

  // Structured logging methods
  info(message: string, context?: LogContext): void {
    this.logger.info(message, this.sanitizeContext(context));
  }

  warn(message: string, context?: LogContext): void {
    this.logger.warn(message, this.sanitizeContext(context));
  }

  error(message: string, error?: Error, context?: LogContext): void {
    const errorContext = {
      ...this.sanitizeContext(context),
      error: error ? {
        name: error.name,
        message: error.message,
        stack: error.stack
      } : undefined
    };

    this.logger.error(message, errorContext);
    
    // Track error counts
    const errorType = error?.name || 'UnknownError';
    this.errorCounts.set(errorType, (this.errorCounts.get(errorType) || 0) + 1);
  }

  debug(message: string, context?: LogContext): void {
    this.logger.debug(message, this.sanitizeContext(context));
  }

  // Automation specific logging
  automationStarted(automationId: string, contactId: string, context?: LogContext): void {
    this.info('Automation execution started', {
      ...context,
      automationId,
      contactId,
      operation: 'automation_start'
    });
  }

  automationCompleted(automationId: string, contactId: string, duration: number, context?: LogContext): void {
    this.info('Automation execution completed', {
      ...context,
      automationId,
      contactId,
      duration,
      operation: 'automation_complete'
    });

    this.recordPerformanceMetric('automation_execution', duration, true, {
      automationId,
      contactId
    });
  }

  automationFailed(automationId: string, contactId: string, error: Error, context?: LogContext): void {
    this.error('Automation execution failed', error, {
      ...context,
      automationId,
      contactId,
      operation: 'automation_failed'
    });
  }

  messageProcessed(messageId: string, direction: 'inbound' | 'outbound', duration: number, context?: LogContext): void {
    this.info('Message processed', {
      ...context,
      messageId,
      direction,
      duration,
      operation: 'message_process'
    });

    this.recordPerformanceMetric('message_processing', duration, true, {
      messageId,
      direction
    });
  }

  queueJobProcessed(jobId: string, jobType: string, duration: number, success: boolean, context?: LogContext): void {
    const message = success ? 'Queue job completed' : 'Queue job failed';
    const logMethod = success ? this.info.bind(this) : this.warn.bind(this);
    
    logMethod(message, {
      ...context,
      jobId,
      jobType,
      duration,
      operation: 'queue_job'
    });

    this.recordPerformanceMetric('queue_job_processing', duration, success, {
      jobId,
      jobType
    });
  }

  apiRequest(method: string, path: string, duration: number, statusCode: number, context?: LogContext): void {
    const level = statusCode >= 400 ? 'warn' : 'info';
    
    this.logger.log(level, 'API request processed', {
      ...this.sanitizeContext(context),
      method,
      path,
      statusCode,
      duration,
      operation: 'api_request'
    });

    this.recordPerformanceMetric('api_request', duration, statusCode < 400, {
      method,
      path,
      statusCode
    });
  }

  databaseOperation(operation: string, collection: string, duration: number, success: boolean, context?: LogContext): void {
    const message = `Database ${operation} ${success ? 'completed' : 'failed'}`;
    const logMethod = success ? this.debug.bind(this) : this.warn.bind(this);
    
    logMethod(message, {
      ...context,
      operation: 'database_operation',
      dbOperation: operation,
      collection,
      duration
    });

    this.recordPerformanceMetric('database_operation', duration, success, {
      operation,
      collection
    });
  }

  // Performance monitoring
  private recordPerformanceMetric(operation: string, duration: number, success: boolean, metadata?: Record<string, any>): void {
    const metric: PerformanceMetric = {
      operation,
      duration,
      timestamp: new Date(),
      success,
      metadata
    };

    this.performanceMetrics.push(metric);

    // Keep only last 1000 metrics in memory
    if (this.performanceMetrics.length > 1000) {
      this.performanceMetrics = this.performanceMetrics.slice(-1000);
    }

    // Log slow operations
    if (duration > 5000) { // 5 seconds
      this.warn('Slow operation detected', {
        operation,
        duration,
        metadata,
        operation: 'slow_operation'
      });
    }
  }

  // Performance analytics
  getPerformanceStats(): {
    averageResponseTime: number;
    slowOperations: number;
    errorRate: number;
    operationCounts: Record<string, number>;
    topErrors: Array<{ error: string; count: number }>;
  } {
    const recentMetrics = this.performanceMetrics.filter(
      m => Date.now() - m.timestamp.getTime() < 3600000 // Last hour
    );

    const totalDuration = recentMetrics.reduce((sum, m) => sum + m.duration, 0);
    const averageResponseTime = recentMetrics.length > 0 ? totalDuration / recentMetrics.length : 0;
    
    const slowOperations = recentMetrics.filter(m => m.duration > 5000).length;
    const failedOperations = recentMetrics.filter(m => !m.success).length;
    const errorRate = recentMetrics.length > 0 ? (failedOperations / recentMetrics.length) * 100 : 0;

    const operationCounts = recentMetrics.reduce((counts, m) => {
      counts[m.operation] = (counts[m.operation] || 0) + 1;
      return counts;
    }, {} as Record<string, number>);

    const topErrors = Array.from(this.errorCounts.entries())
      .sort(([,a], [,b]) => b - a)
      .slice(0, 10)
      .map(([error, count]) => ({ error, count }));

    return {
      averageResponseTime,
      slowOperations,
      errorRate,
      operationCounts,
      topErrors
    };
  }

  // Log rotation and cleanup
  async cleanupLogs(): Promise<void> {
    try {
      const logFiles = fs.readdirSync(this.logDirectory);
      const now = Date.now();
      const maxAge = 30 * 24 * 60 * 60 * 1000; // 30 days

      for (const file of logFiles) {
        const filePath = path.join(this.logDirectory, file);
        const stats = fs.statSync(filePath);
        
        if (now - stats.mtime.getTime() > maxAge) {
          fs.unlinkSync(filePath);
          this.info('Log file cleaned up', { 
            operation: 'log_cleanup',
            file: file 
          });
        }
      }
    } catch (error) {
      this.error('Log cleanup failed', error as Error);
    }
  }

  // System health check
  async healthCheck(): Promise<{
    status: 'healthy' | 'degraded' | 'unhealthy';
    metrics: Record<string, any>;
    issues: string[];
  }> {
    const issues: string[] = [];
    const metrics = this.getPerformanceStats();
    
    // Check error rate
    if (metrics.errorRate > 10) {
      issues.push(`High error rate: ${metrics.errorRate.toFixed(2)}%`);
    }

    // Check average response time
    if (metrics.averageResponseTime > 2000) {
      issues.push(`Slow response time: ${metrics.averageResponseTime.toFixed(0)}ms`);
    }

    // Check disk space for logs
    try {
      const stats = fs.statSync(this.logDirectory);
      // Simple check - in production, use actual disk space checking
      if (stats.size > 100 * 1024 * 1024) { // 100MB
        issues.push('Log directory size is large');
      }
    } catch (error) {
      issues.push('Cannot access log directory');
    }

    let status: 'healthy' | 'degraded' | 'unhealthy' = 'healthy';
    if (issues.length > 0) {
      status = issues.length > 2 ? 'unhealthy' : 'degraded';
    }

    return {
      status,
      metrics,
      issues
    };
  }

  private sanitizeContext(context?: LogContext): LogContext {
    if (!context) return {};
    
    // Remove sensitive information
    const sanitized = { ...context };
    
    // Remove or mask sensitive fields
    if (sanitized.metadata) {
      const { password, token, secret, ...safeMeta } = sanitized.metadata;
      sanitized.metadata = safeMeta;
    }

    return sanitized;
  }

  private startPerformanceMonitoring(): void {
    // Clear old metrics every hour
    setInterval(() => {
      const oneHourAgo = Date.now() - 3600000;
      this.performanceMetrics = this.performanceMetrics.filter(
        m => m.timestamp.getTime() > oneHourAgo
      );
      
      // Reset error counts periodically
      this.errorCounts.clear();
    }, 3600000);

    // Log performance summary every 10 minutes
    setInterval(() => {
      const stats = this.getPerformanceStats();
      this.info('Performance summary', {
        operation: 'performance_summary',
        metadata: stats
      });
    }, 600000);

    // Cleanup old logs daily
    setInterval(() => {
      this.cleanupLogs();
    }, 24 * 60 * 60 * 1000);
  }

  // Save performance metrics to database
  async saveMetricsToDatabase(): Promise<void> {
    try {
      const stats = this.getPerformanceStats();
      
      await AnalyticsModel.create({
        userId: 'system',
        entityType: 'system',
        entityId: 'performance',
        metric: 'system_performance',
        value: stats.averageResponseTime,
        metadata: {
          errorRate: stats.errorRate,
          slowOperations: stats.slowOperations,
          operationCounts: stats.operationCounts,
          topErrors: stats.topErrors
        },
        timestamp: new Date()
      });

    } catch (error) {
      this.error('Failed to save metrics to database', error as Error);
    }
  }
}

export const advancedLogger = new AdvancedLogger();

// Middleware for request logging
export const requestLoggingMiddleware = (req: any, res: any, next: any) => {
  const startTime = Date.now();
  const requestId = `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  
  req.requestId = requestId;
  req.startTime = startTime;

  // Log request start
  advancedLogger.debug('Request started', {
    requestId,
    operation: 'request_start',
    metadata: {
      method: req.method,
      path: req.path,
      userAgent: req.get('User-Agent'),
      ip: req.ip
    }
  });

  // Override res.end to log response
  const originalEnd = res.end;
  res.end = function(...args: any[]) {
    const duration = Date.now() - startTime;
    
    advancedLogger.apiRequest(
      req.method,
      req.path,
      duration,
      res.statusCode,
      {
        requestId,
        userId: req.body?.userId || req.params?.userId,
        sessionId: req.session || req.body?.sessionId
      }
    );

    originalEnd.apply(this, args);
  };

  next();
};