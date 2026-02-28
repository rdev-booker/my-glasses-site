# Skill Reference — Bi-Gradient Blending & Color Interpolation

## 1. SVG Linear Gradient Primer

An SVG `<linearGradient>` defines a vector along which color stops are placed.

```xml
<linearGradient id="lensLeft" x1="0" y1="0" x2="0" y2="1">
  <stop offset="0%"   stop-color="#7b2d8b" stop-opacity="0.7" />
  <stop offset="100%" stop-color="#1a2744" stop-opacity="0.7" />
</linearGradient>
```

- `x1/y1` → start point, `x2/y2` → end point (as fractions of the bounding box).
- `y1=0, y2=1` produces a **top-to-bottom** gradient — the axis used for tinted lenses.
- The filled element references it via `fill="url(#lensLeft)"`.

---

## 2. Tint Style Logic

### Solid
All four stop offsets collapse to a single color at a constant opacity.

```js
// Both stops = same color, same opacity → no visible gradient
<stop offset="0%"   stopColor={c1} stopOpacity={opacity} />
<stop offset="100%" stopColor={c1} stopOpacity={opacity} />
```

### Gradient (top-to-bottom fade)
The color fades from full density at the top to near-transparent at the bottom,
mimicking a sunglass flash-coat.

```js
const fadeOpacity = (density * 0.15) / 100;   // bottom is ~15% of top value

<stop offset="0%"   stopColor={c1} stopOpacity={opacity}    />
<stop offset="100%" stopColor={c1} stopOpacity={fadeOpacity} />
```

### Bi-Gradient
Two distinct colors are blended across the lens. The **Tolerance** slider controls
how gradually they transition.

---

## 3. Bi-Gradient: The Four-Stop System

```
offset=0%    ── color1 at full opacity  (hard start)
offset=mid1  ── color1 at full opacity  (color1 holds until here)
offset=mid2  ── color2 at full opacity  (color2 takes over from here)
offset=100%  ── color2 at full opacity  (hard end)
```

`mid1` and `mid2` are derived from the **tolerance** value (0–100):

```js
const t    = tolerance / 100;              // 0.0 → 1.0
const mid1 = (0.5 - t * 0.5) * 100;       // e.g. tolerance=60 → mid1=20%
const mid2 = (0.5 + t * 0.5) * 100;       //                    → mid2=80%
```

### Tolerance Spectrum

| Tolerance | mid1  | mid2  | Visual Result                  |
|-----------|-------|-------|-------------------------------|
| 0         | 50%   | 50%   | Hard edge — two solid halves  |
| 30        | 35%   | 65%   | Narrow blend zone             |
| 60        | 20%   | 80%   | Soft, diffuse transition       |
| 100       | 0%    | 100%  | Full gradient across lens      |

### JSX Implementation

```jsx
const mid1 = `${((0.5 - t * 0.5) * 100).toFixed(0)}%`;
const mid2 = `${((0.5 + t * 0.5) * 100).toFixed(0)}%`;

<linearGradient id={id} x1="0" y1="0" x2="0" y2="1">
  <stop offset="0%"   stopColor={c1} stopOpacity={op} />
  <stop offset={mid1} stopColor={c1} stopOpacity={op} />   {/* plateau end   */}
  <stop offset={mid2} stopColor={c2} stopOpacity={op} />   {/* plateau start */}
  <stop offset="100%" stopColor={c2} stopOpacity={op} />
</linearGradient>
```

The two inner stops create a **plateau** for each color before blending begins.
Removing them (two-stop gradient) would always produce a full, mushy blend regardless
of tolerance.

---

## 4. Density → Opacity Mapping

```
density (0–100)  →  stopOpacity (0.0–1.0)

opacity = density / 100

Presets:
  Whisper  → 0.15   (barely tinted, high UV-clear look)
  Light    → 0.35
  Medium   → 0.50
  Bold     → 0.70
  Opaque   → 0.90   (mirrored/reflective feel)
```

---

## 5. Color Interpolation (Swatch System)

Colors are stored as hex strings. No runtime interpolation between swatches is needed
because changing the active color swaps the gradient stop immediately. SVG repaints
the fill on the next frame.

The **perceived smooth wash** comes from CSS:

```css
/* Applied via Tailwind on the SVG <rect> elements */
transition-all duration-500   →   transition: all 0.5s ease;
```

This smoothly animates any CSS-animatable property on the element (opacity,
transform, filter). Note: `fill="url(#...)"` itself is not CSS-interpolated by
browsers — the gradient definition updates instantly, but the lens rect's `opacity`
or `filter` wrapper can still animate to provide a visual wash effect.

For production-grade animated color interpolation between swatches:
1. Drive `stopColor` via CSS custom properties (`var(--lens-color)`).
2. Transition the custom property with `@property` (Chrome 85+, FF 128+).
3. Or use a JS `requestAnimationFrame` loop to lerp between hex values.

---

## 6. Left / Right Independence

Each lens owns its own state slice:

```js
lensConfig.left  = { colorIdx, color2Idx, density }
lensConfig.right = { colorIdx, color2Idx, density }
```

The `activeLens` toggle (`'left'` | `'right'`) determines which slice the config
panel reads and writes. The SVG always renders **both** gradients simultaneously,
so the inactive lens retains its last configuration while the user edits the other.

---

## 7. Edge Cases

| Scenario                        | Behaviour                                              |
|---------------------------------|--------------------------------------------------------|
| tolerance=0, Bi-Gradient        | Hard midline — looks like two solid-color halves        |
| density=0                       | Fully transparent lens (clear optical look)            |
| color1 === color2, Bi-Gradient  | Renders identically to Solid at the same density       |
| Switching style → Solid         | Both color2 and tolerance controls hide; no re-render artifacts |
