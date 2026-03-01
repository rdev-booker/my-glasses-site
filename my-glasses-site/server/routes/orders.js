const router = require('express').Router();
const db = require('../db');
const { authenticate } = require('../middleware/auth');

router.use(authenticate);

router.get('/', (req, res) => {
  const orders = db.findWhere('orders', { user_id: req.userId })
    .map(o => {
      const p = db.findById('products', o.product_id);
      return { ...o, product_name: p?.name, brand: p?.brand };
    })
    .sort((a, b) => new Date(b.placed_at || b.created_at) - new Date(a.placed_at || a.created_at));
  res.json(orders);
});

router.post('/', (req, res) => {
  const { product_id, configuration_id, price, snapshot } = req.body;

  if (!product_id || price == null) {
    return res.status(400).json({ error: 'product_id and price are required' });
  }

  const product = db.findById('products', product_id);
  if (!product) return res.status(404).json({ error: 'Product not found' });

  const order = db.insert('orders', {
    user_id:          req.userId,
    product_id:       Number(product_id),
    configuration_id: configuration_id || null,
    price,
    status:           'pending',
    snapshot:         snapshot || {},
    placed_at:        new Date().toISOString(),
  });

  res.status(201).json(order);
});

module.exports = router;
