#!/usr/bin/env node
'use strict';

const fs      = require('fs');
const path    = require('path');

const STATE_PATH = path.join(__dirname, '..', 'conf-planner.json');
const SNAP_DIR   = path.join(__dirname, '..', 'snapshots');

if (!fs.existsSync(STATE_PATH)) process.exit(0);

try {
  fs.mkdirSync(SNAP_DIR, { recursive: true });
  const stamp = new Date().toISOString().replace(/:/g, '-').replace(/\..+/, '');
  const file  = path.join(SNAP_DIR, `${stamp}.json`);
  fs.copyFileSync(STATE_PATH, file);
  process.stdout.write(`snapshot: ${path.relative(process.cwd(), file)}\n`);
} catch (err) {
  process.stderr.write(`snapshot warning: ${err.message}\n`);
}

process.exit(0);
