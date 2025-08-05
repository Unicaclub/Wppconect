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
  AutomationModel, 
  ContactModel, 
  ConversationMessageModel,
  AutomationExecutionModel
} from '../models/AutomationModels';
import { 
  Automation, 
  Contact, 
  ConversationMessage,
  AutomationExecution,
  AutomationAction,
  AutomationCondition 
} from '../types/AutomationTypes';
import { queueService } from './QueueService';
import { messageTemplateService } from './MessageTemplateService';
import { analyticsService } from './AnalyticsService';
import { logger } from '../index';
import { EventEmitter } from 'events';
import axios from 'axios';

export class AutomationEngine extends EventEmitter {
  private whatsappClients: Map<string, any> = new Map();

  constructor() {
    super();
    this.setupQueueListeners();
  }

  setWhatsAppClient(sessionId: string, client: any): void {
    this.whatsappClients.set(sessionId, client);
  }

  removeWhatsAppClient(sessionId: string): void {
    this.whatsappClients.delete(sessionId);
  }

  async processIncomingMessage(
    userId: string,
    sessionId: string,
    phone: string,
    messageContent: string,
    messageType: string = 'text',
    metadata: Record<string, any> = {}
  ): Promise<void> {
    try {
      logger.info(`Processing incoming message from ${phone} for user ${userId}`);

      // Encontrar ou criar contato
      let contact = await ContactModel.findOne({ userId, phone });
      if (!contact) {
        contact = new ContactModel({
          userId,
          phone,
          name: metadata.name || '',
          lastInteraction: new Date(),
          totalMessages: 1,
          channel: 'whatsapp',
          status: 'active'
        });
        await contact.save();
        
        logger.info(`Created new contact: ${phone}`);
      } else {
        // Atualizar contato existente
        contact.lastInteraction = new Date();
        contact.totalMessages += 1;
        await contact.save();
      }

      // Salvar mensagem
      const message = new ConversationMessageModel({
        userId,
        contactId: contact._id.toString(),
        sessionId,
        messageType: messageType as ConversationMessage['messageType'],
        content: messageContent,
        direction: 'inbound',
        timestamp: new Date(),
        metadata
      });
      await message.save();

      // Buscar automações ativas do usuário
      const automations = await AutomationModel.find({ 
        userId, 
        isActive: true 
      });

      // Processar cada automação
      for (const automation of automations) {
        if (await this.shouldTriggerAutomation(automation, contact, message)) {
          await this.executeAutomation(automation, contact, {
            triggerMessage: message,
            sessionId
          });
        }
      }

      // Rastrear evento de mensagem recebida
      await analyticsService.trackEvent(
        userId,
        'message',
        message._id.toString(),
        'received',
        1,
        { messageType, phone }
      );

    } catch (error) {
      logger.error('Error processing incoming message:', error);
    }
  }

  async executeAutomation(
    automation: Automation,
    contact: Contact,
    context: Record<string, any> = {}
  ): Promise<string | null> {
    try {
      logger.info(`Executing automation: ${automation.name} for contact: ${contact.phone}`);

      // Verificar condições da automação
      if (automation.conditions && automation.conditions.length > 0) {
        const conditionsMet = await this.evaluateConditions(automation.conditions, contact, context);
        if (!conditionsMet) {
          logger.info(`Automation conditions not met for: ${automation.name}`);
          return null;
        }
      }

      // Criar execução da automação
      const execution = new AutomationExecutionModel({
        automationId: automation.id!,
        contactId: contact.id!,
        status: 'running',
        currentStep: 0,
        totalSteps: automation.actions.length,
        startedAt: new Date(),
        context
      });
      await execution.save();

      // Executar ações da automação
      await this.executeAutomationActions(automation, contact, execution, context);

      // Atualizar estatísticas da automação
      await AutomationModel.updateOne(
        { _id: automation.id },
        {
          $inc: { 'statistics.executions': 1 },
          $set: { 'statistics.lastExecution': new Date() }
        }
      );

      // Rastrear execução
      await analyticsService.trackEvent(
        automation.userId,
        'automation',
        automation.id!,
        'execution',
        1,
        { contactId: contact.id, status: 'started' }
      );

      logger.info(`Automation execution started: ${execution._id}`);
      return execution._id.toString();

    } catch (error) {
      logger.error('Error executing automation:', error);
      
      // Rastrear erro
      await analyticsService.trackEvent(
        automation.userId,
        'automation',
        automation.id!,
        'execution_error',
        1,
        { error: error.message, contactId: contact.id }
      );
      
      return null;
    }
  }

