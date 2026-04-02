import { useState, useMemo } from 'react';
import type { Contact } from '../../types/schedule';
import { useSchedule } from '../../state/ScheduleContext';
import { slotToTime } from '../../utils/time';

export function PeoplePage() {
  const { state, dispatch } = useSchedule();
  const [search, setSearch] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [showAdd, setShowAdd] = useState(false);

  const getAssignments = useMemo(() => {
    const map = new Map<string, { title: string; day: string; venue: string; time: string; slotRole: string }[]>();
    for (const slot of state.slots) {
      for (const a of slot.assignments) {
        const day = state.days.find((d) => d.id === slot.dayId);
        const venue = state.venues.find((v) => v.id === slot.venueId);
        const arr = map.get(a.contactId) ?? [];
        arr.push({
          title: slot.title || slot.company || 'Untitled',
          day: day?.label ?? slot.dayId,
          venue: venue?.label ?? slot.venueId,
          time: slotToTime(slot.startSlot),
          slotRole: a.slotRole,
        });
        map.set(a.contactId, arr);
      }
    }
    return map;
  }, [state]);

  const filtered = state.contacts.filter((c) => {
    if (search) {
      const q = search.toLowerCase();
      return (
        c.name.toLowerCase().includes(q) ||
        c.company.toLowerCase().includes(q) ||
        c.email.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const handleDelete = (id: string) => {
    const assigned = state.slots.filter((s) => s.assignments.some((a) => a.contactId === id));
    const msg = assigned.length > 0
      ? `This person is assigned to ${assigned.length} session(s). Remove them from all sessions and delete?`
      : 'Delete this person?';
    if (confirm(msg)) {
      dispatch({ type: 'DELETE_CONTACT', contactId: id });
    }
  };

  return (
    <div className="people-page">
      <div className="people-toolbar">
        <div>
          <h2>People</h2>
          <p className="people-subtitle">Manage people here. Assign them to sessions in the Grid.</p>
        </div>
        <div className="people-filters">
          <input
            type="text"
            placeholder="Search..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="search-input"
          />
          <button className="btn btn-primary" onClick={() => setShowAdd(true)}>+ Add Person</button>
        </div>
      </div>

      {showAdd && (
        <PersonForm
          onSave={(contact) => {
            dispatch({ type: 'ADD_CONTACT', contact });
            setShowAdd(false);
          }}
          onCancel={() => setShowAdd(false)}
        />
      )}

      <table className="people-table">
        <thead>
          <tr>
            <th>Name</th>
            <th>Company</th>
            <th>Title</th>
            <th>Email</th>
            <th>Phone</th>
            <th>Support Contact</th>
            <th>Sessions</th>
            <th>Notes</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {filtered.map((contact) =>
            editingId === contact.id ? (
              <tr key={contact.id}>
                <td colSpan={9}>
                  <PersonForm
                    initial={contact}
                    onSave={(updated) => {
                      dispatch({ type: 'UPDATE_CONTACT', contactId: contact.id, changes: updated });
                      setEditingId(null);
                    }}
                    onCancel={() => setEditingId(null)}
                  />
                </td>
              </tr>
            ) : (
              <tr key={contact.id}>
                <td className="person-name">{contact.name}</td>
                <td>{contact.company || '\u2014'}</td>
                <td>{contact.title || '\u2014'}</td>
                <td>{contact.email || '\u2014'}</td>
                <td>{contact.phone || '\u2014'}</td>
                <td className="support-cell">
                  {contact.supportName ? (
                    <span>{contact.supportName}{contact.supportEmail ? ` (${contact.supportEmail})` : ''}{contact.supportPhone ? ` ${contact.supportPhone}` : ''}</span>
                  ) : '\u2014'}
                </td>
                <td className="sessions-cell">
                  {(() => {
                    const sessions = getAssignments.get(contact.id);
                    if (!sessions || sessions.length === 0) return <span className="text-muted">Unassigned</span>;
                    return (
                      <ul className="assigned-slots-list">
                        {sessions.map((s, i) => (
                          <li key={i}>
                            <span className="session-title-inline">{s.title}</span>
                            <span className="leader-badge">{s.slotRole}</span>
                            <br />
                            <span className="session-detail-inline">{s.venue}, {s.time}</span>
                          </li>
                        ))}
                      </ul>
                    );
                  })()}
                </td>
                <td className="notes-cell">{contact.notes || '\u2014'}</td>
                <td className="actions-cell">
                  <button className="btn btn-sm" onClick={() => setEditingId(contact.id)}>Edit</button>
                  <button className="btn btn-sm btn-danger" onClick={() => handleDelete(contact.id)}>Del</button>
                </td>
              </tr>
            )
          )}
          {filtered.length === 0 && (
            <tr>
              <td colSpan={9} className="empty-state">
                {state.contacts.length === 0 ? 'No people yet.' : 'No results match your search.'}
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}

interface PersonFormProps {
  initial?: Contact;
  onSave: (contact: Contact) => void;
  onCancel: () => void;
}

function PersonForm({ initial, onSave, onCancel }: PersonFormProps) {
  const [name, setName] = useState(initial?.name ?? '');
  const [company, setCompany] = useState(initial?.company ?? '');
  const [title, setTitle] = useState(initial?.title ?? '');
  const [email, setEmail] = useState(initial?.email ?? '');
  const [phone, setPhone] = useState(initial?.phone ?? '');
  const [supportName, setSupportName] = useState(initial?.supportName ?? '');
  const [supportEmail, setSupportEmail] = useState(initial?.supportEmail ?? '');
  const [supportPhone, setSupportPhone] = useState(initial?.supportPhone ?? '');
  const [notes, setNotes] = useState(initial?.notes ?? '');

  const handleSubmit = () => {
    if (!name.trim()) return;
    onSave({
      id: initial?.id ?? crypto.randomUUID(),
      name: name.trim(),
      company: company.trim(),
      title: title.trim(),
      email: email.trim(),
      phone: phone.trim(),
      supportName: supportName.trim(),
      supportEmail: supportEmail.trim(),
      supportPhone: supportPhone.trim(),
      notes: notes.trim(),
    });
  };

  return (
    <div className="person-form">
      <div className="person-form-grid">
        <div className="pf-field">
          <label>Name *</label>
          <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Full name" />
        </div>
        <div className="pf-field">
          <label>Company</label>
          <input value={company} onChange={(e) => setCompany(e.target.value)} placeholder="Organization" />
        </div>
        <div className="pf-field">
          <label>Title</label>
          <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Job title" />
        </div>
        <div className="pf-field">
          <label>Email</label>
          <input value={email} onChange={(e) => setEmail(e.target.value)} placeholder="email@example.com" />
        </div>
        <div className="pf-field">
          <label>Phone</label>
          <input value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="555-0123" />
        </div>
        <div className="pf-divider">Support Contact</div>
        <div className="pf-field">
          <label>Support Name</label>
          <input value={supportName} onChange={(e) => setSupportName(e.target.value)} placeholder="Support person" />
        </div>
        <div className="pf-field">
          <label>Support Email</label>
          <input value={supportEmail} onChange={(e) => setSupportEmail(e.target.value)} placeholder="support@example.com" />
        </div>
        <div className="pf-field">
          <label>Support Phone</label>
          <input value={supportPhone} onChange={(e) => setSupportPhone(e.target.value)} placeholder="555-0456" />
        </div>
        <div className="pf-field pf-field-wide">
          <label>Notes</label>
          <input value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Optional" />
        </div>
      </div>
      <div className="pf-actions">
        <button className="btn btn-primary" onClick={handleSubmit}>{initial ? 'Save' : 'Add Person'}</button>
        <button className="btn" onClick={onCancel}>Cancel</button>
      </div>
    </div>
  );
}
