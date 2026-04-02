import { useDroppable } from '@dnd-kit/core';
import type { TimeSlot, VenueId, DayId } from '../../types/schedule';
import { TOTAL_SLOTS } from '../../utils/time';
import { DraggableSlot } from './DraggableSlot';

interface Props {
  venueId: VenueId;
  venueLabel: string;
  dayId: DayId;
  slots: TimeSlot[];
  rowHeight: number;
  conflictSlotIds: Set<string>;
  onSlotClick: (slot: TimeSlot) => void;
}

export function VenueColumn({ venueId, venueLabel, slots, rowHeight, conflictSlotIds, onSlotClick }: Props) {
  const { setNodeRef, isOver } = useDroppable({
    id: `venue-${venueId}`,
    data: { venueId },
  });

  return (
    <div className="venue-column-wrapper">
      <div className="venue-header">{venueLabel}</div>
      <div
        ref={setNodeRef}
        className={`venue-column ${isOver ? 'venue-over' : ''}`}
        style={{
          display: 'grid',
          gridTemplateRows: `repeat(${TOTAL_SLOTS}, ${rowHeight}px)`,
          position: 'relative',
        }}
      >
        {/* Grid line every 5-min slot */}
        {Array.from({ length: TOTAL_SLOTS }, (_, i) => {
          const totalMin = 7 * 60 + i * 5;
          const min = totalMin % 60;
          const cls = min === 0 ? 'grid-line-hour' : min % 15 === 0 ? 'grid-line-15' : 'grid-line-5';
          return (
            <div
              key={`line-${i}`}
              className={`grid-line ${cls}`}
              style={{ gridRow: `${i + 1} / span 1` }}
            />
          );
        })}

        {slots.map((slot) => (
          <DraggableSlot
            key={slot.id}
            slot={slot}
            rowHeight={rowHeight}
            hasConflict={conflictSlotIds.has(slot.id)}
            onClick={() => onSlotClick(slot)}
          />
        ))}
      </div>
    </div>
  );
}
