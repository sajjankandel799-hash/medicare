import { Doctor } from '../models/Doctor';
import { StorageManager } from '../storage/StorageManager';
/**
 * DoctorService handles all doctor-related operations
 * Requirements: 2.1, 2.2, 2.3, 2.4, 2.5
 */
export declare class DoctorService {
    private storage;
    private readonly COLLECTION;
    constructor(storage: StorageManager);
    /**
     * Register a new doctor in the system
     * Requirements: 2.1, 2.2, 2.3
     *
     * @param data - Doctor data without id and createdAt
     * @returns The newly created doctor with assigned ID
     * @throws Error if required fields are missing or validation fails
     */
    registerDoctor(data: Omit<Doctor, 'id' | 'createdAt'>): Promise<Doctor>;
    /**
     * Retrieve a doctor by their ID
     * Requirements: 2.4
     *
     * @param id - The doctor ID to search for
     * @returns The doctor if found, null otherwise
     */
    getDoctor(id: string): Promise<Doctor | null>;
    /**
     * Update an existing doctor's information
     * Requirements: 2.5
     *
     * @param id - The doctor ID to update
     * @param data - Partial doctor data to update
     * @returns The updated doctor
     * @throws Error if doctor not found
     */
    updateDoctor(id: string, data: Partial<Omit<Doctor, 'id' | 'createdAt'>>): Promise<Doctor>;
    /**
     * Retrieve all doctors in the system
     * Requirements: 2.4
     *
     * @returns Array of all doctors
     */
    getAllDoctors(): Promise<Doctor[]>;
    /**
     * Delete a doctor from the system
     *
     * @param id - The doctor ID to delete
     * @throws Error if doctor not found
     */
    deleteDoctor(id: string): Promise<void>;
    /**
     * Validate that all required fields are present
     * Requirements: 2.2
     *
     * @param data - Doctor data to validate
     * @throws Error if required fields are missing
     */
    private validateRequiredFields;
}
//# sourceMappingURL=DoctorService.d.ts.map