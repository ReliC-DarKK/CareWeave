import zlib from "node:zlib";
import pdfParse from "pdf-parse";

/**
 * Validates PDF header magic bytes (%PDF-).
 */
export function isValidPdfBuffer(buffer: Buffer): boolean {
  if (buffer.length < 5) return false;
  const header = buffer.toString("latin1", 0, Math.min(buffer.length, 1024));
  return header.includes("%PDF-");
}

/**
 * Extracts raw textual content from a PDF buffer.
 *
 * Tries `pdf-parse` first, falling back to a stream/text operator scanner
 * to ensure deterministic parsing even on synthetic or minimal PDF fixtures.
 */
export async function extractDocumentText(buffer: Buffer): Promise<string> {
  if (!isValidPdfBuffer(buffer)) {
    throw new Error("Invalid PDF format: missing %PDF- header");
  }

  // 1. Primary extractor: pdf-parse
  try {
    const parsed = await pdfParse(buffer);
    const text = parsed.text?.trim();
    if (text && text.length > 0) {
      return text;
    }
  } catch {
    // Fall back to stream operator extraction
  }

  // 2. Fallback extractor: decompress FlateDecode streams & parse Tj / TJ text
  const rawText = buffer.toString("latin1");
  const extractedPieces: string[] = [];

  const streamRegex = /stream\r?\n([\s\S]*?)\r?\nendstream/g;
  let match: RegExpExecArray | null;

  while ((match = streamRegex.exec(rawText)) !== null) {
    const rawStream = match[1] ?? "";
    let decompressed = rawStream;

    try {
      const inflated = zlib.inflateSync(Buffer.from(rawStream, "latin1"));
      decompressed = inflated.toString("latin1");
    } catch {
      // Stream is either uncompressed or uses an unhandled filter; inspect as-is
    }

    // Match (string) Tj or ' or "
    const tjRegex = /\(([^)]+)\)\s*(?:Tj|'|")/g;
    let tjMatch: RegExpExecArray | null;
    while ((tjMatch = tjRegex.exec(decompressed)) !== null) {
      const val = tjMatch[1];
      if (val) extractedPieces.push(val);
    }

    // Match [(string) ... (string)] TJ
    const arrayTjRegex = /\[(.*?)\]\s*TJ/g;
    let arrMatch: RegExpExecArray | null;
    while ((arrMatch = arrayTjRegex.exec(decompressed)) !== null) {
      const inner = arrMatch[1] ?? "";
      const innerRegex = /\(([^)]+)\)/g;
      let innerMatch: RegExpExecArray | null;
      while ((innerMatch = innerRegex.exec(inner)) !== null) {
        const val = innerMatch[1];
        if (val) extractedPieces.push(val);
      }
    }
  }

  // Also check unstreamed text blocks (e.g. BT (text) Tj ET without stream block)
  if (extractedPieces.length === 0) {
    const directTjRegex = /\(([^)]+)\)\s*(?:Tj|'|")/g;
    let directMatch: RegExpExecArray | null;
    while ((directMatch = directTjRegex.exec(rawText)) !== null) {
      const val = directMatch[1];
      if (val) extractedPieces.push(val);
    }
  }

  return extractedPieces.join(" ").trim();
}
