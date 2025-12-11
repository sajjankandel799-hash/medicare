/**
 * Authentication Service for Hospital Management System
 * Handles login/logout for both patients and doctors
 */
import { StorageManager } from '../storage/StorageManager';
import { Patient } from '../models/Patient';
import { Doctor } from '../models/Doctor';
export interface LoginCredentials {
    email: string;
    password: string;
    userType: 'patient' | 'doctor' | 'admin';
}
export interface AuthUser {
    id: string;
    email: string;
    name: string;
    userType: 'patient' | 'doctor' | 'admin';
    specialization?: string;
}
export interface AuthResponse {
    success: boolean;
    user?: AuthUser;
    token?: string;
    message?: string;
}
export declare class AuthService {
    private storage;
    private jwtSecret;
    constructor(storage: StorageManager);
    /**
     * Register a new patient with login credentials
     */
    registerPatient(patientData: Omit<Patient, 'id' | 'createdAt'> & {
        password: string;
        email: string;
    }): Promise<AuthResponse>;
    /**
     * Register a new doctor with login credentials
     */
    registerDoctor(doctorData: Omit<Doctor, 'id' | 'createdAt'> & {
        password: string;
        email: string;
    }): Promise<AuthResponse>;
    /**
     * Login user (patient, doctor, or admin)
     */
    login(credentials: LoginCredentials): Promise<AuthResponse>;
    /**
     * Handle admin login with hardcoded credentials
     */
    private handleAdminLogin;
    /**
     * Verify JWT token
     */
    verifyToken(token: string): AuthUser | null;
    /**
     * Generate JWT token
     */
    private generateToken;
    /**
     * Generate unique ID
     */
    private generateId;
}
//# sourceMappingURL=AuthService.d.ts.map