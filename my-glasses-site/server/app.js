const express = require('express');
const cors    = require('cors');

const app = express();

/* In production (Netlify Functions), frontend and API share the same domain,
   so CORS isn't strictly needed. We still set it permissively for any
   out-of-band access (e.g. API clients, local dev). */
app.use(cors({
  origin: process.env.NODE_ENV === 'production'
    ? true   // reflect request origin — allows same-domain Netlify calls
    : ['http://localhost:3000', 'http://localhost:3002'],
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

module.exports = app;
