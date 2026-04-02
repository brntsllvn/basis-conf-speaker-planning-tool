import { useMemo, useState } from 'react';
import type { ContactRole } from '../../types/schedule';
import { useSchedule } from '../../state/ScheduleContext';
import { slotToTime } from '../../utils/time';

export function ContactDirectoryPage() {
  const { state } = useSchedule();
  const [roleFilter, setRoleFilter] = useState<ContactRole | ''>('');
  const [search, setSearch] = useState('');

  const enriched = useMemo(() => {
    return state.contacts.map((contact) => {
      const assignedSlots = state.slots
        .filter((s) => s.speakerIds.includes(contact.id))
        .map((s) => {
          const day = state.days.find((d) => d.id === s.dayId);
          const venue = state.venues.find((v) => v.id === s.venueId);
          return {
            title: s.title,
            day: day?.label ?? s.dayId,
            venue: venue?.label ?? s.venueId,
            time: slotToTime(s.startSlot),
            isLeader: s.panelLeaderId === contact.id,
          };
        });
      return { contact, assignedSlots };
    });
  }, [state]);

  const filtered = enriched.filter(({ contact }) => {
    if (roleFilter && contact.role !== roleFilter) return false;
    if (search) {
      const q = search.toLowerCase();
      return (
        contact.name.toLowerCase().includes(q) ||
        contact.email.toLowerCase().includes(q) ||
        contact.phone.includes(q)
      );
    }
    return true;
  });

  // Group by role
  const byRole = useMemo(() => {
    const groups = new Map<ContactRole, typeof filtered>();
    for (const entry of filtered) {
      const role = entry.contact.role;
      const arr = groups.get(role) ?? [];
      arr.push(entry);
      groups.set(role, arr);
    }
    return groups;
  }, [filtered]);

  const roleOrder: ContactRole[] = ['speaker', 'panelist', 'emcee', 'support-staff'];
  const roleLabels: Record<ContactRole, string> = {
    speaker: 'Speakers',
    panelist: 'Panelists',
    emcee: 'Emcees',
    'support-staff': 'Support Staff',
  };

  return (
    <div className="contacts-page">
      <div className="contacts-toolbar">
        <div>
          <h2>Speaker Directory</h2>
          <p className="contacts-subtitle">
            Read-only view. Add and manage contacts in the Grid view by clicking on a slot.
          </p>
        </div>
        <div className="contacts-filters">
          <input
            type="text"
            placeholder="Search..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="search-input"
          />
          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value as ContactRole | '')}
            className="role-filter"
          >
            <option value="">All Roles</option>
            {roleOrder.map((r) => (
              <option key={r} value={r}>{roleLabels[r]}</option>
            ))}
          </select>
          <button className="btn" onClick={() => window.print()}>Print</button>
        </div>
      </div>

      {state.contacts.length === 0 ? (
        <div className="empty-state-box">
          <p>No contacts yet.</p>
          <p>Go to the <strong>Grid</strong> view, click a slot, and add speakers/staff there.</p>
        </div>
      ) : (
        roleOrder.map((role) => {
          const entries = byRole.get(role);
          if (!entries || entries.length === 0) return null;
          return (
            <div key={role} className="contact-role-section">
              <h3 className="contact-role-heading">{roleLabels[role]}</h3>
              <table className="contacts-table">
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Email</th>
                    <th>Phone</th>
                    <th>Assigned Sessions</th>
                    <th>Notes</th>
                  </tr>
                </thead>
                <tbody>
                  {entries.map(({ contact, assignedSlots }) => (
                    <tr key={contact.id}>
                      <td className="contact-name">{contact.name}</td>
                      <td>{contact.email || '\u2014'}</td>
                      <td>{contact.phone || '\u2014'}</td>
                      <td>
                        {assignedSlots.length > 0 ? (
                          <ul className="assigned-slots-list">
                            {assignedSlots.map((s, i) => (
                              <li key={i}>
                                {s.title} — {s.day}, {s.venue}, {s.time}
                                {s.isLeader && <span className="leader-badge">Lead</span>}
                              </li>
                            ))}
                          </ul>
                        ) : (
                          <span className="text-muted">Unassigned</span>
                        )}
                      </td>
                      <td className="text-muted">{contact.notes || '\u2014'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          );
        })
      )}
    </div>
  );
}
