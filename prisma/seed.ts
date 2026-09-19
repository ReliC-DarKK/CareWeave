/**
 * Fictional demo seed data for CareWeave.
 *
 * Represents ONE fictional patient with three conditions (Breast Cancer,
 * Type 2 Diabetes, Hypertension), plus representative timeline events,
 * medications, medication events, appointments, providers, and care-team
 * relationships. None of this is real patient information.
 *
 * UNVERIFIED: this script has not been executed in this environment
 * (no PostgreSQL / no installed dependencies here). Run it yourself with
 * `npm run seed` after migrating.
 */
import {
  PrismaClient,
  UserRole,
  TimelineEventType,
  MedicationEventType,
  AppointmentStatus,
  CaregiverAccessLevel,
  CaregiverGrantStatus,
  SymptomSeverity,
} from "@prisma/client";

const prisma = new PrismaClient();

// Fixed-but-fake password hash placeholder — never a real bcrypt/argon2
// hash of a real password. Replace with a real hashing call once auth is
// implemented.
const DEMO_PASSWORD_HASH = "demo-hash-not-a-real-password-hash";
const DEMO_PATIENT_USER_ID = "0eebd922-7d69-48d7-b404-0a3fc011bf5d";
const DEMO_PATIENT_ID = "fd2a1b68-f434-48d0-a8e1-e613216238ac";

