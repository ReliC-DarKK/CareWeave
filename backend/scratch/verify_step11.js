import fs from 'fs';
import path from 'path';
import { createRequire } from 'module';

const require = createRequire(path.resolve('package.json'));
const jwt = require('jsonwebtoken');
const Database = require('better-sqlite3');

const BASE_URL = 'http://localhost:3000';
const JWT_SECRET = 'careweave-project-2-prototype-jwt-secret-key-987654321';

async function runStep11Tests() {
  console.log('=== CareWeave Step 11 Multi-Document Patient Record Verification ===\n');
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

  // ──────────────────────────────────────────────
  // 1. Schema & Database Structure Verification
  // ──────────────────────────────────────────────
  const db = new Database('data/careweave.db');

  const patientCols = db.prepare('PRAGMA table_info(patients)').all();
  assert(patientCols.some(c => c.name === 'id'), 'patients table has "id" column');
  assert(patientCols.some(c => c.name === 'owner_email'), 'patients table has "owner_email" column');
  assert(patientCols.some(c => c.name === 'name'), 'patients table has "name" column');
  assert(patientCols.some(c => c.name === 'date_of_birth'), 'patients table has "date_of_birth" column');
  assert(patientCols.some(c => c.name === 'identifier'), 'patients table has "identifier" column');
  assert(patientCols.some(c => c.name === 'created_at'), 'patients table has "created_at" column');
  assert(patientCols.some(c => c.name === 'updated_at'), 'patients table has "updated_at" column');

  const docCols = db.prepare('PRAGMA table_info(documents)').all();
  assert(docCols.some(c => c.name === 'patient_id'), 'documents table has "patient_id" column');

  const patientIndices = db.prepare('PRAGMA index_list(patients)').all();
  assert(patientIndices.some(i => i.name === 'idx_patients_owner'), 'idx_patients_owner index exists');
  assert(patientIndices.some(i => i.name === 'idx_patients_lookup'), 'idx_patients_lookup index exists');
  assert(patientIndices.some(i => i.name === 'idx_patients_identifier'), 'idx_patients_identifier index exists');

  const docIndices = db.prepare('PRAGMA index_list(documents)').all();
  assert(docIndices.some(i => i.name === 'idx_documents_patient'), 'idx_documents_patient index exists');

  // ──────────────────────────────────────────────
  // 2. Authentication & Authorization Endpoints
  // ──────────────────────────────────────────────
  const loginRes = await fetch(`${BASE_URL}/api/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'demo@example.com', password: 'careweave123' }),
  });
  const loginData = await loginRes.json();
  const token = loginData.token;
  assert(token, 'Obtained authentication token for primary user');

  // 2a. Unauthenticated GET /api/patients -> 401
  const unauthListRes = await fetch(`${BASE_URL}/api/patients`);
  assert(unauthListRes.status === 401, `Unauthenticated GET /api/patients returned 401 (got ${unauthListRes.status})`);

  // 2b. Invalid token GET /api/patients -> 403
  const invalidListRes = await fetch(`${BASE_URL}/api/patients`, {
    headers: { Authorization: 'Bearer invalid-token-xyz' },
  });
  assert(invalidListRes.status === 403, `Invalid token GET /api/patients returned 403 (got ${invalidListRes.status})`);

  // 2c. Unauthenticated GET /api/patients/:id -> 401
  const unauthItemRes = await fetch(`${BASE_URL}/api/patients/pat_11111111-1111-1111-1111-111111111111`);
  assert(unauthItemRes.status === 401, `Unauthenticated GET /api/patients/:id returned 401 (got ${unauthItemRes.status})`);

  // 2d. Invalid token GET /api/patients/:id -> 403
  const invalidItemRes = await fetch(`${BASE_URL}/api/patients/pat_11111111-1111-1111-1111-111111111111`, {
    headers: { Authorization: 'Bearer invalid-token-xyz' },
  });
  assert(invalidItemRes.status === 403, `Invalid token GET /api/patients/:id returned 403 (got ${invalidItemRes.status})`);

  // 2e. Malformed patient ID -> 400
  const malformedIdRes = await fetch(`${BASE_URL}/api/patients/invalid_id_not_uuid`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  assert(malformedIdRes.status === 400, `Malformed patient ID returned 400 (got ${malformedIdRes.status})`);

  // 2f. Path traversal patient ID -> 400
  const traversalIdRes = await fetch(`${BASE_URL}/api/patients/..%2F..%2Fetc`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  assert(traversalIdRes.status === 400, `Path traversal patient ID returned 400 (got ${traversalIdRes.status})`);

  // 2g. Non-existent patient ID -> 404
  const nonExistentRes = await fetch(`${BASE_URL}/api/patients/pat_00000000-0000-0000-0000-000000000000`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  assert(nonExistentRes.status === 404, `Non-existent patient ID returned 404 (got ${nonExistentRes.status})`);

  // ──────────────────────────────────────────────
  // 3. Document A Upload, Extraction, & Patient Creation
  // ──────────────────────────────────────────────
  const samplePdfPath = 'C:\\Users\\shakshi neha\\CareWeave\\backend\\uploads\\doc_2c47bf7d-bbae-4df0-9362-9767eb905c4a.pdf';
  const pdfBytes = fs.readFileSync(samplePdfPath);

  // Upload Document A
  const formA = new FormData();
  formA.append('file', new Blob([pdfBytes], { type: 'application/pdf' }), 'patient_doc_a.pdf');
  const uploadARes = await fetch(`${BASE_URL}/api/documents/upload`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}` },
    body: formA,
  });
  const uploadAData = await uploadARes.json();
  const docAId = uploadAData.document?.id;
  assert(uploadARes.status === 200 && docAId, `Document A uploaded successfully (${docAId})`);

  // Process Document A
  const processARes = await fetch(`${BASE_URL}/api/documents/${docAId}/process`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}` },
  });
  assert(processARes.status === 200, `Document A processed to READY`);

  // Extract Document A
  const extractARes = await fetch(`${BASE_URL}/api/documents/${docAId}/extract`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}` },
  });
  const extractAData = await extractARes.json();
  assert(extractARes.status === 200, `Document A extracted successfully`);

  // Verify Document A now has patientId
  const getDocARes = await fetch(`${BASE_URL}/api/documents/${docAId}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  const getDocAData = await getDocARes.json();
  const patient1Id = getDocAData.document?.patientId;
  assert(patient1Id && patient1Id.startsWith('pat_'), `Document A associated with Patient 1 ID: ${patient1Id}`);

  // Verify GET /api/patients lists Patient 1
  const listPatientsRes = await fetch(`${BASE_URL}/api/patients`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  const listPatientsData = await listPatientsRes.json();
  assert(listPatientsRes.status === 200, `GET /api/patients returned 200`);
  assert(Array.isArray(listPatientsData.patients), `GET /api/patients returned an array of patients`);
  const foundPatient1 = listPatientsData.patients.find(p => p.id === patient1Id);
  assert(foundPatient1 !== undefined, `Patient 1 found in patients list`);
  assert(foundPatient1.documentCount >= 1, `Patient 1 has documentCount >= 1 (${foundPatient1.documentCount})`);

  // Verify single patient aggregated record GET /api/patients/:patientId
  const getPatient1Res = await fetch(`${BASE_URL}/api/patients/${patient1Id}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  const patient1Data = await getPatient1Res.json();
  assert(getPatient1Res.status === 200, `GET /api/patients/:patientId returned 200`);
  assert(patient1Data.success === true, `Patient 1 record success is true`);
  assert(patient1Data.patient?.id === patient1Id, `Patient ID matches requested ID`);
  assert(patient1Data.patient?.name === 'Aditi Sharma', `Patient name matches extracted name (Aditi Sharma)`);
  assert(patient1Data.patient?.dateOfBirth === '14 March 1998', `Patient DOB matches extracted DOB`);
  assert(Array.isArray(patient1Data.documents), `Aggregated record contains documents array`);
  assert(patient1Data.documents.some(d => d.id === docAId), `Aggregated documents includes Document A`);
  assert(Array.isArray(patient1Data.doctors), `Aggregated record contains doctors array`);
  assert(Array.isArray(patient1Data.tests), `Aggregated record contains tests array`);
  assert(Array.isArray(patient1Data.medications), `Aggregated record contains medications array`);
  assert(patient1Data.provenance?.documentCount >= 1, `Provenance reports document count >= 1`);

  // ──────────────────────────────────────────────
  // 4. Document B Upload (Same Patient) -> Association & Aggregation
  // ──────────────────────────────────────────────
  const formB = new FormData();
  formB.append('file', new Blob([pdfBytes], { type: 'application/pdf' }), 'patient_doc_b.pdf');
  const uploadBRes = await fetch(`${BASE_URL}/api/documents/upload`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}` },
    body: formB,
  });
  const uploadBData = await uploadBRes.json();
  const docBId = uploadBData.document?.id;
  assert(uploadBRes.status === 200 && docBId, `Document B uploaded successfully (${docBId})`);

  // Process Document B
  await fetch(`${BASE_URL}/api/documents/${docBId}/process`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}` },
  });

  // Extract Document B
  const extractBRes = await fetch(`${BASE_URL}/api/documents/${docBId}/extract`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}` },
  });
  assert(extractBRes.status === 200, `Document B extracted successfully`);

  // Verify Document B linked to the EXACT SAME patientId
  const getDocBRes = await fetch(`${BASE_URL}/api/documents/${docBId}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  const getDocBData = await getDocBRes.json();
  assert(getDocBData.document?.patientId === patient1Id, `Document B linked to same patientId (${patient1Id})`);

  // Fetch updated aggregated patient record
  const getAggregatedRes = await fetch(`${BASE_URL}/api/patients/${patient1Id}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  const aggData = await getAggregatedRes.json();
  assert(getAggregatedRes.status === 200, `Aggregated record retrieved successfully`);
  assert(aggData.documents.length >= 2, `Aggregated documents list contains multiple documents (got ${aggData.documents.length})`);
  assert(aggData.documents.some(d => d.id === docAId), `Aggregated record contains Document A`);
  assert(aggData.documents.some(d => d.id === docBId), `Aggregated record contains Document B`);

  // Check Doctor deduplication: Dr. Meera Kapoor appears once with multiple documentIds
  const meeraKapoor = aggData.doctors.find(d => d.name === 'Dr. Meera Kapoor');
  assert(meeraKapoor !== undefined, `Dr. Meera Kapoor present in aggregated doctors`);
  assert(Array.isArray(meeraKapoor.documentIds) && meeraKapoor.documentIds.length >= 2,
    `Doctor deduplicated across documents and contains both document IDs (${meeraKapoor.documentIds.join(', ')})`);

  // Check Tests aggregation across both documents
  const testsForDocA = aggData.tests.filter(t => t.documentId === docAId);
  const testsForDocB = aggData.tests.filter(t => t.documentId === docBId);
  assert(testsForDocA.length === 7, `Aggregated tests include 7 tests from Document A`);
  assert(testsForDocB.length === 7, `Aggregated tests include 7 tests from Document B`);
  assert(aggData.tests.length >= 14, `Total aggregated tests is at least 14 (got ${aggData.tests.length})`);

  // Check Medications aggregation across both documents
  const medsForDocA = aggData.medications.filter(m => m.documentId === docAId);
  const medsForDocB = aggData.medications.filter(m => m.documentId === docBId);
  assert(medsForDocA.length === 1, `Medications include 1 from Document A`);
  assert(medsForDocB.length === 1, `Medications include 1 from Document B`);

  // ──────────────────────────────────────────────
  // 5. Document C (Different Patient) -> Separate Patient Record
  // ──────────────────────────────────────────────
  const { patientService } = await import('file:///C:/Users/shakshi%20neha/CareWeave/backend/src/services/patientService.js');
  const { databaseService } = await import('file:///C:/Users/shakshi%20neha/CareWeave/backend/src/services/databaseService.js');

  // Register synthetic document C for different patient: Michael Chang
  const docCId = `doc_${crypto.randomUUID()}`;
  databaseService.saveDocument({
    id: docCId,
    ownerEmail: 'demo@example.com',
    originalName: 'cardio_report_chang.pdf',
    storedFilename: 'synthetic_chang.pdf',
    mimeType: 'application/pdf',
    size: 2048,
    uploadedAt: new Date().toISOString(),
    processingStatus: 'READY',
  });

  // Extract structured data for Michael Chang
  const changExtraction = {
    documentType: 'CARDIOLOGY_REPORT',
    documentDate: '10 October 2026',
    reportId: 'CARD-2026-1010-09',
    patient: {
      name: 'Michael Chang',
      dateOfBirth: '05/12/1975',
      identifier: null,
    },
    doctor: {
      name: 'Dr. Robert Vance',
      speciality: 'Cardiology',
      clinic: 'Pacific Heart Institute',
    },
    tests: [
      { name: 'Total Cholesterol', value: '235', numericValue: 235, unit: 'mg/dL', referenceRange: '< 200', documentFlag: 'HIGH' },
    ],
    medications: [
      { name: 'Atorvastatin', dose: '20', unit: 'mg', frequency: 'Once daily' },
    ],
    clinicalInformation: {
      symptoms: [],
      diagnoses: ['Hyperlipidemia'],
      findings: ['Elevated total cholesterol.'],
      recommendations: ['Follow low-cholesterol diet.'],
      followUp: ['Follow up in 3 months.'],
    },
    provenance: {
      fieldCounts: { tests: 1, medications: 1 },
    },
  };

  databaseService.saveExtraction(docCId, changExtraction);
  const patientChang = patientService.associateDocumentWithPatient(docCId, 'demo@example.com', changExtraction.patient);

  assert(patientChang !== null, `Patient record created for Michael Chang`);
  assert(patientChang.id !== patient1Id, `Michael Chang has distinct patientId (${patientChang.id} != ${patient1Id})`);
  assert(patientChang.name === 'Michael Chang', `Patient record name is Michael Chang`);

  // Verify list patients now contains both patients
  const listAfterCRes = await fetch(`${BASE_URL}/api/patients`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  const listAfterCData = await listAfterCRes.json();
  const foundChang = listAfterCData.patients.find(p => p.id === patientChang.id);
  const foundSharma = listAfterCData.patients.find(p => p.id === patient1Id);
  assert(foundChang !== undefined, `Michael Chang listed in GET /api/patients`);
  assert(foundSharma !== undefined, `Aditi Sharma listed in GET /api/patients`);
  assert(foundChang.id !== foundSharma.id, `Patients have separate unique IDs`);

  // Verify Michael Chang aggregated record is separate and has only Michael Chang data
  const getChangRes = await fetch(`${BASE_URL}/api/patients/${patientChang.id}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  const changData = await getChangRes.json();
  assert(changData.patient.name === 'Michael Chang', `Michael Chang record name verified`);
  const testsForDocC = changData.tests.filter(t => t.documentId === docCId);
  assert(testsForDocC.length === 1, `Michael Chang has 1 test from document C (got ${testsForDocC.length})`);
  assert(testsForDocC[0].name === 'Total Cholesterol', `Michael Chang test is Total Cholesterol`);
  assert(testsForDocC[0].documentFlag === 'HIGH', `Document flag HIGH preserved without clinical inference`);

  // ──────────────────────────────────────────────
  // 6. REQUIRED CORRECTION: INSUFFICIENT PATIENT IDENTITY
  // ──────────────────────────────────────────────
  console.log('\n--- Testing REQUIRED CORRECTION: Insufficient Patient Identity ---');

  // Case 6A: Document with NO identifier and NO name and NO DOB
  const docD1Id = `doc_${crypto.randomUUID()}`;
  databaseService.saveDocument({
    id: docD1Id,
    ownerEmail: 'demo@example.com',
    originalName: 'unidentified_scan.pdf',
    storedFilename: 'synthetic_scan.pdf',
    mimeType: 'application/pdf',
    size: 1024,
    uploadedAt: new Date().toISOString(),
    processingStatus: 'READY',
  });

  const emptyIdentityExtraction = {
    documentType: 'LABORATORY_REPORT',
    documentDate: '01 September 2026',
    reportId: 'UNID-001',
    patient: {
      name: null,
      dateOfBirth: null,
      identifier: null,
    },
    doctor: {
      name: 'Dr. Anonymous',
      speciality: null,
      clinic: null,
    },
    tests: [{ name: 'Glucose', value: '95', numericValue: 95, unit: 'mg/dL', referenceRange: '70-99', documentFlag: null }],
    medications: [],
    clinicalInformation: { symptoms: [], diagnoses: [], findings: [], recommendations: [], followUp: [] },
    provenance: { fieldCounts: { tests: 1, medications: 0 } },
  };

  databaseService.saveExtraction(docD1Id, emptyIdentityExtraction);
  const assocD1 = patientService.associateDocumentWithPatient(docD1Id, 'demo@example.com', emptyIdentityExtraction.patient);

  assert(assocD1 === null, `CORRECTION: Tier 3 returns null when no identifier and no name/DOB`);
  const docD1Record = databaseService.getDocumentById(docD1Id);
  assert(docD1Record.patientId === null, `CORRECTION: documents.patient_id is NULL for unidentified document`);

  // Document and extraction are still fully accessible via GET /api/documents/:id
  const getDocD1Res = await fetch(`${BASE_URL}/api/documents/${docD1Id}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  const getDocD1Data = await getDocD1Res.json();
  assert(getDocD1Res.status === 200, `CORRECTION: Unassociated document remains accessible via document API (200)`);
  assert(getDocD1Data.document.patientId === null, `Document API reports patientId: null`);
  assert(getDocD1Data.extraction !== null, `Extraction remains fully persisted for unassociated document`);
  assert(getDocD1Data.extraction.tests[0].name === 'Glucose', `Extraction test data intact`);

  // Case 6B: Document with Name ONLY, but NO DOB and NO identifier
  const docD2Id = `doc_${crypto.randomUUID()}`;
  databaseService.saveDocument({
    id: docD2Id,
    ownerEmail: 'demo@example.com',
    originalName: 'partial_identity_name_only.pdf',
    storedFilename: 'synthetic_name_only.pdf',
    mimeType: 'application/pdf',
    size: 1024,
    uploadedAt: new Date().toISOString(),
    processingStatus: 'READY',
  });

  const nameOnlyExtraction = {
    documentType: 'LABORATORY_REPORT',
    documentDate: '02 September 2026',
    reportId: 'NAMEONLY-002',
    patient: {
      name: 'John Unknown',
      dateOfBirth: null, // MISSING DOB
      identifier: null,  // MISSING IDENTIFIER
    },
    doctor: null,
    tests: [],
    medications: [],
    clinicalInformation: { symptoms: [], diagnoses: [], findings: [], recommendations: [], followUp: [] },
    provenance: { fieldCounts: { tests: 0, medications: 0 } },
  };

  databaseService.saveExtraction(docD2Id, nameOnlyExtraction);
  const assocD2 = patientService.associateDocumentWithPatient(docD2Id, 'demo@example.com', nameOnlyExtraction.patient);
  assert(assocD2 === null, `CORRECTION: Returns null when document has Name but NO DOB and NO identifier`);
  const docD2Record = databaseService.getDocumentById(docD2Id);
  assert(docD2Record.patientId === null, `CORRECTION: documents.patient_id is NULL when missing DOB`);

  // Case 6C: Document with DOB ONLY, but NO Name and NO identifier
  const docD3Id = `doc_${crypto.randomUUID()}`;
  databaseService.saveDocument({
    id: docD3Id,
    ownerEmail: 'demo@example.com',
    originalName: 'partial_identity_dob_only.pdf',
    storedFilename: 'synthetic_dob_only.pdf',
    mimeType: 'application/pdf',
    size: 1024,
    uploadedAt: new Date().toISOString(),
    processingStatus: 'READY',
  });

  const dobOnlyExtraction = {
    documentType: 'LABORATORY_REPORT',
    documentDate: '03 September 2026',
    reportId: 'DOBONLY-003',
    patient: {
      name: null,              // MISSING NAME
      dateOfBirth: '1980-01-01',
      identifier: null,        // MISSING IDENTIFIER
    },
    doctor: null,
    tests: [],
    medications: [],
    clinicalInformation: { symptoms: [], diagnoses: [], findings: [], recommendations: [], followUp: [] },
    provenance: { fieldCounts: { tests: 0, medications: 0 } },
  };

  databaseService.saveExtraction(docD3Id, dobOnlyExtraction);
  const assocD3 = patientService.associateDocumentWithPatient(docD3Id, 'demo@example.com', dobOnlyExtraction.patient);
  assert(assocD3 === null, `CORRECTION: Returns null when document has DOB but NO Name and NO identifier`);
  const docD3Record = databaseService.getDocumentById(docD3Id);
  assert(docD3Record.patientId === null, `CORRECTION: documents.patient_id is NULL when missing Name`);

  // ──────────────────────────────────────────────
  // 7. Tier 1: Explicit Patient Identifier Matching
  // ──────────────────────────────────────────────
  console.log('\n--- Testing Tier 1: Explicit Patient Identifier Matching ---');

  const docE1Id = `doc_${crypto.randomUUID()}`;
  databaseService.saveDocument({
    id: docE1Id,
    ownerEmail: 'demo@example.com',
    originalName: 'mrn_report_doc1.pdf',
    storedFilename: 'synthetic_mrn_1.pdf',
    mimeType: 'application/pdf',
    size: 1024,
    uploadedAt: new Date().toISOString(),
    processingStatus: 'READY',
  });

  const mrnExtraction1 = {
    documentType: 'LABORATORY_REPORT',
    documentDate: '04 September 2026',
    reportId: 'MRN-REP-01',
    patient: {
      name: 'Sarah Connor',
      dateOfBirth: null, // Even without DOB, explicit identifier is sufficient
      identifier: 'MRN-998877',
    },
    doctor: { name: 'Dr. Silberman', speciality: 'Psychiatry', clinic: 'County Hospital' },
    tests: [{ name: 'Cortisol', value: '18', numericValue: 18, unit: 'ug/dL', referenceRange: '5-25', documentFlag: null }],
    medications: [],
    clinicalInformation: { symptoms: [], diagnoses: [], findings: [], recommendations: [], followUp: [] },
    provenance: { fieldCounts: { tests: 1, medications: 0 } },
  };

  databaseService.saveExtraction(docE1Id, mrnExtraction1);
  const patientSarah = patientService.associateDocumentWithPatient(docE1Id, 'demo@example.com', mrnExtraction1.patient);
  assert(patientSarah !== null, `Tier 1: Patient created with explicit identifier (MRN-998877)`);
  assert(patientSarah.identifier === 'MRN-998877', `Patient record stores explicit identifier`);

  // Associate second document with same identifier but DIFFERENT name formatting
  const docE2Id = `doc_${crypto.randomUUID()}`;
  databaseService.saveDocument({
    id: docE2Id,
    ownerEmail: 'demo@example.com',
    originalName: 'mrn_report_doc2.pdf',
    storedFilename: 'synthetic_mrn_2.pdf',
    mimeType: 'application/pdf',
    size: 1024,
    uploadedAt: new Date().toISOString(),
    processingStatus: 'READY',
  });

  const mrnExtraction2 = {
    documentType: 'LABORATORY_REPORT',
    documentDate: '05 September 2026',
    reportId: 'MRN-REP-02',
    patient: {
      name: 'CONNOR, SARAH J.',
      dateOfBirth: '1965-02-28',
      identifier: 'MRN-998877', // Same explicit identifier
    },
    doctor: { name: 'Dr. Silberman', speciality: 'Psychiatry', clinic: 'County Hospital' },
    tests: [{ name: 'Thyroxine', value: '8.2', numericValue: 8.2, unit: 'ug/dL', referenceRange: '4.5-12.0', documentFlag: null }],
    medications: [],
    clinicalInformation: { symptoms: [], diagnoses: [], findings: [], recommendations: [], followUp: [] },
    provenance: { fieldCounts: { tests: 1, medications: 0 } },
  };

  databaseService.saveExtraction(docE2Id, mrnExtraction2);
  const assocE2 = patientService.associateDocumentWithPatient(docE2Id, 'demo@example.com', mrnExtraction2.patient);
  assert(assocE2.id === patientSarah.id, `Tier 1: Second document with same MRN matched to existing patient (${patientSarah.id})`);

  // Verify aggregated record has both documents
  const sarahAgg = patientService.getAggregatedPatientRecord(patientSarah.id, 'demo@example.com');
  const sarahDocsForRun = sarahAgg.documents.filter(d => d.id === docE1Id || d.id === docE2Id);
  assert(sarahDocsForRun.length === 2, `Sarah Connor aggregated record has both documents from this run`);
  const sarahTestsForRun = sarahAgg.tests.filter(t => t.documentId === docE1Id || t.documentId === docE2Id);
  assert(sarahTestsForRun.length === 2, `Sarah Connor aggregated record has both tests from this run`);

  // ──────────────────────────────────────────────
  // 8. Security & Multi-Tenancy Isolation
  // ──────────────────────────────────────────────
  console.log('\n--- Testing Security & Multi-Tenancy Isolation ---');

  const otherUserToken = jwt.sign({ email: 'intruder@example.com' }, JWT_SECRET, { expiresIn: '1h' });

  // Cross-user patient retrieval -> 403
  const crossUserPatientRes = await fetch(`${BASE_URL}/api/patients/${patient1Id}`, {
    headers: { Authorization: `Bearer ${otherUserToken}` },
  });
  assert(crossUserPatientRes.status === 403, `Cross-user patient retrieval blocked with 403 (got ${crossUserPatientRes.status})`);

  // Other user patient list is empty
  const otherUserPatientsRes = await fetch(`${BASE_URL}/api/patients`, {
    headers: { Authorization: `Bearer ${otherUserToken}` },
  });
  const otherUserPatientsData = await otherUserPatientsRes.json();
  assert(otherUserPatientsRes.status === 200, `Other user can list own patients`);
  assert(otherUserPatientsData.patients.length === 0, `Other user sees 0 patients (no cross-tenant leakage)`);

  // Check no filesystem paths or raw text leaked in patient endpoints
  const patient1Json = JSON.stringify(patient1Data);
  assert(!patient1Json.includes('C:\\') && !patient1Json.includes('/uploads/'), `Patient response contains NO filesystem paths`);
  assert(!patient1Json.includes('Mock Laboratory Test Report\nSample document'), `Patient response contains NO raw full document text`);

  console.log(`\n=== Step 11 Verification Complete: ${passed} passed, ${failed} failed ===`);
  if (failed > 0) {
    process.exit(1);
  }
}

runStep11Tests().catch(err => {
  console.error('Test execution failed with unhandled error:', err);
  process.exit(1);
});
