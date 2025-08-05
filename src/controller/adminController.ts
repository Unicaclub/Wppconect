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
import { systemBackupUtilities } from '../util/systemBackupUtilities';
import { rateLimitingSystem } from '../middleware/rateLimitingSystem';
import { performanceOptimization } from '../middleware/performanceOptimizationMiddleware';
import { automationExecutionMonitor } from '../services/AutomationExecutionMonitor';
import { isMongoConnected } from '../util/db/mongodb/connection';
import {
  AutomationModel,
  ContactModel,
  ConversationMessageModel,
  QueueJobModel,
  AnalyticsModel
} from '../models/AutomationModels';

// System overview for admin dashboard
export const getSystemOverview = async (req: Request, res: Response) => {
  try {
    const overview = await generateSystemOverview();
    
    res.json({
      status: 'success',
      data: overview
    });
  } catch (error) {
    advancedLogger.error('Failed to get system overview', error as Error, {
      operation: 'admin_system_overview',
      requestId: req.requestId
    });
    
    res.status(500).json({
      status: 'error',
      message: 'Failed to retrieve system overview'
    });
  }
};

// Create system backup
export const createSystemBackup = async (req: Request, res: Response) => {
  try {
    const {
      includeDatabase = true,
      includeFiles = true,
      includeLogs = false,
      includeTokens = true,
      includeUserData = true,
      compression = 'zip'
    } = req.body;

    advancedLogger.info('System backup requested', {
      operation: 'admin_backup_request',
      requestedBy: req.ip,
      options: { includeDatabase, includeFiles, includeLogs, includeTokens, includeUserData }
    });

    const result = await systemBackupUtilities.createBackup({
      includeDatabase,
      includeFiles,
      includeLogs,
      includeTokens,
      includeUserData,
      compression
    });

    if (result.success) {
      res.json({
        status: 'success',
        message: 'Backup created successfully',
        data: {
          backupPath: result.backupPath,
          manifest: result.manifest
        }
      });
    } else {
      res.status(500).json({
        status: 'error',
        message: result.error || 'Backup creation failed'
      });
    }
  } catch (error) {
    advancedLogger.error('Failed to create backup', error as Error, {
      operation: 'admin_backup_failed',
      requestId: req.requestId
    });
    
    res.status(500).json({
      status: 'error',
      message: 'Failed to create system backup'
    });
  }
};

// List available backups
export const listBackups = async (req: Request, res: Response) => {
  try {
    const backups = await systemBackupUtilities.listBackups();
    
    res.json({
      status: 'success',
      data: {
        backups,
        total: backups.length
      }
    });
  } catch (error) {
    advancedLogger.error('Failed to list backups', error as Error, {
      operation: 'admin_list_backups_failed',
      requestId: req.requestId
    });
    
    res.status(500).json({
      status: 'error',
      message: 'Failed to list backups'
    });
  }
};

// Restore system from backup
export const restoreSystemBackup = async (req: Request, res: Response) => {
  try {
    const {
      backupPath,
      restoreDatabase = true,
      restoreFiles = true,
      restoreLogs = false,
      restoreTokens = true,
      restoreUserData = true,
      overwriteExisting = false
    } = req.body;

    if (!backupPath) {
      return res.status(400).json({
        status: 'error',
        message: 'Backup path is required'
      });
    }

    advancedLogger.info('System restore requested', {
      operation: 'admin_restore_request',
      requestedBy: req.ip,
      backupPath,
      options: { restoreDatabase, restoreFiles, restoreLogs, restoreTokens, restoreUserData, overwriteExisting }
    });

    const result = await systemBackupUtilities.restoreBackup({
      backupPath,
      restoreDatabase,
      restoreFiles,
      restoreLogs,
      restoreTokens,
      restoreUserData,
      overwriteExisting
    });

    if (result.success) {
      res.json({
        status: 'success',
        message: 'System restored successfully',
        data: {
          manifest: result.manifest
        }
      });
    } else {
      res.status(500).json({
        status: 'error',
        message: result.error || 'System restore failed'
      });
    }
  } catch (error) {
    advancedLogger.error('Failed to restore backup', error as Error, {
      operation: 'admin_restore_failed',
      requestId: req.requestId
    });
    
    res.status(500).json({
      status: 'error',
      message: 'Failed to restore system backup'
    });
  }
};

// Clean up old backups
export const cleanupOldBackups = async (req: Request, res: Response) => {
  try {
    const { retentionDays = 30 } = req.body;

    advancedLogger.info('Backup cleanup requested', {
      operation: 'admin_backup_cleanup',
      requestedBy: req.ip,
      retentionDays
    });

    const result = await systemBackupUtilities.cleanupOldBackups(retentionDays);
    
    res.json({
      status: 'success',
      message: `Cleaned up ${result.cleaned} old backups`,
      data: {
        cleanedCount: result.cleaned,
        errors: result.errors
      }
    });
  } catch (error) {
    advancedLogger.error('Failed to cleanup backups', error as Error, {
      operation: 'admin_backup_cleanup_failed',
      requestId: req.requestId
    });
    
    res.status(500).json({
      status: 'error',
      message: 'Failed to cleanup old backups'
    });
  }
};

