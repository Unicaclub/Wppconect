/*
 * Copyright 2025 Unicaclub
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 */

import { 
  AnalyticsModel, 
  AutomationModel, 
  ContactModel, 
  ConversationMessageModel,
  CampaignModel,
  MessageTemplateModel 
} from '../models/AutomationModels';
import { Analytics } from '../types/AutomationTypes';
import { logger } from '../index';

export interface DashboardMetrics {
  totalContacts: number;
  activeContacts: number;
  totalMessages: number;
  totalAutomations: number;
  activeAutomations: number;
  totalCampaigns: number;
  activeCampaigns: number;
  messageStats: {
    sent: number;
    delivered: number;
    read: number;
    failed: number;
  };
  periodComparison: {
    contactsGrowth: number;
    messagesGrowth: number;
    engagementRate: number;
  };
}

export interface AutomationAnalytics {
  automationId: string;
  name: string;
  executions: number;
  successRate: number;
  averageExecutionTime: number;
  messagesGenerated: number;
  contactsReached: number;
  conversionRate: number;
  topTriggers: Array<{ trigger: string; count: number }>;
  performance: Array<{ date: string; executions: number; success: number }>;
}

export interface CampaignAnalytics {
  campaignId: string;
  name: string;
  totalContacts: number;
  messagesSent: number;
  deliveryRate: number;
  readRate: number;
  clickRate: number;
  conversionRate: number;
  unsubscribeRate: number;
  roi: number;
  performance: Array<{ date: string; sent: number; delivered: number; read: number }>;
}

export interface ContactAnalytics {
  totalContacts: number;
  newContacts: number;
  activeContacts: number;
  contactsByChannel: Array<{ channel: string; count: number }>;
  contactsByTag: Array<{ tag: string; count: number }>;
  engagementLevels: {
    high: number;
    medium: number;
    low: number;
    inactive: number;
  };
  growthTrend: Array<{ date: string; total: number; new: number }>;
}

export class AnalyticsService {

  async trackEvent(
    userId: string,
    entityType: Analytics['entityType'],
    entityId: string,
    metric: string,
    value: number,
    metadata?: Record<string, any>
  ): Promise<void> {
    try {
      const analytics = new AnalyticsModel({
        userId,
        entityType,
        entityId,
        metric,
        value,
        metadata,
        timestamp: new Date()
      });

      await analytics.save();
    } catch (error) {
      logger.error('Error tracking analytics event:', error);
    }
  }

