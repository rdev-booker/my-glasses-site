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
   Two separate filled frame rings + slim bridge + chunky horizontal temples.
   Each frame ring = filled rect (the thick acetate).
   The lens glass = white rect + tint overlay (sits on top of the ring).

   Scale ≈ 3.2 px/mm.  ViewBox 524 × 196.

   Left  ring   x=50  y=26  w=192  h=144  rx=6   right-edge = 242
   Bridge       x=242 y=68  w=40   h=14   rx=5   (40px = 12.5mm ≈ keyhole bridge)
   Right ring   x=282 y=26  w=192  h=144  rx=6   right-edge = 474
   Left  lens   x=72  y=48  w=148  h=100  rx=3   (22px rim all sides)
   Right lens   x=304 y=48  w=148  h=100  rx=3
   Temples      x≈2…52 left,  x≈472…522 right,  34px tall, almost horizontal
────────────────────────────────────────────────────────────────────────── */

function MonolixFrame({ lensConfig, frameColor }) {
  const fc   = resolveFrame(frameColor);
  const F    = fc.fill;
  const HI   = fc.hi;
  const GOLD = '#c9a336';
  const G2   = '#9a7828';
  const TR   = 'all 0.45s ease';

  return (
    <svg
      viewBox="0 0 524 196"
      xmlns="http://www.w3.org/2000/svg"
      style={{ isolation: 'isolate' }}
      className="w-full max-w-2xl drop-shadow-[0_14px_36px_rgba(0,0,0,0.50)]"
    >
      <GradientDefs {...lensConfig} />

      <defs>
        {/* Lens inner-bevel sheen: bright top edge fades quickly */}
        <linearGradient id="lensSheen" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%"   stopColor="rgba(255,255,255,0.22)" />
          <stop offset="18%"  stopColor="rgba(255,255,255,0.00)" />
          <stop offset="100%" stopColor="rgba(0,0,0,0.04)"       />
        </linearGradient>
      </defs>

      {/* ══ Temple arms ════════════════════════════════════════════════════
          34 px tall, 2 px downward drop over 48 px run (≈2° — flat).
          Polygon shape: thick solid bar identical to real acetate temple.  */}

      {/* Left: hinge at x=50, arm extends left to x=2 */}
      <path d="M50,82 L50,116 L2,118 L2,84 Z" fill={F} />
      {/* Top-surface sheen (the flat top face of the thick arm catches light) */}
      <path d="M50,82 L2,84 L2,88 L50,86 Z"  fill={HI} opacity="0.60" />
      {/* Bottom-edge shadow */}
      <path d="M50,113 L50,116 L2,118 L2,115 Z" fill="rgba(0,0,0,0.22)" />

      {/* Right: hinge at x=474, arm extends right to x=522 */}
      <path d="M474,82 L474,116 L522,118 L522,84 Z" fill={F} />
      <path d="M474,82 L522,84 L522,88 L474,86 Z"   fill={HI} opacity="0.60" />
      <path d="M474,113 L474,116 L522,118 L522,115 Z" fill="rgba(0,0,0,0.22)" />

      {/* ══ Left frame ring ════════════════════════════════════════════════ */}
      <rect x="50" y="26" width="192" height="144" rx="6" fill={F} />
      {/* Top-edge sheen: the top surface of the thick acetate frame */}
      <rect x="50" y="26" width="192" height="7"   rx="6" fill={HI} opacity="0.58" />
      {/* Crystal: visible outline */}
      {fc.crystal && (
        <rect x="50" y="26" width="192" height="144" rx="6"
              fill="none" stroke="rgba(140,178,216,0.80)" strokeWidth="2" />
      )}

      {/* ══ Right frame ring ═══════════════════════════════════════════════ */}
      <rect x="282" y="26" width="192" height="144" rx="6" fill={F} />
      <rect x="282" y="26" width="192" height="7"   rx="6" fill={HI} opacity="0.58" />
      {fc.crystal && (
        <rect x="282" y="26" width="192" height="144" rx="6"
              fill="none" stroke="rgba(140,178,216,0.80)" strokeWidth="2" />
      )}

      {/* ══ Bridge — slim connector at upper-third of frame height ══════════
          x=242 (left ring right-edge) → x=282 (right ring left-edge)     */}
      <rect x="242" y="68" width="40" height="14" rx="5" fill={F} />
      <rect x="242" y="68" width="40" height="5"  rx="5" fill={HI} opacity="0.50" />

      {/* ══ Left lens glass ════════════════════════════════════════════════
          Sits on top of the frame ring, covering the lens area only.      */}
      <rect x="72"  y="48" width="148" height="100" rx="3" fill="white" />
      <rect x="72"  y="48" width="148" height="100" rx="3"
            fill="url(#lensLeft)"
            style={{ mixBlendMode: 'multiply', transition: TR }} />
      {/* Inner bevel: bright top, slight darkening bottom */}
      <rect x="72"  y="48" width="148" height="100" rx="3" fill="url(#lensSheen)" />
      <rect x="72"  y="48" width="148" height="100" rx="3"
            fill="none" stroke="rgba(0,0,0,0.20)" strokeWidth="1.5" />

      {/* ══ Right lens glass ═══════════════════════════════════════════════ */}
      <rect x="304" y="48" width="148" height="100" rx="3" fill="white" />
      <rect x="304" y="48" width="148" height="100" rx="3"
            fill="url(#lensRight)"
            style={{ mixBlendMode: 'multiply', transition: TR }} />
      <rect x="304" y="48" width="148" height="100" rx="3" fill="url(#lensSheen)" />
      <rect x="304" y="48" width="148" height="100" rx="3"
            fill="none" stroke="rgba(0,0,0,0.20)" strokeWidth="1.5" />

      {/* ══ 5-barrel hinge hardware ════════════════════════════════════════
          Straddles each outer frame edge (14 px outside, 12 px inside).   */}
      {/* Left hinge  (x=36..62, frame left-edge at x=50) */}
      <rect x="36" y="84" width="26" height="34" rx="5" fill={GOLD} />
      {[91, 98, 106, 113].map(y => (
        <line key={y} x1="36" y1={y} x2="62" y2={y}
              stroke={G2} strokeWidth="1.2" opacity="0.65" />
      ))}
      {/* Hinge top highlight */}
      <rect x="36" y="84" width="26" height="5" rx="5"
            fill="rgba(255,255,255,0.22)" />

      {/* Right hinge  (x=462..488, frame right-edge at x=474) */}
      <rect x="462" y="84" width="26" height="34" rx="5" fill={GOLD} />
      {[91, 98, 106, 113].map(y => (
        <line key={y} x1="462" y1={y} x2="488" y2={y}
              stroke={G2} strokeWidth="1.2" opacity="0.65" />
      ))}
      <rect x="462" y="84" width="26" height="5" rx="5"
            fill="rgba(255,255,255,0.22)" />

      {/* ══ 4-hex screws on frame face ══════════════════════════════════════
          Left  rim x=50–72  → cx=61
          Right rim x=452–474 → cx=463                                     */}
      <circle cx="61"  cy="80"  r="5" fill={GOLD} /><circle cx="61"  cy="80"  r="2.4" fill={G2} />
      <circle cx="61"  cy="118" r="5" fill={GOLD} /><circle cx="61"  cy="118" r="2.4" fill={G2} />
      <circle cx="463" cy="80"  r="5" fill={GOLD} /><circle cx="463" cy="80"  r="2.4" fill={G2} />
      <circle cx="463" cy="118" r="5" fill={GOLD} /><circle cx="463" cy="118" r="2.4" fill={G2} />

      {/* ══ Titanium nose pads — at bridge inner edges ══════════════════════ */}
      <ellipse cx="244" cy="88" rx="3.5" ry="5.5" fill={GOLD} opacity="0.92" />
      <ellipse cx="280" cy="88" rx="3.5" ry="5.5" fill={GOLD} opacity="0.92" />

      {/* ══ Lens glare — single bar near top-left of each lens ══════════════ */}
      <rect x="86"  y="60" width="50" height="7" rx="3.5"
            fill="white" fillOpacity="0.44" />
      <rect x="318" y="60" width="50" height="7" rx="3.5"
            fill="white" fillOpacity="0.44" />

      {/* ══ Subtle DITA text on right temple ════════════════════════════════ */}
      <text x="500" y="108" fontSize="6"
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
