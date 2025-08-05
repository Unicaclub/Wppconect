/*
 * Copyright 2025 Unicaclub
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 */

import { advancedLogger } from '../util/advancedLogger';
import { AnalyticsModel, AutomationModel, ContactModel } from '../models/AutomationModels';
import { isMongoConnected } from '../util/db/mongodb/connection';

interface ExecutionMetrics {
  automationId: string;
  contactId: string;
  userId: string;
  startTime: Date;
  endTime?: Date;
  duration?: number;
  status: 'started' | 'completed' | 'failed' | 'timeout';
  actions: ActionExecution[];
  error?: string;
  metadata?: Record<string, any>;
}

interface ActionExecution {
  actionType: string;
  startTime: Date;
  endTime?: Date;
  duration?: number;
  status: 'started' | 'completed' | 'failed' | 'skipped';
  result?: any;
  error?: string;
}

interface RealTimeStats {
  activeExecutions: number;
  completedToday: number;
  failedToday: number;
  averageExecutionTime: number;
  topFailingAutomations: Array<{
    automationId: string;
    name: string;
    failureRate: number;
    lastFailure: Date;
  }>;
  performanceMetrics: {
    executionsPerHour: number;
    successRate: number;
    averageActionTime: number;
  };
}

class AutomationExecutionMonitor {
  private activeExecutions: Map<string, ExecutionMetrics> = new Map();
  private executionHistory: ExecutionMetrics[] = [];
  private maxHistorySize = 1000;
  
  // Real-time statistics
  private dailyStats = {
    completed: 0,
    failed: 0,
    totalDuration: 0,
    executionsPerHour: new Array(24).fill(0)
  };

  constructor() {
    this.startPeriodicTasks();
  }

  // Start monitoring an automation execution
  startExecution(
    automationId: string,
    contactId: string,
    userId: string,
    metadata?: Record<string, any>
  ): string {
    const executionId = this.generateExecutionId();
    
    const execution: ExecutionMetrics = {
      automationId,
      contactId,
      userId,
      startTime: new Date(),
      status: 'started',
      actions: [],
      metadata
    };

    this.activeExecutions.set(executionId, execution);

    advancedLogger.automationStarted(automationId, contactId, {
      userId,
      operation: 'execution_monitor_start',
      metadata: { executionId, ...metadata }
    });

    // Update real-time stats
    const hour = new Date().getHours();
    this.dailyStats.executionsPerHour[hour]++;

    return executionId;
  }

  // Start monitoring an action within an execution
  startAction(executionId: string, actionType: string): string {
    const execution = this.activeExecutions.get(executionId);
    if (!execution) {
      advancedLogger.warn('Attempted to start action for non-existent execution', {
        operation: 'execution_monitor_action_start_failed',
        executionId,
        actionType
      });
      return '';
    }

    const actionId = `${executionId}_action_${execution.actions.length}`;
    const actionExecution: ActionExecution = {
      actionType,
      startTime: new Date(),
      status: 'started'
    };

    execution.actions.push(actionExecution);

    advancedLogger.debug('Action started within automation execution', {
      operation: 'execution_monitor_action_start',
      executionId,
      actionType,
      actionId
    });

    return actionId;
  }

  // Complete an action within an execution
  completeAction(
    executionId: string,
    actionIndex: number,
    result?: any,
    error?: string
  ): void {
    const execution = this.activeExecutions.get(executionId);
    if (!execution || !execution.actions[actionIndex]) {
      return;
    }

    const action = execution.actions[actionIndex];
    action.endTime = new Date();
    action.duration = action.endTime.getTime() - action.startTime.getTime();
    action.status = error ? 'failed' : 'completed';
    action.result = result;
    action.error = error;

    advancedLogger.debug('Action completed within automation execution', {
      operation: 'execution_monitor_action_complete',
      executionId,
      actionType: action.actionType,
      duration: action.duration,
      status: action.status
    });
  }

