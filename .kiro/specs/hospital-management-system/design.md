# Design Document

## Overview

The Hospital Management System (HMS) is a file-based application that manages hospital operations including patient registration, doctor management, appointment scheduling, and medical records. The system uses JSON files for data persistence, providing a lightweight solution without database dependencies. The architecture follows a layered approach with clear separation between data models, storage operations, business logic, and user interface.

## Architecture

The system follows a three-tier architecture:

1. **Data Layer**: Handles file I/O operations and JSON serialization/deserialization
2. **Business Logic Layer**: Implements core hospital management operations and validation
3. **Presentation Layer**: Provides user interface for interacting with the system

```
┌─────────────────────────────────┐
│     Presentation Layer          │
│   (CLI/API Interface)           │
└────────────┬────────────────────┘
             │
┌────────────▼────────────────────┐
│    Business Logic Layer         │
│  (Services & Validation)        │
└────────────┬────────────────────┘
             │
┌────────────▼────────────────────┐
│       Data Layer                │
│  (File Storage & JSON)          │
└─────────────────────────────────┘
```

## Components and Interfaces

### Data Models

**Patient**
```typescript
interface Patient {
  id: string;              // Unique patient identifier
  name: string;            // Patient full name
  dateOfBirth: string;     // ISO 8601 date format
  contactNumber: string;   // Phone number
  address: string;         // Physical address
  email?: string;          // Optional email
  createdAt: string;       // ISO 8601 timestamp
}
```

**Doctor**
```typescript
interface Doctor {
  id: string;              // Unique doctor identifier
  name: string;            // Doctor full name
  specialization: string;  // Medical specialization
  contactNumber: string;   // Phone number
  email?: string;          // Optional email
  createdAt: string;       // ISO 8601 timestamp
}
```

**Appointment**
```typescript
interface Appointment {
  id: string;              // Unique appointment identifier
  patientId: string;       // Reference to patient
  doctorId: string;        // Reference to doctor
  dateTime: string;        // ISO 8601 datetime
  status: 'scheduled' | 'completed' | 'cancelled';
  notes?: string;          // Optional appointment notes
  createdAt: string;       // ISO 8601 timestamp
}
```

**MedicalRecord**
```typescript
interface MedicalRecord {
  id: string;              // Unique record identifier
  patientId: string;       // Reference to patient
  doctorId: string;        // Reference to doctor who created record
  diagnosis: string;       // Medical diagnosis
  treatment: string;       // Prescribed treatment
  notes: string;           // Additional medical notes
  createdAt: string;       // ISO 8601 timestamp
}
```

### Storage Interface

```typescript
interface StorageManager {
  // Generic CRUD operations
  save<T>(collection: string, id: string, data: T): Promise<void>;
  load<T>(collection: string, id: string): Promise<T | null>;
  loadAll<T>(collection: string): Promise<T[]>;
  delete(collection: string, id: string): Promise<void>;
  exists(collection: string, id: string): Promise<boolean>;
}
```

### Service Interfaces

```typescript
interface PatientService {
  registerPatient(data: Omit<Patient, 'id' | 'createdAt'>): Promise<Patient>;
  getPatient(id: string): Promise<Patient | null>;
  searchPatientsByName(name: string): Promise<Patient[]>;
  updatePatient(id: string, data: Partial<Patient>): Promise<Patient>;
}

interface DoctorService {
  registerDoctor(data: Omit<Doctor, 'id' | 'createdAt'>): Promise<Doctor>;
  getDoctor(id: string): Promise<Doctor | null>;
  updateDoctor(id: string, data: Partial<Doctor>): Promise<Doctor>;
  getAllDoctors(): Promise<Doctor[]>;
}

interface AppointmentService {
  scheduleAppointment(data: Omit<Appointment, 'id' | 'createdAt'>): Promise<Appointment>;
  getAppointment(id: string): Promise<Appointment | null>;
  getAppointmentsByPatient(patientId: string): Promise<Appointment[]>;
  getAppointmentsByDoctor(doctorId: string): Promise<Appointment[]>;
  updateAppointmentStatus(id: string, status: Appointment['status']): Promise<Appointment>;
  cancelAppointment(id: string): Promise<Appointment>;
}

interface MedicalRecordService {
  createRecord(data: Omit<MedicalRecord, 'id' | 'createdAt'>): Promise<MedicalRecord>;
  getPatientRecords(patientId: string): Promise<MedicalRecord[]>;
  getRecord(id: string): Promise<MedicalRecord | null>;
}
```

## Data Models

### File Storage Structure

```
data/
├── patients/
│   ├── patient-001.json
│   ├── patient-002.json
│   └── ...
├── doctors/
│   ├── doctor-001.json
│   ├── doctor-002.json
│   └── ...
├── appointments/
│   ├── appointment-001.json
│   ├── appointment-002.json
│   └── ...
└── medical-records/
    ├── record-001.json
    ├── record-002.json
    └── ...
```

Each JSON file contains a single entity serialized in JSON format. The file name corresponds to the entity's ID.

### ID Generation

IDs are generated using a combination of entity type prefix and timestamp-based unique identifier:
- Patients: `PAT-{timestamp}-{random}`
- Doctors: `DOC-{timestamp}-{random}`
- Appointments: `APT-{timestamp}-{random}`
- Medical Records: `MED-{timestamp}-{random}`


## Correctness Properties

*A property is a characteristic or behavior that should hold true across all valid executions of a system-essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees.*

### Property 1: Unique ID generation
*For any* entity type (patient, doctor, appointment, medical record), when multiple entities are created, each entity should receive a unique ID that differs from all other entities of the same type.
**Validates: Requirements 1.1, 2.1, 3.1, 4.1**

