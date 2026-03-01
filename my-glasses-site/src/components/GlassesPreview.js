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

/* ── MONOLIX — DITA DTX750 ───────────────────────────────────────────────────
   Ultra-thick acetate frame matching real DITA MONOLIX proportions.
   Two frame rings each with ~42px rim all sides (thick slab look).
   No protruding hinge hardware — flush silver screws on frame face only.

   Scale ≈ 2.5 px/mm.  ViewBox 540 × 210.

   Left  ring   x=44  y=24  w=204  h=158  rx=10   right-edge = 248
   Bridge       x=248 y=70  w=44   h=18   rx=6    (slim connector)
   Right ring   x=292 y=24  w=204  h=158  rx=10   right-edge = 496
   Left  lens   x=86  y=57  w=120  h=90   rx=7    (42px sides, 33px top/bot)
   Right lens   x=334 y=57  w=120  h=90   rx=7
   Temples      x≈2…44 left,  x≈496…538 right,  40px tall, nearly flat
────────────────────────────────────────────────────────────────────────── */

function MonolixFrame({ lensConfig, frameColor }) {
  const fc    = resolveFrame(frameColor);
  const F     = fc.fill;
  const HI    = fc.hi;
  const SCREW = '#c0c0c0';   // silver screw face
  const SCREW2 = '#888';     // screw recess
  const TR    = 'all 0.45s ease';

  return (
    <svg
      viewBox="0 0 540 210"
      xmlns="http://www.w3.org/2000/svg"
      style={{ isolation: 'isolate' }}
      className="w-full max-w-2xl drop-shadow-[0_14px_36px_rgba(0,0,0,0.50)]"
    >
      <GradientDefs {...lensConfig} />

      <defs>
        <linearGradient id="lensSheen" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%"   stopColor="rgba(255,255,255,0.22)" />
          <stop offset="20%"  stopColor="rgba(255,255,255,0.00)" />
          <stop offset="100%" stopColor="rgba(0,0,0,0.04)"       />
        </linearGradient>
        {/* Subtle top-to-bottom depth on acetate face */}
        <linearGradient id="acetateFace" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%"   stopColor="rgba(255,255,255,0.10)" />
          <stop offset="100%" stopColor="rgba(0,0,0,0.06)" />
        </linearGradient>
      </defs>

      {/* ── Temple arms: thick slab, nearly horizontal ──────────────────────
          40px tall, 2px downward slope over 42px run (≈3°, almost flat).
          Drawn first so frame rings overlap the join seamlessly.          */}

      {/* Left arm: x=2→44, y centred at frame midpoint (103) */}
      <path d="M44,83 L44,123 L2,125 L2,85 Z" fill={F} />
      <path d="M44,83 L2,85 L2,89 L44,87 Z"   fill={HI} opacity="0.52" />
      <path d="M44,120 L44,123 L2,125 L2,122 Z" fill="rgba(0,0,0,0.22)" />

      {/* Right arm: x=496→538 */}
      <path d="M496,83 L496,123 L538,125 L538,85 Z" fill={F} />
      <path d="M496,83 L538,85 L538,89 L496,87 Z"   fill={HI} opacity="0.52" />
      <path d="M496,120 L496,123 L538,125 L538,122 Z" fill="rgba(0,0,0,0.22)" />

      {/* ── Left frame ring ─────────────────────────────────────────────────
          Thick 204×158 slab with 42px rim — same chunky look as real MONOLIX */}
      <rect x="44" y="24" width="204" height="158" rx="10" fill={F} />
      <rect x="44" y="24" width="204" height="158" rx="10" fill="url(#acetateFace)" />
      {/* Top-edge sheen: brightest light on the flat top surface */}
      <rect x="44" y="24" width="204" height="8"   rx="10" fill={HI} opacity="0.55" />
      {fc.crystal && (
        <rect x="44" y="24" width="204" height="158" rx="10"
              fill="none" stroke="rgba(140,178,216,0.82)" strokeWidth="2" />
      )}

      {/* ── Right frame ring ────────────────────────────────────────────────  */}
      <rect x="292" y="24" width="204" height="158" rx="10" fill={F} />
      <rect x="292" y="24" width="204" height="158" rx="10" fill="url(#acetateFace)" />
      <rect x="292" y="24" width="204" height="8"   rx="10" fill={HI} opacity="0.55" />
      {fc.crystal && (
        <rect x="292" y="24" width="204" height="158" rx="10"
              fill="none" stroke="rgba(140,178,216,0.82)" strokeWidth="2" />
      )}

      {/* ── Bridge — slim connector, upper-third height ──────────────────── */}
      <rect x="248" y="70" width="44" height="18" rx="6" fill={F} />
      <rect x="248" y="70" width="44" height="6"  rx="6" fill={HI} opacity="0.48" />

      {/* ── Left lens glass ─────────────────────────────────────────────────
          White base for multiply blend; 42px rim on sides, 33px top/bot   */}
      <rect x="86"  y="57" width="120" height="90" rx="7" fill="white" />
      <rect x="86"  y="57" width="120" height="90" rx="7"
            fill="url(#lensLeft)" style={{ mixBlendMode: 'multiply', transition: TR }} />
      <rect x="86"  y="57" width="120" height="90" rx="7" fill="url(#lensSheen)" />
      <rect x="86"  y="57" width="120" height="90" rx="7"
            fill="none" stroke="rgba(0,0,0,0.18)" strokeWidth="1.5" />

      {/* ── Right lens glass ─────────────────────────────────────────────── */}
      <rect x="334" y="57" width="120" height="90" rx="7" fill="white" />
      <rect x="334" y="57" width="120" height="90" rx="7"
            fill="url(#lensRight)" style={{ mixBlendMode: 'multiply', transition: TR }} />
      <rect x="334" y="57" width="120" height="90" rx="7" fill="url(#lensSheen)" />
      <rect x="334" y="57" width="120" height="90" rx="7"
            fill="none" stroke="rgba(0,0,0,0.18)" strokeWidth="1.5" />

      {/* ── Silver screws on frame face ──────────────────────────────────────
          2 screws per side, on the outer rim, flush with the acetate face.
          Left  frame outer rim: x=44→86  → cx=67
          Right frame outer rim: x=454→496 → cx=473                       */}
      <circle cx="67"  cy="68"  r="5.5" fill={SCREW}  />
      <circle cx="67"  cy="68"  r="2.5" fill={SCREW2} />
      <circle cx="67"  cy="138" r="5.5" fill={SCREW}  />
      <circle cx="67"  cy="138" r="2.5" fill={SCREW2} />

      <circle cx="473" cy="68"  r="5.5" fill={SCREW}  />
      <circle cx="473" cy="68"  r="2.5" fill={SCREW2} />
      <circle cx="473" cy="138" r="5.5" fill={SCREW}  />
      <circle cx="473" cy="138" r="2.5" fill={SCREW2} />

      {/* ── Lens glare bar ──────────────────────────────────────────────── */}
      <rect x="100" y="68" width="44" height="7" rx="3.5"
            fill="white" fillOpacity="0.44" />
      <rect x="348" y="68" width="44" height="7" rx="3.5"
            fill="white" fillOpacity="0.44" />

      {/* ── DITA text on right temple ────────────────────────────────────── */}
      <text x="518" y="108" fontSize="6"
            fill="rgba(255,255,255,0.07)"
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
      <line x1="36"  y1="100" x2="2"   y2="130" stroke={EDGE} strokeWidth="8" strokeLinecap="round" />
      <line x1="524" y1="100" x2="558" y2="130" stroke={EDGE} strokeWidth="8" strokeLinecap="round" />
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
