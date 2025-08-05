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
import { AutomationModel, ContactModel, MessageTemplateModel } from '../models/AutomationModels';
import { automationEngine } from '../services/AutomationEngine';
import { messageTemplateService } from '../services/MessageTemplateService';
import { contactSegmentationService } from '../services/ContactSegmentationService';
import { analyticsService } from '../services/AnalyticsService';
import { queueService } from '../services/QueueService';

// Automations
export const createAutomation = async (req: Request, res: Response) => {
  try {
    const { userId, name, description, trigger, actions, conditions } = req.body;

    if (!userId || !name || !trigger || !actions) {
      return res.status(400).json({
        status: 'error',
        message: 'Missing required fields: userId, name, trigger, actions'
      });
    }

    const automation = new AutomationModel({
      userId,
      name,
      description,
      trigger,
      actions,
      conditions: conditions || [],
      isActive: true
    });

    await automation.save();

    res.status(201).json({
      status: 'success',
      message: 'Automation created successfully',
      data: automation
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: error.message
    });
  }
};

export const getAutomations = async (req: Request, res: Response) => {
  try {
    const { userId } = req.params;
    const { page = 1, limit = 10, search, isActive } = req.query;

    const query: any = { userId };
    
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }

    if (isActive !== undefined) {
      query.isActive = isActive === 'true';
    }

    const skip = (Number(page) - 1) * Number(limit);
    const automations = await AutomationModel.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number(limit));

    const total = await AutomationModel.countDocuments(query);

    res.json({
      status: 'success',
      data: {
        automations,
        pagination: {
          page: Number(page),
          limit: Number(limit),
          total,
          pages: Math.ceil(total / Number(limit))
        }
      }
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: error.message
    });
  }
};

export const getAutomation = async (req: Request, res: Response) => {
  try {
    const { automationId } = req.params;
    
    const automation = await AutomationModel.findById(automationId);
    
    if (!automation) {
      return res.status(404).json({
        status: 'error',
        message: 'Automation not found'
      });
    }

    res.json({
      status: 'success',
      data: automation
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: error.message
    });
  }
};

export const updateAutomation = async (req: Request, res: Response) => {
  try {
    const { automationId } = req.params;
    const updates = req.body;

    const automation = await AutomationModel.findByIdAndUpdate(
      automationId,
      { ...updates, updatedAt: new Date() },
      { new: true }
    );

    if (!automation) {
      return res.status(404).json({
        status: 'error',
        message: 'Automation not found'
      });
    }

    res.json({
      status: 'success',
      message: 'Automation updated successfully',
      data: automation
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: error.message
    });
  }
};

export const deleteAutomation = async (req: Request, res: Response) => {
  try {
    const { automationId } = req.params;

    const automation = await AutomationModel.findByIdAndDelete(automationId);

    if (!automation) {
      return res.status(404).json({
        status: 'error',
        message: 'Automation not found'
      });
    }

    res.json({
      status: 'success',
      message: 'Automation deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: error.message
    });
  }
};

export const toggleAutomation = async (req: Request, res: Response) => {
  try {
    const { automationId } = req.params;
    const { isActive } = req.body;

    const automation = await AutomationModel.findByIdAndUpdate(
      automationId,
      { isActive, updatedAt: new Date() },
      { new: true }
    );

    if (!automation) {
      return res.status(404).json({
        status: 'error',
        message: 'Automation not found'
      });
    }

    res.json({
      status: 'success',
      message: `Automation ${isActive ? 'activated' : 'deactivated'} successfully`,
      data: automation
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: error.message
    });
  }
};

export const testAutomation = async (req: Request, res: Response) => {
  try {
    const { automationId } = req.params;
    const { contactId, testData = {} } = req.body;

    const automation = await AutomationModel.findById(automationId);
    const contact = await ContactModel.findById(contactId);

    if (!automation || !contact) {
      return res.status(404).json({
        status: 'error',
        message: 'Automation or contact not found'
      });
    }

    const executionId = await automationEngine.executeAutomation(
      automation.toObject(),
      contact.toObject(),
      { ...testData, isTest: true }
    );

    res.json({
      status: 'success',
      message: 'Automation test started',
      data: { executionId }
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: error.message
    });
  }
};

// Message Templates
export const createMessageTemplate = async (req: Request, res: Response) => {
  try {
    const { userId, name, content, messageType, mediaUrl, category } = req.body;

    if (!userId || !name || !content) {
      return res.status(400).json({
        status: 'error',
        message: 'Missing required fields: userId, name, content'
      });
    }

    const template = await messageTemplateService.createTemplate(
      userId,
      name,
      content,
      messageType,
      { mediaUrl, category }
    );

    res.status(201).json({
      status: 'success',
      message: 'Message template created successfully',
      data: template
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: error.message
    });
  }
};

export const getMessageTemplates = async (req: Request, res: Response) => {
  try {
    const { userId } = req.params;
    const { search, category, messageType, isActive } = req.query;

    let templates = await messageTemplateService.getUserTemplates(userId);

    // Aplicar filtros
    if (search) {
      templates = await messageTemplateService.searchTemplates(
        userId,
        search as string,
        {
          category: category as any,
          messageType: messageType as any,
          isActive: isActive ? isActive === 'true' : undefined
        }
      );
    }

    res.json({
      status: 'success',
      data: templates
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: error.message
    });
  }
};

