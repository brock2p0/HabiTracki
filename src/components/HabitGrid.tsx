import React from 'react';
import { CheckSquare, Square, Target } from 'lucide-react';
import type { Habit } from '../types';

interface HabitGridProps {
  habits: Habit[];
  daysInMonth: number;
  getDayData: (day: number) => any;
  updateHabit: (day: number, habitIndex: number, value: boolean | number) => void;
}

const HabitGrid: React.FC<HabitGridProps> = ({
  habits,
  daysInMonth,
  getDayData,
  updateHabit
}) => {
  const getHabitColor = (type: string) => {
    switch (type) {
      case 'critical': return 'text-red-600 border-red-200';
      case 'goal': return 'text-indigo-600 border-indigo-200';
      case 'avoid': return 'text-orange-600 border-orange-200';
      default: return 'text-slate-600 border-slate-200';
    }
  };

  const getCompletionRate = (habitIndex: number) => {
    let completed = 0;
    let total = 0;
    
    for (let day = 1; day <= daysInMonth; day++) {
      const dayData = getDayData(day);
      if (dayData.habits && dayData.habits[habitIndex] !== undefined) {
        total++;
        if (dayData.habits[habitIndex]) completed++;
      }
    }
    
    return total > 0 ? Math.round((completed / total) * 100) : 0;
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
          {/* Habit Headers with Progress */}
          <div className="space-y-3 mb-6" role="list" aria-label="Habit progress overview">
            {habits.map((habit, habitIndex) => (
              <div key={habitIndex} className="flex items-center justify-between" role="listitem">
                <div className="flex items-center gap-3">
                  <div className={`w-3 h-3 rounded-full ${
                    habit.type === 'critical' ? 'bg-red-500' :
                    habit.type === 'goal' ? 'bg-indigo-500' :
                    habit.type === 'avoid' ? 'bg-orange-500' : 'bg-slate-500'
                  }`}></div>
                  <span className="font-medium text-slate-700">{habit.name}</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-16 bg-slate-200 rounded-full h-2" role="progressbar" aria-valuenow={getCompletionRate(habitIndex)} aria-valuemin={0} aria-valuemax={100} aria-label={`${habit.name} completion rate`}>
                    <div 
                      className={`h-2 rounded-full transition-all duration-300 ${
                        habit.type === 'critical' ? 'bg-red-500' :
                        habit.type === 'goal' ? 'bg-indigo-500' :
                        habit.type === 'avoid' ? 'bg-orange-500' : 'bg-slate-500'
                      }`}
                      style={{ width: `${getCompletionRate(habitIndex)}%` }}
                    ></div>
                  </div>
                  <span className="text-xs text-slate-500 w-8 text-right" aria-hidden="true">
                    {getCompletionRate(habitIndex)}%
                  </span>
                </div>
              </div>
            ))}
          </div>

          {/* Habit Grid */}
          <div className="overflow-x-auto" role="region" aria-labelledby="habit-grid-label">
            <h3 id="habit-grid-label" className="sr-only">Daily habit completion grid</h3>
            <div className="min-w-full">
              {/* Days Header */}
              <div className="grid gap-1 mb-2" style={{ gridTemplateColumns: `120px repeat(${Math.min(daysInMonth, 15)}, 1fr)` }} role="row">
                <div role="columnheader"></div>
                {Array.from({ length: Math.min(daysInMonth, 15) }, (_, i) => i + 1).map(day => (
                  <div key={day} className="text-center text-xs font-medium text-slate-500 py-1" role="columnheader">
                    {day}
                  </div>
                ))}
              </div>

              {/* Habit Rows */}
              {habits.map((habit, habitIndex) => (
                <div key={habitIndex} className="grid gap-1 mb-2" style={{ gridTemplateColumns: `120px repeat(${Math.min(daysInMonth, 15)}, 1fr)` }} role="row">
                  <div className="text-xs font-medium text-slate-600 py-2 pr-2 truncate" role="rowheader">
                    {habit.name}
                  </div>
                  {Array.from({ length: Math.min(daysInMonth, 15) }, (_, i) => i + 1).map(day => {
                    const isCompleted = getDayData(day).habits?.[habitIndex];
                    return (
                      <div key={day} role="gridcell">
                        <button
                        key={day}
                        onClick={() => updateHabit(day, habitIndex, !isCompleted)}
                        className={`
                          h-8 rounded-md border-2 transition-all duration-200 flex items-center justify-center
                          ${isCompleted 
                            ? `${getHabitColor(habit.type)} bg-opacity-10` 
                            : 'border-slate-200 hover:border-slate-300'
                          }
                        `}
                        aria-label={`${habit.name} for day ${day}: ${isCompleted ? 'completed' : 'not completed'}`}
                        aria-pressed={isCompleted}
                      >
                        {isCompleted ? (
                          <CheckSquare className="w-4 h-4" />
                        ) : (
                          <Square className="w-4 h-4 opacity-30" />
                        )}
                        </button>
                      </div>
                    );
                  })}
                </div>
              ))}

              {/* Second row for months with more than 15 days */}
              {daysInMonth > 15 && (
                <>
                  <div className="grid gap-1 mb-2 mt-4" style={{ gridTemplateColumns: `120px repeat(${daysInMonth - 15}, 1fr)` }} role="row">
                    <div role="columnheader"></div>
                    {Array.from({ length: daysInMonth - 15 }, (_, i) => i + 16).map(day => (
                      <div key={day} className="text-center text-xs font-medium text-slate-500 py-1" role="columnheader">
                        {day}
                      </div>
                    ))}
                  </div>

                  {habits.map((habit, habitIndex) => (
                    <div key={habitIndex} className="grid gap-1 mb-2" style={{ gridTemplateColumns: `120px repeat(${daysInMonth - 15}, 1fr)` }} role="row">
                      <div className="text-xs font-medium text-slate-600 py-2 pr-2 truncate" role="rowheader">
                        {habit.name}
                      </div>
                      {Array.from({ length: daysInMonth - 15 }, (_, i) => i + 16).map(day => {
                        const isCompleted = getDayData(day).habits?.[habitIndex];
                        return (
                          <div key={day} role="gridcell">
                            <button
                            key={day}
                            onClick={() => updateHabit(day, habitIndex, !isCompleted)}
                            className={`
                              h-8 rounded-md border-2 transition-all duration-200 flex items-center justify-center
                              ${isCompleted 
                                ? `${getHabitColor(habit.type)} bg-opacity-10` 
                                : 'border-slate-200 hover:border-slate-300'
                              }
                            `}
                            aria-label={`${habit.name} for day ${day}: ${isCompleted ? 'completed' : 'not completed'}`}
                            aria-pressed={isCompleted}
                          >
                            {isCompleted ? (
                              <CheckSquare className="w-4 h-4" />
                            ) : (
                              <Square className="w-4 h-4 opacity-30" />
                            )}
                            </button>
                          </div>
                        );
                      })}
                    </div>
                  ))}
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </section>
  );
};

export default HabitGrid;