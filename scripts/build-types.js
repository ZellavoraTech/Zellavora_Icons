/**
 * build-types.js
 * Generates TypeScript declaration files (.d.ts) for all dist outputs.
 */

const fs = require('fs');
const path = require('path');

const DIST = path.resolve(__dirname, '../dist');
const SRC = path.resolve(__dirname, '../src');

function loadIconNames() {
  const namesPath = path.join(SRC, 'icon-names.ts');
  if (!fs.existsSync(namesPath)) return [];
  const raw = fs.readFileSync(namesPath, 'utf8');
  const matches = [...raw.matchAll(/'([^']+)'/g)];
  return [...new Set(matches.map(([, n]) => n))];
}

function buildCoreTypes(names) {
  const nameUnion = names.map(n => `'${n}'`).join(' | ');

  return `/**
 * @zellvora/icons — type declarations
 * AUTO-GENERATED. Do not edit.
 */

export type IconName = ${nameUnion || 'string'};

export interface IconProps {
  size?: number;
  color?: string;
  className?: string;
  ariaLabel?: string;
}

export declare const ICON_REGISTRY: Record<IconName, string>;
export declare const ICON_NAMES: IconName[];

export declare function getIconSvg(name: IconName): string;
export declare function getSvgWithProps(name: IconName, props?: IconProps): string;
`;
}

function buildAngularTypes() {
  return `/**
 * @zellvora/icons/angular — type declarations
 * AUTO-GENERATED. Do not edit.
 */
import { OnChanges } from '@angular/core';
import type { IconName } from '../index';

export declare class ZvIconComponent implements OnChanges {
  name: IconName;
  size: number;
  color: string;
  ariaLabel: string;
  ngOnChanges(): void;
}

export declare class ZvIconsModule {}
`;
}

function buildReactTypes() {
  return `/**
 * @zellvora/icons/react — type declarations
 * AUTO-GENERATED. Do not edit.
 */
import { CSSProperties } from 'react';
import type { IconName, IconProps } from '../index';

export interface ZvIconProps extends IconProps {
  name: IconName;
  style?: CSSProperties;
}

export declare function ZvIcon(props: ZvIconProps): JSX.Element | null;
`;
}

function main() {
  console.log('[types] Generating .d.ts files…');
  const names = loadIconNames();

  fs.writeFileSync(path.join(DIST, 'index.d.ts'), buildCoreTypes(names), 'utf8');
  fs.writeFileSync(path.join(DIST, 'angular', 'index.d.ts'), buildAngularTypes(), 'utf8');
  fs.writeFileSync(path.join(DIST, 'react', 'index.d.ts'), buildReactTypes(), 'utf8');

  console.log('[types] ✓ Generated:');
  console.log('         • dist/index.d.ts');
  console.log('         • dist/angular/index.d.ts');
  console.log('         • dist/react/index.d.ts');
}

main();
