/**
 * Hospital Management System CLI
 * Interactive command-line interface for hospital operations
 */
export declare class HospitalCLI {
    private services;
    private rl;
    constructor();
    /**
     * Start the CLI application
     */
    start(): Promise<void>;
    /**
     * Display main menu and handle user selection
     */
    private showMainMenu;
    /**
     * Patient management menu
     */
    private patientMenu;
    /**
     * Doctor management menu
     */
    private doctorMenu;
    /**
     * Appointment management menu
     */
    private appointmentMenu;
    /**
     * Medical records menu
     */
    private medicalRecordMenu;
    /**
     * Utility method to prompt user for input
     */
    private prompt;
    /**
     * Handle and display errors consistently
     */
    private handleError;
    /**
     * Validate and sanitize user input
     */
    private validateInput;
    /**
     * Format and display patient information
     */
    private displayPatient;
    /**
     * Format and display doctor information
     */
    private displayDoctor;
    /**
     * Format and display appointment information
     */
    private displayAppointment;
    /**
     * Format and display medical record information
     */
    private displayMedicalRecord;
    /**
     * Register a new patient
     */
    private registerPatient;
    /**
     * Search for a patient by ID
     */
    private searchPatientById;
    /**
     * Search for patients by name
     */
    private searchPatientsByName;
    /**
     * Update patient information
     */
    private updatePatient;
    /**
     * Register a new doctor
     */
    private registerDoctor;
    /**
     * Search for a doctor by ID
     */
    private searchDoctorById;
    /**
     * List all doctors
     */
    private listAllDoctors;
    /**
     * Update doctor information
     */
    private updateDoctor;
    /**
     * Schedule a new appointment
     */
    private scheduleAppointment;
    /**
     * Search for an appointment by ID
     */
    private searchAppointmentById;
    /**
     * View appointments for a specific patient
     */
    private viewPatientAppointments;
    /**
     * View appointments for a specific doctor
     */
    private viewDoctorAppointments;
    /**
     * Update appointment status
     */
    private updateAppointmentStatus;
    /**
     * Cancel an appointment
     */
    private cancelAppointment;
    /**
     * Create a new medical record
     */
    private createMedicalRecord;
    /**
     * Search for a medical record by ID
     */
    private searchMedicalRecordById;
    /**
     * View medical history for a specific patient
     */
    private viewPatientMedicalHistory;
}
/**
 * Main CLI entry point
 */
export declare function startCLI(): Promise<void>;
//# sourceMappingURL=index.d.ts.map