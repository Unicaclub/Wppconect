/*
 * Copyright 2025 Unicaclub
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 */

import { MessageTemplateModel, ContactModel } from '../models/AutomationModels';
import { MessageTemplate, Contact } from '../types/AutomationTypes';
import { logger } from '../index';

export class MessageTemplateService {

  async createTemplate(
    userId: string,
    name: string,
    content: string,
    messageType: MessageTemplate['messageType'] = 'text',
    options: {
      mediaUrl?: string;
      category?: MessageTemplate['category'];
    } = {}
  ): Promise<MessageTemplate> {
    try {
      const variables = this.extractVariables(content);
      
      const template = new MessageTemplateModel({
        userId,
        name,
        content,
        variables,
        messageType,
        mediaUrl: options.mediaUrl,
        category: options.category || 'utility',
        isActive: true
      });

      await template.save();
      
      logger.info(`Created message template: ${name} with ${variables.length} variables`);
      return template.toObject();
    } catch (error) {
      logger.error('Error creating message template:', error);
      throw error;
    }
  }

  async updateTemplate(
    templateId: string,
    updates: Partial<MessageTemplate>
  ): Promise<MessageTemplate | null> {
    try {
      if (updates.content) {
        updates.variables = this.extractVariables(updates.content);
      }

      const template = await MessageTemplateModel.findByIdAndUpdate(
        templateId,
        { ...updates, updatedAt: new Date() },
        { new: true }
      );

      if (!template) {
        return null;
      }

      logger.info(`Updated message template: ${template.name}`);
      return template.toObject();
    } catch (error) {
      logger.error('Error updating message template:', error);
      throw error;
    }
  }

  async deleteTemplate(templateId: string): Promise<boolean> {
    try {
      const result = await MessageTemplateModel.deleteOne({ _id: templateId });
      return result.deletedCount > 0;
    } catch (error) {
      logger.error('Error deleting message template:', error);
      return false;
    }
  }

  async getTemplate(templateId: string): Promise<MessageTemplate | null> {
    try {
      const template = await MessageTemplateModel.findById(templateId).lean();
      return template;
    } catch (error) {
      logger.error('Error getting message template:', error);
      return null;
    }
  }

  async getUserTemplates(userId: string): Promise<MessageTemplate[]> {
    try {
      const templates = await MessageTemplateModel.find({ userId }).lean();
      return templates;
    } catch (error) {
      logger.error('Error getting user templates:', error);
      return [];
    }
  }

  async renderTemplate(
    templateId: string,
    contactId: string,
    customVariables: Record<string, any> = {}
  ): Promise<{
    content: string;
    messageType: MessageTemplate['messageType'];
    mediaUrl?: string;
  } | null> {
    try {
      const template = await MessageTemplateModel.findById(templateId);
      const contact = await ContactModel.findById(contactId);
      
      if (!template || !contact) {
        return null;
      }

      const variables = this.buildVariableContext(contact, customVariables);
      const renderedContent = this.processTemplate(template.content, variables);
      
      // Atualizar estatísticas do template
      await this.incrementTemplateStats(templateId, 'sent');

      return {
        content: renderedContent,
        messageType: template.messageType,
        mediaUrl: template.mediaUrl
      };
    } catch (error) {
      logger.error('Error rendering template:', error);
      return null;
    }
  }

  async renderTemplateForContact(
    templateId: string,
    contact: Contact,
    customVariables: Record<string, any> = {}
  ): Promise<{
    content: string;
    messageType: MessageTemplate['messageType'];
    mediaUrl?: string;
  } | null> {
    try {
      const template = await MessageTemplateModel.findById(templateId);
      
      if (!template) {
        return null;
      }

      const variables = this.buildVariableContext(contact, customVariables);
      const renderedContent = this.processTemplate(template.content, variables);
      
      return {
        content: renderedContent,
        messageType: template.messageType,
        mediaUrl: template.mediaUrl
      };
    } catch (error) {
      logger.error('Error rendering template for contact:', error);
      return null;
    }
  }

