import { Appointment } from '../models/Appointment';
import { StorageManager } from '../storage/StorageManager';
import { PatientService } from './PatientService';
import { DoctorService } from './DoctorService';
/**
 * AppointmentService handles all appointment-related operations
 * Requirements: 3.1, 3.2, 3.3, 3.4, 3.5, 6.1, 6.2, 6.3, 6.4, 6.5
 */
export declare class AppointmentService {
    private storage;
    private patientService;
    private doctorService;
    private readonly COLLECTION;
    constructor(storage: StorageManager, patientService: PatientService, doctorService: DoctorService);
    /**
     * Schedule a new appointment in the system
     * Requirements: 3.1, 3.2, 3.3, 3.4, 3.5
     *
     * @param data - Appointment data without id and createdAt
     * @returns The newly created appointment with assigned ID
     * @throws Error if required fields are missing, validation fails, or referential integrity is violated
     */
    scheduleAppointment(data: Omit<Appointment, 'id' | 'createdAt'>): Promise<Appointment>;
    /**
     * Retrieve an appointment by its ID
     * Requirements: 6.5
     *
     * @param id - The appointment ID to search for
     * @returns The appointment if found, null otherwise
     */
    getAppointment(id: string): Promise<Appointment | null>;
    /**
     * Retrieve all appointments for a specific patient
     * Requirements: 6.2, 6.5
     *
     * @param patientId - The patient ID to search appointments for
     * @returns Array of all appointments associated with the patient ID
     */
    getAppointmentsByPatient(patientId: string): Promise<Appointment[]>;
    /**
     * Retrieve all appointments for a specific doctor
     * Requirements: 6.1, 6.5
     *
     * @param doctorId - The doctor ID to search appointments for
     * @returns Array of all appointments associated with the doctor ID
     */
    getAppointmentsByDoctor(doctorId: string): Promise<Appointment[]>;
    /**
     * Update the status of an existing appointment
     * Requirements: 6.3, 6.4, 3.5
     *
     * @param id - The appointment ID to update
     * @param status - The new status to set
     * @returns The updated appointment
     * @throws Error if appointment not found
     */
    updateAppointmentStatus(id: string, status: Appointment['status']): Promise<Appointment>;
    /**
     * Cancel an appointment by setting its status to cancelled
     * Requirements: 6.4
     *
     * @param id - The appointment ID to cancel
     * @returns The cancelled appointment
     * @throws Error if appointment not found
     */
    cancelAppointment(id: string): Promise<Appointment>;
    /**
     * Request postponement of an appointment by doctor
     *
     * @param id - The appointment ID to postpone
     * @param newDateTime - The new proposed date and time
     * @param reason - The reason for postponement
     * @returns The updated appointment with postponement request
     * @throws Error if appointment not found or invalid status
     */
    requestPostponement(id: string, newDateTime: string, reason: string): Promise<Appointment>;
    /**
     * Accept postponement request by patient
     *
     * @param id - The appointment ID to accept postponement for
     * @returns The updated appointment with new date/time
     * @throws Error if appointment not found or no postponement request
     */
    acceptPostponement(id: string): Promise<Appointment>;
    /**
     * Reject postponement request by patient
     *
     * @param id - The appointment ID to reject postponement for
     * @returns The updated appointment with original date/time
     * @throws Error if appointment not found or no postponement request
     */
    rejectPostponement(id: string): Promise<Appointment>;
    /**
     * Update an existing appointment
     *
     * @param id - The appointment ID to update
     * @param data - Partial appointment data to update
     * @returns The updated appointment
     * @throws Error if appointment not found
     */
    updateAppointment(id: string, data: Partial<Omit<Appointment, 'id' | 'createdAt'>>): Promise<Appointment>;
    /**
     * Delete an appointment from the system
     *
     * @param id - The appointment ID to delete
     * @throws Error if appointment not found
     */
    deleteAppointment(id: string): Promise<void>;
    /**
     * Validate that all required fields are present
     * Requirements: 3.1
     *
     * @param data - Appointment data to validate
     * @throws Error if required fields are missing
     */
    private validateRequiredFields;
    /**
     * Validate that referenced patient and doctor exist in the system
     * Requirements: 3.2, 3.4
     *
     * @param patientId - The patient ID to validate
     * @param doctorId - The doctor ID to validate
     * @throws Error if patient or doctor does not exist
     */
    private validateReferentialIntegrity;
}
//# sourceMappingURL=AppointmentService.d.ts.map