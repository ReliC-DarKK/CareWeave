# CareWeave Backend API

This document describes the CareWeave Phase 2 (P2) backend REST API surface, authentication model, data models, and caregiver authorization hooks for consumers in Phase 1 (Clinical Engine) and Phase 3 (Frontend).

---

## Base URL

```
http://localhost:3000
```

---

## Authentication & Security Context

### Current Development Authentication Behavior
- In `NODE_ENV=development` and `NODE_ENV=test`, authentication and authorization middleware (`authenticate`, `requireRole`, `requirePatientAccess`) bypass checks to enable local testing and rapid service integration by P1 and P3.
- No `Authorization` header is required for local testing against the development server on port 3000.

### Production Authentication Status
- **Production authentication is NOT yet implemented.**
- In `NODE_ENV=production`, authentication middleware fails closed with `HTTP 501 NOT_IMPLEMENTED`.
- Full authentication enforcement, token verification (e.g. JWT issuance/validation), password handling, and cybersecurity hardening belong to dedicated Cybersecurity / Platform work.

---

## Demo Patient Reference

The database seed populates a complete clinical scenario for development and integration testing:

- **Name:** Jordan Rivera
- **Patient ID:** `fd2a1b68-f434-48d0-a8e1-e613216238ac`
- **User ID:** `0eebd922-7d69-48d7-b404-0a3fc011bf5d`
- **Date of Birth:** `1972-04-18`
- **Clinical Profile:** Stage IIA Invasive Ductal Carcinoma, ER+/PR+/HER2-, hypertension, active medication regimens, diagnostic timeline events, scheduled/past appointments, and care team assignments.
- **Caregiver Grant:** Family caregiver user (`family.caregiver@careweave.example`) linked via `PatientCaregiver` with `FULL_ACCESS` and `ACTIVE` status.

---

## Caregiver Authorization & Data Model

### PatientCaregiver Model
The `PatientCaregiver` join model links a `Patient` with a `User` account whose role is `CAREGIVER`. It models explicit proxy access grants:

| Field | Type | Description |
|---|---|---|
| `id` | String (UUID) | Unique record identifier |
| `patientId` | String (UUID) | Foreign key to `patients.id` |
| `caregiverId` | String (UUID) | Foreign key to `users.id` (caregiver user account) |
| `relationship` | String? | Descriptive relationship (e.g. "Spouse", "Daughter", "Legal Guardian") |
| `accessLevel` | CaregiverAccessLevel | Granted access scope (`FULL_ACCESS`, `READ_ONLY`, `EMERGENCY_ONLY`) |
| `status` | CaregiverGrantStatus | Lifecycle state (`PENDING`, `ACTIVE`, `REVOKED`, `EXPIRED`) |
| `grantedAt` | DateTime | Timestamp when the grant was established |
| `expiresAt` | DateTime? | Optional expiration timestamp |
| `revokedAt` | DateTime? | Optional revocation timestamp |
| `notes` | String? | Administrative or clinical notes regarding the grant |
| `createdAt` | DateTime | Row creation timestamp |
| `updatedAt` | DateTime | Row update timestamp |

### CaregiverAccessLevel Values
- `FULL_ACCESS`: Complete proxy read and write permissions (records, appointments, messages).
- `READ_ONLY`: Read-only access to clinical timeline, medications, and care team.
- `EMERGENCY_ONLY`: Break-glass or acute situational access scope.

### CaregiverGrantStatus Values
- `PENDING`: Grant requested or awaiting patient/provider approval; access denied.
- `ACTIVE`: Valid authorized grant (subject to `expiresAt` validation).
- `REVOKED`: Access explicitly withdrawn by patient or clinician; access denied.
- `EXPIRED`: Grant has lapsed or passed its valid window; access denied.

### Caregiver Access Service Hook
The backend provides a reusable authorization hook in `src/modules/care-team/caregiverAccess.service.ts` (`caregiverAccessService` / `checkCaregiverAccess`):
- Evaluates `patientId` and `caregiverId` pairs.
- Returns structured results distinguishing:
  - No relationship exists (`NO_RELATIONSHIP`)
  - Revoked grant (`REVOKED`)
  - Pending approval (`PENDING`)
  - Expired status or past expiration date (`EXPIRED`)
  - Valid active grant with `FULL_ACCESS`, `READ_ONLY`, or `EMERGENCY_ONLY`
