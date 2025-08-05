/*
 * Copyright 2025 Unicaclub
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 */

import { Request, Response, NextFunction } from 'express';
import { automationEngine } from '../services/AutomationEngine';
import { analyticsService } from '../services/AnalyticsService';
import { contactSegmentationService } from '../services/ContactSegmentationService';
import { isMongoConnected } from '../util/db/mongodb/connection';
import { logger } from '../index';

interface AutomationRequest extends Request {
  client?: any;
  session?: string;
  serverOptions?: any;
  automationEnabled?: boolean;
}

export const automationIntegrationMiddleware = (
  req: AutomationRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    // Verificar se MongoDB está conectado
    req.automationEnabled = isMongoConnected();
    
    if (!req.automationEnabled) {
      logger.debug('Automation features disabled - MongoDB not connected');
      return next();
    }

    // Registrar cliente WhatsApp no AutomationEngine quando disponível
    if (req.client && req.session) {
      automationEngine.setWhatsAppClient(req.session, req.client);
      logger.debug(`WhatsApp client registered for session: ${req.session}`);
    }

    next();
  } catch (error) {
    logger.error('Error in automation integration middleware:', error);
    req.automationEnabled = false;
    next();
  }
};

export const webhookAutomationMiddleware = async (
  req: AutomationRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    // Só processar se automação estiver habilitada
    if (!req.automationEnabled && !isMongoConnected()) {
      return next();
    }

    const webhookData = req.body;
    
    // Processar webhooks do WPPConnect existentes
    if (webhookData && typeof webhookData === 'object') {
      await processWPPConnectWebhook(webhookData, req);
    }

    next();
  } catch (error) {
    logger.error('Error in webhook automation middleware:', error);
    next();
  }
};

async function processWPPConnectWebhook(data: any, req: AutomationRequest): Promise<void> {
  try {
    // Processar diferentes tipos de eventos do WPPConnect
    if (data.event === 'onmessage' && data.data) {
      await processIncomingMessage(data, req);
    } else if (data.event === 'onack') {
      await processMessageAck(data);
    } else if (data.event === 'onpresencechanged') {
      await processPresenceChange(data);
    }
  } catch (error) {
    logger.error('Error processing WPPConnect webhook:', error);
  }
}

async function processIncomingMessage(data: any, req: AutomationRequest): Promise<void> {
  try {
    const messageData = data.data;
    
    // Extrair informações da mensagem
    const sessionId = data.session || req.session || 'default';
    const userId = extractUserIdFromSession(sessionId);
    const phone = messageData.from || messageData.author;
    const messageContent = messageData.body || messageData.content || '';
    const messageType = messageData.type || 'text';
    const isGroupMessage = messageData.isGroupMsg || false;

    // Só processar mensagens individuais (não de grupo) e não enviadas por nós
    if (!isGroupMessage && !messageData.fromMe && phone && messageContent) {
      logger.info(`Processing incoming message from ${phone}: ${messageContent.substring(0, 50)}...`);
      
      await automationEngine.processIncomingMessage(
        userId,
        sessionId,
        phone,
        messageContent,
        messageType,
        {
          messageId: messageData.id,
          timestamp: messageData.timestamp || Date.now(),
          quotedMessage: messageData.quotedMsg,
          mentionedJidList: messageData.mentionedJidList,
          chat: messageData.chat,
          sender: messageData.sender,
          isForwarded: messageData.isForwarded,
          mediaUrl: messageData.clientUrl || messageData.deprecatedMms3Url,
          caption: messageData.caption,
          filename: messageData.filename
        }
      );

      // Rastrear evento de mensagem recebida
      await analyticsService.trackEvent(
        userId,
        'message',
        messageData.id || generateMessageId(),
        'received',
        1,
        { 
          messageType, 
          phone, 
          sessionId,
          messageLength: messageContent.length
        }
      );
    }
  } catch (error) {
    logger.error('Error processing incoming message:', error);
  }
}

async function processMessageAck(data: any): Promise<void> {
  try {
    const ackData = data.data;
    const sessionId = data.session;
    const userId = extractUserIdFromSession(sessionId);
    
    if (ackData.id && ackData.ack !== undefined) {
      let status = 'sent';
      
      switch (ackData.ack) {
        case 1:
          status = 'sent';
          break;
        case 2:
          status = 'delivered';
          break;
        case 3:
          status = 'read';
          break;
        default:
          status = 'sent';
      }

      // Rastrear atualização de status
      await analyticsService.trackEvent(
        userId,
        'message',
        ackData.id,
        `status_${status}`,
        1,
        { sessionId, ack: ackData.ack }
      );
    }
  } catch (error) {
    logger.error('Error processing message ack:', error);
  }
}

async function processPresenceChange(data: any): Promise<void> {
  try {
    const presenceData = data.data;
    const sessionId = data.session;
    const userId = extractUserIdFromSession(sessionId);
    
    if (presenceData.id && presenceData.state) {
      // Rastrear mudança de presença
      await analyticsService.trackEvent(
        userId,
        'contact',
        presenceData.id,
        'presence_change',
        1,
        { 
          sessionId, 
          state: presenceData.state,
          timestamp: Date.now()
        }
      );
    }
  } catch (error) {
    logger.error('Error processing presence change:', error);
  }
}

function extractUserIdFromSession(sessionId: string): string {
  // Implementar lógica para extrair userId do sessionId
  // Por exemplo, se sessionId tem formato "user123_session" ou apenas "user123"
  
  if (!sessionId) {
    return 'default_user';
  }

  // Se o sessionId contém underscore, pegar a primeira parte
  const parts = sessionId.split('_');
  if (parts.length > 1) {
    return parts[0];
  }

  // Senão, usar o sessionId como userId
  return sessionId;
}

function generateMessageId(): string {
  return `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

// Middleware para verificar se automação está habilitada
export const requireAutomation = (
  req: AutomationRequest,
  res: Response,
  next: NextFunction
) => {
  if (!req.automationEnabled && !isMongoConnected()) {
    return res.status(503).json({
      status: 'error',
      message: 'Automation features are not available. MongoDB connection required.'
    });
  }
  next();
};

// Middleware para adicionar informações de automação na resposta
export const addAutomationInfo = (
  req: AutomationRequest,
  res: Response,
  next: NextFunction
) => {
  const originalJson = res.json;
  
  res.json = function(data: any) {
    if (data && typeof data === 'object' && data.status) {
      data.automation = {
        enabled: req.automationEnabled || false,
        mongoConnected: isMongoConnected(),
        features: req.automationEnabled ? [
          'automations',
          'templates',
          'segments',
          'analytics',
          'queue',
          'multi-channel'
        ] : []
      };
    }
    
    return originalJson.call(this, data);
  };
  
  next();
};