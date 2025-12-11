/**
 * Tests for ID generation utility
 * Requirements: 1.1, 2.1, 3.1, 4.1
 */

import { describe, it, expect } from 'vitest';
import * as fc from 'fast-check';
import { generateId, EntityType } from './idGenerator';

describe('ID Generator', () => {
  it('should generate IDs with correct prefix for patient', () => {
    const id = generateId('patient');
    expect(id).toMatch(/^PAT-\d+-[a-z0-9]+$/);
  });

  it('should generate IDs with correct prefix for doctor', () => {
    const id = generateId('doctor');
    expect(id).toMatch(/^DOC-\d+-[a-z0-9]+$/);
  });

  it('should generate IDs with correct prefix for appointment', () => {
    const id = generateId('appointment');
    expect(id).toMatch(/^APT-\d+-[a-z0-9]+$/);
  });

  it('should generate IDs with correct prefix for medical-record', () => {
    const id = generateId('medical-record');
    expect(id).toMatch(/^MED-\d+-[a-z0-9]+$/);
  });

  it('should generate unique IDs', () => {
    const ids = new Set<string>();
    for (let i = 0; i < 100; i++) {
      ids.add(generateId('patient'));
    }
    expect(ids.size).toBe(100);
  });

  /**
   * **Feature: hospital-management-system, Property 1: Unique ID generation**
   * **Validates: Requirements 1.1, 2.1, 3.1, 4.1**
   * 
   * Property: For any entity type (patient, doctor, appointment, medical record),
   * when multiple entities are created, each entity should receive a unique ID
   * that differs from all other entities of the same type.
   */
  it('property: generates unique IDs across multiple entities', () => {
    fc.assert(
      fc.property(
        fc.constantFrom<EntityType>('patient', 'doctor', 'appointment', 'medical-record'),
        fc.integer({ min: 10, max: 200 }),
        (entityType, count) => {
          // Generate multiple IDs for the same entity type
          const ids = new Set<string>();
          for (let i = 0; i < count; i++) {
            ids.add(generateId(entityType));
          }
          
          // All IDs should be unique (set size equals count)
          return ids.size === count;
        }
      ),
      { numRuns: 100 }
    );
  });
});
