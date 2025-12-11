/**
 * Utility functions for the Hospital Management System
 */

export { generateId, type EntityType } from './idGenerator';
export { logger, Logger, LogLevel } from './logger';
export { 
  ErrorHandler, 
  InputValidator, 
  AppError, 
  ValidationError, 
  EntityNotFoundError, 
  ReferentialIntegrityError, 
  StorageError,
  ErrorCode,
  ErrorResponse 
} from './errorHandler';
