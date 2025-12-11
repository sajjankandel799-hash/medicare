import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { MedicalRecordService } from './MedicalRecordService';
import { StorageManager } from '../storage/StorageManager';
import { PatientService } from './PatientService';
import { DoctorService } from './DoctorService';
import * as fs from 'fs/promises';
import * as path from 'path';

describe('MedicalRecordService', () => {
  let medicalRecordService: MedicalRecordService;
  let patientService: PatientService;
  let doctorService: DoctorService;
  let storage: StorageManager;
  const testDataDir = './test-data-medical-records';

  beforeEach(async () => {
    storage = new StorageManager(testDataDir);
    await storage.initialize();
    
    medicalRecordService = new MedicalRecordService(storage);
    patientService = new PatientService(storage);
    doctorService = new DoctorService(storage);
  });

  afterEach(async () => {
    // Clean up test data directory
    try {
      await fs.rm(testDataDir, { recursive: true, force: true });
    } catch (error) {
      // Ignore cleanup errors
    }
  });

  describe('createRecord', () => {
    it('should create a medical record with valid data', async () => {
      // Create a patient and doctor first
      const patient = await patientService.registerPatient({
        name: 'John Doe',
        dateOfBirth: '1990-01-01',
        contactNumber: '123-456-7890',
        address: '123 Main St',
      });

      const doctor = await doctorService.registerDoctor({
        name: 'Dr. Smith',
        specialization: 'Cardiology',
        contactNumber: '098-765-4321',
      });

      const recordData = {
        patientId: patient.id,
        doctorId: doctor.id,
        diagnosis: 'Hypertension',
        treatment: 'Medication and lifestyle changes',
        notes: 'Patient should monitor blood pressure daily',
      };

      const record = await medicalRecordService.createRecord(recordData);

      expect(record.id).toBeDefined();
      expect(record.id).toMatch(/^MED-\d+-[a-z0-9]+$/);
      expect(record.patientId).toBe(patient.id);
      expect(record.doctorId).toBe(doctor.id);
      expect(record.diagnosis).toBe('Hypertension');
      expect(record.treatment).toBe('Medication and lifestyle changes');
      expect(record.notes).toBe('Patient should monitor blood pressure daily');
      expect(record.createdAt).toBeDefined();
      expect(new Date(record.createdAt)).toBeInstanceOf(Date);
    });

    it('should reject record creation with missing required fields', async () => {
      const incompleteData = {
        patientId: 'PAT-123',
        doctorId: 'DOC-456',
        diagnosis: 'Hypertension',
        // Missing treatment and notes
      } as any;

      await expect(medicalRecordService.createRecord(incompleteData))
        .rejects.toThrow('Missing required fields: treatment, notes');
    });

    it('should reject record creation with non-existent patient', async () => {
      const recordData = {
        patientId: 'NON-EXISTENT-PATIENT',
        doctorId: 'DOC-456',
        diagnosis: 'Hypertension',
        treatment: 'Medication',
        notes: 'Test notes',
      };

      await expect(medicalRecordService.createRecord(recordData))
        .rejects.toThrow('Patient with ID NON-EXISTENT-PATIENT does not exist');
    });

    it('should reject record creation with non-existent doctor', async () => {
      // Create a patient first
      const patient = await patientService.registerPatient({
        name: 'John Doe',
        dateOfBirth: '1990-01-01',
        contactNumber: '123-456-7890',
        address: '123 Main St',
      });

      const recordData = {
        patientId: patient.id,
        doctorId: 'NON-EXISTENT-DOCTOR',
        diagnosis: 'Hypertension',
        treatment: 'Medication',
        notes: 'Test notes',
      };

      await expect(medicalRecordService.createRecord(recordData))
        .rejects.toThrow('Doctor with ID NON-EXISTENT-DOCTOR does not exist');
    });
  });

  describe('getRecord', () => {
    it('should retrieve an existing medical record', async () => {
      // Create prerequisites
      const patient = await patientService.registerPatient({
        name: 'John Doe',
        dateOfBirth: '1990-01-01',
        contactNumber: '123-456-7890',
        address: '123 Main St',
      });

      const doctor = await doctorService.registerDoctor({
        name: 'Dr. Smith',
        specialization: 'Cardiology',
        contactNumber: '098-765-4321',
      });

      const createdRecord = await medicalRecordService.createRecord({
        patientId: patient.id,
        doctorId: doctor.id,
        diagnosis: 'Hypertension',
        treatment: 'Medication',
        notes: 'Test notes',
      });

      const retrievedRecord = await medicalRecordService.getRecord(createdRecord.id);

      expect(retrievedRecord).toEqual(createdRecord);
    });

    it('should return null for non-existent record', async () => {
      const record = await medicalRecordService.getRecord('NON-EXISTENT-ID');
      expect(record).toBeNull();
    });
  });

  describe('getPatientRecords', () => {
    it('should retrieve all records for a specific patient', async () => {
      // Create prerequisites
      const patient = await patientService.registerPatient({
        name: 'John Doe',
        dateOfBirth: '1990-01-01',
        contactNumber: '123-456-7890',
        address: '123 Main St',
      });

      const doctor = await doctorService.registerDoctor({
        name: 'Dr. Smith',
        specialization: 'Cardiology',
        contactNumber: '098-765-4321',
      });

      // Create multiple records for the same patient
      const record1 = await medicalRecordService.createRecord({
        patientId: patient.id,
        doctorId: doctor.id,
        diagnosis: 'Hypertension',
        treatment: 'Medication',
        notes: 'First visit',
      });

      const record2 = await medicalRecordService.createRecord({
        patientId: patient.id,
        doctorId: doctor.id,
        diagnosis: 'Follow-up',
        treatment: 'Continue medication',
        notes: 'Second visit',
      });

      const patientRecords = await medicalRecordService.getPatientRecords(patient.id);

      expect(patientRecords).toHaveLength(2);
      expect(patientRecords).toContainEqual(record1);
      expect(patientRecords).toContainEqual(record2);
    });

    it('should return empty array for patient with no records', async () => {
      const records = await medicalRecordService.getPatientRecords('NON-EXISTENT-PATIENT');
      expect(records).toEqual([]);
    });
  });
});