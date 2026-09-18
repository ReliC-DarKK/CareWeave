import { CareInteraction } from "../care-state/interactionEngine";

export type ActionPriority = "high" | "medium" | "low";

export interface NextAction {
  id: string;
  priority: ActionPriority;
  action: string;
  reason: string;
  relatedConditions: string[];
  source: "rule";
}