import { describe, it, expect, beforeEach } from 'vitest';
import { AppointmentService } from './AppointmentService';
import { PatientService } from './PatientService';
import { DoctorService } from './DoctorService';
import { StorageManager } from '../storage/StorageManager';
import { Appointment } from '../models/Appointment';

describe('AppointmentService', () => {
  let appointmentService: AppointmentService;
  let patientService: PatientService;
  let doctorService: DoctorService;
  let storage: StorageManager;
  let testPatientId: string;
  let testDoctorId: string;

  beforeEach(async () => {
    // Create storage manager with test directory
    storage = new StorageManager('./test-data');
    
    // Initialize storage directories
    await storage.initialize();
    
    // Create services
    patientService = new PatientService(storage);
    doctorService = new DoctorService(storage);
    appointmentService = new AppointmentService(storage, patientService, doctorService);

    // Create test patient and doctor for referential integrity
    const testPatient = await patientService.registerPatient({
      name: 'John Doe',
      dateOfBirth: '1990-01-01',
      contactNumber: '123-456-7890',
      address: '123 Main St',
      email: 'john@example.com'
    });
    testPatientId = testPatient.id;

    const testDoctor = await doctorService.registerDoctor({
      name: 'Dr. Smith',
      specialization: 'Cardiology',
      contactNumber: '098-765-4321',
      email: 'dr.smith@hospital.com'
    });
    testDoctorId = testDoctor.id;
  });

  describe('scheduleAppointment', () => {
    it('should create a new appointment with valid data', async () => {
      const appointmentData = {
        patientId: testPatientId,
        doctorId: testDoctorId,
        dateTime: '2024-01-15T10:00:00Z',
        status: 'scheduled' as const,
        notes: 'Regular checkup'
      };

      const appointment = await appointmentService.scheduleAppointment(appointmentData);

      expect(appointment.id).toMatch(/^APT-\d+-[a-z0-9]+$/);
      expect(appointment.patientId).toBe(testPatientId);
      expect(appointment.doctorId).toBe(testDoctorId);
      expect(appointment.dateTime).toBe('2024-01-15T10:00:00Z');
      expect(appointment.status).toBe('scheduled');
      expect(appointment.notes).toBe('Regular checkup');
      expect(appointment.createdAt).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/);
    });

    it('should reject appointment with missing required fields', async () => {
      const invalidData = {
        patientId: testPatientId,
        // Missing doctorId, dateTime, status
      } as any;

      await expect(appointmentService.scheduleAppointment(invalidData))
        .rejects.toThrow('Missing required fields');
    });

    it('should reject appointment with non-existent patient', async () => {
      const appointmentData = {
        patientId: 'PAT-nonexistent-123',
        doctorId: testDoctorId,
        dateTime: '2024-01-15T10:00:00Z',
        status: 'scheduled' as const
      };

      await expect(appointmentService.scheduleAppointment(appointmentData))
        .rejects.toThrow('Patient with ID PAT-nonexistent-123 does not exist');
    });

    it('should reject appointment with non-existent doctor', async () => {
      const appointmentData = {
        patientId: testPatientId,
        doctorId: 'DOC-nonexistent-123',
        dateTime: '2024-01-15T10:00:00Z',
        status: 'scheduled' as const
      };

      await expect(appointmentService.scheduleAppointment(appointmentData))
        .rejects.toThrow('Doctor with ID DOC-nonexistent-123 does not exist');
    });

    it('should reject appointment with invalid status', async () => {
      const appointmentData = {
        patientId: testPatientId,
        doctorId: testDoctorId,
        dateTime: '2024-01-15T10:00:00Z',
        status: 'invalid-status' as any
      };

      await expect(appointmentService.scheduleAppointment(appointmentData))
        .rejects.toThrow('Invalid status: invalid-status');
    });
  });

  describe('getAppointment', () => {
    it('should retrieve an existing appointment', async () => {
      const appointmentData = {
        patientId: testPatientId,
        doctorId: testDoctorId,
        dateTime: '2024-01-15T10:00:00Z',
        status: 'scheduled' as const
      };

      const createdAppointment = await appointmentService.scheduleAppointment(appointmentData);
      const retrievedAppointment = await appointmentService.getAppointment(createdAppointment.id);

      expect(retrievedAppointment).toEqual(createdAppointment);
    });

    it('should return null for non-existent appointment', async () => {
      const result = await appointmentService.getAppointment('APT-nonexistent-123');
      expect(result).toBeNull();
    });
  });

  describe('getAppointmentsByPatient', () => {
    it('should return all appointments for a specific patient', async () => {
      // Create multiple appointments for the same patient
      const appointment1 = await appointmentService.scheduleAppointment({
        patientId: testPatientId,
        doctorId: testDoctorId,
        dateTime: '2024-01-15T10:00:00Z',
        status: 'scheduled'
      });

      const appointment2 = await appointmentService.scheduleAppointment({
        patientId: testPatientId,
        doctorId: testDoctorId,
        dateTime: '2024-01-16T14:00:00Z',
        status: 'completed'
      });

      const appointments = await appointmentService.getAppointmentsByPatient(testPatientId);

      expect(appointments).toHaveLength(2);
      expect(appointments.map(a => a.id)).toContain(appointment1.id);
      expect(appointments.map(a => a.id)).toContain(appointment2.id);
    });

    it('should return empty array for patient with no appointments', async () => {
      const appointments = await appointmentService.getAppointmentsByPatient('PAT-nonexistent-123');
      expect(appointments).toEqual([]);
    });
  });

  describe('getAppointmentsByDoctor', () => {
    it('should return all appointments for a specific doctor', async () => {
      // Create multiple appointments for the same doctor
      const appointment1 = await appointmentService.scheduleAppointment({
        patientId: testPatientId,
        doctorId: testDoctorId,
        dateTime: '2024-01-15T10:00:00Z',
        status: 'scheduled'
      });

      const appointment2 = await appointmentService.scheduleAppointment({
        patientId: testPatientId,
        doctorId: testDoctorId,
        dateTime: '2024-01-16T14:00:00Z',
        status: 'completed'
      });

      const appointments = await appointmentService.getAppointmentsByDoctor(testDoctorId);

      expect(appointments).toHaveLength(2);
      expect(appointments.map(a => a.id)).toContain(appointment1.id);
      expect(appointments.map(a => a.id)).toContain(appointment2.id);
    });

    it('should return empty array for doctor with no appointments', async () => {
      const appointments = await appointmentService.getAppointmentsByDoctor('DOC-nonexistent-123');
      expect(appointments).toEqual([]);
    });
  });

  describe('updateAppointmentStatus', () => {
    it('should update appointment status successfully', async () => {
      const appointment = await appointmentService.scheduleAppointment({
        patientId: testPatientId,
        doctorId: testDoctorId,
        dateTime: '2024-01-15T10:00:00Z',
        status: 'scheduled'
      });

      const updatedAppointment = await appointmentService.updateAppointmentStatus(appointment.id, 'completed');

      expect(updatedAppointment.status).toBe('completed');
      expect(updatedAppointment.id).toBe(appointment.id);
      expect(updatedAppointment.patientId).toBe(appointment.patientId);
      expect(updatedAppointment.doctorId).toBe(appointment.doctorId);
    });

    it('should throw error for non-existent appointment', async () => {
      await expect(appointmentService.updateAppointmentStatus('APT-nonexistent-123', 'completed'))
        .rejects.toThrow('Appointment with ID APT-nonexistent-123 not found');
    });
  });

  describe('cancelAppointment', () => {
    it('should cancel appointment by setting status to cancelled', async () => {
      const appointment = await appointmentService.scheduleAppointment({
        patientId: testPatientId,
        doctorId: testDoctorId,
        dateTime: '2024-01-15T10:00:00Z',
        status: 'scheduled'
      });

      const cancelledAppointment = await appointmentService.cancelAppointment(appointment.id);

      expect(cancelledAppointment.status).toBe('cancelled');
      expect(cancelledAppointment.id).toBe(appointment.id);
    });

    it('should throw error for non-existent appointment', async () => {
      await expect(appointmentService.cancelAppointment('APT-nonexistent-123'))
        .rejects.toThrow('Appointment with ID APT-nonexistent-123 not found');
    });
  });
});