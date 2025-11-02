import React from 'react';
import { Moon, TrendingUp } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';

interface SleepTrackerProps {
  currentDate: Date;
  daysInMonth: number;
  getDayData: (day: number) => any;
  updateSleep: (day: number, value: number) => void;
}

const SleepTracker: React.FC<SleepTrackerProps> = ({
  currentDate,
  daysInMonth,
  getDayData,
  updateSleep
}) => {
  const { isDarkMode } = useTheme();
  const getSleepData = () => {
    const sleepData = [];
    for (let day = 1; day <= daysInMonth; day++) {
      const sleep = getDayData(day).sleep;
      if (sleep && sleep > 0) {
        sleepData.push({ day, hours: sleep });
      }
    }
    return sleepData;
  };

  const getAverageSleep = () => {
    const sleepData = getSleepData();
    if (sleepData.length === 0) return 0;
    const total = sleepData.reduce((sum, data) => sum + data.hours, 0);
    return Math.round((total / sleepData.length) * 10) / 10;
  };

  const createSleepPath = () => {
    const sleepData = getSleepData();
    if (sleepData.length < 2) return '';
    
    const width = 280;
    const height = 120;
    const maxSleep = 10;
    const minSleep = 4;
    
    const pathData = sleepData.map((point, index) => {
      const x = (point.day / daysInMonth) * width;
      const y = height - ((point.hours - minSleep) / (maxSleep - minSleep)) * height;
      return `${index === 0 ? 'M' : 'L'} ${x} ${y}`;
    }).join(' ');
    
    return pathData;
  };

  const averageSleep = getAverageSleep();

  return (
    <section className="bg-secondary-bg dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 p-6" aria-labelledby="sleep-heading">
      <div className="flex items-center gap-2 mb-6">
        <Moon className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
        <h2 id="sleep-heading" className="text-xl font-semibold text-slate-800 dark:text-slate-200">Sleep Tracking</h2>
      </div>

      {/* Sleep Stats */}
      <div className="grid grid-cols-2 gap-4 mb-6" role="region" aria-labelledby="sleep-stats">
        <h3 id="sleep-stats" className="sr-only">Sleep statistics</h3>
        <div className="bg-white dark:bg-slate-800 rounded-lg p-3">
          <div className="text-xs text-slate-500 dark:text-slate-400 mb-1" id="avg-sleep-label">Average Sleep</div>
          <div className="text-lg font-semibold text-slate-800 dark:text-slate-200">
            {averageSleep > 0 ? `${averageSleep}h` : '--'}
          </div>
        </div>
        <div className="bg-white dark:bg-slate-800 rounded-lg p-3">
          <div className="text-xs text-slate-500 dark:text-slate-400 mb-1" id="days-tracked-label">Days Tracked</div>
          <div className="text-lg font-semibold text-slate-800 dark:text-slate-200">
            {getSleepData().length}/{daysInMonth}
          </div>
        </div>
      </div>

      {/* Sleep Graph */}
      <div className="mb-6" role="region" aria-labelledby="sleep-chart">
        <h3 id="sleep-chart" className="sr-only">Sleep hours chart</h3>
        <div className="relative bg-white rounded-lg p-4">
          <svg width="300" height="140" className="mx-auto" role="img" aria-labelledby="chart-title" aria-describedby="chart-desc">
            <title id="chart-title">Sleep Hours Chart</title>
            <desc id="chart-desc">A line chart showing daily sleep hours for the current month with average sleep line</desc>
            {/* Grid lines */}
            {[4, 5, 6, 7, 8, 9, 10].map(hour => (
              <g key={hour}>
                <line 
                  x1="20" 
                  y1={140 - ((hour - 4) / 6) * 120} 
                  x2="280" 
                  y2={140 - ((hour - 4) / 6) * 120} 
                  stroke={isDarkMode ? '#334155' : '#e2e8f0'} 
                  strokeWidth="1"
                />
                <text 
                  x="15" 
                  y={145 - ((hour - 4) / 6) * 120} 
                  fontSize="10" 
                  textAnchor="end"
                  fill={isDarkMode ? '#94a3b8' : '#64748b'}
                >
                  {hour}h
                </text>
              </g>
            ))}
            
            {/* Average line */}
            {averageSleep > 0 && (
              <line
                x1="20"
                y1={140 - ((averageSleep - 4) / 6) * 120}
                x2="280"
                y2={140 - ((averageSleep - 4) / 6) * 120}
                stroke={isDarkMode ? '#fbbf24' : '#f59e0b'}
                strokeWidth="1"
                strokeDasharray="4,4"
              />
            )}
            
            {/* Sleep line */}
            {getSleepData().length > 1 && (
              <path
                d={createSleepPath()}
                fill="none"
                stroke={isDarkMode ? '#60a5fa' : '#3b82f6'}
                strokeWidth="2"
              />
            )}
            
            {/* Sleep points */}
            {getSleepData().map(point => (
              <circle
                key={point.day}
                cx={20 + (point.day / daysInMonth) * 260}
                cy={140 - ((point.hours - 4) / 6) * 120}
                r="4"
                fill={isDarkMode ? '#60a5fa' : '#3b82f6'}
                className="hover:r-6 transition-all cursor-pointer"
              />
            ))}
          </svg>
        </div>
      </div>

      {/* Sleep Input Grid */}
      <div className="space-y-2" role="region" aria-labelledby="sleep-input-heading">
        <h3 id="sleep-input-heading" className="text-sm font-medium text-slate-600 dark:text-slate-400">Daily Sleep Hours</h3>
        <div className="grid gap-1" style={{ gridTemplateColumns: `repeat(${Math.min(daysInMonth, 10)}, 1fr)` }} role="grid" aria-label="Daily sleep hours input">
          {Array.from({ length: Math.min(daysInMonth, 10) }, (_, i) => i + 1).map(day => (
            <div key={day} className="text-center" role="gridcell">
              <div className="text-xs text-slate-500 dark:text-slate-400 mb-1">{day}</div>
              <input
                type="number"
                step="0.5"
                min="0"
                max="12"
                value={getDayData(day).sleep || ''}
                onChange={(e) => updateSleep(day, parseFloat(e.target.value) || 0)}
                className="w-full text-xs text-center border border-slate-300 dark:border-slate-600 dark:bg-slate-900 dark:text-slate-200 rounded p-1 focus:ring-1 focus:ring-indigo-500 focus:border-transparent"
                placeholder="0"
                aria-label={`Sleep hours for day ${day}`}
              />
            </div>
          ))}
        </div>
        
        {daysInMonth > 10 && (
          <>
            <div className="grid gap-1 mt-2" style={{ gridTemplateColumns: `repeat(${Math.min(daysInMonth - 10, 10)}, 1fr)` }} role="grid" aria-label="Daily sleep hours input continued">
              {Array.from({ length: Math.min(daysInMonth - 10, 10) }, (_, i) => i + 11).map(day => (
                <div key={day} className="text-center" role="gridcell">
                  <div className="text-xs text-slate-500 dark:text-slate-400 mb-1">{day}</div>
                  <input
                    type="number"
                    step="0.5"
                    min="0"
                    max="12"
                    value={getDayData(day).sleep || ''}
                    onChange={(e) => updateSleep(day, parseFloat(e.target.value) || 0)}
                    className="w-full text-xs text-center border border-slate-300 dark:border-slate-600 dark:bg-slate-900 dark:text-slate-200 rounded p-1 focus:ring-1 focus:ring-indigo-500 focus:border-transparent"
                    placeholder="0"
                    aria-label={`Sleep hours for day ${day}`}
                  />
                </div>
              ))}
            </div>
            
            {daysInMonth > 20 && (
              <div className="grid gap-1 mt-2" style={{ gridTemplateColumns: `repeat(${daysInMonth - 20}, 1fr)` }} role="grid" aria-label="Daily sleep hours input final section">
                {Array.from({ length: daysInMonth - 20 }, (_, i) => i + 21).map(day => (
                  <div key={day} className="text-center" role="gridcell">
                    <div className="text-xs text-slate-500 dark:text-slate-400 mb-1">{day}</div>
                    <input
                      type="number"
                      step="0.5"
                      min="0"
                      max="12"
                      value={getDayData(day).sleep || ''}
                      onChange={(e) => updateSleep(day, parseFloat(e.target.value) || 0)}
                      className="w-full text-xs text-center border border-slate-300 dark:border-slate-600 dark:bg-slate-900 dark:text-slate-200 rounded p-1 focus:ring-1 focus:ring-indigo-500 focus:border-transparent"
                      placeholder="0"
                      aria-label={`Sleep hours for day ${day}`}
                    />
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </section>
  );
};

export default SleepTracker;