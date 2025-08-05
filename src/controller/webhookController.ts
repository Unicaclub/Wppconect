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
import { automationEngine } from '../services/AutomationEngine';
import { analyticsService } from '../services/AnalyticsService';
import { ContactModel, ConversationMessageModel } from '../models/AutomationModels';
import { logger } from '../index';
import crypto from 'crypto';

interface WhatsAppWebhookMessage {
  id: string;
  type: 'message' | 'status' | 'presence' | 'ack';
  timestamp: number;
  from: string;
  to: string;
  sessionId: string;
  userId: string;
  body?: {
    text?: string;
    type?: string;
    caption?: string;
    filename?: string;
    mediaUrl?: string;
  };
  status?: 'sent' | 'delivered' | 'read' | 'failed';
  ack?: number;
  isGroupMessage?: boolean;
  chatId?: string;
  quotedMessage?: any;
  mentionedJidList?: string[];
}

interface ZApiWebhookMessage {
  instanceId: string;
  messageId: string;
  phone: string;
  fromMe: boolean;
  messageType: string;
  text?: {
    message: string;
  };
  image?: {
    caption?: string;
    imageUrl: string;
    mimeType: string;
  };
  audio?: {
    audioUrl: string;
    mimeType: string;
  };
  video?: {
    caption?: string;
    videoUrl: string;
    mimeType: string;
  };
  document?: {
    documentUrl: string;
    mimeType: string;
    title: string;
  };
  timestamp: number;
  status?: string;
}

export const whatsappWebhook = async (req: Request, res: Response) => {
  try {
    const data: WhatsAppWebhookMessage = req.body;
    
    logger.info('Received WhatsApp webhook:', JSON.stringify(data, null, 2));

    // Verificar se é uma mensagem recebida
    if (data.type === 'message' && data.body && !data.from.includes('@g.us')) {
      await processIncomingMessage(data);
    }
    
    // Processar atualizações de status
    if (data.type === 'status' || data.type === 'ack') {
      await processMessageStatus(data);
    }

    res.status(200).json({ status: 'ok' });
  } catch (error) {
    logger.error('Error processing WhatsApp webhook:', error);
    res.status(500).json({ status: 'error', message: error.message });
  }
};

export const zapiWebhook = async (req: Request, res: Response) => {
  try {
    const data: ZApiWebhookMessage = req.body;
    
    logger.info('Received Z-API webhook:', JSON.stringify(data, null, 2));

    // Converter formato Z-API para formato padrão
    const standardMessage: WhatsAppWebhookMessage = {
      id: data.messageId,
      type: 'message',
      timestamp: data.timestamp,
      from: data.phone,
      to: data.instanceId,
      sessionId: data.instanceId,
      userId: extractUserIdFromInstance(data.instanceId),
      body: {
        text: extractMessageText(data),
        type: data.messageType,
        mediaUrl: extractMediaUrl(data)
      }
    };

    // Processar apenas mensagens recebidas (não enviadas por nós)
    if (!data.fromMe) {
      await processIncomingMessage(standardMessage);
    }

    // Processar status se disponível
    if (data.status) {
      await processMessageStatus({
        ...standardMessage,
        type: 'status',
        status: data.status as any
      });
    }

    res.status(200).json({ status: 'ok' });
  } catch (error) {
    logger.error('Error processing Z-API webhook:', error);
    res.status(500).json({ status: 'error', message: error.message });
  }
};

export const genericWebhook = async (req: Request, res: Response) => {
  try {
    const { userId, sessionId } = req.params;
    const data = req.body;
    
    logger.info(`Received generic webhook for user ${userId}:`, JSON.stringify(data, null, 2));

    // Verificar se contém dados de mensagem
    if (data.message && data.phone) {
      const standardMessage: WhatsAppWebhookMessage = {
        id: data.messageId || generateMessageId(),
        type: 'message',
        timestamp: data.timestamp || Date.now(),
        from: data.phone,
        to: sessionId,
        sessionId,
        userId,
        body: {
          text: data.message,
          type: data.messageType || 'text'
        }
      };

      await processIncomingMessage(standardMessage);
    }

    res.status(200).json({ status: 'ok' });
  } catch (error) {
    logger.error('Error processing generic webhook:', error);
    res.status(500).json({ status: 'error', message: error.message });
  }
};

export const telegramWebhook = async (req: Request, res: Response) => {
  try {
    const data = req.body;
    const { userId, sessionId } = req.params;
    
    logger.info('Received Telegram webhook:', JSON.stringify(data, null, 2));

    if (data.message && data.message.text && data.message.from) {
      const phone = `telegram_${data.message.from.id}`;
      const name = `${data.message.from.first_name} ${data.message.from.last_name || ''}`.trim();

      await automationEngine.processIncomingMessage(
        userId,
        sessionId,
        phone,
        data.message.text,
        'text',
        {
          platform: 'telegram',
          chatId: data.message.chat.id,
          userId: data.message.from.id,
          username: data.message.from.username,
          name
        }
      );
    }

    res.status(200).json({ status: 'ok' });
  } catch (error) {
    logger.error('Error processing Telegram webhook:', error);
    res.status(500).json({ status: 'error', message: error.message });
  }
};

