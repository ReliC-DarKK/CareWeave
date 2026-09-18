import { mockPatient } from "../data/mockPatient";
import { getPatientTimeline } from "./timelineBuilder";

const timeline = getPatientTimeline(mockPatient);

console.log("Total timeline events:", timeline.length);

for (const event of timeline) {
  console.log(
    `${event.date} | ${event.type} | ${event.title}`
  );
}