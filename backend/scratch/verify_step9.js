import fs from 'fs';
import path from 'path';
import { createRequire } from 'module';

const require = createRequire(path.resolve('package.json'));
const jwt = require('jsonwebtoken');

const BASE_URL = 'http://localhost:3000';
const JWT_SECRET = 'careweave-project-2-prototype-jwt-secret-key-987654321';

async function runStep9Tests() {
  console.log('=== CareWeave Step 9 Medical Information Extraction Verification ===\n');
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

  // 1. Authenticate as demo user
  const loginRes = await fetch(`${BASE_URL}/api/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'demo@example.com', password: 'careweave123' }),
  });
  const loginData = await loginRes.json();
  const token = loginData.token;
  assert(token, 'Obtained authentication token');

  // 2. Unauthenticated extraction request -> 401
  const unauthRes = await fetch(`${BASE_URL}/api/documents/doc_11111111-1111-1111-1111-111111111111/extract`, {
    method: 'POST',
  });
  assert(unauthRes.status === 401, `Unauthenticated request returned 401 (got ${unauthRes.status})`);

  // 3. Invalid JWT -> 403
  const invalidJwtRes = await fetch(`${BASE_URL}/api/documents/doc_11111111-1111-1111-1111-111111111111/extract`, {
    method: 'POST',
    headers: { Authorization: 'Bearer invalid-token-xyz' },
  });
  assert(invalidJwtRes.status === 403, `Invalid JWT returned 403 (got ${invalidJwtRes.status})`);

  // 4. Nonexistent document -> 404
  const notFoundRes = await fetch(`${BASE_URL}/api/documents/doc_00000000-0000-0000-0000-000000000000/extract`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}` },
  });
  assert(notFoundRes.status === 404, `Nonexistent document returned 404 (got ${notFoundRes.status})`);

  // 5. Malformed document ID -> 400
  const malformedRes = await fetch(`${BASE_URL}/api/documents/..%2F..%2Fetc%2Fpasswd/extract`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}` },
  });
  assert(malformedRes.status === 400, `Malformed / path traversal doc ID returned 400 (got ${malformedRes.status})`);

  // 6. Upload a test PDF (unprocessed initially)
  const samplePdfPath = 'C:\\Users\\shakshi neha\\CareWeave\\backend\\uploads\\doc_2c47bf7d-bbae-4df0-9362-9767eb905c4a.pdf';
  const pdfBytes = fs.readFileSync(samplePdfPath);
  const pdfBlob = new Blob([pdfBytes], { type: 'application/pdf' });
  const formData = new FormData();
  formData.append('file', pdfBlob, 'lab_report.pdf');

  const uploadRes = await fetch(`${BASE_URL}/api/documents/upload`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}` },
    body: formData,
  });
  const uploadData = await uploadRes.json();
  const docId = uploadData.document.id;
  assert(uploadData.success, `Uploaded document (${docId})`);

  // 7. Extract BEFORE processing -> should be rejected safely (409)
  const prematureExtractRes = await fetch(`${BASE_URL}/api/documents/${docId}/extract`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}` },
  });
  assert(prematureExtractRes.status === 409, `Extraction before processing rejected with 409 (got ${prematureExtractRes.status})`);

  // 8. Now process the document (Step 8)
  const processRes = await fetch(`${BASE_URL}/api/documents/${docId}/process`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}` },
  });
  const processData = await processRes.json();
  assert(processRes.status === 200 && processData.document?.status === 'READY', 'Document processed to READY status');

  // 9. Cross-user extraction attempt -> 403
  const otherUserToken = jwt.sign({ email: 'other_user@example.com' }, JWT_SECRET, { expiresIn: '1h' });
  const wrongUserRes = await fetch(`${BASE_URL}/api/documents/${docId}/extract`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${otherUserToken}` },
  });
  assert(wrongUserRes.status === 403, `Wrong user extraction rejected with 403 (got ${wrongUserRes.status})`);

  // 10. Valid structured extraction (Step 9) -> 200
  const extractRes = await fetch(`${BASE_URL}/api/documents/${docId}/extract`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}` },
  });
  const extractData = await extractRes.json();
  assert(extractRes.status === 200, `Extraction returned 200 (got ${extractRes.status})`);
  assert(extractData.success === true, 'Response success is true');
  assert(extractData.extraction?.status === 'EXTRACTED', 'Extraction status is EXTRACTED');

  const extracted = extractData.extraction?.data;
  assert(extracted !== undefined, 'Extracted data object is present');

  // Check document grounding & metadata
  assert(extracted.documentId === docId, 'documentId matches');
  assert(extracted.documentType === 'LABORATORY_REPORT', `documentType is LABORATORY_REPORT (got ${extracted.documentType})`);
  assert(extracted.documentDate === '18 September 2026', `documentDate extracted (${extracted.documentDate})`);
  assert(extracted.reportId === 'MOCK-LAB-2026-0918-042', `reportId extracted (${extracted.reportId})`);

  // Patient & Doctor
  assert(extracted.patient?.name === 'Aditi Sharma', `Patient name extracted: ${extracted.patient?.name}`);
  assert(extracted.patient?.dateOfBirth === '14 March 1998', `Patient DOB extracted: ${extracted.patient?.dateOfBirth}`);
  assert(extracted.patient?.identifier === null, 'Missing patient identifier is explicitly null (not invented)');
  assert(extracted.doctor?.name === 'Dr. Meera Kapoor', `Doctor name extracted: ${extracted.doctor?.name}`);
  assert(extracted.doctor?.speciality === 'Internal Medicine', `Doctor speciality extracted: ${extracted.doctor?.speciality}`);
  assert(extracted.doctor?.clinic === 'Greenfield Medical Clinic', `Clinic extracted: ${extracted.doctor?.clinic}`);

  // Tests
  assert(Array.isArray(extracted.tests) && extracted.tests.length === 7, `7 tests extracted (got ${extracted.tests?.length})`);

  // CORRECTION 1: Verify NO COMPUTED CLINICAL STATUS
  // In the mock PDF, Vitamin D is 24 with range 30-100, but document contains no flag
  const vitD = extracted.tests.find(t => t.name.toLowerCase().includes('vitamin d'));
  assert(vitD !== undefined, 'Vitamin D test found');
  assert(vitD.numericValue === 24, `Vitamin D numericValue is 24 (got ${vitD.numericValue})`);
  assert(vitD.documentFlag === null, `CORRECTION 1: Vitamin D documentFlag is null because document did NOT write a flag (got ${vitD.documentFlag})`);
  assert(vitD.status === undefined, 'CORRECTION 1: No computed "status" field exists on test record');

  // Medications & negative filter check
  assert(Array.isArray(extracted.medications) && extracted.medications.length === 1, `Exactly 1 medication extracted (got ${extracted.medications?.length})`);
  const med = extracted.medications[0];
  assert(med.name.includes('Cholecalciferol'), `Medication name is ${med.name}`);
  assert(med.dose === '1000' && med.unit === 'IU', `Medication dose is ${med.dose} ${med.unit}`);
  assert(med.frequency === 'Once daily', `Medication frequency is ${med.frequency}`);
  // Verify negative statement "No other medication recorded — —" was NOT extracted as a medication
  const negativeMed = extracted.medications.find(m => m.name.toLowerCase().includes('no other'));
  assert(!negativeMed, 'Negative medication statement "No other medication recorded" filtered out');

  // Clinical information: explicit only, missing fields are []
  assert(extracted.clinicalInformation?.symptoms?.length === 0, 'Symptoms array is [] (not present in doc, not invented)');
  assert(extracted.clinicalInformation?.diagnoses?.length === 0, 'Diagnoses array is [] (not present in doc, not invented)');
  assert(extracted.clinicalInformation?.recommendations?.length === 3, `3 recommendations extracted (got ${extracted.clinicalInformation?.recommendations?.length})`);
  assert(extracted.clinicalInformation?.findings?.length === 1, 'Findings extracted as 1 cohesive paragraph');

  // 11. Security checks: No raw text, no filesystem paths
  const responseJson = JSON.stringify(extractData);
  assert(!responseJson.includes('C:\\') && !responseJson.includes('/uploads/'), 'Response contains NO filesystem paths');
  assert(!extractData.text && !extractData.rawText && !extractData._extractedText, 'Response contains NO raw full document text');

  // 12. Cached re-extraction
  const reExtractRes = await fetch(`${BASE_URL}/api/documents/${docId}/extract`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}` },
  });
  const reExtractData = await reExtractRes.json();
  assert(reExtractRes.status === 200 && reExtractData.extraction?.status === 'EXTRACTED', 'Cached re-extraction returns EXTRACTED');

  // 13. Image document with OCR_REQUIRED -> safe 422 rejection
  const pngBase64 = 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==';
  const pngBuffer = Buffer.from(pngBase64, 'base64');
  const imgBlob = new Blob([pngBuffer], { type: 'image/png' });
  const imgFormData = new FormData();
  imgFormData.append('file', imgBlob, 'scan.png');

  const imgUploadRes = await fetch(`${BASE_URL}/api/documents/upload`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}` },
    body: imgFormData,
  });
  const imgUploadData = await imgUploadRes.json();
  const imgDocId = imgUploadData.document.id;

  // Process image -> OCR_REQUIRED
  await fetch(`${BASE_URL}/api/documents/${imgDocId}/process`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}` },
  });

  // Try extracting image -> 422
  const imgExtractRes = await fetch(`${BASE_URL}/api/documents/${imgDocId}/extract`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}` },
  });
  assert(imgExtractRes.status === 422, `Image extraction rejected with 422 (got ${imgExtractRes.status})`);

  // 14. CORRECTION 2: Test generic parser on an ENTIRELY DIFFERENT document fixture
  // Proves the parser is generic and has ZERO hardcoded names or clinic data
  const { extractFromText } = await import('file:///C:/Users/shakshi%20neha/CareWeave/backend/src/services/extractors/deterministicExtractor.js');

  const entirelyDifferentDocText = `
Pacific Health Medical Center
Specialist Consultation Report
Patient: Michael Chang
Date of Birth: 05/12/1975
Document Date: 22 October 2025
Report ID: PHMC-99412
Attending Physician: Dr. Robert Vance
Department: Cardiology
Facility: Pacific Heart Institute

Laboratory Results
Test Result Reference Range Unit Flag
Lipid Panel
Total Cholesterol 245 125–200 mg/dL HIGH
Triglycerides 180 < 150 mg/dL H
HDL Cholesterol 42 > 40 mg/dL
LDL Cholesterol 167 < 100 mg/dL CRITICAL

Current Medications
Atorvastatin 40 mg once daily
Metoprolol Tartrate 25 mg twice daily
No other medications recorded — —

Clinical Note
Patient reports occasional exertional fatigue. Resting ECG shows normal sinus rhythm.

Recommended Follow-up
1. Echocardiogram in 4 weeks.
2. Low sodium dietary modifications.
3. Follow-up consultation in 6 weeks with Dr. Vance.
`;

  const diffResult = extractFromText('doc_different_patient', entirelyDifferentDocText);
  assert(diffResult.patient?.name === 'Michael Chang', `Generic parser extracted new patient: ${diffResult.patient?.name}`);
  assert(diffResult.patient?.dateOfBirth === '05/12/1975', `Generic parser extracted new DOB: ${diffResult.patient?.dateOfBirth}`);
  assert(diffResult.doctor?.name === 'Dr. Robert Vance', `Generic parser extracted new doctor: ${diffResult.doctor?.name}`);
  assert(diffResult.doctor?.speciality === 'Cardiology', `Generic parser extracted new speciality: ${diffResult.doctor?.speciality}`);
  assert(diffResult.doctor?.clinic === 'Pacific Heart Institute', `Generic parser extracted new clinic: ${diffResult.doctor?.clinic}`);
  assert(diffResult.tests.length === 4, `Generic parser extracted 4 new tests (got ${diffResult.tests.length})`);

  // Test explicit document flags when present in text
  const cholTest = diffResult.tests.find(t => t.name.toLowerCase().includes('total cholesterol'));
  assert(cholTest?.documentFlag === 'HIGH', `Document explicit flag 'HIGH' extracted: ${cholTest?.documentFlag}`);
  const hdlTest = diffResult.tests.find(t => t.name.toLowerCase().includes('hdl'));
  assert(hdlTest?.documentFlag === null, `Test with no explicit flag has documentFlag: null: ${hdlTest?.documentFlag}`);
  assert(diffResult.medications.length === 2, `Generic parser extracted 2 new medications (got ${diffResult.medications.length})`);
  assert(diffResult.clinicalInformation.recommendations.length === 3, `Generic parser extracted 3 recommendations`);

  console.log(`\n=== Verification Complete: ${passed} passed, ${failed} failed ===`);
  if (failed > 0) process.exit(1);
}

runStep9Tests().catch(err => {
  console.error('Test execution failed:', err);
  process.exit(1);
});
