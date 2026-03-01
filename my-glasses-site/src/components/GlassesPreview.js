/* ─────────────────────────────────────────────────────────────────────────────
   GlassesPreview
   Renders an SVG frame with a tinted lens overlay using multiply blend mode.
───────────────────────────────────────────────────────────────────────────── */

/* ── Frame color palette ─────────────────────────────────────────────────── */

const FRAME_PALETTE = {
  'Black':        { fill: '#111111', hilight: '#2a2a2a', crystal: false },
  'Dusk Blue':    { fill: '#1b2d4a', hilight: '#2a4268', crystal: false },
  'Navy':         { fill: '#0d1b35', hilight: '#1a2d50', crystal: false },
  'Crystal':      { fill: 'rgba(205,218,234,0.46)', hilight: 'rgba(230,238,248,0.55)', crystal: true },
  'Tortoise':     { fill: '#5a3316', hilight: '#7a4e28', crystal: false },
  'Gold':         { fill: '#b8922a', hilight: '#d4aa3c', crystal: false },
  'Silver':       { fill: '#78788a', hilight: '#9a9aac', crystal: false },
  'Gunmetal':     { fill: '#38383f', hilight: '#4e4e58', crystal: false },
  'Rose Gold':    { fill: '#aa6a58', hilight: '#c48878', crystal: false },
  'Antique Gold': { fill: '#8a7040', hilight: '#a08850', crystal: false },
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

  return (
    <defs>
      {buildGrad('lensLeft',  left)}
      {buildGrad('lensRight', right)}
    </defs>
  );
}

/* ── MONOLIX — DITA DTX750 ────────────────────────────────────────────────
   The entire front piece is ONE compound path (fillRule=evenodd) so the
   frame reads as a single slab of acetate with two lens cutouts — this is
   how the real MONOLIX looks from the front.

   Scale: ~3.2 px / mm   (lens 50 mm → 160 px,  bridge 22 mm → 70 px)
   ViewBox: 514 × 178

   Outer frame slab : x=42  y=14  w=430  h=150  rx=8   → right edge x=472
   Left  lens hole  : x=62  y=34  w=160  h=110  rx=5   → right edge x=222
   Bridge (solid)   : x=222 … x=292   (70 px ≈ 22 mm)
   Right lens hole  : x=292 y=34  w=160  h=110  rx=5   → right edge x=452
   Rim all sides    : 20 px  top/bottom,  20 px left/right outer edge
   Temple arms      : extend 42 px beyond each outer edge, nearly horizontal
────────────────────────────────────────────────────────────────────────── */

