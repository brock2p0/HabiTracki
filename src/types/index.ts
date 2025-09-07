export interface Habit {
  id: string;
  name: string;
  type: 'critical' | 'goal' | 'avoid';
  description?: string;
  flameCount?: number;
}

export interface DayData {
  moment?: string;
  habits?: { [habitId: string]: boolean | number };
  sleep?: number;
}

export interface MonthData {
  [day: number]: DayData;
  goals?: string[];
  goalsCompletion?: boolean[];
}

export interface HabitData {
  [monthKey: string]: MonthData;
}