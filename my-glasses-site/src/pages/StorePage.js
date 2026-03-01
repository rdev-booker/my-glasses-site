import { useEffect, useState } from 'react';
import { api } from '../api';
import GlassesPreview from '../components/GlassesPreview';

const DEFAULT_CONFIG = {
  style: 'Gradient',
  left:  { color: '#3d85c8', color2: '#0d0d1a', density: 55 },
  right: { color: '#3d85c8', color2: '#0d0d1a', density: 55 },
  tolerance: 60,
};

export default function StorePage({ navigate }) {
  const [products, setProducts] = useState([]);
  const [loading, setLoading]   = useState(true);
  const [error, setError]       = useState(null);

  useEffect(() => {
    api.getProducts()
      .then(setProducts)
      .catch(e => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <p className="text-xs tracking-widest uppercase text-zinc-400 animate-pulse">Loading collection…</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <p className="text-xs tracking-widest uppercase text-red-400">Unable to connect to server</p>
        <p className="text-xs text-zinc-500">{error}</p>
        <p className="text-xs text-zinc-600">
          Start the API server: <span className="font-mono bg-zinc-100 px-2 py-0.5 rounded">cd server &amp;&amp; npm start</span>
        </p>
      </div>
    );
  }

  return (
    <main className="max-w-6xl mx-auto px-6 py-16">
      {/* Header */}
      <header className="mb-14 text-center">
        <p className="text-xs tracking-[0.5em] uppercase text-zinc-400 mb-2">The Collection</p>
        <h1 className="text-3xl font-light tracking-[0.3em] uppercase text-zinc-900">Optical Frames</h1>
      </header>

      {/* Product grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
        {products.map(product => (
          <ProductCard
            key={product.id}
            product={product}
            onClick={() => navigate('product', { product })}
          />
        ))}
      </div>
    </main>
  );
}

function ProductCard({ product, onClick }) {
  return (
    <article
      className="group cursor-pointer"
      onClick={onClick}
    >
      {/* Preview */}
      <div className="bg-zinc-50 rounded-lg px-8 py-10 mb-5 flex items-center justify-center
                      group-hover:bg-zinc-100 transition-colors duration-300">
        <GlassesPreview svgType={product.svg_type} lensConfig={DEFAULT_CONFIG} />
      </div>

      {/* Info */}
      <div className="flex items-start justify-between">
        <div>
          <p className="text-[10px] tracking-[0.4em] uppercase text-zinc-400 mb-0.5">{product.brand}</p>
          <h2 className="text-sm tracking-[0.25em] uppercase font-medium text-zinc-900">{product.name}</h2>
        </div>
        <p className="text-sm font-light text-zinc-700 mt-1">
          ${product.base_price.toLocaleString()}
        </p>
      </div>

      <p className="mt-2 text-xs text-zinc-400 leading-relaxed line-clamp-2">
        {product.description}
      </p>

      <button
        onClick={onClick}
        className="mt-4 w-full py-2.5 border border-zinc-900 text-xs tracking-[0.3em] uppercase
                   hover:bg-zinc-900 hover:text-white transition-all duration-300"
      >
        Customize
      </button>
    </article>
  );
}
