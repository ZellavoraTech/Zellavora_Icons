/**
 * src/utils/transform.ts
 * SVG string transformation utilities shared across build steps.
 */

/**
 * Converts a kebab-case icon name to PascalCase.
 * @example toPascalCase('arrow-right') // 'ArrowRight'
 */
export function toPascalCase(name: string): string {
  return name
    .split(/[-_]/)
    .map(part => part.charAt(0).toUpperCase() + part.slice(1))
    .join('');
}

/**
 * Strips XML declarations, namespace declarations, and HTML comments
 * from raw SVG file content.
 */
export function cleanSvgSource(raw: string): string {
  return raw
    .replace(/<\?xml[^>]*\?>/g, '')
    .replace(/\s+xmlns:xlink="[^"]*"/g, '')
    .replace(/<!--[\s\S]*?-->/g, '')
    .trim();
}

/**
 * Injects size, color, class, and accessibility attributes into an SVG string.
 */
export function injectSvgProps(
  svg: string,
  opts: {
    size?: number;
    color?: string;
    className?: string;
    ariaLabel?: string;
    name?: string;
  }
): string {
  const { size = 24, color = 'currentColor', className = '', ariaLabel = '', name = '' } = opts;

  const classAttr = `zv-icon${name ? ` zv-icon--${name}` : ''}${className ? ` ${className}` : ''}`;
  const a11y = ariaLabel
    ? `aria-label="${ariaLabel}" role="img"`
    : `aria-hidden="true"`;

  return svg.replace(
    '<svg',
    `<svg width="${size}" height="${size}" class="${classAttr}" ${a11y}`
  );
}
