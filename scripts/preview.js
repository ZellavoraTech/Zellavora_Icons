/**
 * preview.js
 * Generates docs/preview.html — a visual browser for all icons.
 * Open in any browser after build.
 */

const fs = require('fs');
const path = require('path');

const DOCS_DIR = path.resolve(__dirname, '../docs');
const SRC = path.resolve(__dirname, '../src');

function loadIcons() {
  const regPath = path.join(SRC, 'icon-registry.ts');
  if (!fs.existsSync(regPath)) {
    console.error('[preview] Run `npm run sync` first.');
    process.exit(1);
  }
  const raw = fs.readFileSync(regPath, 'utf8');
  const matches = [...raw.matchAll(/'([^']+)':\s*`([^`]+)`/g)];
  return matches.map(([, name, svg]) => ({ name, svg }));
}

function generateHtml(icons) {
  const cards = icons
    .map(
      ({ name, svg }) => `
    <div class="card" onclick="copyName('${name}')" title="Click to copy">
      <div class="preview">${svg.replace('<svg', '<svg width="32" height="32"')}</div>
      <p class="name">${name}</p>
    </div>`
    )
    .join('');

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>@zellvora/icons — preview (${icons.length})</title>
  <style>
    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
    body { font-family: system-ui, sans-serif; background: #f5f5f4; color: #1c1c1a; }
    header { background: #fff; border-bottom: 1px solid #e8e8e5; padding: 1rem 2rem; display: flex; align-items: center; gap: 1rem; }
    header h1 { font-size: 1.1rem; font-weight: 600; }
    header span { font-size: 0.85rem; color: #888; }
    .search-wrap { margin-left: auto; }
    input[type=search] { border: 1px solid #d0d0cc; border-radius: 6px; padding: 0.4rem 0.75rem; font-size: 0.9rem; width: 240px; outline: none; }
    input[type=search]:focus { border-color: #6366f1; }
    .grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(96px, 1fr)); gap: 0.75rem; padding: 2rem; }
    .card { background: #fff; border: 1px solid #e8e8e5; border-radius: 8px; padding: 1rem 0.5rem 0.75rem; text-align: center; cursor: pointer; transition: box-shadow 0.15s, border-color 0.15s; }
    .card:hover { border-color: #6366f1; box-shadow: 0 0 0 3px rgba(99,102,241,0.15); }
    .card.copied { border-color: #22c55e; }
    .preview { display: flex; justify-content: center; margin-bottom: 0.5rem; color: #374151; }
    .name { font-size: 0.68rem; color: #6b7280; word-break: break-all; }
    .toast { position: fixed; bottom: 1.5rem; right: 1.5rem; background: #1c1c1a; color: #fff; padding: 0.5rem 1rem; border-radius: 6px; font-size: 0.85rem; opacity: 0; transition: opacity 0.2s; pointer-events: none; }
    .toast.show { opacity: 1; }
    .hidden { display: none; }
  </style>
</head>
<body>
<header>
  <h1>@zellvora/icons</h1>
  <span>${icons.length} icons</span>
  <div class="search-wrap">
    <input type="search" id="search" placeholder="Search icons…" oninput="filterIcons(this.value)">
  </div>
</header>
<div class="grid" id="grid">${cards}</div>
<div class="toast" id="toast"></div>

<script>
  function copyName(name) {
    navigator.clipboard.writeText(name).then(() => {
      const toast = document.getElementById('toast');
      toast.textContent = '"' + name + '" copied';
      toast.classList.add('show');
      setTimeout(() => toast.classList.remove('show'), 1800);
    });
  }

  function filterIcons(query) {
    const q = query.toLowerCase().trim();
    document.querySelectorAll('.card').forEach(card => {
      const name = card.querySelector('.name').textContent;
      card.classList.toggle('hidden', q.length > 0 && !name.includes(q));
    });
  }
</script>
</body>
</html>`;
}

function main() {
  console.log('[preview] Generating preview…');
  const icons = loadIcons();

  if (!fs.existsSync(DOCS_DIR)) fs.mkdirSync(DOCS_DIR, { recursive: true });

  const html = generateHtml(icons);
  const outPath = path.join(DOCS_DIR, 'preview.html');
  fs.writeFileSync(outPath, html, 'utf8');

  console.log(`[preview] ✓ Generated docs/preview.html (${icons.length} icons)`);
  console.log('[preview]   Open in a browser to browse all icons.');
}

main();
