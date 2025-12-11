import { MedicalRecord } from '../models/MedicalRecord';
import { StorageManager } from '../storage/StorageManager';
/**
 * MedicalRecordService handles all medical record operations
 * Requirements: 4.1, 4.2, 4.3, 4.4, 4.5
 */
export declare class MedicalRecordService {
    private storage;
    private readonly COLLECTION;
    constructor(storage: StorageManager);
    /**
     * Create a new medical record
     * Requirements: 4.1, 4.2, 4.3, 4.5
     *
     * @param data - Medical record data without id and createdAt
     * @returns The newly created medical record with assigned ID
     * @throws Error if required fields are missing or patient doesn't exist
     */
    createRecord(data: Omit<MedicalRecord, 'id' | 'createdAt'>): Promise<MedicalRecord>;
    /**
     * Retrieve a medical record by its ID
     * Requirements: 4.3
     *
     * @param id - The medical record ID to search for
     * @returns The medical record if found, null otherwise
     */
    getRecord(id: string): Promise<MedicalRecord | null>;
    /**
     * Retrieve all medical records for a specific patient
     * Requirements: 4.4
     *
     * @param patientId - The patient ID to get records for
     * @returns Array of all medical records associated with the patient
     */
    getPatientRecords(patientId: string): Promise<MedicalRecord[]>;
    /**
     * Delete a medical record from the system
     *
     * @param id - The medical record ID to delete
     * @throws Error if medical record not found
     */
    deleteRecord(id: string): Promise<void>;
    /**
     * Validate medical record data
     * Requirements: 4.1, 4.2
     *
     * @param data - Medical record data to validate
     * @throws Error if required fields are missing or patient doesn't exist
     */
    private validateRecordData;
}
//# sourceMappingURL=MedicalRecordService.d.ts.map