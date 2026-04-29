#!/usr/bin/env node
'use strict';

/**
 * Merge a prod-exported JSON into the local conf-planner.json.
 * Usage: node scripts/merge-state.cjs <prod-export.json>
 *
 * For each slot/contact:
 *   - Modified : [k]eep local  / [a]ccept incoming  (default: k)
 *   - New      : [a]ccept      / [s]kip              (default: s)
 *   - Deleted  : [d]elete      / [k]eep              (default: k)
 */

const fs   = require('fs');
const path = require('path');

// ── paths ──────────────────────────────────────────────────────────────────
const STATE_PATH = path.join(__dirname, '..', 'conf-planner.json');

// ── args ───────────────────────────────────────────────────────────────────
const [,, inputFile] = process.argv;
if (!inputFile) {
  console.error('Usage: node scripts/merge-state.cjs <prod-export.json>');
  process.exit(1);
}
if (!fs.existsSync(inputFile)) {
  console.error(`File not found: ${inputFile}`);
  process.exit(1);
}

// ── ANSI helpers ───────────────────────────────────────────────────────────
const R = s => `\x1b[31m${s}\x1b[0m`;
const G = s => `\x1b[32m${s}\x1b[0m`;
const Y = s => `\x1b[33m${s}\x1b[0m`;
const B = s => `\x1b[34m${s}\x1b[0m`;
const DIM = s => `\x1b[2m${s}\x1b[0m`;

// ── single-keypress prompt ─────────────────────────────────────────────────
function askKey(prompt, validKeys, defaultKey) {
  return new Promise(resolve => {
    process.stdout.write(prompt);
    const stdin = process.stdin;
    stdin.setRawMode(true);
    stdin.resume();
    stdin.setEncoding('utf8');
    const onData = ch => {
      const key = ch === '\r' || ch === '\n' ? defaultKey : ch.toLowerCase();
      if (ch === '\x03') { // Ctrl-C
        stdin.setRawMode(false);
        stdin.pause();
        console.log('\n\nAborted.');
        process.exit(0);
      }
      if (validKeys.includes(key)) {
        stdin.removeListener('data', onData);
        stdin.setRawMode(false);
        stdin.pause();
        process.stdout.write(key + '\n');
        resolve(key);
      }
    };
    stdin.on('data', onData);
  });
}

// ── diff two objects, return changed fields ────────────────────────────────
function diffObjects(local, incoming) {
  const allKeys = new Set([...Object.keys(local), ...Object.keys(incoming)]);
  const diffs = [];
  for (const k of allKeys) {
    const lv = JSON.stringify(local[k]);
    const iv = JSON.stringify(incoming[k]);
    if (lv !== iv) diffs.push({ key: k, local: local[k], incoming: incoming[k] });
  }
  return diffs;
}

function printDiff(diffs) {
  for (const { key, local, incoming } of diffs) {
    console.log(`  ${B(key)}:`);
    console.log(`    ${R('- ' + JSON.stringify(local))}`);
    console.log(`    ${G('+ ' + JSON.stringify(incoming))}`);
  }
}

// ── load/save state ───────────────────────────────────────────────────────
function loadDb() {
  if (!fs.existsSync(STATE_PATH)) {
    console.error(`State file not found: ${STATE_PATH}`);
    process.exit(1);
  }
  return JSON.parse(fs.readFileSync(STATE_PATH, 'utf8'));
}

function saveDb(state) {
  fs.writeFileSync(STATE_PATH, JSON.stringify(state), 'utf8');
}

