import { mockPatient } from "../data/mockPatient";
import { buildCareLogic } from "./careLogic";

const result = buildCareLogic(
  mockPatient,
  "2026-09-18"
);

console.log(
  JSON.stringify(result, null, 2)
);