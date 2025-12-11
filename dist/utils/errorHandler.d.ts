/**
 * Error handling utilities for the Hospital Management System
 * Provides standardized error types, validation, and user-friendly error messages
 * Requirements: 7.4, 8.2
 */
/**
 * Standard error codes used throughout the application
 */
export declare enum ErrorCode {
    VALIDATION_ERROR = "VALIDATION_ERROR",
    MISSING_REQUIRED_FIELDS = "MISSING_REQUIRED_FIELDS",
    INVALID_DATA_TYPE = "INVALID_DATA_TYPE",
    INVALID_FORMAT = "INVALID_FORMAT",
    ENTITY_NOT_FOUND = "ENTITY_NOT_FOUND",
    ENTITY_ALREADY_EXISTS = "ENTITY_ALREADY_EXISTS",
    REFERENTIAL_INTEGRITY_ERROR = "REFERENTIAL_INTEGRITY_ERROR",
    INVALID_REFERENCE = "INVALID_REFERENCE",
    STORAGE_ERROR = "STORAGE_ERROR",
    FILE_READ_ERROR = "FILE_READ_ERROR",
    FILE_WRITE_ERROR = "FILE_WRITE_ERROR",
    JSON_PARSE_ERROR = "JSON_PARSE_ERROR",
    INITIALIZATION_ERROR = "INITIALIZATION_ERROR",
    UNKNOWN_ERROR = "UNKNOWN_ERROR"
}
/**
 * Standard error response format
 */
export interface ErrorResponse {
    success: false;
    error: {
        code: ErrorCode;
        message: string;
        details?: any;
        timestamp: string;
    };
}
/**
 * Custom application error class
 */
export declare class AppError extends Error {
    readonly code: ErrorCode;
    readonly details?: any;
    readonly timestamp: string;
    constructor(code: ErrorCode, message: string, details?: any);
    /**
     * Convert error to standardized response format
     */
    toErrorResponse(): ErrorResponse;
}
/**
 * Validation error for missing required fields
 */
export declare class ValidationError extends AppError {
    constructor(entityType: string, missingFields: string[], providedData?: any);
}
/**
 * Entity not found error
 */
export declare class EntityNotFoundError extends AppError {
    constructor(entityType: string, id: string);
}
/**
 * Referential integrity error
 */
export declare class ReferentialIntegrityError extends AppError {
    constructor(entityType: string, referencedType: string, referencedId: string);
}
/**
 * Storage operation error
 */
export declare class StorageError extends AppError {
    constructor(operation: string, filePath: string, originalError: Error);
}
/**
 * Input validation utilities
 */
export declare class InputValidator {
    /**
     * Validate that a string is not empty or whitespace-only
     */
    static isNonEmptyString(value: any): value is string;
    /**
     * Validate email format (basic validation)
     */
    static isValidEmail(email: string): boolean;
    /**
     * Validate date format (ISO 8601 or YYYY-MM-DD)
     */
    static isValidDate(dateString: string): boolean;
    /**
     * Validate phone number format (basic validation)
     */
    static isValidPhoneNumber(phone: string): boolean;
    /**
     * Sanitize string input by trimming and removing dangerous characters
     */
    static sanitizeString(input: string): string;
    /**
     * Validate and sanitize ID format
     */
    static isValidId(id: string): boolean;
    /**
     * Validate appointment status
     */
    static isValidAppointmentStatus(status: string): status is 'scheduled' | 'completed' | 'cancelled';
}
/**
 * Error handler utility functions
 */
export declare class ErrorHandler {
    /**
     * Handle and log errors consistently
     */
    static handleError(operation: string, error: unknown): AppError;
    /**
     * Create user-friendly error message from AppError
     */
    static getUserFriendlyMessage(error: AppError): string;
    /**
     * Wrap async operations with error handling
     */
    static wrapAsync<T>(operation: string, asyncFn: () => Promise<T>): Promise<T>;
    /**
     * Validate required fields for any entity
     */
    static validateRequiredFields(entityType: string, data: Record<string, any>, requiredFields: string[]): void;
}
//# sourceMappingURL=errorHandler.d.ts.map