// ── main ──────────────────────────────────────────────────────────────────
async function main() {
  const incoming = JSON.parse(fs.readFileSync(inputFile, 'utf8'));
  const local    = loadDb();

  // Normalise: slots is an object keyed by id in AppState
  // contacts is an array; normalise to map by id
  const localSlots    = local.slots    || {};
  const localContacts = Object.fromEntries((local.contacts || []).map(c => [c.id, c]));

  const inSlots    = incoming.slots    || {};
  const inContacts = Object.fromEntries((incoming.contacts || []).map(c => [c.id, c]));

  const allSlotIds    = new Set([...Object.keys(localSlots),    ...Object.keys(inSlots)]);
  const allContactIds = new Set([...Object.keys(localContacts), ...Object.keys(inContacts)]);

  const mergedSlots    = { ...localSlots };
  const mergedContacts = { ...localContacts };

  let accepted = 0, skipped = 0, deleted = 0, kept = 0;

  // ── SLOTS ──────────────────────────────────────────────────────────────
  console.log('\n' + Y('═══════════════════════  SLOTS  ═══════════════════════'));

  for (const id of allSlotIds) {
    const loc = localSlots[id];
    const inc = inSlots[id];

    if (loc && inc) {
      const diffs = diffObjects(loc, inc);
      if (diffs.length === 0) continue; // identical

      console.log(`\n${Y('MODIFIED')} slot ${B(id)}`);
      printDiff(diffs);
      const key = await askKey(
        `  ${DIM('[k]eep local / [a]ccept incoming')}  (default: k) > `,
        ['k', 'a'], 'k'
      );
      if (key === 'a') {
        mergedSlots[id] = inc;
        accepted++;
      } else {
        kept++;
      }

    } else if (!loc && inc) {
      console.log(`\n${G('NEW')} slot ${B(id)}`);
      console.log(`  title: ${inc.title || DIM('(none)')}`);
      console.log(`  dayId: ${inc.dayId}  startSlot: ${inc.startSlot}  duration: ${inc.duration}`);
      const key = await askKey(
        `  ${DIM('[a]ccept / [s]kip')}  (default: s) > `,
        ['a', 's'], 's'
      );
      if (key === 'a') {
        mergedSlots[id] = inc;
        accepted++;
      } else {
        skipped++;
      }

    } else if (loc && !inc) {
      console.log(`\n${R('DELETED')} in incoming — slot ${B(id)}`);
      console.log(`  title: ${loc.title || DIM('(none)')}`);
      const key = await askKey(
        `  ${DIM('[d]elete / [k]eep local')}  (default: k) > `,
        ['d', 'k'], 'k'
      );
      if (key === 'd') {
        delete mergedSlots[id];
        deleted++;
      } else {
        kept++;
      }
    }
  }

  // ── CONTACTS ──────────────────────────────────────────────────────────
  console.log('\n' + Y('═══════════════════════  CONTACTS  ═══════════════════════'));

  for (const id of allContactIds) {
    const loc = localContacts[id];
    const inc = inContacts[id];

    if (loc && inc) {
      const diffs = diffObjects(loc, inc);
      if (diffs.length === 0) continue;

      console.log(`\n${Y('MODIFIED')} contact ${B(id)} ${DIM(loc.name || '')}`);
      printDiff(diffs);
      const key = await askKey(
        `  ${DIM('[k]eep local / [a]ccept incoming')}  (default: k) > `,
        ['k', 'a'], 'k'
      );
      if (key === 'a') {
        mergedContacts[id] = inc;
        accepted++;
      } else {
        kept++;
      }

    } else if (!loc && inc) {
      console.log(`\n${G('NEW')} contact ${B(id)} — ${inc.name || ''} · ${inc.company || ''}`);
      const key = await askKey(
        `  ${DIM('[a]ccept / [s]kip')}  (default: s) > `,
        ['a', 's'], 's'
      );
      if (key === 'a') {
        mergedContacts[id] = inc;
        accepted++;
      } else {
        skipped++;
      }

    } else if (loc && !inc) {
      console.log(`\n${R('DELETED')} in incoming — contact ${B(id)} ${DIM(loc.name || '')}`);
      const key = await askKey(
        `  ${DIM('[d]elete / [k]eep local')}  (default: k) > `,
        ['d', 'k'], 'k'
      );
      if (key === 'd') {
        delete mergedContacts[id];
        deleted++;
      } else {
        kept++;
      }
    }
  }

  // ── write merged state ─────────────────────────────────────────────────
  const merged = {
    ...local,
    slots:    mergedSlots,
    contacts: Object.values(mergedContacts),
  };

  saveDb(merged);

  console.log('\n' + G('═══════════════════════  DONE  ═══════════════════════'));
  console.log(`  accepted : ${G(accepted)}`);
  console.log(`  skipped  : ${DIM(skipped)}`);
  console.log(`  deleted  : ${R(deleted)}`);
  console.log(`  kept     : ${DIM(kept)}`);
  console.log('  conf-planner.json written.\n');
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
