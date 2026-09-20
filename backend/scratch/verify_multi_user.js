import fs from 'fs';
import path from 'path';

const BASE_URL = 'http://localhost:3000';

async function testMultiUser() {
  console.log('=== CareWeave Multi-User & Document Scoping Verification ===\n');

  // Find a valid sample PDF file from uploads
  const samplePdfPath = 'C:\\Users\\shakshi neha\\CareWeave\\backend\\uploads\\doc_2c47bf7d-bbae-4df0-9362-9767eb905c4a.pdf';
  if (!fs.existsSync(samplePdfPath)) {
    console.error('Sample PDF not found at', samplePdfPath);
    return;
  }
  const pdfBytes = fs.readFileSync(samplePdfPath);

  // Helper to log in
  async function login(email) {
    const res = await fetch(`${BASE_URL}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password: 'careweave123' }),
    });
    return await res.json();
  }

  // Helper to upload document
  async function upload(token, filename) {
    const pdfBlob = new Blob([pdfBytes], { type: 'application/pdf' });
    const formData = new FormData();
    formData.append('file', pdfBlob, filename);

    const res = await fetch(`${BASE_URL}/api/documents/upload`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` },
      body: formData,
    });
    const data = await res.json();

    // Process & Extract
    if (data.document?.id) {
      await fetch(`${BASE_URL}/api/documents/${data.document.id}/process`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
      });
      await fetch(`${BASE_URL}/api/documents/${data.document.id}/extract`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
      });
    }
    return data;
  }

  // 1. Log in as Rohan Mehta
  console.log('1. Logging in as Rohan Mehta...');
  const rohanAuth = await login('rohan@careweave.com');
  console.log('   Rohan Auth User:', rohanAuth.user);

  // Check Rohan initial docs
  const rohanInitialDocs = await (await fetch(`${BASE_URL}/api/documents`, {
    headers: { Authorization: `Bearer ${rohanAuth.token}` },
  })).json();
  console.log('   Rohan Initial Documents:', rohanInitialDocs.documents?.length || 0);

  // Upload 2 documents for Rohan
  console.log('2. Uploading 2 documents for Rohan...');
  await upload(rohanAuth.token, 'rohan_cardio_consultation.pdf');
  await upload(rohanAuth.token, 'rohan_lipid_panel.pdf');

  // Check Rohan documents now
  const rohanUpdatedDocs = await (await fetch(`${BASE_URL}/api/documents`, {
    headers: { Authorization: `Bearer ${rohanAuth.token}` },
  })).json();
  console.log('   Rohan Updated Documents:', rohanUpdatedDocs.documents?.map(d => d.originalName));

  // 2. Log in as Sarah Jenkins
  console.log('\n3. Logging in as Sarah Jenkins...');
  const sarahAuth = await login('sarah@careweave.com');
  console.log('   Sarah Auth User:', sarahAuth.user);

  // Check Sarah initial docs
  const sarahInitialDocs = await (await fetch(`${BASE_URL}/api/documents`, {
    headers: { Authorization: `Bearer ${sarahAuth.token}` },
  })).json();
  console.log('   Sarah Initial Documents (should be 0):', sarahInitialDocs.documents?.length || 0);

  // Upload 1 document for Sarah
  console.log('4. Uploading 1 document for Sarah...');
  await upload(sarahAuth.token, 'sarah_thyroid_report.pdf');

  // Check Sarah documents now
  const sarahUpdatedDocs = await (await fetch(`${BASE_URL}/api/documents`, {
    headers: { Authorization: `Bearer ${sarahAuth.token}` },
  })).json();
  console.log('   Sarah Updated Documents (should only be sarah_thyroid_report.pdf):', sarahUpdatedDocs.documents?.map(d => d.originalName));

  // 3. Log back in as Aditi Sharma
  console.log('\n5. Logging back in as Aditi Sharma...');
  const aditiAuth = await login('aditi@careweave.com');
  console.log('   Aditi Auth User:', aditiAuth.user);

  const aditiDocs = await (await fetch(`${BASE_URL}/api/documents`, {
    headers: { Authorization: `Bearer ${aditiAuth.token}` },
  })).json();
  console.log('   Aditi Documents count:', aditiDocs.documents?.length || 0);

  // Check that Aditi does NOT see Rohan's or Sarah's documents
  const aditiHasRohan = aditiDocs.documents?.some(d => d.originalName.includes('rohan'));
  const aditiHasSarah = aditiDocs.documents?.some(d => d.originalName.includes('sarah'));
  console.log('   Does Aditi see Rohan documents?:', aditiHasRohan, '(Expected: false)');
  console.log('   Does Aditi see Sarah documents?:', aditiHasSarah, '(Expected: false)');

  // Check that Rohan does NOT see Sarah or Aditi documents
  const rohanDocs = await (await fetch(`${BASE_URL}/api/documents`, {
    headers: { Authorization: `Bearer ${rohanAuth.token}` },
  })).json();
  const rohanHasSarah = rohanDocs.documents?.some(d => d.originalName.includes('sarah'));
  console.log('   Does Rohan see Sarah documents?:', rohanHasSarah, '(Expected: false)');
  console.log('   Rohan total document count:', rohanDocs.documents?.length, '(Expected: 2)');

  console.log('\n=== Multi-User Isolation Verification Complete ===');
}

testMultiUser();
