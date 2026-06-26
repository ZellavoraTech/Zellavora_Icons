/**
 * sync-icons.js
 * Scans src/assets/svg/, optimizes each SVG with SVGO,
 * and auto-generates:
 *   - src/icon-registry.ts   (name → SVG content map)
 *   - src/icon-names.ts      (IconName union type)
 *   - docs/icon-list.json    (metadata for docs/tooling)
 */

const fs = require('fs');
const path = require('path');

const SVG_DIR = path.resolve(__dirname, '../src/assets/svg');
const REGISTRY_OUT = path.resolve(__dirname, '../src/icon-registry.ts');
const NAMES_OUT = path.resolve(__dirname, '../src/icon-names.ts');
const DOCS_OUT = path.resolve(__dirname, '../docs/icon-list.json');

// ── helpers ────────────────────────────────────────────────────────────────

function toPascalCase(name) {
  return name
    .split(/[-_]/)
    .map(part => part.charAt(0).toUpperCase() + part.slice(1))
    .join('');
}

function stripXmlDeclaration(svg) {
  return svg
    .replace(/<\?xml[^>]*\?>/g, '')
    .replace(/\s+xmlns="[^"]*"/g, '')
    .replace(/<!--[\s\S]*?-->/g, '')
    .trim();
}

function optimizeSvg(content) {
  // Lightweight inline optimisation (no SVGO dependency required at sync time)
  return content
    .replace(/\s{2,}/g, ' ')
    .replace(/>\s+</g, '><')
    .replace(/\n/g, '')
    .trim();
}

function readSvgFiles(dir) {
  if (!fs.existsSync(dir)) {
    console.error(`[sync] SVG directory not found: ${dir}`);
    process.exit(1);
  }

  return fs
    .readdirSync(dir)
    .filter(f => f.endsWith('.svg'))
    .sort()
    .map(file => {
      const name = path.basename(file, '.svg');
      const raw = fs.readFileSync(path.join(dir, file), 'utf8');
      const cleaned = optimizeSvg(stripXmlDeclaration(raw));
      return { name, pascal: toPascalCase(name), content: cleaned };
    });
}

// ── generators ─────────────────────────────────────────────────────────────

function generateRegistry(icons) {
  const entries = icons
    .map(({ name, content }) => `  '${name}': \`${content}\``)
    .join(',\n');

  return `/**
 * AUTO-GENERATED — do not edit by hand.
 * Run \`npm run sync\` to regenerate from src/assets/svg/.
 * Generated: ${new Date().toISOString()}
 */

import type { IconName } from './icon-names';

export const ICON_REGISTRY: Record<IconName, string> = {
${entries}
};

export function getIconSvg(name: IconName): string {
  const svg = ICON_REGISTRY[name];
  if (!svg) throw new Error(\`[zellvora-icons] Icon "\${name}" not found in registry.\`);
  return svg;
}
`;
}

function generateIconNames(icons) {
  const union = icons.map(({ name }) => `  | '${name}'`).join('\n');

  return `/**
 * AUTO-GENERATED — do not edit by hand.
 * Run \`npm run sync\` to regenerate from src/assets/svg/.
 * Generated: ${new Date().toISOString()}
 */

export type IconName =
${union};

export const ICON_NAMES: IconName[] = [
  ${icons.map(({ name }) => `'${name}'`).join(',\n  ')}
];
`;
}

function generateDocsMeta(icons) {
  return JSON.stringify(
    {
      generatedAt: new Date().toISOString(),
      count: icons.length,
      icons: icons.map(({ name, pascal }) => ({ name, pascal })),
    },
    null,
    2
  );
}

// ── main ───────────────────────────────────────────────────────────────────

function main() {
  console.log('[sync] Scanning SVG assets…');
  const icons = readSvgFiles(SVG_DIR);

  if (icons.length === 0) {
    console.warn('[sync] No SVG files found. Add icons to src/assets/svg/');
    return;
  }

  fs.writeFileSync(REGISTRY_OUT, generateRegistry(icons), 'utf8');
  fs.writeFileSync(NAMES_OUT, generateIconNames(icons), 'utf8');
  fs.writeFileSync(DOCS_OUT, generateDocsMeta(icons), 'utf8');

  console.log(`[sync] ✓ Synced ${icons.length} icons:`);
  icons.forEach(({ name }) => console.log(`         • ${name}`));
  console.log('[sync] Files updated:');
  console.log('         • src/icon-registry.ts');
  console.log('         • src/icon-names.ts');
  console.log('         • docs/icon-list.json');
}

main();
