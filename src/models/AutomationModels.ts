/*
 * Copyright 2025 Unicaclub
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 */

import { Schema, model, Document } from 'mongoose';
import {
  Automation,
  Contact,
  MessageTemplate,
  ConversationMessage,
  Campaign,
  ContactSegment,
  AutomationExecution,
  QueueJob,
  Analytics,
  Integration,
  Channel
} from '../types/AutomationTypes';

// Automation Schema
const AutomationSchema = new Schema<Automation & Document>({
  userId: { type: String, required: true, index: true },
  name: { type: String, required: true },
  description: { type: String },
  trigger: {
    type: { type: String, enum: ['keyword', 'schedule', 'webhook', 'event'], required: true },
    config: { type: Schema.Types.Mixed, required: true }
  },
  actions: [{
    type: { type: String, required: true },
    config: { type: Schema.Types.Mixed, required: true }
  }],
  conditions: [{
    field: { type: String, required: true },
    operator: { type: String, required: true },
    value: { type: Schema.Types.Mixed, required: true },
    logicalOperator: { type: String, enum: ['and', 'or'] }
  }],
  isActive: { type: Boolean, default: true },
  statistics: {
    executions: { type: Number, default: 0 },
    lastExecution: { type: Date },
    successRate: { type: Number, default: 100 }
  }
}, {
  timestamps: true,
  collection: 'automations'
});

// Contact Schema
const ContactSchema = new Schema<Contact & Document>({
  userId: { type: String, required: true, index: true },
  phone: { type: String, required: true },
  name: { type: String },
  email: { type: String },
  tags: [{ type: String }],
  customFields: { type: Schema.Types.Mixed, default: {} },
  lastInteraction: { type: Date, default: Date.now },
  totalMessages: { type: Number, default: 0 },
  averageResponseTime: { type: Number },
  channel: { type: String, enum: ['whatsapp', 'telegram', 'instagram', 'sms'], default: 'whatsapp' },
  status: { type: String, enum: ['active', 'blocked', 'unsubscribed'], default: 'active' }
}, {
  timestamps: true,
  collection: 'contacts'
});

// Unique index for userId + phone combination
ContactSchema.index({ userId: 1, phone: 1 }, { unique: true });

// Message Template Schema
const MessageTemplateSchema = new Schema<MessageTemplate & Document>({
  userId: { type: String, required: true, index: true },
  name: { type: String, required: true },
  content: { type: String, required: true },
  variables: [{ type: String }],
  messageType: { type: String, enum: ['text', 'image', 'video', 'audio', 'document'], default: 'text' },
  mediaUrl: { type: String },
  category: { type: String, enum: ['marketing', 'utility', 'authentication'], default: 'utility' },
  isActive: { type: Boolean, default: true },
  statistics: {
    sent: { type: Number, default: 0 },
    delivered: { type: Number, default: 0 },
    read: { type: Number, default: 0 },
    clicked: { type: Number, default: 0 }
  }
}, {
  timestamps: true,
  collection: 'message_templates'
});

// Conversation Message Schema
const ConversationMessageSchema = new Schema<ConversationMessage & Document>({
  userId: { type: String, required: true, index: true },
  contactId: { type: String, required: true, index: true },
  sessionId: { type: String, required: true },
  messageType: { type: String, enum: ['text', 'image', 'video', 'audio', 'document', 'location', 'contact'], required: true },
  content: { type: String, required: true },
  mediaUrl: { type: String },
  direction: { type: String, enum: ['inbound', 'outbound'], required: true },
  status: { type: String, enum: ['sent', 'delivered', 'read', 'failed'], default: 'sent' },
  automationId: { type: String },
  templateId: { type: String },
  timestamp: { type: Date, default: Date.now },
  metadata: { type: Schema.Types.Mixed }
}, {
  timestamps: true,
  collection: 'conversation_messages'
});

// Campaign Schema
const CampaignSchema = new Schema<Campaign & Document>({
  userId: { type: String, required: true, index: true },
  name: { type: String, required: true },
  description: { type: String },
  templateId: { type: String, required: true },
  targetSegment: {
    id: { type: String },
    userId: { type: String, required: true },
    name: { type: String, required: true },
    description: { type: String },
    criteria: [{
      field: { type: String, required: true },
      operator: { type: String, required: true },
      value: { type: Schema.Types.Mixed, required: true },
      logicalOperator: { type: String, enum: ['and', 'or'] }
    }],
    contactCount: { type: Number },
    isActive: { type: Boolean, default: true },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now }
  },
  schedule: {
    type: { type: String, enum: ['immediate', 'scheduled'], default: 'immediate' },
    datetime: { type: Date },
    timezone: { type: String }
  },
  status: { type: String, enum: ['draft', 'scheduled', 'running', 'completed', 'paused', 'cancelled'], default: 'draft' },
  statistics: {
    total: { type: Number, default: 0 },
    sent: { type: Number, default: 0 },
    delivered: { type: Number, default: 0 },
    read: { type: Number, default: 0 },
    failed: { type: Number, default: 0 },
    clicked: { type: Number, default: 0 },
    conversions: { type: Number, default: 0 }
  }
}, {
  timestamps: true,
  collection: 'campaigns'
});

