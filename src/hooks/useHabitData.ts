import { useState, useEffect } from 'react';
import type { Habit, HabitData } from '../types';

const defaultHabits: Habit[] = [
  { id: '1', name: 'EXERCISE', type: 'goal', color: '#10B981' },
  { id: '2', name: 'MEDITATION', type: 'goal', color: '#8B5CF6' },
  { id: '3', name: 'READING', type: 'goal', color: '#3B82F6' },
  { id: '4', name: 'SOCIAL MEDIA', type: 'avoid', color: '#EF4444' },
  { id: '5', name: 'WATER INTAKE', type: 'critical', color: '#F97316' },
  { id: '6', name: 'WEIGHT', type: 'number', color: '#6366F1' },
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