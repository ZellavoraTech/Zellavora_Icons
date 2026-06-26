/**
 * src/types/index.ts
 * Shared TypeScript interfaces for @zellvora/icons.
 */

export interface IconProps {
  /** Icon name from the registry */
  name: string;
  /** Width and height in px (default: 24) */
  size?: number;
  /** SVG stroke/fill color — use CSS color values (default: 'currentColor') */
  color?: string;
  /** Additional CSS class names */
  className?: string;
  /** Accessible label. Omit for decorative icons; provide for standalone interactive icons. */
  ariaLabel?: string;
}

export interface IconMeta {
  name: string;
  pascal: string;
}

export interface SyncResult {
  count: number;
  icons: IconMeta[];
  generatedAt: string;
}
