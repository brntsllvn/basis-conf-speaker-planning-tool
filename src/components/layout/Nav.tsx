import { NavLink } from 'react-router-dom';
import { useSchedule } from '../../state/ScheduleContext';
import { downloadJson, importFromJson, resetToSeed } from '../../state/persistence';
import { useRef } from 'react';

export function Nav() {
  const { state, dispatch } = useSchedule();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const imported = importFromJson(reader.result as string);
        dispatch({ type: 'IMPORT_STATE', state: imported });
      } catch (err) {
        alert('Invalid file: ' + (err as Error).message);
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  return (
    <nav className="app-nav">
      <div className="nav-brand">Conf Planner</div>
      <div className="nav-links">
        <NavLink to="/grid" className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}>
          Grid
        </NavLink>
        <NavLink to="/schedule" className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}>
          Schedule
        </NavLink>
        <NavLink to="/people" className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}>
          People
        </NavLink>
      </div>
      <div className="nav-actions">
        <button className="nav-btn" onClick={() => downloadJson(state)} title="Export JSON">
          Export
        </button>
        <button className="nav-btn" onClick={() => fileInputRef.current?.click()} title="Import JSON">
          Import
        </button>
        <button
          className="nav-btn"
          onClick={() => {
            if (confirm('Reset all data to the original seed? This cannot be undone.')) {
              const fresh = resetToSeed();
              dispatch({ type: 'IMPORT_STATE', state: fresh });
            }
          }}
          title="Reset to seed data"
        >
          Reset
        </button>
        <input
          ref={fileInputRef}
          type="file"
          accept=".json"
          onChange={handleImport}
          style={{ display: 'none' }}
        />
      </div>
    </nav>
  );
}
