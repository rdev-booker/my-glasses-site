import { useState } from 'react';
import { Sliders, Eye, Layers } from 'lucide-react';

/* ─── Data ─────────────────────────────────────────────────────────────────── */

const COLORS = [
  { name: 'Obsidian',   hex: '#0d0d1a' },
  { name: 'Midnight',   hex: '#1a2744' },
  { name: 'Amethyst',   hex: '#7b2d8b' },
  { name: 'Merlot',     hex: '#7a1530' },
  { name: 'Cognac',     hex: '#b5651d' },
  { name: 'Forest',     hex: '#1e4d3b' },
  { name: 'Arctic',     hex: '#3d85c8' },
  { name: 'Rose',       hex: '#c46d7a' },
  { name: 'Smoke',      hex: '#8a8a8a' },
  { name: 'Champagne',  hex: '#d4b483' },
];

const DENSITY_PRESETS = [
  { name: 'Whisper', value: 15 },
  { name: 'Light',   value: 35 },
  { name: 'Medium',  value: 50 },
  { name: 'Bold',    value: 70 },
  { name: 'Opaque',  value: 90 },
];

/* ─── Initial state ─────────────────────────────────────────────────────────── */

const INIT_STATE = {
  style:      'Solid',
  left:       { colorIdx: 0, color2Idx: 2, density: 50 },
  right:      { colorIdx: 1, color2Idx: 3, density: 50 },
  tolerance:  60,
  activeLens: 'left',
};

/* ─── SVG Gradient Definitions ──────────────────────────────────────────────── */

function GradientDefs({ style, left, right, tolerance }) {
  const t    = tolerance / 100;
  const mid1 = `${((0.5 - t * 0.5) * 100).toFixed(0)}%`;
  const mid2 = `${((0.5 + t * 0.5) * 100).toFixed(0)}%`;

  const buildGradient = (id, lens) => {
    const c1 = COLORS[lens.colorIdx].hex;
    const c2 = COLORS[lens.color2Idx].hex;
    const op = (lens.density / 100).toFixed(2);
    const fadeOp = ((lens.density * 0.12) / 100).toFixed(2);

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

    /* Bi-Gradient: four-stop plateau system */
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
      {buildGradient('lensLeft',  left)}
      {buildGradient('lensRight', right)}
    </defs>
  );
}

/* ─── DITA MONOLIX SVG ──────────────────────────────────────────────────────── */

function MonolixSVG({ lensConfig }) {
  const FRAME = '#181818';
  const EDGE  = '#2c2c2c';

  return (
    <svg
      viewBox="0 0 560 220"
      xmlns="http://www.w3.org/2000/svg"
      className="w-full max-w-xl drop-shadow-[0_24px_64px_rgba(0,0,0,0.7)]"
    >
      <GradientDefs
        style={lensConfig.style}
        left={lensConfig.left}
        right={lensConfig.right}
        tolerance={lensConfig.tolerance}
      />

      {/* ── Left temple ── */}
      <line x1="38" y1="108" x2="4" y2="136"
            stroke={EDGE} strokeWidth="9" strokeLinecap="round" />

      {/* ── Left outer frame ── */}
      <rect x="34" y="34" width="218" height="142" rx="11"
            fill={FRAME} stroke={EDGE} strokeWidth="9" />

      {/* ── Left lens fill ── */}
      <rect x="43" y="43" width="200" height="124" rx="5"
            fill="url(#lensLeft)"
            style={{ transition: 'all 0.5s ease' }} />

      {/* Left lens subtle glare */}
      <rect x="56" y="56" width="62" height="11" rx="4"
            fill="white" fillOpacity="0.07" />

      {/* ── Bridge ── */}
      <path d="M252 98 Q280 76 308 98"
            stroke={EDGE} strokeWidth="8" fill="none" strokeLinecap="round" />

      {/* ── Right outer frame ── */}
      <rect x="308" y="34" width="218" height="142" rx="11"
            fill={FRAME} stroke={EDGE} strokeWidth="9" />

      {/* ── Right lens fill ── */}
      <rect x="317" y="43" width="200" height="124" rx="5"
            fill="url(#lensRight)"
            style={{ transition: 'all 0.5s ease' }} />

      {/* Right lens subtle glare */}
      <rect x="330" y="56" width="62" height="11" rx="4"
            fill="white" fillOpacity="0.07" />

      {/* ── Right temple ── */}
      <line x1="522" y1="108" x2="556" y2="136"
            stroke={EDGE} strokeWidth="9" strokeLinecap="round" />

      {/* Nose pads */}
      <ellipse cx="256" cy="130" rx="3" ry="5" fill={EDGE} opacity="0.6" />
      <ellipse cx="304" cy="130" rx="3" ry="5" fill={EDGE} opacity="0.6" />
    </svg>
  );
}

