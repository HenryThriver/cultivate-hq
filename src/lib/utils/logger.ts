/**
 * Centralized logging utility for the application
 * Provides structured logging with different levels
 */

export type LogLevel = 'debug' | 'info' | 'warn' | 'error';

interface LogEntry {
  timestamp: string;
  level: LogLevel;
  message: string;
  context?: string;
  data?: unknown;
  error?: Error;
}

class Logger {
  private isDevelopment = process.env.NODE_ENV === 'development';

  private formatLogEntry(entry: LogEntry): string {
    const prefix = `[${entry.timestamp}] ${entry.level.toUpperCase()}`;
    const context = entry.context ? ` [${entry.context}]` : '';
    return `${prefix}${context}: ${entry.message}`;
  }

  private log(level: LogLevel, message: string, context?: string, data?: unknown, error?: Error): void {
    const entry: LogEntry = {
      timestamp: new Date().toISOString(),
      level,
      message,
      context,
      data,
      error
    };

    const formattedMessage = this.formatLogEntry(entry);

    // In development, use console methods for better formatting
    if (this.isDevelopment) {
      switch (level) {
        case 'debug':
          console.debug(formattedMessage, data || '');
          break;
        case 'info':
          console.info(formattedMessage, data || '');
          break;
        case 'warn':
          console.warn(formattedMessage, data || '');
          break;
        case 'error':
          console.error(formattedMessage, error || data || '');
          if (error?.stack) {
            console.error(error.stack);
          }
          break;
      }
    } else {
      // In production, you could send to external logging service
      // For now, just use console.error for errors and warnings
      if (level === 'error' || level === 'warn') {
        console.error(formattedMessage, { data, error: error?.message, stack: error?.stack });
      }
    }

    // TODO: In production, send logs to external service (e.g., Datadog, Sentry, etc.)
    // this.sendToExternalService(entry);
  }

  debug(message: string, context?: string, data?: unknown): void {
    this.log('debug', message, context, data);
  }

  info(message: string, context?: string, data?: unknown): void {
    this.log('info', message, context, data);
  }

  warn(message: string, context?: string, data?: unknown): void {
    this.log('warn', message, context, data);
  }

  error(message: string, error?: Error, context?: string, data?: unknown): void {
    this.log('error', message, context, data, error);
  }

  // Convenience methods for specific contexts
  adminAction(message: string, data?: unknown): void {
    this.info(message, 'ADMIN', data);
  }

  adminError(message: string, error?: Error, data?: unknown): void {
    this.error(message, error, 'ADMIN', data);
  }

  auth(message: string, data?: unknown): void {
    this.info(message, 'AUTH', data);
  }

  authError(message: string, error?: Error, data?: unknown): void {
    this.error(message, error, 'AUTH', data);
  }
}

// Export singleton instance
export const logger = new Logger();

// Export convenience functions for easier imports
export const { debug, info, warn, error, adminAction, adminError, auth, authError } = logger;