/*
 * Copyright 2025 Unicaclub
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 */

import { Request, Response } from 'express';
import { advancedLogger } from '../util/advancedLogger';
import { queueService } from '../services/QueueService';
import { isMongoConnected } from '../util/db/mongodb/connection';
import { 
  AutomationModel, 
  ContactModel, 
  ConversationMessageModel,
  QueueJobModel,
  AnalyticsModel 
} from '../models/AutomationModels';
import os from 'os';
import fs from 'fs';
import path from 'path';

interface SystemHealth {
  status: 'healthy' | 'degraded' | 'unhealthy';
  timestamp: Date;
  uptime: number;
  services: {
    database: 'connected' | 'disconnected' | 'error';
    queue: 'active' | 'inactive' | 'error';
    automation: 'enabled' | 'disabled';
    logging: 'active' | 'error';
  };
  performance: {
    averageResponseTime: number;
    errorRate: number;
    slowOperations: number;
    memoryUsage: number;
    cpuUsage: number;
  };
  resources: {
    memory: {
      total: number;
      used: number;
      free: number;
      percentage: number;
    };
    disk: {
      total: number;
      used: number;
      free: number;
      percentage: number;
    };
    cpu: {
      cores: number;
      load: number[];
      usage: number;
    };
  };
  issues: string[];
}

interface RealTimeMetrics {
  activeAutomations: number;
  queueJobs: {
    pending: number;
    processing: number;
    completed: number;
    failed: number;
  };
  messages: {
    lastHour: number;
    lastDay: number;
    successRate: number;
  };
  contacts: {
    total: number;
    active: number;
    newToday: number;
  };
  performance: {
    averageResponseTime: number;
    errorRate: number;
    throughput: number;
  };
}

export const getSystemHealth = async (req: Request, res: Response) => {
  try {
    const health = await generateSystemHealth();
    
    res.json({
      status: 'success',
      data: health
    });
  } catch (error) {
    advancedLogger.error('Failed to get system health', error as Error, {
      operation: 'system_health_check'
    });
    
    res.status(500).json({
      status: 'error',
      message: 'Failed to retrieve system health'
    });
  }
};

export const getRealTimeMetrics = async (req: Request, res: Response) => {
  try {
    const metrics = await generateRealTimeMetrics();
    
    res.json({
      status: 'success',
      data: metrics
    });
  } catch (error) {
    advancedLogger.error('Failed to get real-time metrics', error as Error, {
      operation: 'realtime_metrics'
    });
    
    res.status(500).json({
      status: 'error',
      message: 'Failed to retrieve real-time metrics'
    });
  }
};

export const getPerformanceStats = async (req: Request, res: Response) => {
  try {
    const stats = advancedLogger.getPerformanceStats();
    
    res.json({
      status: 'success',
      data: stats
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: 'Failed to retrieve performance stats'
    });
  }
};

export const getSystemLogs = async (req: Request, res: Response) => {
  try {
    const { level = 'info', limit = 100, offset = 0 } = req.query;
    
    const logFile = path.join(process.cwd(), 'logs', 'application.log');
    
    if (!fs.existsSync(logFile)) {
      return res.json({
        status: 'success',
        data: {
          logs: [],
          total: 0
        }
      });
    }

    // Read log file (in production, use proper log aggregation)
    const logContent = fs.readFileSync(logFile, 'utf-8');
    const logLines = logContent.split('\n')
      .filter(line => line.trim())
      .map(line => {
        try {
          return JSON.parse(line);
        } catch {
          return { message: line, level: 'info', timestamp: new Date() };
        }
      })
      .filter(log => level === 'all' || log.level === level)
      .reverse()
      .slice(Number(offset), Number(offset) + Number(limit));

    res.json({
      status: 'success',
      data: {
        logs: logLines,
        total: logLines.length
      }
    });
  } catch (error) {
    advancedLogger.error('Failed to get system logs', error as Error, {
      operation: 'get_system_logs'
    });
    
    res.status(500).json({
      status: 'error',
      message: 'Failed to retrieve system logs'
    });
  }
};

