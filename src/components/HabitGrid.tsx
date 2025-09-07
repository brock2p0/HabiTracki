import React from 'react';
import { CheckSquare, Square, Target } from 'lucide-react';
import { format, isBefore, startOfDay, subDays, isSameMonth } from 'date-fns';
import type { Habit } from '../types';

interface HabitGridProps {
  habits: Habit[];
  currentDate: Date;
  daysInMonth: number;
  getDayData: (day: number) => any;
  updateHabit: (day: number, habitIndex: number, value: boolean | number) => void;
}

const HabitGrid: React.FC<HabitGridProps> = ({
  habits,
  currentDate,
  daysInMonth,
  getDayData,
  updateHabit
}) => {
  const today = startOfDay(new Date());

  const getHabitColor = (type: string) => {
    switch (type) {
      case 'critical': return 'text-habit-critical-700 border-habit-critical-300';
      case 'goal': return 'text-habit-goal-600 border-habit-goal-300';
      case 'avoid': return 'text-habit-avoid-600 border-habit-avoid-300';
      default: return 'text-slate-600 border-slate-200';
    }
  };

  const getFlameMomentum = (habit: Habit) => {
    if (!habit) return 0;
    
    const today = new Date();
    const isCurrentMonth = isSameMonth(currentDate, today);
    
    // Determine the effective end date for the 7-day window
    const effectiveEndDate = isCurrentMonth ? today : new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);
    
    let completionsCount = 0;
    let gapsCount = 0;
    let daysWithData = 0;
    
    // Check the last 7 days (or fewer if month started recently)
    for (let i = 0; i < 7; i++) {
      const checkDate = subDays(effectiveEndDate, i);
      
      // Only check days within the current displayed month
      if (checkDate.getMonth() === currentDate.getMonth() && checkDate.getFullYear() === currentDate.getFullYear()) {
        const day = checkDate.getDate();
        const dayData = getDayData(day);
        
        if (dayData.habits && dayData.habits[habit.id] !== undefined) {
          daysWithData++;
          const isCompleted = dayData.habits[habit.id];
          
          // For 'avoid' habits, success is when the habit is NOT checked
          const isSuccessful = habit.type === 'avoid' ? !isCompleted : isCompleted;
          
          if (isSuccessful) {
            completionsCount++;
          } else {
            gapsCount++;
          }
        }
      }
    }
    
    // Calculate consistency multiplier
    let consistencyMultiplier = 1.0;
    if (daysWithData > 0) {
      if (gapsCount === 0) {
        consistencyMultiplier = 1.2;
      } else if (gapsCount >= 3) {
        consistencyMultiplier = 0.8;
      }
    }
    
    // Calculate momentum: (completions in last 7 days ÷ 7 × 10) × consistency multiplier
    const momentum = (completionsCount / 7) * 10 * consistencyMultiplier;
    
    return momentum;
  };

  return (
    <section className="bg-secondary-bg rounded-2xl shadow-sm border border-slate-200 p-6" aria-labelledby="habits-heading">
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
              <div key={habit.id} className="flex items-center justify-between" role="listitem">
                <div className="flex items-center gap-3">
                  <div className={`w-3 h-3 rounded-full ${
                    habit.type === 'critical' ? 'bg-habit-critical-500' :
                    habit.type === 'goal' ? 'bg-habit-goal-500' :
                    habit.type === 'avoid' ? 'bg-habit-avoid-500' : 'bg-slate-500'
                  }`}></div>
                  <span className="font-medium text-slate-700">{habit.name}</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-1">
                    <span className="text-sm" aria-label={`${habit.flameCount || 10} flame icons for momentum display`}>
                      {Array(habit.flameCount || 10).fill('🔥').join('')}
                    </span>
                    <span className="text-xs font-medium text-slate-700 min-w-[32px] text-right" aria-label={`Momentum multiplier: ${getFlameMomentum(habit).toFixed(1)}`}>
                      x{getFlameMomentum(habit).toFixed(1)}
                    </span>
                  </div>
                  </span>
                </div>
              </div>
            ))}
          </div>

          {/* Habit Grid */}
          <div className="overflow-auto" role="region" aria-labelledby="habit-grid-label">
            <h3 id="habit-grid-label" className="sr-only">Daily habit completion grid</h3>
            <div className="min-w-full">
              {/* Habit Headers (X-axis) */}
              <div className="grid gap-0 mb-3 divide-x divide-slate-400" style={{ gridTemplateColumns: `150px repeat(${habits.length}, 1fr)` }} role="row">
                <div className="text-sm font-medium text-slate-500 py-3 px-2 text-center" role="columnheader">Day</div>
                {habits.map((habit, index) => (
                  <div key={habit.id} className="text-center text-xs font-medium text-slate-600 py-3 px-0.5" role="columnheader">
                    <div className="flex flex-col items-center gap-1">
                      <div className={`w-2 h-2 rounded-full ${
                        habit.type === 'critical' ? 'bg-habit-critical-500' :
                        habit.type === 'goal' ? 'bg-habit-goal-500' :
                        habit.type === 'avoid' ? 'bg-habit-avoid-500' : 'bg-slate-500'
                      }`}></div>
                      <span className="leading-tight">{habit.name}</span>
                    </div>
                  </div>
                ))}
              </div>

              {/* Day Rows (Y-axis) */}
              <div className="space-y-2">
                {Array.from({ length: daysInMonth }, (_, i) => i + 1).map(day => {
                  const todayCheck = new Date();
                  const dayDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);
                  const isToday = todayCheck.getDate() === day && 
                                 todayCheck.getMonth() === currentDate.getMonth() && 
                                 todayCheck.getFullYear() === currentDate.getFullYear();
                  const isPastDay = isBefore(dayDate, today);
                  
                  return (
                    <div key={day} className="grid gap-0 divide-x divide-slate-400" style={{ gridTemplateColumns: `150px repeat(${habits.length}, 1fr)` }} role="row">
                      <div className={`text-xs font-medium py-2 px-2 text-center rounded-md ${
                        isToday ? 'bg-indigo-100 text-indigo-700 font-bold' : 'text-slate-600'
                      } text-left`} role="rowheader">
                        <div className={isPastDay ? 'line-through' : ''}>
                          {format(dayDate, 'EEEE do')}
                        </div>
                      </div>
                      {habits.map((habit, habitIndex) => {
                        const isCompleted = getDayData(day).habits?.[habit.id];
                        return (
                          <div key={habitIndex} role="gridcell">
                            <button
                              onClick={() => updateHabit(day, habitIndex, !isCompleted)}
                              className={`
                                w-full h-10 rounded-lg border transition-all duration-200 flex items-center justify-center hover:scale-105
                                ${isCompleted 
                                  ? habit.type === 'critical' ? 'border-habit-critical-300 bg-habit-critical-50 text-habit-critical-700' :
                                    habit.type === 'goal' ? 'border-habit-goal-300 bg-habit-goal-50 text-habit-goal-600' :
                                    'border-habit-avoid-300 bg-habit-avoid-50 text-habit-avoid-600'
                                  : 'border-slate-200 hover:border-slate-300 text-slate-400 hover:text-slate-600'
                                }
                              `}
                              aria-label={`${habit.name} for day ${day}: ${isCompleted ? 'completed' : 'not completed'}`}
                              aria-pressed={isCompleted}
                            >
                              {isCompleted ? (
                                <CheckSquare className="w-4 h-4" />
                              ) : (
                                <Square className="w-4 h-4 opacity-50" />
                              )}
                            </button>
                          </div>
                        );
                      })}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Habit Descriptions */}
          <div className="mt-8 space-y-4" role="region" aria-labelledby="habit-descriptions">
            <h3 id="habit-descriptions" className="text-lg font-semibold text-slate-800 mb-4">Habit Definitions</h3>
            <div className="grid gap-4">
              {habits.map((habit, index) => (
                <div key={habit.id} className="bg-white rounded-lg p-4 border border-slate-200">
                  <div className="flex items-center gap-3 mb-2">
                    <div className={`w-3 h-3 rounded-full ${
                      habit.type === 'critical' ? 'bg-habit-critical-500' :
                      habit.type === 'goal' ? 'bg-habit-goal-500' :
                      habit.type === 'avoid' ? 'bg-habit-avoid-500' : 'bg-slate-500'
                    }`}></div>
                    <h4 className="font-medium text-slate-700">{habit.name}</h4>
                    <span className={`px-2 py-1 text-xs rounded-full ${
                      habit.type === 'critical' ? 'bg-habit-critical-100 text-habit-critical-700' :
                      habit.type === 'goal' ? 'bg-habit-goal-100 text-habit-goal-700' :
                      habit.type === 'avoid' ? 'bg-habit-avoid-100 text-habit-avoid-700' : 'bg-slate-100 text-slate-700'
                    }`}>
                      {habit.type}
                    </span>
                  </div>
                  {habit.description ? (
                    <p className="text-sm text-slate-600 leading-relaxed">{habit.description}</p>
                  ) : (
                    <p className="text-sm text-slate-400 italic">No description provided. Add one in settings to clarify what this habit means to you.</p>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </section>
  );
};

export default HabitGrid;