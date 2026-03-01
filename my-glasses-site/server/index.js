const express = require('express');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors({
  origin: ['http://localhost:3000', 'http://localhost:3002'],
  credentials: true,
}));
app.use(express.json());

app.use('/api/auth',           require('./routes/auth'));
app.use('/api/products',       require('./routes/products'));
app.use('/api/tints',          require('./routes/tints'));
app.use('/api/configurations', require('./routes/configurations'));
app.use('/api/orders',         require('./routes/orders'));
app.use('/api/admin',          require('./routes/admin'));

app.get('/api/health', (req, res) => res.json({ status: 'ok' }));

app.listen(PORT, () => {
  console.log(`Glasses API running on http://localhost:${PORT}`);
});
