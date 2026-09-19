import { CareState } from "../types/careState";
import { NextAction } from "../types/nextAction";
import { CareInteraction } from "../care-state/interactionEngine";

export function getNextActions(
  careState: CareState,
  interactions: CareInteraction[]
): NextAction[] {
  const actions: NextAction[] = [];

  for (const interaction of interactions) {
    if (interaction.type === "medication-support") {
  actions.push({
    id: "action-medication-support",
    priority: interaction.priority,
    action:
      "Review medication management with the care team or caregiver.",
    reason:
      "Medication confusion was recently reported and medication adherence is below the 80% threshold.",
    relatedConditions: interaction.relatedConditions,
    source: "rule",
  });
}
    if (interaction.type === "symptom-follow-up") {
      actions.push({
        id: `action-${interaction.id}`,
        priority: interaction.priority,
        action:
          "Mention the recent symptom during the upcoming relevant appointment.",
        reason: interaction.description,
        relatedConditions: interaction.relatedConditions,
        source: "rule",
      });
    }

    if (interaction.type === "care-coordination") {
      actions.push({
        id: "action-care-coordination",
        priority: interaction.priority,
        action:
          "Bring a consolidated list of conditions, medications, recent symptoms, and relevant care information to upcoming visits.",
        reason: interaction.description,
        relatedConditions: interaction.relatedConditions,
        source: "rule",
      });
    }
  }

  // Upcoming appointments should always be surfaced as preparation actions.
  for (const appointment of careState.upcomingAppointments) {
    actions.push({
      id: `action-appointment-${appointment.id}`,
      priority: "medium",
      action: `Prepare for the upcoming ${appointment.title}.`,
      reason: `Appointment scheduled for ${appointment.date} at ${appointment.time}.`,
      relatedConditions: appointment.conditionId
        ? [appointment.conditionId]
        : [],
      source: "rule",
    });
  }

  return actions;
}