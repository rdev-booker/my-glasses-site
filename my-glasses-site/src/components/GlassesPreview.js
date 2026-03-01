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

/* ── MONOLIX — Bold Square Acetate (Wayfarer / Luxury Sunglasses) ────────────
   Matches spec sheet: thick matte acetate, bold top brow bar, gold/brass
   rivets, wide-chunky-tapered temple arms.

   ViewBox 560 × 210   (scale ≈ 2.5 px/mm)

   Left  ring   x=44  y=16  w=210  h=170  rx=6   right-edge=254  bottom=186
   Bridge       x=254 y=62  w=52   h=18   rx=4
   Right ring   x=306 y=16  w=210  h=170  rx=6   right-edge=516  bottom=186
   Left  lens   x=66  y=41  w=166  h=127  rx=4   22px sides / 25px top / 18px bot
   Right lens   x=328 y=41  w=166  h=127  rx=4
   Temple L     M44,69→134  taper→  L4,107→95    (65px → 12px, centre y=101)
   Temple R     M516,69→134 taper→  L556,107→95
   Rivets       cx=55 / cx=505   cy=67 + cy=101 + cy=135   (gold brass)
────────────────────────────────────────────────────────────────────────── */

function MonolixFrame({ lensConfig, frameColor }) {
  const fc     = resolveFrame(frameColor);
  const F      = fc.fill;
  const HI     = fc.hi;
  const RIVET  = '#c9a336';   /* gold/brass face   */
  const RIVET2 = '#8a6a1a';   /* rivet recess      */
  const TR     = 'all 0.45s ease';

  return (
    <svg
      viewBox="0 0 560 210"
      xmlns="http://www.w3.org/2000/svg"
      style={{ isolation: 'isolate' }}
      className="w-full max-w-2xl drop-shadow-[0_16px_40px_rgba(0,0,0,0.55)]"
    >
      <GradientDefs {...lensConfig} />

      <defs>
        {/* Matte acetate face — near-zero gradient */}
        <linearGradient id="matteAcetate" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%"   stopColor="rgba(255,255,255,0.05)" />
          <stop offset="100%" stopColor="rgba(0,0,0,0.04)" />
        </linearGradient>
        {/* Lens inner sheen */}
        <linearGradient id="lensSheen" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%"   stopColor="rgba(255,255,255,0.22)" />
          <stop offset="25%"  stopColor="rgba(255,255,255,0.00)" />
          <stop offset="100%" stopColor="rgba(0,0,0,0.03)"       />
        </linearGradient>
      </defs>

      {/* ════════════════════════════════════════════════════════════════════
          TEMPLE ARMS — wide-chunky-tapered
          65 px tall at hinge (x=44/516), 12 px at tip (x=4/556).
          Both ends share vertical centre y=101.
          This aggressive taper is the defining silhouette of the
          Wayfarer / bold-square temple arm.
          ═══════════════════════════════════════════════════════════════════ */}

      {/* Left temple: x=4 → 44 */}
      <path d="M44,69  L44,134 L4,107  L4,95  Z" fill={F} />
      {/* Top-face sheen */}
      <path d="M44,69  L4,95  L4,99  L44,73 Z"   fill={HI} opacity="0.30" />
      {/* Bottom-edge shadow */}
      <path d="M44,130 L44,134 L4,107 L4,104 Z"  fill="rgba(0,0,0,0.22)" />

      {/* Right temple: x=516 → 556 */}
      <path d="M516,69  L516,134 L556,107  L556,95  Z" fill={F} />
      <path d="M516,69  L556,95  L556,99  L516,73 Z"   fill={HI} opacity="0.30" />
      <path d="M516,130 L516,134 L556,107 L556,104 Z"  fill="rgba(0,0,0,0.22)" />

      {/* ════════════════════════════════════════════════════════════════════
          LEFT FRAME RING — 210 × 170 px, rx=6
          Rim: 22px sides · 25px top (bold brow bar) · 18px bottom
          ═══════════════════════════════════════════════════════════════════ */}
      <rect x="44"  y="16" width="210" height="170" rx="6" fill={F} />
      <rect x="44"  y="16" width="210" height="170" rx="6" fill="url(#matteAcetate)" />
      {/* Bold brow bar top highlight */}
      <rect x="44"  y="16" width="210" height="7"   rx="6" fill={HI} opacity="0.28" />
      {/* Left outer side-face depth */}
      <rect x="44"  y="16" width="7"   height="170" rx="6" fill="rgba(0,0,0,0.14)" />
      {fc.crystal && <rect x="44" y="16" width="210" height="170" rx="6"
        fill="none" stroke="rgba(140,178,216,0.82)" strokeWidth="2" />}

      {/* ════════════════════════════════════════════════════════════════════
          RIGHT FRAME RING
          ═══════════════════════════════════════════════════════════════════ */}
      <rect x="306" y="16" width="210" height="170" rx="6" fill={F} />
      <rect x="306" y="16" width="210" height="170" rx="6" fill="url(#matteAcetate)" />
      <rect x="306" y="16" width="210" height="7"   rx="6" fill={HI} opacity="0.28" />
      {/* Right outer side-face depth */}
      <rect x="509" y="16" width="7"   height="170" rx="6" fill="rgba(0,0,0,0.14)" />
      {fc.crystal && <rect x="306" y="16" width="210" height="170" rx="6"
        fill="none" stroke="rgba(140,178,216,0.82)" strokeWidth="2" />}

      {/* ════════════════════════════════════════════════════════════════════
          BRIDGE — slim solid-acetate connector
          ═══════════════════════════════════════════════════════════════════ */}
      <rect x="254" y="62" width="52" height="18" rx="4" fill={F} />
      <rect x="254" y="62" width="52" height="6"  rx="4" fill={HI} opacity="0.24" />

      {/* ════════════════════════════════════════════════════════════════════
          LEFT LENS GLASS — 166 × 127 px, rx=4 (bold wide rectangle)
          White base for multiply-blend tint
          ═══════════════════════════════════════════════════════════════════ */}
      <rect x="66"  y="41" width="166" height="127" rx="4" fill="white" />
      <rect x="66"  y="41" width="166" height="127" rx="4"
            fill="url(#lensLeft)" style={{ mixBlendMode: 'multiply', transition: TR }} />
      <rect x="66"  y="41" width="166" height="127" rx="4" fill="url(#lensSheen)" />
      <rect x="66"  y="41" width="166" height="127" rx="4"
            fill="none" stroke="rgba(0,0,0,0.20)" strokeWidth="1.5" />

      {/* ════════════════════════════════════════════════════════════════════
          RIGHT LENS GLASS
          ═══════════════════════════════════════════════════════════════════ */}
      <rect x="328" y="41" width="166" height="127" rx="4" fill="white" />
      <rect x="328" y="41" width="166" height="127" rx="4"
            fill="url(#lensRight)" style={{ mixBlendMode: 'multiply', transition: TR }} />
      <rect x="328" y="41" width="166" height="127" rx="4" fill="url(#lensSheen)" />
      <rect x="328" y="41" width="166" height="127" rx="4"
            fill="none" stroke="rgba(0,0,0,0.20)" strokeWidth="1.5" />

      {/* ════════════════════════════════════════════════════════════════════
          GOLD / BRASS RIVETS — 3 per side, on the outer rim face
          Left  outer rim x=44→66  (22 px) → cx=55
          Right outer rim x=494→516 (22 px) → cx=505
          Positioned at 30 % / 59 % / 79 % of frame height (y=16→186)
          ═══════════════════════════════════════════════════════════════════ */}
      {[67, 101, 135].map(cy => (
        <g key={cy}>
          <circle cx="55"  cy={cy} r="5.5" fill={RIVET}  />
          <circle cx="55"  cy={cy} r="2.4" fill={RIVET2} />
          <circle cx="505" cy={cy} r="5.5" fill={RIVET}  />
          <circle cx="505" cy={cy} r="2.4" fill={RIVET2} />
        </g>
      ))}

      {/* ════════════════════════════════════════════════════════════════════
          LENS GLARE — single soft highlight bar (silver mirror effect)
          ═══════════════════════════════════════════════════════════════════ */}
      <rect x="82"  y="54" width="60" height="8" rx="4" fill="white" fillOpacity="0.44" />
      <rect x="344" y="54" width="60" height="8" rx="4" fill="white" fillOpacity="0.44" />

      {/* Faint DITA branding on right temple */}
      <text x="534" y="105" fontSize="6" fill="rgba(255,255,255,0.06)"
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
