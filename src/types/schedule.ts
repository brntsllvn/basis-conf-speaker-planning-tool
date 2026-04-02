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

export type SlotRole = 'Speaker' | 'Moderator';

export interface SlotAssignment {
  contactId: string;
  slotRole: SlotRole;
}

export interface TimeSlot {
  id: string;
  dayId: DayId;
  venueId: VenueId;
  startSlot: SlotIndex;
  durationSlots: number;
  type: SlotType;
  company: string;
  title: string;
  assignments: SlotAssignment[];
  isSponsored: boolean;
  isTbd: boolean;
  notes: string;
  color?: string;
}

export interface Contact {
  id: string;
  name: string;
  company: string;
  title: string;
  email: string;
  phone: string;
  supportName: string;
  supportEmail: string;
  supportPhone: string;
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
