import { CareState } from "../types/careState";
import { NextAction } from "../types/nextAction";

export interface CareSummary {
  headline: string;
  summary: string;
  priorities: string[];
  upcomingCare: string[];
}

export function generateCareSummary(
  careState: CareState,
  nextActions: NextAction[]
): CareSummary {
  const priorities = nextActions
    .filter((action) => action.priority === "high")
    .map((action) => action.action);

  const upcomingCare = careState.upcomingAppointments.map(
    (appointment) =>
      `${appointment.title} — ${appointment.date} at ${appointment.time}`
  );

  const conditionNames = careState.activeConditions.map(
    (condition) => condition.name
  );

  const headline =
    careState.overallStatus === "needs-attention"
      ? "Care needs attention"
      : "Care is currently stable";

  const summary =
    conditionNames.length > 0
      ? `The patient is currently being monitored across ${conditionNames.join(
          ", "
        )}. Recent symptoms, medication adherence, and upcoming appointments have been considered together to identify the most relevant next steps.`
      : "No active or monitoring conditions are currently recorded.";

  return {
    headline,
    summary,
    priorities,
    upcomingCare,
  };
}