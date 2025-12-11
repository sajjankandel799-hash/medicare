"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.initializeSystem = initializeSystem;
exports.shutdownSystem = shutdownSystem;
const StorageManager_1 = require("./storage/StorageManager");
const PatientService_1 = require("./services/PatientService");
const DoctorService_1 = require("./services/DoctorService");
const AppointmentService_1 = require("./services/AppointmentService");
const MedicalRecordService_1 = require("./services/MedicalRecordService");
const utils_1 = require("./utils");
/**
 * Initialize the Hospital Management System.
 * Creates data directories, initializes storage, and loads all existing data.
 *
 * @param dataDir - Optional data directory path (defaults to './data')
 * @returns Promise resolving to initialized system services
 * @throws Error if initialization fails
 */
async function initializeSystem(dataDir) {
    return utils_1.ErrorHandler.wrapAsync('system-initialize', async () => {
        utils_1.logger.info('system-initialize', 'Starting system initialization', { dataDir: dataDir || './data' });
        // Initialize storage manager
        const storageManager = new StorageManager_1.StorageManager(dataDir);
        // Create data directory structure if it doesn't exist
        await storageManager.initialize();
        // Initialize all services
        const patientService = new PatientService_1.PatientService(storageManager);
        const doctorService = new DoctorService_1.DoctorService(storageManager);
        const appointmentService = new AppointmentService_1.AppointmentService(storageManager, patientService, doctorService);
        const medicalRecordService = new MedicalRecordService_1.MedicalRecordService(storageManager);
        utils_1.logger.info('system-initialize', 'Services initialized successfully');
        // Load all existing data to verify system integrity
        await loadAllData(storageManager);
        utils_1.logger.info('system-initialize', 'System initialization completed successfully');
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
async function loadAllData(storageManager) {
    return utils_1.ErrorHandler.wrapAsync('system-load-all-data', async () => {
        utils_1.logger.info('system-load-all-data', 'Loading all existing data for verification');
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
        utils_1.logger.info('system-load-all-data', 'Data loading completed successfully', summary);
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
async function shutdownSystem() {
    // Future: Add any cleanup operations here
    console.log('System shutdown complete');
}
//# sourceMappingURL=initialization.js.map