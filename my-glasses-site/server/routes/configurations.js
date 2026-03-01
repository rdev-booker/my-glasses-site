const router = require('express').Router();
const db = require('../db');
const { authenticate } = require('../middleware/auth');

router.use(authenticate);

router.get('/', (req, res) => {
  const configs = db.findWhere('configurations', { user_id: req.userId });
  /* Enrich with product info */
  const enriched = configs
    .map(c => {
      const p = db.findById('products', c.product_id);
      return { ...c, product_name: p?.name, brand: p?.brand, svg_type: p?.svg_type };
    })
    .sort((a, b) => new Date(b.updated_at) - new Date(a.updated_at));
  res.json(enriched);
});

router.post('/', (req, res) => {
  const {
    product_id, name, style,
    left_color, left_color2, left_density,
    right_color, right_color2, right_density,
    tolerance, frame_color, size,
  } = req.body;

  if (!product_id || !style || !left_color || !right_color) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  const config = db.insert('configurations', {
    user_id:       req.userId,
    product_id:    Number(product_id),
    name:          name || 'My Configuration',
    style,
    left_color,    left_color2:   left_color2  || null, left_density:  left_density  ?? 50,
    right_color,   right_color2:  right_color2 || null, right_density: right_density ?? 50,
    tolerance:     tolerance ?? 60,
    frame_color:   frame_color || null,
    size:          size || null,
  });

  res.status(201).json(config);
});

router.put('/:id', (req, res) => {
  const existing = db.findById('configurations', req.params.id);
  if (!existing || existing.user_id !== req.userId) {
    return res.status(404).json({ error: 'Configuration not found' });
  }

  const {
    name, style,
    left_color, left_color2, left_density,
    right_color, right_color2, right_density,
    tolerance, frame_color, size,
  } = req.body;

  db.update('configurations', req.params.id, {
    name, style,
    left_color,  left_color2:  left_color2  || null, left_density,
    right_color, right_color2: right_color2 || null, right_density,
    tolerance, frame_color: frame_color || null, size: size || null,
  });

  res.json({ success: true });
});

router.delete('/:id', (req, res) => {
  const existing = db.findById('configurations', req.params.id);
  if (!existing || existing.user_id !== req.userId) {
    return res.status(404).json({ error: 'Not found' });
  }
  db.delete('configurations', req.params.id);
  res.json({ success: true });
});

module.exports = router;
