/* ─────────────────────────────────────────────────────────────────────────────
   GlassesPreview — lens tint overlay using multiply blend mode.
───────────────────────────────────────────────────────────────────────────── */

const FRAME_PALETTE = {
  'Black':        { fill: '#111111', hi: '#2e2e2e', crystal: false },
  'Dusk Blue':    { fill: '#1b2d4a', hi: '#2e4a72', crystal: false },
  'Navy':         { fill: '#0d1b35', hi: '#1a2d50', crystal: false },
  'Crystal':      { fill: 'rgba(205,218,234,0.46)', hi: 'rgba(228,238,250,0.58)', crystal: true  },
  'Tortoise':     { fill: '#5a3316', hi: '#7a4e28', crystal: false },
  'Gold':         { fill: '#b8922a', hi: '#d4aa3c', crystal: false },
  'Silver':       { fill: '#78788a', hi: '#9a9aac', crystal: false },
  'Gunmetal':     { fill: '#38383f', hi: '#4e4e58', crystal: false },
  'Rose Gold':    { fill: '#aa6a58', hi: '#c48878', crystal: false },
  'Antique Gold': { fill: '#8a7040', hi: '#a08850', crystal: false },
};

function resolveFrame(name) {
  return FRAME_PALETTE[name] || FRAME_PALETTE['Black'];
}

/* ── Shared gradient definitions ─────────────────────────────────────────── */
function GradientDefs({ style, left, right, tolerance }) {
  const t    = tolerance / 100;
  const mid1 = `${((0.5 - t * 0.5) * 100).toFixed(0)}%`;
  const mid2 = `${((0.5 + t * 0.5) * 100).toFixed(0)}%`;

  const buildGrad = (id, lens) => {
    const c1     = lens.color  || '#0d0d1a';
    const c2     = lens.color2 || '#1a2744';
    const op     = (lens.density / 100).toFixed(2);
    const fadeOp = ((lens.density * 0.08) / 100).toFixed(2);
    if (style === 'Solid') return (
      <linearGradient key={id} id={id} x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%"   stopColor={c1} stopOpacity={op} />
        <stop offset="100%" stopColor={c1} stopOpacity={op} />
      </linearGradient>
    );
    if (style === 'Gradient') return (
      <linearGradient key={id} id={id} x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%"   stopColor={c1} stopOpacity={op}     />
        <stop offset="100%" stopColor={c1} stopOpacity={fadeOp} />
      </linearGradient>
    );
    return (
      <linearGradient key={id} id={id} x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%"   stopColor={c1} stopOpacity={op} />
        <stop offset={mid1} stopColor={c1} stopOpacity={op} />
        <stop offset={mid2} stopColor={c2} stopOpacity={op} />
        <stop offset="100%" stopColor={c2} stopOpacity={op} />
      </linearGradient>
    );
  };

  return <defs>{buildGrad('lensLeft', left)}{buildGrad('lensRight', right)}</defs>;
}

/* ── MONOLIX — Bold Square Acetate ──────────────────────────────────────────
   Architecture: stroke-around-lens (same as GRANDMASTER) — the acetate
   frame is a thick stroke border; the lens opening is the rect interior.
   This avoids the "two black squares" look of the filled-rect approach.

   strokeWidth=36 → 18 px visible acetate rim outside each lens rect.

   ViewBox 552 × 202

   Left  lens rect   x=70  y=36  w=160  h=130  rx=5
   Left  frame outer x=52  y=18  w=196  h=166
   Bridge            x=248 y=62  w=56   h=18   rx=4   (52mm visible gap)
   Right lens rect   x=322 y=36  w=160  h=130  rx=5
   Right frame outer x=304 y=18  w=196  h=166
   Temple L          M52,74→128   taper→  L6,109→93    (54px→16px, cy=101)
   Temple R          M500,74→128  taper→  L546,109→93
   Rivets            cx=61 / cx=491   cy=60+101+142   gold brass
────────────────────────────────────────────────────────────────────────── */

