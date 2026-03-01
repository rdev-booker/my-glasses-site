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
  'Black':        { fill: '#0c0c0c',                   stroke: '#252525', crystal: false },
  'Dusk Blue':    { fill: '#1b2d4a',                   stroke: '#243d64', crystal: false },
  'Crystal':      { fill: 'rgba(195,210,226,0.45)',    stroke: 'rgba(155,180,205,0.70)', crystal: true },
  /* GRANDMASTER */
  'Gold':         { fill: '#b8922a',                   stroke: '#d4aa3c', crystal: false },
  'Silver':       { fill: '#888898',                   stroke: '#aaaabb', crystal: false },
  'Gunmetal':     { fill: '#3a3a42',                   stroke: '#505060', crystal: false },
  'Rose Gold':    { fill: '#b07060',                   stroke: '#c48878', crystal: false },
  /* LANCIER */
  'Antique Gold': { fill: '#8a7040',                   stroke: '#a08850', crystal: false },
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

    /* Bi-Gradient: four-stop plateau */
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
   Based on the actual DITA MONOLIX OPTICAL (DTX750-A-01).
   Key design elements:
     · Heavy Japanese acetate rim ~22 px all around
     · Wide chunky temple arms (38 px at hinge) with a gentle backward angle
     · 5-barrel gold hinge hardware with engraved barrel lines
     · 4-hex screws on the frame face near each hinge
     · Diamond-pressed titanium nose pads
   Layout (viewBox 0 0 580 230):
     Left frame  x=42  y=26 w=208 h=152 rx=8  → right edge x=250
     Right frame x=330 y=26 w=208 h=152 rx=8  → left  edge x=330
     Bridge      x=250 y=68 w=80  h=22  rx=6
     Left lens   x=64  y=48 w=164 h=108 rx=4
     Right lens  x=352 y=48 w=164 h=108 rx=4
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
      viewBox="0 0 580 230"
      xmlns="http://www.w3.org/2000/svg"
      style={{ isolation: 'isolate' }}
      className="w-full max-w-2xl drop-shadow-[0_24px_60px_rgba(0,0,0,0.50)]"
    >
      <GradientDefs {...lensConfig} />

      <defs>
        {/* Top-edge sheen for 3-D acetate feel */}
        <linearGradient id="sheenGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%"   stopColor="rgba(255,255,255,0.13)" />
          <stop offset="40%"  stopColor="rgba(255,255,255,0.04)" />
          <stop offset="100%" stopColor="rgba(0,0,0,0.00)"       />
        </linearGradient>
      </defs>

      {/* ── Temple arms — thick bars, slight backward angle ── */}
      <path d="M42,82  L42,120  L2,152  L2,114  Z" fill={FILL} />
      <path d="M538,82 L538,120 L578,152 L578,114 Z" fill={FILL} />

      {/* ── Left frame body (thick acetate) ── */}
      <rect x="42" y="26" width="208" height="152" rx="8" fill={FILL} />
      {fc.crystal && (
        <rect x="42" y="26" width="208" height="152" rx="8"
              fill="none" stroke={STRK} strokeWidth="2.5" />
      )}
      {/* Acetate top-edge sheen */}
      <rect x="42" y="26" width="208" height="152" rx="8" fill="url(#sheenGrad)" />

      {/* White base — multiply blend needs a light ground */}
      <rect x="64" y="48" width="164" height="108" rx="4" fill="white" />
      {/* Tint overlay */}
      <rect x="64" y="48" width="164" height="108" rx="4"
            fill="url(#lensLeft)"
            style={{ mixBlendMode: 'multiply', transition: TR }} />
      {/* Inner bevel shadow */}
      <rect x="64" y="48" width="164" height="108" rx="4"
            fill="none" stroke="rgba(0,0,0,0.20)" strokeWidth="2" />

      {/* ── Right frame body ── */}
      <rect x="330" y="26" width="208" height="152" rx="8" fill={FILL} />
      {fc.crystal && (
        <rect x="330" y="26" width="208" height="152" rx="8"
              fill="none" stroke={STRK} strokeWidth="2.5" />
      )}
      <rect x="330" y="26" width="208" height="152" rx="8" fill="url(#sheenGrad)" />

      <rect x="352" y="48" width="164" height="108" rx="4" fill="white" />
      <rect x="352" y="48" width="164" height="108" rx="4"
            fill="url(#lensRight)"
            style={{ mixBlendMode: 'multiply', transition: TR }} />
      <rect x="352" y="48" width="164" height="108" rx="4"
            fill="none" stroke="rgba(0,0,0,0.20)" strokeWidth="2" />

      {/* ── Bridge ── */}
      <rect x="250" y="68" width="80" height="22" rx="6" fill={FILL} />
      {fc.crystal && (
        <rect x="250" y="68" width="80" height="22" rx="6"
              fill="none" stroke={STRK} strokeWidth="1.5" />
      )}

      {/* ── 5-barrel hinge hardware (gold) ── */}
      {/* Left outer hinge */}
      <rect x="20" y="76" width="26" height="40" rx="5" fill={GOLD} />
      {[83, 91, 99, 107].map(y => (
        <line key={y} x1="20" y1={y} x2="46" y2={y}
              stroke={G2} strokeWidth="1.2" opacity="0.75" />
      ))}
      {/* Right outer hinge */}
      <rect x="534" y="76" width="26" height="40" rx="5" fill={GOLD} />
      {[83, 91, 99, 107].map(y => (
        <line key={y} x1="534" y1={y} x2="560" y2={y}
              stroke={G2} strokeWidth="1.2" opacity="0.75" />
      ))}

      {/* ── 4-hex screws on frame face (left frame, near hinge) ── */}
      <circle cx="53" cy="82"  r="5.5" fill={GOLD} />
      <circle cx="53" cy="82"  r="2.8" fill={G2}   />
      <circle cx="53" cy="120" r="5.5" fill={GOLD} />
      <circle cx="53" cy="120" r="2.8" fill={G2}   />
      {/* Right frame screws */}
      <circle cx="527" cy="82"  r="5.5" fill={GOLD} />
      <circle cx="527" cy="82"  r="2.8" fill={G2}   />
      <circle cx="527" cy="120" r="5.5" fill={GOLD} />
      <circle cx="527" cy="120" r="2.8" fill={G2}   />

      {/* ── Diamond-pressed titanium nose pads ── */}
      <ellipse cx="251" cy="133" rx="4.5" ry="6.5" fill={GOLD} opacity="0.82" />
      <ellipse cx="329" cy="133" rx="4.5" ry="6.5" fill={GOLD} opacity="0.82" />

      {/* ── Lens glare highlights ── */}
      <rect x="78"  y="62" width="62" height="10" rx="4"
            fill="white" fillOpacity="0.42" />
      <rect x="366" y="62" width="62" height="10" rx="4"
            fill="white" fillOpacity="0.42" />

      {/* ── DITA temple logo (subtle) ── */}
      <text x="518" y="139" fontSize="7.5" fill="rgba(255,255,255,0.09)"
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

      {/* Bridge — flat bar */}
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