async function main(): Promise<void> {
  console.log("Seeding fictional CareWeave demo data...");

  // Clean up existing demo users/providers for idempotent re-seeding:
  await prisma.user.deleteMany({
    where: {
      email: {
        in: [
          "demo.patient@careweave.example",
          "dr.chen@careweave.example",
          "dr.osei@careweave.example",
          "family.caregiver@careweave.example",
        ],
      },
    },
  });
  await prisma.provider.deleteMany({
    where: {
      organization: "CareWeave Demo Medical Group",
    },
  });

  // --- Patient user + patient record -------------------------------------
  const patientUser = await prisma.user.create({
    data: {
      id: DEMO_PATIENT_USER_ID,
      email: "demo.patient@careweave.example",
      passwordHash: DEMO_PASSWORD_HASH,
      role: UserRole.PATIENT,
    },
  });

  const patient = await prisma.patient.create({
    data: {
      id: DEMO_PATIENT_ID,
      userId: patientUser.id,
      firstName: "Jordan",
      lastName: "Rivera",
      dateOfBirth: new Date("1972-04-18"),
    },
  });

  // --- Providers -----------------------------------------------------------
  const oncologistUser = await prisma.user.create({
    data: {
      email: "dr.chen@careweave.example",
      passwordHash: DEMO_PASSWORD_HASH,
      role: UserRole.DOCTOR,
    },
  });
  const oncologist = await prisma.provider.create({
    data: {
      userId: oncologistUser.id,
      firstName: "Amy",
      lastName: "Chen",
      specialty: "Oncology",
      organization: "CareWeave Demo Medical Group",
    },
  });

  const pcpUser = await prisma.user.create({
    data: {
      email: "dr.osei@careweave.example",
      passwordHash: DEMO_PASSWORD_HASH,
      role: UserRole.DOCTOR,
    },
  });
  const pcp = await prisma.provider.create({
    data: {
      userId: pcpUser.id,
      firstName: "Kwame",
      lastName: "Osei",
      specialty: "Primary Care",
      organization: "CareWeave Demo Medical Group",
    },
  });

  const caregiverUser = await prisma.user.create({
    data: {
      email: "family.caregiver@careweave.example",
      passwordHash: DEMO_PASSWORD_HASH,
      role: UserRole.CAREGIVER,
    },
  });

  // --- Care team -------------------------------------------------------------
  await prisma.patientCareTeam.createMany({
    data: [
      { patientId: patient.id, providerId: oncologist.id, role: "Oncologist" },
      { patientId: patient.id, providerId: pcp.id, role: "Primary Care Physician" },
    ],
  });
  // --- Caregiver relationship ------------------------------------------------
  await prisma.patientCaregiver.create({
    data: {
      patientId: patient.id,
      caregiverId: caregiverUser.id,
      relationship: "Family Caregiver / Daughter",
      accessLevel: CaregiverAccessLevel.FULL_ACCESS,
      status: CaregiverGrantStatus.ACTIVE,
    },
  });

  // --- Conditions ------------------------------------------------------------
  const breastCancer = await prisma.condition.create({
    data: {
      patientId: patient.id,
      name: "Breast Cancer",
      description: "Stage II, hormone receptor positive (fictional demo data).",
      diagnosedAt: new Date("2025-03-10"),
      isActive: true,
    },
  });

  const type2Diabetes = await prisma.condition.create({
    data: {
      patientId: patient.id,
      name: "Type 2 Diabetes",
      description: "Diagnosed several years prior; managed with medication (fictional demo data).",
      diagnosedAt: new Date("2018-06-01"),
      isActive: true,
    },
  });

  const hypertension = await prisma.condition.create({
    data: {
      patientId: patient.id,
      name: "Hypertension",
      description: "Managed with medication (fictional demo data).",
      diagnosedAt: new Date("2019-11-20"),
      isActive: true,
    },
  });

  const alzheimers = await prisma.condition.create({
    data: {
      patientId: patient.id,
      name: "Alzheimer's Disease",
      description: "Mild cognitive impairment (fictional demo data).",
      diagnosedAt: new Date("2024-05-12"),
      isActive: true,
    },
  });

  // --- Timeline events ---------------------------------------------------
  await prisma.timelineEvent.createMany({
    data: [
      {
        patientId: patient.id,
        conditionId: breastCancer.id,
        type: TimelineEventType.DIAGNOSTIC,
        eventTime: new Date("2025-03-05"),
        title: "Diagnostic mammogram and biopsy",
        description: "Biopsy confirmed malignancy; staging workup ordered.",
        sourceType: "SEED_DATA",
        sourceRef: "demo-doc-001",
      },
      {
        patientId: patient.id,
        conditionId: breastCancer.id,
        type: TimelineEventType.CLINICAL_ENCOUNTER,
        eventTime: new Date("2025-03-10"),
        title: "Oncology consultation — diagnosis confirmed",
        description: "Stage II breast cancer diagnosis discussed; treatment plan initiated.",
        sourceType: "SEED_DATA",
        sourceRef: "demo-doc-002",
      },
      {
        patientId: patient.id,
        conditionId: breastCancer.id,
        type: TimelineEventType.MEDICATION,
        eventTime: new Date("2025-03-15"),
        title: "Chemotherapy regimen started",
        description: "First cycle of adjuvant chemotherapy administered.",
        sourceType: "SEED_DATA",
        sourceRef: "demo-doc-003",
      },
      {
        patientId: patient.id,
        conditionId: type2Diabetes.id,
        type: TimelineEventType.LAB,
        eventTime: new Date("2025-08-01"),
        title: "HbA1c panel",
        description: "Routine diabetes monitoring labs drawn.",
        sourceType: "SEED_DATA",
        sourceRef: "demo-doc-004",
      },
      {
        patientId: patient.id,
        conditionId: hypertension.id,
        type: TimelineEventType.OBSERVATION,
        eventTime: new Date("2025-09-01"),
        title: "Blood pressure reading",
        description: "142/90 mmHg recorded at primary care visit.",
        sourceType: "SEED_DATA",
        sourceRef: "demo-doc-005",
      },
      {
        patientId: patient.id,
        conditionId: null,
        type: TimelineEventType.NOTE,
        eventTime: new Date("2025-09-10"),
        title: "Patient-reported fatigue",
        description: "Patient reported increased fatigue via portal message.",
        sourceType: "PATIENT_REPORTED",
        sourceRef: null,
      },
    ],
  });

  // --- Medications + medication events ------------------------------------
  const chemoMed = await prisma.medication.create({
    data: {
      patientId: patient.id,
      name: "Doxorubicin/Cyclophosphamide (AC regimen)",
      dosage: "Per oncology protocol",
      frequency: "Every 2 weeks",
      prescribedAt: new Date("2025-03-10"),
      isActive: true,
    },
  });

  await prisma.medicationEvent.createMany({
    data: [
      {
        medicationId: chemoMed.id,
        type: MedicationEventType.PRESCRIBED,
        occurredAt: new Date("2025-03-10"),
        sourceType: "SEED_DATA",
      },
      {
        medicationId: chemoMed.id,
        type: MedicationEventType.DISPENSED,
        occurredAt: new Date("2025-03-14"),
        sourceType: "SEED_DATA",
      },
      {
        medicationId: chemoMed.id,
        type: MedicationEventType.TAKEN,
        occurredAt: new Date("2025-03-15"),
        note: "Cycle 1, administered in infusion center.",
        sourceType: "SEED_DATA",
      },
    ],
  });

  const metforminMed = await prisma.medication.create({
    data: {
      patientId: patient.id,
      name: "Metformin",
      dosage: "500mg",
      frequency: "Twice daily",
      prescribedAt: new Date("2018-06-05"),
      isActive: true,
    },
  });

  await prisma.medicationEvent.createMany({
    data: [
      {
        medicationId: metforminMed.id,
        type: MedicationEventType.PRESCRIBED,
        occurredAt: new Date("2018-06-05"),
        sourceType: "SEED_DATA",
      },
      {
        medicationId: metforminMed.id,
        type: MedicationEventType.TAKEN,
        occurredAt: new Date("2025-09-15"),
        sourceType: "SEED_DATA",
      },
      {
        medicationId: metforminMed.id,
        type: MedicationEventType.MISSED,
        occurredAt: new Date("2025-09-16"),
        note: "Patient reported missing evening dose.",
        sourceType: "PATIENT_REPORTED",
      },
    ],
  });

  const lisinoprilMed = await prisma.medication.create({
    data: {
      patientId: patient.id,
      name: "Lisinopril",
      dosage: "10mg",
      frequency: "Once daily",
      prescribedAt: new Date("2019-11-22"),
      isActive: true,
    },
  });

  await prisma.medicationEvent.createMany({
    data: [
      {
        medicationId: lisinoprilMed.id,
        type: MedicationEventType.PRESCRIBED,
        occurredAt: new Date("2019-11-22"),
        sourceType: "SEED_DATA",
      },
      {
        medicationId: lisinoprilMed.id,
        type: MedicationEventType.TAKEN,
        occurredAt: new Date("2025-09-17"),
        sourceType: "SEED_DATA",
      },
    ],
  });

  // --- Appointments ---------------------------------------------------------
  await prisma.appointment.createMany({
    data: [
      {
        patientId: patient.id,
        providerId: oncologist.id,
        scheduledAt: new Date("2025-09-25T14:00:00Z"),
        durationMinutes: 30,
        status: AppointmentStatus.SCHEDULED,
        reason: "Chemotherapy cycle follow-up",
        location: "Infusion Center, Room 4",
      },
      {
        patientId: patient.id,
        providerId: pcp.id,
        scheduledAt: new Date("2025-10-02T09:30:00Z"),
        durationMinutes: 20,
        status: AppointmentStatus.SCHEDULED,
        reason: "Diabetes and hypertension check-in",
        location: "Primary Care Clinic",
      },
      {
        patientId: patient.id,
        providerId: pcp.id,
        scheduledAt: new Date("2025-08-01T09:00:00Z"),
        durationMinutes: 20,
        status: AppointmentStatus.COMPLETED,
        reason: "Routine diabetes labs review",
        location: "Primary Care Clinic",
      },
    ],
  });

  // --- Lab results ----------------------------------------------------------
  await prisma.labResult.createMany({
    data: [
      {
        patientId: patient.id,
        conditionId: type2Diabetes.id,
        name: "HbA1c",
        value: 8.2,
        unit: "%",
        referenceRange: "< 7.0%",
        date: new Date("2026-09-16"),
      },
      {
        patientId: patient.id,
        conditionId: breastCancer.id,
        name: "Hemoglobin",
        value: 10.8,
        unit: "g/dL",
        referenceRange: "12.0–16.0 g/dL",
        date: new Date("2026-09-15"),
      },
    ],
  });

  // --- Symptoms -------------------------------------------------------------
  await prisma.symptom.createMany({
    data: [
      {
        patientId: patient.id,
        conditionId: breastCancer.id,
        name: "Fatigue",
        severity: SymptomSeverity.MODERATE,
        date: new Date("2026-09-17"),
      },
      {
        patientId: patient.id,
        conditionId: alzheimers.id,
        name: "Medication confusion",
        severity: SymptomSeverity.MODERATE,
        date: new Date("2026-09-17"),
      },
    ],
  });

  console.log("Seed complete.");
  console.log(`  Patient: ${patient.firstName} ${patient.lastName} (${patient.id})`);
}

main()
  .catch((err: unknown) => {
    console.error("Seed failed:", err);
    process.exitCode = 1;
  })
  .finally(() => {
    void prisma.$disconnect();
  });
