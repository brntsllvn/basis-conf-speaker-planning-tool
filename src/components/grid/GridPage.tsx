import { useState } from 'react';
import type { DayId, SlotType, TimeSlot, VenueId } from '../../types/schedule';
import { useSchedule } from '../../state/ScheduleContext';
import { TimeGridView } from './TimeGridView';
import { timeToSlot, durationToSlots } from '../../utils/time';
import { wouldOverlap } from '../../utils/overlap';

const DEFAULT_VENUE: VenueId = 'main-stage';
const DEFAULT_DURATION = durationToSlots(25);
const DEFAULT_START_SLOT = timeToSlot(9, 0);
const FINISH_SEARCH_SLOT = timeToSlot(18, 0);
const SLOT_STEP = durationToSlots(5);

function findFirstAvailableStartSlot(
  slots: TimeSlot[],
  slotId: string,
  dayId: DayId,
  venueId: VenueId,
  durationSlots: number,
) {
  for (let start = DEFAULT_START_SLOT; start + durationSlots <= FINISH_SEARCH_SLOT; start += SLOT_STEP) {
    if (!wouldOverlap(slots, slotId, dayId, venueId, start, durationSlots)) {
      return start;
    }
  }

  return DEFAULT_START_SLOT;
}

export function GridPage() {
  const { state, activeDay, setActiveDay, dispatch } = useSchedule();
  const [rowHeight, setRowHeight] = useState(6);

  const handleAddSlot = () => {
    const id = crypto?.randomUUID?.() ?? `slot-${Math.random().toString(36).slice(2, 10)}`;
    const startSlot = findFirstAvailableStartSlot(state.slots, id, activeDay, DEFAULT_VENUE, DEFAULT_DURATION);

    dispatch({
      type: 'ADD_SLOT',
      slot: {
        id,
        dayId: activeDay,
        venueId: DEFAULT_VENUE,
        startSlot,
        durationSlots: DEFAULT_DURATION,
        type: 'solo' as SlotType,
        company: '',
        title: 'New Slot',
        assignments: [],
        isSponsored: false,
        isTbd: true,
        notes: '',
      },
    });
  };

  return (
    <div className="grid-page">
      <div className="grid-toolbar">
        <div className="day-tabs">
          {state.days.map((day) => (
            <button
              key={day.id}
              className={`day-tab ${activeDay === day.id ? 'active' : ''}`}
              onClick={() => setActiveDay(day.id as DayId)}
            >
              {day.label}
            </button>
          ))}
        </div>
        <div className="toolbar-actions">
          <button className="btn btn-primary" onClick={handleAddSlot}>+ Add Slot</button>
          <div className="zoom-control">
            <label>Zoom:</label>
            <input
              type="range"
              min={4}
              max={20}
              value={rowHeight}
              onChange={(e) => setRowHeight(Number(e.target.value))}
            />
          </div>
        </div>
      </div>
      <div className="grid-container">
        <TimeGridView rowHeight={rowHeight} />
      </div>
    </div>
  );
}
