/**
 * Advanced Logging System
 * Structured logging with different levels and outputs
 */

import { env } from './env';

export enum LogLevel {
  DEBUG = 0,
  INFO = 1,
  WARN = 2,
  ERROR = 3,
}

interface LogEntry {
  timestamp: string;
  level: string;
  message: string;
  context?: Record<string, any>;
  error?: {
    name: string;
    message: string;
    stack?: string;
  };
}

class Logger {
  private minLevel: LogLevel;

  constructor() {
    this.minLevel = env.NODE_ENV === 'production' ? LogLevel.INFO : LogLevel.DEBUG;
  }

  private shouldLog(level: LogLevel): boolean {
    return level >= this.minLevel;
  }

  private formatLog(level: string, message: string, context?: Record<string, any>, error?: Error): LogEntry {
    const entry: LogEntry = {
      timestamp: new Date().toISOString(),
      level,
      message,
    };

    if (context) {
      entry.context = context;
    }

    if (error) {
      entry.error = {
        name: error.name,
        message: error.message,
        stack: error.stack,
      };
    }

    return entry;
  }

  private output(entry: LogEntry) {
    if (env.NODE_ENV === 'production') {
      // JSON format for production (easier to parse by log aggregators)
      console.log(JSON.stringify(entry));
    } else {
      // Pretty format for development
      const color = this.getColor(entry.level);
      console.log(
        `${color}[${entry.timestamp}] ${entry.level}${this.resetColor()}: ${entry.message}`,
        entry.context || '',
        entry.error || ''
      );
    }
  }

  private getColor(level: string): string {
    switch (level) {
      case 'DEBUG': return '\x1b[36m'; // Cyan
      case 'INFO': return '\x1b[32m';  // Green
      case 'WARN': return '\x1b[33m';  // Yellow
      case 'ERROR': return '\x1b[31m'; // Red
      default: return '';
    }
  }

  private resetColor(): string {
    return '\x1b[0m';
  }

  debug(message: string, context?: Record<string, any>) {
    if (this.shouldLog(LogLevel.DEBUG)) {
      this.output(this.formatLog('DEBUG', message, context));
    }
  }

  info(message: string, context?: Record<string, any>) {
    if (this.shouldLog(LogLevel.INFO)) {
      this.output(this.formatLog('INFO', message, context));
    }
  }

  warn(message: string, context?: Record<string, any>) {
    if (this.shouldLog(LogLevel.WARN)) {
      this.output(this.formatLog('WARN', message, context));
    }
  }

  error(message: string, error?: Error, context?: Record<string, any>) {
    if (this.shouldLog(LogLevel.ERROR)) {
      this.output(this.formatLog('ERROR', message, context, error));
    }
  }

  // Specialized logging methods
  http(method: string, path: string, statusCode: number, duration: number, userId?: string) {
    this.info('HTTP Request', {
      method,
      path,
      statusCode,
      duration: `${duration}ms`,
      userId,
    });
  }

  database(query: string, duration: number, error?: Error) {
    if (error) {
      this.error('Database Query Failed', error, { query, duration: `${duration}ms` });
    } else {
      this.debug('Database Query', { query, duration: `${duration}ms` });
    }
  }

  auth(action: string, userId?: string, success: boolean = true, reason?: string) {
    const level = success ? 'info' : 'warn';
    this[level](`Auth: ${action}`, {
      userId,
      success,
      reason,
    });
  }

  payment(action: string, userId: string, amount?: number, currency?: string, success: boolean = true) {
    this.info(`Payment: ${action}`, {
      userId,
      amount,
      currency,
      success,
    });
  }

  security(event: string, details: Record<string, any>) {
    this.warn(`Security Event: ${event}`, details);
  }
}

export const logger = new Logger();

