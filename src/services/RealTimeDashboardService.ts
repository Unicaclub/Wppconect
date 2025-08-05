/*
 * Copyright 2025 Unicaclub
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 */

import { Server as SocketIOServer } from 'socket.io';
import { Server as HTTPServer } from 'http';
import { advancedLogger } from '../util/advancedLogger';
import { automationExecutionMonitor } from './AutomationExecutionMonitor';
import { rateLimitingSystem } from '../middleware/rateLimitingSystem';
import { performanceOptimization } from '../middleware/performanceOptimizationMiddleware';
import { isMongoConnected } from '../util/db/mongodb/connection';
import {
  AutomationModel,
  ContactModel,
  ConversationMessageModel,
  QueueJobModel,
  AnalyticsModel
} from '../models/AutomationModels';

interface DashboardMetrics {
  timestamp: Date;
  system: {
    uptime: number;
    memoryUsage: NodeJS.MemoryUsage;
    cpuUsage: NodeJS.CpuUsage;
    activeConnections: number;
  };
  automation: {
    activeExecutions: number;
    completedToday: number;
    failedToday: number;
    averageExecutionTime: number;
    successRate: number;
  };
  database: {
    connected: boolean;
    totalAutomations: number;
    activeAutomations: number;
    totalContacts: number;
    messagesLastHour: number;
    pendingJobs: number;
  };
  performance: {
    averageResponseTime: number;
    errorRate: number;
    slowOperations: number;
    cacheHitRate: number;
  };
  rateLimiting: {
    totalRequests: number;
    blockedRequests: number;
    activeClients: number;
  };
}

interface UserDashboardData {
  userId: string;
  automations: {
    total: number;
    active: number;
    executionsToday: number;
    successRate: number;
  };
  contacts: {
    total: number;
    active: number;
    newToday: number;
  };
  messages: {
    sentToday: number;
    receivedToday: number;
    successRate: number;
  };
  recentActivity: Array<{
    type: 'automation_executed' | 'message_sent' | 'contact_added' | 'error_occurred';
    timestamp: Date;
    description: string;
    metadata?: Record<string, any>;
  }>;
}

class RealTimeDashboardService {
  private io: SocketIOServer | null = null;
  private connectedClients: Map<string, { socket: any; userId?: string; isAdmin: boolean }> = new Map();
  private metricsUpdateInterval: NodeJS.Timeout | null = null;
  private userDataUpdateInterval: NodeJS.Timeout | null = null;

  initialize(server: HTTPServer): void {
    this.io = new SocketIOServer(server, {
      cors: {
        origin: process.env.CORS_ORIGIN || "*",
        methods: ["GET", "POST"]
      },
      path: '/socket.io'
    });

    this.setupSocketHandlers();
    this.startMetricsUpdates();

    advancedLogger.info('Real-time dashboard service initialized', {
      operation: 'dashboard_service_init'
    });
  }