function MonolixFrame({ lensConfig, frameColor }) {
  const fc   = resolveFrame(frameColor);
  const F    = fc.fill;
  const H    = fc.hilight;
  const GOLD = '#c9a336';
  const G2   = '#9a7828';
  const TR   = 'all 0.45s ease';

  /*
   * Compound frame path (evenodd) — outer rect MINUS two lens holes.
   * Each sub-path is a rounded-rect drawn as M/Q/H/V/Z.
   */
  const outerPath =
    'M50,14 H464 Q472,14 472,22 V156 Q472,164 464,164 H50 Q42,164 42,156 V22 Q42,14 50,14 Z';

  /* Left lens hole  x=62 y=34 w=160 h=110 rx=5 */
  const leftHole =
    'M62,39 Q62,34 67,34 H217 Q222,34 222,39 V139 Q222,144 217,144 H67 Q62,144 62,139 Z';

  /* Right lens hole  x=292 y=34 w=160 h=110 rx=5 */
  const rightHole =
    'M292,39 Q292,34 297,34 H447 Q452,34 452,39 V139 Q452,144 447,144 H297 Q292,144 292,139 Z';

  const framePath = `${outerPath} ${leftHole} ${rightHole}`;

  return (
    <svg
      viewBox="0 0 514 178"
      xmlns="http://www.w3.org/2000/svg"
      style={{ isolation: 'isolate' }}
      className="w-full max-w-2xl drop-shadow-[0_16px_40px_rgba(0,0,0,0.52)]"
    >
      <GradientDefs {...lensConfig} />

      <defs>
        {/* Top-edge sheen gradient for acetate depth */}
        <linearGradient id="acSheen" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%"   stopColor="rgba(255,255,255,0.18)" />
          <stop offset="35%"  stopColor="rgba(255,255,255,0.05)" />
          <stop offset="100%" stopColor="rgba(0,0,0,0.00)"       />
        </linearGradient>
        {/* Clip for top-sheen rect — keep it inside the frame slab */}
        <clipPath id="frameClip">
          <rect x="42" y="14" width="430" height="150" rx="8" />
        </clipPath>
      </defs>

      {/* ══ Temple arms ════════════════════════════════════════════════════
          Thick acetate bars — nearly horizontal (3 px drop / 42 px run).
          Left : x 42 → 0,   Right : x 472 → 514
          Arm height 34 px at hinge  (same thick acetate as the frame)    */}
      <path d="M42,67 L42,101 L0,104 L0,70 Z"     fill={F} />
      <path d="M42,67 L0,70  L0,74  L42,71 Z"     fill="rgba(255,255,255,0.09)" />

      <path d="M472,67 L472,101 L514,104 L514,70 Z" fill={F} />
      <path d="M472,67 L514,70 L514,74 L472,71 Z"   fill="rgba(255,255,255,0.09)" />

      {/* ══ Frame body — ONE slab with two lens cutouts ════════════════════ */}
      <path d={framePath} fillRule="evenodd" fill={F} />

      {/* Crystal: add a visible outline so the transparent slab reads */}
      {fc.crystal && (
        <path d={framePath} fillRule="evenodd"
              fill="none" stroke="rgba(160,185,215,0.75)" strokeWidth="1.8" />
      )}

      {/* Acetate top-edge sheen (clipped to frame slab) */}
      <rect x="42" y="14" width="430" height="56" rx="8"
            fill="url(#acSheen)" clipPath="url(#frameClip)" />

      {/* Bridge top highlight — shows the edge of the bridge "shelf" */}
      <rect x="222" y="14" width="70" height="6" rx="0"
            fill={H} opacity="0.55" clipPath="url(#frameClip)" />

      {/* ══ Left lens glass ═══════════════════════════════════════════════ */}
      {/* White base — multiply blend needs a light ground */}
      <rect x="62" y="34" width="160" height="110" rx="5" fill="white" />
      {/* Tint layer */}
      <rect x="62" y="34" width="160" height="110" rx="5"
            fill="url(#lensLeft)"
            style={{ mixBlendMode: 'multiply', transition: TR }} />
      {/* Inner bevel shadow */}
      <rect x="62" y="34" width="160" height="110" rx="5"
            fill="none" stroke="rgba(0,0,0,0.16)" strokeWidth="2" />

      {/* ══ Right lens glass ══════════════════════════════════════════════ */}
      <rect x="292" y="34" width="160" height="110" rx="5" fill="white" />
      <rect x="292" y="34" width="160" height="110" rx="5"
            fill="url(#lensRight)"
            style={{ mixBlendMode: 'multiply', transition: TR }} />
      <rect x="292" y="34" width="160" height="110" rx="5"
            fill="none" stroke="rgba(0,0,0,0.16)" strokeWidth="2" />

      {/* ══ 5-barrel hinge hardware (gold) ════════════════════════════════
          Straddles each outer edge — extends 18 px beyond frame edge.    */}
      {/* Left hinge */}
      <rect x="24" y="69" width="24" height="34" rx="4.5" fill={GOLD} />
      {[77, 84, 91, 98].map(y => (
        <line key={y} x1="24" y1={y} x2="48" y2={y}
              stroke={G2} strokeWidth="1.1" opacity="0.68" />
      ))}
      {/* Right hinge */}
      <rect x="466" y="69" width="24" height="34" rx="4.5" fill={GOLD} />
      {[77, 84, 91, 98].map(y => (
        <line key={y} x1="466" y1={y} x2="490" y2={y}
              stroke={G2} strokeWidth="1.1" opacity="0.68" />
      ))}

      {/* ══ 4-hex screws on frame face ═════════════════════════════════════
          In the 20 px left/right rim — cx = frame_edge + 10 px           */}
      {/* Left rim: frame x=42, lens x=62 → cx=52 */}
      <circle cx="52" cy="77"  r="4.5" fill={GOLD} />
      <circle cx="52" cy="77"  r="2.2" fill={G2}   />
      <circle cx="52" cy="113" r="4.5" fill={GOLD} />
      <circle cx="52" cy="113" r="2.2" fill={G2}   />
      {/* Right rim: lens ends x=452, frame ends x=472 → cx=462 */}
      <circle cx="462" cy="77"  r="4.5" fill={GOLD} />
      <circle cx="462" cy="77"  r="2.2" fill={G2}   />
      <circle cx="462" cy="113" r="4.5" fill={GOLD} />
      <circle cx="462" cy="113" r="2.2" fill={G2}   />

      {/* ══ Diamond-pressed titanium nose pads ════════════════════════════ */}
      <ellipse cx="224" cy="98" rx="3.5" ry="5" fill={GOLD} opacity="0.88" />
      <ellipse cx="290" cy="98" rx="3.5" ry="5" fill={GOLD} opacity="0.88" />

      {/* ══ Lens glare highlights ══════════════════════════════════════════ */}
      <rect x="74"  y="46" width="52" height="8" rx="3.5"
            fill="white" fillOpacity="0.44" />
      <rect x="304" y="46" width="52" height="8" rx="3.5"
            fill="white" fillOpacity="0.44" />

      {/* ══ DITA temple text (almost invisible, purely decorative) ═════════ */}
      <text x="454" y="128" fontSize="6.5" fill="rgba(255,255,255,0.06)"
            fontFamily="serif" letterSpacing="1.5" textAnchor="middle"
            style={{ userSelect: 'none' }}>DITA</text>
    </svg>
  );
}

/* ── GRANDMASTER — aviator / teardrop ─────────────────────────────────────── */

