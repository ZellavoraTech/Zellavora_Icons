/**
 * watch.js
 * Watches src/assets/svg/ for changes and auto-syncs + rebuilds.
 * Usage: npm run dev
 */

const path = require('path');
const { execSync } = require('child_process');
const fs = require('fs');

const SVG_DIR = path.resolve(__dirname, '../src/assets/svg');

function debounce(fn, ms) {
  let timer;
  return (...args) => {
    clearTimeout(timer);
    timer = setTimeout(() => fn(...args), ms);
  };
}

function rebuild(changedFile) {
  const label = changedFile ? `[watch] Change detected: ${path.basename(changedFile)}` : '[watch] Initial build';
  console.log(label);
  try {
    execSync('node scripts/sync-icons.js', { cwd: path.resolve(__dirname, '..'), stdio: 'inherit' });
    execSync('node scripts/build.js', { cwd: path.resolve(__dirname, '..'), stdio: 'inherit' });
    execSync('node scripts/build-types.js', { cwd: path.resolve(__dirname, '..'), stdio: 'inherit' });
    console.log('[watch] ✓ Ready. Watching for changes…\n');
  } catch (e) {
    console.error('[watch] ✗ Build failed:', e.message);
  }
}

function startWatcher() {
  // Try to use chokidar if available, otherwise fall back to fs.watch
  try {
    const chokidar = require('chokidar');

    const watcher = chokidar.watch(SVG_DIR, {
      persistent: true,
      ignoreInitial: true,
      awaitWriteFinish: { stabilityThreshold: 100 },
    });

    const debouncedRebuild = debounce(rebuild, 200);

    watcher
      .on('add', f => debouncedRebuild(f))
      .on('change', f => debouncedRebuild(f))
      .on('unlink', f => {
        console.log(`[watch] Removed: ${path.basename(f)}`);
        debouncedRebuild(f);
      });

    console.log('[watch] Using chokidar. Watching:', SVG_DIR);
  } catch {
    // Fallback: native fs.watch
    console.log('[watch] chokidar not found, using fs.watch. Run `npm install chokidar --save-dev` for better watching.');

    const debouncedRebuild = debounce(rebuild, 300);

    fs.watch(SVG_DIR, { recursive: false }, (event, filename) => {
      if (filename && filename.endsWith('.svg')) debouncedRebuild(filename);
    });

    console.log('[watch] Watching:', SVG_DIR);
  }

  // Run initial build
  rebuild(null);
}

startWatcher();
