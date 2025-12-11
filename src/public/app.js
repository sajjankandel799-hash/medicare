// Hospital Management System Web App JavaScript

let patients = [];
let doctors = [];
let appointments = [];
let records = [];

// Initialize the app
document.addEventListener('DOMContentLoaded', function() {
    loadPatients();
    loadDoctors();
    loadAppointments();
    loadRecords();
});

// Tab Management
function showTab(tabName) {
    // Hide all tab panes
    const panes = document.querySelectorAll('.tab-pane');
    panes.forEach(pane => pane.classList.remove('active'));
    
    // Remove active class from all tabs
    const tabs = document.querySelectorAll('.nav-tab');
    tabs.forEach(tab => tab.classList.remove('active'));
    
    // Show selected tab pane
    document.getElementById(tabName).classList.add('active');
    
    // Add active class to clicked tab
    event.target.classList.add('active');
    
    // Load data for the selected tab
    switch(tabName) {
        case 'patients':
            loadPatients();
            break;
        case 'doctors':
            loadDoctors();
            break;
        case 'appointments':
            loadAppointments();
            populateDropdowns();
            break;
        case 'records':
            loadRecords();
            populateDropdowns();
            break;
    }
}

// API Helper Functions
async function apiCall(endpoint, method = 'GET', data = null) {
    try {
        const options = {
            method,
            headers: {
                'Content-Type': 'application/json',
            }
        };
        
        if (data) {
            options.body = JSON.stringify(data);
        }
        
        const response = await fetch(`/api${endpoint}`, options);
        const result = await response.json();
        
        if (!result.success) {
            throw new Error(result.error.message || 'An error occurred');
        }
        
        return result.data;
    } catch (error) {
        console.error('API Error:', error);
        throw error;
    }
}

// Alert Functions
function showAlert(containerId, message, type = 'success') {
    const container = document.getElementById(containerId);
    container.innerHTML = `<div class="alert alert-${type}">${message}</div>`;
    setTimeout(() => {
        container.innerHTML = '';
    }, 5000);
}

// Patient Management
async function loadPatients() {
    try {
        patients = await apiCall('/patients');
        displayPatients();
    } catch (error) {
        document.getElementById('patients-list').innerHTML = 
            `<div class="alert alert-error">Error loading patients: ${error.message}</div>`;
    }
}

function displayPatients() {
    const container = document.getElementById('patients-list');
    
    if (patients.length === 0) {
        container.innerHTML = `
            <div class="empty-state">
                <h3>No patients registered</h3>
                <p>Add your first patient using the form above.</p>
            </div>
        `;
        return;
    }
    
    const table = `
        <table class="data-table">
            <thead>
                <tr>
                    <th>Name</th>
                    <th>Date of Birth</th>
                    <th>Contact</th>
                    <th>Email</th>
                    <th>Address</th>
                    <th>Registered</th>
                </tr>
            </thead>
            <tbody>
                ${patients.map(patient => `
                    <tr>
                        <td><strong>${patient.name}</strong></td>
                        <td>${patient.dateOfBirth}</td>
                        <td>${patient.contactNumber}</td>
                        <td>${patient.email || 'N/A'}</td>
                        <td>${patient.address}</td>
                        <td>${new Date(patient.createdAt).toLocaleDateString()}</td>
                    </tr>
                `).join('')}
            </tbody>
        </table>
    `;
    
    container.innerHTML = table;
}

async function addPatient(event) {
    event.preventDefault();
    
    const patientData = {
        name: document.getElementById('patient-name').value,
        dateOfBirth: document.getElementById('patient-dob').value,
        contactNumber: document.getElementById('patient-phone').value,
        email: document.getElementById('patient-email').value,
        address: document.getElementById('patient-address').value
    };
    
    try {
        await apiCall('/patients', 'POST', patientData);
        showAlert('patient-alert', 'Patient registered successfully!');
        document.getElementById('patient-form').reset();
        loadPatients();
    } catch (error) {
        showAlert('patient-alert', `Error: ${error.message}`, 'error');
    }
}

