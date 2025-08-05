/*
 * Copyright 2025 Unicaclub
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 */

import { ContactModel, ContactSegmentModel } from '../models/AutomationModels';
import { Contact, ContactSegment, SegmentCriteria } from '../types/AutomationTypes';
import { logger } from '../index';

export class ContactSegmentationService {
  
  async createSegment(
    userId: string,
    name: string,
    description: string | undefined,
    criteria: SegmentCriteria[]
  ): Promise<ContactSegment> {
    try {
      const segment = new ContactSegmentModel({
        userId,
        name,
        description,
        criteria,
        isActive: true
      });

      await segment.save();
      
      // Calcular contagem inicial
      const contactCount = await this.getSegmentContactCount(segment._id.toString());
      segment.contactCount = contactCount;
      await segment.save();

      logger.info(`Created contact segment: ${name} with ${contactCount} contacts`);
      return segment.toObject();
    } catch (error) {
      logger.error('Error creating contact segment:', error);
      throw error;
    }
  }

  async updateSegment(
    segmentId: string,
    updates: Partial<ContactSegment>
  ): Promise<ContactSegment | null> {
    try {
      const segment = await ContactSegmentModel.findByIdAndUpdate(
        segmentId,
        { ...updates, updatedAt: new Date() },
        { new: true }
      );

      if (!segment) {
        return null;
      }

      // Recalcular contagem se os critérios mudaram
      if (updates.criteria) {
        const contactCount = await this.getSegmentContactCount(segmentId);
        segment.contactCount = contactCount;
        await segment.save();
      }

      logger.info(`Updated contact segment: ${segment.name}`);
      return segment.toObject();
    } catch (error) {
      logger.error('Error updating contact segment:', error);
      throw error;
    }
  }

  async deleteSegment(segmentId: string): Promise<boolean> {
    try {
      const result = await ContactSegmentModel.deleteOne({ _id: segmentId });
      return result.deletedCount > 0;
    } catch (error) {
      logger.error('Error deleting contact segment:', error);
      return false;
    }
  }

  async getSegment(segmentId: string): Promise<ContactSegment | null> {
    try {
      const segment = await ContactSegmentModel.findById(segmentId).lean();
      return segment;
    } catch (error) {
      logger.error('Error getting contact segment:', error);
      return null;
    }
  }

  async getUserSegments(userId: string): Promise<ContactSegment[]> {
    try {
      const segments = await ContactSegmentModel.find({ userId }).lean();
      return segments;
    } catch (error) {
      logger.error('Error getting user segments:', error);
      return [];
    }
  }

  async getSegmentContacts(segmentId: string, limit = 100, skip = 0): Promise<Contact[]> {
    try {
      const segment = await ContactSegmentModel.findById(segmentId);
      if (!segment) {
        return [];
      }

      const mongoQuery = this.buildMongoQuery(segment.userId, segment.criteria);
      const contacts = await ContactModel.find(mongoQuery)
        .limit(limit)
        .skip(skip)
        .lean();

      return contacts;
    } catch (error) {
      logger.error('Error getting segment contacts:', error);
      return [];
    }
  }

  async getSegmentContactCount(segmentId: string): Promise<number> {
    try {
      const segment = await ContactSegmentModel.findById(segmentId);
      if (!segment) {
        return 0;
      }

      const mongoQuery = this.buildMongoQuery(segment.userId, segment.criteria);
      const count = await ContactModel.countDocuments(mongoQuery);
      
      return count;
    } catch (error) {
      logger.error('Error getting segment contact count:', error);
      return 0;
    }
  }

  async addContactToSegment(contactId: string, segmentId: string): Promise<boolean> {
    try {
      // Para adicionar manualmente um contato a um segmento,
      // podemos usar uma tag especial ou campo customizado
      const contact = await ContactModel.findById(contactId);
      const segment = await ContactSegmentModel.findById(segmentId);
      
      if (!contact || !segment) {
        return false;
      }

      const segmentTag = `segment_${segmentId}`;
      if (!contact.tags.includes(segmentTag)) {
        contact.tags.push(segmentTag);
        await contact.save();
      }

      return true;
    } catch (error) {
      logger.error('Error adding contact to segment:', error);
      return false;
    }
  }

  async removeContactFromSegment(contactId: string, segmentId: string): Promise<boolean> {
    try {
      const contact = await ContactModel.findById(contactId);
      if (!contact) {
        return false;
      }

      const segmentTag = `segment_${segmentId}`;
      contact.tags = contact.tags.filter(tag => tag !== segmentTag);
      await contact.save();

      return true;
    } catch (error) {
      logger.error('Error removing contact from segment:', error);
      return false;
    }
  }

