import { useState, useMemo, useCallback } from 'react';
import { DndContext, DragOverlay, PointerSensor, useSensor, useSensors, pointerWithin, type DragEndEvent, type DragStartEvent } from '@dnd-kit/core';
import type { TimeSlot } from '../../types/schedule';
import { useSchedule } from '../../state/ScheduleContext';
import { TOTAL_SLOTS } from '../../utils/time';
import { detectConflicts } from '../../utils/conflicts';
import { createSnapToGridModifier } from '../../utils/snapModifier';
import { TimeColumn } from './TimeColumn';
import { VenueColumn } from './VenueColumn';
import { SlotEditor } from './SlotEditor';
import { SlotContent } from './SlotContent';

interface Props {
  rowHeight: number;
}

export function TimeGridView({ rowHeight }: Props) {
  const { state, dispatch, activeDay } = useSchedule();
  const [editingSlot, setEditingSlot] = useState<TimeSlot | null>(null);
  const [draggingSlot, setDraggingSlot] = useState<TimeSlot | null>(null);

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

  const handleDragStart = useCallback(
    (event: DragStartEvent) => {
      const slot = event.active.data.current?.slot as TimeSlot | undefined;
      setDraggingSlot(slot ?? null);
    },
    []
  );

  const handleDragEnd = useCallback(
    (event: DragEndEvent) => {
      setDraggingSlot(null);
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
        collisionDetection={pointerWithin}
        modifiers={[snapModifier]}
        onDragStart={handleDragStart}
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

        <DragOverlay dropAnimation={null}>
          {draggingSlot && (
            <div
              style={{
                width: 200,
                height: draggingSlot.durationSlots * rowHeight,
                opacity: 0.85,
              }}
            >
              <SlotContent slot={draggingSlot} hasConflict={false} />
            </div>
          )}
        </DragOverlay>
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
