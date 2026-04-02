import { createContext, useContext, useReducer, useEffect, useRef, type ReactNode } from 'react';
import type { AppState, DayId } from '../types/schedule';
import { scheduleReducer, type Action } from './reducer';
import { loadState, saveState } from './persistence';
import { useState } from 'react';

interface ScheduleContextValue {
  state: AppState;
  dispatch: React.Dispatch<Action>;
  activeDay: DayId;
  setActiveDay: (day: DayId) => void;
}

const ScheduleContext = createContext<ScheduleContextValue | null>(null);

export function ScheduleProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(scheduleReducer, undefined, () => loadState());
  const [activeDay, setActiveDay] = useState<DayId>('thu');
  const saveTimeoutRef = useRef<number | undefined>(undefined);

  useEffect(() => {
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }
    saveTimeoutRef.current = window.setTimeout(() => {
      saveState(state);
    }, 300);
    return () => {
      if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);
    };
  }, [state]);

  return (
    <ScheduleContext.Provider value={{ state, dispatch, activeDay, setActiveDay }}>
      {children}
    </ScheduleContext.Provider>
  );
}

export function useSchedule(): ScheduleContextValue {
  const ctx = useContext(ScheduleContext);
  if (!ctx) throw new Error('useSchedule must be used within ScheduleProvider');
  return ctx;
}
