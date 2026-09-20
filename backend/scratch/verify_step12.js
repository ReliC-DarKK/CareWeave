import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import { createRequire } from 'module';

const require = createRequire(path.resolve('package.json'));
const jwt = require('jsonwebtoken');
const Database = require('better-sqlite3');

const BASE_URL = 'http://localhost:3000';
const JWT_SECRET = 'careweave-project-2-prototype-jwt-secret-key-987654321';

async function runStep12Tests() {
  console.log('=== CareWeave Step 12 Functional Care Journey Timeline Verification ===\n');
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

  // 1. Authenticate as primary demo user
  const loginRes = await fetch(`${BASE_URL}/api/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'demo@example.com', password: 'careweave123' }),
  });
  const loginData = await loginRes.json();
  const token = loginData.token;
  assert(token, 'Obtained authentication token for primary user');

  // 2. Unauthenticated GET /api/patients/:patientId/care-journey -> 401
  const unauthRes = await fetch(`${BASE_URL}/api/patients/pat_11111111-1111-1111-1111-111111111111/care-journey`);
  assert(unauthRes.status === 401, `Unauthenticated request returns 401 (got ${unauthRes.status})`);

  // 3. Invalid JWT returns 403
  const invalidRes = await fetch(`${BASE_URL}/api/patients/pat_11111111-1111-1111-1111-111111111111/care-journey`, {
    headers: { Authorization: 'Bearer bad-token-xyz' },
  });
  assert(invalidRes.status === 403, `Invalid JWT returns 403 (got ${invalidRes.status})`);

  // 4. Malformed patient ID returns 400
  const malformedRes = await fetch(`${BASE_URL}/api/patients/not-a-valid-uuid/care-journey`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  assert(malformedRes.status === 400, `Malformed patient ID returns 400 (got ${malformedRes.status})`);

  // 5. Non-existent patient returns 404
  const notFoundRes = await fetch(`${BASE_URL}/api/patients/pat_00000000-0000-0000-0000-000000000000/care-journey`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  assert(notFoundRes.status === 404, `Nonexistent patient returns 404 (got ${notFoundRes.status})`);

  // 6. Cross-user patient access returns 403
  const otherUserToken = jwt.sign({ email: 'other_user_cj@example.com' }, JWT_SECRET, { expiresIn: '1h' });

  // Dynamically import databaseService and patientService
  const { databaseService } = await import('file:///C:/Users/shakshi%20neha/CareWeave/backend/src/services/databaseService.js');
  const { patientService } = await import('file:///C:/Users/shakshi%20neha/CareWeave/backend/src/services/patientService.js');

  // Create Patient 1 for demo user with unique MRN and Name for this run
  const testMrn = `MRN-EMILY-${crypto.randomUUID().slice(0, 8)}`;
  const testPatientName = `Emily Watson ${crypto.randomUUID().slice(0, 4)}`;
  const patient1Id = `pat_${crypto.randomUUID()}`;
  databaseService.createPatient({
    id: patient1Id,
    ownerEmail: 'demo@example.com',
    name: testPatientName,
    dateOfBirth: '1985-06-20',
    identifier: testMrn,
  });

  // Cross-user test: other user cannot access Patient 1 care journey
  const crossUserRes = await fetch(`${BASE_URL}/api/patients/${patient1Id}/care-journey`, {
    headers: { Authorization: `Bearer ${otherUserToken}` },
  });
  assert(crossUserRes.status === 403, `Cross-user patient access returns 403 (got ${crossUserRes.status})`);

  // 7. Empty patient produces an empty timeline (no mock events)
  const emptyJourneyRes = await fetch(`${BASE_URL}/api/patients/${patient1Id}/care-journey`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  const emptyJourneyData = await emptyJourneyRes.json();
  assert(emptyJourneyRes.status === 200, `Empty patient care journey returns 200`);
  assert(emptyJourneyData.success === true, `Empty patient success is true`);
  assert(Array.isArray(emptyJourneyData.events), `Events is an array`);
  assert(emptyJourneyData.events.length === 0, `Empty patient produces empty timeline array with 0 events (got ${emptyJourneyData.events.length})`);
  assert(emptyJourneyData.count === 0, `Empty patient count is 0`);

  // 8. Associate Document 1 with Patient 1 (Date: "15 March 2026")
  const doc1Id = `doc_${crypto.randomUUID()}`;
  databaseService.saveDocument({
    id: doc1Id,
    ownerEmail: 'demo@example.com',
    originalName: 'lab_report_march.pdf',
    storedFilename: 'synthetic_doc1.pdf',
    mimeType: 'application/pdf',
    size: 2048,
    uploadedAt: '2026-03-16T10:00:00.000Z',
    processingStatus: 'READY',
  });

  const ext1 = {
    documentType: 'LABORATORY_REPORT',
    documentDate: '15 March 2026',
    reportId: 'LAB-2026-0315-01',
    patient: { name: testPatientName, dateOfBirth: '1985-06-20', identifier: testMrn },
    doctor: { name: 'Dr. Sarah Jenkins', speciality: 'Endocrinology', clinic: 'Metro Health Endocrinology' },
    tests: [
      { name: 'HbA1c', value: '5.8', numericValue: 5.8, unit: '%', referenceRange: '4.0-5.6', documentFlag: 'HIGH' },
      { name: 'Fasting Glucose', value: '92', numericValue: 92, unit: 'mg/dL', referenceRange: '70-99', documentFlag: null },
    ],
    medications: [
      { name: 'Metformin', dose: '500', unit: 'mg', frequency: 'Twice daily' },
    ],
    clinicalInformation: {
      symptoms: [],
      diagnoses: ['Impaired Fasting Glucose'],
      findings: ['Mildly elevated glycated hemoglobin.'],
      recommendations: ['Maintain lifestyle modifications.', 'Follow-up laboratory testing in 6 months.'],
      followUp: ['Follow up with Dr. Jenkins in 6 months.'],
    },
    provenance: { fieldCounts: { tests: 2, medications: 1 } },
  };

  databaseService.saveExtraction(doc1Id, ext1);
  patientService.associateDocumentWithPatient(doc1Id, 'demo@example.com', ext1.patient);

  // 9. Single document produces exactly ONE timeline event
  const singleDocJourneyRes = await fetch(`${BASE_URL}/api/patients/${patient1Id}/care-journey`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  const singleDocJourneyData = await singleDocJourneyRes.json();
  assert(singleDocJourneyRes.status === 200, `Single document care journey returns 200`);
  assert(singleDocJourneyData.events.length === 1, `Patient with one document produces exactly 1 event (got ${singleDocJourneyData.events.length})`);
  assert(singleDocJourneyData.count === 1, `Count reports 1`);

  const event1 = singleDocJourneyData.events[0];
  assert(event1.id === `evt_${doc1Id}`, `Event ID retains document provenance (${event1.id})`);
  assert(event1.documentId === doc1Id, `Event documentId matches (${doc1Id})`);
  assert(event1.originalName === 'lab_report_march.pdf', `Event originalName preserved`);
  assert(event1.date === '15 March 2026', `Event uses document clinical date when available (15 March 2026)`);
  assert(event1.dateSource === 'DOCUMENT_DATE', `dateSource indicates DOCUMENT_DATE`);
  assert(event1.title === 'Laboratory Report', `Factual title derived: Laboratory Report`);
  assert(event1.doctor?.name === 'Dr. Sarah Jenkins', `Doctor name matches: Dr. Sarah Jenkins`);
  assert(event1.clinic === 'Metro Health Endocrinology', `Clinic matches: Metro Health Endocrinology`);
  assert(event1.tests.length === 2, `Contains 2 tests`);
  assert(event1.tests[0].name === 'HbA1c' && event1.tests[0].documentFlag === 'HIGH', `Test HbA1c retains explicit source flag 'HIGH'`);
  assert(event1.tests[1].name === 'Fasting Glucose' && event1.tests[1].documentFlag === null, `Test without source flag has null`);
  assert(event1.medications.length === 1, `Contains 1 medication`);
  assert(event1.medications[0].name === 'Metformin', `Medication name is Metformin`);
  assert(event1.recommendations.length === 2, `Contains 2 recommendations`);
  assert(event1.followUp.length === 1, `Contains 1 follow-up item`);

  // 10. Associate Document 2 with Earlier Date (Date: "10 January 2026")
  const doc2Id = `doc_${crypto.randomUUID()}`;
  databaseService.saveDocument({
    id: doc2Id,
    ownerEmail: 'demo@example.com',
    originalName: 'cardio_consult_jan.pdf',
    storedFilename: 'synthetic_doc2.pdf',
    mimeType: 'application/pdf',
    size: 2048,
    uploadedAt: '2026-01-11T12:00:00.000Z',
    processingStatus: 'READY',
  });

  const ext2 = {
    documentType: 'CARDIOLOGY_REPORT',
    documentDate: '10 January 2026', // EARLIER than March 15
    reportId: 'CARD-2026-0110-02',
    patient: { name: testPatientName, dateOfBirth: '1985-06-20', identifier: testMrn },
    doctor: { name: 'Dr. Kevin Cole', speciality: 'Cardiology', clinic: 'Heart & Vascular Pavilion' },
    tests: [
      { name: 'ECG', value: 'Normal sinus rhythm', numericValue: null, unit: null, referenceRange: null, documentFlag: null },
    ],
    medications: [],
    clinicalInformation: {
      symptoms: ['Occasional palpitations'],
      diagnoses: ['Benign Palpitations'],
      findings: ['ECG demonstrates normal sinus rhythm with no ectopic beats.'],
      recommendations: ['Avoid excess caffeine.'],
      followUp: ['Routine follow-up in 12 months.'],
    },
    provenance: { fieldCounts: { tests: 1, medications: 0 } },
  };

  databaseService.saveExtraction(doc2Id, ext2);
  patientService.associateDocumentWithPatient(doc2Id, 'demo@example.com', ext2.patient);

  // 11. Associate Document 3 with Later Date missing documentDate (Fallback to uploadedAt)
  const doc3Id = `doc_${crypto.randomUUID()}`;
  const uploadDate3 = '2026-08-20T14:30:00.000Z';
  databaseService.saveDocument({
    id: doc3Id,
    ownerEmail: 'demo@example.com',
    originalName: 'undated_prescription.pdf',
    storedFilename: 'synthetic_doc3.pdf',
    mimeType: 'application/pdf',
    size: 1024,
    uploadedAt: uploadDate3,
    processingStatus: 'READY',
  });

  const ext3 = {
    documentType: 'PRESCRIPTION',
    documentDate: null, // NO DOCUMENT DATE -> FALLBACK TO UPLOAD DATE
    reportId: 'RX-2026-0820-03',
    patient: { name: testPatientName, dateOfBirth: '1985-06-20', identifier: testMrn },
    doctor: { name: 'Dr. Sarah Jenkins', speciality: 'Endocrinology', clinic: 'Metro Health Endocrinology' },
    tests: [],
    medications: [
      { name: 'Vitamin D3', dose: '2000', unit: 'IU', frequency: 'Once daily' },
    ],
    clinicalInformation: {
      symptoms: [],
      diagnoses: [],
      findings: [],
      recommendations: ['Take with meals.'],
      followUp: [],
    },
    provenance: { fieldCounts: { tests: 0, medications: 1 } },
  };

  databaseService.saveExtraction(doc3Id, ext3);
  patientService.associateDocumentWithPatient(doc3Id, 'demo@example.com', ext3.patient);

  // 12. Multiple documents produce multiple events with chronological ordering
  const multiDocJourneyRes = await fetch(`${BASE_URL}/api/patients/${patient1Id}/care-journey`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  const multiDocJourneyData = await multiDocJourneyRes.json();
  assert(multiDocJourneyRes.status === 200, `Multi-document care journey returns 200`);
  assert(multiDocJourneyData.events.length === 3, `Patient with 3 documents produces exactly 3 events (got ${multiDocJourneyData.events.length})`);
  assert(multiDocJourneyData.count === 3, `Count is 3`);

  // Verify Chronological Ordering (earliest to latest):
  // 1st: Jan 10, 2026 (doc2)
  // 2nd: Mar 15, 2026 (doc1)
  // 3rd: Aug 20, 2026 (doc3 uploadDate fallback)
  const [eFirst, eSecond, eThird] = multiDocJourneyData.events;
  assert(eFirst.documentId === doc2Id, `1st chronological event is Jan 10, 2026 Cardiology Report (${eFirst.date})`);
  assert(eSecond.documentId === doc1Id, `2nd chronological event is Mar 15, 2026 Laboratory Report (${eSecond.date})`);
  assert(eThird.documentId === doc3Id, `3rd chronological event is Aug 20, 2026 Prescription (${eThird.date})`);
  assert(eThird.dateSource === 'UPLOAD_DATE', `3rd event correctly indicates UPLOAD_DATE fallback`);

  // 13. Security & Grounding Checks
  const fullJson = JSON.stringify(multiDocJourneyData);
  assert(!fullJson.includes('C:\\') && !fullJson.includes('/uploads/'), 'Care Journey response contains NO filesystem paths');
  assert(!fullJson.includes('Mock Laboratory Test Report\nSample document'), 'Care Journey response contains NO raw full document text');

  // Verify zero clinical inference was generated
  for (const ev of multiDocJourneyData.events) {
    assert(ev.healthScore === undefined, 'No healthScore field generated');
    assert(ev.recoveryScore === undefined, 'No recoveryScore field generated');
    assert(ev.riskLevel === undefined, 'No riskLevel field generated');
    assert(ev.trend === undefined, 'No trend field generated');
    for (const t of ev.tests) {
      assert(t.status === undefined, 'No clinical status (NORMAL/ABNORMAL) calculated on tests');
    }
  }

  // 14. Real PDF Upload through Pipeline End-to-End Test
  const samplePdfPath = 'C:\\Users\\shakshi neha\\CareWeave\\backend\\uploads\\doc_2c47bf7d-bbae-4df0-9362-9767eb905c4a.pdf';
  const pdfBytes = fs.readFileSync(samplePdfPath);
  const formE2E = new FormData();
  formE2E.append('file', new Blob([pdfBytes], { type: 'application/pdf' }), 'care_journey_e2e.pdf');

  const uploadRes = await fetch(`${BASE_URL}/api/documents/upload`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}` },
    body: formE2E,
  });
  const uploadData = await uploadRes.json();
  const e2eDocId = uploadData.document?.id;
  assert(uploadRes.status === 200 && e2eDocId, `E2E: Uploaded document (${e2eDocId})`);

  // Process
  await fetch(`${BASE_URL}/api/documents/${e2eDocId}/process`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}` },
  });

  // Extract
  const extractRes = await fetch(`${BASE_URL}/api/documents/${e2eDocId}/extract`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}` },
  });
  assert(extractRes.status === 200, `E2E: Extracted document`);

  // Get document to find associated patient
  const e2eDocRes = await fetch(`${BASE_URL}/api/documents/${e2eDocId}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  const e2eDocData = await e2eDocRes.json();
  const e2ePatientId = e2eDocData.document?.patientId;
  assert(e2ePatientId && e2ePatientId.startsWith('pat_'), `E2E: Associated with patient (${e2ePatientId})`);

  // Query Care Journey for this patient
  const e2eJourneyRes = await fetch(`${BASE_URL}/api/patients/${e2ePatientId}/care-journey`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  const e2eJourneyData = await e2eJourneyRes.json();
  assert(e2eJourneyRes.status === 200, `E2E: Care journey retrieved for extracted patient`);
  const matchingEvent = e2eJourneyData.events.find(e => e.documentId === e2eDocId);
  assert(matchingEvent !== undefined, `E2E: Newly extracted document is present as a timeline event in Care Journey`);
  assert(matchingEvent.title === 'Laboratory Report', `E2E: Event title is Laboratory Report`);
  assert(matchingEvent.tests.length === 7, `E2E: Event contains 7 tests from report`);
  assert(matchingEvent.medications.length === 1, `E2E: Event contains 1 medication from report`);

  console.log(`\n=== Step 12 Verification Complete: ${passed} passed, ${failed} failed ===`);
  if (failed > 0) {
    process.exit(1);
  }
}

runStep12Tests().catch(err => {
  console.error('Step 12 test execution failed:', err);
  process.exit(1);
});
