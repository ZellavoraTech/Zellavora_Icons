/**
 * build.js
 * Compiles the synced registry into:
 *   dist/index.js        (CommonJS)
 *   dist/index.esm.js    (ESM)
 *   dist/angular/        (Angular module + component)
 *   dist/react/          (React component)
 */

const fs = require('fs');
const path = require('path');

const DIST = path.resolve(__dirname, '../dist');
const SRC = path.resolve(__dirname, '../src');

// ── read generated registry ────────────────────────────────────────────────

function loadRegistry() {
  const regPath = path.join(SRC, 'icon-registry.ts');
  if (!fs.existsSync(regPath)) {
    console.error('[build] icon-registry.ts not found. Run `npm run sync` first.');
    process.exit(1);
  }

  const raw = fs.readFileSync(regPath, 'utf8');

  // Extract icon entries from the TS source
  const matches = [...raw.matchAll(/'([^']+)':\s*`([^`]+)`/g)];
  return Object.fromEntries(matches.map(([, name, svg]) => [name, svg]));
}

function loadIconNames() {
  const namesPath = path.join(SRC, 'icon-names.ts');
  const raw = fs.readFileSync(namesPath, 'utf8');
  const matches = [...raw.matchAll(/'([^']+)'/g)];
  return [...new Set(matches.map(([, name]) => name))];
}

// ── output generators ──────────────────────────────────────────────────────

function buildCJS(registry, iconNames) {
  const registryJson = JSON.stringify(registry, null, 2);
  const namesJson = JSON.stringify(iconNames);

  return `'use strict';

/**
 * @zellvora/icons — CommonJS build
 * AUTO-GENERATED. Do not edit.
 */

var ICON_REGISTRY = ${registryJson};

var ICON_NAMES = ${namesJson};

function getIconSvg(name) {
  var svg = ICON_REGISTRY[name];
  if (!svg) throw new Error('[zellvora-icons] Icon "' + name + '" not found.');
  return svg;
}

function getSvgWithProps(name, props) {
  var svg = getIconSvg(name);
  var size = props.size || 24;
  var color = props.color || 'currentColor';
  var className = props.className || '';
  var ariaLabel = props.ariaLabel || '';
  var ariaHidden = ariaLabel ? '' : ' aria-hidden="true"';
  return svg
    .replace('<svg', '<svg width="' + size + '" height="' + size + '" color="' + color + '" class="zv-icon zv-icon--' + name + (className ? ' ' + className : '') + '"' + ariaHidden + (ariaLabel ? ' aria-label="' + ariaLabel + '"' : ''))
    .replace('stroke="currentColor"', 'stroke="' + color + '"');
}

exports.ICON_REGISTRY = ICON_REGISTRY;
exports.ICON_NAMES = ICON_NAMES;
exports.getIconSvg = getIconSvg;
exports.getSvgWithProps = getSvgWithProps;
`;
}

function buildESM(registry, iconNames) {
  const registryJson = JSON.stringify(registry, null, 2);
  const namesJson = JSON.stringify(iconNames);

  return `/**
 * @zellvora/icons — ESM build
 * AUTO-GENERATED. Do not edit.
 */

export const ICON_REGISTRY = ${registryJson};

export const ICON_NAMES = ${namesJson};

export function getIconSvg(name) {
  const svg = ICON_REGISTRY[name];
  if (!svg) throw new Error(\`[zellvora-icons] Icon "\${name}" not found.\`);
  return svg;
}

export function getSvgWithProps(name, props = {}) {
  const svg = getIconSvg(name);
  const { size = 24, color = 'currentColor', className = '', ariaLabel = '' } = props;
  const ariaHidden = ariaLabel ? '' : ' aria-hidden="true"';
  const ariaAttr = ariaLabel ? \` aria-label="\${ariaLabel}"\` : '';
  return svg
    .replace('<svg', \`<svg width="\${size}" height="\${size}" color="\${color}" class="zv-icon zv-icon--\${name}\${className ? ' ' + className : ''}"\${ariaHidden}\${ariaAttr}\`)
    .replace('stroke="currentColor"', \`stroke="\${color}"\`);
}
`;
}