  // Complete an automation execution
  completeExecution(
    executionId: string,
    status: 'completed' | 'failed' | 'timeout',
    error?: string
  ): void {
    const execution = this.activeExecutions.get(executionId);
    if (!execution) {
      return;
    }

    execution.endTime = new Date();
    execution.duration = execution.endTime.getTime() - execution.startTime.getTime();
    execution.status = status;
    execution.error = error;

    // Log completion
    if (status === 'completed') {
      advancedLogger.automationCompleted(
        execution.automationId,
        execution.contactId,
        execution.duration,
        {
          userId: execution.userId,
          executionId,
          actionsExecuted: execution.actions.length
        }
      );
      this.dailyStats.completed++;
    } else {
      advancedLogger.automationFailed(
        execution.automationId,
        execution.contactId,
        new Error(error || 'Execution failed'),
        {
          userId: execution.userId,
          executionId,
          status
        }
      );
      this.dailyStats.failed++;
    }

    // Update statistics
    this.dailyStats.totalDuration += execution.duration || 0;

    // Move to history
    this.moveToHistory(execution);
    this.activeExecutions.delete(executionId);

    // Save to database if available
    this.saveExecutionToDatabase(execution);
  }

  // Get real-time statistics
  async getRealTimeStats(): Promise<RealTimeStats> {
    const now = new Date();
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const hourAgo = new Date(now.getTime() - 60 * 60 * 1000);

    // Calculate metrics from recent history
    const recentExecutions = this.executionHistory.filter(
      exec => exec.startTime >= todayStart
    );

    const completedExecutions = recentExecutions.filter(
      exec => exec.status === 'completed'
    );

    const failedExecutions = recentExecutions.filter(
      exec => exec.status === 'failed'
    );

    const averageExecutionTime = completedExecutions.length > 0
      ? completedExecutions.reduce((sum, exec) => sum + (exec.duration || 0), 0) / completedExecutions.length
      : 0;

    const executionsThisHour = recentExecutions.filter(
      exec => exec.startTime >= hourAgo
    ).length;

    const successRate = recentExecutions.length > 0
      ? (completedExecutions.length / recentExecutions.length) * 100
      : 100;

    // Calculate average action time
    const allActions = recentExecutions.flatMap(exec => exec.actions);
    const completedActions = allActions.filter(action => action.status === 'completed');
    const averageActionTime = completedActions.length > 0
      ? completedActions.reduce((sum, action) => sum + (action.duration || 0), 0) / completedActions.length
      : 0;

    // Get top failing automations
    const topFailingAutomations = await this.getTopFailingAutomations();

    return {
      activeExecutions: this.activeExecutions.size,
      completedToday: this.dailyStats.completed,
      failedToday: this.dailyStats.failed,
      averageExecutionTime,
      topFailingAutomations,
      performanceMetrics: {
        executionsPerHour: executionsThisHour,
        successRate,
        averageActionTime
      }
    };
  }

  // Get execution details by ID
  getExecutionDetails(executionId: string): ExecutionMetrics | null {
    return this.activeExecutions.get(executionId) || 
           this.executionHistory.find(exec => 
             this.generateExecutionId(exec.automationId, exec.contactId, exec.startTime) === executionId
           ) || null;
  }

  // Get executions for a specific automation
  getAutomationExecutions(automationId: string, limit: number = 50): ExecutionMetrics[] {
    const allExecutions = [
      ...Array.from(this.activeExecutions.values()),
      ...this.executionHistory
    ];

    return allExecutions
      .filter(exec => exec.automationId === automationId)
      .sort((a, b) => b.startTime.getTime() - a.startTime.getTime())
      .slice(0, limit);
  }

