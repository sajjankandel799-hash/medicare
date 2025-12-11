/**
 * Authentication Service for Hospital Management System
 * Handles login/logout for both patients and doctors
 */

import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { StorageManager } from '../storage/StorageManager';
import { Patient } from '../models/Patient';
import { Doctor } from '../models/Doctor';
import { logger, ErrorHandler, AppError, ErrorCode } from '../utils';

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
  specialization?: string; // Only for doctors
}

export interface AuthResponse {
  success: boolean;
  user?: AuthUser;
  token?: string;
  message?: string;
}

export class AuthService {
  private storage: StorageManager;
  private jwtSecret: string;

  constructor(storage: StorageManager) {
    this.storage = storage;
    this.jwtSecret = process.env.JWT_SECRET || 'hospital-management-secret-key';
  }

  /**
   * Register a new patient with login credentials
   */
  async registerPatient(patientData: Omit<Patient, 'id' | 'createdAt'> & { password: string; email: string }): Promise<AuthResponse> {
    return ErrorHandler.wrapAsync('auth-register-patient', async () => {
      logger.info('auth-register-patient', 'Starting patient registration', { email: patientData.email });

      // Validate email is provided
      if (!patientData.email) {
        throw new AppError(ErrorCode.VALIDATION_ERROR, 'Email is required for registration');
      }

      // Check if email already exists
      const existingPatients = await this.storage.loadAll<Patient & { password: string }>('patients');
      const existingPatient = existingPatients.find(p => p.email === patientData.email);
      
      if (existingPatient) {
        throw new AppError(ErrorCode.ENTITY_ALREADY_EXISTS, 'A patient with this email already exists');
      }

      // Hash password
      const hashedPassword = await bcrypt.hash(patientData.password, 10);

      // Create patient with hashed password
      const patientWithAuth = {
        ...patientData,
        password: hashedPassword,
        id: this.generateId('patient'),
        createdAt: new Date().toISOString()
      };

      // Save to storage
      await this.storage.save('patients', patientWithAuth.id, patientWithAuth);

      // Generate token
      const token = this.generateToken({
        id: patientWithAuth.id,
        email: patientData.email,
        name: patientWithAuth.name,
        userType: 'patient'
      });

      logger.info('auth-register-patient', 'Patient registered successfully', { 
        patientId: patientWithAuth.id, 
        email: patientData.email 
      });

      return {
        success: true,
        user: {
          id: patientWithAuth.id,
          email: patientData.email,
          name: patientWithAuth.name,
          userType: 'patient'
        },
        token,
        message: 'Patient registered successfully'
      };
    });
  }

  /**
   * Register a new doctor with login credentials
   */
  async registerDoctor(doctorData: Omit<Doctor, 'id' | 'createdAt'> & { password: string; email: string }): Promise<AuthResponse> {
    return ErrorHandler.wrapAsync('auth-register-doctor', async () => {
      logger.info('auth-register-doctor', 'Starting doctor registration', { email: doctorData.email });

      // Validate email is provided
      if (!doctorData.email) {
        throw new AppError(ErrorCode.VALIDATION_ERROR, 'Email is required for registration');
      }

      // Check if email already exists
      const existingDoctors = await this.storage.loadAll<Doctor & { password: string }>('doctors');
      const existingDoctor = existingDoctors.find(d => d.email === doctorData.email);
      
      if (existingDoctor) {
        throw new AppError(ErrorCode.ENTITY_ALREADY_EXISTS, 'A doctor with this email already exists');
      }

      // Hash password
      const hashedPassword = await bcrypt.hash(doctorData.password, 10);

      // Create doctor with hashed password
      const doctorWithAuth = {
        ...doctorData,
        password: hashedPassword,
        id: this.generateId('doctor'),
        createdAt: new Date().toISOString()
      };

      // Save to storage
      await this.storage.save('doctors', doctorWithAuth.id, doctorWithAuth);

      // Generate token
      const token = this.generateToken({
        id: doctorWithAuth.id,
        email: doctorData.email,
        name: doctorWithAuth.name,
        userType: 'doctor',
        specialization: doctorWithAuth.specialization
      });

      logger.info('auth-register-doctor', 'Doctor registered successfully', { 
        doctorId: doctorWithAuth.id, 
        email: doctorData.email 
      });

      return {
        success: true,
        user: {
          id: doctorWithAuth.id,
          email: doctorData.email,
          name: doctorWithAuth.name,
          userType: 'doctor',
          specialization: doctorWithAuth.specialization
        },
        token,
        message: 'Doctor registered successfully'
      };
    });
  }

