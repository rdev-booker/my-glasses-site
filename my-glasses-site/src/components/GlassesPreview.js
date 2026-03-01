/* ─────────────────────────────────────────────────────────────────────────────
   GlassesPreview — lens tint overlay using multiply blend mode.

   MONOLIX architecture:
     Two separate filled frame rings + a slim bridge connector.
     Each frame ring is a filled rect; the lens glass sits on top as a
     white base (for multiply) + gradient tint overlay.
     This way the two frames read as distinct rings — like real glasses.
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

/* ── MONOLIX — Bold Square Acetate (Wayfarer-inspired) ──────────────────────
   Matches: thick matte acetate, gold/brass rivets, wide chunky tapered temples.

   ViewBox 544 × 200   scale ≈ 2.5 px/mm

   Left  ring   x=46  y=18  w=200  h=166  rx=6   right-edge=246  bottom=184
   Bridge       x=246 y=60  w=52   h=18   rx=4   (upper-third of frame)
   Right ring   x=298 y=18  w=200  h=166  rx=6   right-edge=498  bottom=184
   Left  lens   x=68  y=38  w=156  h=128  rx=4   22px sides / 20px top / 18px bot
   Right lens   x=320 y=38  w=156  h=128  rx=4
   Temple L     M46,71→131  taper→  L4,106→96   (60px → 10px, centre y=101)
   Temple R     M498,71→131 taper→  L540,106→96
   Rivets       cx=57 / cx=487   cy=55 + cy=101 + cy=147   (gold brass)
────────────────────────────────────────────────────────────────────────── */