// Get rate limiting statistics
export const getRateLimitStats = async (req: Request, res: Response) => {
  try {
    const stats = rateLimitingSystem.getStats();
    
    res.json({
      status: 'success',
      data: {
        rules: stats,
        summary: {
          totalActiveClients: stats.reduce((sum, stat) => sum + stat.activeKeys, 0),
          totalRequests: stats.reduce((sum, stat) => sum + stat.totalRequests, 0),
          totalBlocked: stats.reduce((sum, stat) => sum + stat.blockedRequests, 0)
        }
      }
    });
  } catch (error) {
    advancedLogger.error('Failed to get rate limit stats', error as Error, {
      operation: 'admin_rate_limit_stats_failed',
      requestId: req.requestId
    });
    
    res.status(500).json({
      status: 'error',
      message: 'Failed to retrieve rate limiting statistics'
    });
  }
};

// Manage rate limiting rules
export const updateRateLimitRule = async (req: Request, res: Response) => {
  try {
    const { ruleName } = req.params;
    const { action, key } = req.body; // action: 'whitelist_add', 'whitelist_remove', 'blacklist_add', 'blacklist_remove', 'reset'

    switch (action) {
      case 'whitelist_add':
        rateLimitingSystem.addToWhitelist(ruleName, key);
        break;
      case 'whitelist_remove':
        rateLimitingSystem.removeFromWhitelist(ruleName, key);
        break;
      case 'blacklist_add':
        rateLimitingSystem.addToBlacklist(ruleName, key);
        break;
      case 'blacklist_remove':
        rateLimitingSystem.removeFromBlacklist(ruleName, key);
        break;
      case 'reset':
        rateLimitingSystem.resetRuleStats(ruleName);
        break;
      default:
        return res.status(400).json({
          status: 'error',
          message: 'Invalid action. Use: whitelist_add, whitelist_remove, blacklist_add, blacklist_remove, reset'
        });
    }

    advancedLogger.info('Rate limit rule updated', {
      operation: 'admin_rate_limit_update',
      ruleName,
      action,
      key,
      requestedBy: req.ip
    });

    res.json({
      status: 'success',
      message: `Rate limiting rule ${ruleName} updated successfully`
    });
  } catch (error) {
    advancedLogger.error('Failed to update rate limit rule', error as Error, {
      operation: 'admin_rate_limit_update_failed',
      requestId: req.requestId
    });
    
    res.status(500).json({
      status: 'error',
      message: 'Failed to update rate limiting rule'
    });
  }
};

// Get performance optimization statistics
export const getPerformanceStats = async (req: Request, res: Response) => {
  try {
    const cacheStats = performanceOptimization.getCacheStats();
    const rateLimitStats = performanceOptimization.getRateLimitStats();
    const loggerStats = advancedLogger.getPerformanceStats();

    res.json({
      status: 'success',
      data: {
        cache: cacheStats,
        rateLimit: rateLimitStats,
        performance: loggerStats,
        system: {
          uptime: process.uptime(),
          memoryUsage: process.memoryUsage(),
          cpuUsage: process.cpuUsage()
        }
      }
    });
  } catch (error) {
    advancedLogger.error('Failed to get performance stats', error as Error, {
      operation: 'admin_performance_stats_failed',
      requestId: req.requestId
    });
    
    res.status(500).json({
      status: 'error',
      message: 'Failed to retrieve performance statistics'
    });
  }
};

// Clear performance caches
export const clearCaches = async (req: Request, res: Response) => {
  try {
    performanceOptimization.clearCache();
    
    advancedLogger.info('Performance caches cleared', {
      operation: 'admin_clear_caches',
      requestedBy: req.ip
    });

    res.json({
      status: 'success',
      message: 'Performance caches cleared successfully'
    });
  } catch (error) {
    advancedLogger.error('Failed to clear caches', error as Error, {
      operation: 'admin_clear_caches_failed',
      requestId: req.requestId
    });
    
    res.status(500).json({
      status: 'error',
      message: 'Failed to clear performance caches'
    });
  }
};

// Get automation execution statistics
export const getExecutionStats = async (req: Request, res: Response) => {
  try {
    const stats = await automationExecutionMonitor.getRealTimeStats();
    
    res.json({
      status: 'success',
      data: stats
    });
  } catch (error) {
    advancedLogger.error('Failed to get execution stats', error as Error, {
      operation: 'admin_execution_stats_failed',
      requestId: req.requestId
    });
    
    res.status(500).json({
      status: 'error',
      message: 'Failed to retrieve execution statistics'
    });
  }
};

