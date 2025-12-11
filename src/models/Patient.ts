/**
 * Patient entity representing an individual receiving medical care at the hospital
 * Requirements: 1.1, 1.2, 1.3, 1.4, 1.5
 */
export interface Patient {
  /** Unique patient identifier */
  id: string;
  /** Patient full name */
  name: string;
  /** Date of birth in ISO 8601 date format */
  dateOfBirth: string;
  /** Phone number */
  contactNumber: string;
  /** Physical address */
  address: string;
  /** Optional email */
  email?: string;
  /** ISO 8601 timestamp when patient was registered */
  createdAt: string;
}
