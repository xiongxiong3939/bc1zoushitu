require('dotenv').config();
const path = require('path');
const express = require('express');
const fetch = require('node-fetch');
const cors = require('cors');
const sqlite3 = require('sqlite3').verbose();

const app = express();
app.use(cors());
app.use(express.json());

const TRON_API = 'https://apilist.tronscanapi.com/api/block';
const API_KEY = process.env.TRON_PRO_API_KEY || '';

// Decide DB adapter: prefer PostgreSQL when DATABASE_URL is set (Render uses this env)
const useSqlite = !process.env.DATABASE_URL;

const fs = require('fs');
let sqliteDb = null;
let pool = null;

if (useSqlite) {
  // Use SQLite database file located at server/data
  const DATA_DIR = path.join(__dirname, 'data');
  const DB_FILE = path.join(DATA_DIR, 'app.db');

  // ensure data directory exists
  if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });

  sqliteDb = new sqlite3.Database(DB_FILE, (err) => {
    if (err) console.error('SQLite open error:', err.message);
    else console.log('SQLite DB opened at', DB_FILE);
  });
} else {
  // Use PostgreSQL via `server/db.js` which reads from process.env.DATABASE_URL
  try {
    pool = require('./db');
    console.log('Using PostgreSQL (DATABASE_URL detected)');
  } catch (e) {
    console.error('Failed to load pg pool:', e.message);
  }
}

// Serve static front-end from /public for single-service deployments (Render)
app.use(express.static(path.join(__dirname, 'public')));

app.get('/api/health', async (req, res) => {
  if (useSqlite) {
    // Check sqlite DB by executing a simple query
    sqliteDb.get('SELECT 1 as ok', [], (err, row) => {
      if (err) return res.json({ ok: true, db: false, error: err.message });
      res.json({ ok: true, db: true });
    });
  } else {
    if (!pool) return res.json({ ok: true, db: false, error: 'pg pool not initialized' });
    try {
      await pool.query('SELECT 1');
      res.json({ ok: true, db: true });
    } catch (e) {
      res.json({ ok: true, db: false, error: e.message });
    }
  }
});

// Simple proxy to TronScan block API. Forwards all query params.
app.get('/api/block', async (req, res) => {
  try {
    const url = new URL(TRON_API);
    Object.keys(req.query).forEach(k => url.searchParams.set(k, req.query[k]));

    const r = await fetch(url.toString(), {
      headers: {
        'TRON-PRO-API-KEY': API_KEY
      },
      timeout: 15000
    });
    const text = await r.text();
    res.status(r.status).send(text);
  } catch (e) {
    console.error('Proxy /api/block error:', e.message);
    res.status(500).json({ error: e.message });
  }
});

const port = process.env.PORT || 3000;
// SPA fallback: serve index.html for unknown routes (so the front-end can handle routing)
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(port, () => console.log(`Proxy + static server listening on ${port}`));
