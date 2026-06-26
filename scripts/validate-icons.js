/**
 * validate-icons.js
 * Validates SVG files before publish:
 *   - Correct viewBox
 *   - No hardcoded colors (non-currentColor fill/stroke)
 *   - Proper naming convention (kebab-case)
 *   - No duplicate names
 *   - File size within limit
 */

const fs = require('fs');
const path = require('path');

const SVG_DIR = path.resolve(__dirname, '../src/assets/svg');
const MAX_SIZE_BYTES = 5000;

let errors = 0;
let warnings = 0;

function err(file, msg) {
  console.error(`  ✗ ERROR   [${file}] ${msg}`);
  errors++;
}

function warn(file, msg) {
  console.warn(`  ⚠ WARNING [${file}] ${msg}`);
  warnings++;
}

function ok(msg) {
  console.log(`  ✓ ${msg}`);
}

function validateSvgContent(name, content) {
  // Must have viewBox
  if (!content.includes('viewBox')) {
    err(name, 'Missing viewBox attribute. Required for responsive scaling.');
  }

  // Should use currentColor for stroke/fill (theme compatibility)
  const hasHardcodedColor = /<(path|circle|rect|line|polyline|polygon|ellipse)[^>]+(fill|stroke)="(?!none|currentColor)[^"]*"/i.test(content);
  if (hasHardcodedColor) {
    warn(name, 'Hardcoded fill/stroke color detected. Use currentColor for theme support.');
  }

  // Should not have fixed width/height on root svg (makes it non-responsive)
  const hasFixedSize = /<svg[^>]+(?:width|height)="\d+px"/i.test(content);
  if (hasFixedSize) {
    warn(name, 'Fixed px width/height on root <svg>. Remove them; size is controlled via props.');
  }

  // Should have xmlns
  if (!content.includes('xmlns')) {
    warn(name, 'Missing xmlns attribute on <svg>.');
  }
}

function validateNaming(filename) {
  const name = path.basename(filename, '.svg');

  // Must be kebab-case
  if (!/^[a-z][a-z0-9]*(-[a-z0-9]+)*$/.test(name)) {
    err(name, `Invalid filename "${name}". Use kebab-case: e.g., arrow-right, chevron-down.`);
  }

  return name;
}

function main() {
  console.log('\n[validate] Validating SVG icons…\n');

  if (!fs.existsSync(SVG_DIR)) {
    console.error(`[validate] SVG directory not found: ${SVG_DIR}`);
    process.exit(1);
  }

  const files = fs.readdirSync(SVG_DIR).filter(f => f.endsWith('.svg'));

  if (files.length === 0) {
    console.warn('[validate] No SVG files found.');
    return;
  }

  const names = new Set();

  for (const file of files.sort()) {
    const filePath = path.join(SVG_DIR, file);
    const name = validateNaming(file);

    // Duplicate check
    if (names.has(name)) {
      err(name, 'Duplicate icon name detected.');
    }
    names.add(name);

    // File size check
    const size = fs.statSync(filePath).size;
    if (size > MAX_SIZE_BYTES) {
      warn(name, `File size ${size}B exceeds recommended ${MAX_SIZE_BYTES}B. Consider optimising with SVGO.`);
    }

    // Content checks
    const content = fs.readFileSync(filePath, 'utf8');
    validateSvgContent(name, content);
  }

  console.log('');
  ok(`Validated ${files.length} icons`);

  if (errors > 0 || warnings > 0) {
    console.log(`\n[validate] ${errors} error(s), ${warnings} warning(s)\n`);
  } else {
    console.log('[validate] ✓ All icons passed validation.\n');
  }

  if (errors > 0) process.exit(1);
}

main();
