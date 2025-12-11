/**
 * Appointment entity representing a scheduled meeting between a patient and a doctor
 * Requirements: 3.1, 3.2, 3.3, 3.4, 3.5
 */
export interface Appointment {
    /** Unique appointment identifier */
    id: string;
    /** Reference to patient */
    patientId: string;
    /** Reference to doctor */
    doctorId: string;
    /** ISO 8601 datetime for the appointment */
    dateTime: string;
    /** Current status of the appointment */
    status: 'scheduled' | 'confirmed' | 'completed' | 'cancelled' | 'postponed' | 'postpone_requested';
    /** Optional appointment notes */
    notes?: string;
    /** ISO 8601 timestamp when appointment was created */
    createdAt: string;
    /** Postponement details */
    postponement?: {
        /** New proposed date and time */
        newDateTime: string;
        /** Reason for postponement */
        reason: string;
        /** Who requested the postponement */
        requestedBy: 'doctor' | 'patient';
        /** Timestamp when postponement was requested */
        requestedAt: string;
    };
}
//# sourceMappingURL=Appointment.d.ts.map