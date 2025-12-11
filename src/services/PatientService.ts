import { Patient } from '../models/Patient';
import { StorageManager } from '../storage/StorageManager';
import { 
  generateId, 
  logger, 
  ErrorHandler, 
  InputValidator, 
  ValidationError,
  EntityNotFoundError,
  AppError,
  ErrorCode 
} from '../utils';

/**
 * PatientService handles all patient-related operations
 * Requirements: 1.1, 1.2, 1.3, 1.4, 1.5, 5.1, 5.2, 5.3, 5.4, 5.5
 */
export class PatientService {
  private storage: StorageManager;
  private readonly COLLECTION = 'patients';

  constructor(storage: StorageManager) {
    this.storage = storage;
  }

  /**
   * Register a new patient in the system
   * Requirements: 1.1, 1.2, 1.3, 1.4, 1.5
   * 
   * @param data - Patient data without id and createdAt
   * @returns The newly created patient with assigned ID
   * @throws Error if required fields are missing or validation fails
   */
  async registerPatient(data: Omit<Patient, 'id' | 'createdAt'>): Promise<Patient> {
    return ErrorHandler.wrapAsync('patient-register', async () => {
      logger.info('patient-register', 'Starting patient registration', { patientName: data.name });
      
      // Validate and sanitize input data (Requirements 1.2, 1.4)
      const sanitizedData = this.validateAndSanitizePatientData(data);

      // Generate unique patient ID (Requirement 1.1)
      const id = generateId('patient');
      
      // Create patient object with ID and timestamp
      const patient: Patient = {
        ...sanitizedData,
        id,
        createdAt: new Date().toISOString(),
      };

      // Persist to storage (Requirement 1.3)
      await this.storage.save(this.COLLECTION, id, patient);

      logger.info('patient-register', 'Patient registered successfully', { patientId: id, patientName: patient.name });
      
      // Return the assigned Patient ID (Requirement 1.5)
      return patient;
    });
  }

  /**
   * Retrieve a patient by their ID
   * Requirements: 5.1, 5.4
   * 
   * @param id - The patient ID to search for
   * @returns The patient if found, null otherwise
   */
  async getPatient(id: string): Promise<Patient | null> {
    return ErrorHandler.wrapAsync('patient-get', async () => {
      // Validate ID format
      if (!InputValidator.isNonEmptyString(id)) {
        throw new AppError(ErrorCode.INVALID_FORMAT, 'Patient ID must be a non-empty string');
      }

      const sanitizedId = InputValidator.sanitizeString(id);
      logger.debug('patient-get', 'Retrieving patient', { patientId: sanitizedId });
      
      const patient = await this.storage.load<Patient>(this.COLLECTION, sanitizedId);
      
      if (patient) {
        logger.debug('patient-get', 'Patient found', { patientId: sanitizedId });
      } else {
        logger.debug('patient-get', 'Patient not found', { patientId: sanitizedId });
      }
      
      return patient;
    });
  }

  /**
   * Search for patients by name
   * Requirements: 5.2, 5.3, 5.5
   * 
   * @param name - The name or partial name to search for
   * @returns Array of all patients whose names match the search criteria
   */
  async searchPatientsByName(name: string): Promise<Patient[]> {
    return ErrorHandler.wrapAsync('patient-search-by-name', async () => {
      // If name is empty, return empty array (Requirement 5.3)
      if (!InputValidator.isNonEmptyString(name)) {
        logger.debug('patient-search-by-name', 'Empty search term provided');
        return [];
      }

      const sanitizedName = InputValidator.sanitizeString(name);
      logger.info('patient-search-by-name', 'Searching patients by name', { searchTerm: sanitizedName });
      
      const allPatients = await this.storage.loadAll<Patient>(this.COLLECTION);
      
      // Filter patients whose names contain the search term (case-insensitive)
      // Requirements: 5.2, 5.5 - return all matching records
      const searchTerm = sanitizedName.toLowerCase();
      const matchingPatients = allPatients.filter(patient => 
        patient.name.toLowerCase().includes(searchTerm)
      );
      
      logger.info('patient-search-by-name', 'Search completed', { 
        searchTerm: sanitizedName, 
        totalPatients: allPatients.length,
        matchingPatients: matchingPatients.length 
      });
      
      return matchingPatients;
    });
  }

  /**
   * Update an existing patient's information
   * Requirements: 1.3 (persistence)
   * 
   * @param id - The patient ID to update
   * @param data - Partial patient data to update
   * @returns The updated patient
   * @throws Error if patient not found
   */
  async updatePatient(id: string, data: Partial<Omit<Patient, 'id' | 'createdAt'>>): Promise<Patient> {
    return ErrorHandler.wrapAsync('patient-update', async () => {
      // Validate ID format
      if (!InputValidator.isNonEmptyString(id)) {
        throw new AppError(ErrorCode.INVALID_FORMAT, 'Patient ID must be a non-empty string');
      }

      const sanitizedId = InputValidator.sanitizeString(id);
      logger.info('patient-update', 'Starting patient update', { patientId: sanitizedId });
      
      // Load existing patient
      const existingPatient = await this.getPatient(sanitizedId);
      
      if (!existingPatient) {
        throw new EntityNotFoundError('Patient', sanitizedId);
      }

      // Sanitize update data
      const sanitizedData = this.sanitizePartialPatientData(data);

      // Merge updates with existing data
      const updatedPatient: Patient = {
        ...existingPatient,
        ...sanitizedData,
        id: existingPatient.id, // Preserve original ID
        createdAt: existingPatient.createdAt, // Preserve original timestamp
      };

      // Validate required fields are still present after update
      this.validateAndSanitizePatientData(updatedPatient);

      // Persist updated patient (Requirement 1.3)
      await this.storage.save(this.COLLECTION, sanitizedId, updatedPatient);

      logger.info('patient-update', 'Patient updated successfully', { patientId: sanitizedId });
      
      return updatedPatient;
    });
  }

