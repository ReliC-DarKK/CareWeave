import {
  ExtractedClinicalData,
} from "./documentTypes";

import {
  Condition,
  Medication,
  LabResult,
  Appointment,
  Symptom,
  TimelineEvent,
} from "../types/patient";

export interface NormalizedClinicalData {
  conditions: Condition[];
  medications: Medication[];
  labs: LabResult[];
  appointments: Appointment[];
  symptoms: Symptom[];
  timeline: TimelineEvent[];
}

export function normalizeClinicalData(
  data: ExtractedClinicalData
): NormalizedClinicalData {
  const conditions: Condition[] =
    data.conditions.map((condition, index) => ({
      id: `document-condition-${index + 1}`,
      name: condition.name,
      status: condition.status ?? "monitoring",
      diagnosedDate:
        condition.diagnosedDate ?? "",
    }));

  const findConditionId = (
    conditionName?: string
  ): string | undefined => {
    if (!conditionName) {
      return undefined;
    }

    const match = conditions.find(
      (condition) =>
        condition.name.toLowerCase() ===
        conditionName.toLowerCase()
    );

    return match?.id;
  };

  const medications: Medication[] =
    data.medications.map((medication, index) => ({
      id: `document-medication-${index + 1}`,
      name: medication.name,
      dosage: medication.dosage,
      frequency: medication.frequency,
      purpose:
        medication.purpose ?? "Not specified",
      startDate: medication.startDate ?? "",
      status:
        medication.status ?? "prescribed",
    }));

  const labs: LabResult[] =
    data.labs.map((lab, index) => ({
      id: `document-lab-${index + 1}`,
      name: lab.name,
      value: lab.value,
      unit: lab.unit,
      referenceRange: lab.referenceRange,
      date: lab.date,
      conditionId:
        findConditionId(lab.conditionId),
    }));

  const appointments: Appointment[] =
    data.appointments.map(
      (appointment, index) => ({
        id: `document-appointment-${index + 1}`,
        title: appointment.title,
        date: appointment.date,
        time: appointment.time,
        clinician: appointment.clinician,
        conditionId:
          findConditionId(
            appointment.conditionId
          ),
        preparation:
          appointment.preparation,
      })
    );

  const symptoms: Symptom[] =
    data.symptoms.map((symptom, index) => ({
      id: `document-symptom-${index + 1}`,
      name: symptom.name,
      severity: symptom.severity,
      date: symptom.date,
      conditionId:
        findConditionId(symptom.conditionId),
    }));

  const timeline: TimelineEvent[] =
    data.timelineEvents.map(
      (event, index) => ({
        id: `document-event-${index + 1}`,
        type: event.type,
        date: event.date,
        title: event.title,
        description: event.description,
        conditionId:
          findConditionId(event.conditionId),
        metadata: {
          source: event.source,
        },
      })
    );

  return {
    conditions,
    medications,
    labs,
    appointments,
    symptoms,
    timeline,
  };
}