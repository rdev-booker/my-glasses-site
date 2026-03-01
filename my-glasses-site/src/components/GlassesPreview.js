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
   Front-view silhouette matching the real DTX750 acetate frame.

   Key proportions (scale ≈ 2.5 px/mm):
     Outer frame ring  200 × 180  (≈ 80 × 72 mm)   rx=6  (near-sharp corners)
     Lens opening      128 × 110  (≈ 51 × 44 mm)   rx=4  (slightly wider than tall)
     Rim               36 px sides / 35 px top+bot  (≈ 14 mm — very thick)
     Bridge gap        52 px wide  (≈ 21 mm)        slim connector at upper 1/3
     Temples           60 px tall, 42 px long        (same chunky width as rim)

   Left  ring   x=44  y=20  w=200  h=180  rx=6   right-edge=244   bottom=200
   Bridge       x=244 y=60  w=52   h=16   rx=4
   Right ring   x=296 y=20  w=200  h=180  rx=6   right-edge=496   bottom=200
   Left  lens   x=80  y=55  w=128  h=110  rx=4
   Right lens   x=332 y=55  w=128  h=110  rx=4
   Temples      M44,80–140 / M496,80–140             (60 px tall)
   Screws       cx=62 / cx=478,  cy=72 + cy=148
────────────────────────────────────────────────────────────────────────── */

