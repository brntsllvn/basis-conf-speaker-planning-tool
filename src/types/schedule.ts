export type SlotIndex = number;

export type DayId = 'wed' | 'thu' | 'fri';

export type VenueId = 'main-stage' | 'll-a' | 'll-b';

export type SlotType =
  | 'keynote'
  | 'solo'
  | 'panel'
  | 'break'
  | 'event'
  | 'emcee'
  | 'open'
  | 'load-in'
  | 'not-in-use';

export type ContactRole = 'speaker' | 'panelist' | 'emcee' | 'support-staff';

export interface TimeSlot {
  id: string;
  dayId: DayId;
  venueId: VenueId;
  startSlot: SlotIndex;
  durationSlots: number;
  type: SlotType;
  company: string;
  title: string;
  speakerIds: string[];
  panelLeaderId?: string;
  isSponsored: boolean;
  isTbd: boolean;
  notes: string;
  color?: string;
}

export interface Contact {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: ContactRole;
  notes: string;
}

export interface ScheduleDay {
  id: DayId;
  label: string;
  date: string;
}

export interface Venue {
  id: VenueId;
  label: string;
}

export interface AppState {
  version: number;
  days: ScheduleDay[];
  venues: Venue[];
  slots: TimeSlot[];
  contacts: Contact[];
  lastModified: string;
}
