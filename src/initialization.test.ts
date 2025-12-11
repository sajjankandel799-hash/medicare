import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import * as fs from 'fs/promises';
import * as path from 'path';
import { initializeSystem, shutdownSystem } from './initialization';

describe('System Initialization', () => {
  const testDataDir = './test-data-init';

  beforeEach(async () => {
    // Clean up test directory before each test
    try {
      await fs.rm(testDataDir, { recursive: true, force: true });
    } catch {
      // Directory might not exist, ignore error
    }
  });

  afterEach(async () => {
    // Clean up test directory after each test
    try {
      await fs.rm(testDataDir, { recursive: true, force: true });
    } catch {
      // Directory might not exist, ignore error
    }
  });

  it('should initialize system successfully with empty data directory', async () => {
    const services = await initializeSystem(testDataDir);

    expect(services).toBeDefined();
    expect(services.storageManager).toBeDefined();
    expect(services.patientService).toBeDefined();
    expect(services.doctorService).toBeDefined();
    expect(services.appointmentService).toBeDefined();
    expect(services.medicalRecordService).toBeDefined();

    // Verify data directories were created
    const collections = ['patients', 'doctors', 'appointments', 'medical-records'];
    for (const collection of collections) {
      const collectionPath = path.join(testDataDir, collection);
      const stats = await fs.stat(collectionPath);
      expect(stats.isDirectory()).toBe(true);
    }
  });

  it('should handle existing data directory gracefully', async () => {
    // Create data directory first
    await fs.mkdir(testDataDir, { recursive: true });
    await fs.mkdir(path.join(testDataDir, 'patients'), { recursive: true });

    // Should not throw error when directory already exists
    const services = await initializeSystem(testDataDir);
    expect(services).toBeDefined();
  });

  it('should load existing data during initialization', async () => {
    // Create test data directory and add some test data
    await fs.mkdir(path.join(testDataDir, 'patients'), { recursive: true });
    await fs.mkdir(path.join(testDataDir, 'doctors'), { recursive: true });

    const testPatient = {
      id: 'PAT-001',
      name: 'Test Patient',
      dateOfBirth: '1990-01-01',
      contactNumber: '123-456-7890',
      address: '123 Test St',
      createdAt: new Date().toISOString()
    };

    const testDoctor = {
      id: 'DOC-001',
      name: 'Dr. Test',
      specialization: 'General Medicine',
      contactNumber: '098-765-4321',
      createdAt: new Date().toISOString()
    };

    await fs.writeFile(
      path.join(testDataDir, 'patients', 'PAT-001.json'),
      JSON.stringify(testPatient, null, 2)
    );

    await fs.writeFile(
      path.join(testDataDir, 'doctors', 'DOC-001.json'),
      JSON.stringify(testDoctor, null, 2)
    );

    // Initialize system - should load existing data
    const services = await initializeSystem(testDataDir);
    expect(services).toBeDefined();

    // Verify data can be retrieved
    const loadedPatient = await services.patientService.getPatient('PAT-001');
    const loadedDoctor = await services.doctorService.getDoctor('DOC-001');

    expect(loadedPatient).toEqual(testPatient);
    expect(loadedDoctor).toEqual(testDoctor);
  });

  it('should handle corrupted data files gracefully', async () => {
    // Create test data directory with corrupted file
    await fs.mkdir(path.join(testDataDir, 'patients'), { recursive: true });
    
    // Write invalid JSON
    await fs.writeFile(
      path.join(testDataDir, 'patients', 'corrupted.json'),
      'invalid json content'
    );

    // Should not throw error, should skip corrupted file
    const services = await initializeSystem(testDataDir);
    expect(services).toBeDefined();
  });

  it('should throw error if data directory cannot be created', async () => {
    // Try to create directory in a location that should fail (using a file as parent)
    const testFile = path.join(testDataDir, 'test-file.txt');
    await fs.mkdir(path.dirname(testFile), { recursive: true });
    await fs.writeFile(testFile, 'test content');
    
    // Try to create a directory where a file already exists
    const invalidPath = testFile;
    
    await expect(initializeSystem(invalidPath)).rejects.toThrow('EEXIST: file already exists');
  });

  it('should shutdown system gracefully', async () => {
    await expect(shutdownSystem()).resolves.not.toThrow();
  });
});