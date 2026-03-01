const router = require('express').Router();
const db = require('../db');

router.get('/', (req, res) => {
  res.json(db.all('products'));
});

router.get('/:id', (req, res) => {
  const p = db.findById('products', req.params.id);
  if (!p) return res.status(404).json({ error: 'Product not found' });
  res.json(p);
});

module.exports = router;