  private setupSocketHandlers(): void {
    if (!this.io) return;

    this.io.on('connection', (socket) => {
      const clientId = socket.id;
      
      advancedLogger.debug('Dashboard client connected', {
        operation: 'dashboard_client_connect',
        clientId,
        ip: socket.handshake.address
      });

      // Store client connection
      this.connectedClients.set(clientId, { socket, isAdmin: false });

      // Handle client authentication
      socket.on('authenticate', (data: { userId?: string; token?: string; isAdmin?: boolean }) => {
        try {
          // In a real implementation, you would validate the token
          const clientInfo = this.connectedClients.get(clientId);
          if (clientInfo) {
            clientInfo.userId = data.userId;
            clientInfo.isAdmin = data.isAdmin || false;
            
            // Join appropriate rooms
            if (data.userId) {
              socket.join(`user:${data.userId}`);
            }
            if (data.isAdmin) {
              socket.join('admin');
            }

            socket.emit('authenticated', { success: true });

            advancedLogger.info('Dashboard client authenticated', {
              operation: 'dashboard_client_auth',
              clientId,
              userId: data.userId,
              isAdmin: data.isAdmin
            });

            // Send initial dashboard data
            this.sendInitialData(socket, data.userId, data.isAdmin);
          }
        } catch (error) {
          socket.emit('authenticated', { success: false, error: 'Authentication failed' });
          
          advancedLogger.error('Dashboard client authentication failed', error as Error, {
            operation: 'dashboard_client_auth_failed',
            clientId
          });
        }
      });

      // Handle dashboard data requests
      socket.on('request_data', async (data: { type: 'system' | 'user' | 'automation'; params?: any }) => {
        try {
          const clientInfo = this.connectedClients.get(clientId);
          if (!clientInfo) return;

          switch (data.type) {
            case 'system':
              if (clientInfo.isAdmin) {
                const systemMetrics = await this.generateSystemMetrics();
                socket.emit('system_data', systemMetrics);
              }
              break;
              
            case 'user':
              if (clientInfo.userId) {
                const userData = await this.generateUserDashboardData(clientInfo.userId);
                socket.emit('user_data', userData);
              }
              break;
              
            case 'automation':
              if (data.params?.automationId && clientInfo.userId) {
                const automationData = await this.getAutomationRealTimeData(
                  data.params.automationId,
                  clientInfo.userId
                );
                socket.emit('automation_data', automationData);
              }
              break;
          }
        } catch (error) {
          advancedLogger.error('Failed to handle dashboard data request', error as Error, {
            operation: 'dashboard_data_request_failed',
            clientId,
            requestType: data.type
          });
          
          socket.emit('error', { message: 'Failed to retrieve data' });
        }
      });

      // Handle client disconnect
      socket.on('disconnect', () => {
        this.connectedClients.delete(clientId);
        
        advancedLogger.debug('Dashboard client disconnected', {
          operation: 'dashboard_client_disconnect',
          clientId
        });
      });
    });
  }

  private async sendInitialData(socket: any, userId?: string, isAdmin?: boolean): Promise<void> {
    try {
      if (isAdmin) {
        const systemMetrics = await this.generateSystemMetrics();
        socket.emit('initial_system_data', systemMetrics);
      }

      if (userId) {
        const userData = await this.generateUserDashboardData(userId);
        socket.emit('initial_user_data', userData);
      }
    } catch (error) {
      advancedLogger.error('Failed to send initial dashboard data', error as Error, {
        operation: 'send_initial_data_failed',
        userId,
        isAdmin
      });
    }
  }

  private startMetricsUpdates(): void {
    // Update system metrics every 5 seconds for admin users
    this.metricsUpdateInterval = setInterval(async () => {
      try {
        const systemMetrics = await this.generateSystemMetrics();
        this.io?.to('admin').emit('system_metrics_update', systemMetrics);
      } catch (error) {
        advancedLogger.error('Failed to update system metrics', error as Error, {
          operation: 'system_metrics_update_failed'
        });
      }
    }, 5000);

    // Update user dashboard data every 10 seconds
    this.userDataUpdateInterval = setInterval(async () => {
      try {
        for (const [clientId, clientInfo] of this.connectedClients.entries()) {
          if (clientInfo.userId) {
            const userData = await this.generateUserDashboardData(clientInfo.userId);
            clientInfo.socket.emit('user_data_update', userData);
          }
        }
      } catch (error) {
        advancedLogger.error('Failed to update user dashboard data', error as Error, {
          operation: 'user_data_update_failed'
        });
      }
    }, 10000);
  }

  // Public methods for broadcasting real-time events
  broadcastAutomationExecution(userId: string, automationId: string, contactId: string, event: 'started' | 'completed' | 'failed'): void {
    const eventData = {
      type: 'automation_execution',
      userId,
      automationId,
      contactId,
      event,
      timestamp: new Date()
    };

    // Send to user's dashboard
    this.io?.to(`user:${userId}`).emit('automation_event', eventData);
    
    // Send to admin dashboard
    this.io?.to('admin').emit('system_event', eventData);

    advancedLogger.debug('Automation execution event broadcasted', {
      operation: 'broadcast_automation_event',
      userId,
      automationId,
      event
    });
  }

