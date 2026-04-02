import { useState } from 'react';
import type { TimeSlot } from '../../types/schedule';
import { SLOT_COLORS } from '../../utils/colors';
import { slotToTime, slotsToDuration } from '../../utils/time';
import { useSchedule } from '../../state/ScheduleContext';

interface Props {
  slot: TimeSlot;
  hasConflict: boolean;
}

export function SlotContent({ slot, hasConflict }: Props) {
  const { state } = useSchedule();
  const [hovered, setHovered] = useState(false);
  const colors = slot.color
    ? { bg: slot.color, border: slot.color, text: '#FFF' }
    : SLOT_COLORS[slot.type];
  const duration = slotsToDuration(slot.durationSlots);
  const startTime = slotToTime(slot.startSlot);
  const endTime = slotToTime(slot.startSlot + slot.durationSlots);

  const speakers = slot.speakerIds
    .map((id) => state.contacts.find((c) => c.id === id))
    .filter(Boolean)
    .map((c) => c!.name);

  // Build compact label: Company - Person - Title
  const parts: string[] = [];
  if (slot.company) parts.push(slot.company);
  if (speakers.length > 0) parts.push(speakers.join(', '));
  parts.push(slot.title);
  const label = parts.join(' — ');

  return (
    <div
      className="slot-content"
      style={{
        backgroundColor: colors.bg,
        borderLeft: `4px solid ${colors.border}`,
        color: colors.text,
        boxShadow: hasConflict ? '0 0 0 2px #EF4444, inset 0 0 0 1px #EF4444' : undefined,
      }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <div className="slot-label">{label}</div>

      {hovered && (
        <div className="slot-tooltip" onClick={(e) => e.stopPropagation()}>
          <div className="tooltip-row"><strong>{slot.title}</strong></div>
          {slot.company && <div className="tooltip-row">{slot.company}</div>}
          <div className="tooltip-row">{startTime} – {endTime} ({duration}m)</div>
          <div className="tooltip-row tooltip-type">{slot.type}{slot.isTbd ? ' · TBD' : ''}{slot.isSponsored ? ' · Sponsored' : ''}</div>
          {speakers.length > 0 && (
            <div className="tooltip-row">
              {speakers.map((name, i) => (
                <span key={i}>
                  {name}
                  {slot.panelLeaderId && state.contacts.find(c => c.id === slot.panelLeaderId)?.name === name
                    ? ' (Lead)' : ''}
                  {i < speakers.length - 1 ? ', ' : ''}
                </span>
              ))}
            </div>
          )}
          {slot.notes && <div className="tooltip-row tooltip-notes">{slot.notes}</div>}
        </div>
      )}
    </div>
  );
}
