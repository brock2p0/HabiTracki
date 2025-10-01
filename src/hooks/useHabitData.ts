import { useState, useEffect } from 'react';
import type { Habit, HabitData } from '../types';

const defaultHabits: Habit[] = [
  { id: '1', name: 'DAILY PRAYERS', abbreviation: 'PR', type: 'critical', description: 'Complete daily prayer routine', flameCount: 5 },
  { id: '2', name: 'WALKING 30MIN', abbreviation: 'WK', type: 'goal', description: 'Walk for at least 30 minutes', flameCount: 3 },
  { id: '3', name: 'SOCIAL MEDIA', abbreviation: 'SM', type: 'avoid', description: 'Limit mindless scrolling and consumption', flameCount: 1 },
  { id: '4', name: 'OVERSLEEPING', abbreviation: 'SL', type: 'avoid', description: 'Avoid sleeping past intended wake time', flameCount: 2 },
  { id: '5', name: 'EXERCISE', abbreviation: 'EX', type: 'goal', description: 'At least 30 minutes of physical activity', flameCount: 4 },
  { id: '6', name: 'READING', abbreviation: 'RD', type: 'goal', description: 'Read for personal growth or entertainment', flameCount: 3 },
  { id: '7', name: 'SELFCARE', abbreviation: 'SC', type: 'goal', description: 'Personal care and wellness activities', flameCount: 2 },
  { id: '8', name: 'QURAN TIME', abbreviation: 'QU', type: 'critical', description: 'Daily Quran reading and reflection', flameCount: 5 },
  { id: '9', name: 'DEEPWORK SESSION', abbreviation: 'DW', type: 'goal', description: 'Focused work session without distractions', flameCount: 4 }
];

// Migration function to convert index-based data to ID-based data
const migrateHabitData = (data: HabitData, habits: Habit[]): HabitData => {
  const migratedData = { ...data };
  
  // Create a Set of all current valid habit IDs for fast lookup
  const validHabitIds = new Set(habits.map(habit => habit.id));
  
  Object.keys(migratedData).forEach(monthKey => {
    const monthData = migratedData[monthKey];
    Object.keys(monthData).forEach(dayKey => {
      if (dayKey !== 'goals' && monthData[dayKey].habits) {
        const dayHabits = monthData[dayKey].habits;
        const newHabits: { [habitId: string]: boolean | number } = {};
        
        // Intelligent migration: preserve valid IDs, convert old position-based data
        Object.keys(dayHabits).forEach(storedKey => {
          // First check: Is this already a valid current habit ID?
          if (validHabitIds.has(storedKey)) {
            // This is a legitimate habit ID - preserve it exactly as is
            newHabits[storedKey] = dayHabits[storedKey];
          } else {
            // This key is not a current valid habit ID
            // Check if it looks like old position-based data that can be converted
            const index = parseInt(storedKey);
            if (!isNaN(index) && habits[index]) {
              // This appears to be old index-based data - convert it
              newHabits[habits[index].id] = dayHabits[storedKey];
            }
            // If it's neither a valid ID nor convertible old data, it gets discarded
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
    
    let loadedData: HabitData = {};
    let loadedHabits: Habit[] = defaultHabits;
    
    if (savedData) {
      try {
        loadedData = JSON.parse(savedData);
        setData(loadedData);
      } catch (error) {
        console.error('Error loading habit data:', error);
      }
    }
    
    if (savedHabits) {
      try {
        loadedHabits = JSON.parse(savedHabits);
        setHabits(loadedHabits);
      } catch (error) {
        console.error('Error loading habits:', error);
      }
    }
    
    // Check if data needs migration (has numeric keys in habits)
    // Create a Set of current valid habit IDs for migration check
    const currentValidIds = new Set(loadedHabits.map(habit => habit.id));
    
    // Check if data needs migration (has keys that are not current valid habit IDs)
    const needsMigration = Object.values(loadedData).some((monthData: any) =>
      Object.values(monthData).some((dayData: any) =>
        dayData.habits && Object.keys(dayData.habits).some(key => !currentValidIds.has(key))
      )
    );
    
    if (needsMigration) {
      console.log('Migrating habit data - converting old keys to current valid habit IDs...');
      loadedData = migrateHabitData(loadedData, loadedHabits);
      console.log('Migration completed, saving updated data to localStorage');
      setData(loadedData);
      localStorage.setItem('habitTrackerData', JSON.stringify(loadedData));
    } else {
      console.log('No migration needed - all habit keys are already valid');
    }
    
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
    updateHabits,
    isMigrated
  };
};