function MonolixFrame({ lensConfig, frameColor }) {
  const fc     = resolveFrame(frameColor);
  const F      = fc.fill;
  const HI     = fc.hi;
  const RIVET  = '#c9a336';
  const RIVET2 = '#8a6a1a';
  const SW     = 36;           /* thick acetate: 18 px visible rim */
  const TR     = 'all 0.45s ease';

  return (
    <svg
      viewBox="0 0 552 202"
      xmlns="http://www.w3.org/2000/svg"
      style={{ isolation: 'isolate' }}
      className="w-full max-w-2xl drop-shadow-[0_16px_40px_rgba(0,0,0,0.55)]"
    >
      <GradientDefs {...lensConfig} />

      <defs>
        <linearGradient id="lensSheen" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%"   stopColor="rgba(255,255,255,0.22)" />
          <stop offset="26%"  stopColor="rgba(255,255,255,0.00)" />
          <stop offset="100%" stopColor="rgba(0,0,0,0.03)"       />
        </linearGradient>
      </defs>

      {/* ══ TEMPLE ARMS ═══════════════════════════════════════════════════════
          Drawn FIRST so the frame stroke (rendered after) caps the hinge end
          seamlessly — the stroke naturally "absorbs" the wide temple end.

          Wide at hinge (54 px), tapers to slim at tip (16 px).
          Both ends share vertical centre y = 101.
          ═════════════════════════════════════════════════════════════════════ */}

      {/* Left: x=6→52.  Top edge slopes gently downward (→ natural taper) */}
      <path d="M52,74  L52,128 L6,109  L6,93  Z" fill={F} />
      {/* Top-surface sheen: the flat upper face of the thick arm */}
      <path d="M52,74  L6,93   L6,97   L52,78 Z" fill={HI} opacity="0.30" />
      {/* Bottom-edge shadow */}
      <path d="M52,124 L52,128 L6,109  L6,106 Z" fill="rgba(0,0,0,0.22)" />

      {/* Right: x=500→546 */}
      <path d="M500,74  L500,128 L546,109 L546,93  Z" fill={F} />
      <path d="M500,74  L546,93  L546,97  L500,78 Z"  fill={HI} opacity="0.30" />
      <path d="M500,124 L500,128 L546,109 L546,106 Z" fill="rgba(0,0,0,0.22)" />

      {/* ══ BRIDGE ════════════════════════════════════════════════════════════
          Solid acetate connector between the two frame outer right/left edges.
          x=248 (left outer right) → x=304 (right outer left) = 56 px gap.
          ═════════════════════════════════════════════════════════════════════ */}
      <rect x="248" y="62" width="56" height="18" rx="4" fill={F} />
      <rect x="248" y="62" width="56" height="6"  rx="4" fill={HI} opacity="0.22" />

      {/* ══ LEFT FRAME — stroke approach ══════════════════════════════════════
          1. Thick stroke (SW=36) renders 18 px outside the rect as acetate rim
          2. White fill draws ON TOP, covering the inner 18 px of stroke
          3. Tint overlay with multiply blend mode
          Result: clean lens glass inside, solid acetate border outside.
          ═════════════════════════════════════════════════════════════════════ */}
      <rect x="70" y="36" width="160" height="130" rx="5"
            fill="none" stroke={F} strokeWidth={SW} />
      {fc.crystal && (
        <rect x="70" y="36" width="160" height="130" rx="5"
              fill="none" stroke="rgba(140,178,216,0.70)" strokeWidth={SW - 2} />
      )}
      <rect x="70" y="36" width="160" height="130" rx="5" fill="white" />
      <rect x="70" y="36" width="160" height="130" rx="5"
            fill="url(#lensLeft)" style={{ mixBlendMode: 'multiply', transition: TR }} />
      <rect x="70" y="36" width="160" height="130" rx="5" fill="url(#lensSheen)" />
      <rect x="70" y="36" width="160" height="130" rx="5"
            fill="none" stroke="rgba(0,0,0,0.18)" strokeWidth="1.5" />

      {/* ══ RIGHT FRAME ════════════════════════════════════════════════════════ */}
      <rect x="322" y="36" width="160" height="130" rx="5"
            fill="none" stroke={F} strokeWidth={SW} />
      {fc.crystal && (
        <rect x="322" y="36" width="160" height="130" rx="5"
              fill="none" stroke="rgba(140,178,216,0.70)" strokeWidth={SW - 2} />
      )}
      <rect x="322" y="36" width="160" height="130" rx="5" fill="white" />
      <rect x="322" y="36" width="160" height="130" rx="5"
            fill="url(#lensRight)" style={{ mixBlendMode: 'multiply', transition: TR }} />
      <rect x="322" y="36" width="160" height="130" rx="5" fill="url(#lensSheen)" />
      <rect x="322" y="36" width="160" height="130" rx="5"
            fill="none" stroke="rgba(0,0,0,0.18)" strokeWidth="1.5" />

      {/* ══ BROW-BAR TOP SHEEN ════════════════════════════════════════════════
          Faint highlight strip along the very top of each frame outer edge,
          simulating ambient light catching the flat top surface of the acetate.
          ═════════════════════════════════════════════════════════════════════ */}
      <rect x="52"  y="18" width="196" height="6" rx="4" fill={HI} opacity="0.26" />
      <rect x="304" y="18" width="196" height="6" rx="4" fill={HI} opacity="0.26" />

      {/* ══ GOLD / BRASS RIVETS ═══════════════════════════════════════════════
          3 per side on the outer rim face.
          Left  rim: x=52→70  (18 px) → cx=61
          Right rim: x=482→500 (18 px) → cx=491
          cy at 25 % / 50 % / 75 % of frame height (18–184, h=166)
          ═════════════════════════════════════════════════════════════════════ */}
      {[60, 101, 142].map(cy => (
        <g key={cy}>
          <circle cx="61"  cy={cy} r="5.5" fill={RIVET}  />
          <circle cx="61"  cy={cy} r="2.4" fill={RIVET2} />
          <circle cx="491" cy={cy} r="5.5" fill={RIVET}  />
          <circle cx="491" cy={cy} r="2.4" fill={RIVET2} />
        </g>
      ))}

      {/* ══ LENS GLARE ════════════════════════════════════════════════════════ */}
      <rect x="84"  y="50" width="52" height="8" rx="4" fill="white" fillOpacity="0.44" />
      <rect x="336" y="50" width="52" height="8" rx="4" fill="white" fillOpacity="0.44" />

      <text x="524" y="104" fontSize="6" fill="rgba(255,255,255,0.06)"
            fontFamily="serif" letterSpacing="1.5" textAnchor="middle"
            style={{ userSelect: 'none' }}>DITA</text>
    </svg>
  );
}

