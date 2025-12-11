/**
 * StorageManager handles file I/O operations for the Hospital Management System.
 * All data is stored as JSON files in a structured directory hierarchy.
 */
export declare class StorageManager {
    private dataDir;
    constructor(dataDir?: string);
    /**
     * Initialize the data directory structure.
     * Creates the root data directory and subdirectories for each entity type.
     */
    initialize(): Promise<void>;
    /**
     * Save an entity to storage.
     * @param collection - The collection name (e.g., 'patients', 'doctors')
     * @param id - The unique identifier for the entity
     * @param data - The entity data to save
     */
    save<T>(collection: string, id: string, data: T): Promise<void>;
    /**
     * Load an entity from storage.
     * @param collection - The collection name
     * @param id - The unique identifier for the entity
     * @returns The entity data or null if not found
     */
    load<T>(collection: string, id: string): Promise<T | null>;
    /**
     * Load all entities from a collection.
     * @param collection - The collection name
     * @returns Array of all entities in the collection
     */
    loadAll<T>(collection: string): Promise<T[]>;
    /**
     * Delete an entity from storage.
     * @param collection - The collection name
     * @param id - The unique identifier for the entity
     */
    delete(collection: string, id: string): Promise<void>;
    /**
     * Check if an entity exists in storage.
     * @param collection - The collection name
     * @param id - The unique identifier for the entity
     * @returns True if the entity exists, false otherwise
     */
    exists(collection: string, id: string): Promise<boolean>;
    /**
     * Get the file path for an entity.
     * @param collection - The collection name
     * @param id - The unique identifier for the entity
     * @returns The full file path
     */
    private getFilePath;
}
//# sourceMappingURL=StorageManager.d.ts.map