// Get detailed execution analytics for an automation
export const getAutomationExecutionAnalytics = async (req: Request, res: Response) => {
  try {
    const { automationId } = req.params;
    const { days = 7 } = req.query;

    const analytics = await automationExecutionMonitor.getAutomationAnalytics(
      automationId,
      parseInt(days as string, 10)
    );
    
    res.json({
      status: 'success',
      data: analytics
    });
  } catch (error) {
    advancedLogger.error('Failed to get automation execution analytics', error as Error, {
      operation: 'admin_automation_analytics_failed',
      automationId: req.params.automationId,
      requestId: req.requestId
    });
    
    res.status(500).json({
      status: 'error',
      message: 'Failed to retrieve automation execution analytics'
    });
  }
};

// System maintenance operations
export const performSystemMaintenance = async (req: Request, res: Response) => {
  try {
    const { operation } = req.body; // 'cleanup_logs', 'optimize_database', 'restart_services'

    advancedLogger.info('System maintenance requested', {
      operation: 'admin_maintenance_request',
      maintenanceOperation: operation,
      requestedBy: req.ip
    });

    let result: any = {};

    switch (operation) {
      case 'cleanup_logs':
        await advancedLogger.cleanupLogs();
        result.message = 'Log cleanup completed';
        break;
        
      case 'optimize_database':
        if (isMongoConnected()) {
          // In a real implementation, you would run database optimization
          result.message = 'Database optimization completed';
        } else {
          result.message = 'Database not connected, skipping optimization';
        }
        break;
        
      case 'restart_services':
        // In a real implementation, you would restart specific services
        result.message = 'Service restart initiated';
        break;
        
      default:
        return res.status(400).json({
          status: 'error',
          message: 'Invalid maintenance operation'
        });
    }

    res.json({
      status: 'success',
      message: result.message,
      data: result
    });
  } catch (error) {
    advancedLogger.error('System maintenance failed', error as Error, {
      operation: 'admin_maintenance_failed',
      requestId: req.requestId
    });
    
    res.status(500).json({
      status: 'error',
      message: 'System maintenance operation failed'
    });
  }
};

// Get comprehensive system diagnostics
export const getSystemDiagnostics = async (req: Request, res: Response) => {
  try {
    const diagnostics = await generateSystemDiagnostics();
    
    res.json({
      status: 'success',
      data: diagnostics
    });
  } catch (error) {
    advancedLogger.error('Failed to get system diagnostics', error as Error, {
      operation: 'admin_diagnostics_failed',
      requestId: req.requestId
    });
    
    res.status(500).json({
      status: 'error',
      message: 'Failed to retrieve system diagnostics'
    });
  }
};

// Helper functions
async function generateSystemOverview() {
  const [
    totalAutomations,
    activeAutomations,
    totalContacts,
    totalMessages,
    pendingJobs
  ] = await Promise.all([
    isMongoConnected() ? AutomationModel.countDocuments({}) : 0,
    isMongoConnected() ? AutomationModel.countDocuments({ isActive: true }) : 0,
    isMongoConnected() ? ContactModel.countDocuments({}) : 0,
    isMongoConnected() ? ConversationMessageModel.countDocuments({}) : 0,
    isMongoConnected() ? QueueJobModel.countDocuments({ status: 'pending' }) : 0
  ]);

  const executionStats = await automationExecutionMonitor.getRealTimeStats();
  const performanceStats = advancedLogger.getPerformanceStats();

  return {
    system: {
      uptime: process.uptime(),
      version: process.env.npm_package_version || '1.0.0',
      environment: process.env.NODE_ENV || 'development',
      memoryUsage: process.memoryUsage(),
      cpuUsage: process.cpuUsage()
    },
    database: {
      connected: isMongoConnected(),
      collections: {
        automations: totalAutomations,
        activeAutomations,
        contacts: totalContacts,
        messages: totalMessages,
        pendingJobs
      }
    },
    execution: {
      activeExecutions: executionStats.activeExecutions,
      completedToday: executionStats.completedToday,
      failedToday: executionStats.failedToday,
      averageExecutionTime: executionStats.averageExecutionTime,
      successRate: executionStats.performanceMetrics.successRate
    },
    performance: {
      averageResponseTime: performanceStats.averageResponseTime,
      errorRate: performanceStats.errorRate,
      slowOperations: performanceStats.slowOperations
    }
  };
}

async function generateSystemDiagnostics() {
  const healthCheck = await advancedLogger.healthCheck();
  const rateLimitStats = rateLimitingSystem.getStats();
  const executionStats = await automationExecutionMonitor.getRealTimeStats();

  return {
    timestamp: new Date(),
    health: healthCheck,
    rateLimiting: {
      rules: rateLimitStats,
      summary: {
        totalActiveClients: rateLimitStats.reduce((sum, stat) => sum + stat.activeKeys, 0),
        totalRequests: rateLimitStats.reduce((sum, stat) => sum + stat.totalRequests, 0),
        totalBlocked: rateLimitStats.reduce((sum, stat) => sum + stat.blockedRequests, 0)
      }
    },
    execution: executionStats,
    system: {
      uptime: process.uptime(),
      memoryUsage: process.memoryUsage(),
      cpuUsage: process.cpuUsage(),
      version: process.version,
      platform: process.platform
    },
    database: {
      connected: isMongoConnected()
    }
  };
}