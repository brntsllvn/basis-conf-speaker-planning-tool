import type { SlotType } from '../types/schedule';

export interface SlotColor {
  bg: string;
  border: string;
  text: string;
}

export const SLOT_COLORS: Record<SlotType, SlotColor> = {
  keynote:      { bg: '#1E3A8A', border: '#1E40AF', text: '#FFFFFF' },  // deep blue
  solo:         { bg: '#0F766E', border: '#115E59', text: '#FFFFFF' },  // dark teal
  panel:        { bg: '#6B21A8', border: '#581C87', text: '#FFFFFF' },  // deep purple
  break:        { bg: '#9CA3AF', border: '#6B7280', text: '#FFFFFF' },  // solid gray
  event:        { bg: '#B45309', border: '#92400E', text: '#FFFFFF' },  // dark amber
  emcee:        { bg: '#047857', border: '#065F46', text: '#FFFFFF' },  // dark emerald
  open:         { bg: '#F3F4F6', border: '#9CA3AF', text: '#374151' },  // light gray, dark text
  'load-in':    { bg: '#374151', border: '#1F2937', text: '#FFFFFF' },  // dark charcoal
  'not-in-use': { bg: '#F9FAFB', border: '#D1D5DB', text: '#9CA3AF' },
};
