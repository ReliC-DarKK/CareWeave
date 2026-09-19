import { parsePdf } from "./documentParser";
import { extractClinicalData } from "./documentExtractor";
import { normalizeClinicalData } from "./documentNormalizer";
import { mergeDocumentWithPatient } from "./documentPatientMerge";
import { mockPatient } from "../data/mockPatient";

async function main() {
  const filePath =
    "document/test-data/sample-report.pdf";

  const parsed = await parsePdf(filePath);

  const extracted = extractClinicalData({
    text: parsed.text,
    documentId: "demo-document-001",
    fileName: "sample-report.pdf",
    documentType: "clinical-note",
  });

  const normalized =
    normalizeClinicalData(extracted);

  const mergedPatient =
    mergeDocumentWithPatient(
      mockPatient,
      normalized
    );

  console.log(
    JSON.stringify(
      {
        conditions: mergedPatient.conditions,
        medications: mergedPatient.medications,
        labs: mergedPatient.labs,
        appointments: mergedPatient.appointments,
        symptoms: mergedPatient.symptoms,
      },
      null,
      2
    )
  );
}

main().catch((error) => {
  console.error(
    "Document patient merge failed:",
    error
  );
});