  async getContactSegments(contactId: string): Promise<ContactSegment[]> {
    try {
      const contact = await ContactModel.findById(contactId);
      if (!contact) {
        return [];
      }

      // Buscar segmentos onde o contato se encaixa nos critérios
      const segments = await ContactSegmentModel.find({ 
        userId: contact.userId,
        isActive: true 
      });

      const matchingSegments: ContactSegment[] = [];

      for (const segment of segments) {
        const mongoQuery = this.buildMongoQuery(contact.userId, segment.criteria);
        mongoQuery._id = contactId;
        
        const matches = await ContactModel.countDocuments(mongoQuery);
        if (matches > 0) {
          matchingSegments.push(segment.toObject());
        }
      }

      return matchingSegments;
    } catch (error) {
      logger.error('Error getting contact segments:', error);
      return [];
    }
  }

  async refreshSegmentCounts(userId?: string): Promise<void> {
    try {
      const query = userId ? { userId } : {};
      const segments = await ContactSegmentModel.find(query);

      for (const segment of segments) {
        const contactCount = await this.getSegmentContactCount(segment._id.toString());
        segment.contactCount = contactCount;
        await segment.save();
      }

      logger.info(`Refreshed contact counts for ${segments.length} segments`);
    } catch (error) {
      logger.error('Error refreshing segment counts:', error);
    }
  }

  private buildMongoQuery(userId: string, criteria: SegmentCriteria[]): any {
    const baseQuery = { userId, status: { $ne: 'unsubscribed' } };
    
    if (criteria.length === 0) {
      return baseQuery;
    }

    const conditions: any[] = [];
    let currentGroup: any[] = [];
    let currentOperator: 'and' | 'or' = 'and';

    for (let i = 0; i < criteria.length; i++) {
      const criterion = criteria[i];
      const condition = this.buildCondition(criterion);
      
      if (i === 0) {
        currentGroup.push(condition);
        currentOperator = criterion.logicalOperator || 'and';
      } else {
        if (criterion.logicalOperator === currentOperator || !criterion.logicalOperator) {
          currentGroup.push(condition);
        } else {
          // Finalizar grupo atual
          conditions.push(currentOperator === 'and' ? { $and: currentGroup } : { $or: currentGroup });
          
          // Iniciar novo grupo
          currentGroup = [condition];
          currentOperator = criterion.logicalOperator;
        }
      }
    }

    // Adicionar último grupo
    if (currentGroup.length > 0) {
      conditions.push(currentOperator === 'and' ? { $and: currentGroup } : { $or: currentGroup });
    }

    if (conditions.length === 1) {
      return { ...baseQuery, ...conditions[0] };
    } else {
      return { ...baseQuery, $and: conditions };
    }
  }

  private buildCondition(criterion: SegmentCriteria): any {
    const { field, operator, value } = criterion;
    
    switch (operator) {
      case 'equals':
        return { [field]: value };
      
      case 'contains':
        return { [field]: { $regex: value, $options: 'i' } };
      
      case 'starts_with':
        return { [field]: { $regex: `^${value}`, $options: 'i' } };
      
      case 'ends_with':
        return { [field]: { $regex: `${value}$`, $options: 'i' } };
      
      case 'greater_than':
        return { [field]: { $gt: value } };
      
      case 'less_than':
        return { [field]: { $lt: value } };
      
      case 'in':
        return { [field]: { $in: Array.isArray(value) ? value : [value] } };
      
      case 'not_in':
        return { [field]: { $nin: Array.isArray(value) ? value : [value] } };
      
      default:
        return { [field]: value };
    }
  }

  // Métodos para segmentação automática baseada em comportamento
  async createBehaviorSegments(userId: string): Promise<void> {
    try {
      // Segmento de contatos ativos (interagiram nos últimos 30 dias)
      await this.createSegmentIfNotExists(userId, 'Contatos Ativos', [
        {
          field: 'lastInteraction',
          operator: 'greater_than',
          value: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) // 30 dias atrás
        }
      ]);

      // Segmento de contatos inativos
      await this.createSegmentIfNotExists(userId, 'Contatos Inativos', [
        {
          field: 'lastInteraction',
          operator: 'less_than',
          value: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
        }
      ]);

      // Segmento de contatos engajados (muitas mensagens)
      await this.createSegmentIfNotExists(userId, 'Contatos Engajados', [
        {
          field: 'totalMessages',
          operator: 'greater_than',
          value: 10
        }
      ]);

      // Segmento de novos contatos (criados nos últimos 7 dias)
      await this.createSegmentIfNotExists(userId, 'Novos Contatos', [
        {
          field: 'createdAt',
          operator: 'greater_than',
          value: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
        }
      ]);

      logger.info(`Created behavior segments for user ${userId}`);
    } catch (error) {
      logger.error('Error creating behavior segments:', error);
    }
  }

  private async createSegmentIfNotExists(
    userId: string,
    name: string,
    criteria: SegmentCriteria[]
  ): Promise<void> {
    const existing = await ContactSegmentModel.findOne({ userId, name });
    if (!existing) {
      await this.createSegment(userId, name, `Segmento criado automaticamente: ${name}`, criteria);
    }
  }
}

export const contactSegmentationService = new ContactSegmentationService();