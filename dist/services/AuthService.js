"use strict";
/**
 * Authentication Service for Hospital Management System
 * Handles login/logout for both patients and doctors
 */
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthService = void 0;
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const utils_1 = require("../utils");
class AuthService {
    constructor(storage) {
        this.storage = storage;
        this.jwtSecret = process.env.JWT_SECRET || 'hospital-management-secret-key';
    }
    /**
     * Register a new patient with login credentials
     */
    async registerPatient(patientData) {
        return utils_1.ErrorHandler.wrapAsync('auth-register-patient', async () => {
            utils_1.logger.info('auth-register-patient', 'Starting patient registration', { email: patientData.email });
            // Validate email is provided
            if (!patientData.email) {
                throw new utils_1.AppError(utils_1.ErrorCode.VALIDATION_ERROR, 'Email is required for registration');
            }
            // Check if email already exists
            const existingPatients = await this.storage.loadAll('patients');
            const existingPatient = existingPatients.find(p => p.email === patientData.email);
            if (existingPatient) {
                throw new utils_1.AppError(utils_1.ErrorCode.ENTITY_ALREADY_EXISTS, 'A patient with this email already exists');
            }
            // Hash password
            const hashedPassword = await bcryptjs_1.default.hash(patientData.password, 10);
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
            utils_1.logger.info('auth-register-patient', 'Patient registered successfully', {
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
    async registerDoctor(doctorData) {
        return utils_1.ErrorHandler.wrapAsync('auth-register-doctor', async () => {
            utils_1.logger.info('auth-register-doctor', 'Starting doctor registration', { email: doctorData.email });
            // Validate email is provided
            if (!doctorData.email) {
                throw new utils_1.AppError(utils_1.ErrorCode.VALIDATION_ERROR, 'Email is required for registration');
            }
            // Check if email already exists
            const existingDoctors = await this.storage.loadAll('doctors');
            const existingDoctor = existingDoctors.find(d => d.email === doctorData.email);
            if (existingDoctor) {
                throw new utils_1.AppError(utils_1.ErrorCode.ENTITY_ALREADY_EXISTS, 'A doctor with this email already exists');
            }
            // Hash password
            const hashedPassword = await bcryptjs_1.default.hash(doctorData.password, 10);
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
            utils_1.logger.info('auth-register-doctor', 'Doctor registered successfully', {
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
    async login(credentials) {
        return utils_1.ErrorHandler.wrapAsync('auth-login', async () => {
            utils_1.logger.info('auth-login', 'Login attempt', {
                email: credentials.email,
                userType: credentials.userType
            });
            // Handle admin login
            if (credentials.userType === 'admin') {
                return this.handleAdminLogin(credentials);
            }
            const collection = credentials.userType === 'patient' ? 'patients' : 'doctors';
            const users = await this.storage.loadAll(collection);
            const user = users.find(u => u.email === credentials.email);
            if (!user || !user.email) {
                utils_1.logger.warn('auth-login', 'Login failed - user not found', {
                    email: credentials.email,
                    userType: credentials.userType
                });
                throw new utils_1.AppError(utils_1.ErrorCode.ENTITY_NOT_FOUND, 'Invalid email or password');
            }
            // Verify password
            const isValidPassword = await bcryptjs_1.default.compare(credentials.password, user.password);
            if (!isValidPassword) {
                utils_1.logger.warn('auth-login', 'Login failed - invalid password', {
                    email: credentials.email,
                    userType: credentials.userType
                });
                throw new utils_1.AppError(utils_1.ErrorCode.VALIDATION_ERROR, 'Invalid email or password');
            }
            // Generate token
            const authUser = {
                id: user.id,
                email: user.email,
                name: user.name,
                userType: credentials.userType,
                ...(credentials.userType === 'doctor' && { specialization: user.specialization })
            };
            const token = this.generateToken(authUser);
            utils_1.logger.info('auth-login', 'Login successful', {
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
    async handleAdminLogin(credentials) {
        const adminEmail = 'admin@medicare.com';
        const adminPassword = 'admin123';
        if (credentials.email !== adminEmail || credentials.password !== adminPassword) {
            utils_1.logger.warn('auth-login', 'Admin login failed', { email: credentials.email });
            throw new utils_1.AppError(utils_1.ErrorCode.VALIDATION_ERROR, 'Invalid admin credentials');
        }
        const authUser = {
            id: 'ADMIN-001',
            email: adminEmail,
            name: 'System Administrator',
            userType: 'admin'
        };
        const token = this.generateToken(authUser);
        utils_1.logger.info('auth-login', 'Admin login successful');
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
    verifyToken(token) {
        try {
            const decoded = jsonwebtoken_1.default.verify(token, this.jwtSecret);
            return decoded;
        }
        catch (error) {
            utils_1.logger.warn('auth-verify-token', 'Token verification failed', { error: error.message });
            return null;
        }
    }
    /**
     * Generate JWT token
     */
    generateToken(user) {
        return jsonwebtoken_1.default.sign(user, this.jwtSecret, { expiresIn: '24h' });
    }
    /**
     * Generate unique ID
     */
    generateId(type) {
        const prefix = type === 'patient' ? 'PAT' : 'DOC';
        const timestamp = Date.now();
        const random = Math.random().toString(36).substring(2, 8).toUpperCase();
        return `${prefix}-${timestamp}-${random}`;
    }
}
exports.AuthService = AuthService;
//# sourceMappingURL=AuthService.js.map