- This hook is ready for integration into route middleware by the Cybersecurity team when JWT token verification is implemented.

---

## Endpoints

### 1. GET /health

- **Purpose:** Server liveness and process readiness check.
- **Method:** `GET`
- **Path:** `/health`
- **Path Parameters:** None
- **Query Parameters:** None
- **Requires Live PostgreSQL:** **No** (serves immediately from process state).

#### Successful Response (200 OK)
```json
{
  "status": "ok",
  "timestamp": "2026-09-19T07:13:27.632Z"
}
```

#### Important Error Responses
- `500 Internal Server Error`: Process fault.
```json
{
  "error": {
    "message": "Internal server error",
    "code": "INTERNAL_ERROR"
  }
}
```

---

### 2. GET /api/v1/patients/:patientId

- **Purpose:** Retrieve core demographic and profile information for a patient.
- **Method:** `GET`
- **Path:** `/api/v1/patients/:patientId`
- **Path Parameters:**
  - `patientId` (string, required): Unique patient identifier.
- **Requires Live PostgreSQL:** **Yes**.

#### Successful Response (200 OK)
```json
{
  "data": {
    "id": "fd2a1b68-f434-48d0-a8e1-e613216238ac",
    "userId": "0eebd922-7d69-48d7-b404-0a3fc011bf5d",
    "firstName": "Jordan",
    "lastName": "Rivera",
    "dateOfBirth": "1972-04-18T00:00:00.000Z",
    "createdAt": "2025-01-15T08:00:00.000Z",
    "updatedAt": "2025-01-15T08:00:00.000Z"
  }
}
```

#### Important Error Responses
- `400 Bad Request`: Validation failure (empty or whitespace parameter).
```json
{
  "error": {
    "message": "Validation failed",
    "code": "VALIDATION_ERROR",
    "details": {
      "patientId": ["patientId must not be empty"]
    }
  }
}
```
- `404 Not Found`: Patient does not exist.
```json
{
  "error": {
    "message": "Patient not found: nonexistent-id",
    "code": "NOT_FOUND"
  }
}
```

---

### 3. GET /api/v1/patients/:patientId/conditions

- **Purpose:** Retrieve active and historical diagnosed medical conditions for a patient, ordered by `createdAt` descending.
- **Method:** `GET`
- **Path:** `/api/v1/patients/:patientId/conditions`
- **Path Parameters:**
  - `patientId` (string, required): Unique patient identifier.
- **Requires Live PostgreSQL:** **Yes**.

#### Successful Response (200 OK)
```json
{
  "data": [
    {
      "id": "c1a2b3c4-d5e6-4f7a-8b9c-0d1e2f3a4b5c",
      "patientId": "fd2a1b68-f434-48d0-a8e1-e613216238ac",
      "name": "Invasive Ductal Carcinoma",
      "description": "Stage IIA, ER+/PR+/HER2-",
      "diagnosedAt": "2025-02-14T00:00:00.000Z",
      "isActive": true,
      "createdAt": "2025-02-14T10:00:00.000Z",
      "updatedAt": "2025-02-14T10:00:00.000Z"
    },
    {
      "id": "c2a2b3c4-d5e6-4f7a-8b9c-0d1e2f3a4b5d",
      "patientId": "fd2a1b68-f434-48d0-a8e1-e613216238ac",
      "name": "Essential Hypertension",
      "description": "Controlled with medication",
      "diagnosedAt": "2019-11-20T00:00:00.000Z",
      "isActive": true,
      "createdAt": "2019-11-20T10:00:00.000Z",
      "updatedAt": "2019-11-20T10:00:00.000Z"
    }
  ]
}
```

#### Important Error Responses
- `400 Bad Request`: Validation failure.
- `404 Not Found`: Patient not found.
```json
{
  "error": {
    "message": "Patient not found: nonexistent-id",
    "code": "NOT_FOUND"
  }
}
```

---

### 4. GET /api/v1/patients/:patientId/timeline

