/**
 * Logger utility for the Hospital Management System
 * Provides structured logging with different levels and file operation tracking
 * Requirements: 7.4, 8.2
 */
export declare enum LogLevel {
    ERROR = "ERROR",
    WARN = "WARN",
    INFO = "INFO",
    DEBUG = "DEBUG"
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
export declare class Logger {
    private static instance;
    private logLevel;
    private constructor();
    /**
     * Get singleton logger instance
     */
    static getInstance(logLevel?: LogLevel): Logger;
    /**
     * Set the minimum log level
     */
    setLogLevel(level: LogLevel): void;
    /**
     * Log an error message
     */
    error(operation: string, message: string, error?: Error, details?: any): void;
    /**
     * Log a warning message
     */
    warn(operation: string, message: string, details?: any): void;
    /**
     * Log an info message
     */
    info(operation: string, message: string, details?: any): void;
    /**
     * Log a debug message
     */
    debug(operation: string, message: string, details?: any): void;
    /**
     * Log file operation
     */
    logFileOperation(operation: string, filePath: string, success: boolean, error?: Error): void;
    /**
     * Log validation error
     */
    logValidationError(operation: string, entityType: string, errors: string[], data?: any): void;
    /**
     * Log referential integrity violation
     */
    logReferentialIntegrityError(operation: string, entityType: string, referencedId: string, referencedType: string): void;
    /**
     * Core logging method
     */
    private log;
    /**
     * Check if message should be logged based on current log level
     */
    private shouldLog;
    /**
     * Format log message for output
     */
    private formatLogMessage;
}
/**
 * Get the default logger instance
 */
export declare const logger: Logger;
//# sourceMappingURL=logger.d.ts.map