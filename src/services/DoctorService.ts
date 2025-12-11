import { Doctor } from '../models/Doctor';
import { StorageManager } from '../storage/StorageManager';
import { generateId } from '../utils/idGenerator';

/**
 * DoctorService handles all doctor-related operations
 * Requirements: 2.1, 2.2, 2.3, 2.4, 2.5
 */
export class DoctorService {
  private storage: StorageManager;
  private readonly COLLECTION = 'doctors';

  constructor(storage: StorageManager) {
    this.storage = storage;
  }

  /**
   * Register a new doctor in the system
   * Requirements: 2.1, 2.2, 2.3
   * 
   * @param data - Doctor data without id and createdAt
   * @returns The newly created doctor with assigned ID
   * @throws Error if required fields are missing or validation fails
   */
  async registerDoctor(data: Omit<Doctor, 'id' | 'createdAt'>): Promise<Doctor> {
    // Validate required fields (Requirement 2.2)
    this.validateRequiredFields(data);

    // Generate unique doctor ID (Requirement 2.1)
    const id = generateId('doctor');
    
    // Create doctor object with ID and timestamp
    const doctor: Doctor = {
      ...data,
      id,
      createdAt: new Date().toISOString(),
    };

    // Persist to storage (Requirement 2.3)
    await this.storage.save(this.COLLECTION, id, doctor);

    return doctor;
  }

  /**
   * Retrieve a doctor by their ID
   * Requirements: 2.4
   * 
   * @param id - The doctor ID to search for
   * @returns The doctor if found, null otherwise
   */
  async getDoctor(id: string): Promise<Doctor | null> {
    return await this.storage.load<Doctor>(this.COLLECTION, id);
  }

  /**
   * Update an existing doctor's information
   * Requirements: 2.5
   * 
   * @param id - The doctor ID to update
   * @param data - Partial doctor data to update
   * @returns The updated doctor
   * @throws Error if doctor not found
   */
  async updateDoctor(id: string, data: Partial<Omit<Doctor, 'id' | 'createdAt'>>): Promise<Doctor> {
    // Load existing doctor
    const existingDoctor = await this.getDoctor(id);
    
    if (!existingDoctor) {
      throw new Error(`Doctor with ID ${id} not found`);
    }

    // Merge updates with existing data
    const updatedDoctor: Doctor = {
      ...existingDoctor,
      ...data,
      id: existingDoctor.id, // Preserve original ID
      createdAt: existingDoctor.createdAt, // Preserve original timestamp
    };

    // Validate required fields are still present after update
    this.validateRequiredFields(updatedDoctor);

    // Persist updated doctor (Requirement 2.5)
    await this.storage.save(this.COLLECTION, id, updatedDoctor);

    return updatedDoctor;
  }

  /**
   * Retrieve all doctors in the system
   * Requirements: 2.4
   * 
   * @returns Array of all doctors
   */
  async getAllDoctors(): Promise<Doctor[]> {
    return await this.storage.loadAll<Doctor>(this.COLLECTION);
  }

  /**
   * Delete a doctor from the system
   * 
   * @param id - The doctor ID to delete
   * @throws Error if doctor not found
   */
  async deleteDoctor(id: string): Promise<void> {
    // Check if doctor exists
    const existingDoctor = await this.getDoctor(id);
    
    if (!existingDoctor) {
      throw new Error(`Doctor with ID ${id} not found`);
    }

    // Delete from storage
    await this.storage.delete(this.COLLECTION, id);
  }

  /**
   * Validate that all required fields are present
   * Requirements: 2.2
   * 
   * @param data - Doctor data to validate
   * @throws Error if required fields are missing
   */
  private validateRequiredFields(data: Omit<Doctor, 'id' | 'createdAt'>): void {
    const requiredFields: (keyof Omit<Doctor, 'id' | 'createdAt' | 'email'>)[] = [
      'name',
      'specialization',
      'contactNumber',
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
        `Doctor registration requires: name, specialization, and contactNumber.`
      );
    }
  }
}