export const instagramWebhook = async (req: Request, res: Response) => {
  try {
    const data = req.body;
    const { userId, sessionId } = req.params;
    
    logger.info('Received Instagram webhook:', JSON.stringify(data, null, 2));

    // Verificação do webhook do Instagram
    if (req.method === 'GET') {
      const mode = req.query['hub.mode'];
      const token = req.query['hub.verify_token'];
      const challenge = req.query['hub.challenge'];

      if (mode === 'subscribe' && token === process.env.INSTAGRAM_VERIFY_TOKEN) {
        return res.status(200).send(challenge);
      } else {
        return res.status(403).json({ status: 'error', message: 'Invalid verification token' });
      }
    }

    // Processar mensagens do Instagram
    if (data.entry && data.entry[0].messaging) {
      const messaging = data.entry[0].messaging[0];
      
      if (messaging.message && messaging.message.text) {
        const phone = `instagram_${messaging.sender.id}`;
        
        await automationEngine.processIncomingMessage(
          userId,
          sessionId,
          phone,
          messaging.message.text,
          'text',
          {
            platform: 'instagram',
            senderId: messaging.sender.id,
            recipientId: messaging.recipient.id
          }
        );
      }
    }

    res.status(200).json({ status: 'ok' });
  } catch (error) {
    logger.error('Error processing Instagram webhook:', error);
    res.status(500).json({ status: 'error', message: error.message });
  }
};

export const verifyWebhookSignature = (secret: string) => {
  return (req: Request, res: Response, next: any) => {
    try {
      const signature = req.headers['x-hub-signature-256'] as string;
      
      if (!signature) {
        return res.status(401).json({ status: 'error', message: 'Missing signature' });
      }

      const expectedSignature = crypto
        .createHmac('sha256', secret)
        .update(JSON.stringify(req.body))
        .digest('hex');

      const expectedSignatureWithPrefix = `sha256=${expectedSignature}`;

      if (!crypto.timingSafeEqual(
        Buffer.from(signature),
        Buffer.from(expectedSignatureWithPrefix)
      )) {
        return res.status(401).json({ status: 'error', message: 'Invalid signature' });
      }

      next();
    } catch (error) {
      logger.error('Error verifying webhook signature:', error);
      res.status(401).json({ status: 'error', message: 'Signature verification failed' });
    }
  };
};

async function processIncomingMessage(data: WhatsAppWebhookMessage): Promise<void> {
  try {
    const { userId, sessionId, from, body } = data;
    
    if (!userId || !sessionId || !from || !body?.text) {
      logger.warn('Incomplete message data:', data);
      return;
    }

    // Processar mensagem através do engine de automação
    await automationEngine.processIncomingMessage(
      userId,
      sessionId,
      from,
      body.text,
      body.type || 'text',
      {
        messageId: data.id,
        timestamp: data.timestamp,
        isGroupMessage: data.isGroupMessage || false,
        chatId: data.chatId,
        quotedMessage: data.quotedMessage,
        mentionedJidList: data.mentionedJidList,
        mediaUrl: body.mediaUrl,
        caption: body.caption,
        filename: body.filename
      }
    );

  } catch (error) {
    logger.error('Error processing incoming message:', error);
  }
}

async function processMessageStatus(data: WhatsAppWebhookMessage): Promise<void> {
  try {
    const { id, status, ack, userId } = data;
    
    if (!id || (!status && ack === undefined)) {
      return;
    }

    // Mapear ack para status
    let messageStatus = status;
    if (ack !== undefined) {
      switch (ack) {
        case 1:
          messageStatus = 'sent';
          break;
        case 2:
          messageStatus = 'delivered';
          break;
        case 3:
          messageStatus = 'read';
          break;
        default:
          messageStatus = 'sent';
      }
    }

    // Atualizar status da mensagem no banco
    await ConversationMessageModel.updateOne(
      { 
        $or: [
          { _id: id },
          { 'metadata.messageId': id }
        ]
      },
      { status: messageStatus }
    );

    // Rastrear estatística
    if (userId && messageStatus) {
      await analyticsService.trackEvent(
        userId,
        'message',
        id,
        `status_${messageStatus}`,
        1
      );
    }

  } catch (error) {
    logger.error('Error processing message status:', error);
  }
}

function extractUserIdFromInstance(instanceId: string): string {
  // Implementar lógica para extrair userId do instanceId
  // Por exemplo, se o instanceId for no formato "user123_session1"
  const parts = instanceId.split('_');
  return parts[0] || instanceId;
}

function extractMessageText(data: ZApiWebhookMessage): string {
  if (data.text?.message) {
    return data.text.message;
  }
  
  if (data.image?.caption) {
    return data.image.caption;
  }
  
  if (data.video?.caption) {
    return data.video.caption;
  }
  
  if (data.document?.title) {
    return data.document.title;
  }
  
  return '';
}

function extractMediaUrl(data: ZApiWebhookMessage): string | undefined {
  if (data.image?.imageUrl) {
    return data.image.imageUrl;
  }
  
  if (data.video?.videoUrl) {
    return data.video.videoUrl;
  }
  
  if (data.audio?.audioUrl) {
    return data.audio.audioUrl;
  }
  
  if (data.document?.documentUrl) {
    return data.document.documentUrl;
  }
  
  return undefined;
}

function generateMessageId(): string {
  return `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}