/* ─── Sub-components ─────────────────────────────────────────────────────────── */

function StyleTab({ label, active, onClick }) {
  return (
    <button
      onClick={onClick}
      className={`px-4 py-2 text-xs tracking-widest uppercase transition-all duration-300 border-b-2 ${
        active
          ? 'border-white text-white'
          : 'border-transparent text-zinc-500 hover:text-zinc-300'
      }`}
    >
      {label}
    </button>
  );
}

function ColorPicker({ label, colorIdx, onChange }) {
  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <span className="text-xs tracking-widest uppercase text-zinc-500">{label}</span>
        <span className="text-xs font-light italic text-zinc-300">
          {COLORS[colorIdx].name}
        </span>
      </div>
      <div className="flex flex-wrap gap-2">
        {COLORS.map((c, i) => (
          <button
            key={c.name}
            title={c.name}
            onClick={() => onChange(i)}
            style={{ backgroundColor: c.hex }}
            className={`w-7 h-7 rounded-full transition-all duration-300 ${
              colorIdx === i
                ? 'ring-2 ring-offset-2 ring-offset-zinc-900 ring-white scale-110'
                : 'opacity-75 hover:opacity-100 hover:scale-105'
            }`}
          />
        ))}
      </div>
    </div>
  );
}

function DensityControl({ density, onChange }) {
  const active = DENSITY_PRESETS.find(p => p.value === density);
  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <span className="flex items-center gap-1.5 text-xs tracking-widest uppercase text-zinc-500">
          <Eye size={12} /> Density
        </span>
        <span className="text-xs font-light italic text-zinc-300">
          {active ? active.name : `Custom · ${density}%`}
        </span>
      </div>

      <div className="flex gap-1 mb-3">
        {DENSITY_PRESETS.map(p => (
          <button
            key={p.name}
            onClick={() => onChange(p.value)}
            className={`flex-1 py-1.5 text-xs rounded transition-all duration-300 ${
              density === p.value
                ? 'bg-white text-black font-medium'
                : 'bg-zinc-800 text-zinc-500 hover:bg-zinc-700 hover:text-white'
            }`}
          >
            {p.name}
          </button>
        ))}
      </div>

      <input
        type="range" min={0} max={100} value={density}
        onChange={e => onChange(Number(e.target.value))}
        className="w-full accent-white h-1 cursor-pointer"
      />
      <div className="flex justify-between text-xs text-zinc-700 mt-1">
        <span>0%</span>
        <span className="text-zinc-400">{density}%</span>
        <span>100%</span>
      </div>
    </div>
  );
}

function ToleranceControl({ tolerance, onChange }) {
  const label =
    tolerance < 20 ? 'Sharp' :
    tolerance < 45 ? 'Defined' :
    tolerance < 70 ? 'Soft' : 'Hazy';

  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <span className="flex items-center gap-1.5 text-xs tracking-widest uppercase text-zinc-500">
          <Sliders size={12} /> Blend Tolerance
        </span>
        <span className="text-xs font-light italic text-zinc-300">{label}</span>
      </div>

      <input
        type="range" min={0} max={100} value={tolerance}
        onChange={e => onChange(Number(e.target.value))}
        className="w-full accent-white h-1 cursor-pointer"
      />
      <div className="flex justify-between text-xs text-zinc-700 mt-1">
        <span>Sharp</span>
        <span>Soft</span>
        <span>Hazy</span>
      </div>
    </div>
  );
}

/* ─── Main App ───────────────────────────────────────────────────────────────── */

