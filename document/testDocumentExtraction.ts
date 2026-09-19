import { parsePdf } from "./documentParser";
import { extractClinicalData } from "./documentExtractor";
import { normalizeClinicalData } from "./documentNormalizer";

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

  console.log(
    JSON.stringify(normalized, null, 2)
  );
}

main().catch((error) => {
  console.error(
    "Document normalization failed:",
    error
  );
});