import { useState, useMemo, useCallback } from 'react';
import { DndContext, PointerSensor, useSensor, useSensors, type DragEndEvent } from '@dnd-kit/core';
import type { TimeSlot } from '../../types/schedule';
import { useSchedule } from '../../state/ScheduleContext';
import { TOTAL_SLOTS } from '../../utils/time';
import { detectConflicts } from '../../utils/conflicts';
import { createSnapToGridModifier } from '../../utils/snapModifier';
import { TimeColumn } from './TimeColumn';
import { VenueColumn } from './VenueColumn';
import { SlotEditor } from './SlotEditor';

interface Props {
  rowHeight: number;
}

export function TimeGridView({ rowHeight }: Props) {
  const { state, dispatch, activeDay } = useSchedule();
  const [editingSlot, setEditingSlot] = useState<TimeSlot | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } })
  );

  const snapModifier = useMemo(() => createSnapToGridModifier(rowHeight), [rowHeight]);

  const daySlots = useMemo(
    () => state.slots.filter((s) => s.dayId === activeDay),
    [state.slots, activeDay]
  );

  const conflicts = useMemo(() => detectConflicts(state.slots), [state.slots]);
  const conflictSlotIds = useMemo(() => {
    const ids = new Set<string>();
    for (const c of conflicts) {
      ids.add(c.slotA);
      ids.add(c.slotB);
    }
    return ids;
  }, [conflicts]);

  const handleDragEnd = useCallback(
    (event: DragEndEvent) => {
      const { active, over, delta } = event;
      if (!active.data.current) return;

      const slot = active.data.current.slot as TimeSlot;
      const deltaSlots = Math.round(delta.y / rowHeight);
      const newStartSlot = slot.startSlot + deltaSlots;

      if (newStartSlot < 0 || newStartSlot + slot.durationSlots > TOTAL_SLOTS) return;

      const targetVenueId = over?.data?.current?.venueId ?? slot.venueId;

      dispatch({
        type: 'MOVE_SLOT',
        slotId: slot.id,
        toVenueId: targetVenueId,
        toStartSlot: newStartSlot,
      });
    },
    [rowHeight, dispatch]
  );

  return (
    <>
      <DndContext
        sensors={sensors}
        modifiers={[snapModifier]}
        onDragEnd={handleDragEnd}
      >
        <div className="time-grid">
          <TimeColumn rowHeight={rowHeight} />
          {state.venues.map((venue) => (
            <VenueColumn
              key={venue.id}
              venueId={venue.id}
              venueLabel={venue.label}
              dayId={activeDay}
              slots={daySlots.filter((s) => s.venueId === venue.id)}
              rowHeight={rowHeight}
              conflictSlotIds={conflictSlotIds}
              onSlotClick={setEditingSlot}
            />
          ))}
        </div>
      </DndContext>

      {conflicts.length > 0 && (
        <div className="conflict-banner">
          {conflicts.length} conflict{conflicts.length > 1 ? 's' : ''} detected — same speaker in overlapping slots
        </div>
      )}

      {editingSlot && (
        <SlotEditor
          slot={editingSlot}
          onClose={() => setEditingSlot(null)}
        />
      )}
    </>
  );
}
