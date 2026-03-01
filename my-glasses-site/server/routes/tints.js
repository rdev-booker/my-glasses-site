const router = require('express').Router();
const db = require('../db');

router.get('/', (req, res) => {
  const { type } = req.query;
  const tints = type ? db.findWhere('tints', { type }) : db.all('tints');
  res.json(tints);
});

module.exports = router;
