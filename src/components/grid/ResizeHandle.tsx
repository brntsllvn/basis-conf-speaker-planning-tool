import { useCallback, useState } from 'react';
import { useSchedule } from '../../state/ScheduleContext';

interface Props {
  slotId: string;
  currentDuration: number;
  rowHeight: number;
}

export function ResizeHandle({ slotId, currentDuration, rowHeight }: Props) {
  const { dispatch } = useSchedule();
  const [resizing, setResizing] = useState(false);
  const [previewDuration, setPreviewDuration] = useState(currentDuration);

  const handlePointerDown = useCallback(
    (e: React.PointerEvent) => {
      e.stopPropagation();
      e.preventDefault();
      const startY = e.clientY;
      const startDuration = currentDuration;
      setResizing(true);
      setPreviewDuration(startDuration);

      let finalDuration = startDuration;

      const onPointerMove = (moveEvent: PointerEvent) => {
        const deltaY = moveEvent.clientY - startY;
        const deltaSlots = Math.round(deltaY / rowHeight);
        finalDuration = Math.max(1, startDuration + deltaSlots);
        setPreviewDuration(finalDuration);
      };

      const onPointerUp = () => {
        setResizing(false);
        dispatch({ type: 'RESIZE_SLOT', slotId, newDurationSlots: finalDuration });
        document.removeEventListener('pointermove', onPointerMove);
        document.removeEventListener('pointerup', onPointerUp);
      };

      document.addEventListener('pointermove', onPointerMove);
      document.addEventListener('pointerup', onPointerUp);
    },
    [slotId, currentDuration, rowHeight, dispatch]
  );

  const previewMinutes = previewDuration * 5;

  return (
    <>
      {/* Live resize overlay */}
      {resizing && (
        <div
          className="resize-preview"
          style={{ height: previewDuration * rowHeight }}
        >
          <div className="resize-preview-label">{previewMinutes}m</div>
        </div>
      )}

      {/* Grab handle */}
      <div
        className="resize-handle"
        onPointerDown={handlePointerDown}
      >
        <div className="resize-handle-bar" />
      </div>
    </>
  );
}
