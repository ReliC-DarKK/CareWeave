import { mockPatient } from "../data/mockPatient";
import { getCurrentCareState } from "../care-state/careStateEngine";
import { getCareInteractions } from "../care-state/interactionEngine";
import { getNextActions } from "./nextActionEngine";

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

console.log(
  JSON.stringify(nextActions, null, 2)
);