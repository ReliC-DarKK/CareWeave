import { z } from "zod";

/**
 * Validates route parameters for routes requiring a :patientId path parameter.
 */
export const patientParamsSchema = z.object({
  patientId: z.string().trim().min(1, "patientId must not be empty"),
});

export type PatientParams = z.infer<typeof patientParamsSchema>;
