/* ─────────────────────────────────────────────────────────────────────────────
   GlassesPreview — lens tint overlay using multiply blend mode.
───────────────────────────────────────────────────────────────────────────── */

const FRAME_PALETTE = {
  'Black':        { fill: '#111111', hi: '#303030', crystal: false },
  'Dusk Blue':    { fill: '#1b2d4a', hi: '#2e4a72', crystal: false },
  'Navy':         { fill: '#0d1b35', hi: '#1a2d50', crystal: false },
  'Crystal':      { fill: 'rgba(205,218,234,0.44)', hi: 'rgba(230,240,252,0.55)', crystal: true  },
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

/* ── MONOLIX — DITA DTX750 ────────────────────────────────────────────────

   Based directly on the real frame silhouette:
   · Single acetate slab drawn as one compound path (fillRule=evenodd)
     with two rectangular lens holes punched through it
   · Lens corners are almost square (rx=3) — matching the DTX750 profile
   · Thick 30 px temple arms, completely horizontal, top-edge sheen for depth
   · 5-barrel gold hinge hardware + 4-hex screws on the frame face
   · Scale ≈ 3.2 px/mm  (lens 50 mm → 160 px, bridge 22 mm → 70 px)

   ViewBox 524 × 184
   ─────────────────────────────────────────────────────────────────────
   Outer slab  x=48  y=16  w=428  h=152  rx=7   right-edge = 476
   Left  hole  x=72  y=40  w=156  h=104  rx=3   right-edge = 228
   Bridge      228 … 296  (68 px ≈ 21 mm — slightly inside real 22 mm)
   Right hole  x=296 y=40  w=156  h=104  rx=3   right-edge = 452
   Rims        left/right outer 24 px | top/bottom 24 px
   Temples     0→48 left, 476→524 right, 30 px tall, horizontal
────────────────────────────────────────────────────────────────────── */

function MonolixFrame({ lensConfig, frameColor }) {
  const fc   = resolveFrame(frameColor);
  const F    = fc.fill;
  const HI   = fc.hi;
  const GOLD = '#c9a336';
  const G2   = '#9a7828';
  const TR   = 'all 0.45s ease';

  /* ── Compound frame path (evenodd) ───────────────────────────────────
     Outer rect minus two lens holes = one solid acetate piece.
     All rounded-rects written as M/Q/H/V/Z shorthand.                 */

  // Outer slab  x=48 y=16 w=428 h=152 rx=7
  const outer =
    'M55,16 H469 Q476,16 476,23 V160 Q476,168 469,168 H55 Q48,168 48,160 V23 Q48,16 55,16 Z';

  // Left lens hole  x=72 y=40 w=156 h=104 rx=3
  const lhL =
    'M72,43 Q72,40 75,40 H225 Q228,40 228,43 V141 Q228,144 225,144 H75 Q72,144 72,141 Z';

  // Right lens hole  x=296 y=40 w=156 h=104 rx=3
  const lhR =
    'M296,43 Q296,40 299,40 H449 Q452,40 452,43 V141 Q452,144 449,144 H299 Q296,144 296,141 Z';

  const framePath = `${outer} ${lhL} ${lhR}`;

  return (
    <svg
      viewBox="0 0 524 184"
      xmlns="http://www.w3.org/2000/svg"
      style={{ isolation: 'isolate' }}
      className="w-full max-w-2xl drop-shadow-[0_18px_48px_rgba(0,0,0,0.55)]"
    >
      <GradientDefs {...lensConfig} />

      <defs>
        {/* Acetate top-edge sheen — lighter at top, tiny darkening at base */}
        <linearGradient id="acSheen" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%"   stopColor={HI}    stopOpacity="0.70" />
          <stop offset="20%"  stopColor={HI}    stopOpacity="0.20" />
          <stop offset="70%"  stopColor="#000"  stopOpacity="0.00" />
          <stop offset="100%" stopColor="#000"  stopOpacity="0.08" />
        </linearGradient>
        {/* Inner lens bevel — subtle bright top-edge inside the opening */}
        <linearGradient id="lensSheen" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%"   stopColor="rgba(255,255,255,0.22)" />
          <stop offset="18%"  stopColor="rgba(255,255,255,0.00)" />
          <stop offset="100%" stopColor="rgba(0,0,0,0.03)"       />
        </linearGradient>
      </defs>

      {/* ══ Temple arms ════════════════════════════════════════════════════
          30 px tall • perfectly horizontal (1 px drop over 48 px run)   */}
      {/* Left temple */}
      <path d="M48,70 L48,100 L0,101 L0,71 Z"     fill={F} />
      {/* Temple top-surface catch-light */}
      <path d="M48,70 L0,71 L0,74.5 L48,73.5 Z"  fill={HI} opacity="0.55" />
      {/* Temple front-face subtle lower-edge shadow */}
      <path d="M48,98 L48,100 L0,101 L0,99 Z"    fill="rgba(0,0,0,0.18)" />

      {/* Right temple */}
      <path d="M476,70 L476,100 L524,101 L524,71 Z"  fill={F} />
      <path d="M476,70 L524,71 L524,74.5 L476,73.5 Z" fill={HI} opacity="0.55" />
      <path d="M476,98 L476,100 L524,101 L524,99 Z"  fill="rgba(0,0,0,0.18)" />

      {/* ══ Acetate slab — single compound shape with evenodd lens holes ═══ */}
      <path d={framePath} fillRule="evenodd" fill={F} />

      {/* Crystal: add a tinted outline so the transparent slab is readable  */}
      {fc.crystal && (
        <path d={framePath} fillRule="evenodd"
              fill="none" stroke="rgba(140,175,215,0.80)" strokeWidth="2" />
      )}

      {/* Top-edge sheen applied through the same compound path
          (evenodd means it only lands on frame material, not lens holes)  */}
      <path d={framePath} fillRule="evenodd" fill="url(#acSheen)" />

      {/* Bridge top-shelf: narrow bright strip where bridge meets top rim */}
      <rect x="228" y="16" width="68" height="8"
            fill={HI} opacity="0.50" />

      {/* ══ Left lens glass ════════════════════════════════════════════════ */}
      <rect x="72"  y="40" width="156" height="104" rx="3" fill="white" />
      <rect x="72"  y="40" width="156" height="104" rx="3"
            fill="url(#lensLeft)"
            style={{ mixBlendMode: 'multiply', transition: TR }} />
      {/* Inner bevel — bright top edge of the lens opening */}
      <rect x="72"  y="40" width="156" height="104" rx="3"
            fill="url(#lensSheen)" />
      <rect x="72"  y="40" width="156" height="104" rx="3"
            fill="none" stroke="rgba(0,0,0,0.20)" strokeWidth="1.5" />

      {/* ══ Right lens glass ═══════════════════════════════════════════════ */}
      <rect x="296" y="40" width="156" height="104" rx="3" fill="white" />
      <rect x="296" y="40" width="156" height="104" rx="3"
            fill="url(#lensRight)"
            style={{ mixBlendMode: 'multiply', transition: TR }} />
      <rect x="296" y="40" width="156" height="104" rx="3"
            fill="url(#lensSheen)" />
      <rect x="296" y="40" width="156" height="104" rx="3"
            fill="none" stroke="rgba(0,0,0,0.20)" strokeWidth="1.5" />

      {/* ══ 5-barrel hinge hardware ════════════════════════════════════════
          Straddles each outer frame edge — 14 px outside, 12 px inside.  */}
      {/* Left hinge  (x=34..60 spans frame left edge at x=48) */}
      <rect x="34" y="70" width="26" height="32" rx="5" fill={GOLD} />
      {/* Barrel engraving lines */}
      {[77, 84, 91, 98].map(y => (
        <line key={y} x1="34" y1={y} x2="60" y2={y}
              stroke={G2} strokeWidth="1.1" opacity="0.68" />
      ))}
      {/* Hinge face highlight */}
      <rect x="34" y="70" width="26" height="6" rx="5"
            fill="rgba(255,255,255,0.18)" />

      {/* Right hinge  (x=462..488 spans frame right edge at x=476) */}
      <rect x="462" y="70" width="26" height="32" rx="5" fill={GOLD} />
      {[77, 84, 91, 98].map(y => (
        <line key={y} x1="462" y1={y} x2="488" y2={y}
              stroke={G2} strokeWidth="1.1" opacity="0.68" />
      ))}
      <rect x="462" y="70" width="26" height="6" rx="5"
            fill="rgba(255,255,255,0.18)" />

      {/* ══ 4-hex screws on frame face ══════════════════════════════════════
          In the 24 px left/right rims, centred horizontally.
          Left rim  x=48–72 → cx=60
          Right rim x=452–476 → cx=464                                    */}
      <circle cx="60"  cy="77"  r="5" fill={GOLD} />
      <circle cx="60"  cy="77"  r="2.4" fill={G2} />
      <circle cx="60"  cy="115" r="5" fill={GOLD} />
      <circle cx="60"  cy="115" r="2.4" fill={G2} />

      <circle cx="464" cy="77"  r="5" fill={GOLD} />
      <circle cx="464" cy="77"  r="2.4" fill={G2} />
      <circle cx="464" cy="115" r="5" fill={GOLD} />
      <circle cx="464" cy="115" r="2.4" fill={G2} />

      {/* ══ Titanium nose pads ════════════════════════════════════════════ */}
      <ellipse cx="230" cy="98" rx="3.5" ry="5.5" fill={GOLD} opacity="0.90" />
      <ellipse cx="294" cy="98" rx="3.5" ry="5.5" fill={GOLD} opacity="0.90" />

      {/* ══ Lens glare — single short bar in top-left of each lens ══════════ */}
      <rect x="86"  y="52" width="50" height="8" rx="4"
            fill="white" fillOpacity="0.46" />
      <rect x="310" y="52" width="50" height="8" rx="4"
            fill="white" fillOpacity="0.46" />

      {/* ══ Subtle DITA temple text ═══════════════════════════════════════ */}
      <text x="458" y="130" fontSize="6.5"
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