  async validateTemplate(content: string): Promise<{
    isValid: boolean;
    variables: string[];
    errors: string[];
  }> {
    const errors: string[] = [];
    const variables = this.extractVariables(content);
    
    // Verificar se há variáveis não fechadas
    const openBraces = (content.match(/\{\{/g) || []).length;
    const closeBraces = (content.match(/\}\}/g) || []).length;
    
    if (openBraces !== closeBraces) {
      errors.push('Variáveis não fechadas corretamente. Use {{variavel}}');
    }

    // Verificar se há variáveis vazias
    if (content.includes('{{}}')) {
      errors.push('Variáveis vazias encontradas');
    }

    // Verificar tamanho do conteúdo
    if (content.length > 4096) {
      errors.push('Conteúdo muito longo. Máximo 4096 caracteres');
    }

    return {
      isValid: errors.length === 0,
      variables,
      errors
    };
  }

  async previewTemplate(
    templateId: string,
    sampleData: Record<string, any> = {}
  ): Promise<string | null> {
    try {
      const template = await MessageTemplateModel.findById(templateId);
      if (!template) {
        return null;
      }

      // Dados de exemplo padrão
      const defaultSampleData = {
        name: 'João Silva',
        phone: '+5511999999999',
        email: 'joao@exemplo.com',
        company: 'Empresa XYZ',
        first_name: 'João',
        last_name: 'Silva',
        current_date: new Date().toLocaleDateString('pt-BR'),
        current_time: new Date().toLocaleTimeString('pt-BR'),
        day_of_week: new Date().toLocaleDateString('pt-BR', { weekday: 'long' }),
        month: new Date().toLocaleDateString('pt-BR', { month: 'long' }),
        year: new Date().getFullYear().toString()
      };

      const variables = { ...defaultSampleData, ...sampleData };
      return this.processTemplate(template.content, variables);
    } catch (error) {
      logger.error('Error previewing template:', error);
      return null;
    }
  }

  private extractVariables(content: string): string[] {
    const variableRegex = /\{\{([^}]+)\}\}/g;
    const variables: string[] = [];
    let match;

    while ((match = variableRegex.exec(content)) !== null) {
      const variable = match[1].trim();
      if (!variables.includes(variable)) {
        variables.push(variable);
      }
    }

