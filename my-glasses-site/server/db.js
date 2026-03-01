/**
 * db.js — Pure-JavaScript JSON file store.
 *
 * Stores all data in a single `data.json` file beside this script.
 * The interface (all, findById, findWhere, findOne, insert, update, delete)
 * is intentionally simple and mirrors what a real SQLite layer would expose.
 *
 * Tables: products · tints · users · configurations · orders
 */

const fs     = require('fs');
const path   = require('path');
const bcrypt = require('bcryptjs');

/* Netlify Functions run on AWS Lambda — the only writable path is /tmp.
   For local development the file sits beside this script as usual.       */
const IS_LAMBDA = !!(process.env.AWS_LAMBDA_FUNCTION_NAME || process.env.LAMBDA_TASK_ROOT);
const DATA_FILE = IS_LAMBDA
  ? '/tmp/glasses-data.json'
  : path.join(__dirname, 'data.json');

const EMPTY = {
  _counters:      { products: 0, tints: 0, users: 0, configurations: 0, orders: 0 },
  products:       [],
  tints:          [],
  users:          [],
  configurations: [],
  orders:         [],
};

/* ── Load / Save ──────────────────────────────────────────────────────────── */

let store;

function load() {
  try {
    store = JSON.parse(fs.readFileSync(DATA_FILE, 'utf8'));
    for (const k of Object.keys(EMPTY)) {
      if (store[k] === undefined) store[k] = JSON.parse(JSON.stringify(EMPTY[k]));
    }
  } catch {
    store = JSON.parse(JSON.stringify(EMPTY));
  }
}

function save() {
  fs.writeFileSync(DATA_FILE, JSON.stringify(store, null, 2));
}

load();

/* ── Public DB interface ──────────────────────────────────────────────────── */

const db = {
  all(table) {
    return store[table] || [];
  },

  findById(table, id) {
    return (store[table] || []).find(r => r.id === Number(id)) || null;
  },

  findWhere(table, conditions) {
    return (store[table] || []).filter(row =>
      Object.entries(conditions).every(([k, v]) => row[k] === v)
    );
  },

  findOne(table, conditions) {
    return (store[table] || []).find(row =>
      Object.entries(conditions).every(([k, v]) => row[k] === v)
    ) || null;
  },

  insert(table, record) {
    store._counters[table] = (store._counters[table] || 0) + 1;
    const id  = store._counters[table];
    const now = new Date().toISOString();
    const row = { id, ...record, created_at: now, updated_at: now };
    store[table] = [...(store[table] || []), row];
    save();
    return row;
  },

  update(table, id, patch) {
    const idx = (store[table] || []).findIndex(r => r.id === Number(id));
    if (idx === -1) return false;
    store[table][idx] = {
      ...store[table][idx],
      ...patch,
      updated_at: new Date().toISOString(),
    };
    save();
    return true;
  },

  delete(table, id) {
    const before = (store[table] || []).length;
    store[table] = (store[table] || []).filter(r => r.id !== Number(id));
    const changed = store[table].length < before;
    if (changed) save();
    return changed;
  },

  count(table) {
    return (store[table] || []).length;
  },
};

/* ── Seed on first run ────────────────────────────────────────────────────── */

if (db.count('products') === 0) {
  const products = [
    {
      name: 'MONOLIX', brand: 'DITA Eyewear', svg_type: 'monolix',
      base_price: 495,
      description: 'A bold, rounded frame inspired by mid-century design. Crafted from premium Japanese acetate with titanium core wire.',
      images: [], colors: ['Black', 'Tortoise', 'Crystal', 'Navy'],
      sizes:  ['44 (Narrow)', '46 (Average)', '49 (Wide)', '52 (Extra Wide)'],
    },
    {
      name: 'GRANDMASTER', brand: 'DITA Eyewear', svg_type: 'grandmaster',
      base_price: 695,
      description: "An iconic aviator silhouette with hand-polished titanium frames. Worn by the world's most discerning collectors.",
      images: [], colors: ['Gold', 'Silver', 'Gunmetal', 'Rose Gold'],
      sizes:  ['48 (Narrow)', '50 (Average)', '54 (Wide)'],
    },
    {
      name: 'LANCIER', brand: 'DITA Eyewear', svg_type: 'lancier',
      base_price: 395,
      description: 'A sleek rectangular frame for the modern minimalist. Lightweight titanium construction with refined precision.',
      images: [], colors: ['Black', 'Silver', 'Antique Gold'],
      sizes:  ['50 (Narrow)', '53 (Average)', '56 (Wide)'],
    },
  ];
  products.forEach(p => db.insert('products', p));
}

