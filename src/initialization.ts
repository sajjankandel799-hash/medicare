import { StorageManager } from './storage/StorageManager';
import { PatientService } from './services/PatientService';
import { DoctorService } from './services/DoctorService';
import { AppointmentService } from './services/AppointmentService';
import { MedicalRecordService } from './services/MedicalRecordService';
import { logger, ErrorHandler, AppError, ErrorCode } from './utils';

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
export async function initializeSystem(dataDir?: string): Promise<SystemServices> {
  return ErrorHandler.wrapAsync('system-initialize', async () => {
    logger.info('system-initialize', 'Starting system initialization', { dataDir: dataDir || './data' });
    
    // Initialize storage manager
    const storageManager = new StorageManager(dataDir);
    
    // Create data directory structure if it doesn't exist
    await storageManager.initialize();
    
    // Initialize all services
    const patientService = new PatientService(storageManager);
    const doctorService = new DoctorService(storageManager);
    const appointmentService = new AppointmentService(storageManager, patientService, doctorService);
    const medicalRecordService = new MedicalRecordService(storageManager);
    
    logger.info('system-initialize', 'Services initialized successfully');
    
    // Load all existing data to verify system integrity
    await loadAllData(storageManager);
    
    logger.info('system-initialize', 'System initialization completed successfully');
    
    return {
      storageManager,
      patientService,
      doctorService,
      appointmentService,
      medicalRecordService
    };
  });
}

/**
 * Load all data from storage to verify system integrity and warm up caches.
 * This function attempts to load all entities from each collection to ensure
 * the data is accessible and properly formatted.
 * 
 * @param storageManager - The storage manager instance
 * @throws Error if data loading fails
 */
async function loadAllData(storageManager: StorageManager): Promise<void> {
  return ErrorHandler.wrapAsync('system-load-all-data', async () => {
    logger.info('system-load-all-data', 'Loading all existing data for verification');
    
    // Load all entities to verify data integrity
    const patients = await storageManager.loadAll('patients');
    const doctors = await storageManager.loadAll('doctors');
    const appointments = await storageManager.loadAll('appointments');
    const medicalRecords = await storageManager.loadAll('medical-records');
    
    const summary = {
      patients: patients.length,
      doctors: doctors.length,
      appointments: appointments.length,
      medicalRecords: medicalRecords.length
    };
    
    logger.info('system-load-all-data', 'Data loading completed successfully', summary);
    
    console.log(`System initialized successfully:`);
    console.log(`  - Loaded ${patients.length} patients`);
    console.log(`  - Loaded ${doctors.length} doctors`);
    console.log(`  - Loaded ${appointments.length} appointments`);
    console.log(`  - Loaded ${medicalRecords.length} medical records`);
  });
}

/**
 * Gracefully shutdown the system.
 * Currently a placeholder for future cleanup operations.
 */
export async function shutdownSystem(): Promise<void> {
  // Future: Add any cleanup operations here
  console.log('System shutdown complete');
}