  async getDashboardMetrics(
    userId: string,
    period: 'today' | 'week' | 'month' | 'year' = 'month'
  ): Promise<DashboardMetrics> {
    try {
      const periodStart = this.getPeriodStart(period);
      const previousPeriodStart = this.getPreviousPeriodStart(period);

      // Métricas básicas
      const [
        totalContacts,
        activeContacts,
        totalMessages,
        totalAutomations,
        activeAutomations,
        totalCampaigns,
        activeCampaigns
      ] = await Promise.all([
        ContactModel.countDocuments({ userId }),
        ContactModel.countDocuments({ 
          userId, 
          lastInteraction: { $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) }
        }),
        ConversationMessageModel.countDocuments({ userId }),
        AutomationModel.countDocuments({ userId }),
        AutomationModel.countDocuments({ userId, isActive: true }),
        CampaignModel.countDocuments({ userId }),
        CampaignModel.countDocuments({ userId, status: { $in: ['running', 'scheduled'] } })
      ]);

      // Estatísticas de mensagens
      const messageStats = await ConversationMessageModel.aggregate([
        { 
          $match: { 
            userId, 
            timestamp: { $gte: periodStart },
            direction: 'outbound'
          } 
        },
        {
          $group: {
            _id: '$status',
            count: { $sum: 1 }
          }
        }
      ]);

      const messageStatsObj = {
        sent: 0,
        delivered: 0,
        read: 0,
        failed: 0
      };

      messageStats.forEach(stat => {
        if (stat._id in messageStatsObj) {
          messageStatsObj[stat._id as keyof typeof messageStatsObj] = stat.count;
        }
      });

      // Comparação com período anterior
      const [
        prevContacts,
        prevMessages
      ] = await Promise.all([
        ContactModel.countDocuments({ 
          userId, 
          createdAt: { $gte: previousPeriodStart, $lt: periodStart }
        }),
        ConversationMessageModel.countDocuments({ 
          userId, 
          timestamp: { $gte: previousPeriodStart, $lt: periodStart }
        })
      ]);

      const currentContacts = await ContactModel.countDocuments({ 
        userId, 
        createdAt: { $gte: periodStart }
      });

      const currentMessages = await ConversationMessageModel.countDocuments({ 
        userId, 
        timestamp: { $gte: periodStart }
      });

      const contactsGrowth = prevContacts > 0 ? ((currentContacts - prevContacts) / prevContacts) * 100 : 0;
      const messagesGrowth = prevMessages > 0 ? ((currentMessages - prevMessages) / prevMessages) * 100 : 0;
      
      // Taxa de engajamento (mensagens recebidas / mensagens enviadas)
      const inboundMessages = await ConversationMessageModel.countDocuments({
        userId,
        direction: 'inbound',
        timestamp: { $gte: periodStart }
      });

      const outboundMessages = await ConversationMessageModel.countDocuments({
        userId,
        direction: 'outbound',
        timestamp: { $gte: periodStart }
      });

      const engagementRate = outboundMessages > 0 ? (inboundMessages / outboundMessages) * 100 : 0;

      return {
        totalContacts,
        activeContacts,
        totalMessages,
        totalAutomations,
        activeAutomations,
        totalCampaigns,
        activeCampaigns,
        messageStats: messageStatsObj,
        periodComparison: {
          contactsGrowth,
          messagesGrowth,
          engagementRate
        }
      };
    } catch (error) {
      logger.error('Error getting dashboard metrics:', error);
      throw error;
    }
  }

  async getAutomationAnalytics(
    automationId: string,
    period: 'week' | 'month' | 'year' = 'month'
  ): Promise<AutomationAnalytics | null> {
    try {
      const automation = await AutomationModel.findById(automationId);
      if (!automation) {
        return null;
      }

      const periodStart = this.getPeriodStart(period);

      // Estatísticas básicas da automação
      const analytics = await AnalyticsModel.aggregate([
        {
          $match: {
            entityType: 'automation',
            entityId: automationId,
            timestamp: { $gte: periodStart }
          }
        },
        {
          $group: {
            _id: '$metric',
            total: { $sum: '$value' },
            count: { $sum: 1 },
            avg: { $avg: '$value' }
          }
        }
      ]);

      const statsMap = analytics.reduce((acc, item) => {
        acc[item._id] = {
          total: item.total,
          count: item.count,
          avg: item.avg
        };
        return acc;
      }, {} as Record<string, any>);

      // Mensagens geradas pela automação
      const messagesGenerated = await ConversationMessageModel.countDocuments({
        automationId,
        timestamp: { $gte: periodStart }
      });

      // Contatos únicos alcançados
      const contactsReached = await ConversationMessageModel.distinct('contactId', {
        automationId,
        timestamp: { $gte: periodStart }
      });

      // Performance ao longo do tempo
      const performance = await AnalyticsModel.aggregate([
        {
          $match: {
            entityType: 'automation',
            entityId: automationId,
            metric: 'execution',
            timestamp: { $gte: periodStart }
          }
        },
        {
          $group: {
            _id: {
              $dateToString: { format: '%Y-%m-%d', date: '$timestamp' }
            },
            executions: { $sum: 1 },
            success: {
              $sum: {
                $cond: [{ $eq: ['$metadata.status', 'success'] }, 1, 0]
              }
            }
          }
        },
        { $sort: { _id: 1 } }
      ]);

      const executions = statsMap.execution?.count || 0;
      const successfulExecutions = statsMap.execution_success?.count || 0;
      const successRate = executions > 0 ? (successfulExecutions / executions) * 100 : 0;

      return {
        automationId,
        name: automation.name,
        executions,
        successRate,
        averageExecutionTime: statsMap.execution_time?.avg || 0,
        messagesGenerated,
        contactsReached: contactsReached.length,
        conversionRate: statsMap.conversion?.avg || 0,
        topTriggers: [], // Implementar se necessário
        performance: performance.map(p => ({
          date: p._id,
          executions: p.executions,
          success: p.success
        }))
      };
    } catch (error) {
      logger.error('Error getting automation analytics:', error);
      return null;
    }
  }

  async getCampaignAnalytics(
    campaignId: string
  ): Promise<CampaignAnalytics | null> {
    try {
      const campaign = await CampaignModel.findById(campaignId);
      if (!campaign) {
        return null;
      }

      const stats = campaign.statistics || {
        total: 0,
        sent: 0,
        delivered: 0,
        read: 0,
        failed: 0,
        clicked: 0,
        conversions: 0
      };

      // Performance ao longo do tempo
      const performance = await AnalyticsModel.aggregate([
        {
          $match: {
            entityType: 'campaign',
            entityId: campaignId,
            metric: { $in: ['sent', 'delivered', 'read'] }
          }
        },
        {
          $group: {
            _id: {
              date: { $dateToString: { format: '%Y-%m-%d', date: '$timestamp' } },
              metric: '$metric'
            },
            value: { $sum: '$value' }
          }
        },
        { $sort: { '_id.date': 1 } }
      ]);

      const performanceByDate = performance.reduce((acc, item) => {
        const date = item._id.date;
        if (!acc[date]) {
          acc[date] = { date, sent: 0, delivered: 0, read: 0 };
        }
        acc[date][item._id.metric as keyof typeof acc[typeof date]] = item.value;
        return acc;
      }, {} as Record<string, any>);

      const deliveryRate = stats.sent > 0 ? (stats.delivered / stats.sent) * 100 : 0;
      const readRate = stats.delivered > 0 ? (stats.read / stats.delivered) * 100 : 0;
      const clickRate = stats.sent > 0 ? (stats.clicked / stats.sent) * 100 : 0;
      const conversionRate = stats.sent > 0 ? (stats.conversions / stats.sent) * 100 : 0;

      return {
        campaignId,
        name: campaign.name,
        totalContacts: stats.total,
        messagesSent: stats.sent,
        deliveryRate,
        readRate,
        clickRate,
        conversionRate,
        unsubscribeRate: 0, // Implementar se necessário
        roi: 0, // Implementar se necessário
        performance: Object.values(performanceByDate)
      };
    } catch (error) {
      logger.error('Error getting campaign analytics:', error);
      return null;
    }
  }

  async getContactAnalytics(
    userId: string,
    period: 'month' | 'year' = 'month'
  ): Promise<ContactAnalytics> {
    try {
      const periodStart = this.getPeriodStart(period);

      // Contatos básicos
      const [totalContacts, newContacts] = await Promise.all([
        ContactModel.countDocuments({ userId }),
        ContactModel.countDocuments({ 
          userId, 
          createdAt: { $gte: periodStart }
        })
      ]);

      // Contatos ativos (interagiram nos últimos 30 dias)
      const activeContacts = await ContactModel.countDocuments({
        userId,
        lastInteraction: { $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) }
      });

      // Contatos por canal
      const contactsByChannel = await ContactModel.aggregate([
        { $match: { userId } },
        {
          $group: {
            _id: '$channel',
            count: { $sum: 1 }
          }
        }
      ]);

      // Contatos por tag
      const contactsByTag = await ContactModel.aggregate([
        { $match: { userId } },
        { $unwind: '$tags' },
        {
          $group: {
            _id: '$tags',
            count: { $sum: 1 }
          }
        },
        { $sort: { count: -1 } },
        { $limit: 10 }
      ]);

      // Níveis de engajamento baseados no número de mensagens
      const engagementLevels = await ContactModel.aggregate([
        { $match: { userId } },
        {
          $bucket: {
            groupBy: '$totalMessages',
            boundaries: [0, 1, 5, 20, Infinity],
            default: 'inactive',
            output: {
              count: { $sum: 1 }
            }
          }
        }
      ]);

      const engagementMap = {
        inactive: 0,
        low: 0,
        medium: 0,
        high: 0
      };

      engagementLevels.forEach((level, index) => {
        const labels = ['inactive', 'low', 'medium', 'high'];
        engagementMap[labels[index] as keyof typeof engagementMap] = level.count;
      });

      // Tendência de crescimento
      const growthTrend = await ContactModel.aggregate([
        { $match: { userId } },
        {
          $group: {
            _id: {
              $dateToString: { format: '%Y-%m-%d', date: '$createdAt' }
            },
            new: { $sum: 1 }
          }
        },
        { $sort: { _id: 1 } },
        { $limit: 30 } // Últimos 30 dias
      ]);

      let runningTotal = totalContacts - newContacts;
      const growthTrendWithTotal = growthTrend.map(day => {
        runningTotal += day.new;
        return {
          date: day._id,
          total: runningTotal,
          new: day.new
        };
      });

      return {
        totalContacts,
        newContacts,
        activeContacts,
        contactsByChannel: contactsByChannel.map(c => ({
          channel: c._id,
          count: c.count
        })),
        contactsByTag: contactsByTag.map(t => ({
          tag: t._id,
          count: t.count
        })),
        engagementLevels: engagementMap,
        growthTrend: growthTrendWithTotal
      };
    } catch (error) {
      logger.error('Error getting contact analytics:', error);
      throw error;
    }
  }

  async getMessageAnalytics(
    userId: string,
    period: 'week' | 'month' | 'year' = 'month'
  ): Promise<{
    totalMessages: number;
    messagesByType: Array<{ type: string; count: number }>;
    messagesByDirection: Array<{ direction: string; count: number }>;
    messagesByStatus: Array<{ status: string; count: number }>;
    hourlyDistribution: Array<{ hour: number; count: number }>;
    dailyTrend: Array<{ date: string; inbound: number; outbound: number }>;
  }> {
    try {
      const periodStart = this.getPeriodStart(period);

      // Total de mensagens
      const totalMessages = await ConversationMessageModel.countDocuments({
        userId,
        timestamp: { $gte: periodStart }
      });

      // Mensagens por tipo
      const messagesByType = await ConversationMessageModel.aggregate([
        { $match: { userId, timestamp: { $gte: periodStart } } },
        {
          $group: {
            _id: '$messageType',
            count: { $sum: 1 }
          }
        }
      ]);

      // Mensagens por direção
      const messagesByDirection = await ConversationMessageModel.aggregate([
        { $match: { userId, timestamp: { $gte: periodStart } } },
        {
          $group: {
            _id: '$direction',
            count: { $sum: 1 }
          }
        }
      ]);

      // Mensagens por status
      const messagesByStatus = await ConversationMessageModel.aggregate([
        { $match: { userId, timestamp: { $gte: periodStart } } },
        {
          $group: {
            _id: '$status',
            count: { $sum: 1 }
          }
        }
      ]);

      // Distribuição por hora
      const hourlyDistribution = await ConversationMessageModel.aggregate([
        { $match: { userId, timestamp: { $gte: periodStart } } },
        {
          $group: {
            _id: { $hour: '$timestamp' },
            count: { $sum: 1 }
          }
        },
        { $sort: { _id: 1 } }
      ]);

      // Tendência diária
      const dailyTrend = await ConversationMessageModel.aggregate([
        { $match: { userId, timestamp: { $gte: periodStart } } },
        {
          $group: {
            _id: {
              date: { $dateToString: { format: '%Y-%m-%d', date: '$timestamp' } },
              direction: '$direction'
            },
            count: { $sum: 1 }
          }
        },
        { $sort: { '_id.date': 1 } }
      ]);

      const dailyTrendMap = dailyTrend.reduce((acc, item) => {
        const date = item._id.date;
        if (!acc[date]) {
          acc[date] = { date, inbound: 0, outbound: 0 };
        }
        acc[date][item._id.direction as 'inbound' | 'outbound'] = item.count;
        return acc;
      }, {} as Record<string, any>);

      return {
        totalMessages,
        messagesByType: messagesByType.map(m => ({ type: m._id, count: m.count })),
        messagesByDirection: messagesByDirection.map(m => ({ direction: m._id, count: m.count })),
        messagesByStatus: messagesByStatus.map(m => ({ status: m._id, count: m.count })),
        hourlyDistribution: hourlyDistribution.map(h => ({ hour: h._id, count: h.count })),
        dailyTrend: Object.values(dailyTrendMap)
      };
    } catch (error) {
      logger.error('Error getting message analytics:', error);
      throw error;
    }
  }

  private getPeriodStart(period: string): Date {
    const now = new Date();
    
    switch (period) {
      case 'today':
        return new Date(now.getFullYear(), now.getMonth(), now.getDate());
      case 'week':
        const weekStart = new Date(now);
        weekStart.setDate(now.getDate() - now.getDay());
        return weekStart;
      case 'month':
        return new Date(now.getFullYear(), now.getMonth(), 1);
      case 'year':
        return new Date(now.getFullYear(), 0, 1);
      default:
        return new Date(now.getFullYear(), now.getMonth(), 1);
    }
  }

  private getPreviousPeriodStart(period: string): Date {
    const now = new Date();
    
    switch (period) {
      case 'today':
        const yesterday = new Date(now);
        yesterday.setDate(now.getDate() - 1);
        return new Date(yesterday.getFullYear(), yesterday.getMonth(), yesterday.getDate());
      case 'week':
        const prevWeek = new Date(now);
        prevWeek.setDate(now.getDate() - 7);
        return prevWeek;
      case 'month':
        const prevMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
        return prevMonth;
      case 'year':
        return new Date(now.getFullYear() - 1, 0, 1);
      default:
        return new Date(now.getFullYear(), now.getMonth() - 1, 1);
    }
  }
}

export const analyticsService = new AnalyticsService();