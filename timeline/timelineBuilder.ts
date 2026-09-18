import { Patient, TimelineEvent } from "../types/patient";

export function getPatientTimeline(patient: Patient): TimelineEvent[] {
  const events: TimelineEvent[] = [];

  // Existing timeline events
  events.push(
  ...patient.timeline.filter(
    (event) =>
      event.type === "diagnosis" ||
      event.type === "treatment"
  )
);

  // Convert lab results into timeline events
  for (const lab of patient.labs) {
    events.push({
      id: `lab-${lab.id}`,
      type: "lab",
      date: lab.date,
      title: `${lab.name}: ${lab.value} ${lab.unit}`,
      description: lab.referenceRange
        ? `Reference range: ${lab.referenceRange}`
        : undefined,
      conditionId: lab.conditionId,
      metadata: {
        value: lab.value,
        unit: lab.unit,
        referenceRange: lab.referenceRange,
      },
    });
  }

  // Convert medications into timeline events
  for (const medication of patient.medications) {
    events.push({
      id: `medication-${medication.id}`,
      type: "medication",
      date: medication.startDate,
      title: `${medication.name} started`,
      description: `${medication.dosage}, ${medication.frequency}`,
      metadata: {
        status: medication.status,
        adherence: medication.adherence,
        purpose: medication.purpose,
      },
    });
  }

  // Convert appointments into timeline events
  for (const appointment of patient.appointments) {
    events.push({
      id: `appointment-${appointment.id}`,
      type: "appointment",
      date: appointment.date,
      title: appointment.title,
      description: appointment.clinician
        ? `With ${appointment.clinician}`
        : undefined,
      conditionId: appointment.conditionId,
      metadata: {
        time: appointment.time,
        preparation: appointment.preparation,
      },
    });
  }

  // Convert symptoms into timeline events
  for (const symptom of patient.symptoms) {
    events.push({
      id: `symptom-${symptom.id}`,
      type: "symptom",
      date: symptom.date,
      title: `${symptom.name} (${symptom.severity})`,
      conditionId: symptom.conditionId,
      metadata: {
        severity: symptom.severity,
      },
    });
  }

  // Most recent events first
  return events.sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  );
}