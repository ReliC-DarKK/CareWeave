import { Patient } from "../types/patient";
import { NormalizedClinicalData } from "./documentNormalizer";

function normalizeConditionName(
  name: string
): string {
  return name
    .toLowerCase()
    .replace(/\bmellitus\b/g, "")
    .replace(/[^a-z0-9]+/g, " ")
    .trim()
    .replace(/\s+/g, " ");
}

function normalizeTime(
  time: string
): string {
  const match = time
    .trim()
    .toUpperCase()
    .match(
      /^(\d{1,2}):(\d{2})\s*(AM|PM)$/
    );

  if (
    !match ||
    !match[1] ||
    !match[2] ||
    !match[3]
  ) {
    return time.trim().toUpperCase();
  }

  const hour = match[1].padStart(2, "0");
  const minute = match[2];
  const period = match[3];

  return `${hour}:${minute} ${period}`;
}

export function mergeDocumentWithPatient(
  patient: Patient,
  documentData: NormalizedClinicalData
): Patient {
  /*
   * --------------------------------------------------
   * CONDITIONS
   * --------------------------------------------------
   */

  const existingConditionMap =
    new Map<string, string>();

  for (const condition of patient.conditions) {
    existingConditionMap.set(
      normalizeConditionName(condition.name),
      condition.id
    );
  }

  const conditionIdMap =
    new Map<string, string>();

  const newConditions = [];

  for (const condition of documentData.conditions) {
    const normalizedName =
      normalizeConditionName(condition.name);

    const existingId =
      existingConditionMap.get(normalizedName);

    if (existingId) {
      conditionIdMap.set(
        condition.id,
        existingId
      );
    } else {
      newConditions.push(condition);

      conditionIdMap.set(
        condition.id,
        condition.id
      );

      existingConditionMap.set(
        normalizedName,
        condition.id
      );
    }
  }

  const conditions = [
    ...patient.conditions,
    ...newConditions,
  ];

  /*
   * --------------------------------------------------
   * MEDICATIONS
   * --------------------------------------------------
   */

  const existingMedicationNames = new Set(
    patient.medications.map((medication) =>
      medication.name.toLowerCase()
    )
  );

  const newMedications =
    documentData.medications.filter(
      (medication) =>
        !existingMedicationNames.has(
          medication.name.toLowerCase()
        )
    );

  const medications = [
    ...patient.medications,
    ...newMedications,
  ];

  /*
   * --------------------------------------------------
   * LABS
   * --------------------------------------------------
   */

  const existingLabKeys = new Set(
    patient.labs.map(
      (lab) =>
        `${lab.name.toLowerCase()}|${lab.date}|${lab.value}`
    )
  );

  const newLabs = documentData.labs
    .filter(
      (lab) =>
        !existingLabKeys.has(
          `${lab.name.toLowerCase()}|${lab.date}|${lab.value}`
        )
    )
    .map((lab) => ({
      ...lab,
      conditionId: lab.conditionId
        ? conditionIdMap.get(
            lab.conditionId
          )
        : undefined,
    }));

  const labs = [
    ...patient.labs,
    ...newLabs,
  ];

  /*
   * --------------------------------------------------
   * APPOINTMENTS
   * --------------------------------------------------
   */

  const existingAppointmentKeys =
    new Set(
      patient.appointments.map(
        (appointment) =>
          `${appointment.title.toLowerCase()}|${appointment.date}|${normalizeTime(appointment.time)}`
      )
    );

  const newAppointments =
    documentData.appointments
      .filter(
        (appointment) =>
          !existingAppointmentKeys.has(
            `${appointment.title.toLowerCase()}|${appointment.date}|${normalizeTime(appointment.time)}`
          )
      )
      .map((appointment) => ({
        ...appointment,
        conditionId: appointment.conditionId
          ? conditionIdMap.get(
              appointment.conditionId
            )
          : undefined,
      }));

  const appointments = [
    ...patient.appointments,
    ...newAppointments,
  ];

  /*
   * --------------------------------------------------
   * SYMPTOMS
   * --------------------------------------------------
   */

  const existingSymptomKeys = new Set(
    patient.symptoms.map(
      (symptom) =>
        `${symptom.name.toLowerCase()}|${symptom.date}`
    )
  );

  const newSymptoms =
    documentData.symptoms
      .filter(
        (symptom) =>
          !existingSymptomKeys.has(
            `${symptom.name.toLowerCase()}|${symptom.date}`
          )
      )
      .map((symptom) => ({
        ...symptom,
        conditionId: symptom.conditionId
          ? conditionIdMap.get(
              symptom.conditionId
            )
          : undefined,
      }));

  const symptoms = [
    ...patient.symptoms,
    ...newSymptoms,
  ];

  /*
   * --------------------------------------------------
   * TIMELINE
   * --------------------------------------------------
   */

  const timeline = [
    ...patient.timeline,
    ...documentData.timeline.map(
      (event) => ({
        ...event,
        conditionId: event.conditionId
          ? conditionIdMap.get(
              event.conditionId
            )
          : undefined,
      })
    ),
  ];

  /*
   * --------------------------------------------------
   * FINAL PATIENT
   * --------------------------------------------------
   */

  return {
    ...patient,
    conditions,
    medications,
    labs,
    appointments,
    symptoms,
    timeline,
  };
}