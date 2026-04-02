import { useMemo } from 'react';
import type { DayId, VenueId, TimeSlot } from '../../types/schedule';
import { useSchedule } from '../../state/ScheduleContext';
import { slotToTime, slotsToDuration } from '../../utils/time';
import { SLOT_COLORS } from '../../utils/colors';

export function LinearSchedulePage() {
  const { state } = useSchedule();

  const schedule = useMemo(() => {
    const result: {
      day: { id: DayId; label: string };
      venues: { id: VenueId; label: string; slots: TimeSlot[] }[];
    }[] = [];

    for (const day of state.days) {
      const daySlots = state.slots.filter((s) => s.dayId === day.id);
      const venues: { id: VenueId; label: string; slots: TimeSlot[] }[] = [];

      for (const venue of state.venues) {
        const venueSlots = daySlots
          .filter((s) => s.venueId === venue.id)
          .sort((a, b) => a.startSlot - b.startSlot);
        if (venueSlots.length > 0) {
          venues.push({ id: venue.id, label: venue.label, slots: venueSlots });
        }
      }

      if (venues.length > 0) {
        result.push({ day, venues });
      }
    }

    return result;
  }, [state]);

  const getSpeakerNames = (slot: TimeSlot) =>
    slot.speakerIds
      .map((id) => {
        const c = state.contacts.find((ct) => ct.id === id);
        if (!c) return null;
        const isLeader = slot.panelLeaderId === c.id;
        return isLeader ? `${c.name} (Lead)` : c.name;
      })
      .filter(Boolean)
      .join(', ');

  return (
    <div className="schedule-page">
      <div className="schedule-print-header">
        <h1>Conference Schedule</h1>
        <p>Generated {new Date().toLocaleDateString()}</p>
      </div>

      {schedule.map(({ day, venues }) => (
        <div key={day.id} className="schedule-day">
          <h2 className="schedule-day-title">{day.label}</h2>

          {venues.map(({ id, label, slots }) => (
            <div key={id} className="schedule-venue">
              <h3 className="schedule-venue-title">{label}</h3>
              <table className="schedule-table">
                <thead>
                  <tr>
                    <th>Time</th>
                    <th>Dur</th>
                    <th>Company</th>
                    <th>Session</th>
                    <th>Type</th>
                    <th>Speakers</th>
                    <th>Notes</th>
                  </tr>
                </thead>
                <tbody>
                  {slots.map((slot) => {
                    const colors = SLOT_COLORS[slot.type];
                    return (
                      <tr key={slot.id} className={`schedule-row type-${slot.type}`}>
                        <td className="schedule-time">
                          {slotToTime(slot.startSlot)} – {slotToTime(slot.startSlot + slot.durationSlots)}
                        </td>
                        <td className="schedule-duration">{slotsToDuration(slot.durationSlots)}m</td>
                        <td className="schedule-company">{slot.company || '\u2014'}</td>
                        <td className="schedule-title">
                          <span
                            className="type-dot"
                            style={{ backgroundColor: colors.bg }}
                          />
                          {slot.title}
                          {slot.isTbd && <span className="tbd-badge">TBD</span>}
                          {slot.isSponsored && <span className="sponsored-badge">Sponsored</span>}
                        </td>
                        <td className="schedule-type">{slot.type}</td>
                        <td className="schedule-speakers">{getSpeakerNames(slot)}</td>
                        <td className="schedule-notes">{slot.notes}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          ))}
        </div>
      ))}

      <div className="print-actions no-print">
        <button className="btn btn-primary" onClick={() => window.print()}>
          Print Schedule
        </button>
      </div>
    </div>
  );
}
