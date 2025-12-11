/**
 * Hospital Management System - Main Entry Point
 */

// Export all models
export * from './models';

// Export all services
export * from './services';

// Export storage manager
export { StorageManager } from './storage/StorageManager';

// Export utilities
export * from './utils';

// Export system initialization
export { initializeSystem, shutdownSystem, SystemServices } from './initialization';

// Export CLI functionality
export { HospitalCLI, startCLI } from './cli/index';