/* ── GRANDMASTER — aviator / teardrop ─────────────────────────────────────── */
function GrandmasterFrame({ lensConfig, frameColor }) {
  const fc    = resolveFrame(frameColor);
  const FRAME = fc.fill;
  const EDGE  = fc.hi;
  const TR    = 'all 0.45s ease';
  const leftLens  = 'M 43,50 Q 43,38 55,34 L 235,34 Q 248,34 250,50 L 252,130 Q 252,175 200,178 L 97,178 Q 44,178 43,130 Z';
  const rightLens = 'M 308,50 Q 308,38 320,34 L 500,34 Q 513,34 515,50 L 516,130 Q 516,175 464,178 L 360,178 Q 308,178 308,130 Z';
  return (
    <svg viewBox="0 0 560 220" xmlns="http://www.w3.org/2000/svg"
         style={{ isolation: 'isolate' }}
         className="w-full max-w-xl drop-shadow-[0_20px_56px_rgba(0,0,0,0.45)]">
      <GradientDefs {...lensConfig} />
      <defs>
        <clipPath id="leftClip">  <path d={leftLens}  /> </clipPath>
        <clipPath id="rightClip"> <path d={rightLens} /> </clipPath>
      </defs>
      <line x1="43"  y1="50" x2="4"   y2="28" stroke={EDGE} strokeWidth="8" strokeLinecap="round" />
      <line x1="515" y1="50" x2="556" y2="28" stroke={EDGE} strokeWidth="8" strokeLinecap="round" />
      <line x1="252" y1="34" x2="308" y2="34" stroke={EDGE} strokeWidth="6" strokeLinecap="round" />
      <path d={leftLens}  fill="none" stroke={FRAME} strokeWidth="9" />
      <path d={leftLens}  fill="white" />
      <path d={leftLens}  fill="url(#lensLeft)"  style={{ mixBlendMode: 'multiply', transition: TR }} />
      <rect x="58" y="48" width="50" height="9" rx="3" fill="white" fillOpacity="0.45" clipPath="url(#leftClip)" />
      <path d={rightLens} fill="none" stroke={FRAME} strokeWidth="9" />
      <path d={rightLens} fill="white" />
      <path d={rightLens} fill="url(#lensRight)" style={{ mixBlendMode: 'multiply', transition: TR }} />
      <rect x="323" y="48" width="50" height="9" rx="3" fill="white" fillOpacity="0.45" clipPath="url(#rightClip)" />
      <path d="M252 60 Q280 52 308 60" stroke={EDGE} strokeWidth="7" fill="none" strokeLinecap="round" />
      <ellipse cx="258" cy="88" rx="4" ry="6" fill={EDGE} opacity="0.6" />
      <ellipse cx="302" cy="88" rx="4" ry="6" fill={EDGE} opacity="0.6" />
    </svg>
  );
}

