import { parsePdf } from "./documentParser";

async function main() {
  try {
    const result = await parsePdf(
      "document/test-data/sample-report.pdf"
    );

    console.log("PDF parsed successfully");
    console.log("Pages:", result.pageCount);
    console.log("\nExtracted text:\n");
    console.log(result.text);
  } catch (error) {
    console.error("PDF parsing failed:", error);
  }
}

main();