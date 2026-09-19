import fs from "node:fs";
import { PDFParse } from "pdf-parse";

export interface ParsedDocument {
  text: string;
  pageCount: number;
}

export async function parsePdf(
  filePath: string
): Promise<ParsedDocument> {
  const fileBuffer = fs.readFileSync(filePath);

  const parser = new PDFParse({
    data: fileBuffer,
  });

  try {
    const result = await parser.getText();

    return {
      text: result.text.trim(),
      pageCount: result.total,
    };
  } finally {
    await parser.destroy();
  }
}