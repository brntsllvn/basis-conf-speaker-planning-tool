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
    if (slot.speakerIds.length === 0) continue;
    const arr = byDay.get(slot.dayId) ?? [];
    arr.push(slot);
    byDay.set(slot.dayId, arr);
  }

  for (const [dayId, daySlots] of byDay) {
    const speakerSlots = new Map<string, TimeSlot[]>();
    for (const slot of daySlots) {
      for (const sid of slot.speakerIds) {
        const arr = speakerSlots.get(sid) ?? [];
        arr.push(slot);
        speakerSlots.set(sid, arr);
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
