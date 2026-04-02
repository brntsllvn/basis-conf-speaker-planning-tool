import { useState, useEffect } from 'react';
import type { TimeSlot, SlotType, ContactRole } from '../../types/schedule';
import { useSchedule } from '../../state/ScheduleContext';
import { slotToTime, slotsToDuration } from '../../utils/time';

const SLOT_TYPES: SlotType[] = [
  'keynote', 'solo', 'panel', 'break', 'event', 'emcee', 'open', 'load-in', 'not-in-use',
];

const ROLES: ContactRole[] = ['speaker', 'panelist', 'emcee', 'support-staff'];

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
  const [selectedSpeakers, setSelectedSpeakers] = useState<string[]>(slot.speakerIds);
  const [panelLeader, setPanelLeader] = useState(slot.panelLeaderId ?? '');

  // New contact form
  const [showAddContact, setShowAddContact] = useState(false);
  const [newName, setNewName] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [newPhone, setNewPhone] = useState('');
  const [newRole, setNewRole] = useState<ContactRole>('speaker');
  const [newNotes, setNewNotes] = useState('');

  useEffect(() => {
    setCompany(slot.company);
    setTitle(slot.title);
    setType(slot.type);
    setNotes(slot.notes);
    setIsSponsored(slot.isSponsored);
    setIsTbd(slot.isTbd);
    setSelectedSpeakers(slot.speakerIds);
    setPanelLeader(slot.panelLeaderId ?? '');
  }, [slot]);

  const save = () => {
    dispatch({
      type: 'UPDATE_SLOT',
      slotId: slot.id,
      changes: {
        company,
        title,
        type,
        notes,
        isSponsored,
        isTbd,
        speakerIds: selectedSpeakers,
        panelLeaderId: panelLeader || undefined,
      },
    });
    onClose();
  };

  const handleDelete = () => {
    if (confirm('Delete this slot?')) {
      dispatch({ type: 'DELETE_SLOT', slotId: slot.id });
      onClose();
    }
  };

  const toggleSpeaker = (id: string) => {
    setSelectedSpeakers((prev) =>
      prev.includes(id) ? prev.filter((s) => s !== id) : [...prev, id]
    );
  };

  const handleAddContact = () => {
    if (!newName.trim()) return;
    const id = crypto.randomUUID();
    dispatch({
      type: 'ADD_CONTACT',
      contact: {
        id,
        name: newName.trim(),
        email: newEmail.trim(),
        phone: newPhone.trim(),
        role: newRole,
        notes: newNotes.trim(),
      },
    });
    setSelectedSpeakers((prev) => [...prev, id]);
    setNewName('');
    setNewEmail('');
    setNewPhone('');
    setNewRole('speaker');
    setNewNotes('');
    setShowAddContact(false);
  };

  const allContacts = state.contacts;

  const startTime = slotToTime(slot.startSlot);
  const endTime = slotToTime(slot.startSlot + slot.durationSlots);
  const duration = slotsToDuration(slot.durationSlots);
  const venue = state.venues.find((v) => v.id === slot.venueId);

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
            {SLOT_TYPES.map((t) => (
              <option key={t} value={t}>{t}</option>
            ))}
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
          <label>People</label>
          {allContacts.length > 0 && (
            <div className="speaker-list">
              {allContacts.map((c) => (
                <label key={c.id} className="speaker-option">
                  <input
                    type="checkbox"
                    checked={selectedSpeakers.includes(c.id)}
                    onChange={() => toggleSpeaker(c.id)}
                  />
                  {c.name} <span className="speaker-role">({c.role})</span>
                </label>
              ))}
            </div>
          )}
          <button
            className="btn btn-sm"
            style={{ marginTop: 6 }}
            onClick={() => setShowAddContact(!showAddContact)}
          >
            + New Contact
          </button>
        </div>

        {showAddContact && (
          <div className="add-contact-inline">
            <div className="editor-field">
              <label>Name *</label>
              <input value={newName} onChange={(e) => setNewName(e.target.value)} placeholder="Full name" />
            </div>
            <div className="editor-field">
              <label>Email</label>
              <input value={newEmail} onChange={(e) => setNewEmail(e.target.value)} placeholder="email@example.com" />
            </div>
            <div className="editor-field">
              <label>Phone</label>
              <input value={newPhone} onChange={(e) => setNewPhone(e.target.value)} placeholder="555-0123" />
            </div>
            <div className="editor-field">
              <label>Role</label>
              <select value={newRole} onChange={(e) => setNewRole(e.target.value as ContactRole)}>
                {ROLES.map((r) => (
                  <option key={r} value={r}>{r}</option>
                ))}
              </select>
            </div>
            <div className="editor-field">
              <label>Notes</label>
              <input value={newNotes} onChange={(e) => setNewNotes(e.target.value)} placeholder="Optional" />
            </div>
            <div style={{ display: 'flex', gap: 6 }}>
              <button className="btn btn-primary btn-sm" onClick={handleAddContact}>Add & Assign</button>
              <button className="btn btn-sm" onClick={() => setShowAddContact(false)}>Cancel</button>
            </div>
          </div>
        )}

        {(type === 'panel') && selectedSpeakers.length > 0 && (
          <div className="editor-field">
            <label>Panel Leader</label>
            <select value={panelLeader} onChange={(e) => setPanelLeader(e.target.value)}>
              <option value="">None</option>
              {selectedSpeakers.map((id) => {
                const c = state.contacts.find((ct) => ct.id === id);
                return c ? <option key={id} value={id}>{c.name}</option> : null;
              })}
            </select>
          </div>
        )}

        <div className="editor-actions">
          <button className="btn btn-primary" onClick={save}>Save</button>
          <button className="btn btn-danger" onClick={handleDelete}>Delete</button>
          <button className="btn" onClick={onClose}>Cancel</button>
        </div>
      </div>
    </div>
  );
}