// Contact Segment Schema
const ContactSegmentSchema = new Schema<ContactSegment & Document>({
  userId: { type: String, required: true, index: true },
  name: { type: String, required: true },
  description: { type: String },
  criteria: [{
    field: { type: String, required: true },
    operator: { type: String, required: true },
    value: { type: Schema.Types.Mixed, required: true },
    logicalOperator: { type: String, enum: ['and', 'or'] }
  }],
  contactCount: { type: Number, default: 0 },
  isActive: { type: Boolean, default: true }
}, {
  timestamps: true,
  collection: 'contact_segments'
});

// Automation Execution Schema
const AutomationExecutionSchema = new Schema<AutomationExecution & Document>({
  automationId: { type: String, required: true, index: true },
  contactId: { type: String, required: true, index: true },
  status: { type: String, enum: ['pending', 'running', 'completed', 'failed', 'cancelled'], default: 'pending' },
  currentStep: { type: Number, default: 0 },
  totalSteps: { type: Number, required: true },
  startedAt: { type: Date, default: Date.now },
  completedAt: { type: Date },
  error: { type: String },
  context: { type: Schema.Types.Mixed, default: {} }
}, {
  timestamps: { createdAt: false, updatedAt: false },
  collection: 'automation_executions'
});

// Queue Job Schema
const QueueJobSchema = new Schema<QueueJob & Document>({
  type: { type: String, enum: ['automation', 'campaign', 'message', 'webhook'], required: true },
  data: { type: Schema.Types.Mixed, required: true },
  priority: { type: Number, default: 0 },
  attempts: { type: Number, default: 0 },
  maxAttempts: { type: Number, default: 3 },
  scheduledFor: { type: Date, default: Date.now },
  status: { type: String, enum: ['pending', 'processing', 'completed', 'failed', 'cancelled'], default: 'pending' },
  error: { type: String }
}, {
  timestamps: true,
  collection: 'queue_jobs'
});

// Analytics Schema
const AnalyticsSchema = new Schema<Analytics & Document>({
  userId: { type: String, required: true, index: true },
  entityType: { type: String, enum: ['automation', 'campaign', 'template', 'contact', 'message'], required: true },
  entityId: { type: String, required: true },
  metric: { type: String, required: true },
  value: { type: Number, required: true },
  metadata: { type: Schema.Types.Mixed },
  timestamp: { type: Date, default: Date.now }
}, {
  timestamps: false,
  collection: 'analytics'
});

// Integration Schema
const IntegrationSchema = new Schema<Integration & Document>({
  userId: { type: String, required: true, index: true },
  type: { type: String, enum: ['crm', 'ecommerce', 'email', 'webhook', 'zapier'], required: true },
  name: { type: String, required: true },
  config: { type: Schema.Types.Mixed, required: true },
  isActive: { type: Boolean, default: true },
  lastSync: { type: Date }
}, {
  timestamps: true,
  collection: 'integrations'
});

// Channel Schema
const ChannelSchema = new Schema<Channel & Document>({
  userId: { type: String, required: true, index: true },
  type: { type: String, enum: ['whatsapp', 'telegram', 'instagram', 'sms', 'email'], required: true },
  name: { type: String, required: true },
  config: { type: Schema.Types.Mixed, required: true },
  isActive: { type: Boolean, default: true },
  status: { type: String, enum: ['connected', 'disconnected', 'error'], default: 'disconnected' },
  lastActivity: { type: Date }
}, {
  timestamps: true,
  collection: 'channels'
});

// Create and export models
export const AutomationModel = model<Automation & Document>('Automation', AutomationSchema);
export const ContactModel = model<Contact & Document>('Contact', ContactSchema);
export const MessageTemplateModel = model<MessageTemplate & Document>('MessageTemplate', MessageTemplateSchema);
export const ConversationMessageModel = model<ConversationMessage & Document>('ConversationMessage', ConversationMessageSchema);
export const CampaignModel = model<Campaign & Document>('Campaign', CampaignSchema);
export const ContactSegmentModel = model<ContactSegment & Document>('ContactSegment', ContactSegmentSchema);
export const AutomationExecutionModel = model<AutomationExecution & Document>('AutomationExecution', AutomationExecutionSchema);
export const QueueJobModel = model<QueueJob & Document>('QueueJob', QueueJobSchema);
export const AnalyticsModel = model<Analytics & Document>('Analytics', AnalyticsSchema);
export const IntegrationModel = model<Integration & Document>('Integration', IntegrationSchema);
export const ChannelModel = model<Channel & Document>('Channel', ChannelSchema);