- **Purpose:** Retrieve point-in-time clinical events ordered chronologically (`eventTime` ascending). Preserves complete provenance fields (`sourceType`, `sourceRef`, `recordedAt`, `conditionId`) for P1 care-state engine consumption without transformation.
- **Method:** `GET`
- **Path:** `/api/v1/patients/:patientId/timeline`
- **Path Parameters:**
  - `patientId` (string, required): Unique patient identifier.
- **Requires Live PostgreSQL:** **Yes**.

#### Successful Response (200 OK)
```json
{
  "data": [
    {
      "id": "t1a2b3c4-d5e6-4f7a-8b9c-0d1e2f3a4b5c",
      "patientId": "fd2a1b68-f434-48d0-a8e1-e613216238ac",
      "conditionId": "c1a2b3c4-d5e6-4f7a-8b9c-0d1e2f3a4b5c",
      "type": "DIAGNOSTIC",
      "eventTime": "2025-02-10T09:00:00.000Z",
      "title": "Diagnostic mammogram and ultrasound",
      "description": "Biopsy recommended for suspicious left breast mass",
      "sourceType": "SEED_DATA",
      "sourceRef": "demo-doc-001",
      "recordedAt": "2025-02-10T10:00:00.000Z",
      "createdAt": "2025-02-10T10:00:00.000Z",
      "updatedAt": "2025-02-10T10:00:00.000Z"
    },
    {
      "id": "t2a2b3c4-d5e6-4f7a-8b9c-0d1e2f3a4b5d",
      "patientId": "fd2a1b68-f434-48d0-a8e1-e613216238ac",
      "conditionId": null,
      "type": "NOTE",
      "eventTime": "2025-02-12T16:00:00.000Z",
      "title": "Patient Portal Message",
      "description": "Patient reported mild fatigue and requested appointment clarification",
      "sourceType": "PATIENT_REPORTED",
      "sourceRef": null,
      "recordedAt": "2025-02-12T16:05:00.000Z",
      "createdAt": "2025-02-12T16:05:00.000Z",
      "updatedAt": "2025-02-12T16:05:00.000Z"
    }
  ]
}
```

#### Important Error Responses
- `400 Bad Request`: Validation failure.
- `404 Not Found`: Patient not found.
```json
{
  "error": {
    "message": "Patient not found: nonexistent-id",
    "code": "NOT_FOUND"
  }
}
```

---

### 5. GET /api/v1/patients/:patientId/medications

- **Purpose:** Retrieve medications prescribed to the patient along with nested lifecycle events (`events` array ordered chronologically by `occurredAt` asc).
- **Method:** `GET`
- **Path:** `/api/v1/patients/:patientId/medications`
- **Path Parameters:**
  - `patientId` (string, required): Unique patient identifier.
- **Requires Live PostgreSQL:** **Yes**.

#### Successful Response (200 OK)
```json
{
  "data": [
    {
      "id": "m1a2b3c4-d5e6-4f7a-8b9c-0d1e2f3a4b5c",
      "patientId": "fd2a1b68-f434-48d0-a8e1-e613216238ac",
      "name": "Tamoxifen",
      "dosage": "20mg",
      "frequency": "Once daily",
      "prescribedAt": "2025-03-01T00:00:00.000Z",
      "isActive": true,
      "createdAt": "2025-03-01T08:00:00.000Z",
      "updatedAt": "2025-03-01T08:00:00.000Z",
      "events": [
        {
          "id": "me1a2b3c-d5e6-4f7a-8b9c-0d1e2f3a4b5c",
          "medicationId": "m1a2b3c4-d5e6-4f7a-8b9c-0d1e2f3a4b5c",
          "type": "PRESCRIBED",
          "occurredAt": "2025-03-01T08:00:00.000Z",
          "note": "Initiated adjuvant hormonal therapy",
          "sourceType": "SEED_DATA",
          "sourceRef": null,
          "recordedAt": "2025-03-01T08:00:00.000Z",
          "createdAt": "2025-03-01T08:00:00.000Z"
        },
        {
          "id": "me2a2b3c-d5e6-4f7a-8b9c-0d1e2f3a4b5d",
          "medicationId": "m1a2b3c4-d5e6-4f7a-8b9c-0d1e2f3a4b5c",
          "type": "DISPENSED",
          "occurredAt": "2025-03-02T11:00:00.000Z",
          "note": "Filled 30-day supply",
          "sourceType": "PHARMACY",
          "sourceRef": "rx-2025-03-02-01",
          "recordedAt": "2025-03-02T11:00:00.000Z",
          "createdAt": "2025-03-02T11:00:00.000Z"
        }
      ]
    }
  ]
}
```

