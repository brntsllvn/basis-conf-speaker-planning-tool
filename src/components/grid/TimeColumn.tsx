import { TOTAL_SLOTS, slotToTime } from '../../utils/time';

interface Props {
  rowHeight: number;
}

export function TimeColumn({ rowHeight }: Props) {
  // Label every 5-min slot
  const labels: { slot: number; label: string; isHour: boolean; is15: boolean }[] = [];
  for (let i = 0; i < TOTAL_SLOTS; i++) {
    const totalMin = 7 * 60 + i * 5;
    const min = totalMin % 60;
    labels.push({
      slot: i,
      label: slotToTime(i),
      isHour: min === 0,
      is15: min % 15 === 0,
    });
  }

  return (
    <div className="time-column-wrapper">
      <div className="venue-header" style={{ visibility: 'hidden' }}>Time</div>
      <div
        className="time-column"
        style={{
          display: 'grid',
          gridTemplateRows: `repeat(${TOTAL_SLOTS}, ${rowHeight}px)`,
        }}
      >
        {labels.map(({ slot, label, isHour, is15 }) => (
          <div
            key={slot}
            className={`time-label ${isHour ? 'time-label-hour' : is15 ? 'time-label-15' : 'time-label-5'}`}
            style={{ gridRow: `${slot + 1} / span 1` }}
          >
            {label}
          </div>
        ))}
      </div>
    </div>
  );
}
