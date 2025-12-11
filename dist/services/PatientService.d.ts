import { Patient } from '../models/Patient';
import { StorageManager } from '../storage/StorageManager';
/**
 * PatientService handles all patient-related operations
 * Requirements: 1.1, 1.2, 1.3, 1.4, 1.5, 5.1, 5.2, 5.3, 5.4, 5.5
 */
export declare class PatientService {
    private storage;
    private readonly COLLECTION;
    constructor(storage: StorageManager);
    /**
     * Register a new patient in the system
     * Requirements: 1.1, 1.2, 1.3, 1.4, 1.5
     *
     * @param data - Patient data without id and createdAt
     * @returns The newly created patient with assigned ID
     * @throws Error if required fields are missing or validation fails
     */
    registerPatient(data: Omit<Patient, 'id' | 'createdAt'>): Promise<Patient>;
    /**
     * Retrieve a patient by their ID
     * Requirements: 5.1, 5.4
     *
     * @param id - The patient ID to search for
     * @returns The patient if found, null otherwise
     */
    getPatient(id: string): Promise<Patient | null>;
    /**
     * Search for patients by name
     * Requirements: 5.2, 5.3, 5.5
     *
     * @param name - The name or partial name to search for
     * @returns Array of all patients whose names match the search criteria
     */
    searchPatientsByName(name: string): Promise<Patient[]>;
    /**
     * Update an existing patient's information
     * Requirements: 1.3 (persistence)
     *
     * @param id - The patient ID to update
     * @param data - Partial patient data to update
     * @returns The updated patient
     * @throws Error if patient not found
     */
    updatePatient(id: string, data: Partial<Omit<Patient, 'id' | 'createdAt'>>): Promise<Patient>;
    /**
     * Validate and sanitize patient data
     * Requirements: 1.2, 1.4, 7.4, 8.2
     *
     * @param data - Patient data to validate and sanitize
     * @returns Sanitized patient data
     * @throws ValidationError if required fields are missing or invalid
     */
    private validateAndSanitizePatientData;
    /**
     * Delete a patient from the system
     *
     * @param id - The patient ID to delete
     * @throws Error if patient not found
     */
    deletePatient(id: string): Promise<void>;
    /**
     * Sanitize partial patient data for updates
     * Requirements: 7.4, 8.2
     *
     * @param data - Partial patient data to sanitize
     * @returns Sanitized partial patient data
     */
    private sanitizePartialPatientData;
}
//# sourceMappingURL=PatientService.d.ts.map