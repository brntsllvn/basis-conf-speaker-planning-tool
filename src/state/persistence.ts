import type { AppState } from '../types/schedule';
import { createInitialState } from '../seed/initialSchedule';

const API_URL = 'http://localhost:3001/api/state';
const LS_KEY = 'conf-planner-v1';

let useServer = true;

async function tryServer<T>(fn: () => Promise<T>): Promise<T | null> {
  if (!useServer) return null;
  try {
    return await fn();
  } catch {
    useServer = false;
    console.warn('Server unavailable, falling back to localStorage');
    return null;
  }
}

export async function loadState(): Promise<AppState> {
  const serverData = await tryServer(async () => {
    const res = await fetch(API_URL);
    const data = await res.json();
    return data as AppState | null;
  });
  if (serverData) return serverData;

  try {
    const raw = localStorage.getItem(LS_KEY);
    if (raw) return JSON.parse(raw) as AppState;
  } catch (e) {
    console.error('Failed to load from localStorage:', e);
  }

  return createInitialState();
}

export async function saveState(state: AppState): Promise<void> {
  await tryServer(async () => {
    await fetch(API_URL, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(state),
    });
  });

  try {
    localStorage.setItem(LS_KEY, JSON.stringify(state));
  } catch (e) {
    console.error('Failed to save to localStorage:', e);
  }
}

export function importFromJson(json: string): AppState {
  const parsed = JSON.parse(json) as AppState;
  if (!parsed.version || !parsed.slots || !parsed.contacts) {
    throw new Error('Invalid state file');
  }
  return parsed;
}

export function downloadJson(state: AppState): void {
  const blob = new Blob([JSON.stringify(state, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `conf-schedule-${new Date().toISOString().slice(0, 16).replace('T', '-').replace(':', '')}.json`;
  a.click();
  URL.revokeObjectURL(url);
}
