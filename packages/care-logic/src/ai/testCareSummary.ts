import { mockPatient } from "../data/mockPatient";
import { getCurrentCareState } from "../care-state/careStateEngine";
import { getCareInteractions } from "../care-state/interactionEngine";
import { getNextActions } from "../next-action/nextActionEngine";
import { generateCareSummary } from "./careSummary";

const careState = getCurrentCareState(
  mockPatient,
  "2026-09-18"
);

const interactions = getCareInteractions(
  mockPatient,
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

console.log(
  JSON.stringify(summary, null, 2)
);