  broadcastMessageEvent(userId: string, messageType: 'sent' | 'received' | 'failed', messageData: any): void {
    const eventData = {
      type: 'message_event',
      userId,
      messageType,
      timestamp: new Date(),
      data: messageData
    };

    // Send to user's dashboard
    this.io?.to(`user:${userId}`).emit('message_event', eventData);
    
    // Send to admin dashboard (summary only)
    this.io?.to('admin').emit('system_event', {
      type: 'message_event',
      userId,
      messageType,
      timestamp: new Date()
    });
  }

  broadcastContactEvent(userId: string, contactId: string, event: 'added' | 'updated' | 'segmented'): void {
    const eventData = {
      type: 'contact_event',
      userId,
      contactId,
      event,
      timestamp: new Date()
    };

    // Send to user's dashboard
    this.io?.to(`user:${userId}`).emit('contact_event', eventData);
  }

  broadcastSystemAlert(alert: {
    level: 'info' | 'warning' | 'error';
    title: string;
    message: string;
    metadata?: Record<string, any>;
  }): void {
    const alertData = {
      ...alert,
      timestamp: new Date()
    };

    // Send to all admin clients
    this.io?.to('admin').emit('system_alert', alertData);

    advancedLogger.info('System alert broadcasted', {
      operation: 'broadcast_system_alert',
      level: alert.level,
      title: alert.title
    });
  }

  // Private helper methods
  private async generateSystemMetrics(): Promise<DashboardMetrics> {
    const executionStats = await automationExecutionMonitor.getRealTimeStats();
    const performanceStats = advancedLogger.getPerformanceStats();
    const rateLimitStats = rateLimitingSystem.getStats();
    const cacheStats = performanceOptimization.getCacheStats();

    const [
      totalAutomations,
      activeAutomations,
      totalContacts,
      messagesLastHour,
      pendingJobs
    ] = await Promise.all([
      isMongoConnected() ? AutomationModel.countDocuments({}) : 0,
      isMongoConnected() ? AutomationModel.countDocuments({ isActive: true }) : 0,
      isMongoConnected() ? ContactModel.countDocuments({}) : 0,
      isMongoConnected() ? ConversationMessageModel.countDocuments({
        timestamp: { $gte: new Date(Date.now() - 60 * 60 * 1000) }
      }) : 0,
      isMongoConnected() ? QueueJobModel.countDocuments({ status: 'pending' }) : 0
    ]);

    const rateLimitSummary = rateLimitStats.reduce(
      (acc, stat) => ({
        totalRequests: acc.totalRequests + stat.totalRequests,
        blockedRequests: acc.blockedRequests + stat.blockedRequests,
        activeClients: acc.activeClients + stat.activeKeys
      }),
      { totalRequests: 0, blockedRequests: 0, activeClients: 0 }
    );

    return {
      timestamp: new Date(),
      system: {
        uptime: process.uptime(),
        memoryUsage: process.memoryUsage(),
        cpuUsage: process.cpuUsage(),
        activeConnections: this.connectedClients.size
      },
      automation: {
        activeExecutions: executionStats.activeExecutions,
        completedToday: executionStats.completedToday,
        failedToday: executionStats.failedToday,
        averageExecutionTime: executionStats.averageExecutionTime,
        successRate: executionStats.performanceMetrics.successRate
      },
      database: {
        connected: isMongoConnected(),
        totalAutomations,
        activeAutomations,
        totalContacts,
        messagesLastHour,
        pendingJobs
      },
      performance: {
        averageResponseTime: performanceStats.averageResponseTime,
        errorRate: performanceStats.errorRate,
        slowOperations: performanceStats.slowOperations,
        cacheHitRate: cacheStats.hitRate
      },
      rateLimiting: rateLimitSummary
    };
  }

  private async generateUserDashboardData(userId: string): Promise<UserDashboardData> {
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);

