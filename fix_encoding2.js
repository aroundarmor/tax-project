// fix_encoding2.js — Targeted replacement using precise Unicode escape codes
// The files contain valid UTF-8, but have the wrong characters.
// e.g. '₹' stored as the 3-char sequence: U+00E2 U+0082 U+00B9 (â‚¹)
// This script replaces each garbled sequence with the correct character.

const fs = require('fs');
const path = require('path');

// Each garbled sequence (as char codes) → correct character
// Garbled sequences are the Latin-1 rendering of UTF-8 bytes:
//   UTF-8 bytes of char → each byte becomes a Latin-1 char → stored as UTF-8 of those chars
const REPLACEMENTS = [
  // Indian Rupee ₹ (U+20B9): UTF-8 E2 82 B9 → Latin-1 chars: â(E2) ‚(82) ¹(B9)
  // But stored as UTF-8 of those: U+00E2 U+0082 U+00B9
  ['\u00E2\u0082\u00B9', '\u20B9'],  // ₹

  // Em dash — (U+2014): UTF-8 E2 80 94 → U+00E2 U+0080 U+0094
  ['\u00E2\u0080\u0094', '\u2014'],  // —

  // En dash – (U+2013): UTF-8 E2 80 93 → U+00E2 U+0080 U+0093
  ['\u00E2\u0080\u0093', '\u2013'],  // –

  // Left double quote " (U+201C): UTF-8 E2 80 9C → U+00E2 U+0080 U+009C
  ['\u00E2\u0080\u009C', '\u201C'],  // "

  // Right double quote " (U+201D): UTF-8 E2 80 9D → U+00E2 U+0080 U+009D
  ['\u00E2\u0080\u009D', '\u201D'],  // "

  // Right single quote / apostrophe ' (U+2019): UTF-8 E2 80 99 → U+00E2 U+0080 U+0099
  ['\u00E2\u0080\u0099', '\u2019'],  // '

  // Horizontal ellipsis … (U+2026): UTF-8 E2 80 A6 → U+00E2 U+0080 U+00A6
  ['\u00E2\u0080\u00A6', '\u2026'],  // …

  // Middle dot · (U+00B7): UTF-8 C2 B7 → U+00C2 U+00B7
  ['\u00C2\u00B7', '\u00B7'],  // ·

  // Non-breaking space (U+00A0): UTF-8 C2 A0 → U+00C2 U+00A0
  ['\u00C2\u00A0', '\u00A0'],  // NBSP

  // Copyright © (U+00A9): UTF-8 C2 A9 → U+00C2 U+00A9
  ['\u00C2\u00A9', '\u00A9'],  // ©

  // Right arrow → (U+2192): UTF-8 E2 86 92 → U+00E2 U+0086 U+0092
  ['\u00E2\u0086\u0092', '\u2192'],  // →

  // Left arrow ← (U+2190): UTF-8 E2 86 90 → U+00E2 U+0086 U+0090
  ['\u00E2\u0086\u0090', '\u2190'],  // ←

  // Up arrow ↑ (U+2191)
  ['\u00E2\u0086\u0091', '\u2191'],  // ↑

  // Check mark ✓ (U+2713)
  ['\u00E2\u009C\u0093', '\u2713'],  // ✓

  // Check mark ✅ (U+2705): 4-byte emoji F0 9F 9C 85 → need 4 bytes
  // U+00F0 U+009F U+009C U+0085  (but actually need to handle 4-byte emoji differently)
  // Actually ✅ in UTF-8 is F0 9F A5 85 → U+00F0 U+009F U+00A5 U+0085... wait
  // ✅ = U+2705, UTF-8 = E2 9C 85 → U+00E2 U+009C U+0085
  ['\u00E2\u009C\u0085', '\u2705'],  // ✅

  // Sparkles ✨ (U+2728): UTF-8 E2 9C A8 → U+00E2 U+009C U+00A8
  ['\u00E2\u009C\u00A8', '\u2728'],  // ✨

  // White check mark (U+2714): E2 9C 94 → U+00E2 U+009C U+0094
  ['\u00E2\u009C\u0094', '\u2714'],  // ✔

  // Scales ⚖️: ⚖ (U+2696) UTF-8 E2 9A 96 + ️ (variation selector U+FE0F) EF B8 8F
  ['\u00E2\u009A\u0096\u00EF\u00B8\u008F', '\u2696\uFE0F'],  // ⚖️
  ['\u00E2\u009A\u0096', '\u2696'],  // ⚖

  // Gear ⚙️ (U+2699): UTF-8 E2 9A 99
  ['\u00E2\u009A\u0099\u00EF\u00B8\u008F', '\u2699\uFE0F'],  // ⚙️
  ['\u00E2\u009A\u0099', '\u2699'],  // ⚙

  // Lightning bolt ⚡ (U+26A1): UTF-8 E2 9A A1 → U+00E2 U+009A U+00A1
  ['\u00E2\u009A\u00A1', '\u26A1'],  // ⚡

  // Warning ⚠️ (U+26A0): UTF-8 E2 9A A0
  ['\u00E2\u009A\u00A0\u00EF\u00B8\u008F', '\u26A0\uFE0F'],  // ⚠️
  ['\u00E2\u009A\u00A0', '\u26A0'],  // ⚠

  // Info ℹ️ (U+2139): UTF-8 E2 84 B9
  ['\u00E2\u0084\u00B9\u00EF\u00B8\u008F', '\u2139\uFE0F'],  // ℹ️
  ['\u00E2\u0084\u00B9', '\u2139'],  // ℹ

  // Bullet • (U+2022): UTF-8 E2 80 A2
  ['\u00E2\u0080\u00A2', '\u2022'],  // •

  // Times × (U+00D7): UTF-8 C3 97 → U+00C3 U+0097
  ['\u00C3\u0097', '\u00D7'],  // ×

  // 4-byte emoji: stored as 4 separate "mis-encoded" chars
  // Format: UTF-8 bytes F0 9F XX YY → chars U+00F0 U+009F U+00XX U+00YY

  // 💰 Money Bag (U+1F4B0): F0 9F 92 B0
  ['\u00F0\u009F\u0092\u00B0', '\uD83D\uDCB0'],  // 💰

  // 💡 Light Bulb (U+1F4A1): F0 9F 92 A1
  ['\u00F0\u009F\u0092\u00A1', '\uD83D\uDCA1'],  // 💡

  // 📊 Bar Chart (U+1F4CA): F0 9F 93 8A
  ['\u00F0\u009F\u0093\u008A', '\uD83D\uDCCA'],  // 📊

  // 📋 Clipboard (U+1F4CB): F0 9F 93 8B
  ['\u00F0\u009F\u0093\u008B', '\uD83D\uDCCB'],  // 📋

  // 📄 Page (U+1F4C4): F0 9F 93 84
  ['\u00F0\u009F\u0093\u0084', '\uD83D\uDCC4'],  // 📄

  // 📤 Outbox (U+1F4E4): F0 9F 93 A4
  ['\u00F0\u009F\u0093\u00A4', '\uD83D\uDCE4'],  // 📤

  // 🏦 Bank (U+1F3E6): F0 9F 8F A6
  ['\u00F0\u009F\u008F\u00A6', '\uD83C\uDFE6'],  // 🏦

  // 🏠 House (U+1F3E0): F0 9F 8F A0
  ['\u00F0\u009F\u008F\u00A0', '\uD83C\uDFE0'],  // 🏠

  // 🏡 House with Garden (U+1F3E1): F0 9F 8F A1
  ['\u00F0\u009F\u008F\u00A1', '\uD83C\uDFE1'],  // 🏡

  // 🏥 Hospital (U+1F3E5): F0 9F 8F A5
  ['\u00F0\u009F\u008F\u00A5', '\uD83C\uDFE5'],  // 🏥

  // 🚀 Rocket (U+1F680): F0 9F 9A 80
  ['\u00F0\u009F\u009A\u0080', '\uD83D\uDE80'],  // 🚀

  // 🎉 Party (U+1F389): F0 9F 8E 89
  ['\u00F0\u009F\u008E\u0089', '\uD83C\uDF89'],  // 🎉

  // 🤖 Robot (U+1F916): F0 9F A4 96
  ['\u00F0\u009F\u00A4\u0096', '\uD83E\uDD16'],  // 🤖

  // 🔒 Lock (U+1F512): F0 9F 94 92
  ['\u00F0\u009F\u0094\u0092', '\uD83D\uDD12'],  // 🔒

  // 🔑 Key (U+1F511): F0 9F 94 91
  ['\u00F0\u009F\u0094\u0091', '\uD83D\uDD11'],  // 🔑

  // 🆕 New (U+1F195): F0 9F 86 95
  ['\u00F0\u009F\u0086\u0095', '\uD83C\uDD95'],  // 🆕

  // 👤 Person silhouette (U+1F464): F0 9F 91 A4
  ['\u00F0\u009F\u0091\u00A4', '\uD83D\uDC64'],  // 👤

  // 👴 Old man (U+1F474): F0 9F 91 B4
  ['\u00F0\u009F\u0091\u00B4', '\uD83D\uDC74'],  // 👴

  // 👶 Baby (U+1F476): F0 9F 91 B6
  ['\u00F0\u009F\u0091\u00B6', '\uD83D\uDC76'],  // 👶

  // 🧪 Test tube (U+1F9EA): F0 9F A7 AA
  ['\u00F0\u009F\u00A7\u00AA', '\uD83E\uDDEA'],  // 🧪

  // 🧑 Person (U+1F9D1): F0 9F A7 91
  ['\u00F0\u009F\u00A7\u0091', '\uD83E\uDDD1'],  // 🧑

  // ⭐ Star (U+2B50): UTF-8 E2 AD 90
  ['\u00E2\u00AD\u0090', '\u2B50'],  // ⭐

  // 📌 Pushpin (U+1F4CC): F0 9F 93 8C
  ['\u00F0\u009F\u0093\u008C', '\uD83D\uDCCC'],  // 📌

  // 💳 Credit card (U+1F4B3): F0 9F 92 B3
  ['\u00F0\u009F\u0092\u00B3', '\uD83D\uDCB3'],  // 💳

  // 🎓 Graduation (U+1F393): F0 9F 8E 93
  ['\u00F0\u009F\u008E\u0093', '\uD83C\uDF93'],  // 🎓
];

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
      let text = fs.readFileSync(fp, 'utf8');
      let changed = false;
      for (const [garbled, correct] of REPLACEMENTS) {
        if (text.includes(garbled)) {
          // Use replaceAll (Node 15+) or split/join
          const before = text;
          text = text.split(garbled).join(correct);
          if (text !== before) changed = true;
        }
      }
      if (changed) {
        fs.writeFileSync(fp, text, 'utf8');
        fixed++;
        process.stdout.write(`FIXED: ${fp}\n`);
      } else {
        process.stdout.write(`OK:    ${fp}\n`);
      }
    } catch (e) {
      process.stderr.write(`ERROR: ${fp} — ${e.message}\n`);
    }
  }
}

process.stdout.write(`\nDone: ${fixed}/${total} files fixed\n`);

// Verify
const check = fs.readFileSync('dev/website/app.html', 'utf8');
process.stdout.write(`\nVerify app.html:\n`);
process.stdout.write(`  Has ₹: ${check.includes('\u20B9')}\n`);
process.stdout.write(`  Has 💰: ${check.includes('\uD83D\uDCB0')}\n`);
process.stdout.write(`  Has garbled â‚¹: ${check.includes('\u00E2\u0082\u00B9')}\n`);
const sampleIdx = check.indexOf('Below 60');
if (sampleIdx >= 0) {
  process.stdout.write(`  Sample: ...${check.substring(sampleIdx, sampleIdx + 40)}...\n`);
}
