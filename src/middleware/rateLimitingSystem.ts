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

interface RateLimitRule {
  name: string;
  windowMs: number;
  maxRequests: number;
  skipSuccessfulRequests?: boolean;
  skipFailedRequests?: boolean;
  keyGenerator?: (req: Request) => string;
  onLimitReached?: (req: Request, res: Response) => void;
  whitelist?: string[];
  blacklist?: string[];
}

interface RateLimitEntry {
  count: number;
  resetTime: number;
  firstRequest: number;
}

interface RateLimitStats {
  rule: string;
  activeKeys: number;
  totalRequests: number;
  blockedRequests: number;
  resetTime: number;
}

class RateLimitingSystem {
  private rateLimitData: Map<string, RateLimitEntry> = new Map();
  private rateLimitStats: Map<string, { total: number; blocked: number }> = new Map();
  private rules: Map<string, RateLimitRule> = new Map();

  constructor() {
    this.initializeDefaultRules();
    this.startCleanupProcess();
  }

  // Initialize default rate limiting rules
  private initializeDefaultRules(): void {
    // Global API rate limiting
    this.addRule({
      name: 'global',
      windowMs: 15 * 60 * 1000, // 15 minutes
      maxRequests: 1000, // 1000 requests per 15 minutes
      keyGenerator: (req) => this.getClientIP(req)
    });

    // Authentication endpoints - more restrictive
    this.addRule({
      name: 'auth',
      windowMs: 15 * 60 * 1000, // 15 minutes
      maxRequests: 5, // 5 attempts per 15 minutes
      keyGenerator: (req) => `auth:${this.getClientIP(req)}`
    });

    // Message sending - moderate restrictions
    this.addRule({
      name: 'messages',
      windowMs: 60 * 1000, // 1 minute
      maxRequests: 30, // 30 messages per minute
      keyGenerator: (req) => `msg:${req.params?.userId || 'anonymous'}:${this.getClientIP(req)}`
    });

    // Webhook endpoints - higher limits
    this.addRule({
      name: 'webhooks',
      windowMs: 60 * 1000, // 1 minute
      maxRequests: 100, // 100 webhooks per minute
      keyGenerator: (req) => `webhook:${this.getClientIP(req)}`
    });

    // Admin operations - very restrictive
    this.addRule({
      name: 'admin',
      windowMs: 60 * 60 * 1000, // 1 hour
      maxRequests: 10, // 10 admin operations per hour
      keyGenerator: (req) => `admin:${req.params?.userId || 'anonymous'}`
    });

    // File uploads - bandwidth-based limiting
    this.addRule({
      name: 'uploads',
      windowMs: 60 * 1000, // 1 minute
      maxRequests: 5, // 5 file uploads per minute
      keyGenerator: (req) => `upload:${req.params?.userId || 'anonymous'}`
    });

    // Analytics/reporting - moderate restrictions
    this.addRule({
      name: 'analytics',
      windowMs: 60 * 1000, // 1 minute
      maxRequests: 20, // 20 analytics requests per minute
      keyGenerator: (req) => `analytics:${req.params?.userId || 'anonymous'}`
    });
  }

  // Add a new rate limiting rule
  addRule(rule: RateLimitRule): void {
    this.rules.set(rule.name, rule);
    this.rateLimitStats.set(rule.name, { total: 0, blocked: 0 });

    advancedLogger.info('Rate limiting rule added', {
      operation: 'rate_limit_rule_added',
      ruleName: rule.name,
      windowMs: rule.windowMs,
      maxRequests: rule.maxRequests
    });
  }

  // Remove a rate limiting rule
  removeRule(ruleName: string): void {
    this.rules.delete(ruleName);
    this.rateLimitStats.delete(ruleName);

    advancedLogger.info('Rate limiting rule removed', {
      operation: 'rate_limit_rule_removed',
      ruleName
    });
  }

  // Create middleware for a specific rule
  createMiddleware(ruleName: string) {
    return (req: Request, res: Response, next: NextFunction) => {
      const rule = this.rules.get(ruleName);
      if (!rule) {
        advancedLogger.warn('Rate limiting rule not found', {
          operation: 'rate_limit_rule_not_found',
          ruleName
        });
        return next();
      }

      this.applyRateLimit(req, res, next, rule);
    };
  }

