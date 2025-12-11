/**
 * MedicalRecord entity representing documentation of a patient's medical history
 * Requirements: 4.1, 4.2, 4.3, 4.4, 4.5
 */
export interface MedicalRecord {
  /** Unique record identifier */
  id: string;
  /** Reference to patient */
  patientId: string;
  /** Reference to doctor who created record */
  doctorId: string;
  /** Medical diagnosis */
  diagnosis: string;
  /** Prescribed treatment */
  treatment: string;
  /** Additional medical notes */
  notes: string;
  /** ISO 8601 timestamp when record was created */
  createdAt: string;
}
