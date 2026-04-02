import { createBrowserRouter, Navigate } from 'react-router-dom';
import { AppShell } from './components/layout/AppShell';
import { GridPage } from './components/grid/GridPage';
import { LinearSchedulePage } from './components/schedule/LinearSchedulePage';
import { ContactDirectoryPage } from './components/contacts/ContactDirectoryPage';

export const router = createBrowserRouter([
  {
    path: '/',
    element: <AppShell />,
    children: [
      { index: true, element: <Navigate to="/grid" replace /> },
      { path: 'grid', element: <GridPage /> },
      { path: 'schedule', element: <LinearSchedulePage /> },
      { path: 'contacts', element: <ContactDirectoryPage /> },
    ],
  },
]);
