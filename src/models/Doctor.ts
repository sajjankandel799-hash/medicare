/**
 * Doctor entity representing a medical professional providing care to patients
 * Requirements: 2.1, 2.2, 2.3, 2.4, 2.5
 */
export interface Doctor {
  /** Unique doctor identifier */
  id: string;
  /** Doctor full name */
  name: string;
  /** Medical specialization */
  specialization: string;
  /** Phone number */
  contactNumber: string;
  /** Optional email */
  email?: string;
  /** ISO 8601 timestamp when doctor was registered */
  createdAt: string;
}
