import React from 'react';
import type { Habit } from '../types';

interface HabitHeaderRowProps {
  habits: Habit[];
  isMobile: boolean;
  tooltipVisible: number | null;
  showTooltip: (index: number) => void;
  hideTooltip: () => void;
  className?: string;
}

const HabitHeaderRow: React.FC<HabitHeaderRowProps> = ({
  habits,
  isMobile,
  tooltipVisible,
  showTooltip,
  hideTooltip,
  className = ''
}) => {
  return (
    <div
      className={`grid gap-0 mb-3 ${className}`}
      style={{ gridTemplateColumns: isMobile ? `40px repeat(${Math.min(habits.length, 9)}, 30px)` : `150px repeat(${habits.length}, 1fr)` }}
      role="row"
    >
      <div className={`text-sm font-medium text-slate-500 ${isMobile ? 'py-2 px-0.5 text-xs bg-slate-100' : 'py-3 px-2'}`} role="columnheader">
        {isMobile ? 'Day' : 'Day'}
      </div>
      {habits.slice(0, isMobile ? 9 : habits.length).map((habit, index) => (
        <div
          key={habit.id}
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

          {tooltipVisible === index && (
            <div className="absolute top-full left-1/2 transform -translate-x-1/2 mt-1 z-20 bg-slate-800 text-white text-xs px-2 py-1 rounded shadow-lg whitespace-nowrap">
              {habit.name}
              <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 border-4 border-transparent border-b-slate-800"></div>
            </div>
          )}
        </div>
      ))}
    </div>
  );
};

export default HabitHeaderRow;