### Property 2: Patient registration round-trip
*For any* valid patient data, registering the patient and then retrieving it by ID should return an equivalent patient object with all fields preserved.
**Validates: Requirements 1.3**

### Property 3: Doctor registration round-trip
*For any* valid doctor data, registering the doctor and then retrieving it by ID should return an equivalent doctor object with all fields preserved.
**Validates: Requirements 2.3**

### Property 4: Appointment persistence round-trip
*For any* valid appointment data with existing patient and doctor IDs, creating the appointment and then retrieving it should return an equivalent appointment object.
**Validates: Requirements 3.3**

### Property 5: Medical record persistence round-trip
*For any* valid medical record data with existing patient ID, creating the record and then retrieving it should return an equivalent record object.
**Validates: Requirements 4.3**

### Property 6: Required field validation
*For any* entity type, attempting to create an entity with missing required fields should be rejected and return a validation error.
**Validates: Requirements 1.2, 1.4, 2.2**

### Property 7: Referential integrity enforcement
*For any* appointment or medical record, attempting to create it with a non-existent patient ID or doctor ID should be rejected with an error.
**Validates: Requirements 3.2, 3.4, 4.2, 8.3**

### Property 8: Search returns all matches
*For any* collection of patients with the same name substring, searching by that name should return all patients whose names contain that substring.
**Validates: Requirements 5.2, 5.5**

### Property 9: Filter returns all matching appointments
*For any* set of appointments, filtering by a specific patient ID or doctor ID should return all and only appointments that reference that ID.
**Validates: Requirements 6.1, 6.2**

### Property 10: Update persistence
*For any* existing entity, updating one or more fields and then retrieving the entity should reflect all the updated values.
**Validates: Requirements 2.5, 6.3**

### Property 11: Status update correctness
*For any* appointment, updating its status to a valid value (scheduled, completed, cancelled) should persist that exact status value.
**Validates: Requirements 3.5, 6.4**

### Property 12: Medical history completeness
*For any* patient with multiple medical records, retrieving the patient's medical history should return all records associated with that patient ID.
**Validates: Requirements 4.4**

### Property 13: Timestamp generation
*For any* newly created entity, the createdAt field should contain a valid ISO 8601 timestamp that represents a time not in the future.
**Validates: Requirements 4.5**

### Property 14: Complete data retrieval
*For any* entity retrieved by ID, all fields defined in the entity's interface should be present in the returned object.
**Validates: Requirements 2.4, 5.4, 6.5**

### Property 15: System initialization loads all data
*For any* set of entities persisted to storage, restarting the system and loading data should make all previously persisted entities accessible.
**Validates: Requirements 7.3**

### Property 16: Invalid data rejection
*For any* data that violates the expected schema or type constraints, attempting to persist it should be rejected with a validation error.
**Validates: Requirements 8.1, 8.2**

### Property 17: Corrupted data handling
*For any* file containing invalid JSON, attempting to load it should not crash the system and should return an error or skip the corrupted file.
**Validates: Requirements 8.4**

### Property 18: Failed operation state preservation
*For any* operation that fails validation, the system state should remain unchanged and no partial data should be persisted.
**Validates: Requirements 8.5**

## Error Handling

### Validation Errors
- Missing required fields: Return descriptive error indicating which fields are missing
- Invalid data types: Return error specifying expected vs actual type
- Invalid references: Return error indicating which entity ID does not exist
- Schema violations: Return error describing the schema constraint that was violated

### Storage Errors
- File read failures: Log error and return null or empty array depending on operation
- File write failures: Throw error to prevent data loss, do not silently fail
- JSON parse errors: Log warning, skip corrupted file, continue with other files
- Directory access errors: Throw error during initialization if data directory is inaccessible

### Error Response Format
```typescript
interface ErrorResponse {
  success: false;
  error: {
    code: string;        // Error code (e.g., 'VALIDATION_ERROR', 'NOT_FOUND')
    message: string;     // Human-readable error message
    details?: any;       // Additional error context
  }
}
```

## Testing Strategy

### Unit Testing
The system will use unit tests to verify:
- Individual validation functions work correctly for specific inputs
- ID generation produces expected format
- Error handling returns appropriate error messages
- Edge cases like empty strings, null values, boundary dates
- File operations handle specific error conditions

### Property-Based Testing
The system will use property-based testing to verify universal correctness properties across many randomly generated inputs. We will use **fast-check** (for TypeScript/JavaScript) as the property-based testing library.

**Configuration:**
- Each property test should run a minimum of 100 iterations
- Each property test must include a comment tag in this format: `**Feature: hospital-management-system, Property {number}: {property_text}**`
- Each correctness property listed above must be implemented as a single property-based test

**Property Test Coverage:**
- Round-trip properties for all entity types (serialization/deserialization)
- Unique ID generation across multiple entities
- Referential integrity enforcement
- Search and filter operations return complete result sets
- Update operations persist correctly
- Validation rejects invalid inputs consistently
- System state remains consistent after failed operations

**Test Organization:**
- Co-locate tests with source files using `.test.ts` suffix
- Group related property tests together
- Use descriptive test names that reference the property number

### Integration Testing
- Test complete workflows (register patient → schedule appointment → create medical record)
- Verify data persists across system restarts
- Test concurrent operations if applicable
- Verify file system interactions work correctly

### Test Data Generation
Property tests will use generators for:
- Random valid patient/doctor/appointment/medical record data
- Random invalid data (missing fields, wrong types)
- Random search queries and filters
- Edge cases (empty strings, very long strings, special characters)
