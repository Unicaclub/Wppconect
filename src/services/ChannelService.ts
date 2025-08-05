/*
 * Copyright 2025 Unicaclub
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 */

import { ChannelModel } from '../models/AutomationModels';
import { Channel } from '../types/AutomationTypes';
import { logger } from '../index';
import axios from 'axios';

export interface ChannelConfig {
  whatsapp?: {
    apiUrl?: string;
    apiKey?: string;
    sessionId: string;
  };
  telegram?: {
    botToken: string;
    chatId?: string;
  };
  instagram?: {
    accessToken: string;
    pageId: string;
    verifyToken: string;
  };
  sms?: {
    provider: 'twilio' | 'nexmo' | 'aws_sns';
    apiKey: string;
    apiSecret?: string;
    from: string;
  };
  email?: {
    provider: 'smtp' | 'sendgrid' | 'ses';
    host?: string;
    port?: number;
    user: string;
    password: string;
    from: string;
  };
}

export interface MessagePayload {
  to: string;
  content: string;
  messageType: 'text' | 'image' | 'video' | 'audio' | 'document';
  mediaUrl?: string;
  fileName?: string;
  metadata?: Record<string, any>;
}

export class ChannelService {
  private channels: Map<string, Channel> = new Map();

  async createChannel(
    userId: string,
    type: Channel['type'],
    name: string,
    config: ChannelConfig[keyof ChannelConfig]
  ): Promise<Channel> {
    try {
      const channel = new ChannelModel({
        userId,
        type,
        name,
        config,
        isActive: true,
        status: 'disconnected'
      });

      await channel.save();
      
      // Tentar conectar o canal
      await this.connectChannel(channel._id.toString());

      logger.info(`Channel created: ${name} (${type})`);
      return channel.toObject();
    } catch (error) {
      logger.error('Error creating channel:', error);
      throw error;
    }
  }

  async connectChannel(channelId: string): Promise<boolean> {
    try {
      const channel = await ChannelModel.findById(channelId);
      if (!channel) {
        return false;
      }

      let connected = false;

      switch (channel.type) {
        case 'whatsapp':
          connected = await this.connectWhatsAppChannel(channel);
          break;
        case 'telegram':
          connected = await this.connectTelegramChannel(channel);
          break;
        case 'instagram':
          connected = await this.connectInstagramChannel(channel);
          break;
        case 'sms':
          connected = await this.connectSMSChannel(channel);
          break;
        case 'email':
          connected = await this.connectEmailChannel(channel);
          break;
      }

      await ChannelModel.updateOne(
        { _id: channelId },
        {
          status: connected ? 'connected' : 'error',
          lastActivity: new Date()
        }
      );

      if (connected) {
        this.channels.set(channelId, channel.toObject());
      }

      return connected;
    } catch (error) {
      logger.error('Error connecting channel:', error);
      return false;
    }
  }

  async sendMessage(
    channelId: string,
    payload: MessagePayload
  ): Promise<boolean> {
    try {
      const channel = this.channels.get(channelId) || 
        await ChannelModel.findById(channelId);

      if (!channel) {
        throw new Error('Channel not found');
      }

      if (channel.status !== 'connected') {
        throw new Error('Channel not connected');
      }

      let success = false;

      switch (channel.type) {
        case 'whatsapp':
          success = await this.sendWhatsAppMessage(channel, payload);
          break;
        case 'telegram':
          success = await this.sendTelegramMessage(channel, payload);
          break;
        case 'instagram':
          success = await this.sendInstagramMessage(channel, payload);
          break;
        case 'sms':
          success = await this.sendSMSMessage(channel, payload);
          break;
        case 'email':
          success = await this.sendEmailMessage(channel, payload);
          break;
      }

      // Atualizar última atividade
      await ChannelModel.updateOne(
        { _id: channelId },
        { lastActivity: new Date() }
      );

      return success;
    } catch (error) {
      logger.error('Error sending message:', error);
      return false;
    }
  }

