# CareWeave Security Contract

## 1. Scope

This document defines security expectations for the CareWeave healthcare coordination prototype.

## 2. Data Classification

Treat patient names, MRNs, diagnoses, laboratory results, medications, appointments, clinical notes, messages, and clinician contact information as sensitive healthcare-related data.

The current project uses fictional/demo data only.

## 3. User Roles

Define these roles:

* Patient
  * May access their own healthcare information.
* Doctor
  * May access patients they are authorized/assigned to.
* Caregiver
  * May access patients for whom access has been granted.

## 4. Authentication

Protected application functionality must require an authenticated user.

Authentication will eventually be provided by the backend/authentication system.

The frontend must never treat a hardcoded patient identity as proof of authentication.

## 5. Authorization

Frontend route and UI checks are for user experience only.

Actual authorization must be enforced by the backend.

The frontend must never be trusted to decide whether a user may access another patient's records.

The backend must determine the authenticated user's identity and role and verify patient-level access.

## 6. Input Validation

All user-controlled input must be validated.

Validation must eventually exist on both:

* frontend, for usability
* backend, for security

File uploads require restrictions on:

* file type
* file size
* filename handling

## 7. Sensitive Data Handling

Do not use real patient information in this prototype.

Avoid storing sensitive healthcare data in localStorage or sessionStorage unless there is an explicit architectural requirement.

Do not place secrets, database credentials, signing keys, or private API keys in frontend code.

## 8. API Security

When backend APIs are integrated:

* authenticated requests must be required for protected endpoints
* backend authorization must be enforced
* patient identifiers supplied by the client must not be trusted by themselves
* server responses should contain only data required by the frontend
* errors must not expose stack traces, secrets, or internal implementation details

## 9. Frontend Security

The frontend should:

* protect application routes
* validate user input
* avoid unsafe HTML injection
* safely handle external links and URI schemes
* avoid exposing secrets
* use a controlled API/service layer

## 10. Content Security

The application should use an appropriate Content Security Policy before production deployment.

External resources should be explicitly controlled.

## 11. Security Testing

Before the prototype is considered complete, test:

* unauthenticated route access
* logout/session behavior
* role restrictions
* patient-to-patient access restrictions
* invalid input
* malicious filenames
* oversized uploads
* sensitive data storage
* exposed secrets
* dependency vulnerabilities
* production build

## 12. Backend Responsibility

The backend owner must implement:

* authentication verification
* server-side authorization
* patient-level access control
* server-side input validation
* secure API responses
* secret management

Frontend security controls must never be considered a replacement for backend authorization.
