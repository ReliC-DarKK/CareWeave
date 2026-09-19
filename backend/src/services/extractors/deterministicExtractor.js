/**
 * Generic Deterministic Medical Information Extractor — CareWeave Project 2.0
 *
 * Grounded Document Extraction Layer
 *
 * RULES:
 * 1. ZERO INFERRED CLINICAL STATUS:
 *    - Never calculate whether a test result is NORMAL, HIGH, LOW, or ABNORMAL
 *    - Never compare values against reference ranges
 *    - Only store a flag if the document explicitly wrote one (e.g., "HIGH", "LOW", "H", "L")
 * 2. NO HARD-CODED ENTITIES:
 *    - Never hard-code patient names, doctor names, clinics, test names, medications, or values
 *    - Uses generic clinical pattern recognizers across headers, tabular lines, and sections
 * 3. THREE-CATEGORY DATA DISCIPLINE:
 *    - Category 1 (Explicitly in document): Extracted as factual data
 *    - Category 2 (Not in document): Set to null (objects) or [] (arrays)
 *    - Category 3 (Clinical interpretation): NEVER generated
 */

// Common clinical section header patterns
const SECTION_PATTERNS = {
  LAB_RESULTS: /^(?:laboratory results|lab results|test results|investigations|diagnostic results|laboratory panel|blood tests?)$/i,
  MEDICATIONS: /^(?:current medications|medications|medication list|prescribed medications|prescriptions|active medications|rx)$/i,
  CLINICAL_NOTE: /^(?:clinical note|clinical notes|findings|observations|comments|impression|assessment)$/i,
  RECOMMENDATIONS: /^(?:recommended follow-up|recommendations|recommendation|plan|follow-up recommendations?|follow-up)$/i,
  DIAGNOSES: /^(?:diagnoses|diagnosis|clinical impression|final diagnosis|primary diagnosis)$/i,
  SYMPTOMS: /^(?:symptoms|chief complaint|presenting symptoms|clinical history)$/i,
};

// Negative assertions for medications or findings to ignore
const NEGATIVE_MEDICATION_LINE = /^(?:no (?:other )?medication(?:s)? recorded|no known medications|none(?: recorded| noted)?|none|n\/a|—\s*—)$/i;

// Unit pattern matching common medical units
const UNIT_REGEX = /(?:×10³\/μL|x10\^3\/uL|×10⁹\/L|x10\^9\/L|×10¹²\/L|g\/dL|mg\/dL|mIU\/L|IU\/L|ng\/mL|pg\/mL|μg\/dL|ug\/dL|mmol\/L|μmol\/L|umol\/L|mEq\/L|fl|fL|pg|%|IU|mcg|mg|ml|mL|cells\/μL|cells\/mcL|mm\/hr|bpm)\b/i;

// Reference range pattern: e.g. "12.0–15.5", "12.0-15.5", "70–99", "< 100", "> 50", "0.4 - 4.0"
const RANGE_REGEX = /(?:(?:<|>|<=|>=)\s*\d+(?:\.\d+)?|\d+(?:\.\d+)?\s*(?:–|-|to)\s*\d+(?:\.\d+)?)/;

/**
 * Clean and trim text line
 * @param {string} line
 * @returns {string}
 */
function cleanLine(line) {
  return (line || '').replace(/[ \t]+/g, ' ').trim();
}

/**
 * Detect general document type from text content
 * @param {string} fullText
 * @returns {string}
 */
export function detectDocumentType(fullText) {
  if (!fullText) return 'UNKNOWN';

  const lower = fullText.toLowerCase();
  if (lower.includes('laboratory') || lower.includes('lab result') || lower.includes('blood test') || lower.includes('panel')) {
    return 'LABORATORY_REPORT';
  }
  if (lower.includes('prescription') || lower.includes('medication order') || lower.includes('rx')) {
    return 'PRESCRIPTION';
  }
  if (lower.includes('consultation') || lower.includes('progress note') || lower.includes('discharge summary')) {
    return 'CONSULTATION_NOTE';
  }
  if (lower.includes('radiology') || lower.includes('x-ray') || lower.includes('mri') || lower.includes('ct scan') || lower.includes('ultrasound')) {
    return 'IMAGING_REPORT';
  }

  return 'MEDICAL_DOCUMENT';
}