export const getAutomationStats = async (req: Request, res: Response) => {
  try {
    const { period = '24h' } = req.query;
    
    const periodStart = getPeriodStart(period as string);
    
    const [
      totalAutomations,
      activeAutomations,
      recentExecutions,
      successfulExecutions,
      topAutomations
    ] = await Promise.all([
      AutomationModel.countDocuments({}),
      AutomationModel.countDocuments({ isActive: true }),
      AnalyticsModel.countDocuments({
        entityType: 'automation',
        metric: 'execution',
        timestamp: { $gte: periodStart }
      }),
      AnalyticsModel.countDocuments({
        entityType: 'automation',
        metric: 'execution_success',
        timestamp: { $gte: periodStart }
      }),
      AnalyticsModel.aggregate([
        {
          $match: {
            entityType: 'automation',
            metric: 'execution',
            timestamp: { $gte: periodStart }
          }
        },
        {
          $group: {
            _id: '$entityId',
            executions: { $sum: 1 }
          }
        },
        { $sort: { executions: -1 } },
        { $limit: 10 }
      ])
    ]);

    const successRate = recentExecutions > 0 ? (successfulExecutions / recentExecutions) * 100 : 0;

    res.json({
      status: 'success',
      data: {
        totalAutomations,
        activeAutomations,
        recentExecutions,
        successRate,
        topAutomations
      }
    });
  } catch (error) {
    advancedLogger.error('Failed to get automation stats', error as Error, {
      operation: 'automation_stats'
    });
    
    res.status(500).json({
      status: 'error',
      message: 'Failed to retrieve automation statistics'
    });
  }
};

export const getQueueMonitoring = async (req: Request, res: Response) => {
  try {
    const [queueStats, recentJobs, failedJobs] = await Promise.all([
      queueService.getQueueStats(),
      QueueJobModel.find({})
        .sort({ createdAt: -1 })
        .limit(50)
        .lean(),
      QueueJobModel.find({ status: 'failed' })
        .sort({ updatedAt: -1 })
        .limit(20)
        .lean()
    ]);

    const avgProcessingTime = await QueueJobModel.aggregate([
      {
        $match: {
          status: 'completed',
          updatedAt: { $gte: new Date(Date.now() - 24 * 60 * 60 * 1000) }
        }
      },
      {
        $addFields: {
          processingTime: { $subtract: ['$updatedAt', '$createdAt'] }
        }
      },
      {
        $group: {
          _id: null,
          avgTime: { $avg: '$processingTime' }
        }
      }
    ]);

    res.json({
      status: 'success',
      data: {
        queueStats,
        recentJobs,
        failedJobs,
        averageProcessingTime: avgProcessingTime[0]?.avgTime || 0
      }
    });
  } catch (error) {
    advancedLogger.error('Failed to get queue monitoring', error as Error, {
      operation: 'queue_monitoring'
    });
    
    res.status(500).json({
      status: 'error',
      message: 'Failed to retrieve queue monitoring data'
    });
  }
};

export const restartService = async (req: Request, res: Response) => {
  try {
    const { service } = req.params;
    
    advancedLogger.info('Service restart requested', {
      operation: 'service_restart',
      metadata: { service, requestedBy: req.ip }
    });

    switch (service) {
      case 'queue':
        // Restart queue service logic
        res.json({
          status: 'success',
          message: 'Queue service restart initiated'
        });
        break;
        
      case 'automation':
        // Restart automation engine logic
        res.json({
          status: 'success',
          message: 'Automation engine restart initiated'
        });
        break;
        
      default:
        res.status(400).json({
          status: 'error',
          message: 'Invalid service name'
        });
    }
  } catch (error) {
    advancedLogger.error('Failed to restart service', error as Error, {
      operation: 'service_restart',
      metadata: { service: req.params.service }
    });
    
    res.status(500).json({
      status: 'error',
      message: 'Failed to restart service'
    });
  }
};

export const clearLogs = async (req: Request, res: Response) => {
  try {
    await advancedLogger.cleanupLogs();
    
    advancedLogger.info('Logs cleared manually', {
      operation: 'logs_cleanup',
      metadata: { requestedBy: req.ip }
    });
    
    res.json({
      status: 'success',
      message: 'Logs cleared successfully'
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: 'Failed to clear logs'
    });
  }
};

