/*
 * Copyright 2025 Unicaclub
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 */

export interface AutomationTrigger {
  type: 'keyword' | 'schedule' | 'webhook' | 'event';
  config: {
    keywords?: string[];
    schedule?: {
      type: 'once' | 'daily' | 'weekly' | 'monthly';
      datetime?: Date;
      time?: string;
      days?: number[];
    };
    webhook?: {
      url: string;
      secret?: string;
    };
    event?: {
      type: 'message_received' | 'contact_added' | 'group_joined';
      filters?: Record<string, any>;
    };
  };
}

export interface AutomationAction {
  type: 'send_message' | 'add_tag' | 'remove_tag' | 'delay' | 'webhook' | 'update_field' | 'send_file';
  config: {
    message?: string;
    messageType?: 'text' | 'image' | 'video' | 'audio' | 'document';
    fileUrl?: string;
    fileName?: string;
    tag?: string;
    tags?: string[];
    field?: string;
    value?: any;
    delay?: number; // em milissegundos
    webhook?: {
      url: string;
      method: 'GET' | 'POST';
      headers?: Record<string, string>;
      data?: Record<string, any>;
    };
  };
}

export interface Automation {
  id?: string;
  userId: string;
  name: string;
  description?: string;
  trigger: AutomationTrigger;
  actions: AutomationAction[];
  conditions?: AutomationCondition[];
  isActive: boolean;
  statistics?: {
    executions: number;
    lastExecution?: Date;
    successRate: number;
  };
  createdAt: Date;
  updatedAt: Date;
}

export interface AutomationCondition {
  field: string;
  operator: 'equals' | 'contains' | 'starts_with' | 'ends_with' | 'greater_than' | 'less_than';
  value: any;
  logicalOperator?: 'and' | 'or';
}

export interface Contact {
  id?: string;
  userId: string;
  phone: string;
  name?: string;
  email?: string;
  tags: string[];
  customFields: Record<string, any>;
  lastInteraction: Date;
  totalMessages: number;
  averageResponseTime?: number;
  channel: 'whatsapp' | 'telegram' | 'instagram' | 'sms';
  status: 'active' | 'blocked' | 'unsubscribed';
  createdAt: Date;
  updatedAt: Date;
}

export interface MessageTemplate {
  id?: string;
  userId: string;
  name: string;
  content: string;
  variables: string[];
  messageType: 'text' | 'image' | 'video' | 'audio' | 'document';
  mediaUrl?: string;
  category: 'marketing' | 'utility' | 'authentication';
  isActive: boolean;
  statistics?: {
    sent: number;
    delivered: number;
    read: number;
    clicked: number;
  };
  createdAt: Date;
  updatedAt: Date;
}

export interface ConversationMessage {
  id?: string;
  userId: string;
  contactId: string;
  sessionId: string;
  messageType: 'text' | 'image' | 'video' | 'audio' | 'document' | 'location' | 'contact';
  content: string;
  mediaUrl?: string;
  direction: 'inbound' | 'outbound';
  status: 'sent' | 'delivered' | 'read' | 'failed';
  automationId?: string;
  templateId?: string;
  timestamp: Date;
  metadata?: Record<string, any>;
}

export interface Campaign {
  id?: string;
  userId: string;
  name: string;
  description?: string;
  templateId: string;
  targetSegment: ContactSegment;
  schedule?: {
    type: 'immediate' | 'scheduled';
    datetime?: Date;
    timezone?: string;
  };
  status: 'draft' | 'scheduled' | 'running' | 'completed' | 'paused' | 'cancelled';
  statistics?: {
    total: number;
    sent: number;
    delivered: number;
    read: number;
    failed: number;
    clicked: number;
    conversions: number;
  };
  createdAt: Date;
  updatedAt: Date;
}

export interface ContactSegment {
  id?: string;
  userId: string;
  name: string;
  description?: string;
  criteria: SegmentCriteria[];
  contactCount?: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface SegmentCriteria {
  field: string;
  operator: 'equals' | 'contains' | 'starts_with' | 'ends_with' | 'greater_than' | 'less_than' | 'in' | 'not_in';
  value: any;
  logicalOperator?: 'and' | 'or';
}

export interface AutomationExecution {
  id?: string;
  automationId: string;
  contactId: string;
  status: 'pending' | 'running' | 'completed' | 'failed' | 'cancelled';
  currentStep: number;
  totalSteps: number;
  startedAt: Date;
  completedAt?: Date;
  error?: string;
  context?: Record<string, any>;
}

export interface QueueJob {
  id?: string;
  type: 'automation' | 'campaign' | 'message' | 'webhook';
  data: Record<string, any>;
  priority: number;
  attempts: number;
  maxAttempts: number;
  scheduledFor: Date;
  status: 'pending' | 'processing' | 'completed' | 'failed' | 'cancelled';
  error?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Analytics {
  id?: string;
  userId: string;
  entityType: 'automation' | 'campaign' | 'template' | 'contact' | 'message';
  entityId: string;
  metric: string;
  value: number;
  metadata?: Record<string, any>;
  timestamp: Date;
}

export interface Integration {
  id?: string;
  userId: string;
  type: 'crm' | 'ecommerce' | 'email' | 'webhook' | 'zapier';
  name: string;
  config: Record<string, any>;
  isActive: boolean;
  lastSync?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface Channel {
  id?: string;
  userId: string;
  type: 'whatsapp' | 'telegram' | 'instagram' | 'sms' | 'email';
  name: string;
  config: Record<string, any>;
  isActive: boolean;
  status: 'connected' | 'disconnected' | 'error';
  lastActivity?: Date;
  createdAt: Date;
  updatedAt: Date;
}