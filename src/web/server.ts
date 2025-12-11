/**
 * Web Server for Hospital Management System
 * Provides a REST API and serves the web interface
 */

import express from 'express';
import cors from 'cors';
import path from 'path';
import session from 'express-session';
import { initializeSystem, SystemServices } from '../initialization';
import { logger, ErrorHandler, AppError, ErrorCode } from '../utils';
import { AuthService } from '../services/AuthService';

export class WebServer {
  private app: express.Application;
  private services: SystemServices | null = null;
  private authService: AuthService | null = null;
  private port: number;

  constructor(port: number = 3000) {
    this.app = express();
    this.port = port;
    this.setupMiddleware();
    this.setupRoutes();
  }

  private setupMiddleware(): void {
    this.app.use(cors());
    this.app.use(express.json());
    this.app.use(session({
      secret: process.env.SESSION_SECRET || 'hospital-session-secret',
      resave: false,
      saveUninitialized: false,
      cookie: { secure: false, maxAge: 24 * 60 * 60 * 1000 } // 24 hours
    }));
    this.app.use(express.static(path.join(__dirname, '../../src/public')));
    
    // Logging middleware
    this.app.use((req, res, next) => {
      logger.info('web-request', `${req.method} ${req.path}`, { 
        ip: req.ip, 
        userAgent: req.get('User-Agent') 
      });
      next();
    });
  }

  private setupRoutes(): void {
    // Serve the main landing page
    this.app.get('/', (req, res) => {
      res.sendFile(path.join(__dirname, '../../src/public/index.html'));
    });

    // Serve specific pages
    this.app.get('/login.html', (req, res) => {
      res.sendFile(path.join(__dirname, '../../src/public/login.html'));
    });

    this.app.get('/patient-dashboard.html', (req, res) => {
      res.sendFile(path.join(__dirname, '../../src/public/patient-dashboard.html'));
    });

    this.app.get('/doctor-dashboard.html', (req, res) => {
      res.sendFile(path.join(__dirname, '../../src/public/doctor-dashboard.html'));
    });

    this.app.get('/admin-dashboard.html', (req, res) => {
      res.sendFile(path.join(__dirname, '../../src/public/admin-dashboard.html'));
    });

    // API Routes
    this.app.use('/api', this.createApiRouter());

    // Error handling middleware
    this.app.use((error: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
      const appError = ErrorHandler.handleError('web-error', error);
      const userMessage = ErrorHandler.getUserFriendlyMessage(appError);
      
      res.status(500).json({
        success: false,
        error: {
          message: userMessage,
          code: appError.code
        }
      });
    });
  }

  // Authentication middleware
  private authenticateToken(req: express.Request, res: express.Response, next: express.NextFunction): void {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
      res.status(401).json({
        success: false,
        error: { message: 'Access token required' }
      });
      return;
    }

    const user = this.authService!.verifyToken(token);
    if (!user) {
      res.status(403).json({
        success: false,
        error: { message: 'Invalid or expired token' }
      });
      return;
    }

