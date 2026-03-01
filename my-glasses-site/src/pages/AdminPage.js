import { useEffect, useState, useCallback } from 'react';
import { Plus, Pencil, Trash2, X, Check, ChevronDown } from 'lucide-react';
import { api } from '../api';
import { useAuth } from '../AuthContext';

/* ── Tiny helpers ─────────────────────────────────────────────────────────── */

const STATUSES = ['pending', 'processing', 'shipped', 'delivered', 'cancelled'];
const SVG_TYPES = ['monolix', 'grandmaster', 'lancier'];
const TINT_TYPES = ['Solid', 'Gradient', 'Bi-Gradient'];

const STATUS_STYLE = {
  pending:    'bg-amber-50  text-amber-700  border-amber-200',
  processing: 'bg-blue-50   text-blue-700   border-blue-200',
  shipped:    'bg-indigo-50 text-indigo-700 border-indigo-200',
  delivered:  'bg-green-50  text-green-700  border-green-200',
  cancelled:  'bg-red-50    text-red-600    border-red-200',
};

function Stat({ label, value, sub }) {
  return (
    <div className="border border-zinc-100 rounded-lg p-5">
      <p className="text-xs tracking-widest uppercase text-zinc-400 mb-1">{label}</p>
      <p className="text-2xl font-light text-zinc-900">{value}</p>
      {sub && <p className="text-xs text-zinc-400 mt-0.5">{sub}</p>}
    </div>
  );
}

function TabBtn({ label, active, onClick }) {
  return (
    <button
      onClick={onClick}
      className={`pb-3 text-xs tracking-[0.25em] uppercase transition-colors mr-8 ${
        active
          ? 'border-b-2 border-zinc-900 text-zinc-900 -mb-px'
          : 'text-zinc-400 hover:text-zinc-600'
      }`}
    >
      {label}
    </button>
  );
}

/* ── Shared form input ────────────────────────────────────────────────────── */
function Field({ label, hint, ...props }) {
  return (
    <div>
      <label className="block text-xs tracking-widest uppercase text-zinc-400 mb-1.5">{label}</label>
      <input
        {...props}
        className="w-full border border-zinc-200 px-3 py-2 text-sm text-zinc-800
                   focus:outline-none focus:border-zinc-900 transition-colors"
      />
      {hint && <p className="mt-1 text-xs text-zinc-400">{hint}</p>}
    </div>
  );
}

