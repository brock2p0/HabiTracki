export interface Habit {
  id: string;
  name: string;
  type: 'critical' | 'goal' | 'avoid';
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