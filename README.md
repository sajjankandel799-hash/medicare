# Hospital Management System

A comprehensive file-based hospital management system built with TypeScript. This system manages patient records, doctor information, appointments, and medical records using JSON files for data persistence.

## Features

- **Patient Management**: Register, search, and update patient information
- **Doctor Management**: Register, search, and update doctor profiles
- **Appointment Scheduling**: Schedule, view, and manage appointments
- **Medical Records**: Create and view patient medical histories
- **File-based Storage**: No database required - uses JSON files for persistence
- **Interactive CLI**: User-friendly command-line interface

## Installation

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```

3. Build the project:
   ```bash
   npm run build
   ```

## Usage

### Running the CLI

Start the interactive CLI application:

```bash
npm start
```

or

```bash
npm run cli
```

### CLI Features

The CLI provides an interactive menu system with the following options:

#### 1. Patient Management
- Register new patients with personal information
- Search patients by ID or name
- Update existing patient information
- View complete patient profiles

#### 2. Doctor Management
- Register new doctors with specialization
- Search doctors by ID
- List all doctors in the system
- Update doctor information

#### 3. Appointment Management
- Schedule new appointments between patients and doctors
- Search appointments by ID
- View all appointments for a specific patient or doctor
- Update appointment status (scheduled, completed, cancelled)
- Cancel appointments

#### 4. Medical Records
- Create new medical records for patients
- Search medical records by ID
- View complete medical history for patients
- Track diagnoses, treatments, and notes

## Data Storage

The system stores all data in JSON files within a `data/` directory:

```
data/
├── patients/
│   ├── PAT-{timestamp}-{random}.json
│   └── ...
├── doctors/
│   ├── DOC-{timestamp}-{random}.json
│   └── ...
├── appointments/
│   ├── APT-{timestamp}-{random}.json
│   └── ...
└── medical-records/
    ├── MED-{timestamp}-{random}.json
    └── ...
```

## Development

### Running Tests

Run all tests:
```bash
npm test
```

Run tests in watch mode:
```bash
npm run test:watch
```

### Building

Build the TypeScript code:
```bash
npm run build
```

## System Requirements

- Node.js 16 or higher
- TypeScript 5.0 or higher

## Architecture

The system follows a layered architecture:

- **Data Layer**: File I/O operations and JSON serialization
- **Business Logic Layer**: Core hospital management operations and validation
- **Presentation Layer**: Interactive CLI interface

## Error Handling

The system includes comprehensive error handling for:
- Invalid data validation
- File system operations
- Referential integrity checks
- Corrupted data recovery

## License

ISC License