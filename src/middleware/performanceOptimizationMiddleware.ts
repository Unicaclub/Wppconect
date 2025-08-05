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
import { advancedLogger } from '../util/advancedLogger';

interface CacheEntry {
  data: any;
  timestamp: number;
  expiry: number;
}

interface RateLimitEntry {
  count: number;
  resetTime: number;
}

class PerformanceOptimizationMiddleware {
  private cache: Map<string, CacheEntry> = new Map();
  private rateLimitMap: Map<string, RateLimitEntry> = new Map();
  private queryOptimizationCache: Map<string, any> = new Map();
  
  private cacheMaxSize = 1000;
  private cacheCleanupInterval = 5 * 60 * 1000; // 5 minutes
  private rateLimitWindow = 60 * 1000; // 1 minute
  private defaultRateLimit = 100; // requests per minute

  constructor() {
    this.startCacheCleanup();
    this.startRateLimitCleanup();
  }

  // Response caching middleware
  cacheMiddleware = (cacheDuration: number = 5 * 60 * 1000) => {
    return (req: Request, res: Response, next: NextFunction) => {
      // Only cache GET requests
      if (req.method !== 'GET') {
        return next();
      }

      const cacheKey = this.generateCacheKey(req);
      const cached = this.cache.get(cacheKey);

      if (cached && Date.now() < cached.expiry) {
        advancedLogger.debug('Cache hit', {
          operation: 'cache_hit',
          cacheKey,
          requestId: req.requestId
        });

        return res.json(cached.data);
      }

      // Override res.json to cache the response
      const originalJson = res.json.bind(res);
      res.json = (data: any) => {
        // Only cache successful responses
        if (res.statusCode === 200) {
          this.setCache(cacheKey, data, cacheDuration);
          
          advancedLogger.debug('Response cached', {
            operation: 'cache_set',
            cacheKey,
            requestId: req.requestId
          });
        }

        return originalJson(data);
      };

      next();
    };
  };

  // Rate limiting middleware
  rateLimitMiddleware = (limit: number = this.defaultRateLimit) => {
    return (req: Request, res: Response, next: NextFunction) => {
      const identifier = this.getClientIdentifier(req);
      const now = Date.now();
      
      let entry = this.rateLimitMap.get(identifier);
      
      if (!entry || now > entry.resetTime) {
        entry = {
          count: 1,
          resetTime: now + this.rateLimitWindow
        };
        this.rateLimitMap.set(identifier, entry);
      } else {
        entry.count++;
      }

      // Add rate limit headers
      res.setHeader('X-RateLimit-Limit', limit.toString());
      res.setHeader('X-RateLimit-Remaining', Math.max(0, limit - entry.count).toString());
      res.setHeader('X-RateLimit-Reset', Math.ceil(entry.resetTime / 1000).toString());

      if (entry.count > limit) {
        advancedLogger.warn('Rate limit exceeded', {
          operation: 'rate_limit_exceeded',
          identifier,
          count: entry.count,
          limit,
          requestId: req.requestId
        });

        return res.status(429).json({
          status: 'error',
          message: 'Rate limit exceeded',
          retryAfter: Math.ceil((entry.resetTime - now) / 1000)
        });
      }

      next();
    };
  };

  // Memory usage optimization middleware
  memoryOptimizationMiddleware = () => {
    return (req: Request, res: Response, next: NextFunction) => {
      const memUsage = process.memoryUsage();
      const memThreshold = 500 * 1024 * 1024; // 500MB

      if (memUsage.heapUsed > memThreshold) {
        advancedLogger.warn('High memory usage detected', {
          operation: 'memory_warning',
          heapUsed: Math.round(memUsage.heapUsed / 1024 / 1024),
          threshold: Math.round(memThreshold / 1024 / 1024),
          requestId: req.requestId
        });

        // Force garbage collection if available
        if (global.gc) {
          global.gc();
          
          advancedLogger.info('Garbage collection executed', {
            operation: 'garbage_collection',
            requestId: req.requestId
          });
        }

        // Clear oldest cache entries
        this.cleanupCache(true);
      }

      next();
    };
  };

  // Database query optimization middleware
  queryOptimizationMiddleware = () => {
    return (req: Request, res: Response, next: NextFunction) => {
      const startTime = Date.now();

      // Override common query methods to add optimization
      const originalQuery = req.query;
      req.query = this.optimizeQueryParams(originalQuery);

      // Track query performance
      res.on('finish', () => {
        const duration = Date.now() - startTime;
        
        if (duration > 5000) { // Log slow queries
          advancedLogger.warn('Slow query detected', {
            operation: 'slow_query',
            duration,
            path: req.path,
            query: req.query,
            requestId: req.requestId
          });
        }
      });

      next();
    };
  };

