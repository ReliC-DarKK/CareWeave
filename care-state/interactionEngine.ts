import { Patient } from "../types/patient";
import { CareState } from "../types/careState";

export interface CareInteraction {
  id: string;
  type:
    | "medication-support"
    | "symptom-follow-up"
    | "care-coordination";
  description: string;
  relatedConditions: string[];
  priority: "high" | "medium" | "low";
}

export function getCareInteractions(
  patient: Patient,
  careState: CareState
): CareInteraction[] {
  const interactions: CareInteraction[] = [];

  // Medication confusion + missed/low-adherence medication
  const hasMedicationConfusion = careState.recentSymptoms.some(
    (symptom) => symptom.name === "Medication confusion"
  );

  const lowAdherenceMedication =
    careState.medicationAdherence.find(
      (medication) => medication.adherenceRate < 80
    );

  if (hasMedicationConfusion && lowAdherenceMedication) {
    interactions.push({
      id: "interaction-medication-support",
      type: "medication-support",
      description:
        "Medication confusion and lower medication adherence indicate a need to review medication management with the care team or caregiver.",
      relatedConditions: careState.activeConditions
  .filter(
    (condition) =>
      condition.name === "Alzheimer's Disease"
  )
  .map((condition) => condition.id),
      priority: "high",
    });
  }

  // Recent symptom + relevant upcoming appointment
  for (const symptom of careState.recentSymptoms) {
    const relevantAppointment =
      careState.upcomingAppointments.find(
        (appointment) =>
          appointment.conditionId === symptom.conditionId
      );

    if (relevantAppointment && symptom.conditionId) {
      interactions.push({
        id: `interaction-symptom-${symptom.id}`,
        type: "symptom-follow-up",
        description:
          `Recent ${symptom.name} should be mentioned during the upcoming ${relevantAppointment.title}.`,
        relatedConditions: [symptom.conditionId],
        priority: "high",
      });
    }
  }

  // Multiple active/monitoring conditions + multiple upcoming appointments
  if (
    careState.activeConditions.length > 1 &&
    careState.upcomingAppointments.length > 1
  ) {
    interactions.push({
      id: "interaction-care-coordination",
      type: "care-coordination",
      description:
        "Multiple conditions and upcoming care visits create a need for consolidated patient information across care teams.",
      relatedConditions: careState.activeConditions.map(
        (condition) => condition.id
      ),
      priority: "medium",
    });
  }

  return interactions;
}