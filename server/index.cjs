const express = require('express');
const cors = require('cors');
const Database = require('better-sqlite3');
const path = require('path');

const DB_PATH = path.join(__dirname, '..', 'conf-planner.db');
const PORT = 3001;

const db = new Database(DB_PATH);
db.pragma('journal_mode = WAL');

// Single table, single row storing the full app state as JSON
db.exec(`
  CREATE TABLE IF NOT EXISTS app_state (
    id INTEGER PRIMARY KEY CHECK (id = 1),
    data TEXT NOT NULL,
    updated_at TEXT NOT NULL DEFAULT (datetime('now'))
  )
`);

const app = express();
app.use(cors());
app.use(express.json({ limit: '10mb' }));

// GET /api/state — return the saved state (or null if none)
app.get('/api/state', (req, res) => {
  const row = db.prepare('SELECT data FROM app_state WHERE id = 1').get();
  if (row) {
    res.type('json').send(row.data);
  } else {
    res.json(null);
  }
});

// PUT /api/state — save the full app state
app.put('/api/state', (req, res) => {
  const data = JSON.stringify(req.body);
  const upsert = db.prepare(`
    INSERT INTO app_state (id, data, updated_at) VALUES (1, ?, datetime('now'))
    ON CONFLICT(id) DO UPDATE SET data = excluded.data, updated_at = excluded.updated_at
  `);
  upsert.run(data);
  res.json({ ok: true });
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
  console.log(`Database: ${DB_PATH}`);
});
