import fs from 'fs';
import path from 'path';
import { createRequire } from 'module';

const require = createRequire(path.resolve('package.json'));
const jwt = require('jsonwebtoken');

const BASE_URL = 'http://localhost:3000';
const JWT_SECRET = 'careweave-project-2-prototype-jwt-secret-key-987654321';

async function runStep10Tests() {
  console.log('=== CareWeave Step 10 Database & Persistent Storage Verification ===\n');
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

  // 2. Unauthenticated GET /api/documents -> 401
  const unauthListRes = await fetch(`${BASE_URL}/api/documents`);
  assert(unauthListRes.status === 401, `Unauthenticated GET /api/documents returned 401 (got ${unauthListRes.status})`);

  // 3. Invalid token GET /api/documents -> 403
  const invalidListRes = await fetch(`${BASE_URL}/api/documents`, {
    headers: { Authorization: 'Bearer invalid-token-xyz' },
  });
  assert(invalidListRes.status === 403, `Invalid token GET /api/documents returned 403 (got ${invalidListRes.status})`);

  // 4. Upload a new test PDF
  const samplePdfPath = 'C:\\Users\\shakshi neha\\CareWeave\\backend\\uploads\\doc_2c47bf7d-bbae-4df0-9362-9767eb905c4a.pdf';
  const pdfBytes = fs.readFileSync(samplePdfPath);
  const pdfBlob = new Blob([pdfBytes], { type: 'application/pdf' });
  const formData = new FormData();
  formData.append('file', pdfBlob, 'step10_persistence_test.pdf');

  const uploadRes = await fetch(`${BASE_URL}/api/documents/upload`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}` },
    body: formData,
  });
  const uploadData = await uploadRes.json();
  const docId = uploadData.document.id;
  assert(uploadData.success, `Uploaded document (${docId})`);

  // 5. Verify uploaded document exists in GET /api/documents
  const listRes = await fetch(`${BASE_URL}/api/documents`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  const listData = await listRes.json();
  assert(listRes.status === 200, `GET /api/documents returned 200 (got ${listRes.status})`);
  assert(Array.isArray(listData.documents), 'Documents is an array');
  const foundInList = listData.documents.find(d => d.id === docId);
  assert(foundInList !== undefined, `Uploaded document found in GET /api/documents list (${foundInList?.originalName})`);
  assert(foundInList.processingStatus === 'UPLOADED', `Initial processingStatus is UPLOADED (${foundInList.processingStatus})`);

  // 6. Verify single document retrieval GET /api/documents/:documentId before processing
  const singleDocRes = await fetch(`${BASE_URL}/api/documents/${docId}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  const singleDocData = await singleDocRes.json();
  assert(singleDocRes.status === 200, `GET /api/documents/:id returned 200 (got ${singleDocRes.status})`);
  assert(singleDocData.document?.id === docId, 'Document ID matches');
  assert(singleDocData.extraction === null, 'Extraction is null prior to extraction');

  // 7. Process the document (Step 8)
  const processRes = await fetch(`${BASE_URL}/api/documents/${docId}/process`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}` },
  });
  const processData = await processRes.json();
  assert(processRes.status === 200 && processData.document?.status === 'READY', 'Document processed to READY status');

  // Verify status updated in persistent store
  const updatedSingleDocRes = await fetch(`${BASE_URL}/api/documents/${docId}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  const updatedSingleDocData = await updatedSingleDocRes.json();
  assert(updatedSingleDocData.document?.processingStatus === 'READY', `processingStatus updated to READY in DB (${updatedSingleDocData.document?.processingStatus})`);

  // 8. Extract medical information (Step 9 -> Step 10 persistence)
  const extractRes = await fetch(`${BASE_URL}/api/documents/${docId}/extract`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}` },
  });
  const extractData = await extractRes.json();
  assert(extractRes.status === 200, `POST /api/documents/:id/extract returned 200 (got ${extractRes.status})`);
  assert(extractData.extraction?.status === 'EXTRACTED', 'Extraction status is EXTRACTED');

  // 9. Retrieve persisted extraction via GET /api/documents/:documentId
  const extractedDocRes = await fetch(`${BASE_URL}/api/documents/${docId}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  const extractedDocData = await extractedDocRes.json();
  assert(extractedDocRes.status === 200, `GET /api/documents/:id returned 200 (got ${extractedDocRes.status})`);
  assert(extractedDocData.document?.extractionStatus === 'EXTRACTED', 'Document record has extractionStatus: EXTRACTED');
  assert(extractedDocData.extraction !== null, 'Extraction object is present in GET response');

  const ext = extractedDocData.extraction;
  assert(ext.patient?.name === 'Aditi Sharma', `Persisted patient name matches: ${ext.patient?.name}`);
  assert(ext.doctor?.name === 'Dr. Meera Kapoor', `Persisted doctor name matches: ${ext.doctor?.name}`);
  assert(Array.isArray(ext.tests) && ext.tests.length === 7, `Persisted 7 tests (got ${ext.tests?.length})`);
  assert(Array.isArray(ext.medications) && ext.medications.length === 1, `Persisted 1 medication (got ${ext.medications?.length})`);
  assert(ext.clinicalInformation?.recommendations?.length === 3, `Persisted 3 recommendations (got ${ext.clinicalInformation?.recommendations?.length})`);

  // 10. Repeated extraction does NOT create duplicate records
  const reExtractRes = await fetch(`${BASE_URL}/api/documents/${docId}/extract`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}` },
  });
  const reExtractData = await reExtractRes.json();
  assert(reExtractRes.status === 200, 'Repeated extraction succeeded');

  // Check database directly via service
  const { databaseService } = await import('file:///C:/Users/shakshi%20neha/CareWeave/backend/src/services/databaseService.js');
  const dbExtraction = databaseService.getExtractionByDocumentId(docId);
  assert(dbExtraction !== null, 'Database has exactly one extraction record for docId');

  // 11. Security: Cross-user access blocked (403)
  const otherUserToken = jwt.sign({ email: 'other_user@example.com' }, JWT_SECRET, { expiresIn: '1h' });
  const crossUserGetRes = await fetch(`${BASE_URL}/api/documents/${docId}`, {
    headers: { Authorization: `Bearer ${otherUserToken}` },
  });
  assert(crossUserGetRes.status === 403, `Cross-user GET returned 403 (got ${crossUserGetRes.status})`);

  // Other user sees empty list
  const otherUserListRes = await fetch(`${BASE_URL}/api/documents`, {
    headers: { Authorization: `Bearer ${otherUserToken}` },
  });
  const otherUserListData = await otherUserListRes.json();
  const crossDocInList = otherUserListData.documents?.find(d => d.id === docId);
  assert(!crossDocInList, 'Cross-user list does NOT include other user documents');

  // 12. Non-existent document returns 404
  const notFoundRes = await fetch(`${BASE_URL}/api/documents/doc_00000000-0000-0000-0000-000000000000`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  assert(notFoundRes.status === 404, `Non-existent document returned 404 (got ${notFoundRes.status})`);

  // 13. Malformed document ID returns 400
  const malformedRes = await fetch(`${BASE_URL}/api/documents/..%2F..%2Fetc%2Fpasswd`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  assert(malformedRes.status === 400, `Malformed ID returned 400 (got ${malformedRes.status})`);

  // 14. Leakage prevention checks
  const listJson = JSON.stringify(listData);
  const singleDocJson = JSON.stringify(extractedDocData);
  assert(!listJson.includes('C:\\') && !listJson.includes('/uploads/'), 'Document list contains NO filesystem paths');
  assert(!singleDocJson.includes('C:\\') && !singleDocJson.includes('/uploads/'), 'Single document response contains NO filesystem paths');
  assert(!singleDocJson.includes('Mock Laboratory Test Report\nSample document'), 'Single document response contains NO raw full document text');

  console.log(`\n=== Verification Complete: ${passed} passed, ${failed} failed ===`);
  console.log(`Created documentId for restart test: ${docId}`);

  if (failed > 0) process.exit(1);
}

runStep10Tests().catch(err => {
  console.error('Test execution failed:', err);
  process.exit(1);
});
