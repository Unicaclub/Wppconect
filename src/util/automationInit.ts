/*
 * Copyright 2025 Unicaclub
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 */

import config from '../config';
import { connectMongoDB, isMongoConnected } from './db/mongodb/connection';
import { queueService } from '../services/QueueService';
import { contactSegmentationService } from '../services/ContactSegmentationService';
import { logger } from '../index';

export async function initializeAutomationSystem(): Promise<void> {
  try {
    logger.info('🚀 Initializing Automation System...');

    // Check if automation is enabled
    if (!(config as any).automation?.enabled) {
      logger.info('ℹ️  Automation system is disabled via configuration');
      return;
    }

    // Initialize MongoDB connection
    await initializeMongoDB();

    // Initialize Queue System
    initializeQueueSystem();

    // Initialize default segments
    await initializeDefaultSegments();

    // Schedule periodic maintenance tasks
    scheduleMaintenanceTasks();

    logger.info('✅ Automation System initialized successfully');

  } catch (error) {
    logger.error('❌ Failed to initialize Automation System:', error);
    
    // Don't throw error to prevent server from crashing
    // Automation features will be disabled if initialization fails
    logger.warn('⚠️  Server will continue without automation features');
  }
}

async function initializeMongoDB(): Promise<void> {
  try {
    const mongoConfig = (config as any).automation?.mongodb;
    
    if (!mongoConfig?.uri) {
      logger.warn('⚠️  MongoDB URI not configured. Automation features will be limited.');
      return;
    }

    logger.info('🔌 Connecting to MongoDB...');
    await connectMongoDB();

    if (isMongoConnected()) {
      logger.info('✅ MongoDB connected successfully');
      
      // Test database operations
      await testDatabaseOperations();
    } else {
      logger.warn('⚠️  MongoDB connection failed');
    }

  } catch (error) {
    logger.error('❌ MongoDB initialization failed:', error);
    throw error;
  }
}

async function testDatabaseOperations(): Promise<void> {
  try {
    // Import models to ensure they're registered
    await import('../models/AutomationModels');
    logger.info('📊 Database models loaded successfully');
  } catch (error) {
    logger.error('❌ Database model loading failed:', error);
    throw error;
  }
}

function initializeQueueSystem(): void {
  try {
    logger.info('⏰ Initializing Queue System...');
    
    // Queue service is already initialized as singleton
    // Just set up event listeners
    queueService.on('jobCompleted', (job) => {
      logger.debug(`✅ Queue job completed: ${job.type} - ${job._id}`);
    });

    queueService.on('jobFailed', (job, error) => {
      logger.warn(`❌ Queue job failed: ${job.type} - ${job._id} - ${error.message}`);
    });

    queueService.on('jobRetry', (job, attempt) => {
      logger.info(`🔄 Queue job retry ${attempt}/${job.maxAttempts}: ${job.type} - ${job._id}`);
    });

    logger.info('✅ Queue System initialized');

  } catch (error) {
    logger.error('❌ Queue System initialization failed:', error);
    throw error;
  }
}

async function initializeDefaultSegments(): Promise<void> {
  try {
    if (!isMongoConnected()) {
      logger.debug('Skipping default segments creation - MongoDB not connected');
      return;
    }

    logger.info('👥 Creating default contact segments...');
    
    // This will be called for each user when they first use the system
    // For now, just log that the service is ready
    logger.info('✅ Contact segmentation service ready');

  } catch (error) {
    logger.error('❌ Default segments initialization failed:', error);
    // Don't throw - this is not critical
  }
}

function scheduleMaintenanceTasks(): void {
  try {
    logger.info('🧹 Scheduling maintenance tasks...');

    // Clean up completed jobs every 24 hours
    const cleanupInterval = (config as any).automation?.queue?.cleanupInterval || 86400000; // 24 hours
    
    setInterval(async () => {
      try {
        logger.info('🧹 Running queue cleanup...');
        const removed = await queueService.clearCompletedJobs(7); // Remove jobs older than 7 days
        if (removed > 0) {
          logger.info(`🗑️  Cleaned up ${removed} completed queue jobs`);
        }
      } catch (error) {
        logger.error('❌ Queue cleanup failed:', error);
      }
    }, cleanupInterval);

    // Refresh segment counts every hour
    setInterval(async () => {
      try {
        if (isMongoConnected()) {
          logger.debug('🔄 Refreshing segment counts...');
          await contactSegmentationService.refreshSegmentCounts();
        }
      } catch (error) {
        logger.error('❌ Segment count refresh failed:', error);
      }
    }, 3600000); // 1 hour

    logger.info('✅ Maintenance tasks scheduled');

  } catch (error) {
    logger.error('❌ Maintenance tasks scheduling failed:', error);
    // Don't throw - this is not critical
  }
}

export function getAutomationSystemStatus(): {
  enabled: boolean;
  mongoConnected: boolean;
  queueActive: boolean;
  features: string[];
} {
  const enabled = (config as any).automation?.enabled && isMongoConnected();
  
  return {
    enabled,
    mongoConnected: isMongoConnected(),
    queueActive: true, // Queue service is always active
    features: enabled ? [
      'automations',
      'templates', 
      'segments',
      'analytics',
      'queue',
      'multi-channel',
      'webhooks'
    ] : []
  };
}

export function createUserDefaultSegments(userId: string): Promise<void> {
  return contactSegmentationService.createBehaviorSegments(userId);
}