    (req as any).user = user;
    next();
  }

  private createApiRouter(): express.Router {
    const router = express.Router();

    // Authentication routes (no auth required)
    router.post('/auth/login', async (req, res) => {
      try {
        const result = await this.authService!.login(req.body);
        res.json(result);
      } catch (error) {
        const appError = ErrorHandler.handleError('api-login', error);
        res.status(400).json(appError.toErrorResponse());
      }
    });

    router.post('/auth/register-patient', async (req, res) => {
      try {
        const result = await this.authService!.registerPatient(req.body);
        res.json(result);
      } catch (error) {
        const appError = ErrorHandler.handleError('api-register-patient', error);
        res.status(400).json(appError.toErrorResponse());
      }
    });

    router.post('/auth/register-doctor', async (req, res) => {
      try {
        const result = await this.authService!.registerDoctor(req.body);
        res.json(result);
      } catch (error) {
        const appError = ErrorHandler.handleError('api-register-doctor', error);
        res.status(400).json(appError.toErrorResponse());
      }
    });

    // Protected routes (authentication required)
    router.use(this.authenticateToken.bind(this));

    // Patients API
    router.get('/patients', async (req, res) => {
      try {
        const patients = await this.services!.storageManager.loadAll('patients');
        // Remove password field from response
        const sanitizedPatients = patients.map((p: any) => {
          const { password, ...patientData } = p;
          return patientData;
        });
        res.json({ success: true, data: sanitizedPatients });
      } catch (error) {
        const appError = ErrorHandler.handleError('api-get-patients', error);
        res.status(500).json(appError.toErrorResponse());
      }
    });

    router.get('/patients/:id', async (req, res) => {
      try {
        const patient = await this.services!.patientService.getPatient(req.params.id);
        if (!patient) {
          return res.status(404).json({
            success: false,
            error: { message: 'Patient not found' }
          });
        }
        res.json({ success: true, data: patient });
      } catch (error) {
        const appError = ErrorHandler.handleError('api-get-patient', error);
        res.status(500).json(appError.toErrorResponse());
      }
    });

    router.put('/patients/:id', async (req, res) => {
      try {
        const patient = await this.services!.patientService.updatePatient(req.params.id, req.body);
        res.json({ success: true, data: patient });
      } catch (error) {
        const appError = ErrorHandler.handleError('api-update-patient', error);
        res.status(400).json(appError.toErrorResponse());
      }
    });

    router.delete('/patients/:id', async (req, res) => {
      try {
        await this.services!.patientService.deletePatient(req.params.id);
        res.json({ success: true, message: 'Patient deleted successfully' });
      } catch (error) {
        const appError = ErrorHandler.handleError('api-delete-patient', error);
        res.status(400).json(appError.toErrorResponse());
      }
    });

    // Doctors API
    router.get('/doctors', async (req, res) => {
      try {
        const doctors = await this.services!.doctorService.getAllDoctors();
        // Remove password field from response
        const sanitizedDoctors = doctors.map((d: any) => {
          const { password, ...doctorData } = d;
          return doctorData;
        });
        res.json({ success: true, data: sanitizedDoctors });
      } catch (error) {
        const appError = ErrorHandler.handleError('api-get-doctors', error);
        res.status(500).json(appError.toErrorResponse());
      }
    });

    router.put('/doctors/:id', async (req, res) => {
      try {
        const doctor = await this.services!.doctorService.updateDoctor(req.params.id, req.body);
        res.json({ success: true, data: doctor });
      } catch (error) {
        const appError = ErrorHandler.handleError('api-update-doctor', error);
        res.status(400).json(appError.toErrorResponse());
      }
    });

    router.delete('/doctors/:id', async (req, res) => {
      try {
        await this.services!.doctorService.deleteDoctor(req.params.id);
        res.json({ success: true, message: 'Doctor deleted successfully' });
      } catch (error) {
        const appError = ErrorHandler.handleError('api-delete-doctor', error);
        res.status(400).json(appError.toErrorResponse());
      }
    });

    // Appointments API
    router.get('/appointments', async (req, res) => {
      try {
        const appointments = await this.services!.storageManager.loadAll('appointments');
        res.json({ success: true, data: appointments });
      } catch (error) {
        const appError = ErrorHandler.handleError('api-get-appointments', error);
        res.status(500).json(appError.toErrorResponse());
      }
    });

    router.get('/appointments/patient/:patientId', async (req, res) => {
      try {
        const appointments = await this.services!.appointmentService.getAppointmentsByPatient(req.params.patientId);
        res.json({ success: true, data: appointments });
      } catch (error) {
        const appError = ErrorHandler.handleError('api-get-patient-appointments', error);
        res.status(500).json(appError.toErrorResponse());
      }
    });

    router.get('/appointments/doctor/:doctorId', async (req, res) => {
      try {
        const appointments = await this.services!.appointmentService.getAppointmentsByDoctor(req.params.doctorId);
        res.json({ success: true, data: appointments });
      } catch (error) {
        const appError = ErrorHandler.handleError('api-get-doctor-appointments', error);
        res.status(500).json(appError.toErrorResponse());
      }
    });

    router.post('/appointments', async (req, res) => {
      try {
        const appointment = await this.services!.appointmentService.scheduleAppointment(req.body);
        res.json({ success: true, data: appointment });
      } catch (error) {
        const appError = ErrorHandler.handleError('api-create-appointment', error);
        res.status(400).json(appError.toErrorResponse());
      }
    });

    // Appointment status update routes
    router.put('/appointments/:id/confirm', async (req, res) => {
      try {
        const appointment = await this.services!.appointmentService.updateAppointmentStatus(req.params.id, 'confirmed');
        res.json({ success: true, data: appointment });
      } catch (error) {
        const appError = ErrorHandler.handleError('api-confirm-appointment', error);
        res.status(400).json(appError.toErrorResponse());
      }
    });

    router.put('/appointments/:id/complete', async (req, res) => {
      try {
        const appointment = await this.services!.appointmentService.updateAppointmentStatus(req.params.id, 'completed');
        res.json({ success: true, data: appointment });
      } catch (error) {
        const appError = ErrorHandler.handleError('api-complete-appointment', error);
        res.status(400).json(appError.toErrorResponse());
      }
    });

    router.put('/appointments/:id/cancel', async (req, res) => {
      try {
        const appointment = await this.services!.appointmentService.cancelAppointment(req.params.id);
        res.json({ success: true, data: appointment });
      } catch (error) {
        const appError = ErrorHandler.handleError('api-cancel-appointment', error);
        res.status(400).json(appError.toErrorResponse());
      }
    });

    router.put('/appointments/:id/postpone', async (req, res) => {
      try {
        const { newDateTime, reason } = req.body;
        const appointment = await this.services!.appointmentService.requestPostponement(req.params.id, newDateTime, reason);
        res.json({ success: true, data: appointment });
      } catch (error) {
        const appError = ErrorHandler.handleError('api-postpone-appointment', error);
        res.status(400).json(appError.toErrorResponse());
      }
    });

    router.put('/appointments/:id/accept-postponement', async (req, res) => {
      try {
        const appointment = await this.services!.appointmentService.acceptPostponement(req.params.id);
        res.json({ success: true, data: appointment });
      } catch (error) {
        const appError = ErrorHandler.handleError('api-accept-postponement', error);
        res.status(400).json(appError.toErrorResponse());
      }
    });

    router.put('/appointments/:id/reject-postponement', async (req, res) => {
      try {
        const appointment = await this.services!.appointmentService.rejectPostponement(req.params.id);
        res.json({ success: true, data: appointment });
      } catch (error) {
        const appError = ErrorHandler.handleError('api-reject-postponement', error);
        res.status(400).json(appError.toErrorResponse());
      }
    });

    router.put('/appointments/:id', async (req, res) => {
      try {
        const appointment = await this.services!.appointmentService.updateAppointment(req.params.id, req.body);
        res.json({ success: true, data: appointment });
      } catch (error) {
        const appError = ErrorHandler.handleError('api-update-appointment', error);
        res.status(400).json(appError.toErrorResponse());
      }
    });

    router.delete('/appointments/:id', async (req, res) => {
      try {
        await this.services!.appointmentService.deleteAppointment(req.params.id);
        res.json({ success: true, message: 'Appointment deleted successfully' });
      } catch (error) {
        const appError = ErrorHandler.handleError('api-delete-appointment', error);
        res.status(400).json(appError.toErrorResponse());
      }
    });

    // Medical Records API
    router.get('/medical-records', async (req, res) => {
      try {
        const records = await this.services!.storageManager.loadAll('medical-records');
        res.json({ success: true, data: records });
      } catch (error) {
        const appError = ErrorHandler.handleError('api-get-medical-records', error);
        res.status(500).json(appError.toErrorResponse());
      }
    });

    router.post('/medical-records', async (req, res) => {
      try {
        const record = await this.services!.medicalRecordService.createRecord(req.body);
        res.json({ success: true, data: record });
      } catch (error) {
        const appError = ErrorHandler.handleError('api-create-medical-record', error);
        res.status(400).json(appError.toErrorResponse());
      }
    });

    router.delete('/medical-records/:id', async (req, res) => {
      try {
        await this.services!.medicalRecordService.deleteRecord(req.params.id);
        res.json({ success: true, message: 'Medical record deleted successfully' });
      } catch (error) {
        const appError = ErrorHandler.handleError('api-delete-medical-record', error);
        res.status(400).json(appError.toErrorResponse());
      }
    });

    return router;
  }

  public async start(): Promise<void> {
    try {
      logger.info('web-server', 'Initializing Hospital Management System...');
      this.services = await initializeSystem();
      this.authService = new AuthService(this.services.storageManager);
      
      this.app.listen(this.port, () => {
        logger.info('web-server', `Server running on http://localhost:${this.port}`);
        console.log(`🏥 MediCare - Hospital Appointment System`);
        console.log(`🌐 Open your browser and go to: http://localhost:${this.port}`);
        console.log(`👤 Patient Login: Register as a patient to book appointments`);
        console.log(`👨‍⚕️ Doctor Login: Register as a doctor to manage appointments`);
        console.log(`📊 API available at: http://localhost:${this.port}/api`);
      });
    } catch (error) {
      const appError = ErrorHandler.handleError('web-server-start', error);
      console.error('❌ Failed to start web server:', ErrorHandler.getUserFriendlyMessage(appError));
      process.exit(1);
    }
  }
}