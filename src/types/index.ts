export interface Habit {
  id: string;
  name: string;
  type: 'critical' | 'goal' | 'avoid';
  description?: string;
}

export interface DayData {
  moment?: string;
  habits?: { [habitId: string]: boolean | number };
  sleep?: number;
}

export interface MonthData {
  [day: number]: DayData;
  goals?: string[];
}

export interface HabitData {
  [monthKey: string]: MonthData;
}