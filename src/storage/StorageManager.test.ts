import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import * as fc from 'fast-check';
import { StorageManager } from './StorageManager';
import { Patient } from '../models/Patient';
import { Doctor } from '../models/Doctor';
import { Appointment } from '../models/Appointment';
import { MedicalRecord } from '../models/MedicalRecord';
import * as fs from 'fs/promises';
import * as path from 'path';

describe('StorageManager Property Tests', () => {
  const testDataDir = './test-data';
  let storage: StorageManager;

  beforeEach(async () => {
    storage = new StorageManager(testDataDir);
    await storage.initialize();
  });

  afterEach(async () => {
    // Clean up test data directory
    try {
      await fs.rm(testDataDir, { recursive: true, force: true });
    } catch (error) {
      // Ignore cleanup errors
    }
  });

  // Helper to generate valid IDs (no filesystem-invalid characters)
  const validIdArbitrary = fc.stringMatching(/^[a-zA-Z0-9_-]+$/);

  /**
   * **Feature: hospital-management-system, Property 2: Patient registration round-trip**
   * **Validates: Requirements 1.3**
   * 
   * For any valid patient data, registering the patient and then retrieving it by ID 
   * should return an equivalent patient object with all fields preserved.
   */
  it('Property 2: Patient persistence round-trip', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.record({
          id: validIdArbitrary,
          name: fc.string({ minLength: 1, maxLength: 100 }),
          dateOfBirth: fc.date().map(d => d.toISOString().split('T')[0]),
          contactNumber: fc.string({ minLength: 1, maxLength: 20 }),
          address: fc.string({ minLength: 1, maxLength: 200 }),
          email: fc.option(fc.emailAddress(), { nil: undefined }),
          createdAt: fc.date().map(d => d.toISOString())
        }),
        async (patient: Patient) => {
          // Save patient to storage
          await storage.save('patients', patient.id, patient);
          
          // Load patient from storage
          const loaded = await storage.load<Patient>('patients', patient.id);
          
          // Verify all fields are preserved
          expect(loaded).toEqual(patient);
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * **Feature: hospital-management-system, Property 3: Doctor registration round-trip**
   * **Validates: Requirements 2.3**
   * 
   * For any valid doctor data, registering the doctor and then retrieving it by ID 
   * should return an equivalent doctor object with all fields preserved.
   */
  it('Property 3: Doctor persistence round-trip', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.record({
          id: validIdArbitrary,
          name: fc.string({ minLength: 1, maxLength: 100 }),
          specialization: fc.string({ minLength: 1, maxLength: 100 }),
          contactNumber: fc.string({ minLength: 1, maxLength: 20 }),
          email: fc.option(fc.emailAddress(), { nil: undefined }),
          createdAt: fc.date().map(d => d.toISOString())
        }),
        async (doctor: Doctor) => {
          // Save doctor to storage
          await storage.save('doctors', doctor.id, doctor);
          
          // Load doctor from storage
          const loaded = await storage.load<Doctor>('doctors', doctor.id);
          
          // Verify all fields are preserved
          expect(loaded).toEqual(doctor);
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * **Feature: hospital-management-system, Property 4: Appointment persistence round-trip**
   * **Validates: Requirements 3.3**
   * 
   * For any valid appointment data with existing patient and doctor IDs, creating the 
   * appointment and then retrieving it should return an equivalent appointment object.
   */
  it('Property 4: Appointment persistence round-trip', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.record({
          id: validIdArbitrary,
          patientId: validIdArbitrary,
          doctorId: validIdArbitrary,
          dateTime: fc.date().map(d => d.toISOString()),
          status: fc.constantFrom('scheduled', 'completed', 'cancelled'),
          notes: fc.option(fc.string({ maxLength: 500 }), { nil: undefined }),
          createdAt: fc.date().map(d => d.toISOString())
        }),
        async (appointment: Appointment) => {
          // Save appointment to storage
          await storage.save('appointments', appointment.id, appointment);
          
          // Load appointment from storage
          const loaded = await storage.load<Appointment>('appointments', appointment.id);
          
          // Verify all fields are preserved
          expect(loaded).toEqual(appointment);
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * **Feature: hospital-management-system, Property 5: Medical record persistence round-trip**
   * **Validates: Requirements 4.3**
   * 
   * For any valid medical record data with existing patient ID, creating the record 
   * and then retrieving it should return an equivalent record object.
   */
  it('Property 5: Medical record persistence round-trip', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.record({
          id: validIdArbitrary,
          patientId: validIdArbitrary,
          doctorId: validIdArbitrary,
          diagnosis: fc.string({ minLength: 1, maxLength: 500 }),
          treatment: fc.string({ minLength: 1, maxLength: 500 }),
          notes: fc.string({ minLength: 1, maxLength: 1000 }),
          createdAt: fc.date().map(d => d.toISOString())
        }),
        async (record: MedicalRecord) => {
          // Save medical record to storage
          await storage.save('medical-records', record.id, record);
          
          // Load medical record from storage
          const loaded = await storage.load<MedicalRecord>('medical-records', record.id);
          
          // Verify all fields are preserved
          expect(loaded).toEqual(record);
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * **Feature: hospital-management-system, Property 17: Corrupted data handling**
   * **Validates: Requirements 8.4**
   * 
   * For any file containing invalid JSON, attempting to load it should not crash the system 
   * and should return an error or skip the corrupted file.
   */
  it('Property 17: Corrupted data handling', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.tuple(
          // Generate valid patients with unique IDs
          fc.uniqueArray(
            fc.record({
              id: validIdArbitrary,
              name: fc.string({ minLength: 1, maxLength: 100 }),
              dateOfBirth: fc.date().map(d => d.toISOString().split('T')[0]),
              contactNumber: fc.string({ minLength: 1, maxLength: 20 }),
              address: fc.string({ minLength: 1, maxLength: 200 }),
              email: fc.option(fc.emailAddress(), { nil: undefined }),
              createdAt: fc.date().map(d => d.toISOString())
            }),
            { minLength: 1, maxLength: 5, selector: (p) => p.id }
          ),
          // Generate corrupted JSON content (truly invalid JSON that will fail to parse)
          fc.oneof(
            fc.constant('{ invalid json'),
            fc.constant('not json at all'),
            fc.constant('{ "incomplete": '),
            fc.constant('{ "name": undefined }'),
            fc.constant('[1, 2, 3, }'),
            fc.constant('{ unclosed'),
            fc.constant('{]')
          )
        ),
        async ([validPatients, corruptedContent]) => {
          // Clean the patients directory before this iteration
          const patientsDir = path.join(testDataDir, 'patients');
          try {
            await fs.rm(patientsDir, { recursive: true, force: true });
            await fs.mkdir(patientsDir, { recursive: true });
          } catch (error) {
            // Ignore cleanup errors
          }
          
          // Save valid patients
          for (const patient of validPatients) {
            await storage.save('patients', patient.id, patient);
          }
          
          // Create a corrupted file in the same collection with a unique name
          const corruptedFilePath = path.join(testDataDir, 'patients', 'corrupted-test-file.json');
          await fs.writeFile(corruptedFilePath, corruptedContent, 'utf-8');
          
          // Attempt to load all patients - should not crash
          let loadedPatients: Patient[] = [];
          let errorThrown = false;
          
          try {
            loadedPatients = await storage.loadAll<Patient>('patients');
          } catch (error) {
            errorThrown = true;
          }
          
          // System should not crash (no error thrown)
          expect(errorThrown).toBe(false);
          
          // Should return only valid patients (corrupted file skipped)
          expect(loadedPatients.length).toBe(validPatients.length);
          
          // All valid patients should be present
          const loadedIds = loadedPatients.map(p => p.id).sort();
          const expectedIds = validPatients.map(p => p.id).sort();
          expect(loadedIds).toEqual(expectedIds);
        }
      ),
      { numRuns: 100 }
    );
  });
});
