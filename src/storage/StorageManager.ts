import * as fs from 'fs/promises';
import * as path from 'path';
import { logger, ErrorHandler, StorageError, ErrorCode, AppError } from '../utils';

/**
 * StorageManager handles file I/O operations for the Hospital Management System.
 * All data is stored as JSON files in a structured directory hierarchy.
 */
export class StorageManager {
  private dataDir: string;

  constructor(dataDir: string = './data') {
    this.dataDir = dataDir;
  }

  /**
   * Initialize the data directory structure.
   * Creates the root data directory and subdirectories for each entity type.
   */
  async initialize(): Promise<void> {
    const collections = ['patients', 'doctors', 'appointments', 'medical-records'];
    
    return ErrorHandler.wrapAsync('storage-initialize', async () => {
      logger.info('storage-initialize', `Initializing data directory: ${this.dataDir}`);
      
      // Create root data directory
      await fs.mkdir(this.dataDir, { recursive: true });
      logger.debug('storage-initialize', `Created root directory: ${this.dataDir}`);
      
      // Create subdirectories for each collection
      for (const collection of collections) {
        const collectionPath = path.join(this.dataDir, collection);
        await fs.mkdir(collectionPath, { recursive: true });
        logger.debug('storage-initialize', `Created collection directory: ${collectionPath}`);
      }
      
      logger.info('storage-initialize', 'Data directory initialization completed successfully');
    });
  }

  /**
   * Save an entity to storage.
   * @param collection - The collection name (e.g., 'patients', 'doctors')
   * @param id - The unique identifier for the entity
   * @param data - The entity data to save
   */
  async save<T>(collection: string, id: string, data: T): Promise<void> {
    const filePath = this.getFilePath(collection, id);
    
    return ErrorHandler.wrapAsync(`storage-save-${collection}`, async () => {
      try {
        const jsonData = JSON.stringify(data, null, 2);
        await fs.writeFile(filePath, jsonData, 'utf-8');
        logger.logFileOperation(`storage-save-${collection}`, filePath, true);
      } catch (error) {
        logger.logFileOperation(`storage-save-${collection}`, filePath, false, error as Error);
        throw new StorageError('save', filePath, error as Error);
      }
    });
  }

  /**
   * Load an entity from storage.
   * @param collection - The collection name
   * @param id - The unique identifier for the entity
   * @returns The entity data or null if not found
   */
  async load<T>(collection: string, id: string): Promise<T | null> {
    const filePath = this.getFilePath(collection, id);
    
    return ErrorHandler.wrapAsync(`storage-load-${collection}`, async () => {
      try {
        const jsonData = await fs.readFile(filePath, 'utf-8');
        const parsedData = JSON.parse(jsonData) as T;
        logger.logFileOperation(`storage-load-${collection}`, filePath, true);
        return parsedData;
      } catch (error) {
        const nodeError = error as NodeJS.ErrnoException;
        if (nodeError.code === 'ENOENT') {
          logger.debug(`storage-load-${collection}`, `File not found: ${filePath}`);
          return null;
        }
        
        logger.logFileOperation(`storage-load-${collection}`, filePath, false, error as Error);
        
        if (error instanceof SyntaxError) {
          throw new AppError(ErrorCode.JSON_PARSE_ERROR, `Corrupted data file: ${filePath}`, { filePath });
        }
        
        throw new StorageError('load', filePath, error as Error);
      }
    });
  }

  /**
   * Load all entities from a collection.
   * @param collection - The collection name
   * @returns Array of all entities in the collection
   */
  async loadAll<T>(collection: string): Promise<T[]> {
    const collectionPath = path.join(this.dataDir, collection);
    const entities: T[] = [];
    
    return ErrorHandler.wrapAsync(`storage-loadAll-${collection}`, async () => {
      try {
        const files = await fs.readdir(collectionPath);
        logger.debug(`storage-loadAll-${collection}`, `Found ${files.length} files in ${collectionPath}`);
        
        let successCount = 0;
        let skipCount = 0;
        
        for (const file of files) {
          if (file.endsWith('.json')) {
            const filePath = path.join(collectionPath, file);
            try {
              const jsonData = await fs.readFile(filePath, 'utf-8');
              const entity = JSON.parse(jsonData) as T;
              entities.push(entity);
              successCount++;
            } catch (parseError) {
              // Log warning but continue with other files (handles corrupted data gracefully)
              logger.warn(
                `storage-loadAll-${collection}`, 
                `Skipping corrupted file: ${file}`, 
                { filePath, error: (parseError as Error).message }
              );
              skipCount++;
            }
          }
        }
        
        logger.info(
          `storage-loadAll-${collection}`, 
          `Loaded ${successCount} entities, skipped ${skipCount} corrupted files`
        );
        
        return entities;
      } catch (error) {
        const nodeError = error as NodeJS.ErrnoException;
        if (nodeError.code === 'ENOENT') {
          logger.debug(`storage-loadAll-${collection}`, `Collection directory not found: ${collectionPath}`);
          return [];
        }
        throw new StorageError('loadAll', collectionPath, error as Error);
      }
    });
  }

  /**
   * Delete an entity from storage.
   * @param collection - The collection name
   * @param id - The unique identifier for the entity
   */
  async delete(collection: string, id: string): Promise<void> {
    const filePath = this.getFilePath(collection, id);
    
    return ErrorHandler.wrapAsync(`storage-delete-${collection}`, async () => {
      try {
        await fs.unlink(filePath);
        logger.logFileOperation(`storage-delete-${collection}`, filePath, true);
      } catch (error) {
        const nodeError = error as NodeJS.ErrnoException;
        if (nodeError.code === 'ENOENT') {
          // File doesn't exist, consider it already deleted
          logger.debug(`storage-delete-${collection}`, `File already deleted: ${filePath}`);
          return;
        }
        logger.logFileOperation(`storage-delete-${collection}`, filePath, false, error as Error);
        throw new StorageError('delete', filePath, error as Error);
      }
    });
  }

  /**
   * Check if an entity exists in storage.
   * @param collection - The collection name
   * @param id - The unique identifier for the entity
   * @returns True if the entity exists, false otherwise
   */
  async exists(collection: string, id: string): Promise<boolean> {
    const filePath = this.getFilePath(collection, id);
    
    return ErrorHandler.wrapAsync(`storage-exists-${collection}`, async () => {
      try {
        await fs.access(filePath);
        logger.debug(`storage-exists-${collection}`, `File exists: ${filePath}`);
        return true;
      } catch {
        logger.debug(`storage-exists-${collection}`, `File does not exist: ${filePath}`);
        return false;
      }
    });
  }

  /**
   * Get the file path for an entity.
   * @param collection - The collection name
   * @param id - The unique identifier for the entity
   * @returns The full file path
   */
  private getFilePath(collection: string, id: string): string {
    return path.join(this.dataDir, collection, `${id}.json`);
  }
}
