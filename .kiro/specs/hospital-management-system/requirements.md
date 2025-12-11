# Requirements Document

## Introduction

The Hospital Management System is a comprehensive application designed to manage core hospital operations including patient records, doctor information, appointments, and medical records. The system stores all data in local files using JSON format, providing a lightweight solution without requiring a database server. The system enables hospital staff to efficiently track patients, manage appointments, maintain medical histories, and coordinate doctor schedules.

## Glossary

- **HMS**: The Hospital Management System application
- **Patient**: An individual receiving medical care at the hospital
- **Doctor**: A medical professional providing care to patients
- **Appointment**: A scheduled meeting between a patient and a doctor
- **Medical Record**: Documentation of a patient's medical history, diagnoses, and treatments
- **Patient ID**: A unique identifier assigned to each patient
- **Doctor ID**: A unique identifier assigned to each doctor
- **Appointment ID**: A unique identifier assigned to each appointment
- **File Storage**: The JSON-based file system used to persist data
- **Data Directory**: The root directory where all hospital data files are stored

## Requirements

### Requirement 1

**User Story:** As a hospital administrator, I want to register new patients in the system, so that I can maintain accurate patient records and track their medical history.

#### Acceptance Criteria

1. WHEN a user provides patient information (name, date of birth, contact details, address), THE HMS SHALL create a new patient record with a unique Patient ID
2. WHEN a patient is registered, THE HMS SHALL validate that all required fields (name, date of birth) are provided
3. WHEN a patient is registered, THE HMS SHALL persist the patient data to the File Storage immediately
4. WHEN a user attempts to register a patient with missing required fields, THE HMS SHALL reject the registration and provide clear error messages
5. WHEN a patient is successfully registered, THE HMS SHALL return the assigned Patient ID to the user

### Requirement 2

**User Story:** As a hospital administrator, I want to manage doctor information, so that I can track available medical staff and their specializations.

#### Acceptance Criteria

1. WHEN a user provides doctor information (name, specialization, contact details), THE HMS SHALL create a new doctor record with a unique Doctor ID
2. WHEN a doctor is registered, THE HMS SHALL validate that all required fields (name, specialization) are provided
3. WHEN a doctor is registered, THE HMS SHALL persist the doctor data to the File Storage immediately
4. WHEN a user retrieves doctor information, THE HMS SHALL return all stored doctor details including their specialization
5. WHEN a user updates doctor information, THE HMS SHALL modify the existing record and persist changes to File Storage

### Requirement 3

**User Story:** As a receptionist, I want to schedule appointments between patients and doctors, so that I can coordinate medical consultations efficiently.

#### Acceptance Criteria

1. WHEN a user schedules an appointment with valid Patient ID, Doctor ID, date, and time, THE HMS SHALL create a new appointment record with a unique Appointment ID
2. WHEN an appointment is scheduled, THE HMS SHALL validate that both the Patient ID and Doctor ID exist in the system
3. WHEN an appointment is scheduled, THE HMS SHALL persist the appointment data to the File Storage immediately
4. WHEN a user attempts to schedule an appointment with invalid Patient ID or Doctor ID, THE HMS SHALL reject the request and provide an error message
5. WHEN an appointment is created, THE HMS SHALL store the appointment status (scheduled, completed, cancelled)

### Requirement 4

**User Story:** As a doctor, I want to create and update medical records for patients, so that I can document diagnoses, treatments, and medical history.

#### Acceptance Criteria

1. WHEN a doctor creates a medical record with Patient ID, diagnosis, treatment, and notes, THE HMS SHALL create a new Medical Record entry
2. WHEN a medical record is created, THE HMS SHALL validate that the Patient ID exists in the system
3. WHEN a medical record is created, THE HMS SHALL persist the record to the File Storage immediately
4. WHEN a doctor retrieves a patient's medical history, THE HMS SHALL return all Medical Records associated with that Patient ID
5. WHEN a medical record is stored, THE HMS SHALL include a timestamp indicating when the record was created

### Requirement 5

**User Story:** As a hospital staff member, I want to search and retrieve patient information, so that I can quickly access patient details when needed.

#### Acceptance Criteria

1. WHEN a user searches for a patient by Patient ID, THE HMS SHALL return the complete patient record if it exists
2. WHEN a user searches for a patient by name, THE HMS SHALL return all patients whose names match the search criteria
3. WHEN a user searches for a non-existent patient, THE HMS SHALL return an empty result and indicate no match was found
4. WHEN a user retrieves patient information, THE HMS SHALL include all associated data (personal details, contact information)
5. WHEN multiple patients match search criteria, THE HMS SHALL return all matching records

### Requirement 6

**User Story:** As a hospital administrator, I want to view and manage appointments, so that I can track scheduled consultations and update their status.

#### Acceptance Criteria

1. WHEN a user retrieves appointments for a specific doctor, THE HMS SHALL return all appointments associated with that Doctor ID
2. WHEN a user retrieves appointments for a specific patient, THE HMS SHALL return all appointments associated with that Patient ID
3. WHEN a user updates an appointment status, THE HMS SHALL modify the appointment record and persist changes to File Storage
4. WHEN a user cancels an appointment, THE HMS SHALL update the appointment status to cancelled and persist the change
5. WHEN retrieving appointments, THE HMS SHALL include all appointment details (patient, doctor, date, time, status)

### Requirement 7

**User Story:** As a system administrator, I want the system to handle data persistence reliably, so that hospital data is not lost and can be recovered.

#### Acceptance Criteria

1. WHEN the HMS writes data to File Storage, THE HMS SHALL serialize all data structures to valid JSON format
2. WHEN the HMS reads data from File Storage, THE HMS SHALL deserialize JSON data back to application data structures
3. WHEN the HMS starts up, THE HMS SHALL load all existing data from the Data Directory
4. WHEN a file operation fails, THE HMS SHALL provide clear error messages indicating the nature of the failure
5. WHEN data is persisted, THE HMS SHALL ensure file writes are atomic to prevent data corruption

### Requirement 8

**User Story:** As a developer, I want the system to validate all data operations, so that data integrity is maintained throughout the application.

#### Acceptance Criteria

1. WHEN any data is written to storage, THE HMS SHALL validate that the data conforms to the expected schema
2. WHEN a user provides invalid data types, THE HMS SHALL reject the operation and provide validation error messages
3. WHEN referential integrity is violated (e.g., appointment references non-existent patient), THE HMS SHALL prevent the operation
4. WHEN data is loaded from files, THE HMS SHALL validate the JSON structure and handle corrupted data gracefully
5. WHEN validation fails, THE HMS SHALL maintain system state and not persist invalid data
