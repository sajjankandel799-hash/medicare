import { StorageManager } from './storage/StorageManager';
import { PatientService } from './services/PatientService';
import { DoctorService } from './services/DoctorService';
import { AppointmentService } from './services/AppointmentService';
import { MedicalRecordService } from './services/MedicalRecordService';
/**
 * System initialization result containing all initialized services
 */
export interface SystemServices {
    storageManager: StorageManager;
    patientService: PatientService;
    doctorService: DoctorService;
    appointmentService: AppointmentService;
    medicalRecordService: MedicalRecordService;
}
/**
 * Initialize the Hospital Management System.
 * Creates data directories, initializes storage, and loads all existing data.
 *
 * @param dataDir - Optional data directory path (defaults to './data')
 * @returns Promise resolving to initialized system services
 * @throws Error if initialization fails
 */
export declare function initializeSystem(dataDir?: string): Promise<SystemServices>;
/**
 * Gracefully shutdown the system.
 * Currently a placeholder for future cleanup operations.
 */
export declare function shutdownSystem(): Promise<void>;
//# sourceMappingURL=initialization.d.ts.map