async function generateSystemHealth(): Promise<SystemHealth> {
  const issues: string[] = [];
  
  // Check services
  const services = {
    database: isMongoConnected() ? 'connected' : 'disconnected',
    queue: 'active', // Queue service is always active in our implementation
    automation: isMongoConnected() ? 'enabled' : 'disabled',
    logging: 'active'
  } as const;

  if (!isMongoConnected()) {
    issues.push('MongoDB connection is not available');
  }

  // Get performance stats
  const perfStats = advancedLogger.getPerformanceStats();
  
  if (perfStats.errorRate > 5) {
    issues.push(`High error rate: ${perfStats.errorRate.toFixed(2)}%`);
  }
  
  if (perfStats.averageResponseTime > 2000) {
    issues.push(`Slow response time: ${perfStats.averageResponseTime.toFixed(0)}ms`);
  }

  // Get system resources
  const memUsage = process.memoryUsage();
  const totalMem = os.totalmem();
  const freeMem = os.freemem();
  const usedMem = totalMem - freeMem;
  
  const resources = {
    memory: {
      total: totalMem,
      used: usedMem,
      free: freeMem,
      percentage: (usedMem / totalMem) * 100
    },
    disk: {
      total: 0, // Would need disk space checking library
      used: 0,
      free: 0,
      percentage: 0
    },
    cpu: {
      cores: os.cpus().length,
      load: os.loadavg(),
      usage: 0 // Would need CPU usage calculation
    }
  };

  if (resources.memory.percentage > 90) {
    issues.push('High memory usage');
  }

  // Determine overall status
  let status: 'healthy' | 'degraded' | 'unhealthy' = 'healthy';
  if (issues.length > 0) {
    status = issues.length > 2 ? 'unhealthy' : 'degraded';
  }

  return {
    status,
    timestamp: new Date(),
    uptime: process.uptime(),
    services,
    performance: {
      averageResponseTime: perfStats.averageResponseTime,
      errorRate: perfStats.errorRate,
      slowOperations: perfStats.slowOperations,
      memoryUsage: memUsage.heapUsed / 1024 / 1024, // MB
      cpuUsage: 0 // Would calculate actual CPU usage
    },
    resources,
    issues
  };
}

async function generateRealTimeMetrics(): Promise<RealTimeMetrics> {
  const now = new Date();
  const hourAgo = new Date(now.getTime() - 60 * 60 * 1000);
  const dayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());

  const [
    activeAutomations,
    queueStats,
    messagesLastHour,
    messagesLastDay,
    totalContacts,
    activeContacts,
    newContactsToday
  ] = await Promise.all([
    AutomationModel.countDocuments({ isActive: true }),
    queueService.getQueueStats(),
    ConversationMessageModel.countDocuments({
      timestamp: { $gte: hourAgo },
      direction: 'outbound'
    }),
    ConversationMessageModel.countDocuments({
      timestamp: { $gte: dayAgo },
      direction: 'outbound'
    }),
    ContactModel.countDocuments({}),
    ContactModel.countDocuments({
      lastInteraction: { $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) }
    }),
    ContactModel.countDocuments({
      createdAt: { $gte: todayStart }
    })
  ]);

  const perfStats = advancedLogger.getPerformanceStats();

  return {
    activeAutomations,
    queueJobs: queueStats,
    messages: {
      lastHour: messagesLastHour,
      lastDay: messagesLastDay,
      successRate: 100 - perfStats.errorRate
    },
    contacts: {
      total: totalContacts,
      active: activeContacts,
      newToday: newContactsToday
    },
    performance: {
      averageResponseTime: perfStats.averageResponseTime,
      errorRate: perfStats.errorRate,
      throughput: messagesLastHour // messages per hour
    }
  };
}

function getPeriodStart(period: string): Date {
  const now = new Date();
  
  switch (period) {
    case '1h':
      return new Date(now.getTime() - 60 * 60 * 1000);
    case '24h':
      return new Date(now.getTime() - 24 * 60 * 60 * 1000);
    case '7d':
      return new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    case '30d':
      return new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    default:
      return new Date(now.getTime() - 24 * 60 * 60 * 1000);
  }
}