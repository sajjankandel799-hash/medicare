"use strict";
/**
 * Logger utility for the Hospital Management System
 * Provides structured logging with different levels and file operation tracking
 * Requirements: 7.4, 8.2
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.logger = exports.Logger = exports.LogLevel = void 0;
var LogLevel;
(function (LogLevel) {
    LogLevel["ERROR"] = "ERROR";
    LogLevel["WARN"] = "WARN";
    LogLevel["INFO"] = "INFO";
    LogLevel["DEBUG"] = "DEBUG";
})(LogLevel || (exports.LogLevel = LogLevel = {}));
/**
 * Logger class for structured logging throughout the application
 */
class Logger {
    constructor(logLevel = LogLevel.INFO) {
        this.logLevel = logLevel;
    }
    /**
     * Get singleton logger instance
     */
    static getInstance(logLevel) {
        if (!Logger.instance) {
            Logger.instance = new Logger(logLevel);
        }
        return Logger.instance;
    }
    /**
     * Set the minimum log level
     */
    setLogLevel(level) {
        this.logLevel = level;
    }
    /**
     * Log an error message
     */
    error(operation, message, error, details) {
        this.log(LogLevel.ERROR, operation, message, details, error);
    }
    /**
     * Log a warning message
     */
    warn(operation, message, details) {
        this.log(LogLevel.WARN, operation, message, details);
    }
    /**
     * Log an info message
     */
    info(operation, message, details) {
        this.log(LogLevel.INFO, operation, message, details);
    }
    /**
     * Log a debug message
     */
    debug(operation, message, details) {
        this.log(LogLevel.DEBUG, operation, message, details);
    }
    /**
     * Log file operation
     */
    logFileOperation(operation, filePath, success, error) {
        const message = success
            ? `File operation successful: ${filePath}`
            : `File operation failed: ${filePath}`;
        const details = { filePath, success };
        if (success) {
            this.debug(operation, message, details);
        }
        else {
            this.error(operation, message, error, details);
        }
    }
    /**
     * Log validation error
     */
    logValidationError(operation, entityType, errors, data) {
        const message = `Validation failed for ${entityType}: ${errors.join(', ')}`;
        const details = { entityType, validationErrors: errors, data };
        this.warn(operation, message, details);
    }
    /**
     * Log referential integrity violation
     */
    logReferentialIntegrityError(operation, entityType, referencedId, referencedType) {
        const message = `Referential integrity violation: ${entityType} references non-existent ${referencedType} with ID ${referencedId}`;
        const details = { entityType, referencedId, referencedType };
        this.error(operation, message, undefined, details);
    }
    /**
     * Core logging method
     */
    log(level, operation, message, details, error) {
        if (!this.shouldLog(level)) {
            return;
        }
        const logEntry = {
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
        }
        else {
            console.log(formattedMessage);
        }
    }
    /**
     * Check if message should be logged based on current log level
     */
    shouldLog(level) {
        const levels = [LogLevel.ERROR, LogLevel.WARN, LogLevel.INFO, LogLevel.DEBUG];
        const currentLevelIndex = levels.indexOf(this.logLevel);
        const messageLevelIndex = levels.indexOf(level);
        return messageLevelIndex <= currentLevelIndex;
    }
    /**
     * Format log message for output
     */
    formatLogMessage(entry) {
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
exports.Logger = Logger;
/**
 * Get the default logger instance
 */
exports.logger = Logger.getInstance();
//# sourceMappingURL=logger.js.map