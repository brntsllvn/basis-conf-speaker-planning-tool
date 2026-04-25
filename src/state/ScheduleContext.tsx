import { createContext, useContext, useReducer, useEffect, useRef, useState, useCallback, type ReactNode } from 'react';
import type { AppState, DayId } from '../types/schedule';
import { scheduleReducer, type Action } from './reducer';
import { loadState, saveState } from './persistence';
import { createInitialState } from '../seed/initialSchedule';

interface ScheduleContextValue {
  state: AppState;
  dispatch: React.Dispatch<Action>;
  activeDay: DayId;
  setActiveDay: (day: DayId) => void;
}

const ScheduleContext = createContext<ScheduleContextValue | null>(null);

export function ScheduleProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(scheduleReducer, undefined, () => createInitialState());
  const [activeDay, setActiveDay] = useState<DayId>('thu');
  const [loaded, setLoaded] = useState(false);
  // Only save when a real user action has occurred — prevents clobbering the DB
  // if the app loads stale/seed state and the user hasn't touched anything yet.
  const [dirty, setDirty] = useState(false);
  const saveTimeoutRef = useRef<number | undefined>(undefined);

  const wrappedDispatch = useCallback((action: Action) => {
    if (action.type !== 'IMPORT_STATE') setDirty(true);
    dispatch(action);
  }, []);

  // Load from server on mount
  useEffect(() => {
    loadState().then((serverState) => {
      dispatch({ type: 'IMPORT_STATE', state: serverState });
      setLoaded(true);
    });
  }, []);

  // Save to server on every change (debounced), but only after initial load
  // and only when a user action has actually changed the state.
  useEffect(() => {
    if (!loaded || !dirty) return;
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }
    saveTimeoutRef.current = window.setTimeout(() => {
      saveState(state);
    }, 300);
    return () => {
      if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);
    };
  }, [state, loaded, dirty]);

  return (
    <ScheduleContext.Provider value={{ state, dispatch: wrappedDispatch, activeDay, setActiveDay }}>
      {children}
    </ScheduleContext.Provider>
  );
}

export function useSchedule(): ScheduleContextValue {
  const ctx = useContext(ScheduleContext);
  if (!ctx) throw new Error('useSchedule must be used within ScheduleProvider');
  return ctx;
}