  // Apply rate limiting logic
  private applyRateLimit(
    req: Request,
    res: Response,
    next: NextFunction,
    rule: RateLimitRule
  ): void {
    const key = rule.keyGenerator ? rule.keyGenerator(req) : this.getClientIP(req);
    const fullKey = `${rule.name}:${key}`;
    const now = Date.now();

    // Check whitelist
    if (rule.whitelist && rule.whitelist.includes(key)) {
      return next();
    }

    // Check blacklist
    if (rule.blacklist && rule.blacklist.includes(key)) {
      this.handleRateLimitExceeded(req, res, rule, 'blacklisted');
      return;
    }

    let entry = this.rateLimitData.get(fullKey);

    // Initialize or reset expired entry
    if (!entry || now > entry.resetTime) {
      entry = {
        count: 0,
        resetTime: now + rule.windowMs,
        firstRequest: now
      };
      this.rateLimitData.set(fullKey, entry);
    }

    // Increment request count
    entry.count++;

    // Update statistics
    const stats = this.rateLimitStats.get(rule.name);
    if (stats) {
      stats.total++;
    }

    // Check if limit exceeded
    if (entry.count > rule.maxRequests) {
      if (stats) {
        stats.blocked++;
      }

      this.handleRateLimitExceeded(req, res, rule, 'rate_limit_exceeded');
      return;
    }

    // Add rate limit headers
    this.addRateLimitHeaders(res, rule, entry);

    // Log if approaching limit
    if (entry.count > rule.maxRequests * 0.8) {
      advancedLogger.warn('Rate limit approaching', {
        operation: 'rate_limit_approaching',
        rule: rule.name,
        key,
        count: entry.count,
        limit: rule.maxRequests,
        resetTime: entry.resetTime
      });
    }

    next();
  }

  // Handle rate limit exceeded
  private handleRateLimitExceeded(
    req: Request,
    res: Response,
    rule: RateLimitRule,
    reason: string
  ): void {
    const key = rule.keyGenerator ? rule.keyGenerator(req) : this.getClientIP(req);
    const retryAfter = Math.ceil(rule.windowMs / 1000);

    advancedLogger.warn('Rate limit exceeded', {
      operation: 'rate_limit_exceeded',
      rule: rule.name,
      key,
      reason,
      userAgent: req.get('User-Agent'),
      path: req.path,
      method: req.method
    });

    // Custom handler if provided
    if (rule.onLimitReached) {
      rule.onLimitReached(req, res);
      return;
    }

    // Default response
    res.set({
      'Retry-After': retryAfter.toString(),
      'X-RateLimit-Limit': rule.maxRequests.toString(),
      'X-RateLimit-Remaining': '0',
      'X-RateLimit-Reset': Math.ceil((Date.now() + rule.windowMs) / 1000).toString()
    });

    res.status(429).json({
      status: 'error',
      message: 'Rate limit exceeded',
      retryAfter,
      rule: rule.name
    });
  }

  // Add rate limit headers to response
  private addRateLimitHeaders(res: Response, rule: RateLimitRule, entry: RateLimitEntry): void {
    const remaining = Math.max(0, rule.maxRequests - entry.count);
    const resetTime = Math.ceil(entry.resetTime / 1000);

    res.set({
      'X-RateLimit-Limit': rule.maxRequests.toString(),
      'X-RateLimit-Remaining': remaining.toString(),
      'X-RateLimit-Reset': resetTime.toString(),
      'X-RateLimit-Rule': rule.name
    });
  }

  // Get client IP address
  private getClientIP(req: Request): string {
    return req.ip || 
           req.connection.remoteAddress || 
           req.socket.remoteAddress || 
           (req.headers['x-forwarded-for'] as string)?.split(',')[0]?.trim() ||
           'unknown';
  }

  // Get statistics for all rules
  getStats(): RateLimitStats[] {
    const stats: RateLimitStats[] = [];

    for (const [ruleName, rule] of this.rules.entries()) {
      const ruleStats = this.rateLimitStats.get(ruleName);
      const activeKeys = Array.from(this.rateLimitData.keys())
        .filter(key => key.startsWith(`${ruleName}:`)).length;

      stats.push({
        rule: ruleName,
        activeKeys,
        totalRequests: ruleStats?.total || 0,
        blockedRequests: ruleStats?.blocked || 0,
        resetTime: Date.now() + rule.windowMs
      });
    }

    return stats;
  }

  // Get statistics for a specific rule
  getRuleStats(ruleName: string): RateLimitStats | null {
    const rule = this.rules.get(ruleName);
    const ruleStats = this.rateLimitStats.get(ruleName);
    
    if (!rule || !ruleStats) {
      return null;
    }

    const activeKeys = Array.from(this.rateLimitData.keys())
      .filter(key => key.startsWith(`${ruleName}:`)).length;

    return {
      rule: ruleName,
      activeKeys,
      totalRequests: ruleStats.total,
      blockedRequests: ruleStats.blocked,
      resetTime: Date.now() + rule.windowMs
    };
  }

