import React from 'react';
import { Smile, TrendingUp } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';

interface MoodTrackerProps {
  currentDate: Date;
  daysInMonth: number;
  getDayData: (day: number) => any;
  updateMood: (day: number, value: number) => void;
}

const MoodTracker: React.FC<MoodTrackerProps> = ({
  currentDate,
  daysInMonth,
  getDayData,
  updateMood
}) => {
  const { isDarkMode } = useTheme();
  const getMoodData = () => {
    const moodData = [];
    for (let day = 1; day <= daysInMonth; day++) {
      const mood = getDayData(day).mood;
      if (mood && mood > 0) {
        moodData.push({ day, rating: mood });
      }
    }
    return moodData;
  };

  const getAverageMood = () => {
    const moodData = getMoodData();
    if (moodData.length === 0) return 0;
    const total = moodData.reduce((sum, data) => sum + data.rating, 0);
    return Math.round((total / moodData.length) * 10) / 10;
  };

  const createMoodPath = () => {
    const moodData = getMoodData();
    if (moodData.length < 2) return '';
    
    const width = 280;
    const height = 120;
    const maxMood = 5;
    const minMood = 1;
    
    const pathData = moodData.map((point, index) => {
      const x = (point.day / daysInMonth) * width;
      const y = height - ((point.rating - minMood) / (maxMood - minMood)) * height;
      return `${index === 0 ? 'M' : 'L'} ${x} ${y}`;
    }).join(' ');
    
    return pathData;
  };

  const averageMood = getAverageMood();

  return (
    <section className="bg-secondary-bg dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 p-6" aria-labelledby="mood-heading">
      <div className="flex items-center gap-2 mb-6">
        <Smile className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
        <h2 id="mood-heading" className="text-xl font-semibold text-slate-800 dark:text-slate-200">Mood Tracking</h2>
      </div>

      {/* Mood Stats */}
      <div className="grid grid-cols-2 gap-4 mb-6" role="region" aria-labelledby="mood-stats">
        <h3 id="mood-stats" className="sr-only">Mood statistics</h3>
        <div className="bg-white dark:bg-slate-800 rounded-lg p-3">
          <div className="text-xs text-slate-500 dark:text-slate-400 mb-1" id="avg-mood-label">Average Mood</div>
          <div className="text-lg font-semibold text-slate-800 dark:text-slate-200">
            {averageMood > 0 ? `${averageMood}/5` : '--'}
          </div>
        </div>
        <div className="bg-white dark:bg-slate-800 rounded-lg p-3">
          <div className="text-xs text-slate-500 dark:text-slate-400 mb-1" id="days-tracked-label">Days Tracked</div>
          <div className="text-lg font-semibold text-slate-800 dark:text-slate-200">
            {getMoodData().length}/{daysInMonth}
          </div>
        </div>
      </div>

      {/* Mood Graph */}
      <div className="mb-6" role="region" aria-labelledby="mood-chart">
        <h3 id="mood-chart" className="sr-only">Mood rating chart</h3>
        <div className="relative bg-white rounded-lg p-4">
          <svg width="300" height="140" className="mx-auto" role="img" aria-labelledby="chart-title" aria-describedby="chart-desc">
            <title id="chart-title">Mood Rating Chart</title>
            <desc id="chart-desc">A line chart showing daily mood ratings for the current month with average mood line</desc>
            {/* Grid lines */}
            {[1, 2, 3, 4, 5].map(rating => (
              <g key={rating}>
                <line 
                  x1="20" 
                  y1={140 - ((rating - 1) / 4) * 120} 
                  x2="280" 
                  y2={140 - ((rating - 1) / 4) * 120} 
                  stroke={isDarkMode ? '#334155' : '#e2e8f0'} 
                  strokeWidth="1"
                />
                <text 
                  x="15" 
                  y={145 - ((rating - 1) / 4) * 120} 
                  fontSize="10" 
                  textAnchor="end"
                  fill={isDarkMode ? '#94a3b8' : '#64748b'}
                >
                  {rating}
                </text>
              </g>
            ))}
            
            {/* Average line */}
            {averageMood > 0 && (
              <line
                x1="20"
                y1={140 - ((averageMood - 1) / 4) * 120}
                x2="280"
                y2={140 - ((averageMood - 1) / 4) * 120}
                stroke={isDarkMode ? '#fbbf24' : '#f59e0b'}
                strokeWidth="1"
                strokeDasharray="4,4"
              />
            )}
            
            {/* Mood line */}
            {getMoodData().length > 1 && (
              <path
                d={createMoodPath()}
                fill="none"
                stroke={isDarkMode ? '#60a5fa' : '#3b82f6'}
                strokeWidth="2"
              />
            )}
            
            {/* Mood points */}
            {getMoodData().map(point => (
              <circle
                key={point.day}
                cx={20 + (point.day / daysInMonth) * 260}
                cy={140 - ((point.rating - 1) / 4) * 120}
                r="4"
                fill={isDarkMode ? '#60a5fa' : '#3b82f6'}
                className="hover:r-6 transition-all cursor-pointer"
              />
            ))}
          </svg>
        </div>
      </div>

      {/* Mood Input Grid */}
      <div className="space-y-2" role="region" aria-labelledby="mood-input-heading">
        <h3 id="mood-input-heading" className="text-sm font-medium text-slate-600 dark:text-slate-400">Daily Mood Rating</h3>
        <div className="grid gap-1" style={{ gridTemplateColumns: `repeat(${Math.min(daysInMonth, 10)}, 1fr)` }} role="grid" aria-label="Daily mood rating input">
          {Array.from({ length: Math.min(daysInMonth, 10) }, (_, i) => i + 1).map(day => (
            <div key={day} className="text-center" role="gridcell">
              <div className="text-xs text-slate-500 dark:text-slate-400 mb-1">{day}</div>
              <input
                type="number"
                step="1"
                min="1"
                max="5"
                value={getDayData(day).mood || ''}
                onChange={(e) => updateMood(day, parseInt(e.target.value) || 0)}
                className="w-full text-xs text-center border border-slate-300 dark:border-slate-600 dark:bg-slate-900 dark:text-slate-200 rounded p-1 focus:ring-1 focus:ring-indigo-500 focus:border-transparent"
                placeholder="0"
                aria-label={`Mood rating for day ${day}`}
              />
            </div>
          ))}
        </div>
        
        {daysInMonth > 10 && (
          <>
            <div className="grid gap-1 mt-2" style={{ gridTemplateColumns: `repeat(${Math.min(daysInMonth - 10, 10)}, 1fr)` }} role="grid" aria-label="Daily mood rating input continued">
              {Array.from({ length: Math.min(daysInMonth - 10, 10) }, (_, i) => i + 11).map(day => (
                <div key={day} className="text-center" role="gridcell">
                  <div className="text-xs text-slate-500 dark:text-slate-400 mb-1">{day}</div>
                  <input
                    type="number"
                    step="1"
                    min="1"
                    max="5"
                    value={getDayData(day).mood || ''}
                    onChange={(e) => updateMood(day, parseInt(e.target.value) || 0)}
                    className="w-full text-xs text-center border border-slate-300 dark:border-slate-600 dark:bg-slate-900 dark:text-slate-200 rounded p-1 focus:ring-1 focus:ring-indigo-500 focus:border-transparent"
                    placeholder="0"
                    aria-label={`Mood rating for day ${day}`}
                  />
                </div>
              ))}
            </div>
            
            {daysInMonth > 20 && (
              <div className="grid gap-1 mt-2" style={{ gridTemplateColumns: `repeat(${daysInMonth - 20}, 1fr)` }} role="grid" aria-label="Daily mood rating input final section">
                {Array.from({ length: daysInMonth - 20 }, (_, i) => i + 21).map(day => (
                  <div key={day} className="text-center" role="gridcell">
                    <div className="text-xs text-slate-500 dark:text-slate-400 mb-1">{day}</div>
                    <input
                      type="number"
                      step="1"
                      min="1"
                      max="5"
                      value={getDayData(day).mood || ''}
                      onChange={(e) => updateMood(day, parseInt(e.target.value) || 0)}
                      className="w-full text-xs text-center border border-slate-300 dark:border-slate-600 dark:bg-slate-900 dark:text-slate-200 rounded p-1 focus:ring-1 focus:ring-indigo-500 focus:border-transparent"
                      placeholder="0"
                      aria-label={`Mood rating for day ${day}`}
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

export default MoodTracker;