/**
 * Hospital Management System CLI
 * Interactive command-line interface for hospital operations
 */

import * as readline from 'readline';
import { initializeSystem, SystemServices } from '../initialization';
import { Patient, Doctor, Appointment, MedicalRecord } from '../models';
import { logger, ErrorHandler, AppError, InputValidator, ErrorCode } from '../utils';

export class HospitalCLI {
  private services: SystemServices | null = null;
  private rl: readline.Interface;

  constructor() {
    this.rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout
    });
  }

  /**
   * Start the CLI application
   */
  async start(): Promise<void> {
    try {
      console.log('🏥 Hospital Management System');
      console.log('=============================');
      console.log('Initializing system...\n');

      logger.info('cli-start', 'Starting Hospital Management System CLI');
      this.services = await initializeSystem();
      
      console.log('\n✅ System ready!\n');
      logger.info('cli-start', 'System initialization completed successfully');
      await this.showMainMenu();
    } catch (error) {
      const appError = ErrorHandler.handleError('cli-start', error);
      const userMessage = ErrorHandler.getUserFriendlyMessage(appError);
      console.error('❌ Failed to initialize system:', userMessage);
      process.exit(1);
    }
  }

  /**
   * Display main menu and handle user selection
   */
  private async showMainMenu(): Promise<void> {
    while (true) {
      console.log('\n📋 Main Menu');
      console.log('=============');
      console.log('1. Patient Management');
      console.log('2. Doctor Management');
      console.log('3. Appointment Management');
      console.log('4. Medical Records');
      console.log('5. Exit');
      
      const choice = await this.prompt('Select an option (1-5): ');
      
      switch (choice.trim()) {
        case '1':
          await this.patientMenu();
          break;
        case '2':
          await this.doctorMenu();
          break;
        case '3':
          await this.appointmentMenu();
          break;
        case '4':
          await this.medicalRecordMenu();
          break;
        case '5':
          console.log('\n👋 Goodbye!');
          this.rl.close();
          return;
        default:
          console.log('❌ Invalid option. Please select 1-5.');
      }
    }
  }

  /**
   * Patient management menu
   */
  private async patientMenu(): Promise<void> {
    while (true) {
      console.log('\n👤 Patient Management');
      console.log('=====================');
      console.log('1. Register New Patient');
      console.log('2. Search Patient by ID');
      console.log('3. Search Patients by Name');
      console.log('4. Update Patient');
      console.log('5. Back to Main Menu');
      
      const choice = await this.prompt('Select an option (1-5): ');
      
      switch (choice.trim()) {
        case '1':
          await this.registerPatient();
          break;
        case '2':
          await this.searchPatientById();
          break;
        case '3':
          await this.searchPatientsByName();
          break;
        case '4':
          await this.updatePatient();
          break;
        case '5':
          return;
        default:
          console.log('❌ Invalid option. Please select 1-5.');
      }
    }
  }

  /**
   * Doctor management menu
   */
  private async doctorMenu(): Promise<void> {
    while (true) {
      console.log('\n👨‍⚕️ Doctor Management');
      console.log('====================');
      console.log('1. Register New Doctor');
      console.log('2. Search Doctor by ID');
      console.log('3. List All Doctors');
      console.log('4. Update Doctor');
      console.log('5. Back to Main Menu');
      
      const choice = await this.prompt('Select an option (1-5): ');
      
      switch (choice.trim()) {
        case '1':
          await this.registerDoctor();
          break;
        case '2':
          await this.searchDoctorById();
          break;
        case '3':
          await this.listAllDoctors();
          break;
        case '4':
          await this.updateDoctor();
          break;
        case '5':
          return;
        default:
          console.log('❌ Invalid option. Please select 1-5.');
      }
    }
  }

  /**
   * Appointment management menu
   */
  private async appointmentMenu(): Promise<void> {
    while (true) {
      console.log('\n📅 Appointment Management');
      console.log('=========================');
      console.log('1. Schedule New Appointment');
      console.log('2. Search Appointment by ID');
      console.log('3. View Patient Appointments');
      console.log('4. View Doctor Appointments');
      console.log('5. Update Appointment Status');
      console.log('6. Cancel Appointment');
      console.log('7. Back to Main Menu');
      
      const choice = await this.prompt('Select an option (1-7): ');
      
      switch (choice.trim()) {
        case '1':
          await this.scheduleAppointment();
          break;
        case '2':
          await this.searchAppointmentById();
          break;
        case '3':
          await this.viewPatientAppointments();
          break;
        case '4':
          await this.viewDoctorAppointments();
          break;
        case '5':
          await this.updateAppointmentStatus();
          break;
        case '6':
          await this.cancelAppointment();
          break;
        case '7':
          return;
        default:
          console.log('❌ Invalid option. Please select 1-7.');
      }
    }
  }

  /**
   * Medical records menu
   */
  private async medicalRecordMenu(): Promise<void> {
    while (true) {
      console.log('\n📋 Medical Records');
      console.log('==================');
      console.log('1. Create New Medical Record');
      console.log('2. Search Record by ID');
      console.log('3. View Patient Medical History');
      console.log('4. Back to Main Menu');
      
      const choice = await this.prompt('Select an option (1-4): ');
      
      switch (choice.trim()) {
        case '1':
          await this.createMedicalRecord();
          break;
        case '2':
          await this.searchMedicalRecordById();
          break;
        case '3':
          await this.viewPatientMedicalHistory();
          break;
        case '4':
          return;
        default:
          console.log('❌ Invalid option. Please select 1-4.');
      }
    }
  }

  /**
   * Utility method to prompt user for input
   */
  private prompt(question: string): Promise<string> {
    return new Promise((resolve) => {
      this.rl.question(question, resolve);
    });
  }

  /**
   * Handle and display errors consistently
   */
  private handleError(operation: string, error: unknown): void {
    const appError = ErrorHandler.handleError(operation, error);
    const userMessage = ErrorHandler.getUserFriendlyMessage(appError);
    console.log(`❌ ${userMessage}`);
  }

  /**
   * Validate and sanitize user input
   */
  private validateInput(input: string, fieldName: string, required: boolean = true): string {
    const sanitized = InputValidator.sanitizeString(input);
    
    if (required && !InputValidator.isNonEmptyString(sanitized)) {
      throw new AppError(
        ErrorCode.MISSING_REQUIRED_FIELDS, 
        `${fieldName} is required and cannot be empty`
      );
    }
    
    return sanitized;
  }

  /**
   * Format and display patient information
   */
  private displayPatient(patient: Patient): void {
    console.log('\n👤 Patient Information:');
    console.log(`   ID: ${patient.id}`);
    console.log(`   Name: ${patient.name}`);
    console.log(`   Date of Birth: ${patient.dateOfBirth}`);
    console.log(`   Contact: ${patient.contactNumber}`);
    console.log(`   Address: ${patient.address}`);
    if (patient.email) {
      console.log(`   Email: ${patient.email}`);
    }
    console.log(`   Registered: ${new Date(patient.createdAt).toLocaleString()}`);
  }

  /**
   * Format and display doctor information
   */
  private displayDoctor(doctor: Doctor): void {
    console.log('\n👨‍⚕️ Doctor Information:');
    console.log(`   ID: ${doctor.id}`);
    console.log(`   Name: ${doctor.name}`);
    console.log(`   Specialization: ${doctor.specialization}`);
    console.log(`   Contact: ${doctor.contactNumber}`);
    if (doctor.email) {
      console.log(`   Email: ${doctor.email}`);
    }
    console.log(`   Registered: ${new Date(doctor.createdAt).toLocaleString()}`);
  }

  /**
   * Format and display appointment information
   */
  private displayAppointment(appointment: Appointment): void {
    console.log('\n📅 Appointment Information:');
    console.log(`   ID: ${appointment.id}`);
    console.log(`   Patient ID: ${appointment.patientId}`);
    console.log(`   Doctor ID: ${appointment.doctorId}`);
    console.log(`   Date & Time: ${new Date(appointment.dateTime).toLocaleString()}`);
    console.log(`   Status: ${appointment.status.toUpperCase()}`);
    if (appointment.notes) {
      console.log(`   Notes: ${appointment.notes}`);
    }
    console.log(`   Created: ${new Date(appointment.createdAt).toLocaleString()}`);
  }

  /**
   * Format and display medical record information
   */
  private displayMedicalRecord(record: MedicalRecord): void {
    console.log('\n📋 Medical Record:');
    console.log(`   ID: ${record.id}`);
    console.log(`   Patient ID: ${record.patientId}`);
    console.log(`   Doctor ID: ${record.doctorId}`);
    console.log(`   Diagnosis: ${record.diagnosis}`);
    console.log(`   Treatment: ${record.treatment}`);
    console.log(`   Notes: ${record.notes}`);
    console.log(`   Created: ${new Date(record.createdAt).toLocaleString()}`);
  }

  // ==================== PATIENT OPERATIONS ====================

  /**
   * Register a new patient
   */
  private async registerPatient(): Promise<void> {
    try {
      console.log('\n📝 Register New Patient');
      console.log('========================');
      
      const name = this.validateInput(await this.prompt('Patient Name: '), 'Patient name');
      const dateOfBirth = this.validateInput(await this.prompt('Date of Birth (YYYY-MM-DD): '), 'Date of birth');
      const contactNumber = this.validateInput(await this.prompt('Contact Number: '), 'Contact number');
      const address = this.validateInput(await this.prompt('Address: '), 'Address');
      const email = this.validateInput(await this.prompt('Email (optional): '), 'Email', false);

      const patientData = {
        name,
        dateOfBirth,
        contactNumber,
        address,
        ...(email && { email })
      };

      logger.info('cli-register-patient', 'Attempting to register new patient', { patientName: name });
      const patient = await this.services!.patientService.registerPatient(patientData);
      
      console.log('\n✅ Patient registered successfully!');
      this.displayPatient(patient);
      
    } catch (error) {
      this.handleError('cli-register-patient', error);
    }
  }

  /**
   * Search for a patient by ID
   */
  private async searchPatientById(): Promise<void> {
    try {
      const patientId = await this.prompt('Enter Patient ID: ');
      if (!patientId.trim()) {
        console.log('❌ Patient ID is required.');
        return;
      }

      const patient = await this.services!.patientService.getPatient(patientId.trim());
      
      if (patient) {
        this.displayPatient(patient);
      } else {
        console.log('❌ Patient not found.');
      }
      
    } catch (error) {
      console.log('❌ Failed to search patient:', (error as Error).message);
    }
  }

  /**
   * Search for patients by name
   */
  private async searchPatientsByName(): Promise<void> {
    try {
      const name = await this.prompt('Enter patient name (or partial name): ');
      if (!name.trim()) {
        console.log('❌ Name is required.');
        return;
      }

      const patients = await this.services!.patientService.searchPatientsByName(name.trim());
      
      if (patients.length === 0) {
        console.log('❌ No patients found matching that name.');
      } else {
        console.log(`\n✅ Found ${patients.length} patient(s):`);
        patients.forEach((patient, index) => {
          console.log(`\n--- Patient ${index + 1} ---`);
          this.displayPatient(patient);
        });
      }
      
    } catch (error) {
      console.log('❌ Failed to search patients:', (error as Error).message);
    }
  }

  /**
   * Update patient information
   */
  private async updatePatient(): Promise<void> {
    try {
      const patientId = await this.prompt('Enter Patient ID to update: ');
      if (!patientId.trim()) {
        console.log('❌ Patient ID is required.');
        return;
      }

      // First check if patient exists
      const existingPatient = await this.services!.patientService.getPatient(patientId.trim());
      if (!existingPatient) {
        console.log('❌ Patient not found.');
        return;
      }

      console.log('\nCurrent patient information:');
      this.displayPatient(existingPatient);

      console.log('\n📝 Update Patient Information (press Enter to keep current value)');
      console.log('================================================================');

      const name = await this.prompt(`Name [${existingPatient.name}]: `);
      const dateOfBirth = await this.prompt(`Date of Birth [${existingPatient.dateOfBirth}]: `);
      const contactNumber = await this.prompt(`Contact Number [${existingPatient.contactNumber}]: `);
      const address = await this.prompt(`Address [${existingPatient.address}]: `);
      const email = await this.prompt(`Email [${existingPatient.email || 'none'}]: `);

      const updateData: Partial<Patient> = {};
      if (name.trim()) updateData.name = name.trim();
      if (dateOfBirth.trim()) updateData.dateOfBirth = dateOfBirth.trim();
      if (contactNumber.trim()) updateData.contactNumber = contactNumber.trim();
      if (address.trim()) updateData.address = address.trim();
      if (email.trim()) updateData.email = email.trim();

      if (Object.keys(updateData).length === 0) {
        console.log('❌ No changes provided.');
        return;
      }

      const updatedPatient = await this.services!.patientService.updatePatient(patientId.trim(), updateData);
      
      console.log('\n✅ Patient updated successfully!');
      this.displayPatient(updatedPatient);
      
    } catch (error) {
      console.log('❌ Failed to update patient:', (error as Error).message);
    }
  }

  // ==================== DOCTOR OPERATIONS ====================

  /**
   * Register a new doctor
   */
  private async registerDoctor(): Promise<void> {
    try {
      console.log('\n📝 Register New Doctor');
      console.log('=======================');
      
      const name = await this.prompt('Doctor Name: ');
      if (!name.trim()) {
        console.log('❌ Doctor name is required.');
        return;
      }

      const specialization = await this.prompt('Specialization: ');
      if (!specialization.trim()) {
        console.log('❌ Specialization is required.');
        return;
      }

      const contactNumber = await this.prompt('Contact Number: ');
      if (!contactNumber.trim()) {
        console.log('❌ Contact number is required.');
        return;
      }

      const email = await this.prompt('Email (optional): ');

      const doctorData = {
        name: name.trim(),
        specialization: specialization.trim(),
        contactNumber: contactNumber.trim(),
        ...(email.trim() && { email: email.trim() })
      };

      const doctor = await this.services!.doctorService.registerDoctor(doctorData);
      
      console.log('\n✅ Doctor registered successfully!');
      this.displayDoctor(doctor);
      
    } catch (error) {
      console.log('❌ Failed to register doctor:', (error as Error).message);
    }
  }

  /**
   * Search for a doctor by ID
   */
  private async searchDoctorById(): Promise<void> {
    try {
      const doctorId = await this.prompt('Enter Doctor ID: ');
      if (!doctorId.trim()) {
        console.log('❌ Doctor ID is required.');
        return;
      }

      const doctor = await this.services!.doctorService.getDoctor(doctorId.trim());
      
      if (doctor) {
        this.displayDoctor(doctor);
      } else {
        console.log('❌ Doctor not found.');
      }
      
    } catch (error) {
      console.log('❌ Failed to search doctor:', (error as Error).message);
    }
  }

  /**
   * List all doctors
   */
  private async listAllDoctors(): Promise<void> {
    try {
      const doctors = await this.services!.doctorService.getAllDoctors();
      
      if (doctors.length === 0) {
        console.log('❌ No doctors found in the system.');
      } else {
        console.log(`\n✅ Found ${doctors.length} doctor(s):`);
        doctors.forEach((doctor, index) => {
          console.log(`\n--- Doctor ${index + 1} ---`);
          this.displayDoctor(doctor);
        });
      }
      
    } catch (error) {
      console.log('❌ Failed to list doctors:', (error as Error).message);
    }
  }

  /**
   * Update doctor information
   */
  private async updateDoctor(): Promise<void> {
    try {
      const doctorId = await this.prompt('Enter Doctor ID to update: ');
      if (!doctorId.trim()) {
        console.log('❌ Doctor ID is required.');
        return;
      }

      // First check if doctor exists
      const existingDoctor = await this.services!.doctorService.getDoctor(doctorId.trim());
      if (!existingDoctor) {
        console.log('❌ Doctor not found.');
        return;
      }

      console.log('\nCurrent doctor information:');
      this.displayDoctor(existingDoctor);

      console.log('\n📝 Update Doctor Information (press Enter to keep current value)');
      console.log('===============================================================');

      const name = await this.prompt(`Name [${existingDoctor.name}]: `);
      const specialization = await this.prompt(`Specialization [${existingDoctor.specialization}]: `);
      const contactNumber = await this.prompt(`Contact Number [${existingDoctor.contactNumber}]: `);
      const email = await this.prompt(`Email [${existingDoctor.email || 'none'}]: `);

      const updateData: Partial<Doctor> = {};
      if (name.trim()) updateData.name = name.trim();
      if (specialization.trim()) updateData.specialization = specialization.trim();
      if (contactNumber.trim()) updateData.contactNumber = contactNumber.trim();
      if (email.trim()) updateData.email = email.trim();

      if (Object.keys(updateData).length === 0) {
        console.log('❌ No changes provided.');
        return;
      }

      const updatedDoctor = await this.services!.doctorService.updateDoctor(doctorId.trim(), updateData);
      
      console.log('\n✅ Doctor updated successfully!');
      this.displayDoctor(updatedDoctor);
      
    } catch (error) {
      console.log('❌ Failed to update doctor:', (error as Error).message);
    }
  } 
 // ==================== APPOINTMENT OPERATIONS ====================

  /**
   * Schedule a new appointment
   */
  private async scheduleAppointment(): Promise<void> {
    try {
      console.log('\n📝 Schedule New Appointment');
      console.log('============================');
      
      const patientId = await this.prompt('Patient ID: ');
      if (!patientId.trim()) {
        console.log('❌ Patient ID is required.');
        return;
      }

      const doctorId = await this.prompt('Doctor ID: ');
      if (!doctorId.trim()) {
        console.log('❌ Doctor ID is required.');
        return;
      }

      const dateTime = await this.prompt('Date and Time (YYYY-MM-DD HH:MM): ');
      if (!dateTime.trim()) {
        console.log('❌ Date and time is required.');
        return;
      }

      const notes = await this.prompt('Notes (optional): ');

      const appointmentData = {
        patientId: patientId.trim(),
        doctorId: doctorId.trim(),
        dateTime: new Date(dateTime.trim()).toISOString(),
        status: 'scheduled' as const,
        ...(notes.trim() && { notes: notes.trim() })
      };

      const appointment = await this.services!.appointmentService.scheduleAppointment(appointmentData);
      
      console.log('\n✅ Appointment scheduled successfully!');
      this.displayAppointment(appointment);
      
    } catch (error) {
      console.log('❌ Failed to schedule appointment:', (error as Error).message);
    }
  }

  /**
   * Search for an appointment by ID
   */
  private async searchAppointmentById(): Promise<void> {
    try {
      const appointmentId = await this.prompt('Enter Appointment ID: ');
      if (!appointmentId.trim()) {
        console.log('❌ Appointment ID is required.');
        return;
      }

      const appointment = await this.services!.appointmentService.getAppointment(appointmentId.trim());
      
      if (appointment) {
        this.displayAppointment(appointment);
      } else {
        console.log('❌ Appointment not found.');
      }
      
    } catch (error) {
      console.log('❌ Failed to search appointment:', (error as Error).message);
    }
  }

  /**
   * View appointments for a specific patient
   */
  private async viewPatientAppointments(): Promise<void> {
    try {
      const patientId = await this.prompt('Enter Patient ID: ');
      if (!patientId.trim()) {
        console.log('❌ Patient ID is required.');
        return;
      }

      const appointments = await this.services!.appointmentService.getAppointmentsByPatient(patientId.trim());
      
      if (appointments.length === 0) {
        console.log('❌ No appointments found for this patient.');
      } else {
        console.log(`\n✅ Found ${appointments.length} appointment(s) for patient ${patientId.trim()}:`);
        appointments.forEach((appointment, index) => {
          console.log(`\n--- Appointment ${index + 1} ---`);
          this.displayAppointment(appointment);
        });
      }
      
    } catch (error) {
      console.log('❌ Failed to retrieve patient appointments:', (error as Error).message);
    }
  }

  /**
   * View appointments for a specific doctor
   */
  private async viewDoctorAppointments(): Promise<void> {
    try {
      const doctorId = await this.prompt('Enter Doctor ID: ');
      if (!doctorId.trim()) {
        console.log('❌ Doctor ID is required.');
        return;
      }

      const appointments = await this.services!.appointmentService.getAppointmentsByDoctor(doctorId.trim());
      
      if (appointments.length === 0) {
        console.log('❌ No appointments found for this doctor.');
      } else {
        console.log(`\n✅ Found ${appointments.length} appointment(s) for doctor ${doctorId.trim()}:`);
        appointments.forEach((appointment, index) => {
          console.log(`\n--- Appointment ${index + 1} ---`);
          this.displayAppointment(appointment);
        });
      }
      
    } catch (error) {
      console.log('❌ Failed to retrieve doctor appointments:', (error as Error).message);
    }
  }

  /**
   * Update appointment status
   */
  private async updateAppointmentStatus(): Promise<void> {
    try {
      const appointmentId = await this.prompt('Enter Appointment ID: ');
      if (!appointmentId.trim()) {
        console.log('❌ Appointment ID is required.');
        return;
      }

      // First check if appointment exists
      const existingAppointment = await this.services!.appointmentService.getAppointment(appointmentId.trim());
      if (!existingAppointment) {
        console.log('❌ Appointment not found.');
        return;
      }

      console.log('\nCurrent appointment:');
      this.displayAppointment(existingAppointment);

      console.log('\n📝 Update Appointment Status');
      console.log('============================');
      console.log('1. Scheduled');
      console.log('2. Completed');
      console.log('3. Cancelled');

      const statusChoice = await this.prompt('Select new status (1-3): ');
      
      let newStatus: 'scheduled' | 'completed' | 'cancelled';
      switch (statusChoice.trim()) {
        case '1':
          newStatus = 'scheduled';
          break;
        case '2':
          newStatus = 'completed';
          break;
        case '3':
          newStatus = 'cancelled';
          break;
        default:
          console.log('❌ Invalid status selection.');
          return;
      }

      const updatedAppointment = await this.services!.appointmentService.updateAppointmentStatus(appointmentId.trim(), newStatus);
      
      console.log('\n✅ Appointment status updated successfully!');
      this.displayAppointment(updatedAppointment);
      
    } catch (error) {
      console.log('❌ Failed to update appointment status:', (error as Error).message);
    }
  }

  /**
   * Cancel an appointment
   */
  private async cancelAppointment(): Promise<void> {
    try {
      const appointmentId = await this.prompt('Enter Appointment ID to cancel: ');
      if (!appointmentId.trim()) {
        console.log('❌ Appointment ID is required.');
        return;
      }

      // First check if appointment exists
      const existingAppointment = await this.services!.appointmentService.getAppointment(appointmentId.trim());
      if (!existingAppointment) {
        console.log('❌ Appointment not found.');
        return;
      }

      console.log('\nAppointment to cancel:');
      this.displayAppointment(existingAppointment);

      const confirm = await this.prompt('\nAre you sure you want to cancel this appointment? (y/N): ');
      if (confirm.toLowerCase() !== 'y' && confirm.toLowerCase() !== 'yes') {
        console.log('❌ Cancellation aborted.');
        return;
      }

      const cancelledAppointment = await this.services!.appointmentService.cancelAppointment(appointmentId.trim());
      
      console.log('\n✅ Appointment cancelled successfully!');
      this.displayAppointment(cancelledAppointment);
      
    } catch (error) {
      console.log('❌ Failed to cancel appointment:', (error as Error).message);
    }
  }

  // ==================== MEDICAL RECORD OPERATIONS ====================

  /**
   * Create a new medical record
   */
  private async createMedicalRecord(): Promise<void> {
    try {
      console.log('\n📝 Create New Medical Record');
      console.log('=============================');
      
      const patientId = await this.prompt('Patient ID: ');
      if (!patientId.trim()) {
        console.log('❌ Patient ID is required.');
        return;
      }

      const doctorId = await this.prompt('Doctor ID: ');
      if (!doctorId.trim()) {
        console.log('❌ Doctor ID is required.');
        return;
      }

      const diagnosis = await this.prompt('Diagnosis: ');
      if (!diagnosis.trim()) {
        console.log('❌ Diagnosis is required.');
        return;
      }

      const treatment = await this.prompt('Treatment: ');
      if (!treatment.trim()) {
        console.log('❌ Treatment is required.');
        return;
      }

      const notes = await this.prompt('Notes: ');
      if (!notes.trim()) {
        console.log('❌ Notes are required.');
        return;
      }

      const recordData = {
        patientId: patientId.trim(),
        doctorId: doctorId.trim(),
        diagnosis: diagnosis.trim(),
        treatment: treatment.trim(),
        notes: notes.trim()
      };

      const record = await this.services!.medicalRecordService.createRecord(recordData);
      
      console.log('\n✅ Medical record created successfully!');
      this.displayMedicalRecord(record);
      
    } catch (error) {
      console.log('❌ Failed to create medical record:', (error as Error).message);
    }
  }

  /**
   * Search for a medical record by ID
   */
  private async searchMedicalRecordById(): Promise<void> {
    try {
      const recordId = await this.prompt('Enter Medical Record ID: ');
      if (!recordId.trim()) {
        console.log('❌ Medical Record ID is required.');
        return;
      }

      const record = await this.services!.medicalRecordService.getRecord(recordId.trim());
      
      if (record) {
        this.displayMedicalRecord(record);
      } else {
        console.log('❌ Medical record not found.');
      }
      
    } catch (error) {
      console.log('❌ Failed to search medical record:', (error as Error).message);
    }
  }

  /**
   * View medical history for a specific patient
   */
  private async viewPatientMedicalHistory(): Promise<void> {
    try {
      const patientId = await this.prompt('Enter Patient ID: ');
      if (!patientId.trim()) {
        console.log('❌ Patient ID is required.');
        return;
      }

      const records = await this.services!.medicalRecordService.getPatientRecords(patientId.trim());
      
      if (records.length === 0) {
        console.log('❌ No medical records found for this patient.');
      } else {
        console.log(`\n✅ Found ${records.length} medical record(s) for patient ${patientId.trim()}:`);
        records.forEach((record, index) => {
          console.log(`\n--- Medical Record ${index + 1} ---`);
          this.displayMedicalRecord(record);
        });
      }
      
    } catch (error) {
      console.log('❌ Failed to retrieve patient medical history:', (error as Error).message);
    }
  }
}

/**
 * Main CLI entry point
 */
export async function startCLI(): Promise<void> {
  const cli = new HospitalCLI();
  await cli.start();
}