  private async executeAutomationActions(
    automation: Automation,
    contact: Contact,
    execution: AutomationExecution & { _id: any },
    context: Record<string, any>
  ): Promise<void> {
    for (let i = 0; i < automation.actions.length; i++) {
      const action = automation.actions[i];
      
      try {
        // Atualizar step atual
        await AutomationExecutionModel.updateOne(
          { _id: execution._id },
          { currentStep: i + 1 }
        );

        await this.executeAction(action, contact, automation, context);

        // Se houver delay, agendar próxima ação
        if (action.type === 'delay' && action.config.delay) {
          if (i < automation.actions.length - 1) {
            await queueService.scheduleDelayedJob(
              'automation',
              {
                automationId: automation.id,
                contactId: contact.id,
                executionId: execution._id.toString(),
                stepIndex: i + 1,
                context
              },
              action.config.delay
            );
            return; // Parar aqui e continuar depois do delay
          }
        }

      } catch (error) {
        logger.error(`Error executing action ${i + 1} of automation ${automation.name}:`, error);
        
        // Marcar execução como falhou
        await AutomationExecutionModel.updateOne(
          { _id: execution._id },
          {
            status: 'failed',
            completedAt: new Date(),
            error: error.message
          }
        );

        return;
      }
    }

    // Marcar execução como completa
    await AutomationExecutionModel.updateOne(
      { _id: execution._id },
      {
        status: 'completed',
        completedAt: new Date()
      }
    );

    // Atualizar taxa de sucesso
    await this.updateAutomationSuccessRate(automation.id!);

    logger.info(`Automation execution completed: ${execution._id}`);
  }

  private async executeAction(
    action: AutomationAction,
    contact: Contact,
    automation: Automation,
    context: Record<string, any>
  ): Promise<void> {
    switch (action.type) {
      case 'send_message':
        await this.executeSendMessageAction(action, contact, automation, context);
        break;
      
      case 'add_tag':
        await this.executeAddTagAction(action, contact);
        break;
      
      case 'remove_tag':
        await this.executeRemoveTagAction(action, contact);
        break;
      
      case 'update_field':
        await this.executeUpdateFieldAction(action, contact);
        break;
      
      case 'webhook':
        await this.executeWebhookAction(action, contact, automation, context);
        break;
      
      case 'delay':
        // Delay é tratado no loop principal
        break;
        
      case 'send_file':
        await this.executeSendFileAction(action, contact, automation, context);
        break;
      
      default:
        logger.warn(`Unknown action type: ${action.type}`);
    }
  }

  private async executeSendMessageAction(
    action: AutomationAction,
    contact: Contact,
    automation: Automation,
    context: Record<string, any>
  ): Promise<void> {
    try {
      let messageContent = action.config.message || '';
      
      // Processar template se necessário
      if (action.config.message?.includes('{{')) {
        const variables = this.buildVariableContext(contact, context);
        messageContent = this.processTemplate(messageContent, variables);
      }

      const sessionId = context.sessionId || 'default';
      const client = this.whatsappClients.get(sessionId);
      
      if (!client) {
        throw new Error(`WhatsApp client not found for session: ${sessionId}`);
      }

      // Enviar mensagem via WPPConnect
      await client.sendText(contact.phone, messageContent);

      // Salvar mensagem enviada
      const message = new ConversationMessageModel({
        userId: automation.userId,
        contactId: contact.id!,
        sessionId,
        messageType: 'text',
        content: messageContent,
        direction: 'outbound',
        status: 'sent',
        automationId: automation.id,
        timestamp: new Date()
      });
      await message.save();

      // Rastrear mensagem enviada
      await analyticsService.trackEvent(
        automation.userId,
        'automation',
        automation.id!,
        'message_sent',
        1,
        { contactId: contact.id, messageLength: messageContent.length }
      );

      logger.info(`Message sent to ${contact.phone}: ${messageContent.substring(0, 50)}...`);

    } catch (error) {
      logger.error('Error sending message:', error);
      throw error;
    }
  }

  private async executeAddTagAction(
    action: AutomationAction,
    contact: Contact
  ): Promise<void> {
    try {
      const tag = action.config.tag || '';
      const tags = action.config.tags || [];
      const tagsToAdd = tag ? [tag] : tags;

      for (const tagToAdd of tagsToAdd) {
        if (!contact.tags.includes(tagToAdd)) {
          contact.tags.push(tagToAdd);
        }
      }

      await ContactModel.updateOne(
        { _id: contact.id },
        { tags: contact.tags }
      );

      logger.info(`Added tags to contact ${contact.phone}: ${tagsToAdd.join(', ')}`);

    } catch (error) {
      logger.error('Error adding tags:', error);
      throw error;
    }
  }