#### Important Error Responses
- `400 Bad Request`: Validation failure.
- `404 Not Found`: Patient not found.
```json
{
  "error": {
    "message": "Patient not found: nonexistent-id",
    "code": "NOT_FOUND"
  }
}
```

---

### 6. GET /api/v1/patients/:patientId/appointments

- **Purpose:** Retrieve all appointments for a patient in chronological order (`scheduledAt` ascending), including provider profile details. Passwords and credentials are never exposed.
- **Method:** `GET`
- **Path:** `/api/v1/patients/:patientId/appointments`
- **Path Parameters:**
  - `patientId` (string, required): Unique patient identifier.
- **Requires Live PostgreSQL:** **Yes**.

#### Successful Response (200 OK)
```json
{
  "data": [
    {
      "id": "a1a2b3c4-d5e6-4f7a-8b9c-0d1e2f3a4b5c",
      "patientId": "fd2a1b68-f434-48d0-a8e1-e613216238ac",
      "providerId": "p1a2b3c4-d5e6-4f7a-8b9c-0d1e2f3a4b5c",
      "scheduledAt": "2025-03-10T14:00:00.000Z",
      "durationMinutes": 45,
      "status": "COMPLETED",
      "reason": "Oncology initial consultation",
      "location": "CareWeave Medical Center, Suite 300",
      "createdAt": "2025-03-01T10:00:00.000Z",
      "updatedAt": "2025-03-10T15:00:00.000Z",
      "provider": {
        "id": "p1a2b3c4-d5e6-4f7a-8b9c-0d1e2f3a4b5c",
        "firstName": "Amy",
        "lastName": "Chen",
        "specialty": "Medical Oncology",
        "organization": "CareWeave Demo Medical Group"
      }
    }
  ]
}
```

#### Important Error Responses
- `400 Bad Request`: Validation failure.
- `404 Not Found`: Patient not found.
```json
{
  "error": {
    "message": "Patient not found: nonexistent-id",
    "code": "NOT_FOUND"
  }
}
```

---

### 7. GET /api/v1/patients/:patientId/care-team

- **Purpose:** Retrieve healthcare providers associated with the patient, their care-team role, and provider profile details. Passwords and credentials are never exposed.
- **Method:** `GET`
- **Path:** `/api/v1/patients/:patientId/care-team`
- **Path Parameters:**
  - `patientId` (string, required): Unique patient identifier.
- **Requires Live PostgreSQL:** **Yes**.

#### Successful Response (200 OK)
```json
{
  "data": [
    {
      "id": "pct1a2b3-d5e6-4f7a-8b9c-0d1e2f3a4b5c",
      "patientId": "fd2a1b68-f434-48d0-a8e1-e613216238ac",
      "providerId": "p1a2b3c4-d5e6-4f7a-8b9c-0d1e2f3a4b5c",
      "role": "Medical Oncologist",
      "createdAt": "2025-03-01T10:00:00.000Z",
      "provider": {
        "id": "p1a2b3c4-d5e6-4f7a-8b9c-0d1e2f3a4b5c",
        "firstName": "Amy",
        "lastName": "Chen",
        "specialty": "Medical Oncology",
        "organization": "CareWeave Demo Medical Group"
      }
    },
    {
      "id": "pct2a2b3-d5e6-4f7a-8b9c-0d1e2f3a4b5d",
      "patientId": "fd2a1b68-f434-48d0-a8e1-e613216238ac",
      "providerId": "p2a2b3c4-d5e6-4f7a-8b9c-0d1e2f3a4b5d",
      "role": "Primary Care Physician",
      "createdAt": "2025-03-01T10:00:00.000Z",
      "provider": {
        "id": "p2a2b3c4-d5e6-4f7a-8b9c-0d1e2f3a4b5d",
        "firstName": "Kwame",
        "lastName": "Osei",
        "specialty": "Internal Medicine",
        "organization": "CareWeave Demo Medical Group"
      }
    }
  ]
}
```