if (db.count('tints') === 0) {
  const tints = [
    /* Solid */
    { name: 'Obsidian',       type: 'Solid',       hex: '#0d0d1a', hex2: null, opacity_min: 0.10, opacity_max: 0.95, price_add: 0  },
    { name: 'Midnight',       type: 'Solid',       hex: '#1a2744', hex2: null, opacity_min: 0.10, opacity_max: 0.95, price_add: 0  },
    { name: 'Amethyst',       type: 'Solid',       hex: '#7b2d8b', hex2: null, opacity_min: 0.10, opacity_max: 0.90, price_add: 25 },
    { name: 'Merlot',         type: 'Solid',       hex: '#7a1530', hex2: null, opacity_min: 0.10, opacity_max: 0.90, price_add: 25 },
    { name: 'Cognac',         type: 'Solid',       hex: '#b5651d', hex2: null, opacity_min: 0.10, opacity_max: 0.90, price_add: 25 },
    { name: 'Forest',         type: 'Solid',       hex: '#1e4d3b', hex2: null, opacity_min: 0.10, opacity_max: 0.90, price_add: 0  },
    { name: 'Arctic',         type: 'Solid',       hex: '#3d85c8', hex2: null, opacity_min: 0.10, opacity_max: 0.90, price_add: 0  },
    { name: 'Rose',           type: 'Solid',       hex: '#c46d7a', hex2: null, opacity_min: 0.10, opacity_max: 0.90, price_add: 25 },
    { name: 'Smoke',          type: 'Solid',       hex: '#8a8a8a', hex2: null, opacity_min: 0.10, opacity_max: 0.90, price_add: 0  },
    { name: 'Champagne',      type: 'Solid',       hex: '#d4b483', hex2: null, opacity_min: 0.10, opacity_max: 0.90, price_add: 25 },
    /* Gradient */
    { name: 'Obsidian Fade',  type: 'Gradient',    hex: '#0d0d1a', hex2: null, opacity_min: 0.15, opacity_max: 0.95, price_add: 35 },
    { name: 'Arctic Fade',    type: 'Gradient',    hex: '#3d85c8', hex2: null, opacity_min: 0.15, opacity_max: 0.90, price_add: 35 },
    { name: 'Champagne Fade', type: 'Gradient',    hex: '#d4b483', hex2: null, opacity_min: 0.15, opacity_max: 0.90, price_add: 35 },
    { name: 'Rose Fade',      type: 'Gradient',    hex: '#c46d7a', hex2: null, opacity_min: 0.15, opacity_max: 0.90, price_add: 35 },
    { name: 'Forest Fade',    type: 'Gradient',    hex: '#1e4d3b', hex2: null, opacity_min: 0.15, opacity_max: 0.90, price_add: 35 },
    /* Bi-Gradient */
    { name: 'Ocean Depth',    type: 'Bi-Gradient', hex: '#3d85c8', hex2: '#0d0d1a', opacity_min: 0.20, opacity_max: 0.90, price_add: 65 },
    { name: 'Dusk',           type: 'Bi-Gradient', hex: '#c46d7a', hex2: '#7b2d8b', opacity_min: 0.20, opacity_max: 0.90, price_add: 65 },
    { name: 'Forest Night',   type: 'Bi-Gradient', hex: '#1e4d3b', hex2: '#0d0d1a', opacity_min: 0.20, opacity_max: 0.90, price_add: 65 },
    { name: 'Sunset Cognac',  type: 'Bi-Gradient', hex: '#b5651d', hex2: '#7a1530', opacity_min: 0.20, opacity_max: 0.90, price_add: 65 },
    { name: 'Twilight',       type: 'Bi-Gradient', hex: '#7b2d8b', hex2: '#0d0d1a', opacity_min: 0.20, opacity_max: 0.90, price_add: 65 },
  ];
  tints.forEach(t => db.insert('tints', t));
}

/* ── Seed admin account on first run ──────────────────────────────────────── */

if (!db.findOne('users', { is_admin: true })) {
  const adminEmail    = process.env.ADMIN_EMAIL    || 'admin@dita.com';
  const adminPassword = process.env.ADMIN_PASSWORD || 'admin123456';
  const passwordHash  = bcrypt.hashSync(adminPassword, 12);
  db.insert('users', {
    email:         adminEmail,
    name:          'Admin',
    password_hash: passwordHash,
    is_admin:      true,
  });
  console.log('\n  Admin account ready:');
  console.log(`    Email:    ${adminEmail}`);
  console.log(`    Password: ${adminPassword}\n`);
}

module.exports = db;