function SelectField({ label, value, onChange, options }) {
  return (
    <div>
      <label className="block text-xs tracking-widest uppercase text-zinc-400 mb-1.5">{label}</label>
      <div className="relative">
        <select
          value={value}
          onChange={e => onChange(e.target.value)}
          className="w-full border border-zinc-200 px-3 py-2 text-sm text-zinc-800 appearance-none
                     focus:outline-none focus:border-zinc-900 transition-colors bg-white"
        >
          {options.map(o => (
            <option key={o.value ?? o} value={o.value ?? o}>{o.label ?? o}</option>
          ))}
        </select>
        <ChevronDown size={13} className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 pointer-events-none" />
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════
   PRODUCTS TAB
═══════════════════════════════════════════════════════════════════════════ */

const EMPTY_PRODUCT = { name: '', brand: 'DITA Eyewear', description: '', base_price: '', svg_type: 'monolix', colors: '', sizes: '' };

function ProductsTab() {
  const [products, setProducts] = useState([]);
  const [form, setForm]         = useState(null); // null | EMPTY_PRODUCT | existing product
  const [saving, setSaving]     = useState(false);
  const [error, setError]       = useState(null);

  const load = useCallback(() => api.admin.getProducts().then(setProducts), []);
  useEffect(() => { load(); }, [load]);

  const setF = k => e => setForm(f => ({ ...f, [k]: e.target.value }));

  const save = async () => {
    setSaving(true);
    setError(null);
    try {
      const payload = {
        ...form,
        base_price: Number(form.base_price),
        colors: typeof form.colors === 'string' ? form.colors : form.colors.join(', '),
        sizes:  typeof form.sizes  === 'string' ? form.sizes  : form.sizes.join(', '),
      };
      if (form.id) {
        await api.admin.updateProduct(form.id, payload);
      } else {
        await api.admin.createProduct(payload);
      }
      await load();
      setForm(null);
    } catch (e) {
      setError(e.message);
    } finally {
      setSaving(false);
    }
  };

  const remove = async (id) => {
    if (!window.confirm('Delete this product? This cannot be undone.')) return;
    await api.admin.deleteProduct(id);
    load();
  };

  const startEdit = (p) => setForm({
    ...p,
    colors: Array.isArray(p.colors) ? p.colors.join(', ') : p.colors,
    sizes:  Array.isArray(p.sizes)  ? p.sizes.join(', ')  : p.sizes,
  });

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-sm tracking-widest uppercase text-zinc-500">Frames</h3>
        {!form && (
          <button
            onClick={() => setForm({ ...EMPTY_PRODUCT })}
            className="flex items-center gap-1.5 px-4 py-2 bg-zinc-900 text-white text-xs tracking-widest uppercase hover:bg-zinc-700 transition-colors"
          >
            <Plus size={12} /> Add Frame
          </button>
        )}
      </div>

      {/* Form panel */}
      {form && (
        <div className="mb-8 border border-zinc-200 rounded-lg p-6 bg-zinc-50">
          <div className="flex items-center justify-between mb-5">
            <p className="text-xs tracking-widest uppercase text-zinc-500">
              {form.id ? 'Edit Frame' : 'New Frame'}
            </p>
            <button onClick={() => setForm(null)} className="text-zinc-400 hover:text-zinc-700">
              <X size={16} />
            </button>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Field label="Frame Name" value={form.name}        onChange={setF('name')}        required />
            <Field label="Brand"      value={form.brand}       onChange={setF('brand')}       required />
            <Field label="Base Price ($)" type="number" value={form.base_price} onChange={setF('base_price')} required />
            <SelectField label="Frame Shape" value={form.svg_type} onChange={v => setForm(f => ({ ...f, svg_type: v }))} options={SVG_TYPES} />
            <div className="col-span-2">
              <Field label="Description" value={form.description} onChange={setF('description')} />
            </div>
            <Field label="Frame Colors" hint="Comma separated: Black, Tortoise, Crystal" value={form.colors} onChange={setF('colors')} />
            <Field label="Sizes"        hint="Comma separated: 44 (Narrow), 46 (Average)" value={form.sizes}  onChange={setF('sizes')}  />
          </div>
          {error && <p className="mt-3 text-xs text-red-500">{error}</p>}
          <div className="flex gap-3 mt-5">
            <button
              onClick={save}
              disabled={saving}
              className="flex items-center gap-1.5 px-5 py-2 bg-zinc-900 text-white text-xs tracking-widest uppercase hover:bg-zinc-700 disabled:opacity-50 transition-colors"
            >
              <Check size={12} /> {saving ? 'Saving…' : form.id ? 'Update' : 'Create'}
            </button>
            <button onClick={() => setForm(null)} className="px-5 py-2 border border-zinc-200 text-xs tracking-widest uppercase text-zinc-500 hover:border-zinc-400 transition-colors">
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Table */}
      <div className="border border-zinc-100 rounded-lg overflow-hidden">
        <table className="w-full text-xs">
          <thead className="bg-zinc-50 border-b border-zinc-100">
            <tr>
              {['Frame', 'Brand', 'Price', 'Shape', 'Colors', 'Sizes', ''].map(h => (
                <th key={h} className="text-left px-4 py-3 text-zinc-400 tracking-widest uppercase font-normal">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-50">
            {products.map(p => (
              <tr key={p.id} className="hover:bg-zinc-50 transition-colors">
                <td className="px-4 py-3 font-medium tracking-wide text-zinc-800">{p.name}</td>
                <td className="px-4 py-3 text-zinc-500">{p.brand}</td>
                <td className="px-4 py-3 text-zinc-700">${p.base_price.toLocaleString()}</td>
                <td className="px-4 py-3 text-zinc-500 capitalize">{p.svg_type}</td>
                <td className="px-4 py-3 text-zinc-400">{(Array.isArray(p.colors) ? p.colors : []).join(', ') || '—'}</td>
                <td className="px-4 py-3 text-zinc-400">{(Array.isArray(p.sizes) ? p.sizes : []).length} sizes</td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-3 justify-end">
                    <button onClick={() => startEdit(p)} className="text-zinc-400 hover:text-zinc-700 transition-colors"><Pencil size={13} /></button>
                    <button onClick={() => remove(p.id)} className="text-zinc-300 hover:text-red-500 transition-colors"><Trash2 size={13} /></button>
                  </div>
                </td>
              </tr>
            ))}
            {products.length === 0 && (
              <tr><td colSpan={7} className="px-4 py-10 text-center text-zinc-300">No frames yet</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════
   TINTS TAB
═══════════════════════════════════════════════════════════════════════════ */

const EMPTY_TINT = { name: '', type: 'Solid', hex: '#3d85c8', hex2: '', opacity_min: '0.10', opacity_max: '0.90', price_add: '0' };

function TintsTab() {
  const [tints, setTints] = useState([]);
  const [form, setForm]   = useState(null);
  const [saving, setSaving] = useState(false);
  const [error, setError]   = useState(null);

  const load = useCallback(() => api.admin.getTints().then(setTints), []);
  useEffect(() => { load(); }, [load]);

  const setF = k => e => setForm(f => ({ ...f, [k]: e.target.value }));

  const save = async () => {
    setSaving(true);
    setError(null);
    try {
      const payload = {
        ...form,
        hex2:        form.hex2 || null,
        opacity_min: Number(form.opacity_min),
        opacity_max: Number(form.opacity_max),
        price_add:   Number(form.price_add),
      };
      if (form.id) {
        await api.admin.updateTint(form.id, payload);
      } else {
        await api.admin.createTint(payload);
      }
      await load();
      setForm(null);
    } catch (e) {
      setError(e.message);
    } finally {
      setSaving(false);
    }
  };

  const remove = async (id) => {
    if (!window.confirm('Delete this tint?')) return;
    await api.admin.deleteTint(id);
    load();
  };

  const startEdit = (t) => setForm({ ...t, hex2: t.hex2 || '', opacity_min: String(t.opacity_min), opacity_max: String(t.opacity_max), price_add: String(t.price_add) });

  const isBiGrad = form?.type === 'Bi-Gradient';

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-sm tracking-widest uppercase text-zinc-500">Lens Tints</h3>
        {!form && (
          <button
            onClick={() => setForm({ ...EMPTY_TINT })}
            className="flex items-center gap-1.5 px-4 py-2 bg-zinc-900 text-white text-xs tracking-widest uppercase hover:bg-zinc-700 transition-colors"
          >
            <Plus size={12} /> Add Tint
          </button>
        )}
      </div>

      {/* Form panel */}
      {form && (
        <div className="mb-8 border border-zinc-200 rounded-lg p-6 bg-zinc-50">
          <div className="flex items-center justify-between mb-5">
            <p className="text-xs tracking-widest uppercase text-zinc-500">{form.id ? 'Edit Tint' : 'New Tint'}</p>
            <button onClick={() => setForm(null)} className="text-zinc-400 hover:text-zinc-700"><X size={16} /></button>
          </div>
          <div className="grid grid-cols-3 gap-4">
            <Field label="Tint Name" value={form.name} onChange={setF('name')} required />
            <SelectField label="Type" value={form.type} onChange={v => setForm(f => ({ ...f, type: v }))} options={TINT_TYPES} />
            <div className="flex gap-3">
              <div className="flex-1">
                <Field label="Primary Color (hex)" value={form.hex} onChange={setF('hex')} placeholder="#000000" />
              </div>
              <div className="mt-6 flex items-center">
                <div
                  className="w-9 h-9 rounded border border-zinc-200 shadow-inner"
                  style={{ backgroundColor: form.hex }}
                />
              </div>
            </div>
            {isBiGrad && (
              <div className="flex gap-3">
                <div className="flex-1">
                  <Field label="Secondary Color (hex)" value={form.hex2} onChange={setF('hex2')} placeholder="#000000" />
                </div>
                <div className="mt-6 flex items-center">
                  <div
                    className="w-9 h-9 rounded border border-zinc-200 shadow-inner"
                    style={{ backgroundColor: form.hex2 || '#ffffff' }}
                  />
                </div>
              </div>
            )}
            <Field label="Opacity Min (0–1)" type="number" step="0.01" min="0" max="1" value={form.opacity_min} onChange={setF('opacity_min')} />
            <Field label="Opacity Max (0–1)" type="number" step="0.01" min="0" max="1" value={form.opacity_max} onChange={setF('opacity_max')} />
            <Field label="Price Add-on ($)"  type="number" step="1"    min="0" value={form.price_add}   onChange={setF('price_add')}   />
          </div>
          {error && <p className="mt-3 text-xs text-red-500">{error}</p>}
          <div className="flex gap-3 mt-5">
            <button
              onClick={save}
              disabled={saving}
              className="flex items-center gap-1.5 px-5 py-2 bg-zinc-900 text-white text-xs tracking-widest uppercase hover:bg-zinc-700 disabled:opacity-50 transition-colors"
            >
              <Check size={12} /> {saving ? 'Saving…' : form.id ? 'Update' : 'Create'}
            </button>
            <button onClick={() => setForm(null)} className="px-5 py-2 border border-zinc-200 text-xs tracking-widest uppercase text-zinc-500 hover:border-zinc-400 transition-colors">
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Table */}
      <div className="border border-zinc-100 rounded-lg overflow-hidden">
        <table className="w-full text-xs">
          <thead className="bg-zinc-50 border-b border-zinc-100">
            <tr>
              {['Color', 'Name', 'Type', 'Opacity Range', 'Price Add', ''].map(h => (
                <th key={h} className="text-left px-4 py-3 text-zinc-400 tracking-widest uppercase font-normal">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-50">
            {tints.map(t => (
              <tr key={t.id} className="hover:bg-zinc-50 transition-colors">
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-full border border-zinc-200 shadow-inner flex-shrink-0"
                         style={{ backgroundColor: t.hex }} />
                    {t.hex2 && (
                      <div className="w-6 h-6 rounded-full border border-zinc-200 shadow-inner flex-shrink-0"
                           style={{ backgroundColor: t.hex2 }} />
                    )}
                  </div>
                </td>
                <td className="px-4 py-3 font-medium text-zinc-800">{t.name}</td>
                <td className="px-4 py-3 text-zinc-500">{t.type}</td>
                <td className="px-4 py-3 text-zinc-400">{(t.opacity_min * 100).toFixed(0)}% – {(t.opacity_max * 100).toFixed(0)}%</td>
                <td className="px-4 py-3 text-zinc-500">{t.price_add > 0 ? `+$${t.price_add}` : '—'}</td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-3 justify-end">
                    <button onClick={() => startEdit(t)} className="text-zinc-400 hover:text-zinc-700 transition-colors"><Pencil size={13} /></button>
                    <button onClick={() => remove(t.id)} className="text-zinc-300 hover:text-red-500 transition-colors"><Trash2 size={13} /></button>
                  </div>
                </td>
              </tr>
            ))}
            {tints.length === 0 && (
              <tr><td colSpan={6} className="px-4 py-10 text-center text-zinc-300">No tints yet</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════
   ORDERS TAB
═══════════════════════════════════════════════════════════════════════════ */

function OrdersTab() {
  const [orders, setOrders] = useState([]);
  const [filter, setFilter] = useState('all');

  const load = useCallback(() => api.admin.getOrders().then(setOrders), []);
  useEffect(() => { load(); }, [load]);

  const updateStatus = async (id, status) => {
    await api.admin.updateOrderStatus(id, status);
    setOrders(os => os.map(o => o.id === id ? { ...o, status } : o));
  };

  const displayed = filter === 'all' ? orders : orders.filter(o => o.status === filter);

  return (
    <div>
      {/* Filter bar */}
      <div className="flex items-center gap-2 mb-6 flex-wrap">
        {['all', ...STATUSES].map(s => (
          <button
            key={s}
            onClick={() => setFilter(s)}
            className={`px-3 py-1.5 text-xs rounded-full border transition-colors capitalize ${
              filter === s
                ? 'border-zinc-900 bg-zinc-900 text-white'
                : 'border-zinc-200 text-zinc-500 hover:border-zinc-400'
            }`}
          >
            {s === 'all' ? `All (${orders.length})` : `${s} (${orders.filter(o => o.status === s).length})`}
          </button>
        ))}
      </div>

      <div className="border border-zinc-100 rounded-lg overflow-hidden">
        <table className="w-full text-xs">
          <thead className="bg-zinc-50 border-b border-zinc-100">
            <tr>
              {['#', 'Customer', 'Product', 'Price', 'Date', 'Status', 'Update'].map(h => (
                <th key={h} className="text-left px-4 py-3 text-zinc-400 tracking-widest uppercase font-normal">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-50">
            {displayed.map(o => (
              <tr key={o.id} className="hover:bg-zinc-50 transition-colors">
                <td className="px-4 py-3 text-zinc-400">#{o.id}</td>
                <td className="px-4 py-3">
                  <p className="font-medium text-zinc-800">{o.customer_name}</p>
                  <p className="text-zinc-400">{o.customer_email}</p>
                </td>
                <td className="px-4 py-3">
                  <p className="text-zinc-700">{o.product_name}</p>
                  <p className="text-zinc-400">{o.brand}</p>
                </td>
                <td className="px-4 py-3 text-zinc-700 font-medium">${o.price.toLocaleString()}</td>
                <td className="px-4 py-3 text-zinc-400">
                  {new Date(o.placed_at || o.created_at).toLocaleDateString('en-US', {
                    month: 'short', day: 'numeric', year: 'numeric',
                  })}
                </td>
                <td className="px-4 py-3">
                  <span className={`px-2 py-0.5 rounded-full border text-[10px] tracking-widest uppercase capitalize ${STATUS_STYLE[o.status] || ''}`}>
                    {o.status}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <div className="relative">
                    <select
                      value={o.status}
                      onChange={e => updateStatus(o.id, e.target.value)}
                      className="text-xs border border-zinc-200 rounded px-2 py-1 pr-6 appearance-none
                                 text-zinc-600 focus:outline-none focus:border-zinc-900 bg-white cursor-pointer"
                    >
                      {STATUSES.map(s => (
                        <option key={s} value={s} className="capitalize">{s}</option>
                      ))}
                    </select>
                    <ChevronDown size={10} className="absolute right-2 top-1/2 -translate-y-1/2 text-zinc-400 pointer-events-none" />
                  </div>
                </td>
              </tr>
            ))}
            {displayed.length === 0 && (
              <tr><td colSpan={7} className="px-4 py-10 text-center text-zinc-300">No orders found</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════
   MAIN ADMIN PAGE
═══════════════════════════════════════════════════════════════════════════ */

export default function AdminPage({ navigate }) {
  const { user }   = useAuth();
  const [tab, setTab]     = useState('products');
  const [stats, setStats] = useState(null);

  useEffect(() => {
    if (!user?.is_admin) { navigate('store'); return; }
    api.admin.getStats()
      .then(setStats)
      .catch(console.error);
  }, [user, navigate]);

  if (!user?.is_admin) return null;

  return (
    <main className="max-w-6xl mx-auto px-6 py-12">
      {/* Header */}
      <header className="mb-10">
        <p className="text-xs tracking-[0.4em] uppercase text-zinc-400 mb-1">Protected Area</p>
        <h1 className="text-2xl font-light tracking-widest uppercase text-zinc-900">Admin Panel</h1>
      </header>

      {/* Stats row */}
      {stats && (
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-12">
          <Stat label="Frames"   value={stats.products} />
          <Stat label="Tints"    value={stats.tints} />
          <Stat label="Customers" value={stats.users} />
          <Stat label="Orders"   value={stats.orders} />
          <Stat label="Revenue"  value={`$${stats.revenue.toLocaleString()}`} sub="all time" />
        </div>
      )}

      {/* Tabs */}
      <div className="flex border-b border-zinc-200 mb-10">
        <TabBtn label="Frames"  active={tab === 'products'} onClick={() => setTab('products')} />
        <TabBtn label="Tints"   active={tab === 'tints'}    onClick={() => setTab('tints')}    />
        <TabBtn label="Orders"  active={tab === 'orders'}   onClick={() => setTab('orders')}   />
      </div>

      {tab === 'products' && <ProductsTab />}
      {tab === 'tints'    && <TintsTab    />}
      {tab === 'orders'   && <OrdersTab   />}
    </main>
  );
}
