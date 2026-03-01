import { useEffect, useState, useCallback } from 'react';
import { ArrowLeft, Eye, Sliders, Layers, Check } from 'lucide-react';
import { api } from '../api';
import { useAuth } from '../AuthContext';
import GlassesPreview from '../components/GlassesPreview';

/* ── Constants ────────────────────────────────────────────────────────────── */

const DENSITY_PRESETS = [
  { name: 'Whisper', value: 15 },
  { name: 'Light',   value: 35 },
  { name: 'Medium',  value: 50 },
  { name: 'Bold',    value: 70 },
  { name: 'Opaque',  value: 90 },
];

function initConfig(tints) {
  const solid = tints.filter(t => t.type === 'Solid');
  const c1 = solid[0]?.hex || '#0d0d1a';
  const c2 = solid[1]?.hex || '#3d85c8';
  return {
    style:      'Solid',
    left:       { color: c1, color2: c2, density: 50 },
    right:      { color: c1, color2: c2, density: 50 },
    tolerance:  60,
    activeLens: 'left',
  };
}

/* ── Main page ────────────────────────────────────────────────────────────── */

export default function ProductPage({ product, navigate }) {
  const { user } = useAuth();

  const [tints, setTints]               = useState([]);
  const [lensConfig, setLensConfig]     = useState(null);
  const [selectedColor, setSelectedColor] = useState(product?.colors?.[0] || null);
  const [selectedSize, setSelectedSize] = useState(null);
  const [saveStatus, setSaveStatus]     = useState(null); // null | 'saving' | 'saved' | 'error'
  const [orderStatus, setOrderStatus]   = useState(null); // null | 'ordering' | 'done' | 'error'
  const [configName, setConfigName]     = useState('My Configuration');
  const [showNameInput, setShowNameInput] = useState(false);

  useEffect(() => {
    api.getTints()
      .then(data => {
        setTints(data);
        setLensConfig(initConfig(data));
      })
      .catch(console.error);
  }, []);

  const setStyle      = s  => setLensConfig(p => ({ ...p, style: s }));
  const setTolerance  = v  => setLensConfig(p => ({ ...p, tolerance: v }));
  const setActiveLens = l  => setLensConfig(p => ({ ...p, activeLens: l }));

  const updateLens = useCallback((side, patch) =>
    setLensConfig(p => ({ ...p, [side]: { ...p[side], ...patch } })),
  []);

  if (!product || !lensConfig) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <p className="text-xs tracking-widest uppercase text-zinc-400 animate-pulse">Loading…</p>
      </div>
    );
  }

  const isBiGrad   = lensConfig.style === 'Bi-Gradient';
  const activeSide = lensConfig.activeLens;
  const lens       = lensConfig[activeSide];

  const solidTints = tints.filter(t => t.type === 'Solid');

  /* Synced handlers */
  const handleColor = (hex) => {
    if (isBiGrad) {
      updateLens(activeSide, { color: hex });
    } else {
      setLensConfig(p => ({
        ...p,
        left:  { ...p.left,  color: hex },
        right: { ...p.right, color: hex },
      }));
    }
  };

  const handleColor2 = (hex) => updateLens(activeSide, { color2: hex });

  const handleDensity = (v) => {
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

  /* Total price */
  const activeTint = solidTints.find(t => t.hex === lens.color);
  const tintAdd    = activeTint?.price_add || 0;
  const totalPrice = product.base_price + tintAdd;

  /* Save configuration */
  const handleSave = async () => {
    if (!user) { navigate('auth'); return; }
    setSaveStatus('saving');
    try {
      await api.saveConfiguration({
        product_id:    product.id,
        name:          configName,
        style:         lensConfig.style,
        left_color:    lensConfig.left.color,
        left_color2:   lensConfig.left.color2 || null,
        left_density:  lensConfig.left.density,
        right_color:   lensConfig.right.color,
        right_color2:  lensConfig.right.color2 || null,
        right_density: lensConfig.right.density,
        tolerance:     lensConfig.tolerance,
        frame_color:   selectedColor,
        size:          selectedSize,
      });
      setSaveStatus('saved');
      setTimeout(() => setSaveStatus(null), 2500);
    } catch {
      setSaveStatus('error');
      setTimeout(() => setSaveStatus(null), 2500);
    }
  };

  /* Place order */
  const handleOrder = async () => {
    if (!user) { navigate('auth'); return; }
    if (!selectedSize) { alert('Please select a size before ordering.'); return; }
    setOrderStatus('ordering');
    try {
      let configId = null;
      // Auto-save the configuration first
      const saved = await api.saveConfiguration({
        product_id:    product.id,
        name:          configName,
        style:         lensConfig.style,
        left_color:    lensConfig.left.color,
        left_color2:   lensConfig.left.color2 || null,
        left_density:  lensConfig.left.density,
        right_color:   lensConfig.right.color,
        right_color2:  lensConfig.right.color2 || null,
        right_density: lensConfig.right.density,
        tolerance:     lensConfig.tolerance,
        frame_color:   selectedColor,
        size:          selectedSize,
      });
      configId = saved.id;

      await api.placeOrder({
        product_id:       product.id,
        configuration_id: configId,
        price:            totalPrice,
        snapshot: {
          product:    product.name,
          brand:      product.brand,
          style:      lensConfig.style,
          frameColor: selectedColor,
          size:       selectedSize,
          tint:       activeTint?.name || 'Custom',
        },
      });
      setOrderStatus('done');
      setTimeout(() => { setOrderStatus(null); navigate('profile'); }, 2000);
    } catch {
      setOrderStatus('error');
      setTimeout(() => setOrderStatus(null), 2500);
    }
  };

  /* Summary label */
  const summaryLabel = isBiGrad
    ? `${tints.find(t => t.hex === lensConfig.left.color)?.name || ''} · ${tints.find(t => t.hex === lensConfig.right.color)?.name || ''}`
    : (tints.find(t => t.hex === lens.color)?.name || 'Custom');

  return (
    <div className="flex flex-col lg:flex-row min-h-[calc(100vh-61px)]">

      {/* ══ Left — Preview ══════════════════════════════════════════════════ */}
      <section className="flex-1 flex flex-col items-center justify-center gap-8 px-10 py-16 bg-white min-h-[55vh]">

        {/* Back */}
        <button
          onClick={() => navigate('store')}
          className="self-start flex items-center gap-2 text-xs tracking-widest uppercase
                     text-zinc-400 hover:text-zinc-700 transition-colors"
        >
          <ArrowLeft size={13} /> Collection
        </button>

        {/* Title */}
        <div className="text-center">
          <p className="text-xs tracking-[0.5em] text-zinc-400 uppercase mb-1">{product.brand}</p>
          <h1 className="text-3xl font-light tracking-[0.35em] text-zinc-900 uppercase">{product.name}</h1>
        </div>

        {/* SVG preview */}
        <GlassesPreview svgType={product.svg_type} lensConfig={lensConfig} />

        {/* Summary */}
        <div className="text-center space-y-1">
          <p className="text-xs tracking-[0.3em] text-zinc-400 uppercase">{lensConfig.style}</p>
          <p className="text-xs tracking-widest text-zinc-500 italic">{summaryLabel}</p>
          <p className="text-sm font-light text-zinc-700 mt-2">${totalPrice.toLocaleString()}</p>
        </div>
      </section>

      {/* ══ Right — Config Panel ════════════════════════════════════════════ */}
      <aside className="w-full lg:w-[26rem] bg-white border-l border-zinc-100 flex flex-col">

        {/* Header */}
        <div className="px-8 pt-8 pb-6 border-b border-zinc-100">
          <div className="flex items-center gap-2 mb-1">
            <Layers size={13} className="text-zinc-400" />
            <p className="text-xs tracking-[0.3em] text-zinc-400 uppercase">Lens Customizer</p>
          </div>
          <h2 className="text-xl font-light tracking-widest text-zinc-900">Configure Tint</h2>
        </div>

        {/* Tint style tabs */}
        <div className="px-8 pt-5 pb-0 border-b border-zinc-100">
          <p className="text-xs tracking-widest text-zinc-400 uppercase mb-3">Tint Style</p>
          <div className="flex gap-0">
            {['Solid', 'Gradient', 'Bi-Gradient'].map(s => (
              <StyleTab key={s} label={s} active={lensConfig.style === s} onClick={() => setStyle(s)} />
            ))}
          </div>
        </div>

        {/* Scrollable body */}
        <div className="flex-1 overflow-y-auto px-8 py-7 space-y-8">

          {/* Bi-Gradient lens selector */}
          {isBiGrad && (
            <div className="flex gap-1 p-1 bg-zinc-100 rounded-lg">
              {['left', 'right'].map(side => (
                <button
                  key={side}
                  onClick={() => setActiveLens(side)}
                  className={`flex-1 py-2 text-xs tracking-widest uppercase rounded-md
                              transition-all duration-300 ${
                    activeSide === side
                      ? 'bg-white text-zinc-900 font-semibold shadow-sm'
                      : 'text-zinc-400 hover:text-zinc-600'
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
            tints={solidTints}
            selected={lens.color}
            onChange={handleColor}
          />

          {/* Secondary color — Bi-Gradient only */}
          {isBiGrad && (
            <ColorPicker
              label="Bottom Color"
              tints={solidTints}
              selected={lens.color2}
              onChange={handleColor2}
            />
          )}

          {/* Density */}
          <DensityControl density={lens.density} onChange={handleDensity} />

          {/* Tolerance — Bi-Gradient only */}
          {isBiGrad && (
            <ToleranceControl tolerance={lensConfig.tolerance} onChange={setTolerance} />
          )}

          <hr className="border-zinc-100" />

          {/* Frame color */}
          {product.colors.length > 0 && (
            <div>
              <p className="text-xs tracking-widest uppercase text-zinc-400 mb-3">Frame Color</p>
              <div className="flex flex-wrap gap-2">
                {product.colors.map(c => (
                  <button
                    key={c}
                    onClick={() => setSelectedColor(c)}
                    className={`px-3 py-1.5 text-xs tracking-wide border rounded transition-all ${
                      selectedColor === c
                        ? 'border-zinc-900 bg-zinc-900 text-white'
                        : 'border-zinc-200 text-zinc-500 hover:border-zinc-400'
                    }`}
                  >
                    {c}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Size */}
          {product.sizes.length > 0 && (
            <div>
              <p className="text-xs tracking-widest uppercase text-zinc-400 mb-3">Size</p>
              <div className="grid grid-cols-2 gap-2">
                {product.sizes.map(s => (
                  <button
                    key={s}
                    onClick={() => setSelectedSize(s)}
                    className={`py-2 text-xs border rounded transition-all ${
                      selectedSize === s
                        ? 'border-zinc-900 bg-zinc-900 text-white'
                        : 'border-zinc-200 text-zinc-500 hover:border-zinc-400'
                    }`}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer actions */}
        <div className="px-8 py-6 border-t border-zinc-100 space-y-3">

          {/* Config name input (shown on demand) */}
          {showNameInput && (
            <input
              type="text"
              value={configName}
              onChange={e => setConfigName(e.target.value)}
              placeholder="Configuration name"
              className="w-full border border-zinc-200 px-3 py-2 text-xs text-zinc-800
                         focus:outline-none focus:border-zinc-900 transition-colors"
            />
          )}

          {/* Save */}
          <button
            onClick={() => { if (!showNameInput) { setShowNameInput(true); } else { handleSave(); } }}
            disabled={saveStatus === 'saving'}
            className={`w-full py-3 border text-xs tracking-[0.3em] uppercase transition-all duration-300 flex items-center justify-center gap-2 ${
              saveStatus === 'saved'
                ? 'border-green-500 text-green-600'
                : saveStatus === 'error'
                  ? 'border-red-400 text-red-500'
                  : 'border-zinc-900 text-zinc-900 hover:bg-zinc-50'
            }`}
          >
            {saveStatus === 'saved'  && <Check size={13} />}
            {saveStatus === 'saving' ? 'Saving…'
              : saveStatus === 'saved'  ? 'Saved!'
              : saveStatus === 'error'  ? 'Error — try again'
              : showNameInput           ? 'Confirm Save'
              : 'Save Configuration'}
          </button>

          {/* Order */}
          <button
            onClick={handleOrder}
            disabled={orderStatus === 'ordering'}
            className={`w-full py-3 text-xs tracking-[0.35em] uppercase transition-all duration-300 ${
              orderStatus === 'done'
                ? 'bg-green-600 text-white'
                : orderStatus === 'error'
                  ? 'bg-red-500 text-white'
                  : 'bg-zinc-900 text-white hover:bg-zinc-700'
            }`}
          >
            {orderStatus === 'ordering' ? 'Placing Order…'
              : orderStatus === 'done'    ? 'Order Placed!'
              : orderStatus === 'error'   ? 'Error — try again'
              : `Buy the Frame · $${totalPrice.toLocaleString()}`}
          </button>

          <p className="text-center text-xs text-zinc-400 tracking-widest">
            {user ? 'Signed in as ' + user.name : 'Sign in to save & order'}
          </p>
        </div>
      </aside>
    </div>
  );
}

/* ── Sub-components ───────────────────────────────────────────────────────── */

function StyleTab({ label, active, onClick }) {
  return (
    <button
      onClick={onClick}
      className={`px-4 py-2 text-xs tracking-widest uppercase transition-all duration-300 border-b-2 ${
        active
          ? 'border-zinc-900 text-zinc-900'
          : 'border-transparent text-zinc-400 hover:text-zinc-600'
      }`}
    >
      {label}
    </button>
  );
}

function ColorPicker({ label, tints, selected, onChange }) {
  const selectedTint = tints.find(t => t.hex === selected);
  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <span className="text-xs tracking-widest uppercase text-zinc-400">{label}</span>
        <span className="text-xs font-light italic text-zinc-500">
          {selectedTint?.name || 'Custom'}
          {selectedTint?.price_add > 0 && ` +$${selectedTint.price_add}`}
        </span>
      </div>
      <div className="flex flex-wrap gap-2">
        {tints.map(t => (
          <button
            key={t.id}
            title={t.name}
            onClick={() => onChange(t.hex)}
            style={{ backgroundColor: t.hex }}
            className={`w-7 h-7 rounded-full transition-all duration-300 ${
              selected === t.hex
                ? 'ring-2 ring-offset-2 ring-offset-white ring-zinc-800 scale-110'
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
        <span className="flex items-center gap-1.5 text-xs tracking-widest uppercase text-zinc-400">
          <Eye size={12} /> Density
        </span>
        <span className="text-xs font-light italic text-zinc-500">
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
                ? 'bg-zinc-900 text-white font-medium'
                : 'bg-zinc-100 text-zinc-400 hover:bg-zinc-200 hover:text-zinc-700'
            }`}
          >
            {p.name}
          </button>
        ))}
      </div>
      <input
        type="range" min={0} max={100} value={density}
        onChange={e => onChange(Number(e.target.value))}
        className="w-full accent-zinc-800 h-1 cursor-pointer"
      />
      <div className="flex justify-between text-xs text-zinc-300 mt-1">
        <span>0%</span>
        <span className="text-zinc-500">{density}%</span>
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
        <span className="flex items-center gap-1.5 text-xs tracking-widest uppercase text-zinc-400">
          <Sliders size={12} /> Blend Tolerance
        </span>
        <span className="text-xs font-light italic text-zinc-500">{label}</span>
      </div>
      <input
        type="range" min={0} max={100} value={tolerance}
        onChange={e => onChange(Number(e.target.value))}
        className="w-full accent-zinc-800 h-1 cursor-pointer"
      />
      <div className="flex justify-between text-xs text-zinc-300 mt-1">
        <span>Sharp</span>
        <span>Soft</span>
        <span>Hazy</span>
      </div>
    </div>
  );
}
