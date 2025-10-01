import React from 'react';
import { CheckSquare, Square, Flame, Info } from 'lucide-react';
import { format, isBefore, startOfDay, subDays } from 'date-fns';
import type { Habit } from '../types';

interface HabitGridProps {
  habits: Habit[];
  currentDate: Date;
  daysInMonth: number;
  getDayData: (day: number) => any;
  updateHabit: (day: number, habitId: string, value: boolean | number) => void;
  isMobile?: boolean;
}

const HabitGrid: React.FC<HabitGridProps> = ({
  habits,
  currentDate,
  daysInMonth,
  getDayData,
  updateHabit,
  isMobile = false
}) => {
  const [tooltipVisible, setTooltipVisible] = React.useState<number | null>(null);
  const [tooltipTimeout, setTooltipTimeout] = React.useState<NodeJS.Timeout | null>(null);

  const today = startOfDay(new Date());

  const getHabitColor = (type: string) => {
    switch (type) {
      case 'critical': return 'text-habit-critical-700 border-habit-critical-300';
      case 'goal': return 'text-habit-goal-600 border-habit-goal-300';
      case 'avoid': return 'text-habit-avoid-600 border-habit-avoid-300';
      default: return 'text-slate-600 border-slate-200';
    }
  };

  const showTooltip = (habitIndex: number) => {
    if (tooltipTimeout) {
      clearTimeout(tooltipTimeout);
    }
    setTooltipVisible(habitIndex);
    
    const timeout = setTimeout(() => {
      setTooltipVisible(null);
    }, 2000);
    setTooltipTimeout(timeout);
  };

  const hideTooltip = () => {
    if (tooltipTimeout) {
      clearTimeout(tooltipTimeout);
    }
    setTooltipVisible(null);
  };

  React.useEffect(() => {
    return () => {
      if (tooltipTimeout) {
        clearTimeout(tooltipTimeout);
      }
    };
  }, [tooltipTimeout]);

  const getFlameMomentum = (habit: Habit) => {
    if (isMobile) return 0; // Skip flame calculation on mobile
    
    const flameCount = habit.flameCount || 3;
    const lookbackDays = Math.min(14, daysInMonth);
    const recentDays = [];
    
    for (let i = 0; i < lookbackDays; i++) {
      const day = daysInMonth - i;
      if (day >= 1) {
        const dayData = getDayData(day);
        const isCompleted = dayData.habits?.[habit.id] || false;
        recentDays.unshift({ day, completed: isCompleted });
      }
    }
    
    if (recentDays.length === 0) return 0;
    
    const completedDays = recentDays.filter(d => d.completed).length;
    const baseRate = completedDays / recentDays.length;
    const momentum = baseRate;
    return Math.min(flameCount, Math.round(momentum * flameCount));
  };

  return (
    <section className={`bg-secondary-bg ${isMobile ? '' : 'rounded-2xl'} shadow-sm border border-slate-200 ${isMobile ? 'p-2' : 'p-6'}`} aria-labelledby="habits-heading">
      {!isMobile && (
        <div className="flex items-center gap-2 mb-6">
          <Flame className="w-5 h-5 text-orange-500" />
          <h2 id="habits-heading" className="text-xl font-semibold text-slate-800">Daily Habits</h2>
        </div>
      )}

      {habits.length === 0 ? (
        <div className="text-center py-12 text-slate-500">
          <Flame className="w-12 h-12 mx-auto mb-4 opacity-50" />
          <p>No habits yet. Add some habits to start tracking!</p>
        </div>
      ) : (
        <div className="space-y-4">
          {/* Habit Flame Overview - Desktop Only */}
          {!isMobile && (
            <div className="space-y-3 mb-6" role="list" aria-label="Habit flame momentum overview">
              {habits.map((habit, habitIndex) => (
                <div key={habitIndex} className="flex items-center justify-between" role="listitem">
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
                      {Array.from({ length: habit.flameCount || 3 }, (_, i) => (
                        <span 
                          key={i} 
                          className={`text-sm ${i < getFlameMomentum(habit) ? 'text-orange-500' : 'text-slate-300'}`}
                          aria-hidden="true"
                        >
                          🔥
                        </span>
                      ))}
                    </div>
                    <span className="text-xs text-slate-500 w-12 text-right" aria-label={`${getFlameMomentum(habit)} out of ${habit.flameCount || 3} flames`}>
                      {getFlameMomentum(habit)}/{habit.flameCount || 3}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Habit Grid */}
          <div className="overflow-hidden px-1" role="region" aria-labelledby="habit-grid-label">
            <h3 id="habit-grid-label" className="sr-only">Daily habit completion grid</h3>
            <div className="min-w-full">
              {/* Habit Headers (X-axis) */}
              <div 
                className={`grid gap-0 mb-3 ${isMobile ? 'sticky top-[60px] z-10 bg-white border-b border-slate-200' : 'divide-x divide-slate-400'}`} 
                style={{ gridTemplateColumns: isMobile ? `40px repeat(${Math.min(habits.length, 9)}, 30px)` : `150px repeat(${habits.length}, 1fr)` }} 
                role="row"
              >
                <div className={`text-sm font-medium text-slate-500 ${isMobile ? 'py-2 px-0.5 text-xs bg-slate-100' : 'py-3 px-2'}`} role="columnheader">
                  {isMobile ? 'Day' : 'Day'}
                </div>
                {habits.map((habit, index) => (
                  <div 
                    key={index} 
                    className={`text-center text-xs font-medium text-slate-600 ${isMobile ? 'py-2 px-0 relative' : 'py-3 px-0.5'}`} 
                    role="columnheader"
                  >
                    <div className="flex flex-col items-center gap-1">
                      <div className={`${isMobile ? 'w-1.5 h-1.5' : 'w-2 h-2'} rounded-full ${
                        habit.type === 'critical' ? 'bg-habit-critical-500' :
                        habit.type === 'goal' ? 'bg-habit-goal-500' :
                        habit.type === 'avoid' ? 'bg-habit-avoid-500' : 'bg-slate-500'
                      }`}></div>
                      {isMobile ? (
                        <button
                          onClick={() => showTooltip(index)}
                          onMouseEnter={() => !isMobile && showTooltip(index)}
                          onMouseLeave={() => !isMobile && hideTooltip()}
                          className="leading-tight hover:text-slate-800 transition-colors"
                          aria-label={`${habit.name} - tap for full name`}
                        >
                          {habit.abbreviation || habit.name.substring(0, 2)}
                        </button>
                      ) : (
                        <span className="leading-tight">{habit.name}</span>
                      )}
                    </div>
                    
                    {/* Tooltip */}
                    {tooltipVisible === index && (
                      <div className="absolute top-full left-1/2 transform -translate-x-1/2 mt-1 z-20 bg-slate-800 text-white text-xs px-2 py-1 rounded shadow-lg whitespace-nowrap">
                        {habit.name}
                        <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 border-4 border-transparent border-b-slate-800"></div>
                      </div>
                    )}
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
                    <div 
                      key={day} 
                      className="grid gap-0 divide-x divide-slate-400" 
                      style={{ gridTemplateColumns: isMobile ? `40px repeat(${Math.min(habits.length, 9)}, 30px)` : `150px repeat(${habits.length}, 1fr)` }} 
                      role="row"
                    >
                      <div className={`text-xs font-medium py-2 px-1 text-center ${isMobile ? 'bg-slate-100' : 'rounded-md'} ${
                        isToday ? 'bg-indigo-100 text-indigo-700 font-bold' : 'text-slate-600'
                      } ${isMobile ? 'text-center' : 'text-left'}`} role="rowheader">
                        <div className={isPastDay ? 'line-through' : ''}>
                          {isMobile ? day : format(dayDate, 'EEEE do')}
                        </div>
                      </div>
                      {habits.map((habit, habitIndex) => {
                        const isCompleted = getDayData(day).habits?.[habit.id];
                        return (
                          <div key={habit.id} role="gridcell">
                            <button
                              onClick={() => updateHabit(day, habit.id, !isCompleted)}
                              className={`
                                ${isMobile ? 'w-[28px] h-[36px] touch-target-expand' : 'w-full h-10'} rounded-lg border transition-all duration-200 flex items-center justify-center hover:scale-105
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
                                <CheckSquare className={`${isMobile ? 'w-3 h-3' : 'w-4 h-4'}`} />
                              ) : (
                                <Square className={`${isMobile ? 'w-2.5 h-2.5' : 'w-4 h-4'} opacity-50`} />
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

          {/* Habit Descriptions - Desktop Only */}
          {!isMobile && (
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
          )}
        </div>
      )}
    </section>
  );
};

export default HabitGrid;