  // Get executions for a specific contact
  getContactExecutions(contactId: string, limit: number = 50): ExecutionMetrics[] {
    const allExecutions = [
      ...Array.from(this.activeExecutions.values()),
      ...this.executionHistory
    ];

    return allExecutions
      .filter(exec => exec.contactId === contactId)
      .sort((a, b) => b.startTime.getTime() - a.startTime.getTime())
      .slice(0, limit);
  }

  // Get performance analytics for an automation
  async getAutomationAnalytics(automationId: string, days: number = 7): Promise<{
    totalExecutions: number;
    successRate: number;
    averageExecutionTime: number;
    failureReasons: Record<string, number>;
    executionTrend: Array<{ date: string; executions: number; successes: number }>;
  }> {
    const startDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000);
    
    const executions = this.executionHistory.filter(
      exec => exec.automationId === automationId && exec.startTime >= startDate
    );

    const successfulExecutions = executions.filter(exec => exec.status === 'completed');
    const failedExecutions = executions.filter(exec => exec.status === 'failed');

    const successRate = executions.length > 0
      ? (successfulExecutions.length / executions.length) * 100
      : 0;

    const averageExecutionTime = successfulExecutions.length > 0
      ? successfulExecutions.reduce((sum, exec) => sum + (exec.duration || 0), 0) / successfulExecutions.length
      : 0;

    // Analyze failure reasons
    const failureReasons: Record<string, number> = {};
    failedExecutions.forEach(exec => {
      const reason = exec.error || 'Unknown error';
      failureReasons[reason] = (failureReasons[reason] || 0) + 1;
    });

    // Generate daily trend
    const executionTrend: Array<{ date: string; executions: number; successes: number }> = [];
    for (let i = 0; i < days; i++) {
      const date = new Date(startDate.getTime() + i * 24 * 60 * 60 * 1000);
      const dayStart = new Date(date.getFullYear(), date.getMonth(), date.getDate());
      const dayEnd = new Date(dayStart.getTime() + 24 * 60 * 60 * 1000);

      const dayExecutions = executions.filter(
        exec => exec.startTime >= dayStart && exec.startTime < dayEnd
      );

      const daySuccesses = dayExecutions.filter(exec => exec.status === 'completed');

      executionTrend.push({
        date: dayStart.toISOString().split('T')[0],
        executions: dayExecutions.length,
        successes: daySuccesses.length
      });
    }

