/// <reference types="node" />
import { describe, it, expect } from 'vitest';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { detectConflicts } from './conflicts';
import type { AppState } from '../types/schedule';
import { createInitialState } from '../seed/initialSchedule';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const STATE_PATH = path.join(__dirname, '../../conf-planner.json');

function loadState(): AppState {
  try {
    if (fs.existsSync(STATE_PATH)) {
      return JSON.parse(fs.readFileSync(STATE_PATH, 'utf8')) as AppState;
    }
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