function GrandmasterFrame({ lensConfig, frameColor }) {
  const fc    = resolveFrame(frameColor);
  const FRAME = fc.fill;
  const EDGE  = fc.hilight;
  const TR    = 'all 0.45s ease';

  const leftLens  = 'M 43,50 Q 43,38 55,34 L 235,34 Q 248,34 250,50 L 252,130 Q 252,175 200,178 L 97,178 Q 44,178 43,130 Z';
  const rightLens = 'M 308,50 Q 308,38 320,34 L 500,34 Q 513,34 515,50 L 516,130 Q 516,175 464,178 L 360,178 Q 308,178 308,130 Z';

  return (
    <svg
      viewBox="0 0 560 220"
      xmlns="http://www.w3.org/2000/svg"
      style={{ isolation: 'isolate' }}
      className="w-full max-w-xl drop-shadow-[0_20px_56px_rgba(0,0,0,0.45)]"
    >
      <GradientDefs {...lensConfig} />
      <defs>
        <clipPath id="leftClip">  <path d={leftLens} />  </clipPath>
        <clipPath id="rightClip"> <path d={rightLens} /> </clipPath>
      </defs>

      {/* Temples */}
      <line x1="43"  y1="50" x2="4"   y2="28" stroke={EDGE} strokeWidth="8" strokeLinecap="round" />
      <line x1="515" y1="50" x2="556" y2="28" stroke={EDGE} strokeWidth="8" strokeLinecap="round" />

      {/* Brow bar */}
      <line x1="252" y1="34" x2="308" y2="34" stroke={EDGE} strokeWidth="6" strokeLinecap="round" />

      {/* ── Left lens ── */}
      <path d={leftLens} fill="none" stroke={FRAME} strokeWidth="9" />
      <path d={leftLens} fill="white" />
      <path d={leftLens} fill="url(#lensLeft)"
            style={{ mixBlendMode: 'multiply', transition: TR }} />
      <rect x="58" y="48" width="50" height="9" rx="3"
            fill="white" fillOpacity="0.45" clipPath="url(#leftClip)" />

      {/* ── Right lens ── */}
      <path d={rightLens} fill="none" stroke={FRAME} strokeWidth="9" />
      <path d={rightLens} fill="white" />
      <path d={rightLens} fill="url(#lensRight)"
            style={{ mixBlendMode: 'multiply', transition: TR }} />
      <rect x="323" y="48" width="50" height="9" rx="3"
            fill="white" fillOpacity="0.45" clipPath="url(#rightClip)" />

      {/* Bridge */}
      <path d="M252 60 Q280 52 308 60"
            stroke={EDGE} strokeWidth="7" fill="none" strokeLinecap="round" />

      {/* Nose pads */}
      <ellipse cx="258" cy="88" rx="4" ry="6" fill={EDGE} opacity="0.6" />
      <ellipse cx="302" cy="88" rx="4" ry="6" fill={EDGE} opacity="0.6" />
    </svg>
  );
}

/* ── LANCIER — slim rectangle ─────────────────────────────────────────────── */

function LancierFrame({ lensConfig, frameColor }) {
  const fc    = resolveFrame(frameColor);
  const FRAME = fc.fill;
  const EDGE  = fc.hilight;
  const TR    = 'all 0.45s ease';

  return (
    <svg
      viewBox="0 0 560 200"
      xmlns="http://www.w3.org/2000/svg"
      style={{ isolation: 'isolate' }}
      className="w-full max-w-xl drop-shadow-[0_20px_56px_rgba(0,0,0,0.45)]"
    >
      <GradientDefs {...lensConfig} />

      {/* Temples */}
      <line x1="36"  y1="100" x2="2"   y2="130" stroke={EDGE} strokeWidth="8" strokeLinecap="round" />
      <line x1="524" y1="100" x2="558" y2="130" stroke={EDGE} strokeWidth="8" strokeLinecap="round" />

      {/* Bridge */}
      <rect x="254" y="88" width="52" height="7" rx="3" fill={EDGE} />

      {/* ── Left lens ── */}
      <rect x="36" y="54" width="218" height="96" rx="4"
            fill="none" stroke={FRAME} strokeWidth="9" />
      <rect x="44" y="62" width="202" height="80" rx="2" fill="white" />
      <rect x="44" y="62" width="202" height="80" rx="2"
            fill="url(#lensLeft)"
            style={{ mixBlendMode: 'multiply', transition: TR }} />
      <rect x="60" y="74" width="64" height="8" rx="3"
            fill="white" fillOpacity="0.45" />

      {/* ── Right lens ── */}
      <rect x="306" y="54" width="218" height="96" rx="4"
            fill="none" stroke={FRAME} strokeWidth="9" />
      <rect x="314" y="62" width="202" height="80" rx="2" fill="white" />
      <rect x="314" y="62" width="202" height="80" rx="2"
            fill="url(#lensRight)"
            style={{ mixBlendMode: 'multiply', transition: TR }} />
      <rect x="330" y="74" width="64" height="8" rx="3"
            fill="white" fillOpacity="0.45" />

      {/* Nose pads */}
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