#### Important Error Responses
- `400 Bad Request`: Validation failure.
- `404 Not Found`: Patient not found.
```json
{
  "error": {
    "message": "Patient not found: nonexistent-id",
    "code": "NOT_FOUND"
  }
}
```

---

### 8. GET /api/v1/patients/:patientId/care-logic-view

- **Purpose:** Aggregate and normalize raw patient data into the unified data contract consumed by Phase 1 (Clinical Reasoning Engine).
- **Architecture Note:**
  > This endpoint returns the normalized Patient data contract consumed by P1's buildCareLogic(). It does not execute care logic and does not return careState, interactions, nextActions, or summary.
- **Method:** `GET`
- **Path:** `/api/v1/patients/:patientId/care-logic-view`
- **Path Parameters:**
  - `patientId` (string, required): Unique patient identifier.
- **Requires Live PostgreSQL:** **Yes**.

#### Successful Response (200 OK)
```json
{
  "data": {
    "id": "fd2a1b68-f434-48d0-a8e1-e613216238ac",
    "name": "Jordan Rivera",
    "dateOfBirth": "1972-04-18",
    "conditions": [
      {
        "id": "c1a2b3c4-d5e6-4f7a-8b9c-0d1e2f3a4b5c",
        "name": "Breast Cancer",
        "status": "active",
        "diagnosedDate": "2025-03-10"
      },
      {
        "id": "c2a2b3c4-d5e6-4f7a-8b9c-0d1e2f3a4b5d",
        "name": "Type 2 Diabetes",
        "status": "active",
        "diagnosedDate": "2018-06-01"
      },
      {
        "id": "c3a2b3c4-d5e6-4f7a-8b9c-0d1e2f3a4b5e",
        "name": "Hypertension",
        "status": "active",
        "diagnosedDate": "2019-11-20"
      },
      {
        "id": "c4a2b3c4-d5e6-4f7a-8b9c-0d1e2f3a4b5f",
        "name": "Alzheimer's Disease",
        "status": "active",
        "diagnosedDate": "2024-05-12"
      }
    ],
    "medications": [
      {
        "id": "m1a2b3c4-d5e6-4f7a-8b9c-0d1e2f3a4b5c",
        "name": "Doxorubicin/Cyclophosphamide (AC regimen)",
        "dosage": "Per oncology protocol",
        "frequency": "Every 2 weeks",
        "startDate": "2025-03-10",
        "status": "taken"
      },
      {
        "id": "m2a2b3c4-d5e6-4f7a-8b9c-0d1e2f3a4b5d",
        "name": "Metformin",
        "dosage": "500mg",
        "frequency": "Twice daily",
        "startDate": "2018-06-05",
        "status": "missed"
      },
      {
        "id": "m3a2b3c4-d5e6-4f7a-8b9c-0d1e2f3a4b5e",
        "name": "Lisinopril",
        "dosage": "10mg",
        "frequency": "Once daily",
        "startDate": "2019-11-22",
        "status": "taken"
      }
    ],
    "labs": [
      {
        "id": "l1a2b3c4-d5e6-4f7a-8b9c-0d1e2f3a4b5c",
        "name": "HbA1c",
        "value": 8.2,
        "unit": "%",
        "referenceRange": "< 7.0%",
        "date": "2026-09-16",
        "conditionId": "c2a2b3c4-d5e6-4f7a-8b9c-0d1e2f3a4b5d"
      },
      {
        "id": "l2a2b3c4-d5e6-4f7a-8b9c-0d1e2f3a4b5d",
        "name": "Hemoglobin",
        "value": 10.8,
        "unit": "g/dL",
        "referenceRange": "12.0–16.0 g/dL",
        "date": "2026-09-15",
        "conditionId": "c1a2b3c4-d5e6-4f7a-8b9c-0d1e2f3a4b5c"
      }
    ],
    "appointments": [
      {
        "id": "a1a2b3c4-d5e6-4f7a-8b9c-0d1e2f3a4b5c",
        "title": "Routine diabetes labs review",
        "date": "2025-08-01",
        "time": "09:00",
        "clinician": "Dr. Kwame Osei"
      },
      {
        "id": "a2a2b3c4-d5e6-4f7a-8b9c-0d1e2f3a4b5d",
        "title": "Chemotherapy cycle follow-up",
        "date": "2025-09-25",
        "time": "14:00",
        "clinician": "Dr. Amy Chen"
      },
      {
        "id": "a3a2b3c4-d5e6-4f7a-8b9c-0d1e2f3a4b5e",
        "title": "Diabetes and hypertension check-in",
        "date": "2025-10-02",
        "time": "09:30",
        "clinician": "Dr. Kwame Osei"
      }
    ],
    "symptoms": [
      {
        "id": "s1a2b3c4-d5e6-4f7a-8b9c-0d1e2f3a4b5c",
        "name": "Fatigue",
        "severity": "moderate",
        "date": "2026-09-17",
        "conditionId": "c1a2b3c4-d5e6-4f7a-8b9c-0d1e2f3a4b5c"
      },
      {
        "id": "s2a2b3c4-d5e6-4f7a-8b9c-0d1e2f3a4b5d",
        "name": "Medication confusion",
        "severity": "moderate",
        "date": "2026-09-17",
        "conditionId": "c4a2b3c4-d5e6-4f7a-8b9c-0d1e2f3a4b5f"
      }
    ],
    "timeline": [
      {
        "id": "t1a2b3c4-d5e6-4f7a-8b9c-0d1e2f3a4b5c",
        "type": "diagnosis",
        "date": "2025-03-05T00:00:00.000Z",
        "title": "Diagnostic mammogram and biopsy",
        "description": "Biopsy confirmed malignancy; staging workup ordered.",
        "conditionId": "c1a2b3c4-d5e6-4f7a-8b9c-0d1e2f3a4b5c",
        "metadata": {
          "sourceType": "SEED_DATA",
          "sourceRef": "demo-doc-001",
          "recordedAt": "2025-03-05T00:00:00.000Z"
        }
      }
    ]
  }
}
```

