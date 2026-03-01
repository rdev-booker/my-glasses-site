/* ─────────────────────────────────────────────────────────────────────────────
   GlassesPreview
   Renders an SVG frame with a tinted lens overlay using multiply blend mode.

   Visual technique:
   1. Each lens has a white background rect — multiply blend needs a light base.
   2. A colored gradient fill sits on top with mixBlendMode:'multiply'.
      Multiply over white produces the realistic glass color.
   3. Thin glare highlights add depth.
   4. SVG uses isolation:'isolate' to confine blend modes to its stacking context.
───────────────────────────────────────────────────────────────────────────── */

/* ── Frame color palette ─────────────────────────────────────────────────── */

const FRAME_PALETTE = {
  /* MONOLIX */
  'Black':        { fill: '#0c0c0c',                  stroke: '#2a2a2a', crystal: false },
  'Dusk Blue':    { fill: '#1b2d4a',                  stroke: '#243d64', crystal: false },
  'Navy':         { fill: '#0d1b35',                  stroke: '#1a2d50', crystal: false },
  'Crystal':      { fill: 'rgba(210,220,232,0.42)',   stroke: 'rgba(155,180,210,0.70)', crystal: true  },
  'Tortoise':     { fill: '#5c3617',                  stroke: '#7a4e28', crystal: false },
  /* GRANDMASTER */
  'Gold':         { fill: '#b8922a',                  stroke: '#d4aa3c', crystal: false },
  'Silver':       { fill: '#7a7a8a',                  stroke: '#9a9aac', crystal: false },
  'Gunmetal':     { fill: '#38383f',                  stroke: '#4e4e58', crystal: false },
  'Rose Gold':    { fill: '#aa6a58',                  stroke: '#c48878', crystal: false },
  /* LANCIER */
  'Antique Gold': { fill: '#8a7040',                  stroke: '#a08850', crystal: false },
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

    if (style === 'Solid') {
      return (
        <linearGradient key={id} id={id} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%"   stopColor={c1} stopOpacity={op} />
          <stop offset="100%" stopColor={c1} stopOpacity={op} />
        </linearGradient>
      );
    }
    if (style === 'Gradient') {
      return (
        <linearGradient key={id} id={id} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%"   stopColor={c1} stopOpacity={op}     />
          <stop offset="100%" stopColor={c1} stopOpacity={fadeOp} />
        </linearGradient>
      );
    }
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
   Proportions based on the real frame: lens 50 × 34 mm, bridge 22 mm.
   Scale ≈ 3.6 px/mm.

   ViewBox 560 × 188
   Left frame   x=58  y=22  w=184 h=138  rx=7   right-edge=242
   Right frame  x=318 y=22  w=184 h=138  rx=7   left-edge=318
   Bridge       x=242 y=60  w=76  h=18   rx=6
   Left lens    x=76  y=40  w=148 h=102  rx=4
   Right lens   x=336 y=40  w=148 h=102  rx=4

   Temple arms start at the outer frame edges (x=58, x=502) and extend
   nearly horizontally — only ~4 px drop over 56 px run (≈4°).
────────────────────────────────────────────────────────────────────────── */

function MonolixFrame({ lensConfig, frameColor }) {
  const fc   = resolveFrame(frameColor);
  const FILL = fc.fill;
  const STRK = fc.stroke;
  const GOLD = '#c9a336';
  const G2   = '#9a7828';
  const TR   = 'all 0.45s ease';

  return (
    <svg
      viewBox="0 0 560 188"
      xmlns="http://www.w3.org/2000/svg"
      style={{ isolation: 'isolate' }}
      className="w-full max-w-2xl drop-shadow-[0_18px_44px_rgba(0,0,0,0.48)]"
    >
      <GradientDefs {...lensConfig} />

      <defs>
        {/* Acetate top-edge sheen */}
        <linearGradient id="sheenV" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%"   stopColor="rgba(255,255,255,0.14)" />
          <stop offset="45%"  stopColor="rgba(255,255,255,0.03)" />
          <stop offset="100%" stopColor="rgba(0,0,0,0.00)"       />
        </linearGradient>
        {/* Side-edge sheen (left-to-right) for temple arms */}
        <linearGradient id="sheenH" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%"   stopColor="rgba(255,255,255,0.10)" />
          <stop offset="100%" stopColor="rgba(0,0,0,0.00)"       />
        </linearGradient>
      </defs>

      {/* ══ Temple arms ═══════════════════════════════════════════════════════
          Nearly horizontal — 4 px drop over 56 px run (≈4°).
          Hinge end: x=58  (left frame outer-left edge)
          Far end:   x=2   (just inside left viewport edge)
          Thickness at both ends: 26 px                                    */}
      {/* Left temple */}
      <path d="M58,60 L58,86 L2,90 L2,64 Z" fill={FILL} />
      {/* Left temple top sheen */}
      <path d="M58,60 L2,64 L2,68 L58,64 Z" fill="rgba(255,255,255,0.08)" />

      {/* Right temple */}
      <path d="M502,60 L502,86 L558,90 L558,64 Z" fill={FILL} />
      <path d="M502,60 L558,64 L558,68 L502,64 Z" fill="rgba(255,255,255,0.08)" />

      {/* ══ Left frame body ═══════════════════════════════════════════════════ */}
      <rect x="58" y="22" width="184" height="138" rx="7" fill={FILL} />
      {fc.crystal && (
        <rect x="58" y="22" width="184" height="138" rx="7"
              fill="none" stroke={STRK} strokeWidth="2.5" />
      )}
      {/* Acetate sheen overlay */}
      <rect x="58" y="22" width="184" height="138" rx="7" fill="url(#sheenV)" />

      {/* Lens opening */}
      <rect x="76" y="40" width="148" height="102" rx="4" fill="white" />
      <rect x="76" y="40" width="148" height="102" rx="4"
            fill="url(#lensLeft)"
            style={{ mixBlendMode: 'multiply', transition: TR }} />
      {/* Inner bevel */}
      <rect x="76" y="40" width="148" height="102" rx="4"
            fill="none" stroke="rgba(0,0,0,0.16)" strokeWidth="1.5" />

      {/* ══ Right frame body ══════════════════════════════════════════════════ */}
      <rect x="318" y="22" width="184" height="138" rx="7" fill={FILL} />
      {fc.crystal && (
        <rect x="318" y="22" width="184" height="138" rx="7"
              fill="none" stroke={STRK} strokeWidth="2.5" />
      )}
      <rect x="318" y="22" width="184" height="138" rx="7" fill="url(#sheenV)" />

      <rect x="336" y="40" width="148" height="102" rx="4" fill="white" />
      <rect x="336" y="40" width="148" height="102" rx="4"
            fill="url(#lensRight)"
            style={{ mixBlendMode: 'multiply', transition: TR }} />
      <rect x="336" y="40" width="148" height="102" rx="4"
            fill="none" stroke="rgba(0,0,0,0.16)" strokeWidth="1.5" />

      {/* ══ Bridge ════════════════════════════════════════════════════════════
          Sits in the upper third — typical MONOLIX keyhole bridge position.
          x=242 (left frame right-edge) to x=318 (right frame left-edge).  */}
      <rect x="242" y="60" width="76" height="18" rx="6" fill={FILL} />
      {fc.crystal && (
        <rect x="242" y="60" width="76" height="18" rx="6"
              fill="none" stroke={STRK} strokeWidth="1.5" />
      )}

      {/* ══ 5-barrel hinge hardware (gold) ═══════════════════════════════════
          Straddles each frame outer edge — extends 16 px outward.          */}
      {/* Left hinge */}
      <rect x="40" y="62" width="24" height="34" rx="4.5" fill={GOLD} />
      {[70, 77, 84, 91].map(y => (
        <line key={y} x1="40" y1={y} x2="64" y2={y}
              stroke={G2} strokeWidth="1.1" opacity="0.70" />
      ))}
      {/* Right hinge */}
      <rect x="496" y="62" width="24" height="34" rx="4.5" fill={GOLD} />
      {[70, 77, 84, 91].map(y => (
        <line key={y} x1="496" y1={y} x2="520" y2={y}
              stroke={G2} strokeWidth="1.1" opacity="0.70" />
      ))}

      {/* ══ 4-hex screws on frame face (left frame left margin) ══════════════
          cx=67 sits in the 18 px rim between frame edge (58) and lens (76). */}
      <circle cx="68" cy="70"  r="5" fill={GOLD} />
      <circle cx="68" cy="70"  r="2.4" fill={G2} />
      <circle cx="68" cy="112" r="5" fill={GOLD} />
      <circle cx="68" cy="112" r="2.4" fill={G2} />
      {/* Right frame right margin (336+148=484 lens right; frame right=502) */}
      <circle cx="492" cy="70"  r="5" fill={GOLD} />
      <circle cx="492" cy="70"  r="2.4" fill={G2} />
      <circle cx="492" cy="112" r="5" fill={GOLD} />
      <circle cx="492" cy="112" r="2.4" fill={G2} />

      {/* ══ Titanium nose pads ════════════════════════════════════════════════ */}
      <ellipse cx="244" cy="80" rx="3.5" ry="5" fill={GOLD} opacity="0.85" />
      <ellipse cx="316" cy="80" rx="3.5" ry="5" fill={GOLD} opacity="0.85" />

      {/* ══ Lens glare highlights ═════════════════════════════════════════════ */}
      <rect x="88"  y="52" width="54" height="8" rx="3.5"
            fill="white" fillOpacity="0.40" />
      <rect x="348" y="52" width="54" height="8" rx="3.5"
            fill="white" fillOpacity="0.40" />

      {/* ══ Subtle DITA temple text ═══════════════════════════════════════════ */}
      <text x="486" y="128" fontSize="7" fill="rgba(255,255,255,0.07)"
            fontFamily="serif" letterSpacing="1.5" textAnchor="middle"
            style={{ userSelect: 'none' }}>
        DITA
      </text>
    </svg>
  );
}

/* ── GRANDMASTER — aviator / teardrop ─────────────────────────────────────── */

function GrandmasterFrame({ lensConfig, frameColor }) {
  const fc    = resolveFrame(frameColor);
  const FRAME = fc.fill;
  const EDGE  = fc.stroke;
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
  const EDGE  = fc.stroke;
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
