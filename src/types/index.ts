export type HabitType = 'critical' | 'goal' | 'avoid' | 'number';

export const HABIT_TYPE_EMOJIS: Record<HabitType, string> = {
  critical: '🔥',
  goal: '🎯',
  avoid: '❌',
  number: '🔢',
};

export interface Habit {
  id: string;
  name: string;
  type: HabitType;
  color: string;
}

export interface DayData {
  moment?: string;
  habits?: { [habitIndex: number]: boolean | number };
  sleep?: number;
}

export interface MonthData {
  [day: number]: DayData;
  goals?: string[];
}

export interface HabitData {
  [monthKey: string]: MonthData;
}