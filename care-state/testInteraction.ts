import { mockPatient } from "../data/mockPatient";
import { getCurrentCareState } from "./careStateEngine";
import { getCareInteractions } from "./interactionEngine";

const careState = getCurrentCareState(
  mockPatient,
  "2026-09-18"
);

const interactions = getCareInteractions(
  mockPatient,
  careState
);

console.log(
  JSON.stringify(interactions, null, 2)
);