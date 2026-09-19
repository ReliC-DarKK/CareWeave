import { Patient } from "../types/patient";
import { getPatientTimeline } from "../timeline/timelineBuilder";
import { getCurrentCareState } from "../care-state/careStateEngine";
import { getCareInteractions } from "../care-state/interactionEngine";
import { getNextActions } from "../next-action/nextActionEngine";
import { generateCareSummary } from "../ai/careSummary";

export function buildCareLogic(
  patient: Patient,
  referenceDate: string
) {
  const timeline = getPatientTimeline(patient);

  const careState = getCurrentCareState(
    patient,
    referenceDate
  );

  const interactions = getCareInteractions(
    patient,
    careState
  );

  const nextActions = getNextActions(
    careState,
    interactions
  );

  const summary = generateCareSummary(
    careState,
    nextActions
  );

  return {
    timeline,
    careState,
    interactions,
    nextActions,
    summary,
  };
}