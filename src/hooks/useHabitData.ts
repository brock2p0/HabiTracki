import { useState, useEffect } from 'react';
import type { Habit, HabitData } from '../types';

const defaultHabits: Habit[] = [
  { id: '1', name: 'EXERCISE', type: 'goal' },
  { id: '2', name: 'MEDITATION', type: 'goal' },
  { id: '3', name: 'READING', type: 'goal' },
  { id: '4', name: 'SOCIAL MEDIA', type: 'avoid' },
  { id: '5', name: 'WATER INTAKE', type: 'critical' }
];

export const useHabitData = () => {
  const [data, setData] = useState<HabitData>({});
  const [habits, setHabits] = useState<Habit[]>(defaultHabits);

  useEffect(() => {
    const savedData = localStorage.getItem('habitTrackerData');
    const savedHabits = localStorage.getItem('habitTrackerHabits');
    
    if (savedData) {
      try {
        setData(JSON.parse(savedData));
      } catch (error) {
        console.error('Error loading habit data:', error);
      }
    }
    
    if (savedHabits) {
      try {
        setHabits(JSON.parse(savedHabits));
      } catch (error) {
        console.error('Error loading habits:', error);
      }
    }
  }, []);

  const updateData = (newData: HabitData) => {
    setData(newData);
    localStorage.setItem('habitTrackerData', JSON.stringify(newData));
  };

  const updateHabits = (newHabits: Habit[]) => {
    setHabits(newHabits);
    localStorage.setItem('habitTrackerHabits', JSON.stringify(newHabits));
  };

  return {
    data,
    habits,
    updateData,
    updateHabits
  };
};