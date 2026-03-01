import { useEffect, useState } from 'react';
import { Trash2, ShoppingBag } from 'lucide-react';
import { api } from '../api';
import { useAuth } from '../AuthContext';
import GlassesPreview from '../components/GlassesPreview';

export default function ProfilePage({ navigate }) {
  const { user } = useAuth();
  const [tab, setTab]                   = useState('configs');
  const [configs, setConfigs]           = useState([]);
  const [orders, setOrders]             = useState([]);
  const [loading, setLoading]           = useState(true);
  const [error, setError]               = useState(null);

  useEffect(() => {
    if (!user) { navigate('auth'); return; }
    Promise.all([api.getConfigurations(), api.getOrders()])
      .then(([c, o]) => { setConfigs(c); setOrders(o); })
      .catch(e => setError(e.message))
      .finally(() => setLoading(false));
  }, [user, navigate]);

  const deleteConfig = async (id) => {
    await api.deleteConfiguration(id);
    setConfigs(cs => cs.filter(c => c.id !== id));
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <p className="text-xs tracking-widest uppercase text-zinc-400 animate-pulse">Loading…</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <p className="text-xs text-red-400">{error}</p>
      </div>
    );
  }

  return (
    <main className="max-w-4xl mx-auto px-6 py-16">
      <header className="mb-10">
        <p className="text-xs tracking-[0.4em] uppercase text-zinc-400 mb-1">Account</p>
        <h1 className="text-2xl font-light tracking-widest uppercase">{user.name}</h1>
        <p className="text-xs text-zinc-400 mt-1">{user.email}</p>
      </header>

      {/* Tabs */}
      <div className="flex border-b border-zinc-200 mb-10">
        {[['configs', 'Saved Configurations'], ['orders', 'Orders']].map(([key, label]) => (
          <button
            key={key}
            onClick={() => setTab(key)}
            className={`mr-8 pb-3 text-xs tracking-[0.25em] uppercase transition-colors ${
              tab === key
                ? 'border-b-2 border-zinc-900 text-zinc-900 -mb-px'
                : 'text-zinc-400 hover:text-zinc-600'
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {/* Saved Configurations */}
      {tab === 'configs' && (
        configs.length === 0 ? (
          <EmptyState icon={<ShoppingBag size={20} />} message="No saved configurations yet." />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {configs.map(c => (
              <ConfigCard key={c.id} config={c} onDelete={() => deleteConfig(c.id)} />
            ))}
          </div>
        )
      )}

      {/* Orders */}
      {tab === 'orders' && (
        orders.length === 0 ? (
          <EmptyState icon={<ShoppingBag size={20} />} message="No orders placed yet." />
        ) : (
          <div className="space-y-4">
            {orders.map(o => <OrderRow key={o.id} order={o} />)}
          </div>
        )
      )}
    </main>
  );
}

function ConfigCard({ config, onDelete }) {
  const lensConfig = {
    style:     config.style,
    left:      { color: config.left_color,  color2: config.left_color2,  density: config.left_density  },
    right:     { color: config.right_color, color2: config.right_color2, density: config.right_density },
    tolerance: config.tolerance,
  };

  return (
    <div className="border border-zinc-200 rounded-lg p-5">
      <div className="bg-zinc-50 rounded px-6 py-8 mb-4 flex items-center justify-center">
        <GlassesPreview svgType={config.svg_type || 'monolix'} lensConfig={lensConfig} />
      </div>
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs tracking-widest uppercase text-zinc-400 mb-0.5">{config.brand} · {config.product_name}</p>
          <p className="text-sm font-medium tracking-wide text-zinc-900">{config.name}</p>
          <p className="text-xs text-zinc-400 mt-1">{config.style} · {config.size || 'No size'}</p>
        </div>
        <button
          onClick={onDelete}
          className="text-zinc-300 hover:text-red-400 transition-colors mt-0.5"
          title="Delete configuration"
        >
          <Trash2 size={15} />
        </button>
      </div>
    </div>
  );
}

function OrderRow({ order }) {
  const STATUS_COLORS = {
    pending:    'text-amber-600 bg-amber-50',
    processing: 'text-blue-600 bg-blue-50',
    shipped:    'text-indigo-600 bg-indigo-50',
    delivered:  'text-green-600 bg-green-50',
    cancelled:  'text-red-600 bg-red-50',
  };

  return (
    <div className="border border-zinc-200 rounded-lg p-5 flex items-center justify-between">
      <div>
        <p className="text-xs tracking-[0.3em] uppercase text-zinc-400 mb-0.5">{order.brand}</p>
        <p className="text-sm font-medium tracking-wide">{order.product_name}</p>
        <p className="text-xs text-zinc-400 mt-1">
          {new Date(order.placed_at).toLocaleDateString('en-US', {
            year: 'numeric', month: 'long', day: 'numeric',
          })}
        </p>
      </div>
      <div className="text-right">
        <p className="text-sm font-light text-zinc-800 mb-2">${order.price.toLocaleString()}</p>
        <span className={`text-[10px] tracking-widest uppercase px-2.5 py-1 rounded-full font-medium
                          ${STATUS_COLORS[order.status] || 'text-zinc-500 bg-zinc-100'}`}>
          {order.status}
        </span>
      </div>
    </div>
  );
}

function EmptyState({ icon, message }) {
  return (
    <div className="flex flex-col items-center justify-center py-20 text-zinc-300 gap-3">
      {icon}
      <p className="text-xs tracking-widest uppercase">{message}</p>
    </div>
  );
}
