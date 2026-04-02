import type { AppState } from '../types/schedule';
import { createInitialState } from '../seed/initialSchedule';

const API_URL = 'http://localhost:3001/api/state';
const LS_KEY = 'conf-planner-v1';

function migrateState(state: AppState): AppState {
  for (const slot of state.slots) {
    const s = slot as unknown as Record<string, unknown>;
    if (s.company === undefined) slot.company = '';
    if (s.assignments === undefined) {
      const speakerIds = (s.speakerIds as string[]) ?? [];
      const panelLeaderId = s.panelLeaderId as string | undefined;
      slot.assignments = speakerIds.map((id: string) => ({
        contactId: id,
        slotRole: (id === panelLeaderId ? 'Moderator' : 'Speaker') as 'Moderator' | 'Speaker',
      }));
      delete s.speakerIds;
      delete s.panelLeaderId;
    }
  }
  for (const contact of state.contacts) {
    const c = contact as unknown as Record<string, unknown>;
    if (c.company === undefined) contact.company = '';
    if (c.title === undefined) contact.title = '';
    if (c.supportName === undefined) contact.supportName = '';
    if (c.supportEmail === undefined) contact.supportEmail = '';
    if (c.supportPhone === undefined) contact.supportPhone = '';
    delete c.role;
  }
  return state;
}

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
  // Try server first
  const serverData = await tryServer(async () => {
    const res = await fetch(API_URL);
    const data = await res.json();
    return data as AppState | null;
  });
  if (serverData) return migrateState(serverData);

  // Fall back to localStorage
  try {
    const raw = localStorage.getItem(LS_KEY);
    if (raw) return migrateState(JSON.parse(raw) as AppState);
  } catch (e) {
    console.error('Failed to load from localStorage:', e);
  }

  return createInitialState();
}

export async function saveState(state: AppState): Promise<void> {
  // Try server
  await tryServer(async () => {
    await fetch(API_URL, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(state),
    });
  });

  // Always save to localStorage as backup
  try {
    localStorage.setItem(LS_KEY, JSON.stringify(state));
  } catch (e) {
    console.error('Failed to save to localStorage:', e);
  }
}

export function resetToSeed(): AppState {
  localStorage.removeItem(LS_KEY);
  // Also clear server (fire and forget)
  tryServer(async () => {
    await fetch(API_URL, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(createInitialState()),
    });
  });
  return createInitialState();
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
