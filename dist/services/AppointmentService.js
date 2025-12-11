"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppointmentService = void 0;
const idGenerator_1 = require("../utils/idGenerator");
/**
 * AppointmentService handles all appointment-related operations
 * Requirements: 3.1, 3.2, 3.3, 3.4, 3.5, 6.1, 6.2, 6.3, 6.4, 6.5
 */
class AppointmentService {
    constructor(storage, patientService, doctorService) {
        this.COLLECTION = 'appointments';
        this.storage = storage;
        this.patientService = patientService;
        this.doctorService = doctorService;
    }
    /**
     * Schedule a new appointment in the system
     * Requirements: 3.1, 3.2, 3.3, 3.4, 3.5
     *
     * @param data - Appointment data without id and createdAt
     * @returns The newly created appointment with assigned ID
     * @throws Error if required fields are missing, validation fails, or referential integrity is violated
     */
    async scheduleAppointment(data) {
        // Validate required fields
        this.validateRequiredFields(data);
        // Validate referential integrity (Requirements 3.2, 3.4)
        await this.validateReferentialIntegrity(data.patientId, data.doctorId);
        // Generate unique appointment ID (Requirement 3.1)
        const id = (0, idGenerator_1.generateId)('appointment');
        // Create appointment object with ID and timestamp
        const appointment = {
            ...data,
            id,
            createdAt: new Date().toISOString(),
        };
        // Persist to storage (Requirement 3.3)
        await this.storage.save(this.COLLECTION, id, appointment);
        return appointment;
    }
    /**
     * Retrieve an appointment by its ID
     * Requirements: 6.5
     *
     * @param id - The appointment ID to search for
     * @returns The appointment if found, null otherwise
     */
    async getAppointment(id) {
        return await this.storage.load(this.COLLECTION, id);
    }
    /**
     * Retrieve all appointments for a specific patient
     * Requirements: 6.2, 6.5
     *
     * @param patientId - The patient ID to search appointments for
     * @returns Array of all appointments associated with the patient ID
     */
    async getAppointmentsByPatient(patientId) {
        const allAppointments = await this.storage.loadAll(this.COLLECTION);
        // Filter appointments by patient ID (Requirement 6.2)
        return allAppointments.filter(appointment => appointment.patientId === patientId);
    }
    /**
     * Retrieve all appointments for a specific doctor
     * Requirements: 6.1, 6.5
     *
     * @param doctorId - The doctor ID to search appointments for
     * @returns Array of all appointments associated with the doctor ID
     */
    async getAppointmentsByDoctor(doctorId) {
        const allAppointments = await this.storage.loadAll(this.COLLECTION);
        // Filter appointments by doctor ID (Requirement 6.1)
        return allAppointments.filter(appointment => appointment.doctorId === doctorId);
    }
    /**
     * Update the status of an existing appointment
     * Requirements: 6.3, 6.4, 3.5
     *
     * @param id - The appointment ID to update
     * @param status - The new status to set
     * @returns The updated appointment
     * @throws Error if appointment not found
     */
    async updateAppointmentStatus(id, status) {
        // Load existing appointment
        const existingAppointment = await this.getAppointment(id);
        if (!existingAppointment) {
            throw new Error(`Appointment with ID ${id} not found`);
        }
        // Update the status
        const updatedAppointment = {
            ...existingAppointment,
            status,
        };
        // Persist updated appointment (Requirements 6.3, 3.5)
        await this.storage.save(this.COLLECTION, id, updatedAppointment);
        return updatedAppointment;
    }
    /**
     * Cancel an appointment by setting its status to cancelled
     * Requirements: 6.4
     *
     * @param id - The appointment ID to cancel
     * @returns The cancelled appointment
     * @throws Error if appointment not found
     */
    async cancelAppointment(id) {
        // Use updateAppointmentStatus to set status to cancelled (Requirement 6.4)
        return await this.updateAppointmentStatus(id, 'cancelled');
    }
    /**
     * Request postponement of an appointment by doctor
     *
     * @param id - The appointment ID to postpone
     * @param newDateTime - The new proposed date and time
     * @param reason - The reason for postponement
     * @returns The updated appointment with postponement request
     * @throws Error if appointment not found or invalid status
     */
    async requestPostponement(id, newDateTime, reason) {
        const existingAppointment = await this.getAppointment(id);
        if (!existingAppointment) {
            throw new Error(`Appointment with ID ${id} not found`);
        }
        // Only allow postponement for scheduled or confirmed appointments
        if (!['scheduled', 'confirmed'].includes(existingAppointment.status)) {
            throw new Error(`Cannot postpone appointment with status: ${existingAppointment.status}`);
        }
        const updatedAppointment = {
            ...existingAppointment,
            status: 'postpone_requested',
            postponement: {
                newDateTime,
                reason,
                requestedBy: 'doctor',
                requestedAt: new Date().toISOString()
            }
        };
        await this.storage.save(this.COLLECTION, id, updatedAppointment);
        return updatedAppointment;
    }
    /**
     * Accept postponement request by patient
     *
     * @param id - The appointment ID to accept postponement for
     * @returns The updated appointment with new date/time
     * @throws Error if appointment not found or no postponement request
     */
    async acceptPostponement(id) {
        const existingAppointment = await this.getAppointment(id);
        if (!existingAppointment) {
            throw new Error(`Appointment with ID ${id} not found`);
        }
        if (existingAppointment.status !== 'postpone_requested' || !existingAppointment.postponement) {
            throw new Error(`No postponement request found for appointment ${id}`);
        }
        const updatedAppointment = {
            ...existingAppointment,
            dateTime: existingAppointment.postponement.newDateTime,
            status: 'confirmed',
            notes: existingAppointment.notes ?
                `${existingAppointment.notes}\n\nPostponed: ${existingAppointment.postponement.reason}` :
                `Postponed: ${existingAppointment.postponement.reason}`,
            postponement: undefined // Clear postponement data after acceptance
        };
        await this.storage.save(this.COLLECTION, id, updatedAppointment);
        return updatedAppointment;
    }
    /**
     * Reject postponement request by patient
     *
     * @param id - The appointment ID to reject postponement for
     * @returns The updated appointment with original date/time
     * @throws Error if appointment not found or no postponement request
     */
    async rejectPostponement(id) {
        const existingAppointment = await this.getAppointment(id);
        if (!existingAppointment) {
            throw new Error(`Appointment with ID ${id} not found`);
        }
        if (existingAppointment.status !== 'postpone_requested' || !existingAppointment.postponement) {
            throw new Error(`No postponement request found for appointment ${id}`);
        }
        const updatedAppointment = {
            ...existingAppointment,
            status: 'confirmed', // Return to confirmed status
            postponement: undefined // Clear postponement data after rejection
        };
        await this.storage.save(this.COLLECTION, id, updatedAppointment);
        return updatedAppointment;
    }
    /**
     * Update an existing appointment
     *
     * @param id - The appointment ID to update
     * @param data - Partial appointment data to update
     * @returns The updated appointment
     * @throws Error if appointment not found
     */
    async updateAppointment(id, data) {
        // Load existing appointment
        const existingAppointment = await this.getAppointment(id);
        if (!existingAppointment) {
            throw new Error(`Appointment with ID ${id} not found`);
        }
        // Merge updates with existing data
        const updatedAppointment = {
            ...existingAppointment,
            ...data,
            id: existingAppointment.id, // Preserve original ID
            createdAt: existingAppointment.createdAt, // Preserve original timestamp
        };
        // Validate required fields are still present after update
        this.validateRequiredFields(updatedAppointment);
        // If patient or doctor changed, validate referential integrity
        if (data.patientId || data.doctorId) {
            await this.validateReferentialIntegrity(updatedAppointment.patientId, updatedAppointment.doctorId);
        }
        // Persist updated appointment
        await this.storage.save(this.COLLECTION, id, updatedAppointment);
        return updatedAppointment;
    }
    /**
     * Delete an appointment from the system
     *
     * @param id - The appointment ID to delete
     * @throws Error if appointment not found
     */
    async deleteAppointment(id) {
        // Check if appointment exists
        const existingAppointment = await this.getAppointment(id);
        if (!existingAppointment) {
            throw new Error(`Appointment with ID ${id} not found`);
        }
        // Delete from storage
        await this.storage.delete(this.COLLECTION, id);
    }
    /**
     * Validate that all required fields are present
     * Requirements: 3.1
     *
     * @param data - Appointment data to validate
     * @throws Error if required fields are missing
     */
    validateRequiredFields(data) {
        const requiredFields = [
            'patientId',
            'doctorId',
            'dateTime',
            'status',
        ];
        const missingFields = [];
        for (const field of requiredFields) {
            if (!data[field] || (typeof data[field] === 'string' && data[field].trim() === '')) {
                missingFields.push(field);
            }
        }
        if (missingFields.length > 0) {
            throw new Error(`Missing required fields: ${missingFields.join(', ')}. ` +
                `Appointment scheduling requires: patientId, doctorId, dateTime, and status.`);
        }
        // Validate status is one of the allowed values
        const validStatuses = ['scheduled', 'confirmed', 'completed', 'cancelled', 'postponed', 'postpone_requested'];
        if (!validStatuses.includes(data.status)) {
            throw new Error(`Invalid status: ${data.status}. Status must be one of: ${validStatuses.join(', ')}`);
        }
    }
    /**
     * Validate that referenced patient and doctor exist in the system
     * Requirements: 3.2, 3.4
     *
     * @param patientId - The patient ID to validate
     * @param doctorId - The doctor ID to validate
     * @throws Error if patient or doctor does not exist
     */
    async validateReferentialIntegrity(patientId, doctorId) {
        // Check if patient exists (Requirements 3.2, 3.4)
        const patient = await this.patientService.getPatient(patientId);
        if (!patient) {
            throw new Error(`Patient with ID ${patientId} does not exist`);
        }
        // Check if doctor exists (Requirements 3.2, 3.4)
        const doctor = await this.doctorService.getDoctor(doctorId);
        if (!doctor) {
            throw new Error(`Doctor with ID ${doctorId} does not exist`);
        }
    }
}
exports.AppointmentService = AppointmentService;
//# sourceMappingURL=AppointmentService.js.map