// Doctor Management
async function loadDoctors() {
    try {
        doctors = await apiCall('/doctors');
        displayDoctors();
    } catch (error) {
        document.getElementById('doctors-list').innerHTML = 
            `<div class="alert alert-error">Error loading doctors: ${error.message}</div>`;
    }
}

function displayDoctors() {
    const container = document.getElementById('doctors-list');
    
    if (doctors.length === 0) {
        container.innerHTML = `
            <div class="empty-state">
                <h3>No doctors registered</h3>
                <p>Add your first doctor using the form above.</p>
            </div>
        `;
        return;
    }
    
    const table = `
        <table class="data-table">
            <thead>
                <tr>
                    <th>Name</th>
                    <th>Specialization</th>
                    <th>Contact</th>
                    <th>Email</th>
                    <th>Registered</th>
                </tr>
            </thead>
            <tbody>
                ${doctors.map(doctor => `
                    <tr>
                        <td><strong>${doctor.name}</strong></td>
                        <td>${doctor.specialization}</td>
                        <td>${doctor.contactNumber}</td>
                        <td>${doctor.email || 'N/A'}</td>
                        <td>${new Date(doctor.createdAt).toLocaleDateString()}</td>
                    </tr>
                `).join('')}
            </tbody>
        </table>
    `;
    
    container.innerHTML = table;
}

async function addDoctor(event) {
    event.preventDefault();
    
    const doctorData = {
        name: document.getElementById('doctor-name').value,
        specialization: document.getElementById('doctor-specialization').value,
        contactNumber: document.getElementById('doctor-phone').value,
        email: document.getElementById('doctor-email').value
    };
    
    try {
        await apiCall('/doctors', 'POST', doctorData);
        showAlert('doctor-alert', 'Doctor registered successfully!');
        document.getElementById('doctor-form').reset();
        loadDoctors();
    } catch (error) {
        showAlert('doctor-alert', `Error: ${error.message}`, 'error');
    }
}

// Appointment Management
async function loadAppointments() {
    try {
        appointments = await apiCall('/appointments');
        displayAppointments();
    } catch (error) {
        document.getElementById('appointments-list').innerHTML = 
            `<div class="alert alert-error">Error loading appointments: ${error.message}</div>`;
    }
}

function displayAppointments() {
    const container = document.getElementById('appointments-list');
    
    if (appointments.length === 0) {
        container.innerHTML = `
            <div class="empty-state">
                <h3>No appointments scheduled</h3>
                <p>Schedule your first appointment using the form above.</p>
            </div>
        `;
        return;
    }
    
    const table = `
        <table class="data-table">
            <thead>
                <tr>
                    <th>Patient</th>
                    <th>Doctor</th>
                    <th>Date & Time</th>
                    <th>Status</th>
                    <th>Notes</th>
                </tr>
            </thead>
            <tbody>
                ${appointments.map(appointment => {
                    const patient = patients.find(p => p.id === appointment.patientId);
                    const doctor = doctors.find(d => d.id === appointment.doctorId);
                    const dateTime = new Date(appointment.dateTime);
                    
                    return `
                        <tr>
                            <td><strong>${patient ? patient.name : 'Unknown Patient'}</strong></td>
                            <td>${doctor ? doctor.name : 'Unknown Doctor'}</td>
                            <td>${dateTime.toLocaleDateString()} ${dateTime.toLocaleTimeString()}</td>
                            <td><span class="status-${appointment.status}">${appointment.status.toUpperCase()}</span></td>
                            <td>${appointment.notes || 'N/A'}</td>
                        </tr>
                    `;
                }).join('')}
            </tbody>
        </table>
    `;
    
    container.innerHTML = table;
}