function MonolixFrame({ lensConfig, frameColor }) {
  const fc     = resolveFrame(frameColor);
  const F      = fc.fill;
  const HI     = fc.hi;
  const SCREW  = '#c4c4c4';
  const SCREW2 = '#7c7c7c';
  const TR     = 'all 0.45s ease';

  return (
    <svg
      viewBox="0 0 544 220"
      xmlns="http://www.w3.org/2000/svg"
      style={{ isolation: 'isolate' }}
      className="w-full max-w-2xl drop-shadow-[0_14px_36px_rgba(0,0,0,0.50)]"
    >
      <GradientDefs {...lensConfig} />

      <defs>
        {/* Lens inner sheen: faint top highlight only */}
        <linearGradient id="lensSheen" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%"   stopColor="rgba(255,255,255,0.20)" />
          <stop offset="22%"  stopColor="rgba(255,255,255,0.00)" />
          <stop offset="100%" stopColor="rgba(0,0,0,0.03)"       />
        </linearGradient>
        {/* Matte acetate face: almost no gradient (matte black finish) */}
        <linearGradient id="matteAcetate" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%"   stopColor="rgba(255,255,255,0.06)" />
          <stop offset="100%" stopColor="rgba(0,0,0,0.04)" />
        </linearGradient>
      </defs>

      {/* ── Temple arms ─────────────────────────────────────────────────────
          60 px tall, 42 px long, 2 px downward slope (≈3°, nearly flat).
          Same chunky width as the frame rim. Drawn below frame rings.     */}

      {/* Left arm: x=2→44, centred at y=110 */}
      <path d="M44,80 L44,140 L2,142 L2,82 Z"   fill={F} />
      <path d="M44,80 L2,82 L2,86 L44,84 Z"     fill={HI} opacity="0.35" />
      <path d="M44,137 L44,140 L2,142 L2,139 Z" fill="rgba(0,0,0,0.18)" />

      {/* Right arm: x=496→538 */}
      <path d="M496,80 L496,140 L538,142 L538,82 Z" fill={F} />
      <path d="M496,80 L538,82 L538,86 L496,84 Z"   fill={HI} opacity="0.35" />
      <path d="M496,137 L496,140 L538,142 L538,139 Z" fill="rgba(0,0,0,0.18)" />

      {/* ── Left frame ring: 200×180, rx=6 (near-sharp corners) ─────────── */}
      <rect x="44" y="20" width="200" height="180" rx="6" fill={F} />
      {/* Matte depth overlay — very subtle */}
      <rect x="44" y="20" width="200" height="180" rx="6" fill="url(#matteAcetate)" />
      {/* Top-edge catch-light: very faint on matte acetate */}
      <rect x="44" y="20" width="200" height="6"   rx="6" fill={HI} opacity="0.30" />
      {fc.crystal && (
        <rect x="44" y="20" width="200" height="180" rx="6"
              fill="none" stroke="rgba(140,178,216,0.82)" strokeWidth="2" />
      )}

      {/* ── Right frame ring ────────────────────────────────────────────── */}
      <rect x="296" y="20" width="200" height="180" rx="6" fill={F} />
      <rect x="296" y="20" width="200" height="180" rx="6" fill="url(#matteAcetate)" />
      <rect x="296" y="20" width="200" height="6"   rx="6" fill={HI} opacity="0.30" />
      {fc.crystal && (
        <rect x="296" y="20" width="200" height="180" rx="6"
              fill="none" stroke="rgba(140,178,216,0.82)" strokeWidth="2" />
      )}

      {/* ── Bridge — slim solid-acetate connector ──────────────────────── */}
      <rect x="244" y="60" width="52" height="16" rx="4" fill={F} />
      <rect x="244" y="60" width="52" height="5"  rx="4" fill={HI} opacity="0.28" />

      {/* ── Left lens glass ─────────────────────────────────────────────
          128×110 opening — nearly square, rx=4 for almost-sharp corners  */}
      <rect x="80"  y="55" width="128" height="110" rx="4" fill="white" />
      <rect x="80"  y="55" width="128" height="110" rx="4"
            fill="url(#lensLeft)" style={{ mixBlendMode: 'multiply', transition: TR }} />
      <rect x="80"  y="55" width="128" height="110" rx="4" fill="url(#lensSheen)" />
      <rect x="80"  y="55" width="128" height="110" rx="4"
            fill="none" stroke="rgba(0,0,0,0.16)" strokeWidth="1.5" />

      {/* ── Right lens glass ────────────────────────────────────────────── */}
      <rect x="332" y="55" width="128" height="110" rx="4" fill="white" />
      <rect x="332" y="55" width="128" height="110" rx="4"
            fill="url(#lensRight)" style={{ mixBlendMode: 'multiply', transition: TR }} />
      <rect x="332" y="55" width="128" height="110" rx="4" fill="url(#lensSheen)" />
      <rect x="332" y="55" width="128" height="110" rx="4"
            fill="none" stroke="rgba(0,0,0,0.16)" strokeWidth="1.5" />

      {/* ── Silver screws — flush on outer rim face ──────────────────────
          Left  outer rim x=44→80  (36 px) → cx=62
          Right outer rim x=460→496 (36 px) → cx=478
          Positioned at ~28% and ~72% of frame height                    */}
      <circle cx="62"  cy="72"  r="5.5" fill={SCREW}  />
      <circle cx="62"  cy="72"  r="2.5" fill={SCREW2} />
      <circle cx="62"  cy="148" r="5.5" fill={SCREW}  />
      <circle cx="62"  cy="148" r="2.5" fill={SCREW2} />

      <circle cx="478" cy="72"  r="5.5" fill={SCREW}  />
      <circle cx="478" cy="72"  r="2.5" fill={SCREW2} />
      <circle cx="478" cy="148" r="5.5" fill={SCREW}  />
      <circle cx="478" cy="148" r="2.5" fill={SCREW2} />

      {/* ── Lens glare — single soft bar near top-left of each lens ─────── */}
      <rect x="94"  y="67" width="44" height="7" rx="3.5"
            fill="white" fillOpacity="0.40" />
      <rect x="346" y="67" width="44" height="7" rx="3.5"
            fill="white" fillOpacity="0.40" />

      {/* ── Faint DITA text on right temple ─────────────────────────────── */}
      <text x="520" y="114" fontSize="6"
            fill="rgba(255,255,255,0.06)"
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
