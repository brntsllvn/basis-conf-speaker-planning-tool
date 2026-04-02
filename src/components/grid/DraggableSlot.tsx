import { useDraggable } from '@dnd-kit/core';
import type { TimeSlot } from '../../types/schedule';
import { slotToGridRow } from '../../utils/time';
import { SlotContent } from './SlotContent';
import { ResizeHandle } from './ResizeHandle';

interface Props {
  slot: TimeSlot;
  rowHeight: number;
  hasConflict: boolean;
  onClick: () => void;
}

export function DraggableSlot({ slot, rowHeight, hasConflict, onClick }: Props) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: slot.id,
    data: { slot },
  });

  const style: React.CSSProperties = {
    gridRow: `${slotToGridRow(slot.startSlot)} / span ${slot.durationSlots}`,
    transform: transform
      ? `translate3d(${transform.x}px, ${transform.y}px, 0)`
      : undefined,
    opacity: isDragging ? 0.5 : 1,
    position: 'relative',
    zIndex: isDragging ? 100 : 1,
    cursor: 'grab',
    minHeight: 0,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...listeners}
      {...attributes}
      onClick={(e) => {
        if (!isDragging) {
          e.stopPropagation();
          onClick();
        }
      }}
    >
      <SlotContent slot={slot} hasConflict={hasConflict} />
      <ResizeHandle slotId={slot.id} currentDuration={slot.durationSlots} rowHeight={rowHeight} />
    </div>
  );
}
