import { MedicalRecord } from '../models/MedicalRecord';
import { StorageManager } from '../storage/StorageManager';
import { generateId } from '../utils/idGenerator';

/**
 * MedicalRecordService handles all medical record operations
 * Requirements: 4.1, 4.2, 4.3, 4.4, 4.5
 */
export class MedicalRecordService {
  private storage: StorageManager;
  private readonly COLLECTION = 'medical-records';

  constructor(storage: StorageManager) {
    this.storage = storage;
  }

  /**
   * Create a new medical record
   * Requirements: 4.1, 4.2, 4.3, 4.5
   * 
   * @param data - Medical record data without id and createdAt
   * @returns The newly created medical record with assigned ID
   * @throws Error if required fields are missing or patient doesn't exist
   */
  async createRecord(data: Omit<MedicalRecord, 'id' | 'createdAt'>): Promise<MedicalRecord> {
    // Validate required fields and referential integrity (Requirements 4.1, 4.2)
    await this.validateRecordData(data);

    // Generate unique medical record ID (Requirement 4.1)
    const id = generateId('medical-record');
    
    // Create medical record object with ID and automatic timestamp (Requirements 4.1, 4.5)
    const medicalRecord: MedicalRecord = {
      ...data,
      id,
      createdAt: new Date().toISOString(),
    };

    // Persist to storage (Requirement 4.3)
    await this.storage.save(this.COLLECTION, id, medicalRecord);

    return medicalRecord;
  }

  /**
   * Retrieve a medical record by its ID
   * Requirements: 4.3
   * 
   * @param id - The medical record ID to search for
   * @returns The medical record if found, null otherwise
   */
  async getRecord(id: string): Promise<MedicalRecord | null> {
    return await this.storage.load<MedicalRecord>(this.COLLECTION, id);
  }

  /**
   * Retrieve all medical records for a specific patient
   * Requirements: 4.4
   * 
   * @param patientId - The patient ID to get records for
   * @returns Array of all medical records associated with the patient
   */
  async getPatientRecords(patientId: string): Promise<MedicalRecord[]> {
    const allRecords = await this.storage.loadAll<MedicalRecord>(this.COLLECTION);
    
    // Filter records by patient ID (Requirement 4.4)
    return allRecords.filter(record => record.patientId === patientId);
  }

  /**
   * Delete a medical record from the system
   * 
   * @param id - The medical record ID to delete
   * @throws Error if medical record not found
   */
  async deleteRecord(id: string): Promise<void> {
    // Check if record exists
    const existingRecord = await this.getRecord(id);
    
    if (!existingRecord) {
      throw new Error(`Medical record with ID ${id} not found`);
    }

    // Delete from storage
    await this.storage.delete(this.COLLECTION, id);
  }

  /**
   * Validate medical record data
   * Requirements: 4.1, 4.2
   * 
   * @param data - Medical record data to validate
   * @throws Error if required fields are missing or patient doesn't exist
   */
  private async validateRecordData(data: Omit<MedicalRecord, 'id' | 'createdAt'>): Promise<void> {
    // Check required fields (Requirement 4.1)
    const requiredFields: (keyof Omit<MedicalRecord, 'id' | 'createdAt'>)[] = [
      'patientId',
      'doctorId',
      'diagnosis',
      'treatment',
      'notes',
    ];

    const missingFields: string[] = [];

    for (const field of requiredFields) {
      if (!data[field] || (typeof data[field] === 'string' && data[field].trim() === '')) {
        missingFields.push(field);
      }
    }

    if (missingFields.length > 0) {
      throw new Error(
        `Missing required fields: ${missingFields.join(', ')}. ` +
        `Medical record creation requires: patientId, doctorId, diagnosis, treatment, and notes.`
      );
    }

    // Validate referential integrity - patient must exist (Requirement 4.2)
    const patientExists = await this.storage.exists('patients', data.patientId);
    if (!patientExists) {
      throw new Error(`Patient with ID ${data.patientId} does not exist`);
    }

    // Validate referential integrity - doctor must exist (Requirement 4.2)
    const doctorExists = await this.storage.exists('doctors', data.doctorId);
    if (!doctorExists) {
      throw new Error(`Doctor with ID ${data.doctorId} does not exist`);
    }
  }
}