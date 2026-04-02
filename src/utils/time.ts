import type { SlotIndex } from '../types/schedule';

export const DAY_START_HOUR = 7;
export const DAY_END_HOUR = 18;
export const SLOT_MINUTES = 5;
export const TOTAL_SLOTS = ((DAY_END_HOUR - DAY_START_HOUR) * 60) / SLOT_MINUTES; // 132

export function slotToTime(slot: SlotIndex): string {
  const totalMinutes = DAY_START_HOUR * 60 + slot * SLOT_MINUTES;
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  const period = hours >= 12 ? 'PM' : 'AM';
  const displayHours = hours > 12 ? hours - 12 : hours === 0 ? 12 : hours;
  return `${displayHours}:${minutes.toString().padStart(2, '0')} ${period}`;
}

export function timeToSlot(hours: number, minutes: number): SlotIndex {
  return ((hours - DAY_START_HOUR) * 60 + minutes) / SLOT_MINUTES;
}

export function slotToGridRow(slot: SlotIndex): number {
  return slot + 1; // CSS Grid is 1-based
}

export function durationToSlots(minutes: number): number {
  return minutes / SLOT_MINUTES;
}

export function slotsToDuration(slots: number): number {
  return slots * SLOT_MINUTES;
}
