import type { AppState } from '../types/schedule';
import { createInitialState } from '../seed/initialSchedule';

const STORAGE_KEY = 'conf-planner-v1';

function migrateState(state: AppState): AppState {
  // v1 -> v2: add company field to slots
  for (const slot of state.slots) {
    if ((slot as unknown as Record<string, unknown>).company === undefined) {
      slot.company = '';
    }
  }
  return state;
}

export function loadState(): AppState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      return migrateState(JSON.parse(raw) as AppState);
    }
  } catch (e) {
    console.error('Failed to load state from localStorage:', e);
  }
  return createInitialState();
}

export function saveState(state: AppState): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch (e) {
    console.error('Failed to save state to localStorage:', e);
  }
}

export function exportToJson(state: AppState): string {
  return JSON.stringify(state, null, 2);
}

export function importFromJson(json: string): AppState {
  const parsed = JSON.parse(json) as AppState;
  if (!parsed.version || !parsed.slots || !parsed.contacts) {
    throw new Error('Invalid state file');
  }
  return parsed;
}

export function downloadJson(state: AppState): void {
  const blob = new Blob([exportToJson(state)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `conf-schedule-${new Date().toISOString().slice(0, 10)}.json`;
  a.click();
  URL.revokeObjectURL(url);
}
