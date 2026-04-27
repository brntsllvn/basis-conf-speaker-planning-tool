#!/usr/bin/env node
'use strict';

/**
 * Write a timestamped JSON snapshot of the SQLite DB to snapshots/.
 * Called by the pre-commit hook; exits 0 even if DB is missing (first-run safety).
 */

const fs       = require('fs');
const path     = require('path');
const Database = require('better-sqlite3');

const DB_PATH  = path.join(__dirname, '..', 'conf-planner.db');
const SNAP_DIR = path.join(__dirname, '..', 'snapshots');

if (!fs.existsSync(DB_PATH)) {
  // No DB yet — skip silently
  process.exit(0);
}

try {
  const db  = new Database(DB_PATH, { readonly: true });
  const row = db.prepare('SELECT data FROM app_state WHERE id = 1').get();
  db.close();

  if (!row) process.exit(0);

  fs.mkdirSync(SNAP_DIR, { recursive: true });

  const now  = new Date();
  const stamp = now.toISOString().replace(/:/g, '-').replace(/\..+/, '');
  const file  = path.join(SNAP_DIR, `${stamp}.json`);

  fs.writeFileSync(file, row.data, 'utf8');
  process.stdout.write(`snapshot: ${path.relative(process.cwd(), file)}\n`);
} catch (err) {
  // Never block a commit over a snapshot failure
  process.stderr.write(`snapshot warning: ${err.message}\n`);
}

process.exit(0);
