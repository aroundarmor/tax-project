// fix_encoding.js — Mojibake reversal for HTML/JS/CSS files
// These files were saved in a state where UTF-8 bytes were interpreted as Latin-1
// and then re-encoded as UTF-8 — making chars like ₹ appear as â‚¹
//
// Fix: read the file as 'latin1' (every byte becomes its unicode code point),
//      take those code points as a byte array (they ARE the original UTF-8 bytes),
//      decode that byte array as UTF-8 to get the correct string,
//      write back as UTF-8.

const fs = require('fs');
const path = require('path');

function fixMojibake(text) {
  // Re-interpret the string as if each character is a byte (latin1 round-trip)
  const bytes = Buffer.from(text, 'latin1');
  // Now decode those bytes as UTF-8
  return bytes.toString('utf8');
}

const DIRS = ['dev/website', 'new-website'];
const EXTS = new Set(['.html', '.js', '.css']);

let total = 0, fixed = 0;

for (const dir of DIRS) {
  if (!fs.existsSync(dir)) continue;
  const files = fs.readdirSync(dir).filter(f => EXTS.has(path.extname(f)));
  for (const file of files) {
    const fp = path.join(dir, file);
    total++;
    try {
      // Read as latin1 — this gives us the mojibake string
      const raw = fs.readFileSync(fp, 'latin1');
      // Convert back to proper UTF-8 interpretation
      const corrected = fixMojibake(raw);
      
      // Only write if it actually changed something
      if (corrected !== raw) {
        // Write as UTF-8 without BOM
        fs.writeFileSync(fp, corrected, 'utf8');
        fixed++;
        console.log(`FIXED: ${fp}`);
      } else {
        console.log(`OK:    ${fp}`);
      }
    } catch (e) {
      console.error(`ERROR: ${fp} — ${e.message}`);
    }
  }
}

console.log(`\nDone: ${fixed}/${total} files fixed`);

// Quick verification
const check = fs.readFileSync('dev/website/app.html', 'utf8');
console.log('\nVerification — app.html has ₹:', check.includes('₹'));
console.log('Verification — app.html has 💰:', check.includes('💰'));
console.log('Verification — app.html still has â‚¹:', check.includes('â‚¹'));