  private async executeRemoveTagAction(
    action: AutomationAction,
    contact: Contact
  ): Promise<void> {
    try {
      const tag = action.config.tag || '';
      const tags = action.config.tags || [];
      const tagsToRemove = tag ? [tag] : tags;

      contact.tags = contact.tags.filter(t => !tagsToRemove.includes(t));

      await ContactModel.updateOne(
        { _id: contact.id },
        { tags: contact.tags }
      );

      logger.info(`Removed tags from contact ${contact.phone}: ${tagsToRemove.join(', ')}`);

    } catch (error) {
      logger.error('Error removing tags:', error);
      throw error;
    }
  }

  private async executeUpdateFieldAction(
    action: AutomationAction,
    contact: Contact
  ): Promise<void> {
    try {
      const field = action.config.field;
      const value = action.config.value;

      if (!field) {
        throw new Error('Field name is required for update_field action');
      }

      const updateData: any = {};
      
      if (field === 'name') {
        updateData.name = value;
      } else if (field === 'email') {
        updateData.email = value;
      } else {
        // Campo customizado
        updateData[`customFields.${field}`] = value;
      }

      await ContactModel.updateOne({ _id: contact.id }, updateData);

      logger.info(`Updated field ${field} for contact ${contact.phone}: ${value}`);

    } catch (error) {
      logger.error('Error updating field:', error);
      throw error;
    }
  }

  private async executeWebhookAction(
    action: AutomationAction,
    contact: Contact,
    automation: Automation,
    context: Record<string, any>
  ): Promise<void> {
    try {
      const webhookConfig = action.config.webhook;
      if (!webhookConfig?.url) {
        throw new Error('Webhook URL is required for webhook action');
      }

      const payload = {
        automation: {
          id: automation.id,
          name: automation.name
        },
        contact: {
          id: contact.id,
          phone: contact.phone,
          name: contact.name,
          tags: contact.tags,
          customFields: contact.customFields
        },
        context,
        timestamp: new Date().toISOString(),
        ...webhookConfig.data
      };

      const response = await axios({
        method: webhookConfig.method || 'POST',
        url: webhookConfig.url,
        headers: {
          'Content-Type': 'application/json',
          ...webhookConfig.headers
        },
        data: payload,
        timeout: 30000
      });

      logger.info(`Webhook called successfully: ${webhookConfig.url} - Status: ${response.status}`);

    } catch (error) {
      logger.error('Error calling webhook:', error);
      throw error;
    }
  }

  private async executeSendFileAction(
    action: AutomationAction,
    contact: Contact,
    automation: Automation,
    context: Record<string, any>
  ): Promise<void> {
    try {
      const fileUrl = action.config.fileUrl;
      const fileName = action.config.fileName || 'file';
      
      if (!fileUrl) {
        throw new Error('File URL is required for send_file action');
      }

      const sessionId = context.sessionId || 'default';
      const client = this.whatsappClients.get(sessionId);
      
      if (!client) {
        throw new Error(`WhatsApp client not found for session: ${sessionId}`);
      }

      // Enviar arquivo via WPPConnect
      await client.sendFile(contact.phone, fileUrl, fileName);

      // Salvar mensagem enviada
      const message = new ConversationMessageModel({
        userId: automation.userId,
        contactId: contact.id!,
        sessionId,
        messageType: action.config.messageType || 'document',
        content: fileName,
        mediaUrl: fileUrl,
        direction: 'outbound',
        status: 'sent',
        automationId: automation.id,
        timestamp: new Date()
      });
      await message.save();

      logger.info(`File sent to ${contact.phone}: ${fileName}`);

    } catch (error) {
      logger.error('Error sending file:', error);
      throw error;
    }
  }

  private async shouldTriggerAutomation(
    automation: Automation,
    contact: Contact,
    message: ConversationMessage
  ): Promise<boolean> {
    try {
      const trigger = automation.trigger;
      
      switch (trigger.type) {
        case 'keyword':
          return this.checkKeywordTrigger(trigger.config.keywords || [], message.content);
        
        case 'event':
          // Para mensagens recebidas, sempre disparar se for do tipo correto
          return trigger.config.event?.type === 'message_received';
        
        case 'schedule':
          // Agendamentos são tratados separadamente
          return false;
        
        case 'webhook':
          // Webhooks são tratados separadamente
          return false;
        
        default:
          return false;
      }
    } catch (error) {
      logger.error('Error checking automation trigger:', error);
      return false;
    }
  }

