import { Outlet } from 'react-router-dom';
import { ScheduleProvider } from '../../state/ScheduleContext';
import { Nav } from './Nav';

export function AppShell() {
  return (
    <ScheduleProvider>
      <div className="app-shell">
        <Nav />
        <main className="app-main">
          <Outlet />
        </main>
      </div>
    </ScheduleProvider>
  );
}
