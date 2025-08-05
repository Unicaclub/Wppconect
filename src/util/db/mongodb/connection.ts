/*
 * Copyright 2025 Unicaclub
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 */

import mongoose from 'mongoose';
import config from '../../../config';
import { logger } from '../../../index';

interface MongoDBConfig {
  uri: string;
  options: mongoose.ConnectOptions;
}

class MongoDBConnection {
  private static instance: MongoDBConnection;
  private isConnected: boolean = false;

  private constructor() {}

  static getInstance(): MongoDBConnection {
    if (!MongoDBConnection.instance) {
      MongoDBConnection.instance = new MongoDBConnection();
    }
    return MongoDBConnection.instance;
  }

  async connect(): Promise<void> {
    if (this.isConnected) {
      logger.info('MongoDB already connected');
      return;
    }

    try {
      const mongoConfig = this.getMongoConfig();
      
      if (!mongoConfig.uri) {
        logger.warn('MongoDB URI not configured, automation features will be disabled');
        return;
      }

      await mongoose.connect(mongoConfig.uri, mongoConfig.options);
      
      this.isConnected = true;
      logger.info('MongoDB connected successfully');

      // Setup connection event listeners
      this.setupEventListeners();

    } catch (error) {
      logger.error('MongoDB connection failed:', error);
      throw error;
    }
  }

  async disconnect(): Promise<void> {
    if (!this.isConnected) {
      return;
    }

    try {
      await mongoose.disconnect();
      this.isConnected = false;
      logger.info('MongoDB disconnected successfully');
    } catch (error) {
      logger.error('MongoDB disconnection failed:', error);
      throw error;
    }
  }

  isMongoConnected(): boolean {
    return this.isConnected && mongoose.connection.readyState === 1;
  }

  getConnectionStatus(): string {
    const states = {
      0: 'disconnected',
      1: 'connected',
      2: 'connecting',
      3: 'disconnecting'
    };
    return states[mongoose.connection.readyState as keyof typeof states] || 'unknown';
  }

  private getMongoConfig(): MongoDBConfig {
    // Try different environment variable patterns (Railway compatibility)
    const uri = process.env.MONGODB_URI || 
                process.env.DATABASE_URL || 
                process.env.MONGO_URL || 
                process.env.MONGOURL ||
                config.db?.mongoURLRemote ||
                this.buildURIFromConfig();

    return {
      uri,
      options: {
        maxPoolSize: 10,
        serverSelectionTimeoutMS: 5000,
        socketTimeoutMS: 45000,
        bufferCommands: false,
        bufferMaxEntries: 0
      }
    };
  }

  private buildURIFromConfig(): string {
    const dbConfig = config.db;
    
    if (!dbConfig) {
      return '';
    }

    // Build URI from individual config parts
    if (dbConfig.mongodbHost) {
      const auth = dbConfig.mongodbUser && dbConfig.mongodbPassword 
        ? `${dbConfig.mongodbUser}:${dbConfig.mongodbPassword}@`
        : '';
      
      const host = dbConfig.mongodbHost;
      const port = dbConfig.mongodbPort || 27017;
      const database = dbConfig.mongodbDatabase || 'wppconnect';
      
      return `mongodb://${auth}${host}:${port}/${database}`;
    }

    return '';
  }

  private setupEventListeners(): void {
    mongoose.connection.on('error', (error) => {
      logger.error('MongoDB connection error:', error);
    });

    mongoose.connection.on('disconnected', () => {
      logger.warn('MongoDB disconnected');
      this.isConnected = false;
    });

    mongoose.connection.on('reconnected', () => {
      logger.info('MongoDB reconnected');
      this.isConnected = true;
    });

    // Graceful shutdown
    process.on('SIGINT', async () => {
      logger.info('Received SIGINT, closing MongoDB connection...');
      await this.disconnect();
      process.exit(0);
    });

    process.on('SIGTERM', async () => {
      logger.info('Received SIGTERM, closing MongoDB connection...');
      await this.disconnect();
      process.exit(0);
    });
  }
}

export const mongoConnection = MongoDBConnection.getInstance();

export const connectMongoDB = async (): Promise<void> => {
  await mongoConnection.connect();
};

export const disconnectMongoDB = async (): Promise<void> => {
  await mongoConnection.disconnect();
};

export const isMongoConnected = (): boolean => {
  return mongoConnection.isMongoConnected();
};