async function addAppointment(event) {
    event.preventDefault();
    
    const date = document.getElementById('appointment-date').value;
    const time = document.getElementById('appointment-time').value;
    const dateTime = new Date(`${date}T${time}`).toISOString();
    
    const appointmentData = {
        patientId: document.getElementById('appointment-patient').value,
        doctorId: document.getElementById('appointment-doctor').value,
        dateTime: dateTime,
        status: 'scheduled',
        notes: document.getElementById('appointment-notes').value
    };
    
    try {
        await apiCall('/appointments', 'POST', appointmentData);
        showAlert('appointment-alert', 'Appointment scheduled successfully!');
        document.getElementById('appointment-form').reset();
        loadAppointments();
    } catch (error) {
        showAlert('appointment-alert', `Error: ${error.message}`, 'error');
    }
}

// Medical Records Management
async function loadRecords() {
    try {
        records = await apiCall('/medical-records');
        displayRecords();
    } catch (error) {
        document.getElementById('records-list').innerHTML = 
            `<div class="alert alert-error">Error loading medical records: ${error.message}</div>`;
    }
}

function displayRecords() {
    const container = document.getElementById('records-list');
    
    if (records.length === 0) {
        container.innerHTML = `
            <div class="empty-state">
                <h3>No medical records</h3>
                <p>Create your first medical record using the form above.</p>
            </div>
        `;
        return;
    }
    
    const table = `
        <table class="data-table">
            <thead>
                <tr>
                    <th>Patient</th>
                    <th>Doctor</th>
                    <th>Diagnosis</th>
                    <th>Treatment</th>
                    <th>Date</th>
                </tr>
            </thead>
            <tbody>
                ${records.map(record => {
                    const patient = patients.find(p => p.id === record.patientId);
                    const doctor = doctors.find(d => d.id === record.doctorId);
                    
                    return `
                        <tr>
                            <td><strong>${patient ? patient.name : 'Unknown Patient'}</strong></td>
                            <td>${doctor ? doctor.name : 'Unknown Doctor'}</td>
                            <td>${record.diagnosis}</td>
                            <td>${record.treatment}</td>
                            <td>${new Date(record.createdAt).toLocaleDateString()}</td>
                        </tr>
                    `;
                }).join('')}
            </tbody>
        </table>
    `;
    
    container.innerHTML = table;
}

async function addRecord(event) {
    event.preventDefault();
    
    const recordData = {
        patientId: document.getElementById('record-patient').value,
        doctorId: document.getElementById('record-doctor').value,
        diagnosis: document.getElementById('record-diagnosis').value,
        treatment: document.getElementById('record-treatment').value,
        notes: document.getElementById('record-notes').value
    };
    
    try {
        await apiCall('/medical-records', 'POST', recordData);
        showAlert('record-alert', 'Medical record created successfully!');
        document.getElementById('record-form').reset();
        loadRecords();
    } catch (error) {
        showAlert('record-alert', `Error: ${error.message}`, 'error');
    }
}

// Populate dropdowns for appointments and records
function populateDropdowns() {
    // Populate patient dropdowns
    const patientSelects = ['appointment-patient', 'record-patient'];
    patientSelects.forEach(selectId => {
        const select = document.getElementById(selectId);
        if (select) {
            select.innerHTML = '<option value="">Select Patient</option>';
            patients.forEach(patient => {
                select.innerHTML += `<option value="${patient.id}">${patient.name}</option>`;
            });
        }
    });
    
    // Populate doctor dropdowns
    const doctorSelects = ['appointment-doctor', 'record-doctor'];
    doctorSelects.forEach(selectId => {
        const select = document.getElementById(selectId);
        if (select) {
            select.innerHTML = '<option value="">Select Doctor</option>';
            doctors.forEach(doctor => {
                select.innerHTML += `<option value="${doctor.id}">${doctor.name} - ${doctor.specialization}</option>`;
            });
        }
    });
}