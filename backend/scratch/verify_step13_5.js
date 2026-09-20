/**
 * Step 13.5 Verification Suite — CareWeave Project 2.0
 * Home & Navigation Stabilization Verification
 */

import jwt from 'jsonwebtoken';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const BASE_URL = 'http://localhost:3000';
const JWT_SECRET = 'careweave-project-2-prototype-jwt-secret-key-987654321';

let passed = 0;
let failed = 0;

function assert(condition, message) {
  if (condition) {
    console.log(`✅ PASS: ${message}`);
    passed++;
  } else {
    console.error(`❌ FAIL: ${message}`);
    failed++;
  }
}

async function runTests() {
  console.log('=== CareWeave Step 13.5 Stabilization Verification ===\n');

  // 1. Authenticate primary user via login endpoint
  const loginRes = await fetch(`${BASE_URL}/api/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'demo@example.com', password: 'careweave123' }),
  });
  const loginData = await loginRes.json();
  const userAToken = loginData.token;
  assert(userAToken && typeof userAToken === 'string', 'Obtained JWT for primary user demo@example.com');

  // Secondary user token for cross-user security checks
  const userBToken = jwt.sign({ email: 'other@example.com' }, JWT_SECRET, { expiresIn: '1h' });

  // ─────────────────────────────────────────────
  // A. AUTHENTICATION & ROUTING TESTS
  // ─────────────────────────────────────────────
  console.log('\n--- Test Group A: Auth & Security Protection ---');

  // Unauthenticated request to /api/patients
  const unauthRes = await fetch(`${BASE_URL}/api/patients`);
  assert(unauthRes.status === 401, 'Unauthenticated /api/patients returns 401');

  // Invalid token
  const invalidTokenRes = await fetch(`${BASE_URL}/api/patients`, {
    headers: { Authorization: 'Bearer invalid-token-xyz' },
  });
  assert(invalidTokenRes.status === 403, 'Invalid token to /api/patients returns 403');

  // Valid User A request to /api/patients
  const patientsRes = await fetch(`${BASE_URL}/api/patients`, {
    headers: { Authorization: `Bearer ${userAToken}` },
  });
  assert(patientsRes.status === 200, 'Authenticated User A can list patients (200)');
  const patientsData = await patientsRes.json();
  assert(patientsData.success === true && Array.isArray(patientsData.patients), 'Patients response format is valid');
  assert(patientsData.patients.length > 0, `User A has ${patientsData.patients.length} accessible patient records`);

  const primaryPatient = patientsData.patients.find(p => p.name.toLowerCase().includes('aditi')) || patientsData.patients[0];
  const patientId = primaryPatient.id;
  console.log(`Using primary patient: ${primaryPatient.name} (${patientId})`);

  // ─────────────────────────────────────────────
  // B. HEALTH RECORDS & DOCUMENTS TESTS
  // ─────────────────────────────────────────────
  console.log('\n--- Test Group B: Health Records & Documents ---');

  const docsRes = await fetch(`${BASE_URL}/api/documents`, {
    headers: { Authorization: `Bearer ${userAToken}` },
  });
  assert(docsRes.status === 200, 'GET /api/documents returns 200 for authenticated user');
  const docsData = await docsRes.json();
  assert(docsData.success === true && Array.isArray(docsData.documents), 'Documents array returned');
  assert(docsData.documents.length > 0, `User has ${docsData.documents.length} persisted documents`);

  // Verify document summary metadata structure
  const firstDoc = docsData.documents[0];
  assert(firstDoc.id && firstDoc.originalName, 'Document has id and originalName');
  assert(firstDoc.counts && typeof firstDoc.counts.tests === 'number', 'Document summary has test count');
  assert(firstDoc.counts && typeof firstDoc.counts.medications === 'number', 'Document summary has medication count');

  // Check no raw text and no filesystem paths in GET /api/documents
  const docsJsonStr = JSON.stringify(docsData);
  assert(!docsJsonStr.includes('C:\\') && !docsJsonStr.includes('/uploads/'), 'No filesystem paths in documents response');
  assert(!docsJsonStr.includes('_extractedText'), 'No raw extracted text field in documents response');

  // GET single document details
  const singleDocRes = await fetch(`${BASE_URL}/api/documents/${firstDoc.id}`, {
    headers: { Authorization: `Bearer ${userAToken}` },
  });
  assert(singleDocRes.status === 200, `GET /api/documents/${firstDoc.id} returns 200`);
  const singleDocData = await singleDocRes.json();
  assert(singleDocData.document && singleDocData.document.id === firstDoc.id, 'Single document metadata matches');
  const singleDocStr = JSON.stringify(singleDocData);
  assert(!singleDocStr.includes('C:\\') && !singleDocStr.includes('/uploads/'), 'No filesystem paths in single document response');
  assert(!singleDocStr.includes('_extractedText'), 'No raw extracted text in single document response');

  // Cross-user document access rejected
  const crossDocRes = await fetch(`${BASE_URL}/api/documents/${firstDoc.id}`, {
    headers: { Authorization: `Bearer ${userBToken}` },
  });
  assert(crossDocRes.status === 403, 'Cross-user document access returns 403 Forbidden');

  // ─────────────────────────────────────────────
  // C. MEDICATIONS ENDPOINT TESTS
  // ─────────────────────────────────────────────
  console.log('\n--- Test Group C: Medications Endpoint ---');

  // Unauthenticated
  const unauthMedRes = await fetch(`${BASE_URL}/api/patients/${patientId}/medications`);
  assert(unauthMedRes.status === 401, 'Unauthenticated /api/patients/:id/medications returns 401');

  // Malformed patient ID
  const malformedMedRes = await fetch(`${BASE_URL}/api/patients/bad-id-format/medications`, {
    headers: { Authorization: `Bearer ${userAToken}` },
  });
  assert(malformedMedRes.status === 400, 'Malformed patient ID returns 400');

  // Nonexistent patient ID
  const fakeUuid = 'pat_00000000-0000-0000-0000-000000000000';
  const nonExistMedRes = await fetch(`${BASE_URL}/api/patients/${fakeUuid}/medications`, {
    headers: { Authorization: `Bearer ${userAToken}` },
  });
  assert(nonExistMedRes.status === 404, 'Nonexistent patient ID returns 404');

  // Cross-user access rejected
  const crossMedRes = await fetch(`${BASE_URL}/api/patients/${patientId}/medications`, {
    headers: { Authorization: `Bearer ${userBToken}` },
  });
  assert(crossMedRes.status === 403, 'Cross-user medications access returns 403');

  // Valid authenticated request
  const medsRes = await fetch(`${BASE_URL}/api/patients/${patientId}/medications`, {
    headers: { Authorization: `Bearer ${userAToken}` },
  });
  assert(medsRes.status === 200, 'GET /api/patients/:id/medications returns 200 for owner');
  const medsData = await medsRes.json();
  assert(medsData.success === true && Array.isArray(medsData.medications), 'Medications array returned');

  // Provenance & No Inferences check
  if (medsData.medications.length > 0) {
    const sampleMed = medsData.medications[0];
    assert(sampleMed.name, 'Medication has name');
    assert(sampleMed.provenance && sampleMed.provenance.documentId, 'Medication includes provenance with documentId');
    assert(sampleMed.provenance.originalName, 'Medication provenance has originalName');
    assert(sampleMed.status === undefined, 'No active/inactive/stopped status inferred on medication');
  } else {
    console.log('ℹ️ Primary patient has 0 medications in database (valid empty state)');
  }

  // ─────────────────────────────────────────────
  // D. CARE JOURNEY ENDPOINT TESTS
  // ─────────────────────────────────────────────
  console.log('\n--- Test Group D: Care Journey Endpoint ---');

  // Valid authenticated Care Journey
  const journeyRes = await fetch(`${BASE_URL}/api/patients/${patientId}/care-journey`, {
    headers: { Authorization: `Bearer ${userAToken}` },
  });
  assert(journeyRes.status === 200, 'GET /api/patients/:id/care-journey returns 200');
  const journeyData = await journeyRes.json();
  assert(journeyData.success === true && Array.isArray(journeyData.events), 'Care Journey returns events array');
  const initialEventCount = journeyData.events.length;
  console.log(`Initial Care Journey events count for ${primaryPatient.name}: ${initialEventCount}`);

  // Cross-user Care Journey rejected
  const crossJourneyRes = await fetch(`${BASE_URL}/api/patients/${patientId}/care-journey`, {
    headers: { Authorization: `Bearer ${userBToken}` },
  });
  assert(crossJourneyRes.status === 403, 'Cross-user care-journey access returns 403');

  // ─────────────────────────────────────────────
  // E. UPLOAD → PROCESS → EXTRACT → PATIENT ASSOCIATION → CARE JOURNEY REFRESH
  // ─────────────────────────────────────────────
  console.log('\n--- Test Group E: End-to-End Upload & Care Journey Refresh ---');

  // Create a clean mock PDF for Aditi Sharma
  // Using minimal valid PDF structure with patient name matching Aditi Sharma
  const testReportDate = '20 September 2026';
  const testReportId = `REP-${Date.now()}`;
  const pdfContent = `%PDF-1.4
1 0 obj << /Type /Catalog /Pages 2 0 R >> endobj
2 0 obj << /Type /Pages /Kids [3 0 R] /Count 1 >> endobj
3 0 obj << /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Contents 4 0 R /Resources << /Font << /F1 5 0 R >> >> >> endobj
4 0 obj << /Length 420 >> stream
BT
/F1 12 Tf
50 720 Td (Patient: Aditi Sharma) Tj
0 -20 Td (Date of Birth: 14 March 1998) Tj
0 -20 Td (Report Date: ${testReportDate}) Tj
0 -20 Td (Report ID: ${testReportId}) Tj
0 -20 Td (Ordering Physician: Dr. Sunita Rao) Tj
0 -20 Td (Clinic: Metro Health Clinic) Tj
0 -30 Td (CLINICAL REPORT: Follow-up Consultation) Tj
0 -20 Td (Hemoglobin: 13.8 g/dL Ref: 12.0-16.0 g/dL) Tj
0 -20 Td (Medications) Tj
0 -20 Td (Metformin 500 mg Twice daily) Tj
0 -20 Td (Recommendations) Tj
0 -20 Td (Continue current routine) Tj
ET
endstream
endobj
5 0 obj << /Type /Font /Subtype /Type1 /BaseFont /Helvetica >> endobj
xref
0 6
0000000000 65535 f 
0000000009 00000 n 
0000000058 00000 n 
0000000115 00000 n 
0000000244 00000 n 
0000000717 00000 n 
trailer << /Size 6 /Root 1 0 R >>
startxref
794
%%EOF`;

  const testPdfPath = path.resolve(__dirname, 'test_upload_stabilization.pdf');
  fs.writeFileSync(testPdfPath, pdfContent);

  try {
    // 1. Upload
    const formData = new FormData();
    const pdfBlob = new Blob([fs.readFileSync(testPdfPath)], { type: 'application/pdf' });
    formData.append('file', pdfBlob, 'followup_report.pdf');

    const uploadRes = await fetch(`${BASE_URL}/api/documents/upload`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${userAToken}` },
      body: formData,
    });
    assert(uploadRes.status === 200 || uploadRes.status === 201, `Document upload returns success (${uploadRes.status})`);
    const uploadData = await uploadRes.json();
    const newDocId = uploadData.document.id;
    assert(newDocId && newDocId.startsWith('doc_'), `Uploaded document ID: ${newDocId}`);

    // 2. Process
    const processRes = await fetch(`${BASE_URL}/api/documents/${newDocId}/process`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${userAToken}`, 'Content-Type': 'application/json' },
    });
    assert(processRes.status === 200, 'Document processing returns 200');
    const processData = await processRes.json();
    assert(processData.processing.status === 'READY', 'Processing status is READY');

    // 3. Extract
    const extractRes = await fetch(`${BASE_URL}/api/documents/${newDocId}/extract`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${userAToken}`, 'Content-Type': 'application/json' },
    });
    assert(extractRes.status === 200, 'Medical extraction returns 200');
    const extractData = await extractRes.json();
    assert(extractData.extraction.status === 'EXTRACTED', 'Extraction status is EXTRACTED');

    // 4. Verify patientId is exposed in response
    assert(extractData.document && extractData.document.patientId !== undefined, 'document.patientId is present in extraction response');
    const associatedPatientId = extractData.document.patientId;
    assert(associatedPatientId && associatedPatientId.startsWith('pat_'), `Associated patientId returned: ${associatedPatientId}`);

    // 5. Verify Care Journey endpoint includes the new event
    const updatedJourneyRes = await fetch(`${BASE_URL}/api/patients/${associatedPatientId}/care-journey`, {
      headers: { Authorization: `Bearer ${userAToken}` },
    });
    assert(updatedJourneyRes.status === 200, 'Care Journey endpoint returns 200 for associated patient');
    const updatedJourneyData = await updatedJourneyRes.json();
    const newEvents = updatedJourneyData.events;
    assert(newEvents.length >= 1, `Updated Care Journey has ${newEvents.length} events`);

    const foundNewEvent = newEvents.find(e => e.documentId === newDocId || e.provenance?.reportId === testReportId);
    assert(foundNewEvent !== undefined, 'Newly uploaded document appears as an event in Care Journey');
    if (foundNewEvent) {
      console.log(`Verified new timeline event: "${foundNewEvent.title}" on ${foundNewEvent.date}`);
      assert(foundNewEvent.doctor?.name === 'Dr. Sunita Rao' || foundNewEvent.doctor?.clinic === 'Metro Health Clinic', 'Event doctor info is source-grounded');
      assert(!JSON.stringify(foundNewEvent).includes('_extractedText'), 'Event has no raw text leakage');
    }

    // 6. Verify Medications endpoint includes the newly extracted medication
    const updatedMedsRes = await fetch(`${BASE_URL}/api/patients/${associatedPatientId}/medications`, {
      headers: { Authorization: `Bearer ${userAToken}` },
    });
    assert(updatedMedsRes.status === 200, 'Medications endpoint returns 200 after extraction');
    const updatedMedsData = await updatedMedsRes.json();
    const foundNewMed = updatedMedsData.medications.find(m => m.provenance?.documentId === newDocId);
    assert(foundNewMed !== undefined, 'Newly extracted medication appears in patient medications');
    if (foundNewMed) {
      console.log(`Verified new medication: "${foundNewMed.name}" (${foundNewMed.dose} ${foundNewMed.unit})`);
      assert(foundNewMed.provenance.reportId === testReportId, 'Medication provenance reportId matches source');
    }
  } finally {
    if (fs.existsSync(testPdfPath)) {
      fs.unlinkSync(testPdfPath);
    }
  }

  // ─────────────────────────────────────────────
  // F. FRONTEND FILES & ROUTES INTEGRITY CHECK
  // ─────────────────────────────────────────────
  console.log('\n--- Test Group F: Frontend Structure Integrity ---');

  const frontendSrc = path.resolve(__dirname, '../../frontend/src');
  assert(fs.existsSync(path.join(frontendSrc, 'App.jsx')), 'frontend/src/App.jsx exists');
  assert(fs.existsSync(path.join(frontendSrc, 'pages/Home/HomePage.jsx')), 'HomePage.jsx exists');
  assert(fs.existsSync(path.join(frontendSrc, 'pages/CareJourney/CareJourneyPage.jsx')), 'CareJourneyPage.jsx exists');
  assert(fs.existsSync(path.join(frontendSrc, 'pages/HealthRecords/HealthRecordsPage.jsx')), 'HealthRecordsPage.jsx exists');
  assert(fs.existsSync(path.join(frontendSrc, 'pages/Medications/MedicationsPage.jsx')), 'MedicationsPage.jsx exists');
  assert(fs.existsSync(path.join(frontendSrc, 'pages/Appointments/AppointmentsPage.jsx')), 'AppointmentsPage.jsx exists');
  assert(fs.existsSync(path.join(frontendSrc, 'pages/CareTeam/CareTeamPage.jsx')), 'CareTeamPage.jsx exists');
  assert(fs.existsSync(path.join(frontendSrc, 'pages/Messages/MessagesPage.jsx')), 'MessagesPage.jsx exists');
  assert(fs.existsSync(path.join(frontendSrc, 'components/DocumentDetailModal/DocumentDetailModal.jsx')), 'DocumentDetailModal.jsx exists');
  assert(fs.existsSync(path.join(frontendSrc, 'components/MedicationPanel/MedicationDetailModal.jsx')), 'MedicationDetailModal.jsx exists');

  const appCode = fs.readFileSync(path.join(frontendSrc, 'App.jsx'), 'utf8');
  assert(appCode.includes('/care-journey'), 'App.jsx handles /care-journey');
  assert(appCode.includes('/health-records'), 'App.jsx handles /health-records');
  assert(appCode.includes('/medications'), 'App.jsx handles /medications');
  assert(appCode.includes('/appointments'), 'App.jsx handles /appointments');
  assert(appCode.includes('/care-team'), 'App.jsx handles /care-team');
  assert(appCode.includes('/messages'), 'App.jsx handles /messages');

  const sidebarCode = fs.readFileSync(path.join(frontendSrc, 'components/Sidebar/Sidebar.jsx'), 'utf8');
  assert(sidebarCode.includes('onNavigate'), 'Sidebar.jsx uses onNavigate handler');
  assert(sidebarCode.includes('currentPath'), 'Sidebar.jsx derives active styling from currentPath');

  console.log(`\n========================================`);
  console.log(`Step 13.5 Results: ${passed} passed, ${failed} failed`);
  console.log(`========================================\n`);

  if (failed > 0) {
    process.exit(1);
  }
}

runTests().catch(err => {
  console.error('Test execution error:', err);
  process.exit(1);
});
