/**
 * ID Generation utility for creating unique identifiers for entities
 * Requirements: 1.1, 2.1, 3.1, 4.1
 */

/**
 * Entity types supported by the ID generator
 */
export type EntityType = 'patient' | 'doctor' | 'appointment' | 'medical-record';

/**
 * Prefix mapping for each entity type
 */
const ENTITY_PREFIXES: Record<EntityType, string> = {
  'patient': 'PAT',
  'doctor': 'DOC',
  'appointment': 'APT',
  'medical-record': 'MED',
};

/**
 * Generates a unique ID for the specified entity type
 * Format: {PREFIX}-{timestamp}-{random}
 * 
 * @param entityType - The type of entity to generate an ID for
 * @returns A unique identifier string
 * 
 * @example
 * generateId('patient') // Returns: "PAT-1234567890123-a1b2c3"
 */
export function generateId(entityType: EntityType): string {
  const prefix = ENTITY_PREFIXES[entityType];
  const timestamp = Date.now();
  const random = Math.random().toString(36).substring(2, 8);
  
  return `${prefix}-${timestamp}-${random}`;
}
