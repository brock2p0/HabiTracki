import React from 'react';
import { CheckSquare, Square, Target } from 'lucide-react';
import type { Habit, DayData } from '../types';
import { HABIT_TYPE_EMOJIS } from '../types';

interface HabitGridProps {
  habits: Habit[];
  daysInMonth: number;
  getDayData: (day: number) => DayData;
  updateHabit: (day: number, habitIndex: number, value: boolean | number) => void;
}

const HabitGrid: React.FC<HabitGridProps> = ({
  habits,
  daysInMonth,
  getDayData,
  updateHabit
}) => {
  const getCompletionStats = (habit: Habit, habitIndex: number) => {
    let completed = 0;
    let total = 0;
    let sum = 0;
    
    for (let day = 1; day <= daysInMonth; day++) {
      const dayData = getDayData(day);
      const value = dayData.habits?.[habitIndex];

      if (value !== undefined && value !== null && value !== '') {
        total++;
        if (habit.type === 'number') {
          sum += Number(value);
        } else if (value) {
          completed++;
        }
      }
    }
    
    if (habit.type === 'number') {
      return {
        percentage: total > 0 ? (sum / total) : 0,
        label: total > 0 ? (sum / total).toFixed(1) : 'Avg',
      };
    }

    const percentage = total > 0 ? Math.round((completed / total) * 100) : 0;
    return {
      percentage,
      label: `${percentage}%`,
    };
  };

  const renderHabitInput = (habit: Habit, habitIndex: number, day: number) => {
    const value = getDayData(day).habits?.[habitIndex];

    if (habit.type === 'number') {
      return (
        <input
          type="number"
          value={value || ''}
          onChange={(e) => updateHabit(day, habitIndex, parseFloat(e.target.value))}
          className="w-full h-full text-center bg-transparent border-2 rounded-md focus:outline-none"
          style={{
            borderColor: value ? habit.color : '#E5E7EB',
            color: habit.color,
          }}
          aria-label={`${habit.name} for day ${day}`}
        />
      );
    }

    return (
      <button
        onClick={() => updateHabit(day, habitIndex, !value)}
        className="w-full h-full flex items-center justify-center rounded-md border-2 transition-all"
        style={{
          borderColor: value ? habit.color : '#E5E7EB',
          backgroundColor: value ? `${habit.color}20` : 'transparent',
        }}
        aria-label={`${habit.name} for day ${day}: ${value ? 'completed' : 'not completed'}`}
        aria-pressed={!!value}
      >
        {value ? (
          <CheckSquare className="w-4 h-4" style={{ color: habit.color }} />
        ) : (
          <Square className="w-4 h-4 text-slate-300" />
        )}
      </button>
    );
  };

  return (
    <section className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6" aria-labelledby="habits-heading">
      <div className="flex items-center gap-2 mb-6">
        <Target className="w-5 h-5 text-indigo-600" />
        <h2 id="habits-heading" className="text-xl font-semibold text-slate-800">Daily Habits</h2>
      </div>

      {habits.length === 0 ? (
        <div className="text-center py-12 text-slate-500">
          <Target className="w-12 h-12 mx-auto mb-4 opacity-50" />
          <p>No habits yet. Add some habits to start tracking!</p>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="space-y-3 mb-6" role="list" aria-label="Habit progress overview">
            {habits.map((habit, habitIndex) => {
              const stats = getCompletionStats(habit, habitIndex);
              return (
                <div key={habit.id} className="flex items-center justify-between" role="listitem">
                  <div className="flex items-center gap-3">
                    <span className="text-lg">{HABIT_TYPE_EMOJIS[habit.type]}</span>
                    <span className="font-medium text-slate-700">{habit.name}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-16 bg-slate-200 rounded-full h-2" role="progressbar" aria-valuenow={stats.percentage} aria-valuemin={0} aria-valuemax={100} aria-label={`${habit.name} completion rate`}>
                      <div
                        className="h-2 rounded-full"
                        style={{ width: `${habit.type === 'number' ? 100 : stats.percentage}%`, backgroundColor: habit.color }}
                      ></div>
                    </div>
                    <span className="text-xs text-slate-500 w-10 text-right" aria-hidden="true">
                      {stats.label}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="overflow-x-auto" role="region" aria-labelledby="habit-grid-label">
            <h3 id="habit-grid-label" className="sr-only">Daily habit completion grid</h3>
            <div className="grid gap-1" style={{ gridTemplateColumns: `100px repeat(${daysInMonth}, 40px)` }}>
              <div role="columnheader" className="sticky left-0 bg-white z-10"></div>
              {Array.from({ length: daysInMonth }, (_, i) => i + 1).map(day => (
                <div key={day} className="text-center text-xs font-medium text-slate-500 py-1" role="columnheader">
                  {day}
                </div>
              ))}

              {habits.map((habit, habitIndex) => (
                <React.Fragment key={habit.id}>
                  <div className="sticky left-0 bg-white z-10 text-xs font-medium text-slate-600 py-2 pr-2 truncate flex items-center" role="rowheader">
                    {habit.name}
                  </div>
                  {Array.from({ length: daysInMonth }, (_, i) => i + 1).map(day => (
                    <div key={day} className="h-10" role="gridcell">
                      {renderHabitInput(habit, habitIndex, day)}
                    </div>
                  ))}
                </React.Fragment>
              ))}
            </div>
          </div>
        </div>
      )}
    </section>
  );
};

export default HabitGrid;