#### Important Error Responses
- `400 Bad Request`: Validation failure (empty or whitespace parameter).
- `404 Not Found`: Patient not found.
```json
{
  "error": {
    "message": "Patient not found: nonexistent-id",
    "code": "NOT_FOUND"
  }
}
```

---

### 9. POST /api/v1/patients/:patientId/documents

- **Purpose:** Upload, validate, and process a clinical PDF document for a patient.
- **Architecture Boundary:**
  - **P2 (Backend):** Owns file validation, multipart handling, size limiting (10MB max), raw text extraction, document metadata storage, and provenance tracking.
  - **P1 (Clinical Engine):** Owns clinical document extraction and interpretation. P2 hands off the raw extracted text to P1's document extractor boundary (`DefaultP1DocumentExtractor` / `P1DocumentExtractor`). P2 never performs clinical reasoning or invents medical concepts.
  - **P3 (Frontend):** Sends the PDF via `multipart/form-data` and renders the returned structured clinical concepts.
- **Method:** `POST`
- **Path:** `/api/v1/patients/:patientId/documents`
- **Path Parameters:**
  - `patientId` (string, required): Unique patient identifier.
- **Content-Type:** `multipart/form-data`
- **Request Body:**
  - Form field containing the PDF file (e.g. `file: <binary PDF buffer>`, `filename: "discharge_summary.pdf"`).
- **Constraints & Validations:**
  - Patient must exist in the database (returns `404 Not Found` if nonexistent).
  - Content must be a valid PDF (`mimetype: application/pdf` or `.pdf` extension, verified with `%PDF-` magic bytes header).
  - Maximum upload file size: 10MB (`10485760` bytes). Exceeding this returns `413 Payload Too Large`.
- **Requires Live PostgreSQL:** **Yes** (validates patient existence and records a timeline event with document provenance).

