import { useState, useEffect } from 'react';
import type { Habit, HabitData } from '../types';

const defaultHabits: Habit[] = [
  { id: '1', name: 'EXERCISE', type: 'goal', description: 'At least 30 minutes of physical activity' },
  { id: '2', name: 'MEDITATION', type: 'goal', description: 'Mindfulness practice or breathing exercises' },
  { id: '3', name: 'READING', type: 'goal', description: 'Read for personal growth or entertainment' },
  { id: '4', name: 'SOCIAL MEDIA', type: 'avoid', description: 'Limit mindless scrolling and consumption' },
  { id: '5', name: 'WATER INTAKE', type: 'critical', description: 'Stay properly hydrated throughout the day' }
];

// Migration function to convert index-based data to ID-based data
const migrateHabitData = (data: HabitData, habits: Habit[]): HabitData => {
  const migratedData = { ...data };
  
  Object.keys(migratedData).forEach(monthKey => {
    const monthData = migratedData[monthKey];
    Object.keys(monthData).forEach(dayKey => {
      if (dayKey !== 'goals' && monthData[dayKey].habits) {
        const dayHabits = monthData[dayKey].habits;
        const newHabits: { [habitId: string]: boolean | number } = {};
        
        // Convert index-based keys to ID-based keys
        Object.keys(dayHabits).forEach(indexKey => {
          const index = parseInt(indexKey);
          if (habits[index]) {
            newHabits[habits[index].id] = dayHabits[indexKey];
          }
        });
        
        monthData[dayKey].habits = newHabits;
      }
    });
  });
  
  return migratedData;
};
export const useHabitData = () => {
  const [data, setData] = useState<HabitData>({});
  const [habits, setHabits] = useState<Habit[]>(defaultHabits);
  const [isMigrated, setIsMigrated] = useState(false);

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
        
        // Check if data needs migration (has numeric keys in habits)
        const needsMigration = Object.values(loadedData).some((monthData: any) =>
          Object.values(monthData).some((dayData: any) =>
            dayData.habits && Object.keys(dayData.habits).some(key => !isNaN(parseInt(key)))
          )
        );
        
        if (needsMigration) {
          console.log('Migrating habit data from index-based to ID-based...');
        setIsMigrated(true);
          loadedData = migrateHabitData(loadedData, loadedHabits);
          localStorage.setItem('habitTrackerData', JSON.stringify(loadedData));
        setIsMigrated(true);
        }
    } else {
      setIsMigrated(true);
        
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
    isMigrated
  };
};