    return variables;
  }

  private buildVariableContext(
    contact: Contact,
    customVariables: Record<string, any> = {}
  ): Record<string, any> {
    const now = new Date();
    
    // Variáveis do contato
    const contactVars = {
      name: contact.name || 'Cliente',
      phone: contact.phone,
      email: contact.email || '',
      first_name: contact.name ? contact.name.split(' ')[0] : 'Cliente',
      last_name: contact.name ? contact.name.split(' ').slice(1).join(' ') : '',
      ...contact.customFields
    };

    // Variáveis de data/hora
    const dateTimeVars = {
      current_date: now.toLocaleDateString('pt-BR'),
      current_time: now.toLocaleTimeString('pt-BR'),
      current_datetime: now.toLocaleString('pt-BR'),
      day_of_week: now.toLocaleDateString('pt-BR', { weekday: 'long' }),
      month: now.toLocaleDateString('pt-BR', { month: 'long' }),
      year: now.getFullYear().toString(),
      day: now.getDate().toString().padStart(2, '0'),
      month_number: (now.getMonth() + 1).toString().padStart(2, '0')
    };

    // Variáveis do sistema
    const systemVars = {
      company_name: 'Sua Empresa', // Pode ser configurável
      support_phone: '+55 11 99999-9999', // Pode ser configurável
      website: 'https://suaempresa.com' // Pode ser configurável
    };

    return {
      ...contactVars,
      ...dateTimeVars,
      ...systemVars,
      ...customVariables
    };
  }

  private processTemplate(content: string, variables: Record<string, any>): string {
    let processed = content;

    // Substituir variáveis simples
    Object.keys(variables).forEach(key => {
      const regex = new RegExp(`\\{\\{\\s*${key}\\s*\\}\\}`, 'g');
      const value = variables[key] !== undefined ? variables[key].toString() : '';
      processed = processed.replace(regex, value);
    });

    // Processar funções especiais
    processed = this.processSpecialFunctions(processed, variables);

    // Remover variáveis não encontradas (opcional - pode deixar as chaves)
    processed = processed.replace(/\{\{[^}]+\}\}/g, '');

    return processed.trim();
  }

  private processSpecialFunctions(content: string, variables: Record<string, any>): string {
    let processed = content;

    // Função de capitalização: {{capitalize(name)}}
    processed = processed.replace(/\{\{capitalize\(([^)]+)\)\}\}/g, (match, variable) => {
      const value = variables[variable.trim()] || '';
      return value.toString().charAt(0).toUpperCase() + value.toString().slice(1).toLowerCase();
    });

    // Função de uppercase: {{upper(name)}}
    processed = processed.replace(/\{\{upper\(([^)]+)\)\}\}/g, (match, variable) => {
      const value = variables[variable.trim()] || '';
      return value.toString().toUpperCase();
    });

    // Função de lowercase: {{lower(name)}}
    processed = processed.replace(/\{\{lower\(([^)]+)\)\}\}/g, (match, variable) => {
      const value = variables[variable.trim()] || '';
      return value.toString().toLowerCase();
    });

    // Função condicional: {{if(variable, "texto se verdadeiro", "texto se falso")}}
    processed = processed.replace(/\{\{if\(([^,]+),\s*"([^"]*)",\s*"([^"]*)"\)\}\}/g, 
      (match, variable, trueText, falseText) => {
        const value = variables[variable.trim()];
        return value ? trueText : falseText;
      }
    );

    return processed;
  }

  async incrementTemplateStats(
    templateId: string,
    metric: 'sent' | 'delivered' | 'read' | 'clicked'
  ): Promise<void> {
    try {
      await MessageTemplateModel.updateOne(
        { _id: templateId },
        { $inc: { [`statistics.${metric}`]: 1 } }
      );
    } catch (error) {
      logger.error('Error incrementing template stats:', error);
    }
  }

  async getTemplateStats(templateId: string): Promise<MessageTemplate['statistics'] | null> {
    try {
      const template = await MessageTemplateModel.findById(templateId).select('statistics');
      return template?.statistics || null;
    } catch (error) {
      logger.error('Error getting template stats:', error);
      return null;
    }
  }

  async duplicateTemplate(
    templateId: string,
    newName: string
  ): Promise<MessageTemplate | null> {
    try {
      const originalTemplate = await MessageTemplateModel.findById(templateId);
      if (!originalTemplate) {
        return null;
      }

      const duplicatedTemplate = new MessageTemplateModel({
        userId: originalTemplate.userId,
        name: newName,
        content: originalTemplate.content,
        variables: originalTemplate.variables,
        messageType: originalTemplate.messageType,
        mediaUrl: originalTemplate.mediaUrl,
        category: originalTemplate.category,
        isActive: true
      });

      await duplicatedTemplate.save();
      
      logger.info(`Duplicated template: ${originalTemplate.name} -> ${newName}`);
      return duplicatedTemplate.toObject();
    } catch (error) {
      logger.error('Error duplicating template:', error);
      throw error;
    }
  }

  async searchTemplates(
    userId: string,
    query: string,
    filters: {
      category?: MessageTemplate['category'];
      messageType?: MessageTemplate['messageType'];
      isActive?: boolean;
    } = {}
  ): Promise<MessageTemplate[]> {
    try {
      const searchQuery: any = { 
        userId,
        $or: [
          { name: { $regex: query, $options: 'i' } },
          { content: { $regex: query, $options: 'i' } }
        ]
      };

      if (filters.category) {
        searchQuery.category = filters.category;
      }

      if (filters.messageType) {
        searchQuery.messageType = filters.messageType;
      }

      if (filters.isActive !== undefined) {
        searchQuery.isActive = filters.isActive;
      }

      const templates = await MessageTemplateModel.find(searchQuery).lean();
      return templates;
    } catch (error) {
      logger.error('Error searching templates:', error);
      return [];
    }
  }
}

export const messageTemplateService = new MessageTemplateService();