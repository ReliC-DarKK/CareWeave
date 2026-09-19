/**
 * CareWeave — Role Definitions
 *
 * Defines application-wide role constants and the collection of supported roles.
 * Authorization rules and patient-level access control belong to the backend.
 */

export const ROLES = Object.freeze({
  PATIENT: 'PATIENT',
  DOCTOR: 'DOCTOR',
  CAREGIVER: 'CAREGIVER',
});

export const { PATIENT, DOCTOR, CAREGIVER } = ROLES;

export const SUPPORTED_ROLES = Object.freeze(Object.values(ROLES));

export function isSupportedRole(role) {
  return SUPPORTED_ROLES.includes(role);
}
