/**
 * Logger utility for the Hospital Management System
 * Provides structured logging with different levels and file operation tracking
 * Requirements: 7.4, 8.2
 */

export enum LogLevel {
  ERROR = 'ERROR',
  WARN = 'WARN',
  INFO = 'INFO',
  DEBUG = 'DEBUG'
}

export interface LogEntry {
  timestamp: string;
  level: LogLevel;
  operation: string;
  message: string;
  details?: any;
  error?: Error;
}

/**
 * Logger class for structured logging throughout the application
 */
export class Logger {
  private static instance: Logger;
  private logLevel: LogLevel;

  private constructor(logLevel: LogLevel = LogLevel.INFO) {
    this.logLevel = logLevel;
  }

  /**
   * Get singleton logger instance
   */
  public static getInstance(logLevel?: LogLevel): Logger {
    if (!Logger.instance) {
      Logger.instance = new Logger(logLevel);
    }
    return Logger.instance;
  }

  /**
   * Set the minimum log level
   */
  public setLogLevel(level: LogLevel): void {
    this.logLevel = level;
  }

  /**
   * Log an error message
   */
  public error(operation: string, message: string, error?: Error, details?: any): void {
    this.log(LogLevel.ERROR, operation, message, details, error);
  }

  /**
   * Log a warning message
   */
  public warn(operation: string, message: string, details?: any): void {
    this.log(LogLevel.WARN, operation, message, details);
  }

  /**
   * Log an info message
   */
  public info(operation: string, message: string, details?: any): void {
    this.log(LogLevel.INFO, operation, message, details);
  }

  /**
   * Log a debug message
   */
  public debug(operation: string, message: string, details?: any): void {
    this.log(LogLevel.DEBUG, operation, message, details);
  }

  /**
   * Log file operation
   */
  public logFileOperation(operation: string, filePath: string, success: boolean, error?: Error): void {
    const message = success 
      ? `File operation successful: ${filePath}`
      : `File operation failed: ${filePath}`;
    
    const details = { filePath, success };
    
    if (success) {
      this.debug(operation, message, details);
    } else {
      this.error(operation, message, error, details);
    }
  }

  /**
   * Log validation error
   */
  public logValidationError(operation: string, entityType: string, errors: string[], data?: any): void {
    const message = `Validation failed for ${entityType}: ${errors.join(', ')}`;
    const details = { entityType, validationErrors: errors, data };
    this.warn(operation, message, details);
  }

  /**
   * Log referential integrity violation
   */
  public logReferentialIntegrityError(operation: string, entityType: string, referencedId: string, referencedType: string): void {
    const message = `Referential integrity violation: ${entityType} references non-existent ${referencedType} with ID ${referencedId}`;
    const details = { entityType, referencedId, referencedType };
    this.error(operation, message, undefined, details);
  }

  /**
   * Core logging method
   */
  private log(level: LogLevel, operation: string, message: string, details?: any, error?: Error): void {
    if (!this.shouldLog(level)) {
      return;
    }

    const logEntry: LogEntry = {
      timestamp: new Date().toISOString(),
      level,
      operation,
      message,
      ...(details && { details }),
      ...(error && { error: { name: error.name, message: error.message, stack: error.stack } })
    };

    // Format output based on log level
    const formattedMessage = this.formatLogMessage(logEntry);
    
    // Output to appropriate stream
    if (level === LogLevel.ERROR) {
      console.error(formattedMessage);
    } else {
      console.log(formattedMessage);
    }
  }

  /**
   * Check if message should be logged based on current log level
   */
  private shouldLog(level: LogLevel): boolean {
    const levels = [LogLevel.ERROR, LogLevel.WARN, LogLevel.INFO, LogLevel.DEBUG];
    const currentLevelIndex = levels.indexOf(this.logLevel);
    const messageLevelIndex = levels.indexOf(level);
    return messageLevelIndex <= currentLevelIndex;
  }

  /**
   * Format log message for output
   */
  private formatLogMessage(entry: LogEntry): string {
    const timestamp = entry.timestamp;
    const level = entry.level.padEnd(5);
    const operation = entry.operation.padEnd(20);
    
    let message = `[${timestamp}] ${level} ${operation} ${entry.message}`;
    
    if (entry.details) {
      message += ` | Details: ${JSON.stringify(entry.details)}`;
    }
    
    if (entry.error) {
      message += ` | Error: ${entry.error.message}`;
      if (entry.error.stack) {
        message += `\nStack: ${entry.error.stack}`;
      }
    }
    
    return message;
  }
}

/**
 * Get the default logger instance
 */
export const logger = Logger.getInstance();