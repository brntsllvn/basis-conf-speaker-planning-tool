import { useState, useEffect } from 'react';
import type { TimeSlot, SlotType, SlotRole, SlotAssignment } from '../../types/schedule';
import { useSchedule } from '../../state/ScheduleContext';
import { slotToTime, slotsToDuration } from '../../utils/time';

const SLOT_TYPES: SlotType[] = [
  'keynote', 'solo', 'panel', 'break', 'event', 'emcee', 'open', 'load-in', 'not-in-use',
];

const SLOT_ROLES: SlotRole[] = ['Speaker', 'Moderator'];

interface Props {
  slot: TimeSlot;
  onClose: () => void;
}

export function SlotEditor({ slot, onClose }: Props) {
  const { state, dispatch } = useSchedule();
  const [company, setCompany] = useState(slot.company);
  const [title, setTitle] = useState(slot.title);
  const [type, setType] = useState<SlotType>(slot.type);
  const [notes, setNotes] = useState(slot.notes);
  const [isSponsored, setIsSponsored] = useState(slot.isSponsored);
  const [isTbd, setIsTbd] = useState(slot.isTbd);
  const [assignments, setAssignments] = useState<SlotAssignment[]>(slot.assignments);

  useEffect(() => {
    setCompany(slot.company);
    setTitle(slot.title);
    setType(slot.type);
    setNotes(slot.notes);
    setIsSponsored(slot.isSponsored);
    setIsTbd(slot.isTbd);
    setAssignments(slot.assignments);
  }, [slot]);

  const save = () => {
    dispatch({
      type: 'UPDATE_SLOT',
      slotId: slot.id,
      changes: { company, title, type, notes, isSponsored, isTbd, assignments },
    });
    onClose();
  };

  const handleDelete = () => {
    if (confirm('Delete this slot?')) {
      dispatch({ type: 'DELETE_SLOT', slotId: slot.id });
      onClose();
    }
  };

  const addAssignment = (contactId: string) => {
    if (assignments.some((a) => a.contactId === contactId)) return;
    setAssignments([...assignments, { contactId, slotRole: 'Speaker' }]);
  };

  const removeAssignment = (contactId: string) => {
    setAssignments(assignments.filter((a) => a.contactId !== contactId));
  };

  const updateRole = (contactId: string, slotRole: SlotRole) => {
    setAssignments(assignments.map((a) => a.contactId === contactId ? { ...a, slotRole } : a));
  };

  const startTime = slotToTime(slot.startSlot);
  const endTime = slotToTime(slot.startSlot + slot.durationSlots);
  const duration = slotsToDuration(slot.durationSlots);
  const venue = state.venues.find((v) => v.id === slot.venueId);

  const assignedIds = new Set(assignments.map((a) => a.contactId));
  const unassigned = state.contacts.filter((c) => !assignedIds.has(c.id));

  return (
    <div className="slot-editor-overlay" onClick={onClose}>
      <div className="slot-editor" onClick={(e) => e.stopPropagation()}>
        <div className="editor-header">
          <h3>Edit Slot</h3>
          <button className="editor-close" onClick={onClose}>&times;</button>
        </div>

        <div className="editor-info">
          {venue?.label} &middot; {startTime} – {endTime} ({duration}m)
        </div>

        <div className="editor-field">
          <label>Company / Org</label>
          <input value={company} onChange={(e) => setCompany(e.target.value)} placeholder="e.g. Canvas, PIMCO, AQR" />
        </div>

        <div className="editor-field">
          <label>Talk Title</label>
          <input value={title} onChange={(e) => setTitle(e.target.value)} />
        </div>

        <div className="editor-field">
          <label>Type</label>
          <select value={type} onChange={(e) => setType(e.target.value as SlotType)}>
            {SLOT_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
          </select>
        </div>

        <div className="editor-field">
          <label>Notes</label>
          <textarea value={notes} onChange={(e) => setNotes(e.target.value)} rows={3} />
        </div>

        <div className="editor-row">
          <label>
            <input type="checkbox" checked={isSponsored} onChange={(e) => setIsSponsored(e.target.checked)} />
            Sponsored
          </label>
          <label>
            <input type="checkbox" checked={isTbd} onChange={(e) => setIsTbd(e.target.checked)} />
            TBD
          </label>
        </div>

        <div className="editor-field">
          <label>People &amp; Roles</label>
          {assignments.length > 0 && (
            <div className="assignment-list">
              {assignments.map((a) => {
                const c = state.contacts.find((ct) => ct.id === a.contactId);
                if (!c) return null;
                return (
                  <div key={a.contactId} className="assignment-row">
                    <span className="assignment-name">{c.name}</span>
                    {c.company && <span className="assignment-co">{c.company}</span>}
                    <select
                      className="assignment-role-select"
                      value={a.slotRole}
                      onChange={(e) => updateRole(a.contactId, e.target.value as SlotRole)}
                    >
                      {SLOT_ROLES.map((r) => <option key={r} value={r}>{r}</option>)}
                    </select>
                    <button className="btn btn-sm btn-danger" onClick={() => removeAssignment(a.contactId)}>x</button>
                  </div>
                );
              })}
            </div>
          )}

          {unassigned.length > 0 && (
            <div className="assignment-add">
              <select
                defaultValue=""
                onChange={(e) => {
                  if (e.target.value) addAssignment(e.target.value);
                  e.target.value = '';
                }}
              >
                <option value="" disabled>+ Add person...</option>
                {unassigned
                  .sort((a, b) => a.name.localeCompare(b.name))
                  .map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}{c.company ? ` (${c.company})` : ''}
                    </option>
                  ))}
              </select>
            </div>
          )}

          <p className="editor-hint">Manage people on the People tab.</p>
        </div>

        <div className="editor-actions">
          <button className="btn btn-primary" onClick={save}>Save</button>
          <button className="btn btn-danger" onClick={handleDelete}>Delete</button>
          <button className="btn" onClick={onClose}>Cancel</button>
        </div>
      </div>
    </div>
  );
}