/**
 * Extract document header metadata (patient, doctor, clinic, dates)
 * @param {string[]} lines
 * @returns {object}
 */
export function extractHeaderMetadata(lines) {
  const result = {
    documentDate: null,
    reportId: null,
    patient: {
      name: null,
      dateOfBirth: null,
      identifier: null,
    },
    doctor: {
      name: null,
      speciality: null,
      clinic: null,
    },
  };

  // Inspect lines for generic key-value metadata
  for (const line of lines) {
    // Patient Name: "Patient Aditi Sharma" or "Patient: John Doe" or "Name: Jane Doe"
    if (!result.patient.name) {
      const match = line.match(/^(?:patient name|patient|pt name|pt)\s*[:\-]?\s*([A-Za-z\s.'-]+)$/i);
      if (match && match[1].trim() && !match[1].toLowerCase().includes('report')) {
        result.patient.name = match[1].trim();
      }
    }

    // Date of Birth: "Date of Birth 14 March 1998" or "DOB: 1998-03-14"
    if (!result.patient.dateOfBirth) {
      const match = line.match(/^(?:date of birth|dob|birth date)\s*[:\-]?\s*([A-Za-z0-9\s,/-]+)$/i);
      if (match && match[1].trim()) {
        result.patient.dateOfBirth = match[1].trim();
      }
    }

    // Patient ID / MRN: "Patient ID: 12345" or "MRN: 9876"
    if (!result.patient.identifier) {
      const match = line.match(/^(?:patient id|mrn|medical record number|pt id)\s*[:\-]?\s*([A-Za-z0-9_-]+)$/i);
      if (match && match[1].trim()) {
        result.patient.identifier = match[1].trim();
      }
    }

    // Report / Document Date: "Report Date 18 September 2026" or "Document Date: ..." or "Date: ..."
    // Must NOT match "Date of Birth"
    if (!result.documentDate && !line.toLowerCase().startsWith('date of birth') && !line.toLowerCase().startsWith('dob')) {
      const match = line.match(/^(?:report date|document date|collection date|specimen date|date of report)\s*[:\-]?\s*([A-Za-z0-9\s,/-]+)$/i) ||
                    line.match(/^date\s*[:\-]\s*([A-Za-z0-9\s,/-]+)$/i);
      if (match && match[1].trim()) {
        result.documentDate = match[1].trim();
      }
    }

    // Report ID: "Report ID MOCK-LAB-2026-0918-042" or "Report #: 123"
    if (!result.reportId) {
      const match = line.match(/^(?:report id|report #|report number|accession #|accession number|order id|specimen id)\s*[:\-]?\s*([A-Za-z0-9_-]+)$/i);
      if (match && match[1].trim()) {
        result.reportId = match[1].trim();
      }
    }

    // Doctor: "Ordering Physician Dr. Meera Kapoor" or "Doctor: Dr. Smith"
    if (!result.doctor.name) {
      const match = line.match(/^(?:ordering physician|physician|attending physician|doctor|treating physician|provider)\s*[:\-]?\s*([A-Za-z\s.'-]+)$/i);
      if (match && match[1].trim()) {
        result.doctor.name = match[1].trim();
      }
    }

    // Speciality: "Speciality Internal Medicine"
    if (!result.doctor.speciality) {
      const match = line.match(/^(?:speciality|specialty|department)\s*[:\-]?\s*([A-Za-z\s/&'-]+)$/i);
      if (match && match[1].trim()) {
        result.doctor.speciality = match[1].trim();
      }
    }

    // Clinic / Facility: "Clinic Greenfield Medical Clinic" or "Facility: City Hospital"
    if (!result.doctor.clinic) {
      const match = line.match(/^(?:clinic|facility|hospital|medical center|practice|center)\s*[:\-]?\s*([A-Za-z0-9\s/&',.-]+)$/i);
      if (match && match[1].trim()) {
        result.doctor.clinic = match[1].trim();
      }
    }
  }

  return result;
}

/**
 * Generic parser for tabular laboratory test lines.
 *
 * CRITICAL RULE:
 * DOES NOT INFER OR CALCULATE CLINICAL STATUS.
 * Only extracts explicit document flags (e.g., "HIGH", "LOW", "H", "L", "CRITICAL", "ABNORMAL").
 * If the document does not write a flag, documentFlag is strictly null.
 *
 * @param {string[]} lines
 * @param {string|null} documentDate
 * @returns {object[]}
 */
export function extractLaboratoryTests(lines, documentDate = null) {
  const tests = [];
  let inLabSection = false;

  // Header skip words
  const TABLE_HEADER_WORDS = ['test', 'result', 'reference', 'range', 'unit', 'flag', 'status', 'interval'];

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    // Check for start of laboratory section
    if (SECTION_PATTERNS.LAB_RESULTS.test(line)) {
      inLabSection = true;
      continue;
    }

    // Check for transition to another known section
    if (inLabSection) {
      if (
        SECTION_PATTERNS.MEDICATIONS.test(line) ||
        SECTION_PATTERNS.CLINICAL_NOTE.test(line) ||
        SECTION_PATTERNS.RECOMMENDATIONS.test(line) ||
        SECTION_PATTERNS.DIAGNOSES.test(line) ||
        SECTION_PATTERNS.SYMPTOMS.test(line)
      ) {
        inLabSection = false;
        continue;
      }
    }

    if (!inLabSection) continue;

    // Skip table column headers (e.g., "Test Result Reference Range Unit")
    const lowerLine = line.toLowerCase();
    const isHeaderLine = TABLE_HEADER_WORDS.filter((w) => lowerLine.includes(w)).length >= 3;
    if (isHeaderLine) continue;

    // Generic tabular line parsing:
    // Format A: "Hemoglobin 13.4 12.0–15.5 g/dL [FLAG]"
    // Format B: "White Blood Cell Count 6.8 4.0–11.0 ×10³/μL"
    // Format C: "Glucose: 95 mg/dL (70-99)"
    // Let's parse components dynamically:
    const test = parseLabLine(line, documentDate);
    if (test) {
      tests.push(test);
    }
  }

  return tests;
}

/**
 * Parse an individual line into a structured laboratory test record.
 * Does NOT infer clinical status.
 *
 * @param {string} line
 * @param {string|null} documentDate
 * @returns {object|null}
 */
function parseLabLine(line, documentDate = null) {
  if (!line || line.length < 4) return null;

  // 1. Look for reference range
  const rangeMatch = line.match(RANGE_REGEX);
  const referenceRange = rangeMatch ? rangeMatch[0].trim() : null;

  // 2. Look for unit
  const unitMatch = line.match(UNIT_REGEX);
  const unit = unitMatch ? unitMatch[0].trim() : null;

  // 3. Look for explicit document flag (ONLY explicit textual tokens in document)
  let documentFlag = null;
  const flagMatch = line.match(/\b(CRITICAL HIGH|CRITICAL LOW|CRITICAL|HIGH|LOW|ABNORMAL|NORMAL|H|L)\b/i);
  // Ensure flag is not part of a unit or test name
  if (flagMatch) {
    const rawFlag = flagMatch[1].toUpperCase();
    // Verify it's not the 'H' in a word or unit
    const flagIndex = flagMatch.index;
    const isIsolated = flagIndex === 0 || line[flagIndex - 1] === ' ' || line[flagIndex - 1] === '\t';
    if (isIsolated && rawFlag !== 'FL') {
      documentFlag = rawFlag;
    }
  }

  // 4. Look for test name and value
  // Remove reference range, unit, and flag from line to locate name and value
  let remaining = line;
  if (referenceRange) remaining = remaining.replace(referenceRange, ' ');
  if (unit) remaining = remaining.replace(unit, ' ');
  if (documentFlag) remaining = remaining.replace(new RegExp(`\\b${documentFlag}\\b`, 'i'), ' ');
  remaining = cleanLine(remaining);

  // Remaining should contain test name followed by value (e.g. "Hemoglobin 13.4" or "Platelet Count 274")
  // Or "Glucose: 95"
  const valueMatch = remaining.match(/(?:[:\s]+)?([<>]?\s*\d+(?:\.\d+)?|Positive|Negative|Non-reactive|Reactive)\s*$/i);
  if (!valueMatch) return null;

  const rawValue = valueMatch[1].trim();
  const testName = cleanLine(remaining.slice(0, valueMatch.index).replace(/[:\-]+$/, ''));

  // If test name is empty or looks like punctuation/header, skip
  if (!testName || testName.length < 2) return null;

  const numericVal = parseFloat(rawValue.replace(/^[<>]\s*/, ''));

  return {
    name: testName,
    value: rawValue,
    numericValue: !isNaN(numericVal) ? numericVal : null,
    unit: unit || null,
    referenceRange: referenceRange || null,
    documentFlag: documentFlag || null,
    date: documentDate || null,
  };
}

/**
 * Generic parser for medications section.
 * Filters negative statements (e.g., "No other medication recorded").
 *
 * @param {string[]} lines
 * @returns {object[]}
 */
export function extractMedications(lines) {
  const medications = [];
  let inMedSection = false;

  const MED_HEADER_WORDS = ['medication', 'dose', 'frequency', 'route', 'instruction', 'prescribed'];

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    if (SECTION_PATTERNS.MEDICATIONS.test(line)) {
      inMedSection = true;
      continue;
    }

    if (inMedSection) {
      if (
        SECTION_PATTERNS.LAB_RESULTS.test(line) ||
        SECTION_PATTERNS.CLINICAL_NOTE.test(line) ||
        SECTION_PATTERNS.RECOMMENDATIONS.test(line) ||
        SECTION_PATTERNS.DIAGNOSES.test(line) ||
        SECTION_PATTERNS.SYMPTOMS.test(line)
      ) {
        inMedSection = false;
        continue;
      }
    }

    if (!inMedSection) continue;

    // Check for footer / end markers
    if (line.toLowerCase().includes('mock document') || line.toLowerCase().includes('page ') || line.startsWith('--')) {
      inMedSection = false;
      continue;
    }

    // Skip column headers
    const lowerLine = line.toLowerCase();
    const isHeaderLine = MED_HEADER_WORDS.filter((w) => lowerLine.includes(w)).length >= 2;
    if (isHeaderLine) continue;

    // Filter out explicit negative assertions (e.g., "No other medication recorded — —")
    if (NEGATIVE_MEDICATION_LINE.test(line)) {
      continue;
    }

    const med = parseMedicationLine(line);
    if (med) {
      medications.push(med);
    }
  }

  return medications;
}

/**
 * Parse an individual line into structured medication data.
 * Does NOT invent missing fields.
 *
 * @param {string} line
 * @returns {object|null}
 */
function parseMedicationLine(line) {
  if (!line || line.length < 3) return null;

  // Look for dose + unit: e.g. "1000 IU", "500 mg", "10 mcg", "20 ml", "1 tablet"
  const doseMatch = line.match(/\b(\d+(?:\.\d+)?)\s*(IU|mg|mcg|μg|ml|mL|g|tablets?|capsules?|drops?|pills?|units?)\b/i);

  // Look for frequency pattern: e.g. "Once daily", "Twice daily", "BID", "TID", "QID", "daily", "every \d+ hours"
  const freqMatch = line.match(/\b(once daily|twice daily|three times daily|four times daily|every day|daily|at bedtime|as needed|prn|bid|tid|qid|q\d+h|every \d+ hours?)\b/i);

  if (doseMatch) {
    const dose = doseMatch[1];
    const unit = doseMatch[2];

    // Drug name is everything before the dose
    const namePart = cleanLine(line.slice(0, doseMatch.index));
    const frequency = freqMatch ? freqMatch[0] : null;

    if (namePart && namePart.length >= 2) {
      return {
        name: namePart,
        dose,
        unit,
        frequency,
        route: null,
        duration: null,
        instructions: null,
      };
    }
  }

  // Fallback: If line contains a medication name followed by frequency without explicit dose
  if (freqMatch) {
    const namePart = cleanLine(line.slice(0, freqMatch.index));
    if (namePart && namePart.length >= 2) {
      return {
        name: namePart,
        dose: null,
        unit: null,
        frequency: freqMatch[0],
        route: null,
        duration: null,
        instructions: null,
      };
    }
  }

  return null;
}

/**
 * Generic parser for clinical information:
 * - Findings / notes
 * - Recommendations / follow-up
 * - Diagnoses (ONLY if explicitly labeled)
 * - Symptoms (ONLY if explicitly labeled)
 *
 * @param {string[]} lines
 * @returns {object}
 */
export function extractClinicalInformation(lines) {
  const result = {
    symptoms: [],
    diagnoses: [],
    findings: [],
    recommendations: [],
    followUp: [],
  };

  let currentSection = null;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    // Detect section transitions
    if (SECTION_PATTERNS.CLINICAL_NOTE.test(line)) {
      currentSection = 'findings';
      continue;
    }
    if (SECTION_PATTERNS.RECOMMENDATIONS.test(line)) {
      currentSection = 'recommendations';
      continue;
    }
    if (SECTION_PATTERNS.DIAGNOSES.test(line)) {
      currentSection = 'diagnoses';
      continue;
    }
    if (SECTION_PATTERNS.SYMPTOMS.test(line)) {
      currentSection = 'symptoms';
      continue;
    }
    if (SECTION_PATTERNS.LAB_RESULTS.test(line) || SECTION_PATTERNS.MEDICATIONS.test(line)) {
      currentSection = null;
      continue;
    }

    // Stop on document footers
    if (line.toLowerCase().includes('mock document') || line.toLowerCase().includes('page ') || line.startsWith('--')) {
      currentSection = null;
      continue;
    }

    if (!currentSection) continue;

    // Collect content under active section
    // Clean bullet or numbered prefixes (e.g. "1. Review...", "- Review...")
    const bulletMatch = line.match(/^(?:\d+[\.\)]|\*|-|•)\s*(.+)$/);
    const textContent = cleanLine(bulletMatch ? bulletMatch[1] : line);

    if (!textContent || textContent.length < 3) continue;

    if (currentSection === 'recommendations') {
      result.recommendations.push(textContent);
      // Follow-up contains recommendations that explicitly mention follow-up or review
      if (/follow-up|review|repeat|consult/i.test(textContent)) {
        result.followUp.push(textContent);
      }
    } else if (currentSection === 'findings') {
      if (!bulletMatch && result.findings.length > 0) {
        result.findings[result.findings.length - 1] += ' ' + textContent;
      } else {
        result.findings.push(textContent);
      }
    } else if (currentSection === 'diagnoses') {
      result.diagnoses.push(textContent);
    } else if (currentSection === 'symptoms') {
      result.symptoms.push(textContent);
    }
  }

  return result;
}

/**
 * Main deterministic extraction function.
 * Transforms raw document text into the database-ready structured medical schema.
 *
 * @param {string} documentId
 * @param {string} rawText
 * @param {object} [options]
 * @returns {object} Structured medical data
 */
export function extractFromText(documentId, rawText, options = {}) {
  if (!rawText || typeof rawText !== 'string') {
    throw new Error('Raw document text is required for medical extraction.');
  }

  // Split into clean lines
  const lines = rawText
    .split(/\r?\n/)
    .map(cleanLine)
    .filter((line) => line.length > 0);

  // 1. Detect document type
  const documentType = detectDocumentType(rawText);

  // 2. Extract header metadata
  const headerMeta = extractHeaderMetadata(lines);

  // 3. Extract lab / diagnostic tests (without clinical interpretation)
  const tests = extractLaboratoryTests(lines, headerMeta.documentDate);

  // 4. Extract medications (filtering negative assertions)
  const medications = extractMedications(lines);

  // 5. Extract clinical information
  const clinicalInfo = extractClinicalInformation(lines);

  // Construct database-ready structured schema
  return {
    documentId,
    documentType,
    documentDate: headerMeta.documentDate,
    reportId: headerMeta.reportId,

    patient: headerMeta.patient,
    doctor: headerMeta.doctor,

    tests,
    medications,

    clinicalInformation: clinicalInfo,

    provenance: {
      documentId,
      extractedAt: new Date().toISOString(),
      method: 'deterministic_clinical_parser',
      fieldCounts: {
        tests: tests.length,
        medications: medications.length,
        findings: clinicalInfo.findings.length,
        recommendations: clinicalInfo.recommendations.length,
        diagnoses: clinicalInfo.diagnoses.length,
        symptoms: clinicalInfo.symptoms.length,
      },
    },
  };
}

export default {
  extractFromText,
  detectDocumentType,
  extractHeaderMetadata,
  extractLaboratoryTests,
  extractMedications,
  extractClinicalInformation,
};
