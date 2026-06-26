# @zellvora/icons

> Production-ready SVG icon library with auto-sync build pipeline.  
> By [Zellvora Technologies](https://rabinr.in) · [npm](https://www.npmjs.com/package/@zellvora/icons)

---

## Features

- **Auto-sync pipeline** — drop SVGs into `src/assets/svg/`, run `npm run sync`, done
- **Zero runtime dependencies** — pure SVG strings, no fonts, no sprite sheets
- **TypeScript-first** — full `IconName` union type, `IconProps` interface, `.d.ts` for all outputs
- **Framework adapters** — Angular (standalone + NgModule) and React components included
- **Accessible** — `aria-hidden` by default, `aria-label` + `role="img"` when a label is provided
- **Themeable** — icons use `currentColor`; color and size controlled via props or CSS
- **Dev watcher** — `npm run dev` auto-rebuilds on SVG save
- **Validation** — `npm run validate` catches naming errors, hardcoded colors, and oversized files
- **Visual preview** — `npm run preview` opens a searchable HTML icon browser

---

## Installation

```bash
npm install @zellvora/icons
```

---

## Quick start

### Vanilla JS / HTML

```js
import { getIconSvg, getSvgWithProps } from '@zellvora/icons';

// Raw SVG string
document.querySelector('#icon').innerHTML = getIconSvg('home');

// With props (size, color, class, aria-label)
document.querySelector('#icon').innerHTML = getSvgWithProps('search', {
  size: 20,
  color: '#6366f1',
  ariaLabel: 'Search',
});
```

### Angular (standalone — Angular 13–21)

```ts
// app.component.ts
import { ZvIconComponent } from '@zellvora/icons/angular';

@Component({
  standalone: true,
  imports: [ZvIconComponent],
  template: `
    <zv-icon name="home" [size]="24" />
    <zv-icon name="search" [size]="20" color="#6366f1" ariaLabel="Search" />
  `,
})
export class AppComponent {}
```

### Angular (NgModule)

```ts
// app.module.ts
import { ZvIconsModule } from '@zellvora/icons/angular';

@NgModule({ imports: [ZvIconsModule] })
export class AppModule {}
```

### React

```tsx
import { ZvIcon } from '@zellvora/icons/react';

function App() {
  return (
    <>
      <ZvIcon name="home" size={24} />
      <ZvIcon name="bell" size={20} color="tomato" ariaLabel="Notifications" />
    </>
  );
}
```

### CSS (optional base styles)

```css
/* In your global stylesheet */
@import '@zellvora/icons/dist/icons.css';
```

---

## Adding icons

1. Add your SVG file to `src/assets/svg/`  
   - Use **kebab-case** names: `arrow-right.svg`, `chevron-down.svg`  
   - Use `currentColor` for stroke/fill (not hardcoded hex values)  
   - Include a `viewBox` attribute on the root `<svg>`

2. Run sync:
   ```bash
   npm run sync
   ```
   This auto-generates `src/icon-registry.ts` and `src/icon-names.ts`.

3. Build for publish:
   ```bash
   npm run build
   ```

### Dev mode (auto-sync on save)

```bash
npm run dev
```

---

## Scripts

| Command | Description |
|---|---|
| `npm run sync` | Scan SVGs → generate registry + types |
| `npm run build` | Full build (sync → compile → types) |
| `npm run dev` | Watch mode — auto-sync + rebuild on SVG change |
| `npm run validate` | Lint SVG files for errors and warnings |
| `npm run preview` | Generate `docs/preview.html` icon browser |
| `npm run release` | Build + publish to npm |

---

## Icon props

| Prop | Type | Default | Description |
|---|---|---|---|
| `name` | `IconName` | — | Required. Icon identifier |
| `size` | `number` | `24` | Width and height in px |
| `color` | `string` | `'currentColor'` | SVG stroke/fill color |
| `className` | `string` | `''` | Additional CSS classes |
| `ariaLabel` | `string` | `''` | Accessible label. Omit for decorative icons. |

---

## Project structure

```
src/
  assets/svg/          ← Drop your SVG files here
  icon-registry.ts     ← AUTO-GENERATED (do not edit)
  icon-names.ts        ← AUTO-GENERATED (do not edit)
  types/index.ts       ← Shared TS interfaces
  utils/transform.ts   ← SVG helper utilities

scripts/
  sync-icons.js        ← Scans SVGs, writes registry
  build.js             ← Compiles CJS, ESM, Angular, React outputs
  build-types.js       ← Generates .d.ts files
  watch.js             ← Dev watcher
  validate-icons.js    ← SVG linter
  preview.js           ← HTML icon browser generator

dist/                  ← Build output (git-ignored)
  index.js             ← CommonJS
  index.esm.js         ← ESM
  index.d.ts           ← Core types
  icons.css            ← Base styles
  angular/             ← Angular component + module
  react/               ← React component

docs/
  icon-list.json       ← Icon metadata (auto-generated)
  preview.html         ← Visual icon browser (auto-generated)
```

---

## SVG guidelines

- **ViewBox**: Always include `viewBox="0 0 24 24"` (or your grid size)
- **Colors**: Use `stroke="currentColor"` or `fill="currentColor"` — never hardcoded hex
- **No fixed size**: Remove `width` and `height` px attributes from the root `<svg>`
- **Naming**: kebab-case only — `arrow-right.svg`, not `ArrowRight.svg` or `arrow_right.svg`
- **File size**: Keep under 5 KB per icon. Run SVGO for complex paths.

---

## License

MIT © [Rabin R — Zellvora Solutions](https://rabinr.in)