  // Compression middleware for large responses
  compressionMiddleware = () => {
    return (req: Request, res: Response, next: NextFunction) => {
      const originalJson = res.json.bind(res);
      
      res.json = (data: any) => {
        const dataSize = JSON.stringify(data).length;
        
        // For large responses, suggest compression
        if (dataSize > 10000) { // 10KB
          res.setHeader('X-Content-Size', dataSize.toString());
          
          advancedLogger.debug('Large response detected', {
            operation: 'large_response',
            size: dataSize,
            path: req.path,
            requestId: req.requestId
          });
        }

        return originalJson(data);
      };

      next();
    };
  };

  // Request timeout middleware
  timeoutMiddleware = (timeout: number = 30000) => {
    return (req: Request, res: Response, next: NextFunction) => {
      const timer = setTimeout(() => {
        if (!res.headersSent) {
          advancedLogger.warn('Request timeout', {
            operation: 'request_timeout',
            timeout,
            path: req.path,
            requestId: req.requestId
          });

          res.status(408).json({
            status: 'error',
            message: 'Request timeout'
          });
        }
      }, timeout);

      res.on('finish', () => {
        clearTimeout(timer);
      });

      next();
    };
  };

  // Helper methods
  private generateCacheKey(req: Request): string {
    const userId = req.params.userId || req.body?.userId || 'anonymous';
    const path = req.path;
    const query = JSON.stringify(req.query);
    return `${userId}:${path}:${query}`;
  }

  private getClientIdentifier(req: Request): string {
    // Use multiple identifiers for better accuracy
    const userId = req.params.userId || req.body?.userId;
    const ip = req.ip || req.connection.remoteAddress;
    const userAgent = req.get('User-Agent');
    
    return `${userId || 'anonymous'}:${ip}:${userAgent}`;
  }

  private setCache(key: string, data: any, duration: number): void {
    // Remove oldest entries if cache is full
    if (this.cache.size >= this.cacheMaxSize) {
      const oldestKey = this.cache.keys().next().value;
      this.cache.delete(oldestKey);
    }

    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      expiry: Date.now() + duration
    });
  }

  private optimizeQueryParams(query: any): any {
    const optimized = { ...query };
    
    // Add default pagination if not present
    if (!optimized.limit) {
      optimized.limit = '50';
    }
    
    if (!optimized.offset) {
      optimized.offset = '0';
    }

    // Limit maximum results to prevent large queries
    const limit = parseInt(optimized.limit as string, 10);
    if (limit > 100) {
      optimized.limit = '100';
    }

    return optimized;
  }

  private cleanupCache(force: boolean = false): void {
    const now = Date.now();
    let deletedCount = 0;

    for (const [key, entry] of this.cache.entries()) {
      if (force || now > entry.expiry) {
        this.cache.delete(key);
        deletedCount++;
      }
    }

    if (deletedCount > 0) {
      advancedLogger.debug('Cache cleanup completed', {
        operation: 'cache_cleanup',
        deletedEntries: deletedCount,
        remainingEntries: this.cache.size
      });
    }
  }

  private startCacheCleanup(): void {
    setInterval(() => {
      this.cleanupCache();
    }, this.cacheCleanupInterval);
  }

  private startRateLimitCleanup(): void {
    setInterval(() => {
      const now = Date.now();
      let deletedCount = 0;

      for (const [identifier, entry] of this.rateLimitMap.entries()) {
        if (now > entry.resetTime) {
          this.rateLimitMap.delete(identifier);
          deletedCount++;
        }
      }

      if (deletedCount > 0) {
        advancedLogger.debug('Rate limit cleanup completed', {
          operation: 'rate_limit_cleanup',
          deletedEntries: deletedCount,
          remainingEntries: this.rateLimitMap.size
        });
      }
    }, this.rateLimitWindow);
  }

  // Public methods for external use
  clearCache(): void {
    this.cache.clear();
    advancedLogger.info('Cache cleared manually', {
      operation: 'cache_clear'
    });
  }

  getCacheStats(): {
    size: number;
    maxSize: number;
    hitRate: number;
  } {
    return {
      size: this.cache.size,
      maxSize: this.cacheMaxSize,
      hitRate: 0 // Would need to track hits/misses for real hit rate
    };
  }

  getRateLimitStats(): {
    activeClients: number;
    totalRequests: number;
  } {
    const totalRequests = Array.from(this.rateLimitMap.values())
      .reduce((sum, entry) => sum + entry.count, 0);

    return {
      activeClients: this.rateLimitMap.size,
      totalRequests
    };
  }
}

export const performanceOptimization = new PerformanceOptimizationMiddleware();

// Export individual middleware functions for easy use
export const cacheMiddleware = performanceOptimization.cacheMiddleware;
export const rateLimitMiddleware = performanceOptimization.rateLimitMiddleware;
export const memoryOptimizationMiddleware = performanceOptimization.memoryOptimizationMiddleware;
export const queryOptimizationMiddleware = performanceOptimization.queryOptimizationMiddleware;
export const compressionMiddleware = performanceOptimization.compressionMiddleware;
export const timeoutMiddleware = performanceOptimization.timeoutMiddleware;