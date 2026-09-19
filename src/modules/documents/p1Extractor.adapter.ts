/**
 * P1 clinical document extraction integration contract.
 *
 * P1 owns clinical document extraction/interpretation.
 * P2 extracts raw text from PDFs and delegates to this boundary.
 */

export interface P1ExtractedCondition {
  name: string;
  status?: "active" | "controlled" | "monitoring" | undefined;
  diagnosedDate?: string | undefined;
}

export interface P1ExtractedMedication {
  name: string;
  dosage?: string | undefined;
  frequency?: string | undefined;
  startDate?: string | undefined;
  status?: "prescribed" | "taken" | "missed" | "stopped" | undefined;
}

export interface P1ExtractedLabResult {
  name: string;
  value: number;
  unit: string;
  referenceRange?: string | undefined;
  date?: string | undefined;
}

export interface P1ExtractedAppointment {
  title: string;
  date?: string | undefined;
  time?: string | undefined;
  clinician?: string | undefined;
}

export interface P1ExtractedSymptom {
  name: string;
  severity?: "mild" | "moderate" | "severe" | undefined;
  date?: string | undefined;
}

export interface P1ExtractedTimelineEvent {
  type: "diagnosis" | "lab" | "medication" | "appointment" | "symptom" | "treatment";
  title: string;
  description?: string | undefined;
  date?: string | undefined;
}

export interface P1ExtractedClinicalData {
  conditions: P1ExtractedCondition[];
  medications: P1ExtractedMedication[];
  labs: P1ExtractedLabResult[];
  appointments: P1ExtractedAppointment[];
  symptoms: P1ExtractedSymptom[];
  timelineEvents: P1ExtractedTimelineEvent[];
}

export interface P1ExtractorContext {
  patientId: string;
  documentId: string;
  originalFilename: string;
}

export interface P1DocumentExtractor {
  extractClinicalData(
    rawText: string,
    context: P1ExtractorContext,
  ): Promise<P1ExtractedClinicalData>;
}

/**
 * Default typed adapter representing P1's clinical document extractor boundary.
 *
 * When P1's production clinical extractor model is integrated, it replaces
 * this boundary implementation. P2 does not perform medical reasoning.
 */
export class DefaultP1DocumentExtractor implements P1DocumentExtractor {
  async extractClinicalData(
    rawText: string,
    context: P1ExtractorContext,
  ): Promise<P1ExtractedClinicalData> {
    void context;

    // Minimal extraction boundary: parses basic structured sections if present in raw text
    const result: P1ExtractedClinicalData = {
      conditions: [],
      medications: [],
      labs: [],
      appointments: [],
      symptoms: [],
      timelineEvents: [],
    };

    if (!rawText) {
      return result;
    }

    // Example keyword-based recognition for prototype documents
    if (/breast cancer/i.test(rawText)) {
      result.conditions.push({
        name: "Breast Cancer",
        status: "active",
      });
    }

    if (/metformin/i.test(rawText)) {
      result.medications.push({
        name: "Metformin",
        dosage: "500mg",
        frequency: "Twice daily",
        status: "prescribed",
      });
    }

    const hba1cMatch = /HbA1c[:\s]+([0-9.]+)\s*%/i.exec(rawText);
    if (hba1cMatch && hba1cMatch[1]) {
      result.labs.push({
        name: "HbA1c",
        value: parseFloat(hba1cMatch[1]),
        unit: "%",
        referenceRange: "< 7.0%",
      });
    }

    if (/fatigue/i.test(rawText)) {
      result.symptoms.push({
        name: "Fatigue",
        severity: "moderate",
      });
    }

    const aptMatch = /Appointment[:\s]+([^.]+)/i.exec(rawText);
    if (aptMatch && aptMatch[1]) {
      result.appointments.push({
        title: aptMatch[1].trim(),
      });
    }

    if (context?.originalFilename) {
      result.timelineEvents.push({
        type: "treatment",
        title: `Clinical Document Extraction: ${context.originalFilename}`,
        description: `Extracted clinical concepts from ${context.originalFilename}`,
      });
    }

    return result;
  }
}

export const defaultP1DocumentExtractor = new DefaultP1DocumentExtractor();
