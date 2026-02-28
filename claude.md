# DITA MONOLIX — Lens Customizer

## Project Overview

A luxury single-page demo allowing customers to configure optical tints on the DITA MONOLIX
frames in real-time. The frame is rendered as a hand-crafted SVG; each lens is a discrete
`<rect>` path filled by a `<linearGradient>` so tint changes update instantly without
reloading an image.

---

## Tech Stack

| Concern        | Tool                          |
|----------------|-------------------------------|
| Framework      | React 18 (CRA or Vite)        |
| Styling        | Tailwind CSS v3               |
| Icons          | Lucide React                  |
| State          | React `useState`              |
| Visuals        | Inline SVG with dynamic defs  |

---

## File Structure

```
src/
  App.js          ← main component (all-in-one for demo purposes)
  index.js        ← standard CRA entry
  index.css       ← @tailwind directives
public/
  index.html
claude.md         ← this file
skill.md          ← gradient / color-math reference
```

---

## Key State Shape

```js
const [lensConfig, setLensConfig] = useState({
  style:       'Solid',            // 'Solid' | 'Gradient' | 'Bi-Gradient'
  left:  { colorIdx: 0, color2Idx: 2, density: 50 },
  right: { colorIdx: 1, color2Idx: 3, density: 50 },
  tolerance:   60,                 // 0–100, controls blend softness
  activeLens: 'left',              // which lens the panel edits
});
```

---

## Technical Roadmap

### Phase 1 — Structure (done)
- [x] Split-screen layout (SVG left, config panel right)
- [x] SVG MONOLIX frame with independent left/right lens paths
- [x] `<defs>` block with two named `<linearGradient>` elements
- [x] Lens fills reference `url(#lensLeft)` / `url(#lensRight)`

### Phase 2 — Interactivity (done)
- [x] Tint style tabs: Solid / Gradient / Bi-Gradient
- [x] 10-color luxury swatch picker (color name displayed)
- [x] Density presets (Whisper → Opaque) + fine-tune slider
- [x] Bi-Gradient: left/right toggle, independent color1 + color2
- [x] Tolerance slider → controls gradient stop offsets

### Phase 3 — Polish (done)
- [x] `transition-all duration-500` on lens paths for smooth wash
- [x] Subtle lens glare highlight (static white rect, low opacity)
- [x] Luxury typographic hierarchy (tracking, weight, uppercase)
- [x] "Save Configuration" CTA footer

### Phase 4 — Production Extensions (future)
- [ ] Persist config to URL params for shareable links
- [ ] Backend API call to generate a PDF spec sheet
- [ ] 3D frame model via Three.js / model-viewer
- [ ] A/B compare mode (ghost overlay of previous config)

---

## Dependencies

```bash
npm install lucide-react
# Tailwind CSS — follow https://tailwindcss.com/docs/guides/create-react-app
```

---

## Gradient ID Convention

| Gradient ID   | Fills         |
|---------------|---------------|
| `#lensLeft`   | Left lens rect  |
| `#lensRight`  | Right lens rect |

Both gradients are re-computed on every render from `lensConfig` state, giving
real-time updates with zero additional animation libraries.