  /**
   * Validate and sanitize patient data
   * Requirements: 1.2, 1.4, 7.4, 8.2
   * 
   * @param data - Patient data to validate and sanitize
   * @returns Sanitized patient data
   * @throws ValidationError if required fields are missing or invalid
   */
  private validateAndSanitizePatientData(data: Omit<Patient, 'id' | 'createdAt'>): Omit<Patient, 'id' | 'createdAt'> {
    const requiredFields = ['name', 'dateOfBirth', 'contactNumber', 'address'];
    
    // Check for required fields
    ErrorHandler.validateRequiredFields('Patient', data, requiredFields);

    // Sanitize and validate individual fields
    const sanitizedData = { ...data };

    // Validate and sanitize name
    if (!InputValidator.isNonEmptyString(data.name)) {
      throw new AppError(ErrorCode.INVALID_FORMAT, 'Patient name must be a non-empty string');
    }
    sanitizedData.name = InputValidator.sanitizeString(data.name);

    // Validate and sanitize date of birth
    if (!InputValidator.isValidDate(data.dateOfBirth)) {
      throw new AppError(ErrorCode.INVALID_FORMAT, 'Date of birth must be in valid date format (YYYY-MM-DD)');
    }
    sanitizedData.dateOfBirth = InputValidator.sanitizeString(data.dateOfBirth);

    // Validate and sanitize contact number
    if (!InputValidator.isValidPhoneNumber(data.contactNumber)) {
      throw new AppError(ErrorCode.INVALID_FORMAT, 'Contact number must be a valid phone number');
    }
    sanitizedData.contactNumber = InputValidator.sanitizeString(data.contactNumber);

    // Validate and sanitize address
    if (!InputValidator.isNonEmptyString(data.address)) {
      throw new AppError(ErrorCode.INVALID_FORMAT, 'Address must be a non-empty string');
    }
    sanitizedData.address = InputValidator.sanitizeString(data.address);

    // Validate and sanitize optional email
    if (data.email) {
      if (!InputValidator.isValidEmail(data.email)) {
        throw new AppError(ErrorCode.INVALID_FORMAT, 'Email must be in valid email format');
      }
      sanitizedData.email = InputValidator.sanitizeString(data.email);
    }

    logger.debug('patient-validate', 'Patient data validation successful');
    return sanitizedData;
  }

  /**
   * Delete a patient from the system
   * 
   * @param id - The patient ID to delete
   * @throws Error if patient not found
   */
  async deletePatient(id: string): Promise<void> {
    return ErrorHandler.wrapAsync('patient-delete', async () => {
      // Validate ID format
      if (!InputValidator.isNonEmptyString(id)) {
        throw new AppError(ErrorCode.INVALID_FORMAT, 'Patient ID must be a non-empty string');
      }

      const sanitizedId = InputValidator.sanitizeString(id);
      logger.info('patient-delete', 'Starting patient deletion', { patientId: sanitizedId });
      
      // Check if patient exists
      const existingPatient = await this.getPatient(sanitizedId);
      
      if (!existingPatient) {
        throw new EntityNotFoundError('Patient', sanitizedId);
      }

      // Delete from storage
      await this.storage.delete(this.COLLECTION, sanitizedId);

      logger.info('patient-delete', 'Patient deleted successfully', { patientId: sanitizedId });
    });
  }

  /**
   * Sanitize partial patient data for updates
   * Requirements: 7.4, 8.2
   * 
   * @param data - Partial patient data to sanitize
   * @returns Sanitized partial patient data
   */
  private sanitizePartialPatientData(data: Partial<Omit<Patient, 'id' | 'createdAt'>>): Partial<Omit<Patient, 'id' | 'createdAt'>> {
    const sanitizedData: Partial<Omit<Patient, 'id' | 'createdAt'>> = {};

    if (data.name !== undefined) {
      if (!InputValidator.isNonEmptyString(data.name)) {
        throw new AppError(ErrorCode.INVALID_FORMAT, 'Patient name must be a non-empty string');
      }
      sanitizedData.name = InputValidator.sanitizeString(data.name);
    }

    if (data.dateOfBirth !== undefined) {
      if (!InputValidator.isValidDate(data.dateOfBirth)) {
        throw new AppError(ErrorCode.INVALID_FORMAT, 'Date of birth must be in valid date format (YYYY-MM-DD)');
      }
      sanitizedData.dateOfBirth = InputValidator.sanitizeString(data.dateOfBirth);
    }

    if (data.contactNumber !== undefined) {
      if (!InputValidator.isValidPhoneNumber(data.contactNumber)) {
        throw new AppError(ErrorCode.INVALID_FORMAT, 'Contact number must be a valid phone number');
      }
      sanitizedData.contactNumber = InputValidator.sanitizeString(data.contactNumber);
    }

    if (data.address !== undefined) {
      if (!InputValidator.isNonEmptyString(data.address)) {
        throw new AppError(ErrorCode.INVALID_FORMAT, 'Address must be a non-empty string');
      }
      sanitizedData.address = InputValidator.sanitizeString(data.address);
    }

    if (data.email !== undefined) {
      if (data.email && !InputValidator.isValidEmail(data.email)) {
        throw new AppError(ErrorCode.INVALID_FORMAT, 'Email must be in valid email format');
      }
      sanitizedData.email = data.email ? InputValidator.sanitizeString(data.email) : undefined;
    }

    return sanitizedData;
  }
}