    return {
      totalExecutions: executions.length,
      successRate,
      averageExecutionTime,
      failureReasons,
      executionTrend
    };
  }

  // Private helper methods
  private generateExecutionId(
    automationId?: string,
    contactId?: string,
    startTime?: Date
  ): string {
    const timestamp = startTime ? startTime.getTime() : Date.now();
    const random = Math.random().toString(36).substr(2, 9);
    return `exec_${timestamp}_${random}`;
  }

  private moveToHistory(execution: ExecutionMetrics): void {
    this.executionHistory.push(execution);

    // Keep history size manageable
    if (this.executionHistory.length > this.maxHistorySize) {
      this.executionHistory = this.executionHistory.slice(-this.maxHistorySize);
    }
  }

  private async saveExecutionToDatabase(execution: ExecutionMetrics): Promise<void> {
    if (!isMongoConnected()) {
      return;
    }

    try {
      // Save general execution metrics
      await AnalyticsModel.create({
        userId: execution.userId,
        entityType: 'automation',
        entityId: execution.automationId,
        metric: 'execution',
        value: execution.duration || 0,
        metadata: {
          contactId: execution.contactId,
          status: execution.status,
          actionsCount: execution.actions.length,
          error: execution.error,
          ...execution.metadata
        },
        timestamp: execution.startTime
      });

      // Save success/failure metric
      await AnalyticsModel.create({
        userId: execution.userId,
        entityType: 'automation',
        entityId: execution.automationId,
        metric: execution.status === 'completed' ? 'execution_success' : 'execution_failure',
        value: 1,
        metadata: {
          contactId: execution.contactId,
          duration: execution.duration,
          error: execution.error
        },
        timestamp: execution.endTime || execution.startTime
      });

      // Save action metrics
      for (const action of execution.actions) {
        if (action.endTime) {
          await AnalyticsModel.create({
            userId: execution.userId,
            entityType: 'automation_action',
            entityId: `${execution.automationId}_${action.actionType}`,
            metric: 'action_execution',
            value: action.duration || 0,
            metadata: {
              automationId: execution.automationId,
              contactId: execution.contactId,
              actionType: action.actionType,
              status: action.status,
              error: action.error
            },
            timestamp: action.startTime
          });
        }
      }

    } catch (error) {
      advancedLogger.error('Failed to save execution metrics to database', error as Error, {
        operation: 'save_execution_metrics',
        executionId: this.generateExecutionId(execution.automationId, execution.contactId, execution.startTime)
      });
    }
  }

  private async getTopFailingAutomations(): Promise<Array<{
    automationId: string;
    name: string;
    failureRate: number;
    lastFailure: Date;
  }>> {
    if (!isMongoConnected()) {
      return [];
    }

    try {
      const automations = await AutomationModel.find({ isActive: true }).lean();
      const results: Array<{
        automationId: string;
        name: string;
        failureRate: number;
        lastFailure: Date;
      }> = [];

      for (const automation of automations) {
        const recentExecutions = this.executionHistory.filter(
          exec => exec.automationId === automation._id.toString() &&
                  exec.startTime >= new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
        );

        if (recentExecutions.length >= 5) { // Only consider automations with enough data
          const failedExecutions = recentExecutions.filter(exec => exec.status === 'failed');
          const failureRate = (failedExecutions.length / recentExecutions.length) * 100;

          if (failureRate > 20) { // Only include automations with >20% failure rate
            const lastFailure = failedExecutions
              .sort((a, b) => b.startTime.getTime() - a.startTime.getTime())[0]?.startTime || new Date(0);

            results.push({
              automationId: automation._id.toString(),
              name: automation.name,
              failureRate,
              lastFailure
            });
          }
        }
      }

      return results
        .sort((a, b) => b.failureRate - a.failureRate)
        .slice(0, 10);

    } catch (error) {
      advancedLogger.error('Failed to get top failing automations', error as Error);
      return [];
    }
  }

  private startPeriodicTasks(): void {
    // Reset daily stats at midnight
    const resetDailyStats = () => {
      const now = new Date();
      const tomorrow = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1);
      const timeUntilMidnight = tomorrow.getTime() - now.getTime();

      setTimeout(() => {
        this.dailyStats = {
          completed: 0,
          failed: 0,
          totalDuration: 0,
          executionsPerHour: new Array(24).fill(0)
        };

        // Set up daily reset
        setInterval(() => {
          this.dailyStats = {
            completed: 0,
            failed: 0,
            totalDuration: 0,
            executionsPerHour: new Array(24).fill(0)
          };
        }, 24 * 60 * 60 * 1000);

      }, timeUntilMidnight);
    };

    resetDailyStats();

    // Clean up old executions every hour
    setInterval(() => {
      const oneWeekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
      this.executionHistory = this.executionHistory.filter(
        exec => exec.startTime >= oneWeekAgo
      );

      advancedLogger.debug('Cleaned up old execution history', {
        operation: 'execution_history_cleanup',
        remainingExecutions: this.executionHistory.length
      });
    }, 60 * 60 * 1000);

    // Check for timeout executions every 5 minutes
    setInterval(() => {
      const now = Date.now();
      const timeoutThreshold = 10 * 60 * 1000; // 10 minutes

      for (const [executionId, execution] of this.activeExecutions.entries()) {
        if (now - execution.startTime.getTime() > timeoutThreshold) {
          this.completeExecution(executionId, 'timeout', 'Execution timeout');
        }
      }
    }, 5 * 60 * 1000);
  }
}

export const automationExecutionMonitor = new AutomationExecutionMonitor();