  private checkKeywordTrigger(keywords: string[], messageContent: string): boolean {
    const content = messageContent.toLowerCase();
    return keywords.some(keyword => content.includes(keyword.toLowerCase()));
  }

  private async evaluateConditions(
    conditions: AutomationCondition[],
    contact: Contact,
    context: Record<string, any>
  ): Promise<boolean> {
    // Implementação simplificada - pode ser expandida
    for (const condition of conditions) {
      const fieldValue = this.getFieldValue(contact, condition.field);
      const conditionMet = this.evaluateCondition(fieldValue, condition.operator, condition.value);
      
      if (!conditionMet) {
        return false;
      }
    }
    
    return true;
  }

  private getFieldValue(contact: Contact, field: string): any {
    switch (field) {
      case 'name':
        return contact.name;
      case 'phone':
        return contact.phone;
      case 'email':
        return contact.email;
      case 'totalMessages':
        return contact.totalMessages;
      case 'tags':
        return contact.tags;
      default:
        return contact.customFields?.[field];
    }
  }

  private evaluateCondition(fieldValue: any, operator: string, conditionValue: any): boolean {
    switch (operator) {
      case 'equals':
        return fieldValue === conditionValue;
      case 'contains':
        return String(fieldValue).toLowerCase().includes(String(conditionValue).toLowerCase());
      case 'starts_with':
        return String(fieldValue).toLowerCase().startsWith(String(conditionValue).toLowerCase());
      case 'ends_with':
        return String(fieldValue).toLowerCase().endsWith(String(conditionValue).toLowerCase());
      case 'greater_than':
        return Number(fieldValue) > Number(conditionValue);
      case 'less_than':
        return Number(fieldValue) < Number(conditionValue);
      default:
        return false;
    }
  }

  private buildVariableContext(contact: Contact, context: Record<string, any>): Record<string, any> {
    const now = new Date();
    
    return {
      name: contact.name || 'Cliente',
      phone: contact.phone,
      email: contact.email || '',
      first_name: contact.name ? contact.name.split(' ')[0] : 'Cliente',
      current_date: now.toLocaleDateString('pt-BR'),
      current_time: now.toLocaleTimeString('pt-BR'),
      ...contact.customFields,
      ...context
    };
  }

  private processTemplate(content: string, variables: Record<string, any>): string {
    let processed = content;
    
    Object.keys(variables).forEach(key => {
      const regex = new RegExp(`\\{\\{\\s*${key}\\s*\\}\\}`, 'g');
      const value = variables[key] !== undefined ? variables[key].toString() : '';
      processed = processed.replace(regex, value);
    });
    
    return processed;
  }

  private async updateAutomationSuccessRate(automationId: string): Promise<void> {
    try {
      const executions = await AutomationExecutionModel.aggregate([
        { $match: { automationId } },
        {
          $group: {
            _id: null,
            total: { $sum: 1 },
            successful: {
              $sum: { $cond: [{ $eq: ['$status', 'completed'] }, 1, 0] }
            }
          }
        }
      ]);

      if (executions.length > 0) {
        const { total, successful } = executions[0];
        const successRate = (successful / total) * 100;
        
        await AutomationModel.updateOne(
          { _id: automationId },
          { 'statistics.successRate': successRate }
        );
      }
    } catch (error) {
      logger.error('Error updating automation success rate:', error);
    }
  }

  private setupQueueListeners(): void {
    queueService.on('processAutomation', async (data) => {
      try {
        const { automationId, contactId, executionId, stepIndex, context } = data;
        
        const automation = await AutomationModel.findById(automationId);
        const contact = await ContactModel.findById(contactId);
        const execution = await AutomationExecutionModel.findById(executionId);
        
        if (!automation || !contact || !execution) {
          logger.error('Missing data for automation processing');
          return;
        }

        // Continuar execução a partir do step especificado
        for (let i = stepIndex; i < automation.actions.length; i++) {
          const action = automation.actions[i];
          
          await AutomationExecutionModel.updateOne(
            { _id: executionId },
            { currentStep: i + 1 }
          );

          await this.executeAction(action, contact, automation, context);

          if (action.type === 'delay' && action.config.delay) {
            if (i < automation.actions.length - 1) {
              await queueService.scheduleDelayedJob(
                'automation',
                { ...data, stepIndex: i + 1 },
                action.config.delay
              );
              return;
            }
          }
        }

        // Marcar como completa
        await AutomationExecutionModel.updateOne(
          { _id: executionId },
          { status: 'completed', completedAt: new Date() }
        );

      } catch (error) {
        logger.error('Error processing queued automation:', error);
      }
    });
  }
}

export const automationEngine = new AutomationEngine();