  /**
   * Login user (patient, doctor, or admin)
   */
  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    return ErrorHandler.wrapAsync('auth-login', async () => {
      logger.info('auth-login', 'Login attempt', { 
        email: credentials.email, 
        userType: credentials.userType 
      });

      // Handle admin login
      if (credentials.userType === 'admin') {
        return this.handleAdminLogin(credentials);
      }

      const collection = credentials.userType === 'patient' ? 'patients' : 'doctors';
      const users = await this.storage.loadAll<(Patient | Doctor) & { password: string }>(collection);
      
      const user = users.find(u => u.email === credentials.email);
      
      if (!user || !user.email) {
        logger.warn('auth-login', 'Login failed - user not found', { 
          email: credentials.email, 
          userType: credentials.userType 
        });
        throw new AppError(ErrorCode.ENTITY_NOT_FOUND, 'Invalid email or password');
      }

      // Verify password
      const isValidPassword = await bcrypt.compare(credentials.password, user.password);
      
      if (!isValidPassword) {
        logger.warn('auth-login', 'Login failed - invalid password', { 
          email: credentials.email, 
          userType: credentials.userType 
        });
        throw new AppError(ErrorCode.VALIDATION_ERROR, 'Invalid email or password');
      }

      // Generate token
      const authUser: AuthUser = {
        id: user.id,
        email: user.email,
        name: user.name,
        userType: credentials.userType,
        ...(credentials.userType === 'doctor' && { specialization: (user as Doctor).specialization })
      };

      const token = this.generateToken(authUser);

      logger.info('auth-login', 'Login successful', { 
        userId: user.id, 
        email: credentials.email, 
        userType: credentials.userType 
      });

      return {
        success: true,
        user: authUser,
        token,
        message: 'Login successful'
      };
    });
  }

  /**
   * Handle admin login with hardcoded credentials
   */
  private async handleAdminLogin(credentials: LoginCredentials): Promise<AuthResponse> {
    const adminEmail = 'admin@medicare.com';
    const adminPassword = 'admin123';
    
    if (credentials.email !== adminEmail || credentials.password !== adminPassword) {
      logger.warn('auth-login', 'Admin login failed', { email: credentials.email });
      throw new AppError(ErrorCode.VALIDATION_ERROR, 'Invalid admin credentials');
    }

    const authUser: AuthUser = {
      id: 'ADMIN-001',
      email: adminEmail,
      name: 'System Administrator',
      userType: 'admin'
    };

    const token = this.generateToken(authUser);
    logger.info('auth-login', 'Admin login successful');

    return {
      success: true,
      user: authUser,
      token,
      message: 'Admin login successful'
    };
  }

  /**
   * Verify JWT token
   */
  verifyToken(token: string): AuthUser | null {
    try {
      const decoded = jwt.verify(token, this.jwtSecret) as AuthUser;
      return decoded;
    } catch (error) {
      logger.warn('auth-verify-token', 'Token verification failed', { error: (error as Error).message });
      return null;
    }
  }

  /**
   * Generate JWT token
   */
  private generateToken(user: AuthUser): string {
    return jwt.sign(user, this.jwtSecret, { expiresIn: '24h' });
  }

  /**
   * Generate unique ID
   */
  private generateId(type: 'patient' | 'doctor'): string {
    const prefix = type === 'patient' ? 'PAT' : 'DOC';
    const timestamp = Date.now();
    const random = Math.random().toString(36).substring(2, 8).toUpperCase();
    return `${prefix}-${timestamp}-${random}`;
  }
}