/* ─────────────────────────────────────────────────────────────────────────────
   GlassesPreview
   Renders an SVG frame with a tinted lens overlay using multiply blend mode.

   How the visual trick works:
   1. Each lens shape has a white background rect — this is what multiply blends against.
   2. A colored, semi-transparent gradient fill sits on top with mixBlendMode:'multiply'.
      Because multiply darkens colors, a tint over white produces realistic glass color.
   3. A thin glare highlight floats above everything to add depth.
   4. The SVG uses isolation:'isolate' so blend modes are confined to the SVG stacking context.
───────────────────────────────────────────────────────────────────────────── */

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

/* ── MONOLIX — rounded square ─────────────────────────────────────────────── */

function MonolixFrame({ lensConfig }) {
  const FRAME = '#1a1a1a';
  const EDGE  = '#2c2c2c';
  const TR    = 'all 0.45s ease';

  return (
    <svg
      viewBox="0 0 560 220"
      xmlns="http://www.w3.org/2000/svg"
      style={{ isolation: 'isolate' }}
      className="w-full max-w-xl drop-shadow-[0_20px_56px_rgba(0,0,0,0.45)]"
    >
      <GradientDefs {...lensConfig} />

      {/* Left temple */}
      <line x1="38" y1="108" x2="4" y2="140"
            stroke={EDGE} strokeWidth="9" strokeLinecap="round" />

      {/* Right temple */}
      <line x1="522" y1="108" x2="556" y2="140"
            stroke={EDGE} strokeWidth="9" strokeLinecap="round" />

      {/* Bridge */}
      <path d="M252 100 Q280 78 308 100"
            stroke={EDGE} strokeWidth="8" fill="none" strokeLinecap="round" />

      {/* ── Left lens ── */}
      {/* Frame ring */}
      <rect x="34" y="34" width="218" height="142" rx="13"
            fill="none" stroke={FRAME} strokeWidth="10" />
      {/* White base — multiply blend needs a light ground */}
      <rect x="43" y="43" width="200" height="124" rx="6" fill="white" />
      {/* Tint layer with multiply blend mode */}
      <rect x="43" y="43" width="200" height="124" rx="6"
            fill="url(#lensLeft)"
            style={{ mixBlendMode: 'multiply', transition: TR }} />
      {/* Glare */}
      <rect x="58" y="57" width="58" height="10" rx="4"
            fill="white" fillOpacity="0.45" />

      {/* ── Right lens ── */}
      <rect x="308" y="34" width="218" height="142" rx="13"
            fill="none" stroke={FRAME} strokeWidth="10" />
      <rect x="317" y="43" width="200" height="124" rx="6" fill="white" />
      <rect x="317" y="43" width="200" height="124" rx="6"
            fill="url(#lensRight)"
            style={{ mixBlendMode: 'multiply', transition: TR }} />
      <rect x="332" y="57" width="58" height="10" rx="4"
            fill="white" fillOpacity="0.45" />

      {/* Nose pads */}
      <ellipse cx="256" cy="132" rx="3" ry="5" fill={EDGE} opacity="0.5" />
      <ellipse cx="304" cy="132" rx="3" ry="5" fill={EDGE} opacity="0.5" />
    </svg>
  );
}

/* ── GRANDMASTER — aviator / teardrop ─────────────────────────────────────── */

function GrandmasterFrame({ lensConfig }) {
  const FRAME = '#b8922a';
  const EDGE  = '#d4aa3c';
  const TR    = 'all 0.45s ease';

  /* Teardrop path: wide at top, pointed at bottom */
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
        <clipPath id="leftClip">
          <path d={leftLens} />
        </clipPath>
        <clipPath id="rightClip">
          <path d={rightLens} />
        </clipPath>
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

function LancierFrame({ lensConfig }) {
  const FRAME = '#1a1a1a';
  const EDGE  = '#333333';
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
      <line x1="36" y1="100" x2="2"   y2="130" stroke={EDGE} strokeWidth="8" strokeLinecap="round" />
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

export default function GlassesPreview({ svgType, lensConfig }) {
  switch (svgType) {
    case 'grandmaster': return <GrandmasterFrame lensConfig={lensConfig} />;
    case 'lancier':     return <LancierFrame     lensConfig={lensConfig} />;
    default:            return <MonolixFrame     lensConfig={lensConfig} />;
  }
}
