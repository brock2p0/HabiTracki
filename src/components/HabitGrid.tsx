import React, { useState, useEffect, useRef } from 'react';
import { CheckSquare, Square, Flame, Info } from 'lucide-react';
import { format, isBefore, startOfDay, subDays } from 'date-fns';
import type { Habit } from '../types';
import HabitHeaderRow from './HabitHeaderRow';

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
  const [tooltipVisible, setTooltipVisible] = useState<number | null>(null);
  const [tooltipTimeout, setTooltipTimeout] = useState<NodeJS.Timeout | null>(null);
  const [isFloating, setIsFloating] = useState(false);
  const headerRef = useRef<HTMLDivElement>(null);
  const [headerDimensions, setHeaderDimensions] = useState({ width: 0, left: 0 });

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

  useEffect(() => {
    return () => {
      if (tooltipTimeout) {
        clearTimeout(tooltipTimeout);
      }
    };
  }, [tooltipTimeout]);

  useEffect(() => {
    if (!isMobile || !headerRef.current) return;

    const header = headerRef.current;

    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsFloating(!entry.isIntersecting);
      },
      {
        threshold: 0,
        rootMargin: '-1px 0px 0px 0px'
      }
    );

    observer.observe(header);

    return () => observer.disconnect();
  }, [isMobile]);

  useEffect(() => {
    if (!isMobile || !headerRef.current) return;

    const updateDimensions = () => {
      if (headerRef.current) {
        setHeaderDimensions({
          width: headerRef.current.offsetWidth,
          left: headerRef.current.offsetLeft
        });
      }
    };

    updateDimensions();

    const resizeObserver = new ResizeObserver(updateDimensions);
    resizeObserver.observe(headerRef.current);

    window.addEventListener('resize', updateDimensions);

    return () => {
      resizeObserver.disconnect();
      window.removeEventListener('resize', updateDimensions);
    };
  }, [isMobile, habits]);

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
          {/* Floating Header Clone (Mobile Only) */}
          {isMobile && isFloating && (
            <div
              className="fixed top-[60px] left-0 right-0 z-30 bg-white/85 backdrop-blur-sm border-b border-slate-200"
              style={{
                width: headerDimensions.width || '100%',
                paddingLeft: `${headerDimensions.left}px`,
                paddingRight: '8px',
                transform: 'translateZ(0)',
                willChange: 'transform'
              }}
            >
              <HabitHeaderRow
                habits={habits}
                isMobile={isMobile}
                tooltipVisible={tooltipVisible}
                showTooltip={showTooltip}
                hideTooltip={hideTooltip}
                className=""
              />
            </div>
          )}

          {/* Habit Grid */}
          <div className="overflow-hidden px-1" role="region" aria-labelledby="habit-grid-label">
            <h3 id="habit-grid-label" className="sr-only">Daily habit completion grid</h3>
            <div className="min-w-full">
              {/* Original Habit Headers (X-axis) */}
              <div ref={headerRef}>
                <HabitHeaderRow
                  habits={habits}
                  isMobile={isMobile}
                  tooltipVisible={tooltipVisible}
                  showTooltip={showTooltip}
                  hideTooltip={hideTooltip}
                  className={isMobile ? 'border-b border-slate-200' : 'divide-x divide-slate-400'}
                />
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
        </div>
      )}
    </section>
  );
};

export default HabitGrid;