#### Successful Response (201 Created)
```json
{
  "data": {
    "document": {
      "id": "e4b2d184-72bf-4638-bd91-30ef118c7e99",
      "patientId": "fd2a1b68-f434-48d0-a8e1-e613216238ac",
      "originalFilename": "discharge_summary.pdf",
      "mimeType": "application/pdf",
      "sizeBytes": 24576,
      "uploadedAt": "2026-09-19T09:15:00.000Z",
      "extractionStatus": "COMPLETED",
      "provenance": {
        "sourceType": "DOCUMENT_UPLOAD",
        "sourceRef": "e4b2d184-72bf-4638-bd91-30ef118c7e99"
      }
    },
    "extractedText": "Patient seen on 2025-03-10. Diagnosed with Breast Cancer. Prescribed Metformin 500mg. HbA1c: 6.8%.",
    "clinicalData": {
      "conditions": [
        {
          "name": "Breast Cancer",
          "status": "active"
        }
      ],
      "medications": [
        {
          "name": "Metformin",
          "dosage": "500mg",
          "frequency": "Twice daily",
          "status": "prescribed"
        }
      ],
      "labs": [
        {
          "name": "HbA1c",
          "value": 6.8,
          "unit": "%",
          "referenceRange": "< 7.0%"
        }
      ],
      "appointments": [],
      "symptoms": [],
      "timelineEvents": [
        {
          "type": "treatment",
          "title": "Clinical Document Extraction: discharge_summary.pdf",
          "description": "Extracted clinical concepts from discharge_summary.pdf"
        }
      ]
    }
  }
}
```

#### Important Error Responses
- `400 Bad Request`: Non-multipart request, missing file, non-PDF MIME type, or invalid `%PDF-` header.
```json
{
  "error": {
    "message": "Invalid file type: only PDF documents are supported",
    "code": "BAD_REQUEST",
    "details": {
      "receivedMime": "image/png",
      "filename": "scan.png"
    }
  }
}
```
- `404 Not Found`: Patient does not exist.
```json
{
  "error": {
    "message": "Patient not found: nonexistent-patient",
    "code": "NOT_FOUND"
  }
}
```
- `413 Payload Too Large`: Uploaded file exceeds the 10MB limit.
```json
{
  "error": {
    "message": "Document size exceeds maximum allowed limit of 10MB",
    "code": "PAYLOAD_TOO_LARGE",
    "details": {
      "maxBytes": 10485760
    }
  }
}
```

---

### 10. GET /api/v1/patients/:patientId/documents/:documentId

- **Purpose:** Retrieve metadata and provenance information for a previously processed document.
- **Method:** `GET`
- **Path:** `/api/v1/patients/:patientId/documents/:documentId`
- **Path Parameters:**
  - `patientId` (string, required): Unique patient identifier.
  - `documentId` (string, required): Unique document identifier.

#### Successful Response (200 OK)
```json
{
  "data": {
    "id": "e4b2d184-72bf-4638-bd91-30ef118c7e99",
    "patientId": "fd2a1b68-f434-48d0-a8e1-e613216238ac",
    "originalFilename": "discharge_summary.pdf",
    "mimeType": "application/pdf",
    "sizeBytes": 24576,
    "uploadedAt": "2026-09-19T09:15:00.000Z",
    "extractionStatus": "COMPLETED",
    "provenance": {
      "sourceType": "DOCUMENT_UPLOAD",
      "sourceRef": "e4b2d184-72bf-4638-bd91-30ef118c7e99"
    }
  }
}
```

---

### 11. GET /api/v1/patients/:patientId/care-logic

- **Purpose:** Executes Phase 1's clinical engine server-side by passing the normalized Patient data model to P1's `buildCareLogic(patient, referenceDate)`. Returns the complete synthesized care logic payload to the frontend.
- **Architecture Boundary:**
  - **P2 (Backend):** Responsible for data retrieval, normalization (via `careLogicViewService`), and server-side execution of P1's `buildCareLogic()`. P2 performs zero clinical calculations, rule evaluations, or summaries independently.
  - **P1 (Clinical Engine):** Encapsulated within the `@careweave/care-logic` package. Owns `timeline`, `careState`, `interactions`, `nextActions`, and `summary` synthesis.
  - **P3 (Frontend):** Renders the unified care plan, timeline, signals, and recommended next actions.
