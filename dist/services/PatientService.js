"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PatientService = void 0;
const utils_1 = require("../utils");
/**
 * PatientService handles all patient-related operations
 * Requirements: 1.1, 1.2, 1.3, 1.4, 1.5, 5.1, 5.2, 5.3, 5.4, 5.5
 */
class PatientService {
    constructor(storage) {
        this.COLLECTION = 'patients';
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
    async registerPatient(data) {
        return utils_1.ErrorHandler.wrapAsync('patient-register', async () => {
            utils_1.logger.info('patient-register', 'Starting patient registration', { patientName: data.name });
            // Validate and sanitize input data (Requirements 1.2, 1.4)
            const sanitizedData = this.validateAndSanitizePatientData(data);
            // Generate unique patient ID (Requirement 1.1)
            const id = (0, utils_1.generateId)('patient');
            // Create patient object with ID and timestamp
            const patient = {
                ...sanitizedData,
                id,
                createdAt: new Date().toISOString(),
            };
            // Persist to storage (Requirement 1.3)
            await this.storage.save(this.COLLECTION, id, patient);
            utils_1.logger.info('patient-register', 'Patient registered successfully', { patientId: id, patientName: patient.name });
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
    async getPatient(id) {
        return utils_1.ErrorHandler.wrapAsync('patient-get', async () => {
            // Validate ID format
            if (!utils_1.InputValidator.isNonEmptyString(id)) {
                throw new utils_1.AppError(utils_1.ErrorCode.INVALID_FORMAT, 'Patient ID must be a non-empty string');
            }
            const sanitizedId = utils_1.InputValidator.sanitizeString(id);
            utils_1.logger.debug('patient-get', 'Retrieving patient', { patientId: sanitizedId });
            const patient = await this.storage.load(this.COLLECTION, sanitizedId);
            if (patient) {
                utils_1.logger.debug('patient-get', 'Patient found', { patientId: sanitizedId });
            }
            else {
                utils_1.logger.debug('patient-get', 'Patient not found', { patientId: sanitizedId });
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
    async searchPatientsByName(name) {
        return utils_1.ErrorHandler.wrapAsync('patient-search-by-name', async () => {
            // If name is empty, return empty array (Requirement 5.3)
            if (!utils_1.InputValidator.isNonEmptyString(name)) {
                utils_1.logger.debug('patient-search-by-name', 'Empty search term provided');
                return [];
            }
            const sanitizedName = utils_1.InputValidator.sanitizeString(name);
            utils_1.logger.info('patient-search-by-name', 'Searching patients by name', { searchTerm: sanitizedName });
            const allPatients = await this.storage.loadAll(this.COLLECTION);
            // Filter patients whose names contain the search term (case-insensitive)
            // Requirements: 5.2, 5.5 - return all matching records
            const searchTerm = sanitizedName.toLowerCase();
            const matchingPatients = allPatients.filter(patient => patient.name.toLowerCase().includes(searchTerm));
            utils_1.logger.info('patient-search-by-name', 'Search completed', {
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
    async updatePatient(id, data) {
        return utils_1.ErrorHandler.wrapAsync('patient-update', async () => {
            // Validate ID format
            if (!utils_1.InputValidator.isNonEmptyString(id)) {
                throw new utils_1.AppError(utils_1.ErrorCode.INVALID_FORMAT, 'Patient ID must be a non-empty string');
            }
            const sanitizedId = utils_1.InputValidator.sanitizeString(id);
            utils_1.logger.info('patient-update', 'Starting patient update', { patientId: sanitizedId });
            // Load existing patient
            const existingPatient = await this.getPatient(sanitizedId);
            if (!existingPatient) {
                throw new utils_1.EntityNotFoundError('Patient', sanitizedId);
            }
            // Sanitize update data
            const sanitizedData = this.sanitizePartialPatientData(data);
            // Merge updates with existing data
            const updatedPatient = {
                ...existingPatient,
                ...sanitizedData,
                id: existingPatient.id, // Preserve original ID
                createdAt: existingPatient.createdAt, // Preserve original timestamp
            };
            // Validate required fields are still present after update
            this.validateAndSanitizePatientData(updatedPatient);
            // Persist updated patient (Requirement 1.3)
            await this.storage.save(this.COLLECTION, sanitizedId, updatedPatient);
            utils_1.logger.info('patient-update', 'Patient updated successfully', { patientId: sanitizedId });
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
    validateAndSanitizePatientData(data) {
        const requiredFields = ['name', 'dateOfBirth', 'contactNumber', 'address'];
        // Check for required fields
        utils_1.ErrorHandler.validateRequiredFields('Patient', data, requiredFields);
        // Sanitize and validate individual fields
        const sanitizedData = { ...data };
        // Validate and sanitize name
        if (!utils_1.InputValidator.isNonEmptyString(data.name)) {
            throw new utils_1.AppError(utils_1.ErrorCode.INVALID_FORMAT, 'Patient name must be a non-empty string');
        }
        sanitizedData.name = utils_1.InputValidator.sanitizeString(data.name);
        // Validate and sanitize date of birth
        if (!utils_1.InputValidator.isValidDate(data.dateOfBirth)) {
            throw new utils_1.AppError(utils_1.ErrorCode.INVALID_FORMAT, 'Date of birth must be in valid date format (YYYY-MM-DD)');
        }
        sanitizedData.dateOfBirth = utils_1.InputValidator.sanitizeString(data.dateOfBirth);
        // Validate and sanitize contact number
        if (!utils_1.InputValidator.isValidPhoneNumber(data.contactNumber)) {
            throw new utils_1.AppError(utils_1.ErrorCode.INVALID_FORMAT, 'Contact number must be a valid phone number');
        }
        sanitizedData.contactNumber = utils_1.InputValidator.sanitizeString(data.contactNumber);
        // Validate and sanitize address
        if (!utils_1.InputValidator.isNonEmptyString(data.address)) {
            throw new utils_1.AppError(utils_1.ErrorCode.INVALID_FORMAT, 'Address must be a non-empty string');
        }
        sanitizedData.address = utils_1.InputValidator.sanitizeString(data.address);
        // Validate and sanitize optional email
        if (data.email) {
            if (!utils_1.InputValidator.isValidEmail(data.email)) {
                throw new utils_1.AppError(utils_1.ErrorCode.INVALID_FORMAT, 'Email must be in valid email format');
            }
            sanitizedData.email = utils_1.InputValidator.sanitizeString(data.email);
        }
        utils_1.logger.debug('patient-validate', 'Patient data validation successful');
        return sanitizedData;
    }
    /**
     * Delete a patient from the system
     *
     * @param id - The patient ID to delete
     * @throws Error if patient not found
     */
    async deletePatient(id) {
        return utils_1.ErrorHandler.wrapAsync('patient-delete', async () => {
            // Validate ID format
            if (!utils_1.InputValidator.isNonEmptyString(id)) {
                throw new utils_1.AppError(utils_1.ErrorCode.INVALID_FORMAT, 'Patient ID must be a non-empty string');
            }
            const sanitizedId = utils_1.InputValidator.sanitizeString(id);
            utils_1.logger.info('patient-delete', 'Starting patient deletion', { patientId: sanitizedId });
            // Check if patient exists
            const existingPatient = await this.getPatient(sanitizedId);
            if (!existingPatient) {
                throw new utils_1.EntityNotFoundError('Patient', sanitizedId);
            }
            // Delete from storage
            await this.storage.delete(this.COLLECTION, sanitizedId);
            utils_1.logger.info('patient-delete', 'Patient deleted successfully', { patientId: sanitizedId });
        });
    }
    /**
     * Sanitize partial patient data for updates
     * Requirements: 7.4, 8.2
     *
     * @param data - Partial patient data to sanitize
     * @returns Sanitized partial patient data
     */
    sanitizePartialPatientData(data) {
        const sanitizedData = {};
        if (data.name !== undefined) {
            if (!utils_1.InputValidator.isNonEmptyString(data.name)) {
                throw new utils_1.AppError(utils_1.ErrorCode.INVALID_FORMAT, 'Patient name must be a non-empty string');
            }
            sanitizedData.name = utils_1.InputValidator.sanitizeString(data.name);
        }
        if (data.dateOfBirth !== undefined) {
            if (!utils_1.InputValidator.isValidDate(data.dateOfBirth)) {
                throw new utils_1.AppError(utils_1.ErrorCode.INVALID_FORMAT, 'Date of birth must be in valid date format (YYYY-MM-DD)');
            }
            sanitizedData.dateOfBirth = utils_1.InputValidator.sanitizeString(data.dateOfBirth);
        }
        if (data.contactNumber !== undefined) {
            if (!utils_1.InputValidator.isValidPhoneNumber(data.contactNumber)) {
                throw new utils_1.AppError(utils_1.ErrorCode.INVALID_FORMAT, 'Contact number must be a valid phone number');
            }
            sanitizedData.contactNumber = utils_1.InputValidator.sanitizeString(data.contactNumber);
        }
        if (data.address !== undefined) {
            if (!utils_1.InputValidator.isNonEmptyString(data.address)) {
                throw new utils_1.AppError(utils_1.ErrorCode.INVALID_FORMAT, 'Address must be a non-empty string');
            }
            sanitizedData.address = utils_1.InputValidator.sanitizeString(data.address);
        }
        if (data.email !== undefined) {
            if (data.email && !utils_1.InputValidator.isValidEmail(data.email)) {
                throw new utils_1.AppError(utils_1.ErrorCode.INVALID_FORMAT, 'Email must be in valid email format');
            }
            sanitizedData.email = data.email ? utils_1.InputValidator.sanitizeString(data.email) : undefined;
        }
        return sanitizedData;
    }
}
exports.PatientService = PatientService;
//# sourceMappingURL=PatientService.js.map