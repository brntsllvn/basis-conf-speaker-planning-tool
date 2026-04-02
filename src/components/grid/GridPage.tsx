import { useState } from 'react';
import type { DayId, SlotType, VenueId } from '../../types/schedule';
import { useSchedule } from '../../state/ScheduleContext';
import { TimeGridView } from './TimeGridView';
import { timeToSlot, durationToSlots } from '../../utils/time';

export function GridPage() {
  const { state, activeDay, setActiveDay, dispatch } = useSchedule();
  const [rowHeight, setRowHeight] = useState(6);

  const handleAddSlot = () => {
    const id = crypto.randomUUID();
    dispatch({
      type: 'ADD_SLOT',
      slot: {
        id,
        dayId: activeDay,
        venueId: 'main-stage' as VenueId,
        startSlot: timeToSlot(9, 0),
        durationSlots: durationToSlots(25),
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
