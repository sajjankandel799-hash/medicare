// Admin Dashboard JavaScript
let patients = [], doctors = [], appointments = [], records = [];

document.addEventListener('DOMContentLoaded', () => {
    checkAuth();
    loadAllData();
});

function checkAuth() {
    const token = localStorage.getItem('authToken');
    const userRole = localStorage.getItem('userRole');
    if (!token || userRole !== 'admin') window.location.href = '/login.html';
}

async function apiCall(endpoint, method = 'GET', data = null) {
    const token = localStorage.getItem('authToken');
    const options = { method, headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` } };
    if (data) options.body = JSON.stringify(data);
    console.log(`API Call: ${method} /api${endpoint}`);
    const response = await fetch(`/api${endpoint}`, options);
    console.log(`Response status: ${response.status}`);
    if (!response.ok) {
        const errorText = await response.text();
        console.error('API Error:', errorText);
        throw new Error(`HTTP ${response.status}: ${errorText}`);
    }
    const result = await response.json();
    console.log('API Result:', result);
    return result;
}

async function loadAllData() {
    try {
        const [patientsRes, doctorsRes, appointmentsRes, recordsRes] = await Promise.all([
            apiCall('/patients'), apiCall('/doctors'), apiCall('/appointments'), apiCall('/medical-records')
        ]);
        patients = patientsRes.data || [];
        doctors = doctorsRes.data || [];
        appointments = appointmentsRes.data || [];
        records = recordsRes.data || [];
        updateStats();
        displayPatients();
        displayDoctors();
        displayAppointments();
        displayRecords();
    } catch (error) {
        console.error('Error loading data:', error);
    }
}

function updateStats() {
    document.getElementById('total-patients').textContent = patients.length;
    document.getElementById('total-doctors').textContent = doctors.length;
    document.getElementById('total-appointments').textContent = appointments.length;
    document.getElementById('total-records').textContent = records.length;
}

function switchTab(tabName) {
    document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));
    document.querySelectorAll('.tab-button').forEach(b => b.classList.remove('active'));
    document.getElementById(tabName + '-tab').classList.add('active');
    event.target.classList.add('active');
}

function displayPatients() {
    const tbody = document.getElementById('patients-body');
    tbody.innerHTML = patients.map(p => `
        <tr>
            <td>${p.name}</td>
            <td>${p.email}</td>
            <td>${p.contactNumber}</td>
            <td>${new Date(p.dateOfBirth).toLocaleDateString()}</td>
            <td class="actions">
                <button class="btn btn-primary" onclick='editPatient(${JSON.stringify(p)})'>Edit</button>
                <button class="btn btn-danger" onclick="deletePatient('${p.id}')">Delete</button>
            </td>
        </tr>
    `).join('');
}

function displayDoctors() {
    const tbody = document.getElementById('doctors-body');
    tbody.innerHTML = doctors.map(d => `
        <tr>
            <td>${d.name}</td>
            <td>${d.specialization}</td>
            <td>${d.email}</td>
            <td>${d.contactNumber}</td>
            <td class="actions">
                <button class="btn btn-primary" onclick='editDoctor(${JSON.stringify(d)})'>Edit</button>
                <button class="btn btn-danger" onclick="deleteDoctor('${d.id}')">Delete</button>
            </td>
        </tr>
    `).join('');
}

function displayAppointments() {
    const tbody = document.getElementById('appointments-body');
    tbody.innerHTML = appointments.map(a => {
        const patient = patients.find(p => p.id === a.patientId);
        const doctor = doctors.find(d => d.id === a.doctorId);
        return `
            <tr>
                <td>${patient ? patient.name : 'Unknown'}</td>
                <td>${doctor ? doctor.name : 'Unknown'}</td>
                <td>${new Date(a.dateTime).toLocaleString()}</td>
                <td>${a.status}</td>
                <td class="actions">
                    <button class="btn btn-primary" onclick='editAppointment(${JSON.stringify(a)})'>Edit</button>
                    <button class="btn btn-danger" onclick="deleteAppointment('${a.id}')">Delete</button>
                </td>
            </tr>
        `;
    }).join('');
}

function displayRecords() {
    const tbody = document.getElementById('records-body');
    tbody.innerHTML = records.map(r => {
        const patient = patients.find(p => p.id === r.patientId);
        const doctor = doctors.find(d => d.id === r.doctorId);
        return `
            <tr>
                <td>${patient ? patient.name : 'Unknown'}</td>
                <td>${doctor ? doctor.name : 'Unknown'}</td>
                <td>${r.diagnosis}</td>
                <td>${new Date(r.createdAt).toLocaleDateString()}</td>
                <td class="actions">
                    <button class="btn btn-primary" onclick='viewRecord(${JSON.stringify(r)})'>View</button>
                    <button class="btn btn-danger" onclick="deleteRecord('${r.id}')">Delete</button>
                </td>
            </tr>
        `;
    }).join('');
}

function showModal(title, body) {
    document.getElementById('modal-title').textContent = title;
    document.getElementById('modal-body').innerHTML = body;
    document.getElementById('modal').classList.add('active');
}

function hideModal() {
    document.getElementById('modal').classList.remove('active');
}

document.getElementById('modal').addEventListener('click', (e) => {
    if (e.target.id === 'modal') hideModal();
});

function showAddPatientModal() {
    showModal('Add New Patient', `
        <form onsubmit="addPatient(event)">
            <div class="form-row">
                <div class="form-group"><label>Name</label><input type="text" id="patient-name" required></div>
                <div class="form-group"><label>Email</label><input type="email" id="patient-email" required></div>
            </div>
            <div class="form-row">
                <div class="form-group"><label>Phone</label><input type="tel" id="patient-phone" required></div>
                <div class="form-group"><label>Date of Birth</label><input type="date" id="patient-dob" required></div>
            </div>
            <div class="form-group"><label>Address</label><textarea id="patient-address" required></textarea></div>
            <div class="form-group"><label>Password</label><input type="password" id="patient-password" required></div>
            <button type="submit" class="btn btn-primary">Add Patient</button>
            <button type="button" class="btn btn-ghost" onclick="hideModal()">Cancel</button>
        </form>
    `);
}

function showAddDoctorModal() {
    showModal('Add New Doctor', `
        <form onsubmit="addDoctor(event)">
            <div class="form-row">
                <div class="form-group"><label>Name</label><input type="text" id="doctor-name" required></div>
                <div class="form-group"><label>Email</label><input type="email" id="doctor-email" required></div>
            </div>
            <div class="form-row">
                <div class="form-group"><label>Phone</label><input type="tel" id="doctor-phone" required></div>
                <div class="form-group"><label>Specialization</label><input type="text" id="doctor-spec" required></div>
            </div>
            <div class="form-group"><label>Password</label><input type="password" id="doctor-password" required></div>
            <button type="submit" class="btn btn-primary">Add Doctor</button>
            <button type="button" class="btn btn-ghost" onclick="hideModal()">Cancel</button>
        </form>
    `);
}

async function addPatient(e) {
    e.preventDefault();
    const data = {
        name: document.getElementById('patient-name').value,
        email: document.getElementById('patient-email').value,
        contactNumber: document.getElementById('patient-phone').value,
        dateOfBirth: document.getElementById('patient-dob').value,
        address: document.getElementById('patient-address').value,
        password: document.getElementById('patient-password').value
    };
    try {
        await apiCall('/auth/register-patient', 'POST', data);
        hideModal();
        loadAllData();
    } catch (error) {
        alert('Error adding patient');
    }
}

async function addDoctor(e) {
    e.preventDefault();
    const data = {
        name: document.getElementById('doctor-name').value,
        email: document.getElementById('doctor-email').value,
        contactNumber: document.getElementById('doctor-phone').value,
        specialization: document.getElementById('doctor-spec').value,
        password: document.getElementById('doctor-password').value
    };
    try {
        await apiCall('/auth/register-doctor', 'POST', data);
        hideModal();
        loadAllData();
    } catch (error) {
        alert('Error adding doctor');
    }
}

function editPatient(patient) {
    showModal('Edit Patient', `
        <form onsubmit="updatePatient(event, '${patient.id}')">
            <div class="form-row">
                <div class="form-group"><label>Name</label><input type="text" value="${patient.name}" id="edit-patient-name" required></div>
                <div class="form-group"><label>Email</label><input type="email" value="${patient.email}" id="edit-patient-email" required></div>
            </div>
            <div class="form-row">
                <div class="form-group"><label>Phone</label><input type="tel" value="${patient.contactNumber}" id="edit-patient-phone" required></div>
                <div class="form-group"><label>Date of Birth</label><input type="date" value="${patient.dateOfBirth.split('T')[0]}" id="edit-patient-dob" required></div>
            </div>
            <div class="form-group"><label>Address</label><textarea id="edit-patient-address" required>${patient.address}</textarea></div>
            <button type="submit" class="btn btn-primary">Update Patient</button>
            <button type="button" class="btn btn-ghost" onclick="hideModal()">Cancel</button>
        </form>
    `);
}

function editDoctor(doctor) {
    showModal('Edit Doctor', `
        <form onsubmit="updateDoctor(event, '${doctor.id}')">
            <div class="form-row">
                <div class="form-group"><label>Name</label><input type="text" value="${doctor.name}" id="edit-doctor-name" required></div>
                <div class="form-group"><label>Email</label><input type="email" value="${doctor.email}" id="edit-doctor-email" required></div>
            </div>
            <div class="form-row">
                <div class="form-group"><label>Phone</label><input type="tel" value="${doctor.contactNumber}" id="edit-doctor-phone" required></div>
                <div class="form-group"><label>Specialization</label><input type="text" value="${doctor.specialization}" id="edit-doctor-spec" required></div>
            </div>
            <button type="submit" class="btn btn-primary">Update Doctor</button>
            <button type="button" class="btn btn-ghost" onclick="hideModal()">Cancel</button>
        </form>
    `);
}

function editAppointment(apt) {
    const dateTime = new Date(apt.dateTime);
    const date = dateTime.toISOString().split('T')[0];
    const time = dateTime.toTimeString().slice(0,5);
    showModal('Edit Appointment', `
        <form onsubmit="updateAppointment(event, '${apt.id}')">
            <div class="form-group"><label>Patient</label><select id="edit-apt-patient">${patients.map(p => `<option value="${p.id}" ${p.id === apt.patientId ? 'selected' : ''}>${p.name}</option>`).join('')}</select></div>
            <div class="form-group"><label>Doctor</label><select id="edit-apt-doctor">${doctors.map(d => `<option value="${d.id}" ${d.id === apt.doctorId ? 'selected' : ''}>${d.name}</option>`).join('')}</select></div>
            <div class="form-row">
                <div class="form-group"><label>Date</label><input type="date" value="${date}" id="edit-apt-date" required></div>
                <div class="form-group"><label>Time</label><input type="time" value="${time}" id="edit-apt-time" required></div>
            </div>
            <div class="form-group"><label>Status</label><select id="edit-apt-status"><option value="scheduled" ${apt.status === 'scheduled' ? 'selected' : ''}>Scheduled</option><option value="confirmed" ${apt.status === 'confirmed' ? 'selected' : ''}>Confirmed</option><option value="completed" ${apt.status === 'completed' ? 'selected' : ''}>Completed</option><option value="cancelled" ${apt.status === 'cancelled' ? 'selected' : ''}>Cancelled</option></select></div>
            <button type="submit" class="btn btn-primary">Update Appointment</button>
            <button type="button" class="btn btn-ghost" onclick="hideModal()">Cancel</button>
        </form>
    `);
}

function viewRecord(record) {
    const patient = patients.find(p => p.id === record.patientId);
    const doctor = doctors.find(d => d.id === record.doctorId);
    showModal('Medical Record Details', `
        <div><strong>Patient:</strong> ${patient ? patient.name : 'Unknown'}</div>
        <div><strong>Doctor:</strong> ${doctor ? doctor.name : 'Unknown'}</div>
        <div><strong>Diagnosis:</strong> ${record.diagnosis}</div>
        <div><strong>Treatment:</strong> ${record.treatment}</div>
        <div><strong>Notes:</strong> ${record.notes}</div>
        <div><strong>Date:</strong> ${new Date(record.createdAt).toLocaleString()}</div>
        <button class="btn btn-ghost" onclick="hideModal()">Close</button>
    `);
}

async function updatePatient(e, id) {
    e.preventDefault();
    const data = {
        name: document.getElementById('edit-patient-name').value,
        email: document.getElementById('edit-patient-email').value,
        contactNumber: document.getElementById('edit-patient-phone').value,
        dateOfBirth: document.getElementById('edit-patient-dob').value,
        address: document.getElementById('edit-patient-address').value
    };
    try {
        const result = await apiCall(`/patients/${id}`, 'PUT', data);
        if (result.success) {
            showAlert('Patient updated successfully', 'success');
            hideModal();
            loadAllData();
        } else {
            showAlert('Error updating patient: ' + (result.error?.message || 'Unknown error'), 'error');
        }
    } catch (error) {
        console.error('Error updating patient:', error);
        showAlert('Error updating patient', 'error');
    }
}

async function updateDoctor(e, id) {
    e.preventDefault();
    const data = {
        name: document.getElementById('edit-doctor-name').value,
        email: document.getElementById('edit-doctor-email').value,
        contactNumber: document.getElementById('edit-doctor-phone').value,
        specialization: document.getElementById('edit-doctor-spec').value
    };
    try {
        const result = await apiCall(`/doctors/${id}`, 'PUT', data);
        if (result.success) {
            showAlert('Doctor updated successfully', 'success');
            hideModal();
            loadAllData();
        } else {
            showAlert('Error updating doctor: ' + (result.error?.message || 'Unknown error'), 'error');
        }
    } catch (error) {
        console.error('Error updating doctor:', error);
        showAlert('Error updating doctor', 'error');
    }
}

async function updateAppointment(e, id) {
    e.preventDefault();
    const date = document.getElementById('edit-apt-date').value;
    const time = document.getElementById('edit-apt-time').value;
    const status = document.getElementById('edit-apt-status').value;
    const patientId = document.getElementById('edit-apt-patient').value;
    const doctorId = document.getElementById('edit-apt-doctor').value;
    
    const dateTime = new Date(`${date}T${time}`).toISOString();
    
    const data = {
        patientId,
        doctorId,
        dateTime,
        status
    };
    
    try {
        const result = await apiCall(`/appointments/${id}`, 'PUT', data);
        if (result.success) {
            showAlert('Appointment updated successfully', 'success');
            hideModal();
            loadAllData();
        } else {
            showAlert('Error updating appointment: ' + (result.error?.message || 'Unknown error'), 'error');
        }
    } catch (error) {
        console.error('Error updating appointment:', error);
        showAlert('Error updating appointment', 'error');
    }
}

async function deletePatient(id) {
    if (!confirm('Delete this patient? This cannot be undone.')) return;
    try {
        console.log('Deleting patient with ID:', id);
        const result = await apiCall(`/patients/${id}`, 'DELETE');
        console.log('Delete patient result:', result);
        if (result.success) {
            showAlert('Patient deleted successfully', 'success');
            loadAllData();
        } else {
            console.error('Delete failed:', result);
            showAlert('Error deleting patient: ' + (result.error?.message || 'Unknown error'), 'error');
        }
    } catch (error) {
        console.error('Error deleting patient:', error);
        showAlert('Error deleting patient: ' + error.message, 'error');
    }
}

async function deleteDoctor(id) {
    if (!confirm('Delete this doctor? This cannot be undone.')) return;
    try {
        const result = await apiCall(`/doctors/${id}`, 'DELETE');
        if (result.success) {
            showAlert('Doctor deleted successfully', 'success');
            loadAllData();
        } else {
            showAlert('Error deleting doctor: ' + (result.error?.message || 'Unknown error'), 'error');
        }
    } catch (error) {
        console.error('Error deleting doctor:', error);
        showAlert('Error deleting doctor', 'error');
    }
}

async function deleteAppointment(id) {
    if (!confirm('Delete this appointment?')) return;
    try {
        const result = await apiCall(`/appointments/${id}`, 'DELETE');
        if (result.success) {
            showAlert('Appointment deleted successfully', 'success');
            loadAllData();
        } else {
            showAlert('Error deleting appointment: ' + (result.error?.message || 'Unknown error'), 'error');
        }
    } catch (error) {
        console.error('Error deleting appointment:', error);
        showAlert('Error deleting appointment', 'error');
    }
}

async function deleteRecord(id) {
    if (!confirm('Delete this medical record? This cannot be undone.')) return;
    try {
        const result = await apiCall(`/medical-records/${id}`, 'DELETE');
        if (result.success) {
            showAlert('Medical record deleted successfully', 'success');
            loadAllData();
        } else {
            showAlert('Error deleting medical record: ' + (result.error?.message || 'Unknown error'), 'error');
        }
    } catch (error) {
        console.error('Error deleting medical record:', error);
        showAlert('Error deleting medical record', 'error');
    }
}

function showAlert(message, type = 'success') {
    // Create alert element
    const alert = document.createElement('div');
    alert.className = `alert alert-${type}`;
    alert.innerHTML = `
        <i data-lucide="${type === 'success' ? 'check-circle' : 'alert-circle'}"></i>
        ${message}
    `;
    
    // Add to page
    const container = document.querySelector('.container');
    container.insertBefore(alert, container.firstChild);
    
    // Initialize Lucide icons for the new alert
    if (typeof lucide !== 'undefined') {
        lucide.createIcons();
    }
    
    // Remove after 5 seconds
    setTimeout(() => {
        if (alert.parentNode) {
            alert.parentNode.removeChild(alert);
        }
    }, 5000);
}

function logout() {
    localStorage.clear();
    window.location.href = '/login.html';
}