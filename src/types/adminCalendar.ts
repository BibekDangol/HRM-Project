export interface CalendarEvent {
  id: string;
  label: string;
  color: string;
}
export interface DayConfig {
  type?: "publicHoliday" | "officeDay";
  holidayLabel?: string;
  events?: CalendarEvent[];
}
export interface CalendarColors {
  publicHoliday: string;
  weekend: string;
  officeDay: string;
}
export interface WeekendRules {
  sundayOff: boolean;
  mondayOff: boolean;
  tuesdayOff: boolean;
  wednesdayOff: boolean;
  thursdayOff: boolean;
  fridayOff: boolean;
  saturdayOff: boolean;
}
export interface CalendarState {
  colors: CalendarColors;
  weekendRules: WeekendRules;
  days: Record<string, DayConfig>;
}
export type ModalMode = "view" | "addHoliday" | "addEvent";