- **Method:** `GET`
- **Path:** `/api/v1/patients/:patientId/care-logic`
- **Path Parameters:**
  - `patientId` (string, required): Unique patient identifier.
- **Query Parameters:**
  - `referenceDate` (string, optional): Target point-in-time calculation date in `YYYY-MM-DD` format (e.g. `?referenceDate=2026-09-19`).
- **Reference Date Behavior:**
  - If provided, P1 evaluates recent symptoms, active regimens, upcoming appointments, and alert signals relative to this date.
  - If omitted or blank, defaults to the server's current date formatted as `YYYY-MM-DD`.
- **Required Headers:**
  - `Accept: application/json`
  - In development (`NODE_ENV=development` or `test`), authentication middleware is bypassed for local integration testing. In production, authorization tokens are enforced.
- **Requires Live PostgreSQL:** **Yes**.

#### Successful Response (200 OK)
```json
{
  "data": {
    "timeline": [
      {
        "id": "t1a2b3c4-d5e6-4f7a-8b9c-0d1e2f3a4b5c",
        "type": "diagnosis",
        "date": "2025-03-10",
        "title": "Biopsy confirmed malignancy",
        "description": "Stage IIA, hormone receptor positive",
        "conditionId": "c1a2b3c4-d5e6-4f7a-8b9c-0d1e2f3a4b5c"
      },
      {
        "id": "lab-l1a2b3c4-d5e6-4f7a-8b9c-0d1e2f3a4b5c",
        "type": "lab",
        "date": "2026-09-16",
        "title": "HbA1c: 8.2 %",
        "description": "Reference range: < 7.0%"
      }
    ],
    "careState": {
      "patientId": "fd2a1b68-f434-48d0-a8e1-e613216238ac",
      "referenceDate": "2026-09-19",
      "overallStatus": "needs-attention",
      "activeConditions": [
        {
          "id": "c1a2b3c4-d5e6-4f7a-8b9c-0d1e2f3a4b5c",
          "name": "Breast Cancer",
          "status": "active"
        },
        {
          "id": "c2a2b3c4-d5e6-4f7a-8b9c-0d1e2f3a4b5d",
          "name": "Type 2 Diabetes",
          "status": "active"
        }
      ],
      "recentSymptoms": [
        {
          "id": "s1a2b3c4-d5e6-4f7a-8b9c-0d1e2f3a4b5c",
          "name": "Fatigue",
          "severity": "moderate",
          "date": "2026-09-17"
        }
      ],
      "recentLabs": [
        {
          "id": "l1a2b3c4-d5e6-4f7a-8b9c-0d1e2f3a4b5c",
          "name": "HbA1c",
          "value": 8.2,
          "unit": "%",
          "referenceRange": "< 7.0%",
          "date": "2026-09-16"
        }
      ],
      "medicationAdherence": [],
      "upcomingAppointments": [],
      "attentionSignals": [
        "Recent moderate symptom: Fatigue"
      ]
    },
    "interactions": [],
    "nextActions": [],
    "summary": {
      "headline": "Care needs attention",
      "summary": "The patient is currently being monitored across Breast Cancer, Type 2 Diabetes. Recent symptoms, medication adherence, and upcoming appointments have been considered together to identify the most relevant next steps.",
      "priorities": [],
      "upcomingCare": []
    }
  }
}
```

#### Important Error Responses
- `400 Bad Request`: Validation failure.
- `404 Not Found`: Patient not found.
```json
{
  "error": {
    "message": "Patient not found: nonexistent-patient",
    "code": "NOT_FOUND"
  }
}
```

---

## Standard Error Response Envelopes

All error responses return a standardized, safe JSON envelope:

### 400 Validation Error
```json
{
  "error": {
    "message": "Validation failed",
    "code": "VALIDATION_ERROR",
    "details": {
      "fieldName": ["Validation error description"]
    }
  }
}
```

### 404 Not Found Error
```json
{
  "error": {
    "message": "Route not found: GET /unknown-route",
    "code": "NOT_FOUND"
  }
}
```

### 500 Internal Error
```json
{
  "error": {
    "message": "Internal server error",
    "code": "INTERNAL_ERROR"
  }
}
```
*(Internal error details and stack traces are suppressed in HTTP responses to prevent information leakage).*
