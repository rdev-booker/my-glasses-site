/**
 * /api/admin — Protected admin routes.
 * Requires: valid JWT with isAdmin: true
 */

const router = require('express').Router();
const db = require('../db');
const { authenticate, adminOnly } = require('../middleware/auth');

router.use(authenticate, adminOnly);

/* ══ Stats ════════════════════════════════════════════════════════════════ */

router.get('/stats', (req, res) => {
  const orders = db.all('orders');
  res.json({
    products: db.count('products'),
    tints:    db.count('tints'),
    users:    db.all('users').filter(u => !u.is_admin).length,
    orders:   orders.length,
    revenue:  orders.reduce((sum, o) => sum + (o.price || 0), 0),
  });
});

/* ══ Products ═════════════════════════════════════════════════════════════ */

router.get('/products', (req, res) => {
  res.json(db.all('products'));
});

router.post('/products', (req, res) => {
  const { name, brand, description, base_price, svg_type, colors, sizes } = req.body;
  if (!name || !brand || base_price == null) {
    return res.status(400).json({ error: 'name, brand and base_price are required' });
  }
  const toArr = (v) => Array.isArray(v)
    ? v
    : String(v || '').split(',').map(s => s.trim()).filter(Boolean);

  const product = db.insert('products', {
    name:        name.trim(),
    brand:       brand.trim(),
    description: (description || '').trim(),
    base_price:  Number(base_price),
    svg_type:    svg_type || 'monolix',
    images:      [],
    colors:      toArr(colors),
    sizes:       toArr(sizes),
  });
  res.status(201).json(product);
});

router.put('/products/:id', (req, res) => {
  const existing = db.findById('products', req.params.id);
  if (!existing) return res.status(404).json({ error: 'Product not found' });

  const { name, brand, description, base_price, svg_type, colors, sizes } = req.body;
  const toArr = (v, fallback) => v === undefined ? fallback
    : Array.isArray(v) ? v
    : String(v).split(',').map(s => s.trim()).filter(Boolean);

  db.update('products', req.params.id, {
    name:        (name?.trim())     ?? existing.name,
    brand:       (brand?.trim())    ?? existing.brand,
    description: description        ?? existing.description,
    base_price:  base_price != null ? Number(base_price) : existing.base_price,
    svg_type:    svg_type           ?? existing.svg_type,
    colors:      toArr(colors,  existing.colors),
    sizes:       toArr(sizes,   existing.sizes),
  });
  res.json(db.findById('products', req.params.id));
});

router.delete('/products/:id', (req, res) => {
  if (!db.findById('products', req.params.id)) {
    return res.status(404).json({ error: 'Product not found' });
  }
  db.delete('products', req.params.id);
  res.json({ success: true });
});

/* ══ Tints ════════════════════════════════════════════════════════════════ */

router.get('/tints', (req, res) => {
  res.json(db.all('tints'));
});

router.post('/tints', (req, res) => {
  const { name, type, hex, hex2, opacity_min, opacity_max, price_add } = req.body;
  if (!name || !type || !hex) {
    return res.status(400).json({ error: 'name, type and hex are required' });
  }
  const VALID_TYPES = ['Solid', 'Gradient', 'Bi-Gradient'];
  if (!VALID_TYPES.includes(type)) {
    return res.status(400).json({ error: `type must be one of: ${VALID_TYPES.join(', ')}` });
  }
  const tint = db.insert('tints', {
    name:        name.trim(),
    type,
    hex,
    hex2:        hex2 || null,
    opacity_min: opacity_min != null ? Number(opacity_min) : 0.10,
    opacity_max: opacity_max != null ? Number(opacity_max) : 0.90,
    price_add:   price_add   != null ? Number(price_add)   : 0,
  });
  res.status(201).json(tint);
});

router.put('/tints/:id', (req, res) => {
  const existing = db.findById('tints', req.params.id);
  if (!existing) return res.status(404).json({ error: 'Tint not found' });

  const { name, type, hex, hex2, opacity_min, opacity_max, price_add } = req.body;
  db.update('tints', req.params.id, {
    name:        (name?.trim()) ?? existing.name,
    type:        type           ?? existing.type,
    hex:         hex            ?? existing.hex,
    hex2:        hex2 !== undefined ? (hex2 || null) : existing.hex2,
    opacity_min: opacity_min != null ? Number(opacity_min) : existing.opacity_min,
    opacity_max: opacity_max != null ? Number(opacity_max) : existing.opacity_max,
    price_add:   price_add   != null ? Number(price_add)   : existing.price_add,
  });
  res.json(db.findById('tints', req.params.id));
});

router.delete('/tints/:id', (req, res) => {
  if (!db.findById('tints', req.params.id)) {
    return res.status(404).json({ error: 'Tint not found' });
  }
  db.delete('tints', req.params.id);
  res.json({ success: true });
});

/* ══ Orders ═══════════════════════════════════════════════════════════════ */

const VALID_STATUSES = ['pending', 'processing', 'shipped', 'delivered', 'cancelled'];

router.get('/orders', (req, res) => {
  const orders = db.all('orders')
    .map(o => {
      const u = db.findById('users',    o.user_id);
      const p = db.findById('products', o.product_id);
      return {
        ...o,
        customer_name:  u?.name  || 'Deleted user',
        customer_email: u?.email || '',
        product_name:   p?.name  || 'Deleted product',
        brand:          p?.brand || '',
      };
    })
    .sort((a, b) =>
      new Date(b.placed_at || b.created_at) - new Date(a.placed_at || a.created_at)
    );
  res.json(orders);
});

router.patch('/orders/:id/status', (req, res) => {
  const { status } = req.body;
  if (!VALID_STATUSES.includes(status)) {
    return res.status(400).json({ error: `status must be one of: ${VALID_STATUSES.join(', ')}` });
  }
  const order = db.findById('orders', req.params.id);
  if (!order) return res.status(404).json({ error: 'Order not found' });
  db.update('orders', req.params.id, { status });
  res.json({ success: true });
});

module.exports = router;
