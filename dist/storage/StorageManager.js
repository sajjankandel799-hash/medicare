"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.StorageManager = void 0;
const fs = __importStar(require("fs/promises"));
const path = __importStar(require("path"));
const utils_1 = require("../utils");
/**
 * StorageManager handles file I/O operations for the Hospital Management System.
 * All data is stored as JSON files in a structured directory hierarchy.
 */
class StorageManager {
    constructor(dataDir = './data') {
        this.dataDir = dataDir;
    }
    /**
     * Initialize the data directory structure.
     * Creates the root data directory and subdirectories for each entity type.
     */
    async initialize() {
        const collections = ['patients', 'doctors', 'appointments', 'medical-records'];
        return utils_1.ErrorHandler.wrapAsync('storage-initialize', async () => {
            utils_1.logger.info('storage-initialize', `Initializing data directory: ${this.dataDir}`);
            // Create root data directory
            await fs.mkdir(this.dataDir, { recursive: true });
            utils_1.logger.debug('storage-initialize', `Created root directory: ${this.dataDir}`);
            // Create subdirectories for each collection
            for (const collection of collections) {
                const collectionPath = path.join(this.dataDir, collection);
                await fs.mkdir(collectionPath, { recursive: true });
                utils_1.logger.debug('storage-initialize', `Created collection directory: ${collectionPath}`);
            }
            utils_1.logger.info('storage-initialize', 'Data directory initialization completed successfully');
        });
    }
    /**
     * Save an entity to storage.
     * @param collection - The collection name (e.g., 'patients', 'doctors')
     * @param id - The unique identifier for the entity
     * @param data - The entity data to save
     */
    async save(collection, id, data) {
        const filePath = this.getFilePath(collection, id);
        return utils_1.ErrorHandler.wrapAsync(`storage-save-${collection}`, async () => {
            try {
                const jsonData = JSON.stringify(data, null, 2);
                await fs.writeFile(filePath, jsonData, 'utf-8');
                utils_1.logger.logFileOperation(`storage-save-${collection}`, filePath, true);
            }
            catch (error) {
                utils_1.logger.logFileOperation(`storage-save-${collection}`, filePath, false, error);
                throw new utils_1.StorageError('save', filePath, error);
            }
        });
    }
    /**
     * Load an entity from storage.
     * @param collection - The collection name
     * @param id - The unique identifier for the entity
     * @returns The entity data or null if not found
     */
    async load(collection, id) {
        const filePath = this.getFilePath(collection, id);
        return utils_1.ErrorHandler.wrapAsync(`storage-load-${collection}`, async () => {
            try {
                const jsonData = await fs.readFile(filePath, 'utf-8');
                const parsedData = JSON.parse(jsonData);
                utils_1.logger.logFileOperation(`storage-load-${collection}`, filePath, true);
                return parsedData;
            }
            catch (error) {
                const nodeError = error;
                if (nodeError.code === 'ENOENT') {
                    utils_1.logger.debug(`storage-load-${collection}`, `File not found: ${filePath}`);
                    return null;
                }
                utils_1.logger.logFileOperation(`storage-load-${collection}`, filePath, false, error);
                if (error instanceof SyntaxError) {
                    throw new utils_1.AppError(utils_1.ErrorCode.JSON_PARSE_ERROR, `Corrupted data file: ${filePath}`, { filePath });
                }
                throw new utils_1.StorageError('load', filePath, error);
            }
        });
    }
    /**
     * Load all entities from a collection.
     * @param collection - The collection name
     * @returns Array of all entities in the collection
     */
    async loadAll(collection) {
        const collectionPath = path.join(this.dataDir, collection);
        const entities = [];
        return utils_1.ErrorHandler.wrapAsync(`storage-loadAll-${collection}`, async () => {
            try {
                const files = await fs.readdir(collectionPath);
                utils_1.logger.debug(`storage-loadAll-${collection}`, `Found ${files.length} files in ${collectionPath}`);
                let successCount = 0;
                let skipCount = 0;
                for (const file of files) {
                    if (file.endsWith('.json')) {
                        const filePath = path.join(collectionPath, file);
                        try {
                            const jsonData = await fs.readFile(filePath, 'utf-8');
                            const entity = JSON.parse(jsonData);
                            entities.push(entity);
                            successCount++;
                        }
                        catch (parseError) {
                            // Log warning but continue with other files (handles corrupted data gracefully)
                            utils_1.logger.warn(`storage-loadAll-${collection}`, `Skipping corrupted file: ${file}`, { filePath, error: parseError.message });
                            skipCount++;
                        }
                    }
                }
                utils_1.logger.info(`storage-loadAll-${collection}`, `Loaded ${successCount} entities, skipped ${skipCount} corrupted files`);
                return entities;
            }
            catch (error) {
                const nodeError = error;
                if (nodeError.code === 'ENOENT') {
                    utils_1.logger.debug(`storage-loadAll-${collection}`, `Collection directory not found: ${collectionPath}`);
                    return [];
                }
                throw new utils_1.StorageError('loadAll', collectionPath, error);
            }
        });
    }
    /**
     * Delete an entity from storage.
     * @param collection - The collection name
     * @param id - The unique identifier for the entity
     */
    async delete(collection, id) {
        const filePath = this.getFilePath(collection, id);
        return utils_1.ErrorHandler.wrapAsync(`storage-delete-${collection}`, async () => {
            try {
                await fs.unlink(filePath);
                utils_1.logger.logFileOperation(`storage-delete-${collection}`, filePath, true);
            }
            catch (error) {
                const nodeError = error;
                if (nodeError.code === 'ENOENT') {
                    // File doesn't exist, consider it already deleted
                    utils_1.logger.debug(`storage-delete-${collection}`, `File already deleted: ${filePath}`);
                    return;
                }
                utils_1.logger.logFileOperation(`storage-delete-${collection}`, filePath, false, error);
                throw new utils_1.StorageError('delete', filePath, error);
            }
        });
    }
    /**
     * Check if an entity exists in storage.
     * @param collection - The collection name
     * @param id - The unique identifier for the entity
     * @returns True if the entity exists, false otherwise
     */
    async exists(collection, id) {
        const filePath = this.getFilePath(collection, id);
        return utils_1.ErrorHandler.wrapAsync(`storage-exists-${collection}`, async () => {
            try {
                await fs.access(filePath);
                utils_1.logger.debug(`storage-exists-${collection}`, `File exists: ${filePath}`);
                return true;
            }
            catch {
                utils_1.logger.debug(`storage-exists-${collection}`, `File does not exist: ${filePath}`);
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
    getFilePath(collection, id) {
        return path.join(this.dataDir, collection, `${id}.json`);
    }
}
exports.StorageManager = StorageManager;
//# sourceMappingURL=StorageManager.js.map