export const previewMessageTemplate = async (req: Request, res: Response) => {
  try {
    const { templateId } = req.params;
    const { sampleData = {} } = req.body;

    const preview = await messageTemplateService.previewTemplate(templateId, sampleData);

    if (!preview) {
      return res.status(404).json({
        status: 'error',
        message: 'Template not found'
      });
    }

    res.json({
      status: 'success',
      data: { preview }
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: error.message
    });
  }
};

// Contact Segments
export const createContactSegment = async (req: Request, res: Response) => {
  try {
    const { userId, name, description, criteria } = req.body;

    if (!userId || !name || !criteria) {
      return res.status(400).json({
        status: 'error',
        message: 'Missing required fields: userId, name, criteria'
      });
    }

    const segment = await contactSegmentationService.createSegment(
      userId,
      name,
      description,
      criteria
    );

    res.status(201).json({
      status: 'success',
      message: 'Contact segment created successfully',
      data: segment
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: error.message
    });
  }
};

export const getContactSegments = async (req: Request, res: Response) => {
  try {
    const { userId } = req.params;
    
    const segments = await contactSegmentationService.getUserSegments(userId);

    res.json({
      status: 'success',
      data: segments
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: error.message
    });
  }
};

export const getSegmentContacts = async (req: Request, res: Response) => {
  try {
    const { segmentId } = req.params;
    const { page = 1, limit = 50 } = req.query;

    const skip = (Number(page) - 1) * Number(limit);
    const contacts = await contactSegmentationService.getSegmentContacts(
      segmentId,
      Number(limit),
      skip
    );

    const total = await contactSegmentationService.getSegmentContactCount(segmentId);

    res.json({
      status: 'success',
      data: {
        contacts,
        pagination: {
          page: Number(page),
          limit: Number(limit),
          total,
          pages: Math.ceil(total / Number(limit))
        }
      }
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: error.message
    });
  }
};

// Analytics
export const getDashboardMetrics = async (req: Request, res: Response) => {
  try {
    const { userId } = req.params;
    const { period = 'month' } = req.query;

    const metrics = await analyticsService.getDashboardMetrics(
      userId,
      period as any
    );

    res.json({
      status: 'success',
      data: metrics
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: error.message
    });
  }
};

export const getAutomationAnalytics = async (req: Request, res: Response) => {
  try {
    const { automationId } = req.params;
    const { period = 'month' } = req.query;

    const analytics = await analyticsService.getAutomationAnalytics(
      automationId,
      period as any
    );

    if (!analytics) {
      return res.status(404).json({
        status: 'error',
        message: 'Automation not found'
      });
    }

    res.json({
      status: 'success',
      data: analytics
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: error.message
    });
  }
};

export const getContactAnalytics = async (req: Request, res: Response) => {
  try {
    const { userId } = req.params;
    const { period = 'month' } = req.query;

    const analytics = await analyticsService.getContactAnalytics(
      userId,
      period as any
    );

    res.json({
      status: 'success',
      data: analytics
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: error.message
    });
  }
};

export const getMessageAnalytics = async (req: Request, res: Response) => {
  try {
    const { userId } = req.params;
    const { period = 'month' } = req.query;

    const analytics = await analyticsService.getMessageAnalytics(
      userId,
      period as any
    );

    res.json({
      status: 'success',
      data: analytics
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: error.message
    });
  }
};

// Queue Management
export const getQueueStats = async (req: Request, res: Response) => {
  try {
    const stats = await queueService.getQueueStats();

    res.json({
      status: 'success',
      data: stats
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: error.message
    });
  }
};

export const retryFailedJob = async (req: Request, res: Response) => {
  try {
    const { jobId } = req.params;

    const success = await queueService.retryFailedJob(jobId);

    if (!success) {
      return res.status(404).json({
        status: 'error',
        message: 'Job not found or cannot be retried'
      });
    }

    res.json({
      status: 'success',
      message: 'Job scheduled for retry'
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: error.message
    });
  }
};

// Contacts
export const getContacts = async (req: Request, res: Response) => {
  try {
    const { userId } = req.params;
    const { page = 1, limit = 50, search, tag, status } = req.query;

    const query: any = { userId };
    
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { phone: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } }
      ];
    }

    if (tag) {
      query.tags = { $in: [tag] };
    }

    if (status) {
      query.status = status;
    }

    const skip = (Number(page) - 1) * Number(limit);
    const contacts = await ContactModel.find(query)
      .sort({ lastInteraction: -1 })
      .skip(skip)
      .limit(Number(limit));

    const total = await ContactModel.countDocuments(query);

    res.json({
      status: 'success',
      data: {
        contacts,
        pagination: {
          page: Number(page),
          limit: Number(limit),
          total,
          pages: Math.ceil(total / Number(limit))
        }
      }
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: error.message
    });
  }
};

export const updateContact = async (req: Request, res: Response) => {
  try {
    const { contactId } = req.params;
    const updates = req.body;

    const contact = await ContactModel.findByIdAndUpdate(
      contactId,
      { ...updates, updatedAt: new Date() },
      { new: true }
    );

    if (!contact) {
      return res.status(404).json({
        status: 'error',
        message: 'Contact not found'
      });
    }

    res.json({
      status: 'success',
      message: 'Contact updated successfully',
      data: contact
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: error.message
    });
  }
};