    const [
      totalAutomations,
      activeAutomations,
      totalContacts,
      activeContacts,
      newContactsToday,
      messagesSentToday,
      messagesReceivedToday
    ] = await Promise.all([
      isMongoConnected() ? AutomationModel.countDocuments({ userId }) : 0,
      isMongoConnected() ? AutomationModel.countDocuments({ userId, isActive: true }) : 0,
      isMongoConnected() ? ContactModel.countDocuments({ userId }) : 0,
      isMongoConnected() ? ContactModel.countDocuments({
        userId,
        lastInteraction: { $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) }
      }) : 0,
      isMongoConnected() ? ContactModel.countDocuments({
        userId,
        createdAt: { $gte: todayStart }
      }) : 0,
      isMongoConnected() ? ConversationMessageModel.countDocuments({
        userId,
        direction: 'outbound',
        timestamp: { $gte: todayStart }
      }) : 0,
      isMongoConnected() ? ConversationMessageModel.countDocuments({
        userId,
        direction: 'inbound',
        timestamp: { $gte: todayStart }
      }) : 0
    ]);

    // Get execution statistics for user's automations
    const userAutomations = await AutomationModel.find({ userId }).select('_id').lean();
    const automationIds = userAutomations.map(a => a._id.toString());
    
    let executionsToday = 0;
    let successRate = 100;

    if (automationIds.length > 0) {
      // This would typically be calculated from execution monitor data
      // For now, we'll use placeholder values
      executionsToday = Math.floor(Math.random() * 50);
      successRate = 95 + Math.random() * 5;
    }

    // Generate recent activity (simplified)
    const recentActivity = await this.generateRecentActivity(userId);

    return {
      userId,
      automations: {
        total: totalAutomations,
        active: activeAutomations,
        executionsToday,
        successRate
      },
      contacts: {
        total: totalContacts,
        active: activeContacts,
        newToday: newContactsToday
      },
      messages: {
        sentToday: messagesSentToday,
        receivedToday: messagesReceivedToday,
        successRate: 98 // Placeholder
      },
      recentActivity
    };
  }

  private async generateRecentActivity(userId: string): Promise<UserDashboardData['recentActivity']> {
    const activities: UserDashboardData['recentActivity'] = [];

    try {
      // Get recent analytics for activity generation
      if (isMongoConnected()) {
        const recentAnalytics = await AnalyticsModel.find({
          userId,
          timestamp: { $gte: new Date(Date.now() - 24 * 60 * 60 * 1000) }
        })
        .sort({ timestamp: -1 })
        .limit(10)
        .lean();

        for (const analytic of recentAnalytics) {
          let activityType: UserDashboardData['recentActivity'][0]['type'] = 'automation_executed';
          let description = '';

          switch (analytic.metric) {
            case 'execution':
              activityType = 'automation_executed';
              description = `Automation executed for contact`;
              break;
            case 'message_sent':
              activityType = 'message_sent';
              description = `Message sent to contact`;
              break;
            case 'contact_added':
              activityType = 'contact_added';
              description = `New contact added`;
              break;
            default:
              continue;
          }

          activities.push({
            type: activityType,
            timestamp: analytic.timestamp,
            description,
            metadata: analytic.metadata
          });
        }
      }
    } catch (error) {
      advancedLogger.error('Failed to generate recent activity', error as Error, {
        operation: 'generate_recent_activity_failed',
        userId
      });
    }

    return activities.slice(0, 10);
  }

  private async getAutomationRealTimeData(automationId: string, userId: string): Promise<any> {
    try {
      const executions = automationExecutionMonitor.getAutomationExecutions(automationId, 20);
      const analytics = await automationExecutionMonitor.getAutomationAnalytics(automationId, 7);

      return {
        automationId,
        recentExecutions: executions,
        analytics,
        timestamp: new Date()
      };
    } catch (error) {
      advancedLogger.error('Failed to get automation real-time data', error as Error, {
        operation: 'get_automation_realtime_data_failed',
        automationId,
        userId
      });
      return null;
    }
  }

  // Cleanup method
  shutdown(): void {
    if (this.metricsUpdateInterval) {
      clearInterval(this.metricsUpdateInterval);
    }
    
    if (this.userDataUpdateInterval) {
      clearInterval(this.userDataUpdateInterval);
    }

    if (this.io) {
      this.io.close();
    }

    advancedLogger.info('Real-time dashboard service shutdown', {
      operation: 'dashboard_service_shutdown'
    });
  }
}

export const realTimeDashboardService = new RealTimeDashboardService();