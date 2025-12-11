import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { DoctorService } from './DoctorService';
import { StorageManager } from '../storage/StorageManager';
import { Doctor } from '../models/Doctor';
import * as fs from 'fs/promises';
import * as path from 'path';

describe('DoctorService', () => {
  let doctorService: DoctorService;
  let storage: StorageManager;
  const testDataDir = './test-data-doctors';

  beforeEach(async () => {
    storage = new StorageManager(testDataDir);
    await storage.initialize();
    doctorService = new DoctorService(storage);
  });

  afterEach(async () => {
    // Clean up test data
    try {
      await fs.rm(testDataDir, { recursive: true, force: true });
    } catch (error) {
      // Ignore cleanup errors
    }
  });

  describe('registerDoctor', () => {
    it('should register a new doctor with valid data', async () => {
      const doctorData = {
        name: 'Dr. John Smith',
        specialization: 'Cardiology',
        contactNumber: '+1-555-0123',
        email: 'john.smith@hospital.com',
      };

      const doctor = await doctorService.registerDoctor(doctorData);

      expect(doctor.id).toMatch(/^DOC-\d+-[a-z0-9]+$/);
      expect(doctor.name).toBe(doctorData.name);
      expect(doctor.specialization).toBe(doctorData.specialization);
      expect(doctor.contactNumber).toBe(doctorData.contactNumber);
      expect(doctor.email).toBe(doctorData.email);
      expect(doctor.createdAt).toBeDefined();
      expect(new Date(doctor.createdAt)).toBeInstanceOf(Date);
    });

    it('should register a doctor without optional email', async () => {
      const doctorData = {
        name: 'Dr. Jane Doe',
        specialization: 'Neurology',
        contactNumber: '+1-555-0456',
      };

      const doctor = await doctorService.registerDoctor(doctorData);

      expect(doctor.id).toMatch(/^DOC-\d+-[a-z0-9]+$/);
      expect(doctor.name).toBe(doctorData.name);
      expect(doctor.specialization).toBe(doctorData.specialization);
      expect(doctor.contactNumber).toBe(doctorData.contactNumber);
      expect(doctor.email).toBeUndefined();
    });

    it('should throw error when required fields are missing', async () => {
      const invalidData = {
        name: 'Dr. Test',
        // Missing specialization and contactNumber
      } as any;

      await expect(doctorService.registerDoctor(invalidData))
        .rejects.toThrow('Missing required fields: specialization, contactNumber');
    });

    it('should throw error when required fields are empty strings', async () => {
      const invalidData = {
        name: '',
        specialization: 'Cardiology',
        contactNumber: '+1-555-0123',
      };

      await expect(doctorService.registerDoctor(invalidData))
        .rejects.toThrow('Missing required fields: name');
    });
  });

  describe('getDoctor', () => {
    it('should retrieve an existing doctor', async () => {
      const doctorData = {
        name: 'Dr. Alice Johnson',
        specialization: 'Pediatrics',
        contactNumber: '+1-555-0789',
      };

      const createdDoctor = await doctorService.registerDoctor(doctorData);
      const retrievedDoctor = await doctorService.getDoctor(createdDoctor.id);

      expect(retrievedDoctor).toEqual(createdDoctor);
    });

    it('should return null for non-existent doctor', async () => {
      const result = await doctorService.getDoctor('DOC-nonexistent-id');
      expect(result).toBeNull();
    });
  });

  describe('updateDoctor', () => {
    it('should update existing doctor information', async () => {
      const doctorData = {
        name: 'Dr. Bob Wilson',
        specialization: 'Orthopedics',
        contactNumber: '+1-555-1111',
      };

      const createdDoctor = await doctorService.registerDoctor(doctorData);
      
      const updateData = {
        specialization: 'Sports Medicine',
        email: 'bob.wilson@hospital.com',
      };

      const updatedDoctor = await doctorService.updateDoctor(createdDoctor.id, updateData);

      expect(updatedDoctor.id).toBe(createdDoctor.id);
      expect(updatedDoctor.name).toBe(createdDoctor.name);
      expect(updatedDoctor.specialization).toBe(updateData.specialization);
      expect(updatedDoctor.contactNumber).toBe(createdDoctor.contactNumber);
      expect(updatedDoctor.email).toBe(updateData.email);
      expect(updatedDoctor.createdAt).toBe(createdDoctor.createdAt);
    });

    it('should throw error when updating non-existent doctor', async () => {
      const updateData = { specialization: 'New Specialty' };

      await expect(doctorService.updateDoctor('DOC-nonexistent-id', updateData))
        .rejects.toThrow('Doctor with ID DOC-nonexistent-id not found');
    });
  });

  describe('getAllDoctors', () => {
    it('should return empty array when no doctors exist', async () => {
      const doctors = await doctorService.getAllDoctors();
      expect(doctors).toEqual([]);
    });

    it('should return all registered doctors', async () => {
      const doctor1Data = {
        name: 'Dr. First',
        specialization: 'Cardiology',
        contactNumber: '+1-555-0001',
      };

      const doctor2Data = {
        name: 'Dr. Second',
        specialization: 'Neurology',
        contactNumber: '+1-555-0002',
      };

      const createdDoctor1 = await doctorService.registerDoctor(doctor1Data);
      const createdDoctor2 = await doctorService.registerDoctor(doctor2Data);

      const allDoctors = await doctorService.getAllDoctors();

      expect(allDoctors).toHaveLength(2);
      expect(allDoctors).toContainEqual(createdDoctor1);
      expect(allDoctors).toContainEqual(createdDoctor2);
    });
  });
});