/* ── LANCIER — slim rectangle ─────────────────────────────────────────────── */
function LancierFrame({ lensConfig, frameColor }) {
  const fc    = resolveFrame(frameColor);
  const FRAME = fc.fill;
  const EDGE  = fc.hi;
  const TR    = 'all 0.45s ease';
  return (
    <svg viewBox="0 0 560 200" xmlns="http://www.w3.org/2000/svg"
         style={{ isolation: 'isolate' }}
         className="w-full max-w-xl drop-shadow-[0_20px_56px_rgba(0,0,0,0.45)]">
      <GradientDefs {...lensConfig} />
      {/* Temples: nearly flat (4px drop over 34px run ≈ 7°) */}
      <line x1="36"  y1="102" x2="2"   y2="106" stroke={EDGE} strokeWidth="8" strokeLinecap="round" />
      <line x1="524" y1="102" x2="558" y2="106" stroke={EDGE} strokeWidth="8" strokeLinecap="round" />
      <rect x="254" y="88" width="52" height="7" rx="3" fill={EDGE} />
      <rect x="36"  y="54" width="218" height="96" rx="4" fill="none" stroke={FRAME} strokeWidth="9" />
      <rect x="44"  y="62" width="202" height="80" rx="2" fill="white" />
      <rect x="44"  y="62" width="202" height="80" rx="2" fill="url(#lensLeft)"  style={{ mixBlendMode: 'multiply', transition: TR }} />
      <rect x="60"  y="74" width="64"  height="8"  rx="3" fill="white" fillOpacity="0.45" />
      <rect x="306" y="54" width="218" height="96" rx="4" fill="none" stroke={FRAME} strokeWidth="9" />
      <rect x="314" y="62" width="202" height="80" rx="2" fill="white" />
      <rect x="314" y="62" width="202" height="80" rx="2" fill="url(#lensRight)" style={{ mixBlendMode: 'multiply', transition: TR }} />
      <rect x="330" y="74" width="64"  height="8"  rx="3" fill="white" fillOpacity="0.45" />
      <ellipse cx="256" cy="120" rx="3" ry="4" fill={EDGE} opacity="0.5" />
      <ellipse cx="304" cy="120" rx="3" ry="4" fill={EDGE} opacity="0.5" />
    </svg>
  );
}

/* ── Public component ─────────────────────────────────────────────────────── */
export default function GlassesPreview({ svgType, lensConfig, frameColor }) {
  switch (svgType) {
    case 'grandmaster': return <GrandmasterFrame lensConfig={lensConfig} frameColor={frameColor} />;
    case 'lancier':     return <LancierFrame     lensConfig={lensConfig} frameColor={frameColor} />;
    default:            return <MonolixFrame     lensConfig={lensConfig} frameColor={frameColor} />;
  }
}
