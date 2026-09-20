const BASE_URL = 'http://localhost:3000';
const docId = 'doc_098f2487-9705-4828-ae61-0f389c226bdc';

async function verifyRestart() {
  console.log('=== CareWeave Step 10: Backend Restart Persistence Verification ===\n');
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
  assert(token, 'Re-authenticated after server restart');

  // 2. Fetch documents list from restarted server
  const listRes = await fetch(`${BASE_URL}/api/documents`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  const listData = await listRes.json();
  assert(listRes.status === 200, `GET /api/documents returned 200 (got ${listRes.status})`);
  assert(Array.isArray(listData.documents), 'Documents list is an array');

  const persistedDoc = listData.documents.find(d => d.id === docId);
  assert(persistedDoc !== undefined, `Document ${docId} exists in document list AFTER restart!`);
  assert(persistedDoc?.processingStatus === 'READY', `processingStatus preserved as READY (${persistedDoc?.processingStatus})`);
  assert(persistedDoc?.extractionStatus === 'EXTRACTED', `extractionStatus preserved as EXTRACTED (${persistedDoc?.extractionStatus})`);
  assert(persistedDoc?.hasExtraction === true, 'hasExtraction flag is true');

  // 3. Fetch single document + extraction from restarted server
  const singleRes = await fetch(`${BASE_URL}/api/documents/${docId}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  const singleData = await singleRes.json();
  assert(singleRes.status === 200, `GET /api/documents/:id returned 200 (got ${singleRes.status})`);
  assert(singleData.document?.id === docId, 'Document ID matches');
  assert(singleData.extraction !== null, 'Structured extraction object SURVIVED server restart!');

  const ext = singleData.extraction;
  assert(ext.patient?.name === 'Aditi Sharma', `Patient name preserved: ${ext.patient?.name}`);
  assert(ext.patient?.dateOfBirth === '14 March 1998', `Patient DOB preserved: ${ext.patient?.dateOfBirth}`);
  assert(ext.doctor?.name === 'Dr. Meera Kapoor', `Doctor name preserved: ${ext.doctor?.name}`);
  assert(ext.doctor?.speciality === 'Internal Medicine', `Doctor speciality preserved: ${ext.doctor?.speciality}`);
  assert(ext.doctor?.clinic === 'Greenfield Medical Clinic', `Clinic preserved: ${ext.doctor?.clinic}`);

  // Test array preservation
  assert(Array.isArray(ext.tests) && ext.tests.length === 7, `All 7 tests preserved (got ${ext.tests?.length})`);
  const vitD = ext.tests.find(t => t.name.toLowerCase().includes('vitamin d'));
  assert(vitD?.numericValue === 24, `Vitamin D test value preserved: ${vitD?.numericValue}`);
  assert(vitD?.documentFlag === null, `Vitamin D documentFlag preserved as null: ${vitD?.documentFlag}`);

  // Medication preservation
  assert(Array.isArray(ext.medications) && ext.medications.length === 1, `Medication preserved (got ${ext.medications?.length})`);
  assert(ext.medications[0].name.includes('Cholecalciferol'), `Medication name preserved: ${ext.medications[0].name}`);
  assert(ext.medications[0].dose === '1000' && ext.medications[0].unit === 'IU', `Medication dose/unit preserved`);

  // Recommendations preservation
  assert(Array.isArray(ext.clinicalInformation?.recommendations) && ext.clinicalInformation.recommendations.length === 3, 'All 3 recommendations preserved');

  console.log(`\n=== Restart Persistence Verification: ${passed} passed, ${failed} failed ===`);
  if (failed > 0) process.exit(1);
}

verifyRestart().catch(err => {
  console.error('Restart verification failed:', err);
  process.exit(1);
});
