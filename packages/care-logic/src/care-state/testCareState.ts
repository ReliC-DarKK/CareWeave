import { mockPatient } from "../data/mockPatient";
import { getCurrentCareState } from "./careStateEngine";

const careState = getCurrentCareState(
  mockPatient,
  "2026-09-18"
);

console.log(
  JSON.stringify(careState, null, 2)
);