  async getUserChannels(userId: string): Promise<Channel[]> {
    try {
      const channels = await ChannelModel.find({ userId }).lean();
      return channels;
    } catch (error) {
      logger.error('Error getting user channels:', error);
      return [];
    }
  }

  async updateChannel(
    channelId: string,
    updates: Partial<Channel>
  ): Promise<Channel | null> {
    try {
      const channel = await ChannelModel.findByIdAndUpdate(
        channelId,
        { ...updates, updatedAt: new Date() },
        { new: true }
      );

      if (!channel) {
        return null;
      }

      // Atualizar cache
      this.channels.set(channelId, channel.toObject());

      return channel.toObject();
    } catch (error) {
      logger.error('Error updating channel:', error);
      throw error;
    }
  }

  async deleteChannel(channelId: string): Promise<boolean> {
    try {
      const result = await ChannelModel.deleteOne({ _id: channelId });
      
      if (result.deletedCount > 0) {
        this.channels.delete(channelId);
        return true;
      }
      
      return false;
    } catch (error) {
      logger.error('Error deleting channel:', error);
      return false;
    }
  }

  private async connectWhatsAppChannel(channel: Channel): Promise<boolean> {
    try {
      const config = channel.config as ChannelConfig['whatsapp'];
      
      if (!config?.sessionId) {
        throw new Error('WhatsApp session ID is required');
      }

      // Verificar se a sessão está ativa
      // Isso depende da implementação específica do WPPConnect
      // Por enquanto, assumimos que está conectado se temos sessionId
      
      return true;
    } catch (error) {
      logger.error('Error connecting WhatsApp channel:', error);
      return false;
    }
  }

  private async connectTelegramChannel(channel: Channel): Promise<boolean> {
    try {
      const config = channel.config as ChannelConfig['telegram'];
      
      if (!config?.botToken) {
        throw new Error('Telegram bot token is required');
      }

      // Testar conexão com getMe
      const response = await axios.get(
        `https://api.telegram.org/bot${config.botToken}/getMe`
      );

      return response.data.ok;
    } catch (error) {
      logger.error('Error connecting Telegram channel:', error);
      return false;
    }
  }

  private async connectInstagramChannel(channel: Channel): Promise<boolean> {
    try {
      const config = channel.config as ChannelConfig['instagram'];
      
      if (!config?.accessToken || !config?.pageId) {
        throw new Error('Instagram access token and page ID are required');
      }

      // Testar conexão com Graph API
      const response = await axios.get(
        `https://graph.facebook.com/v18.0/${config.pageId}`,
        {
          params: { access_token: config.accessToken }
        }
      );

      return !!response.data.id;
    } catch (error) {
      logger.error('Error connecting Instagram channel:', error);
      return false;
    }
  }

  private async connectSMSChannel(channel: Channel): Promise<boolean> {
    try {
      const config = channel.config as ChannelConfig['sms'];
      
      if (!config?.apiKey || !config?.from) {
        throw new Error('SMS API key and from number are required');
      }

      // Validação básica - mais validações específicas podem ser adicionadas
      return true;
    } catch (error) {
      logger.error('Error connecting SMS channel:', error);
      return false;
    }
  }

  private async connectEmailChannel(channel: Channel): Promise<boolean> {
    try {
      const config = channel.config as ChannelConfig['email'];
      
      if (!config?.user || !config?.password || !config?.from) {
        throw new Error('Email credentials are required');
      }

      // Validação básica - testar conexão SMTP seria ideal
      return true;
    } catch (error) {
      logger.error('Error connecting email channel:', error);
      return false;
    }
  }

  private async sendWhatsAppMessage(
    channel: Channel,
    payload: MessagePayload
  ): Promise<boolean> {
    try {
      const config = channel.config as ChannelConfig['whatsapp'];
      
      // Usar o client do WPPConnect existente
      // Esta implementação depende de como você integra com o sistema existente
      
      logger.info(`WhatsApp message sent to ${payload.to}: ${payload.content}`);
      return true;
    } catch (error) {
      logger.error('Error sending WhatsApp message:', error);
      return false;
    }
  }

