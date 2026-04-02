import type { AppState, TimeSlot, Contact, VenueId, SlotIndex } from '../types/schedule';
import { wouldOverlap } from '../utils/overlap';

export type Action =
  | { type: 'MOVE_SLOT'; slotId: string; toVenueId: VenueId; toStartSlot: SlotIndex }
  | { type: 'RESIZE_SLOT'; slotId: string; newDurationSlots: number }
  | { type: 'UPDATE_SLOT'; slotId: string; changes: Partial<TimeSlot> }
  | { type: 'ADD_SLOT'; slot: TimeSlot }
  | { type: 'DELETE_SLOT'; slotId: string }
  | { type: 'ADD_CONTACT'; contact: Contact }
  | { type: 'UPDATE_CONTACT'; contactId: string; changes: Partial<Contact> }
  | { type: 'DELETE_CONTACT'; contactId: string }
  | { type: 'IMPORT_STATE'; state: AppState };

export function scheduleReducer(state: AppState, action: Action): AppState {
  const now = new Date().toISOString();

  switch (action.type) {
    case 'MOVE_SLOT': {
      const slot = state.slots.find((s) => s.id === action.slotId);
      if (!slot) return state;
      if (wouldOverlap(state.slots, slot.id, slot.dayId, action.toVenueId, action.toStartSlot, slot.durationSlots)) {
        return state; // reject — would overlap
      }
      return {
        ...state,
        lastModified: now,
        slots: state.slots.map((s) =>
          s.id === action.slotId
            ? { ...s, venueId: action.toVenueId, startSlot: action.toStartSlot }
            : s
        ),
      };
    }

    case 'RESIZE_SLOT': {
      const slot = state.slots.find((s) => s.id === action.slotId);
      if (!slot) return state;
      const newDuration = Math.max(1, action.newDurationSlots);
      if (wouldOverlap(state.slots, slot.id, slot.dayId, slot.venueId, slot.startSlot, newDuration)) {
        return state; // reject — would overlap
      }
      return {
        ...state,
        lastModified: now,
        slots: state.slots.map((s) =>
          s.id === action.slotId ? { ...s, durationSlots: newDuration } : s
        ),
      };
    }

    case 'UPDATE_SLOT':
      return {
        ...state,
        lastModified: now,
        slots: state.slots.map((s) =>
          s.id === action.slotId ? { ...s, ...action.changes } : s
        ),
      };

    case 'ADD_SLOT': {
      const ns = action.slot;
      if (wouldOverlap(state.slots, ns.id, ns.dayId, ns.venueId, ns.startSlot, ns.durationSlots)) {
        return state; // reject
      }
      return {
        ...state,
        lastModified: now,
        slots: [...state.slots, ns],
      };
    }

    case 'DELETE_SLOT':
      return {
        ...state,
        lastModified: now,
        slots: state.slots.filter((s) => s.id !== action.slotId),
      };

    case 'ADD_CONTACT':
      return {
        ...state,
        lastModified: now,
        contacts: [...state.contacts, action.contact],
      };

    case 'UPDATE_CONTACT':
      return {
        ...state,
        lastModified: now,
        contacts: state.contacts.map((c) =>
          c.id === action.contactId ? { ...c, ...action.changes } : c
        ),
      };

    case 'DELETE_CONTACT': {
      const contactId = action.contactId;
      return {
        ...state,
        lastModified: now,
        contacts: state.contacts.filter((c) => c.id !== contactId),
        slots: state.slots.map((s) => ({
          ...s,
          speakerIds: s.speakerIds.filter((id) => id !== contactId),
          panelLeaderId: s.panelLeaderId === contactId ? undefined : s.panelLeaderId,
        })),
      };
    }

    case 'IMPORT_STATE':
      return { ...action.state, lastModified: now };

    default:
      return state;
  }
}
