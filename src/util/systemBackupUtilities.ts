/*
 * Copyright 2025 Unicaclub
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 */

import fs from 'fs';
import path from 'path';
import archiver from 'archiver';
import { advancedLogger } from './advancedLogger';
import { isMongoConnected } from './db/mongodb/connection';
import {
  AutomationModel,
  ContactModel,
  ConversationMessageModel,
  MessageTemplateModel,
  ContactSegmentModel,
  AnalyticsModel,
  QueueJobModel
} from '../models/AutomationModels';
import { exec } from 'child_process';
import { promisify } from 'util';

const execPromise = promisify(exec);

interface BackupOptions {
  includeDatabase?: boolean;
  includeFiles?: boolean;
  includeLogs?: boolean;
  includeTokens?: boolean;
  includeUserData?: boolean;
  outputPath?: string;
  compression?: 'zip' | 'tar';
}

interface BackupManifest {
  createdAt: Date;
  version: string;
  environment: string;
  components: {
    database: boolean;
    files: boolean;
    logs: boolean;
    tokens: boolean;
    userData: boolean;
  };
  statistics: {
    automations: number;
    contacts: number;
    messages: number;
    templates: number;
    analytics: number;
  };
  size: number;
  checksum: string;
}

interface RestoreOptions {
  backupPath: string;
  restoreDatabase?: boolean;
  restoreFiles?: boolean;
  restoreLogs?: boolean;
  restoreTokens?: boolean;
  restoreUserData?: boolean;
  overwriteExisting?: boolean;
}

class SystemBackupUtilities {
  private backupDirectory: string;
  private tempDirectory: string;

  constructor() {
    this.backupDirectory = path.join(process.cwd(), 'backups');
    this.tempDirectory = path.join(process.cwd(), 'temp', 'backup');
    this.ensureDirectories();
  }

  private ensureDirectories(): void {
    [this.backupDirectory, this.tempDirectory].forEach(dir => {
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
    });
  }

