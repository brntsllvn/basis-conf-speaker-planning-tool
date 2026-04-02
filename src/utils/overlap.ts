import type { TimeSlot, DayId, VenueId } from '../types/schedule';

export function wouldOverlap(
  slots: TimeSlot[],
  slotId: string,
  dayId: DayId,
  venueId: VenueId,
  startSlot: number,
  durationSlots: number,
): boolean {
  const endSlot = startSlot + durationSlots;
  return slots.some(
    (s) =>
      s.id !== slotId &&
      s.dayId === dayId &&
      s.venueId === venueId &&
      s.startSlot < endSlot &&
      startSlot < s.startSlot + s.durationSlots
  );
}
