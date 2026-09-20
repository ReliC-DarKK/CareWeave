import fs from 'fs';
import path from 'path';
import { createRequire } from 'module';

const require = createRequire(path.resolve('package.json'));
const jwt = require('jsonwebtoken');

const BASE_URL = 'http://localhost:3000';
const JWT_SECRET = 'careweave-project-2-prototype-jwt-secret-key-987654321';

async function runTests() {
  console.log('=== CareWeave Step 8 Document Processing Verification ===\n');
  let passed = 0;
  let failed = 0;

  function assert(condition, msg) {
    if (condition) {
      console.log(`✅ PASS: ${msg}`);
      passed++;
    } else {
      console.error(`❌ FAIL: ${msg}`);
      failed++;
    }
  }

  // 1. Authenticate
  const loginRes = await fetch(`${BASE_URL}/api/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'demo@example.com', password: 'careweave123' }),
  });
  const loginData = await loginRes.json();
  const token = loginData.token;
  assert(token, 'Obtained authentication token');

  // 2. Unauthenticated process request -> 401
  const unauthRes = await fetch(`${BASE_URL}/api/documents/doc_11111111-1111-1111-1111-111111111111/process`, {
    method: 'POST',
  });
  assert(unauthRes.status === 401, `Unauthenticated request returned 401 (got ${unauthRes.status})`);

  // 3. Invalid JWT -> 403
  const invalidJwtRes = await fetch(`${BASE_URL}/api/documents/doc_11111111-1111-1111-1111-111111111111/process`, {
    method: 'POST',
    headers: { Authorization: 'Bearer invalid-token-xyz' },
  });
  assert(invalidJwtRes.status === 403, `Invalid JWT returned 403 (got ${invalidJwtRes.status})`);

  // 4. Malformed document ID -> 400
  const malformedRes = await fetch(`${BASE_URL}/api/documents/..%2F..%2Fetc%2Fpasswd/process`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}` },
  });
  assert(malformedRes.status === 400, `Path traversal / malformed ID returned 400 (got ${malformedRes.status})`);

  const malformedRes2 = await fetch(`${BASE_URL}/api/documents/not-a-valid-uuid/process`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}` },
  });
  assert(malformedRes2.status === 400, `Non-uuid doc ID returned 400 (got ${malformedRes2.status})`);

  // 5. Non-existent document ID -> 404
  const notFoundRes = await fetch(`${BASE_URL}/api/documents/doc_00000000-0000-0000-0000-000000000000/process`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}` },
  });
  assert(notFoundRes.status === 404, `Non-existent document returned 404 (got ${notFoundRes.status})`);

  // 6. Upload a sample PDF
  // We'll use one of the PDFs already in uploads or create a FormData upload
  // Let's create a minimal PDF buffer or read an existing PDF
  const samplePdfPath = 'C:\\Users\\shakshi neha\\CareWeave\\backend\\uploads\\doc_2c47bf7d-bbae-4df0-9362-9767eb905c4a.pdf';
  const pdfBytes = fs.readFileSync(samplePdfPath);
  const pdfBlob = new Blob([pdfBytes], { type: 'application/pdf' });
  const formData = new FormData();
  formData.append('file', pdfBlob, 'lab_results.pdf');

  const uploadRes = await fetch(`${BASE_URL}/api/documents/upload`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}` },
    body: formData,
  });
  const uploadData = await uploadRes.json();
  assert(uploadRes.status === 200 && uploadData.success, `PDF uploaded successfully (id: ${uploadData.document?.id})`);
  const uploadedDocId = uploadData.document.id;

  // 7. Process the uploaded PDF -> READY
  const processRes = await fetch(`${BASE_URL}/api/documents/${uploadedDocId}/process`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}` },
  });
  const processData = await processRes.json();
  assert(processRes.status === 200, `Process request returned 200 (got ${processRes.status})`);
  assert(processData.success === true, 'Response success is true');
  assert(processData.document?.status === 'READY', `Document status is READY (got ${processData.document?.status})`);
  assert(processData.processing?.type === 'pdf_text', `Processing type is pdf_text (got ${processData.processing?.type})`);
  assert(processData.processing?.characterCount > 100, `Character count extracted (${processData.processing?.characterCount} chars)`);
  assert(processData.processing?.pageCount >= 1, `Page count extracted (${processData.processing?.pageCount} pages)`);

  // 8. Re-process already processed document -> returns cached READY
  const reProcessRes = await fetch(`${BASE_URL}/api/documents/${uploadedDocId}/process`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}` },
  });
  const reProcessData = await reProcessRes.json();
  assert(reProcessRes.status === 200 && reProcessData.processing?.status === 'READY', 'Re-processing returns cached READY state');

  // 9. Check response leaks: NO filesystem paths, NO extracted text
  const jsonString = JSON.stringify(processData);
  assert(!jsonString.includes('C:\\') && !jsonString.includes('/uploads/'), 'Response contains NO filesystem paths');
  assert(!processData.text && !processData.rawText && !processData._extractedText, 'Response contains NO extracted text content');

  // 10. Process attempt by wrong user -> 403
  const otherUserToken = jwt.sign({ email: 'other_user@example.com' }, JWT_SECRET, { expiresIn: '1h' });
  const wrongUserRes = await fetch(`${BASE_URL}/api/documents/${uploadedDocId}/process`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${otherUserToken}` },
  });
  assert(wrongUserRes.status === 403, `Wrong user cannot process document (returned 403, got ${wrongUserRes.status})`);

  // 11. Image document -> OCR_REQUIRED
  // Upload a minimal 1x1 PNG
  const pngBase64 = 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==';
  const pngBuffer = Buffer.from(pngBase64, 'base64');
  const imgBlob = new Blob([pngBuffer], { type: 'image/png' });
  const imgFormData = new FormData();
  imgFormData.append('file', imgBlob, 'xray_scan.png');

  const imgUploadRes = await fetch(`${BASE_URL}/api/documents/upload`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}` },
    body: imgFormData,
  });
  const imgUploadData = await imgUploadRes.json();
  assert(imgUploadRes.status === 200 && imgUploadData.success, `Image uploaded successfully (id: ${imgUploadData.document?.id})`);
  const imgDocId = imgUploadData.document.id;

  const imgProcessRes = await fetch(`${BASE_URL}/api/documents/${imgDocId}/process`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}` },
  });
  const imgProcessData = await imgProcessRes.json();
  assert(imgProcessRes.status === 200, `Image process returned 200 (got ${imgProcessRes.status})`);
  assert(imgProcessData.document?.status === 'OCR_REQUIRED', `Image status is OCR_REQUIRED (got ${imgProcessData.document?.status})`);
  assert(imgProcessData.processing?.type === 'image', `Processing type is image (got ${imgProcessData.processing?.type})`);

  console.log(`\n=== Verification Complete: ${passed} passed, ${failed} failed ===`);
  if (failed > 0) process.exit(1);
}

runTests().catch(err => {
  console.error('Test execution failed:', err);
  process.exit(1);
});