  // Create a complete system backup
  async createBackup(options: BackupOptions = {}): Promise<{
    success: boolean;
    backupPath?: string;
    manifest?: BackupManifest;
    error?: string;
  }> {
    const backupId = `backup_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const backupTempPath = path.join(this.tempDirectory, backupId);
    const startTime = Date.now();

    try {
      advancedLogger.info('Starting system backup', {
        operation: 'backup_start',
        backupId,
        options
      });

      // Create temporary backup directory
      fs.mkdirSync(backupTempPath, { recursive: true });

      const manifest: BackupManifest = {
        createdAt: new Date(),
        version: process.env.npm_package_version || '1.0.0',
        environment: process.env.NODE_ENV || 'development',
        components: {
          database: options.includeDatabase !== false,
          files: options.includeFiles !== false,
          logs: options.includeLogs !== false,
          tokens: options.includeTokens !== false,
          userData: options.includeUserData !== false
        },
        statistics: {
          automations: 0,
          contacts: 0,
          messages: 0,
          templates: 0,
          analytics: 0
        },
        size: 0,
        checksum: ''
      };

      // Backup database
      if (options.includeDatabase !== false) {
        await this.backupDatabase(backupTempPath, manifest);
      }

      // Backup application files
      if (options.includeFiles !== false) {
        await this.backupApplicationFiles(backupTempPath);
      }

      // Backup logs
      if (options.includeLogs !== false) {
        await this.backupLogs(backupTempPath);
      }

      // Backup tokens
      if (options.includeTokens !== false) {
        await this.backupTokens(backupTempPath);
      }

      // Backup user data
      if (options.includeUserData !== false) {
        await this.backupUserData(backupTempPath);
      }

      // Save manifest
      fs.writeFileSync(
        path.join(backupTempPath, 'manifest.json'),
        JSON.stringify(manifest, null, 2)
      );

      // Create compressed archive
      const archivePath = await this.createArchive(
        backupTempPath,
        backupId,
        options.compression || 'zip'
      );

      // Calculate final size and checksum
      const stats = fs.statSync(archivePath);
      manifest.size = stats.size;
      manifest.checksum = await this.calculateChecksum(archivePath);

      // Update manifest in archive (would need to recompress, for now just log)
      advancedLogger.info('System backup completed', {
        operation: 'backup_complete',
        backupId,
        duration: Date.now() - startTime,
        size: manifest.size,
        checksum: manifest.checksum
      });

      // Cleanup temporary directory
      this.cleanupDirectory(backupTempPath);

      return {
        success: true,
        backupPath: archivePath,
        manifest
      };

    } catch (error) {
      advancedLogger.error('System backup failed', error as Error, {
        operation: 'backup_failed',
        backupId,
        duration: Date.now() - startTime
      });

      // Cleanup on failure
      this.cleanupDirectory(backupTempPath);

      return {
        success: false,
        error: (error as Error).message
      };
    }
  }

  // Restore system from backup
  async restoreBackup(options: RestoreOptions): Promise<{
    success: boolean;
    manifest?: BackupManifest;
    error?: string;
  }> {
    const restoreId = `restore_${Date.now()}`;
    const restoreTempPath = path.join(this.tempDirectory, restoreId);
    const startTime = Date.now();

    try {
      advancedLogger.info('Starting system restore', {
        operation: 'restore_start',
        restoreId,
        backupPath: options.backupPath
      });

      // Extract backup archive
      await this.extractArchive(options.backupPath, restoreTempPath);

      // Read manifest
      const manifestPath = path.join(restoreTempPath, 'manifest.json');
      if (!fs.existsSync(manifestPath)) {
        throw new Error('Backup manifest not found');
      }

      const manifest: BackupManifest = JSON.parse(
        fs.readFileSync(manifestPath, 'utf-8')
      );

      // Verify backup integrity
      await this.verifyBackupIntegrity(restoreTempPath, manifest);

      // Restore database
      if (options.restoreDatabase !== false && manifest.components.database) {
        await this.restoreDatabase(restoreTempPath, options.overwriteExisting);
      }

      // Restore files
      if (options.restoreFiles !== false && manifest.components.files) {
        await this.restoreApplicationFiles(restoreTempPath, options.overwriteExisting);
      }

      // Restore logs
      if (options.restoreLogs !== false && manifest.components.logs) {
        await this.restoreLogs(restoreTempPath, options.overwriteExisting);
      }

      // Restore tokens
      if (options.restoreTokens !== false && manifest.components.tokens) {
        await this.restoreTokens(restoreTempPath, options.overwriteExisting);
      }

      // Restore user data
      if (options.restoreUserData !== false && manifest.components.userData) {
        await this.restoreUserData(restoreTempPath, options.overwriteExisting);
      }

      advancedLogger.info('System restore completed', {
        operation: 'restore_complete',
        restoreId,
        duration: Date.now() - startTime,
        backupDate: manifest.createdAt
      });

      // Cleanup temporary directory
      this.cleanupDirectory(restoreTempPath);

      return {
        success: true,
        manifest
      };

    } catch (error) {
      advancedLogger.error('System restore failed', error as Error, {
        operation: 'restore_failed',
        restoreId,
        duration: Date.now() - startTime
      });

      // Cleanup on failure
      this.cleanupDirectory(restoreTempPath);

      return {
        success: false,
        error: (error as Error).message
      };
    }
  }

  // List available backups
  async listBackups(): Promise<Array<{
    filename: string;
    path: string;
    size: number;
    createdAt: Date;
    manifest?: BackupManifest;
  }>> {
    const backups: Array<{
      filename: string;
      path: string;
      size: number;
      createdAt: Date;
      manifest?: BackupManifest;
    }> = [];

    try {
      const files = fs.readdirSync(this.backupDirectory);
      
      for (const file of files) {
        if (file.endsWith('.zip') || file.endsWith('.tar.gz')) {
          const filePath = path.join(this.backupDirectory, file);
          const stats = fs.statSync(filePath);
          
          backups.push({
            filename: file,
            path: filePath,
            size: stats.size,
            createdAt: stats.birthtime
          });
        }
      }

      // Sort by creation date (newest first)
      backups.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());

    } catch (error) {
      advancedLogger.error('Failed to list backups', error as Error, {
        operation: 'list_backups_failed'
      });
    }

    return backups;
  }

  // Delete old backups
  async cleanupOldBackups(retentionDays: number = 30): Promise<{
    cleaned: number;
    errors: string[];
  }> {
    const cutoffDate = new Date(Date.now() - retentionDays * 24 * 60 * 60 * 1000);
    let cleaned = 0;
    const errors: string[] = [];

    try {
      const backups = await this.listBackups();
      
      for (const backup of backups) {
        if (backup.createdAt < cutoffDate) {
          try {
            fs.unlinkSync(backup.path);
            cleaned++;
            
            advancedLogger.info('Old backup cleaned up', {
              operation: 'backup_cleanup',
              filename: backup.filename,
              createdAt: backup.createdAt
            });
          } catch (error) {
            const errorMsg = `Failed to delete ${backup.filename}: ${(error as Error).message}`;
            errors.push(errorMsg);
            
            advancedLogger.error('Failed to delete old backup', error as Error, {
              operation: 'backup_cleanup_failed',
              filename: backup.filename
            });
          }
        }
      }

    } catch (error) {
      errors.push(`Cleanup process failed: ${(error as Error).message}`);
    }

    return { cleaned, errors };
  }

  // Private helper methods
  private async backupDatabase(backupPath: string, manifest: BackupManifest): Promise<void> {
    if (!isMongoConnected()) {
      advancedLogger.warn('MongoDB not connected, skipping database backup');
      return;
    }

    const dbBackupPath = path.join(backupPath, 'database');
    fs.mkdirSync(dbBackupPath, { recursive: true });

    try {
      // Export collections to JSON
      const collections = [
        { model: AutomationModel, name: 'automations' },
        { model: ContactModel, name: 'contacts' },
        { model: ConversationMessageModel, name: 'messages' },
        { model: MessageTemplateModel, name: 'templates' },
        { model: ContactSegmentModel, name: 'segments' },
        { model: AnalyticsModel, name: 'analytics' },
        { model: QueueJobModel, name: 'queue_jobs' }
      ];

      for (const collection of collections) {
        const data = await collection.model.find({}).lean();
        const filePath = path.join(dbBackupPath, `${collection.name}.json`);
        
        fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
        
        // Update manifest statistics
        (manifest.statistics as any)[collection.name] = data.length;
      }

      advancedLogger.info('Database backup completed', {
        operation: 'database_backup_complete',
        collections: collections.length
      });

    } catch (error) {
      throw new Error(`Database backup failed: ${(error as Error).message}`);
    }
  }

  private async restoreDatabase(backupPath: string, overwrite: boolean = false): Promise<void> {
    if (!isMongoConnected()) {
      throw new Error('MongoDB not connected, cannot restore database');
    }

    const dbBackupPath = path.join(backupPath, 'database');
    
    if (!fs.existsSync(dbBackupPath)) {
      advancedLogger.warn('Database backup not found, skipping restore');
      return;
    }

    try {
      const collections = [
        { model: AutomationModel, name: 'automations' },
        { model: ContactModel, name: 'contacts' },
        { model: ConversationMessageModel, name: 'messages' },
        { model: MessageTemplateModel, name: 'templates' },
        { model: ContactSegmentModel, name: 'segments' },
        { model: AnalyticsModel, name: 'analytics' },
        { model: QueueJobModel, name: 'queue_jobs' }
      ];

      for (const collection of collections) {
        const filePath = path.join(dbBackupPath, `${collection.name}.json`);
        
        if (fs.existsSync(filePath)) {
          const data = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
          
          if (overwrite) {
            await collection.model.deleteMany({});
          }
          
          if (data.length > 0) {
            await collection.model.insertMany(data);
          }
          
          advancedLogger.info('Collection restored', {
            operation: 'database_collection_restore',
            collection: collection.name,
            documents: data.length
          });
        }
      }

    } catch (error) {
      throw new Error(`Database restore failed: ${(error as Error).message}`);
    }
  }

  private async backupApplicationFiles(backupPath: string): Promise<void> {
    const filesBackupPath = path.join(backupPath, 'files');
    fs.mkdirSync(filesBackupPath, { recursive: true });

    // Backup important configuration files
    const filesToBackup = [
      'package.json',
      '.env.example',
      'ecosystem.config.js',
      'railway.toml'
    ];

    for (const file of filesToBackup) {
      const sourcePath = path.join(process.cwd(), file);
      const destPath = path.join(filesBackupPath, file);
      
      if (fs.existsSync(sourcePath)) {
        fs.copyFileSync(sourcePath, destPath);
      }
    }
  }

  private async restoreApplicationFiles(backupPath: string, overwrite: boolean = false): Promise<void> {
    const filesBackupPath = path.join(backupPath, 'files');
    
    if (!fs.existsSync(filesBackupPath)) {
      return;
    }

    const files = fs.readdirSync(filesBackupPath);
    
    for (const file of files) {
      const sourcePath = path.join(filesBackupPath, file);
      const destPath = path.join(process.cwd(), file);
      
      if (overwrite || !fs.existsSync(destPath)) {
        fs.copyFileSync(sourcePath, destPath);
      }
    }
  }

  private async backupLogs(backupPath: string): Promise<void> {
    const logsPath = path.join(process.cwd(), 'logs');
    const logsBackupPath = path.join(backupPath, 'logs');
    
    if (fs.existsSync(logsPath)) {
      this.copyDirectory(logsPath, logsBackupPath);
    }
  }

  private async restoreLogs(backupPath: string, overwrite: boolean = false): Promise<void> {
    const logsBackupPath = path.join(backupPath, 'logs');
    const logsPath = path.join(process.cwd(), 'logs');
    
    if (fs.existsSync(logsBackupPath)) {
      this.copyDirectory(logsBackupPath, logsPath, overwrite);
    }
  }

  private async backupTokens(backupPath: string): Promise<void> {
    const tokensPath = path.join(process.cwd(), 'tokens');
    const tokensBackupPath = path.join(backupPath, 'tokens');
    
    if (fs.existsSync(tokensPath)) {
      this.copyDirectory(tokensPath, tokensBackupPath);
    }
  }

  private async restoreTokens(backupPath: string, overwrite: boolean = false): Promise<void> {
    const tokensBackupPath = path.join(backupPath, 'tokens');
    const tokensPath = path.join(process.cwd(), 'tokens');
    
    if (fs.existsSync(tokensBackupPath)) {
      this.copyDirectory(tokensBackupPath, tokensPath, overwrite);
    }
  }

  private async backupUserData(backupPath: string): Promise<void> {
    const userDataPath = path.join(process.cwd(), 'userDataDir');
    const userDataBackupPath = path.join(backupPath, 'userDataDir');
    
    if (fs.existsSync(userDataPath)) {
      this.copyDirectory(userDataPath, userDataBackupPath);
    }
  }

  private async restoreUserData(backupPath: string, overwrite: boolean = false): Promise<void> {
    const userDataBackupPath = path.join(backupPath, 'userDataDir');
    const userDataPath = path.join(process.cwd(), 'userDataDir');
    
    if (fs.existsSync(userDataBackupPath)) {
      this.copyDirectory(userDataBackupPath, userDataPath, overwrite);
    }
  }

  private copyDirectory(source: string, destination: string, overwrite: boolean = true): void {
    if (!fs.existsSync(destination)) {
      fs.mkdirSync(destination, { recursive: true });
    }

    const files = fs.readdirSync(source);
    
    for (const file of files) {
      const sourcePath = path.join(source, file);
      const destPath = path.join(destination, file);
      const stat = fs.statSync(sourcePath);
      
      if (stat.isDirectory()) {
        this.copyDirectory(sourcePath, destPath, overwrite);
      } else {
        if (overwrite || !fs.existsSync(destPath)) {
          fs.copyFileSync(sourcePath, destPath);
        }
      }
    }
  }

  private async createArchive(sourcePath: string, backupId: string, format: 'zip' | 'tar'): Promise<string> {
    const extension = format === 'zip' ? 'zip' : 'tar.gz';
    const archivePath = path.join(this.backupDirectory, `${backupId}.${extension}`);
    
    return new Promise((resolve, reject) => {
      const output = fs.createWriteStream(archivePath);
      const archive = archiver(format === 'zip' ? 'zip' : 'tar', {
        zlib: { level: 9 }, // Maximum compression
        gzip: format === 'tar'
      });

      output.on('close', () => resolve(archivePath));
      archive.on('error', reject);

      archive.pipe(output);
      archive.directory(sourcePath, false);
      archive.finalize();
    });
  }

  private async extractArchive(archivePath: string, destination: string): Promise<void> {
    // Implementation would depend on the archive format
    // For now, throw error as this would require additional dependencies
    throw new Error('Archive extraction not implemented in this version');
  }

  private async calculateChecksum(filePath: string): Promise<string> {
    // Simple checksum calculation
    const crypto = require('crypto');
    const fileBuffer = fs.readFileSync(filePath);
    const hashSum = crypto.createHash('sha256');
    hashSum.update(fileBuffer);
    return hashSum.digest('hex');
  }

  private async verifyBackupIntegrity(backupPath: string, manifest: BackupManifest): Promise<void> {
    // Verify that all expected components exist
    if (manifest.components.database) {
      const dbPath = path.join(backupPath, 'database');
      if (!fs.existsSync(dbPath)) {
        throw new Error('Database backup missing');
      }
    }

    // Additional integrity checks could be added here
  }

  private cleanupDirectory(dirPath: string): void {
    if (fs.existsSync(dirPath)) {
      fs.rmSync(dirPath, { recursive: true, force: true });
    }
  }
}

export const systemBackupUtilities = new SystemBackupUtilities();