import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { PatientService } from './PatientService';
import { StorageManager } from '../storage/StorageManager';
import { Patient } from '../models/Patient';
import * as fs from 'fs/promises';

describe('PatientService', () => {
  let patientService: PatientService;
  let storage: StorageManager;
  const testDataDir = './test-data-patient-service';

  beforeEach(async () => {
    storage = new StorageManager(testDataDir);
    await storage.initialize();
    patientService = new PatientService(storage);
  });

  afterEach(async () => {
    // Clean up test data
    try {
      await fs.rm(testDataDir, { recursive: true, force: true });
    } catch (error) {
      // Ignore cleanup errors
    }
  });

  describe('registerPatient', () => {
    it('should register a new patient with all required fields', async () => {
      const patientData = {
        name: 'John Doe',
        dateOfBirth: '1990-01-15',
        contactNumber: '555-1234',
        address: '123 Main St',
      };

      const patient = await patientService.registerPatient(patientData);

      expect(patient.id).toBeDefined();
      expect(patient.id).toMatch(/^PAT-/);
      expect(patient.name).toBe(patientData.name);
      expect(patient.dateOfBirth).toBe(patientData.dateOfBirth);
      expect(patient.contactNumber).toBe(patientData.contactNumber);
      expect(patient.address).toBe(patientData.address);
      expect(patient.createdAt).toBeDefined();
    });

    it('should register a patient with optional email', async () => {
      const patientData = {
        name: 'Jane Smith',
        dateOfBirth: '1985-05-20',
        contactNumber: '555-5678',
        address: '456 Oak Ave',
        email: 'jane@example.com',
      };

      const patient = await patientService.registerPatient(patientData);

      expect(patient.email).toBe(patientData.email);
    });

    it('should reject registration with missing name', async () => {
      const patientData = {
        name: '',
        dateOfBirth: '1990-01-15',
        contactNumber: '555-1234',
        address: '123 Main St',
      };

      await expect(patientService.registerPatient(patientData)).rejects.toThrow(
        'Missing required fields for Patient: name'
      );
    });

    it('should reject registration with missing dateOfBirth', async () => {
      const patientData = {
        name: 'John Doe',
        dateOfBirth: '',
        contactNumber: '555-1234',
        address: '123 Main St',
      };

      await expect(patientService.registerPatient(patientData)).rejects.toThrow(
        'Missing required fields for Patient: dateOfBirth'
      );
    });

    it('should reject registration with multiple missing fields', async () => {
      const patientData = {
        name: '',
        dateOfBirth: '',
        contactNumber: '555-1234',
        address: '',
      };

      await expect(patientService.registerPatient(patientData)).rejects.toThrow(
        'Missing required fields'
      );
    });
  });

  describe('getPatient', () => {
    it('should retrieve an existing patient by ID', async () => {
      const patientData = {
        name: 'John Doe',
        dateOfBirth: '1990-01-15',
        contactNumber: '555-1234',
        address: '123 Main St',
      };

      const registered = await patientService.registerPatient(patientData);
      const retrieved = await patientService.getPatient(registered.id);

      expect(retrieved).not.toBeNull();
      expect(retrieved?.id).toBe(registered.id);
      expect(retrieved?.name).toBe(patientData.name);
    });

    it('should return null for non-existent patient', async () => {
      const result = await patientService.getPatient('PAT-nonexistent');
      expect(result).toBeNull();
    });
  });

  describe('searchPatientsByName', () => {
    beforeEach(async () => {
      // Register multiple patients
      await patientService.registerPatient({
        name: 'John Doe',
        dateOfBirth: '1990-01-15',
        contactNumber: '555-1234',
        address: '123 Main St',
      });
      await patientService.registerPatient({
        name: 'Jane Doe',
        dateOfBirth: '1992-03-20',
        contactNumber: '555-5678',
        address: '456 Oak Ave',
      });
      await patientService.registerPatient({
        name: 'Bob Smith',
        dateOfBirth: '1985-07-10',
        contactNumber: '555-9999',
        address: '789 Pine Rd',
      });
    });

    it('should find patients by exact name', async () => {
      const results = await patientService.searchPatientsByName('John Doe');
      expect(results).toHaveLength(1);
      expect(results[0].name).toBe('John Doe');
    });

    it('should find patients by partial name (case-insensitive)', async () => {
      const results = await patientService.searchPatientsByName('doe');
      expect(results).toHaveLength(2);
      expect(results.some(p => p.name === 'John Doe')).toBe(true);
      expect(results.some(p => p.name === 'Jane Doe')).toBe(true);
    });

    it('should return empty array for no matches', async () => {
      const results = await patientService.searchPatientsByName('Nonexistent');
      expect(results).toHaveLength(0);
    });

    it('should return empty array for empty search term', async () => {
      const results = await patientService.searchPatientsByName('');
      expect(results).toHaveLength(0);
    });
  });

  describe('updatePatient', () => {
    it('should update patient information', async () => {
      const patientData = {
        name: 'John Doe',
        dateOfBirth: '1990-01-15',
        contactNumber: '555-1234',
        address: '123 Main St',
      };

      const registered = await patientService.registerPatient(patientData);
      
      const updated = await patientService.updatePatient(registered.id, {
        contactNumber: '555-9999',
        email: 'john.updated@example.com',
      });

      expect(updated.id).toBe(registered.id);
      expect(updated.contactNumber).toBe('555-9999');
      expect(updated.email).toBe('john.updated@example.com');
      expect(updated.name).toBe(patientData.name); // Unchanged
      expect(updated.createdAt).toBe(registered.createdAt); // Preserved
    });

    it('should throw error when updating non-existent patient', async () => {
      await expect(
        patientService.updatePatient('PAT-nonexistent', { contactNumber: '555-0000' })
      ).rejects.toThrow('Patient with ID \'PAT-nonexistent\' not found');
    });

    it('should reject update that removes required fields', async () => {
      const patientData = {
        name: 'John Doe',
        dateOfBirth: '1990-01-15',
        contactNumber: '555-1234',
        address: '123 Main St',
      };

      const registered = await patientService.registerPatient(patientData);
      
      await expect(
        patientService.updatePatient(registered.id, { name: '' } as any)
      ).rejects.toThrow('Patient name must be a non-empty string');
    });
  });
});
