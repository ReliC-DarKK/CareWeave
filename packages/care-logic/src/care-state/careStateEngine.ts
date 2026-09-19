import { Patient } from "../types/patient";
import { CareState } from "../types/careState";

export function getCurrentCareState(
  patient: Patient,
  referenceDate: string
): CareState {
  const referenceTime = new Date(referenceDate).getTime();

  // Recent symptoms: last 7 days
  const recentSymptoms = patient.symptoms
    .filter((symptom) => {
      const symptomTime = new Date(symptom.date).getTime();
      const daysAgo =
        (referenceTime - symptomTime) / (1000 * 60 * 60 * 24);

      return daysAgo >= 0 && daysAgo <= 7;
    })
    .map((symptom) => ({
      id: symptom.id,
      name: symptom.name,
      severity: symptom.severity,
      date: symptom.date,
      conditionId: symptom.conditionId,
    }));

  // Most recent labs
  const recentLabs = [...patient.labs]
    .sort(
      (a, b) =>
        new Date(b.date).getTime() -
        new Date(a.date).getTime()
    )
    .slice(0, 5)
    .map((lab) => ({
      id: lab.id,
      name: lab.name,
      value: lab.value,
      unit: lab.unit,
      referenceRange: lab.referenceRange,
      date: lab.date,
      conditionId: lab.conditionId,
    }));

  // Medication adherence
  const medicationAdherence = patient.medications
    .filter((medication) => medication.adherence)
    .map((medication) => {
      const taken = medication.adherence!.taken;
      const expected = medication.adherence!.expected;

      return {
        medicationId: medication.id,
        medication: medication.name,
        taken,
        expected,
        adherenceRate: Math.round(
          (taken / expected) * 100
        ),
        status: medication.status,
      };
    });

  // Upcoming appointments
  const upcomingAppointments = patient.appointments
    .filter(
      (appointment) =>
        new Date(appointment.date).getTime() >= referenceTime
    )
    .sort(
      (a, b) =>
        new Date(a.date).getTime() -
        new Date(b.date).getTime()
    )
    .map((appointment) => ({
      id: appointment.id,
      title: appointment.title,
      date: appointment.date,
      time: appointment.time,
      conditionId: appointment.conditionId,
    }));

  // Attention signals
  const attentionSignals: string[] = [];

  for (const medication of medicationAdherence) {
    if (medication.adherenceRate < 80) {
      attentionSignals.push(
        `${medication.medication} adherence is ${medication.adherenceRate}%`
      );
    }
  }

  for (const symptom of recentSymptoms) {
    attentionSignals.push(
      `Recent ${symptom.severity} symptom: ${symptom.name}`
    );
  }

  // Overall state
  const overallStatus =
    attentionSignals.length > 0
      ? "needs-attention"
      : "stable";

  return {
    patientId: patient.id,
    referenceDate,

    overallStatus,

    activeConditions: patient.conditions
      .filter(
        (condition) =>
          condition.status === "active" ||
          condition.status === "monitoring"
      )
      .map((condition) => ({
        id: condition.id,
        name: condition.name,
        status: condition.status,
      })),

    recentSymptoms,

    recentLabs,

    medicationAdherence,

    upcomingAppointments,

    attentionSignals,
  };
}