import { createBrowserRouter, Navigate } from 'react-router-dom';
import { AppShell } from './components/layout/AppShell';
import { GridPage } from './components/grid/GridPage';
import { LinearSchedulePage } from './components/schedule/LinearSchedulePage';
import { PeoplePage } from './components/people/PeoplePage';

export const router = createBrowserRouter([
  {
    path: '/',
    element: <AppShell />,
    children: [
      { index: true, element: <Navigate to="/grid" replace /> },
      { path: 'grid', element: <GridPage /> },
      { path: 'schedule', element: <LinearSchedulePage /> },
      { path: 'people', element: <PeoplePage /> },
    ],
  },
]);