function buildAngularComponent() {
  return `/**
 * @zellvora/icons — Angular component
 * AUTO-GENERATED. Do not edit.
 * Compatible: Angular 13–21 (standalone, OnPush)
 */
import {
  Component, Input, ChangeDetectionStrategy,
  OnChanges, ElementRef, Renderer2, inject
} from '@angular/core';
import { getIconSvg, getSvgWithProps } from '../index.esm.js';

@Component({
  selector: 'zv-icon',
  standalone: true,
  template: '',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    '[class]': '"zv-icon zv-icon--" + name',
    '[attr.aria-hidden]': '!ariaLabel || null',
    '[attr.aria-label]': 'ariaLabel || null',
    '[attr.role]': 'ariaLabel ? "img" : null',
  }
})
export class ZvIconComponent implements OnChanges {
  @Input() name = '';
  @Input() size = 24;
  @Input() color = 'currentColor';
  @Input() ariaLabel = '';

  private el = inject(ElementRef);
  private renderer = inject(Renderer2);

  ngOnChanges(): void {
    if (!this.name) return;
    try {
      const svg = getSvgWithProps(this.name, {
        size: this.size,
        color: this.color,
        ariaLabel: this.ariaLabel,
      });
      this.renderer.setProperty(this.el.nativeElement, 'innerHTML', svg);
    } catch (e) {
      console.warn(e);
    }
  }
}
`;
}

function buildAngularModule() {
  return `/**
 * @zellvora/icons — Angular NgModule (for non-standalone apps)
 * AUTO-GENERATED. Do not edit.
 */
import { NgModule } from '@angular/core';
import { ZvIconComponent } from './zv-icon.component.js';

@NgModule({
  imports: [ZvIconComponent],
  exports: [ZvIconComponent],
})
export class ZvIconsModule {}
`;
}

function buildAngularIndex() {
  return `/**
 * @zellvora/icons/angular
 * AUTO-GENERATED. Do not edit.
 */
export { ZvIconComponent } from './zv-icon.component.js';
export { ZvIconsModule } from './zv-icons.module.js';
`;
}

function buildReactComponent() {
  return `/**
 * @zellvora/icons — React component
 * AUTO-GENERATED. Do not edit.
 * Compatible: React 17+
 */
import React from 'react';
import { getSvgWithProps } from '../index.esm.js';

export function ZvIcon({ name, size = 24, color = 'currentColor', className = '', ariaLabel = '', style = {} }) {
  if (!name) return null;

  let svgString;
  try {
    svgString = getSvgWithProps(name, { size, color, className, ariaLabel });
  } catch (e) {
    console.warn(e);
    return null;
  }

  return React.createElement('span', {
    className: \`zv-icon zv-icon--\${name}\${className ? ' ' + className : ''}\`,
    style,
    'aria-hidden': ariaLabel ? undefined : true,
    'aria-label': ariaLabel || undefined,
    role: ariaLabel ? 'img' : undefined,
    dangerouslySetInnerHTML: { __html: svgString },
  });
}

ZvIcon.displayName = 'ZvIcon';
`;
}

function buildReactIndex() {
  return `/**
 * @zellvora/icons/react
 * AUTO-GENERATED. Do not edit.
 */
export { ZvIcon } from './zv-icon.component.js';
`;
}

// ── CSS ────────────────────────────────────────────────────────────────────

function buildCSS() {
  return `/**
 * @zellvora/icons — base styles
 * Import in your app: import '@zellvora/icons/dist/icons.css'
 */
.zv-icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  vertical-align: middle;
  line-height: 1;
}

.zv-icon svg {
  display: block;
  width: 100%;
  height: 100%;
}
`;
}

// ── main ───────────────────────────────────────────────────────────────────

function ensureDir(dir) {
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
}

function main() {
  console.log('[build] Loading registry…');
  const registry = loadRegistry();
  const iconNames = loadIconNames();

  ensureDir(DIST);
  ensureDir(path.join(DIST, 'angular'));
  ensureDir(path.join(DIST, 'react'));

  fs.writeFileSync(path.join(DIST, 'index.js'), buildCJS(registry, iconNames), 'utf8');
  fs.writeFileSync(path.join(DIST, 'index.esm.js'), buildESM(registry, iconNames), 'utf8');
  fs.writeFileSync(path.join(DIST, 'angular', 'zv-icon.component.js'), buildAngularComponent(), 'utf8');
  fs.writeFileSync(path.join(DIST, 'angular', 'zv-icons.module.js'), buildAngularModule(), 'utf8');
  fs.writeFileSync(path.join(DIST, 'angular', 'index.js'), buildAngularIndex(), 'utf8');
  fs.writeFileSync(path.join(DIST, 'react', 'zv-icon.component.js'), buildReactComponent(), 'utf8');
  fs.writeFileSync(path.join(DIST, 'react', 'index.js'), buildReactIndex(), 'utf8');
  fs.writeFileSync(path.join(DIST, 'icons.css'), buildCSS(), 'utf8');

  console.log(`[build] ✓ Built ${Object.keys(registry).length} icons into dist/`);
}

main();
