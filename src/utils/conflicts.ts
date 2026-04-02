import type { TimeSlot, DayId } from '../types/schedule';

export interface Conflict {
  speakerId: string;
  slotA: string;
  slotB: string;
  dayId: DayId;
}

export function detectConflicts(slots: TimeSlot[]): Conflict[] {
  const conflicts: Conflict[] = [];
  const byDay = new Map<DayId, TimeSlot[]>();

  for (const slot of slots) {
    if (slot.assignments.length === 0) continue;
    const arr = byDay.get(slot.dayId) ?? [];
    arr.push(slot);
    byDay.set(slot.dayId, arr);
  }

  for (const [dayId, daySlots] of byDay) {
    const speakerSlots = new Map<string, TimeSlot[]>();
    for (const slot of daySlots) {
      for (const a of slot.assignments) {
        const arr = speakerSlots.get(a.contactId) ?? [];
        arr.push(slot);
        speakerSlots.set(a.contactId, arr);
      }
    }

    for (const [speakerId, sSlots] of speakerSlots) {
      if (sSlots.length < 2) continue;
      for (let i = 0; i < sSlots.length; i++) {
        for (let j = i + 1; j < sSlots.length; j++) {
          const a = sSlots[i];
          const b = sSlots[j];
          if (
            a.startSlot < b.startSlot + b.durationSlots &&
            b.startSlot < a.startSlot + a.durationSlots
          ) {
            conflicts.push({ speakerId, slotA: a.id, slotB: b.id, dayId });
          }
        }
      }
    }
  }

  return conflicts;
}
