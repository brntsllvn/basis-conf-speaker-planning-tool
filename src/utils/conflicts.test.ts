import { describe, it, expect } from 'vitest';
import Database from 'better-sqlite3';
import path from 'path';
import { fileURLToPath } from 'url';
import { detectConflicts } from './conflicts';
import type { AppState } from '../types/schedule';
import { createInitialState } from '../seed/initialSchedule';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DB_PATH = path.join(__dirname, '../../conf-planner.db');

function loadState(): AppState {
  try {
    const db = new Database(DB_PATH, { readonly: true });
    const row = db.prepare('SELECT data FROM app_state WHERE id = 1').get() as { data: string } | undefined;
    db.close();
    if (row) return JSON.parse(row.data) as AppState;
  } catch {
    // fall through to seed
  }
  return createInitialState();
}

describe('speaker conflicts', () => {
  it('no speaker is double-booked in any time slot', () => {
    const state = loadState();
    const conflicts = detectConflicts(state.slots);

    if (conflicts.length > 0) {
      const msgs = conflicts.map(
        c => `  ${c.speakerId} double-booked on ${c.dayId}: ${c.slotA} vs ${c.slotB}`
      );
      throw new Error('Speaker conflicts detected:\n' + msgs.join('\n'));
    }

    expect(conflicts).toHaveLength(0);
  });
});
