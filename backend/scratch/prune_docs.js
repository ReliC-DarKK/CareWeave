import path from 'path';
import { createRequire } from 'module';

const require = createRequire(path.resolve('package.json'));
const Database = require('better-sqlite3');
const db = new Database(path.resolve('data/careweave.db'));

function deduplicateOwner(email) {
  const docs = db.prepare("SELECT id, original_name, stored_filename, uploaded_at FROM documents WHERE owner_email = ? ORDER BY uploaded_at DESC").all(email);
  const seen = new Set();
  const keepIds = [];
  for (const d of docs) {
    if (!seen.has(d.original_name)) {
      seen.add(d.original_name);
      keepIds.push(d.id);
    }
  }
  if (keepIds.length > 0) {
    const placeholders = keepIds.map(() => '?').join(',');
    db.prepare(`DELETE FROM documents WHERE owner_email = ? AND id NOT IN (${placeholders})`).run(email, ...keepIds);
  }
}

deduplicateOwner('rohan@careweave.com');
deduplicateOwner('sarah@careweave.com');
deduplicateOwner('aditi@careweave.com');

// Clean extractions
db.prepare(`DELETE FROM extractions WHERE document_id NOT IN (SELECT id FROM documents)`).run();

console.log('--- FINAL RECORDS PER USER ---');
for (const email of ['aditi@careweave.com', 'rohan@careweave.com', 'sarah@careweave.com']) {
  const docs = db.prepare("SELECT original_name FROM documents WHERE owner_email = ?").all(email);
  console.log(email, ':', docs.map(d => d.original_name));
}