function MonolixFrame({ lensConfig, frameColor }) {
  const fc     = resolveFrame(frameColor);
  const F      = fc.fill;
  const HI     = fc.hi;
  const RIVET  = '#c9a336';   /* gold/brass face  */
  const RIVET2 = '#8a6a1a';   /* rivet recess     */
  const TR     = 'all 0.45s ease';

  /* Three rivet cy positions: 22%, 50%, 78% of frame height (18–184) */
  const rivetY = [55, 101, 147];

  return (
    <svg
      viewBox="0 0 544 200"
      xmlns="http://www.w3.org/2000/svg"
      style={{ isolation: 'isolate' }}
      className="w-full max-w-2xl drop-shadow-[0_14px_36px_rgba(0,0,0,0.50)]"
    >
      <GradientDefs {...lensConfig} />

      <defs>
        <linearGradient id="lensSheen" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%"   stopColor="rgba(255,255,255,0.20)" />
          <stop offset="22%"  stopColor="rgba(255,255,255,0.00)" />
          <stop offset="100%" stopColor="rgba(0,0,0,0.03)"       />
        </linearGradient>
        <linearGradient id="matteAcetate" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%"   stopColor="rgba(255,255,255,0.05)" />
          <stop offset="100%" stopColor="rgba(0,0,0,0.03)" />
        </linearGradient>
      </defs>

      {/* ── Temple arms: wide-chunky-tapered ────────────────────────────────
          60 px tall at hinge, narrows dramatically to 10 px at the tip.
          Both ends share the same vertical centre (y=101).
          This "wide at hinge, thin at tip" silhouette matches the
          Wayfarer/square-acetate temple profile.                          */}

      {/* Left: x=4→46 */}
      <path d="M46,71  L46,131  L4,106  L4,96  Z" fill={F} />
      <path d="M46,71  L4,96   L4,100  L46,75 Z"  fill={HI} opacity="0.28" />
      <path d="M46,127 L46,131  L4,106  L4,103 Z"  fill="rgba(0,0,0,0.18)" />

      {/* Right: x=498→540 */}
      <path d="M498,71  L498,131 L540,106 L540,96 Z" fill={F} />
      <path d="M498,71  L540,96  L540,100 L498,75 Z" fill={HI} opacity="0.28" />
      <path d="M498,127 L498,131 L540,106 L540,103 Z" fill="rgba(0,0,0,0.18)" />

      {/* ── Left frame ring: 200×166, rx=6 ─────────────────────────────── */}
      <rect x="46"  y="18" width="200" height="166" rx="6" fill={F} />
      <rect x="46"  y="18" width="200" height="166" rx="6" fill="url(#matteAcetate)" />
      <rect x="46"  y="18" width="200" height="6"   rx="6" fill={HI} opacity="0.30" />
      {/* Outer-edge side-face depth cue */}
      <rect x="46"  y="18" width="6"   height="166" rx="6" fill="rgba(0,0,0,0.12)" />
      {fc.crystal && <rect x="46" y="18" width="200" height="166" rx="6"
        fill="none" stroke="rgba(140,178,216,0.82)" strokeWidth="2" />}

      {/* ── Right frame ring ─────────────────────────────────────────────── */}
      <rect x="298" y="18" width="200" height="166" rx="6" fill={F} />
      <rect x="298" y="18" width="200" height="166" rx="6" fill="url(#matteAcetate)" />
      <rect x="298" y="18" width="200" height="6"   rx="6" fill={HI} opacity="0.30" />
      <rect x="492" y="18" width="6"   height="166" rx="6" fill="rgba(0,0,0,0.12)" />
      {fc.crystal && <rect x="298" y="18" width="200" height="166" rx="6"
        fill="none" stroke="rgba(140,178,216,0.82)" strokeWidth="2" />}

      {/* ── Bridge ──────────────────────────────────────────────────────── */}
      <rect x="246" y="60" width="52" height="18" rx="4" fill={F} />
      <rect x="246" y="60" width="52" height="6"  rx="4" fill={HI} opacity="0.26" />

      {/* ── Left lens glass  (156×128 — bold wide rectangle) ────────────── */}
      <rect x="68"  y="38" width="156" height="128" rx="4" fill="white" />
      <rect x="68"  y="38" width="156" height="128" rx="4"
            fill="url(#lensLeft)" style={{ mixBlendMode: 'multiply', transition: TR }} />
      <rect x="68"  y="38" width="156" height="128" rx="4" fill="url(#lensSheen)" />
      <rect x="68"  y="38" width="156" height="128" rx="4"
            fill="none" stroke="rgba(0,0,0,0.18)" strokeWidth="2" />

      {/* ── Right lens glass ─────────────────────────────────────────────── */}
      <rect x="320" y="38" width="156" height="128" rx="4" fill="white" />
      <rect x="320" y="38" width="156" height="128" rx="4"
            fill="url(#lensRight)" style={{ mixBlendMode: 'multiply', transition: TR }} />
      <rect x="320" y="38" width="156" height="128" rx="4" fill="url(#lensSheen)" />
      <rect x="320" y="38" width="156" height="128" rx="4"
            fill="none" stroke="rgba(0,0,0,0.18)" strokeWidth="2" />

      {/* ── Gold/brass rivets on outer rim face ──────────────────────────────
          Matches "Gold / brass rivets & hinges" hardware spec.
          Left  rim x=46→68  (22 px) → cx=57
          Right rim x=476→498 (22 px) → cx=487
          3 rivets per side at 22 % / 50 % / 78 % of frame height         */}
      {rivetY.map(cy => (
        <g key={cy}>
          <circle cx="57"  cy={cy} r="5.5" fill={RIVET}  />
          <circle cx="57"  cy={cy} r="2.4" fill={RIVET2} />
          <circle cx="487" cy={cy} r="5.5" fill={RIVET}  />
          <circle cx="487" cy={cy} r="2.4" fill={RIVET2} />
        </g>
      ))}

      {/* ── Lens glare bar ───────────────────────────────────────────────── */}
      <rect x="82"  y="50" width="44" height="7" rx="3.5" fill="white" fillOpacity="0.40" />
      <rect x="334" y="50" width="44" height="7" rx="3.5" fill="white" fillOpacity="0.40" />

      <text x="518" y="104" fontSize="6" fill="rgba(255,255,255,0.06)"
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