  // Reset statistics for a rule
  resetRuleStats(ruleName: string): void {
    const stats = this.rateLimitStats.get(ruleName);
    if (stats) {
      stats.total = 0;
      stats.blocked = 0;
    }

    // Remove all entries for this rule
    for (const key of this.rateLimitData.keys()) {
      if (key.startsWith(`${ruleName}:`)) {
        this.rateLimitData.delete(key);
      }
    }

    advancedLogger.info('Rate limit stats reset', {
      operation: 'rate_limit_stats_reset',
      rule: ruleName
    });
  }

  // Whitelist an IP or key for a specific rule
  addToWhitelist(ruleName: string, key: string): void {
    const rule = this.rules.get(ruleName);
    if (rule) {
      if (!rule.whitelist) {
        rule.whitelist = [];
      }
      if (!rule.whitelist.includes(key)) {
        rule.whitelist.push(key);
        
        advancedLogger.info('Key added to whitelist', {
          operation: 'rate_limit_whitelist_add',
          rule: ruleName,
          key
        });
      }
    }
  }

  // Remove from whitelist
  removeFromWhitelist(ruleName: string, key: string): void {
    const rule = this.rules.get(ruleName);
    if (rule && rule.whitelist) {
      const index = rule.whitelist.indexOf(key);
      if (index > -1) {
        rule.whitelist.splice(index, 1);
        
        advancedLogger.info('Key removed from whitelist', {
          operation: 'rate_limit_whitelist_remove',
          rule: ruleName,
          key
        });
      }
    }
  }

  // Blacklist an IP or key for a specific rule
  addToBlacklist(ruleName: string, key: string): void {
    const rule = this.rules.get(ruleName);
    if (rule) {
      if (!rule.blacklist) {
        rule.blacklist = [];
      }
      if (!rule.blacklist.includes(key)) {
        rule.blacklist.push(key);
        
        advancedLogger.info('Key added to blacklist', {
          operation: 'rate_limit_blacklist_add',
          rule: ruleName,
          key
        });
      }
    }
  }

  // Remove from blacklist
  removeFromBlacklist(ruleName: string, key: string): void {
    const rule = this.rules.get(ruleName);
    if (rule && rule.blacklist) {
      const index = rule.blacklist.indexOf(key);
      if (index > -1) {
        rule.blacklist.splice(index, 1);
        
        advancedLogger.info('Key removed from blacklist', {
          operation: 'rate_limit_blacklist_remove',
          rule: ruleName,
          key
        });
      }
    }
  }

  // Get top blocked IPs/keys
  getTopBlockedKeys(limit: number = 10): Array<{
    key: string;
    rule: string;
    blockCount: number;
    lastBlocked: Date;
  }> {
    // This would require more sophisticated tracking
    // For now, return empty array
    return [];
  }

  // Start cleanup process for expired entries
  private startCleanupProcess(): void {
    setInterval(() => {
      const now = Date.now();
      let cleanedCount = 0;

      for (const [key, entry] of this.rateLimitData.entries()) {
        if (now > entry.resetTime) {
          this.rateLimitData.delete(key);
          cleanedCount++;
        }
      }

      if (cleanedCount > 0) {
        advancedLogger.debug('Rate limit data cleaned up', {
          operation: 'rate_limit_cleanup',
          cleanedEntries: cleanedCount,
          remainingEntries: this.rateLimitData.size
        });
      }
    }, 5 * 60 * 1000); // Cleanup every 5 minutes

    // Reset daily statistics at midnight
    const resetDailyStats = () => {
      const now = new Date();
      const tomorrow = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1);
      const timeUntilMidnight = tomorrow.getTime() - now.getTime();

      setTimeout(() => {
        for (const stats of this.rateLimitStats.values()) {
          stats.total = 0;
          stats.blocked = 0;
        }

        advancedLogger.info('Rate limit daily stats reset', {
          operation: 'rate_limit_daily_reset'
        });

        // Set up daily reset
        setInterval(() => {
          for (const stats of this.rateLimitStats.values()) {
            stats.total = 0;
            stats.blocked = 0;
          }
        }, 24 * 60 * 60 * 1000);

      }, timeUntilMidnight);
    };

    resetDailyStats();
  }
}

// Export singleton instance
export const rateLimitingSystem = new RateLimitingSystem();

// Export middleware functions for easy use
export const globalRateLimit = rateLimitingSystem.createMiddleware('global');
export const authRateLimit = rateLimitingSystem.createMiddleware('auth');
export const messageRateLimit = rateLimitingSystem.createMiddleware('messages');
export const webhookRateLimit = rateLimitingSystem.createMiddleware('webhooks');
export const adminRateLimit = rateLimitingSystem.createMiddleware('admin');
export const uploadRateLimit = rateLimitingSystem.createMiddleware('uploads');
export const analyticsRateLimit = rateLimitingSystem.createMiddleware('analytics');