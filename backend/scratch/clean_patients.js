import path from 'path';
import { createRequire } from 'module';

const require = createRequire(path.resolve('package.json'));
const Database = require('better-sqlite3');

const db = new Database(path.resolve('data/careweave.db'));

// 1. Ensure Aditi Sharma
const aditiPat = db.prepare("SELECT * FROM patients WHERE (owner_email = 'aditi@careweave.com' OR owner_email = 'demo@example.com') AND name LIKE '%Aditi%'").get();
if (aditiPat) {
  console.log('Found Aditi:', aditiPat.id, aditiPat.name);
  db.prepare("UPDATE patients SET owner_email = 'aditi@careweave.com' WHERE id = ?").run(aditiPat.id);
  db.prepare("UPDATE documents SET owner_email = 'aditi@careweave.com', patient_id = ? WHERE owner_email = 'aditi@careweave.com' OR owner_email = 'demo@example.com'").run(aditiPat.id);
  // Remove scratch test patients
  db.prepare("DELETE FROM patients WHERE owner_email = 'aditi@careweave.com' AND id != ?").run(aditiPat.id);
}

// 2. Ensure Rohan Mehta
let rohanPat = db.prepare("SELECT * FROM patients WHERE owner_email = 'rohan@careweave.com'").get();
if (!rohanPat) {
  const now = new Date().toISOString();
  db.prepare("INSERT INTO patients (id, owner_email, name, date_of_birth, identifier, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?)").run(
    'pat_rohan_mehta_01', 'rohan@careweave.com', 'Rohan Mehta', '1988-04-12', 'MRN-ROHAN-01', now, now
  );
  rohanPat = { id: 'pat_rohan_mehta_01', name: 'Rohan Mehta' };
}
console.log('Found/Created Rohan:', rohanPat.id, rohanPat.name);

// 3. Ensure Sarah Jenkins
let sarahPat = db.prepare("SELECT * FROM patients WHERE owner_email = 'sarah@careweave.com'").get();
if (!sarahPat) {
  const now = new Date().toISOString();
  db.prepare("INSERT INTO patients (id, owner_email, name, date_of_birth, identifier, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?)").run(
    'pat_sarah_jenkins_01', 'sarah@careweave.com', 'Sarah Jenkins', '1992-09-25', 'MRN-SARAH-01', now, now
  );
  sarahPat = { id: 'pat_sarah_jenkins_01', name: 'Sarah Jenkins' };
}
console.log('Found/Created Sarah:', sarahPat.id, sarahPat.name);

console.log('\n--- Final Patients in SQLite ---');
console.log(db.prepare("SELECT id, owner_email, name, identifier FROM patients").all());
