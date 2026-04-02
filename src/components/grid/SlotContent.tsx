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

  const people = slot.assignments
    .map((a) => {
      const c = state.contacts.find((ct) => ct.id === a.contactId);
      return c ? { name: c.name, role: a.slotRole } : null;
    })
    .filter(Boolean) as { name: string; role: string }[];

  // Build compact label: Company - Person(s) - Title
  const parts: string[] = [];
  if (slot.company) parts.push(slot.company);
  if (people.length > 0) parts.push(people.map((p) => p.name).join(', '));
  if (slot.title) parts.push(slot.title);
  const label = parts.join(' \u2014 ');

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
      <div className="slot-label">{label || 'Untitled'}</div>

      {hovered && (
        <div className="slot-tooltip" onClick={(e) => e.stopPropagation()}>
          <div className="tooltip-row"><strong>{slot.title || 'Untitled'}</strong></div>
          {slot.company && <div className="tooltip-row">{slot.company}</div>}
          <div className="tooltip-row">{startTime} – {endTime} ({duration}m)</div>
          <div className="tooltip-row tooltip-type">{slot.type}{slot.isTbd ? ' \u00b7 TBD' : ''}{slot.isSponsored ? ' \u00b7 Sponsored' : ''}</div>
          {people.length > 0 && (
            <div className="tooltip-people">
              {people.map((p, i) => (
                <div key={i} className="tooltip-person">
                  {p.name} <span className="tooltip-role">{p.role}</span>
                </div>
              ))}
            </div>
          )}
          {slot.notes && <div className="tooltip-row tooltip-notes">{slot.notes}</div>}
        </div>
      )}
    </div>
  );
}
