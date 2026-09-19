import {
  DocumentSource,
  ExtractedClinicalData,
} from "./documentTypes";

export interface ExtractionInput {
  text: string;
  documentId: string;
  fileName: string;
  documentType: DocumentSource["documentType"];
}

function createSource(
  input: ExtractionInput
): DocumentSource {
  return {
    documentId: input.documentId,
    fileName: input.fileName,
    documentType: input.documentType,
  };
}

function extractCondition(
  text: string,
  source: DocumentSource
) {
  const match = text.match(
    /Condition\s+(.+?)(?=\s+MEDICATION|\s+LABORATORY RESULTS|\s+SYMPTOMS|\s+FOLLOW-UP APPOINTMENT|$)/i
  );

  const name = match?.[1];

  if (!name) {
    return [];
  }

  return [
    {
      name: name.trim(),
      source,
    },
  ];
}

function extractMedication(
  text: string,
  source: DocumentSource
) {
  const drugMatch = text.match(
    /Drug\s+(.+?)(?=\s+Dosage|$)/i
  );

  const dosageMatch = text.match(
    /Dosage\s+(.+?)(?=\s+Frequency|$)/i
  );

  const frequencyMatch = text.match(
    /Frequency\s+(.+?)(?=\s+LABORATORY RESULTS|\s+SYMPTOMS|\s+FOLLOW-UP APPOINTMENT|$)/i
  );

  const name = drugMatch?.[1];
  const dosage = dosageMatch?.[1];
  const frequency = frequencyMatch?.[1];

  if (!name || !dosage || !frequency) {
    return [];
  }

  return [
    {
      name: name.trim(),
      dosage: dosage.trim(),
      frequency: frequency.trim(),
      source,
    },
  ];
}

function extractLab(
  text: string,
  source: DocumentSource
) {
  const testMatch = text.match(
    /Test\s+(.+?)(?=\s+Result|$)/i
  );

  const resultMatch = text.match(
    /Result\s+([0-9]+(?:\.[0-9]+)?)\s*([%a-zA-Z\/µ]+)?/i
  );

  const referenceMatch = text.match(
    /Reference Range\s+(.+?)(?=\s+Date|$)/i
  );

  const labDateMatch = text.match(
    /Test\s+.+?\s+Result\s+.+?\s+Reference Range\s+.+?\s+Date\s+(\d{1,2}\s+[A-Za-z]+\s+\d{4})/i
  );

  const name = testMatch?.[1];
  const valueText = resultMatch?.[1];
  const unit = resultMatch?.[2];
  const referenceRange = referenceMatch?.[1];
  const dateText = labDateMatch?.[1];

  if (!name || !valueText || !dateText) {
    return [];
  }

  return [
    {
      name: name.trim(),
      value: Number(valueText),
      unit: unit?.trim() ?? "",
      referenceRange: referenceRange?.trim(),
      date: normalizeDate(dateText),
      source,
    },
  ];
}

function extractSymptom(
  text: string,
  source: DocumentSource
) {
  const symptomMatch = text.match(
    /Symptom\s+(.+?)(?=\s+Severity|$)/i
  );

  const severityMatch = text.match(
    /Severity\s+(mild|moderate|severe)/i
  );

  const name = symptomMatch?.[1];
  const severityText = severityMatch?.[1]?.toLowerCase();

  if (!name || !severityText) {
    return [];
  }

  let severity:
    | "mild"
    | "moderate"
    | "severe";

  if (severityText === "mild") {
    severity = "mild";
  } else if (severityText === "moderate") {
    severity = "moderate";
  } else if (severityText === "severe") {
    severity = "severe";
  } else {
    return [];
  }

  return [
    {
      name: name.trim(),
      severity,
      date: extractReportDate(text),
      source,
    },
  ];
}

function extractAppointment(
  text: string,
  source: DocumentSource
) {
  const appointmentSection = text.match(
    /FOLLOW-UP APPOINTMENT\s+Type\s+(.+?)\s+Date\s+(\d{1,2}\s+[A-Za-z]+\s+\d{4})\s+Time\s+(\d{1,2}:\d{2}\s*[AP]M)/i
  );

  const title = appointmentSection?.[1];
  const dateText = appointmentSection?.[2];
  const time = appointmentSection?.[3];

  if (!title || !dateText || !time) {
    return [];
  }

  return [
    {
      title: title.trim(),
      date: normalizeDate(dateText),
      time: time.trim(),
      source,
    },
  ];
}

function extractReportDate(text: string): string {
  const match = text.match(
    /Report Date\s+(\d{1,2}\s+[A-Za-z]+\s+\d{4})/i
  );

  const dateText = match?.[1];

  if (!dateText) {
    return new Date()
      .toISOString()
      .slice(0, 10);
  }

  return normalizeDate(dateText);
}

function normalizeDate(
  dateText: string
): string {
  const match = dateText.match(
    /^(\d{1,2})\s+([A-Za-z]+)\s+(\d{4})$/
  );

  if (
    !match ||
    !match[1] ||
    !match[2] ||
    !match[3]
  ) {
    return dateText;
  }

  const day = match[1];
  const monthName = match[2];
  const year = match[3];

  const months: Record<string, string> = {
    january: "01",
    february: "02",
    march: "03",
    april: "04",
    may: "05",
    june: "06",
    july: "07",
    august: "08",
    september: "09",
    october: "10",
    november: "11",
    december: "12",
  };

  const month = months[monthName.toLowerCase()];

  if (!month) {
    return dateText;
  }

  return `${year}-${month}-${day.padStart(2, "0")}`;
}

export function extractClinicalData(
  input: ExtractionInput
): ExtractedClinicalData {
  const source = createSource(input);

  return {
    conditions: extractCondition(
      input.text,
      source
    ),

    medications: extractMedication(
      input.text,
      source
    ),

    labs: extractLab(
      input.text,
      source
    ),

    symptoms: extractSymptom(
      input.text,
      source
    ),

    appointments: extractAppointment(
      input.text,
      source
    ),

    timelineEvents: [],
  };
}