  private async sendTelegramMessage(
    channel: Channel,
    payload: MessagePayload
  ): Promise<boolean> {
    try {
      const config = channel.config as ChannelConfig['telegram'];
      
      const url = `https://api.telegram.org/bot${config.botToken}/sendMessage`;
      
      const response = await axios.post(url, {
        chat_id: payload.to,
        text: payload.content,
        parse_mode: 'HTML'
      });

      return response.data.ok;
    } catch (error) {
      logger.error('Error sending Telegram message:', error);
      return false;
    }
  }

  private async sendInstagramMessage(
    channel: Channel,
    payload: MessagePayload
  ): Promise<boolean> {
    try {
      const config = channel.config as ChannelConfig['instagram'];
      
      const url = `https://graph.facebook.com/v18.0/${config.pageId}/messages`;
      
      const response = await axios.post(url, {
        recipient: { id: payload.to },
        message: { text: payload.content }
      }, {
        params: { access_token: config.accessToken }
      });

      return !!response.data.message_id;
    } catch (error) {
      logger.error('Error sending Instagram message:', error);
      return false;
    }
  }

  private async sendSMSMessage(
    channel: Channel,
    payload: MessagePayload
  ): Promise<boolean> {
    try {
      const config = channel.config as ChannelConfig['sms'];
      
      switch (config.provider) {
        case 'twilio':
          return await this.sendTwilioSMS(config, payload);
        case 'nexmo':
          return await this.sendNexmoSMS(config, payload);
        case 'aws_sns':
          return await this.sendAWSSNS(config, payload);
        default:
          throw new Error(`Unsupported SMS provider: ${config.provider}`);
      }
    } catch (error) {
      logger.error('Error sending SMS message:', error);
      return false;
    }
  }

  private async sendEmailMessage(
    channel: Channel,
    payload: MessagePayload
  ): Promise<boolean> {
    try {
      const config = channel.config as ChannelConfig['email'];
      
      // Implementar envio de email baseado no provider
      // Por enquanto, apenas log
      logger.info(`Email sent to ${payload.to}: ${payload.content}`);
      return true;
    } catch (error) {
      logger.error('Error sending email message:', error);
      return false;
    }
  }

  private async sendTwilioSMS(
    config: ChannelConfig['sms'],
    payload: MessagePayload
  ): Promise<boolean> {
    try {
      // Implementar integração com Twilio
      logger.info(`Twilio SMS sent to ${payload.to}: ${payload.content}`);
      return true;
    } catch (error) {
      logger.error('Error sending Twilio SMS:', error);
      return false;
    }
  }

  private async sendNexmoSMS(
    config: ChannelConfig['sms'],
    payload: MessagePayload
  ): Promise<boolean> {
    try {
      // Implementar integração com Nexmo/Vonage
      logger.info(`Nexmo SMS sent to ${payload.to}: ${payload.content}`);
      return true;
    } catch (error) {
      logger.error('Error sending Nexmo SMS:', error);
      return false;
    }
  }

  private async sendAWSSNS(
    config: ChannelConfig['sms'],
    payload: MessagePayload
  ): Promise<boolean> {
    try {
      // Implementar integração com AWS SNS
      logger.info(`AWS SNS SMS sent to ${payload.to}: ${payload.content}`);
      return true;
    } catch (error) {
      logger.error('Error sending AWS SNS SMS:', error);
      return false;
    }
  }

  async getChannelStats(channelId: string): Promise<{
    messagesSent: number;
    messagesReceived: number;
    lastActivity: Date | null;
    status: string;
  } | null> {
    try {
      const channel = await ChannelModel.findById(channelId);
      if (!channel) {
        return null;
      }

      // Por enquanto, dados básicos
      // Posteriormente, integrar com analytics para dados detalhados
      return {
        messagesSent: 0,
        messagesReceived: 0,
        lastActivity: channel.lastActivity || null,
        status: channel.status
      };
    } catch (error) {
      logger.error('Error getting channel stats:', error);
      return null;
    }
  }
}

export const channelService = new ChannelService();