export default function App() {
  const [lensConfig, setLensConfig] = useState(INIT_STATE);

  const setStyle      = s => setLensConfig(p => ({ ...p, style: s }));
  const setTolerance  = v => setLensConfig(p => ({ ...p, tolerance: v }));
  const setActiveLens = l => setLensConfig(p => ({ ...p, activeLens: l }));

  const updateLens = (side, patch) =>
    setLensConfig(p => ({ ...p, [side]: { ...p[side], ...patch } }));

  const isBiGrad  = lensConfig.style === 'Bi-Gradient';
  const activeSide = lensConfig.activeLens;          // 'left' | 'right'
  const lens       = lensConfig[activeSide];

  /* For non-Bi-Gradient styles, syncing both lenses keeps the display consistent */
  const handleColor = i => {
    if (isBiGrad) {
      updateLens(activeSide, { colorIdx: i });
    } else {
      setLensConfig(p => ({
        ...p,
        left:  { ...p.left,  colorIdx: i },
        right: { ...p.right, colorIdx: i },
      }));
    }
  };

  const handleColor2 = i => updateLens(activeSide, { color2Idx: i });

  const handleDensity = v => {
    if (isBiGrad) {
      updateLens(activeSide, { density: v });
    } else {
      setLensConfig(p => ({
        ...p,
        left:  { ...p.left,  density: v },
        right: { ...p.right, density: v },
      }));
    }
  };

  /* Summary label shown below the SVG */
  const summaryLabel = isBiGrad
    ? `${COLORS[lensConfig.left.colorIdx].name} · ${COLORS[lensConfig.right.colorIdx].name}`
    : COLORS[lens.colorIdx].name;

  return (
    <div className="min-h-screen bg-white text-zinc-900 flex flex-col lg:flex-row font-sans">

      {/* ════ Left — Visual ════ */}
      <div className="flex-1 flex flex-col items-center justify-center gap-8 px-10 py-16
                      bg-white
                      min-h-[55vh] lg:min-h-screen">

        <div className="text-center">
          <p className="text-xs tracking-[0.5em] text-zinc-600 uppercase mb-1">DITA Eyewear</p>
          <h1 className="text-3xl font-light tracking-[0.35em] text-zinc-100 uppercase">MONOLIX</h1>
        </div>

        <MonolixSVG lensConfig={lensConfig} />

        <div className="text-center space-y-1">
          <p className="text-xs tracking-[0.3em] text-zinc-400 uppercase">{lensConfig.style}</p>
          <p className="text-xs tracking-widest text-zinc-600 italic">{summaryLabel}</p>
        </div>
      </div>

      {/* ════ Right — Config Panel ════ */}
      <aside className="w-full lg:w-[26rem] bg-zinc-50 border-l border-zinc-200 flex flex-col">

        {/* Panel header */}
        <div className="px-8 pt-8 pb-6 border-b border-zinc-800">
          <div className="flex items-center gap-2 mb-1">
            <Layers size={13} className="text-zinc-500" />
            <p className="text-xs tracking-[0.3em] text-zinc-500 uppercase">Lens Customizer</p>
          </div>
          <h2 className="text-xl font-light tracking-widest text-zinc-200">Configure Tint</h2>
        </div>

        {/* Tint style tabs */}
        <div className="px-8 pt-5 pb-0 border-b border-zinc-800">
          <p className="text-xs tracking-widest text-zinc-600 uppercase mb-2">Tint Style</p>
          <div className="flex gap-0">
            {['Solid', 'Gradient', 'Bi-Gradient'].map(s => (
              <StyleTab
                key={s}
                label={s}
                active={lensConfig.style === s}
                onClick={() => setStyle(s)}
              />
            ))}
          </div>
        </div>

        {/* Scrollable config body */}
        <div className="flex-1 overflow-y-auto px-8 py-7 space-y-8">

          {/* Bi-Gradient: lens selector toggle */}
          {isBiGrad && (
            <div className="flex gap-1 p-1 bg-zinc-800 rounded-lg">
              {['left', 'right'].map(side => (
                <button
                  key={side}
                  onClick={() => setActiveLens(side)}
                  className={`flex-1 py-2 text-xs tracking-widest uppercase rounded-md
                              transition-all duration-300 ${
                    activeSide === side
                      ? 'bg-white text-black font-semibold'
                      : 'text-zinc-400 hover:text-white'
                  }`}
                >
                  {side} Lens
                </button>
              ))}
            </div>
          )}

          {/* Primary tint color */}
          <ColorPicker
            label={isBiGrad ? 'Top Color' : 'Tint Color'}
            colorIdx={lens.colorIdx}
            onChange={handleColor}
          />

          {/* Secondary color — Bi-Gradient only */}
          {isBiGrad && (
            <ColorPicker
              label="Bottom Color"
              colorIdx={lens.color2Idx}
              onChange={handleColor2}
            />
          )}

          {/* Density */}
          <DensityControl density={lens.density} onChange={handleDensity} />

          {/* Tolerance — Bi-Gradient only */}
          {isBiGrad && (
            <ToleranceControl
              tolerance={lensConfig.tolerance}
              onChange={setTolerance}
            />
          )}

        </div>

        {/* Panel footer */}
        <div className="px-8 py-6 border-t border-zinc-800 space-y-3">
          <button
            className="w-full py-3 bg-white text-black text-xs tracking-[0.35em] uppercase
                       hover:bg-zinc-100 active:bg-zinc-200 transition-all duration-300 rounded"
          >
            Save Configuration
          </button>
          <p className="text-center text-xs text-zinc-700 tracking-widest">
            DITA Eyewear · Optical Studio
          </p>
        </div>

      </aside>
    </div>
  );
}
