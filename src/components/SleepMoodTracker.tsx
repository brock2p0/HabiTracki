import React, { useState } from 'react';
import { Moon, Edit2, Plus } from 'lucide-react';
import { format, subDays } from 'date-fns';
import { useTheme } from '../contexts/ThemeContext';

interface SleepMoodTrackerProps {
  currentDate: Date;
  daysInMonth: number;
  getDayData: (day: number, date?: Date) => any;
  updateSleepQuality: (day: number, quality: number, hours?: number, date?: Date) => void;
  updateMood: (day: number, value: number, date?: Date) => void;
  viewMode: 'month' | 'week';
  currentWeekStart?: Date;
}

const SleepMoodTracker: React.FC<SleepMoodTrackerProps> = ({
  currentDate,
  daysInMonth,
  getDayData,
  updateSleepQuality,
  updateMood,
  viewMode,
  currentWeekStart
}) => {
  const { isDarkMode } = useTheme();
  const [visibleDaysOffset, setVisibleDaysOffset] = useState(0);
  const [editingDay, setEditingDay] = useState<Date | null>(null);
  const [editValues, setEditValues] = useState({ quality: 0, hours: '', mood: 0 });

  const getEmoji = (rating: number) => {
    if (rating < 1) return '😢';
    if (rating < 2) return '😕';
    if (rating < 3) return '😐';
    if (rating < 4) return '🙂';
    return '😊';
  };

  const getSleepMoodData = () => {
    const data = [];
    let daysToShow = daysInMonth;
    let startDay = 1;

    if (viewMode === 'week' && currentWeekStart) {
      const currentMonth = currentDate.getMonth();
      const currentYear = currentDate.getFullYear();

      for (let i = 0; i < 7; i++) {
        const date = new Date(currentWeekStart);
        date.setDate(currentWeekStart.getDate() + i);

        if (date.getMonth() === currentMonth && date.getFullYear() === currentYear) {
          const day = date.getDate();
          const dayData = getDayData(day, date);
          if (dayData.sleepQuality !== undefined || dayData.mood !== undefined) {
            data.push({
              day,
              sleepQuality: dayData.sleepQuality,
              sleepHours: dayData.sleepHours,
              mood: dayData.mood
            });
          }
        }
      }
      return data;
    }

    for (let day = startDay; day <= daysToShow; day++) {
      const date = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);
      const dayData = getDayData(day, date);
      if (dayData.sleepQuality !== undefined || dayData.mood !== undefined) {
        data.push({
          day,
          sleepQuality: dayData.sleepQuality,
          sleepHours: dayData.sleepHours,
          mood: dayData.mood
        });
      }
    }
    return data;
  };

  const getAverageSleep = (scope: 'week' | 'month') => {
    const data = getSleepMoodData();
    const sleepData = data.filter(d => d.sleepQuality !== undefined && d.sleepQuality > 0);

    if (sleepData.length === 0) return 0;

    let relevantData = sleepData;
    if (scope === 'week') {
      const today = new Date();
      const dayOfMonth = today.getDate();
      relevantData = sleepData.filter(d => d.day > dayOfMonth - 7 && d.day <= dayOfMonth);
    }

    const total = relevantData.reduce((sum, d) => sum + (d.sleepQuality || 0), 0);
    return Math.round((total / relevantData.length) * 10) / 10;
  };

  const getAverageMood = (scope: 'week' | 'month') => {
    const data = getSleepMoodData();
    const moodData = data.filter(d => d.mood !== undefined && d.mood > 0);

    if (moodData.length === 0) return 0;

    let relevantData = moodData;
    if (scope === 'week') {
      const today = new Date();
      const dayOfMonth = today.getDate();
      relevantData = moodData.filter(d => d.day > dayOfMonth - 7 && d.day <= dayOfMonth);
    }

    const total = relevantData.reduce((sum, d) => sum + (d.mood || 0), 0);
    return Math.round((total / relevantData.length) * 10) / 10;
  };

  const createLinePath = (dataPoints: number[], type: 'sleep' | 'mood') => {
    const data = getSleepMoodData();
    const relevantData = data.filter(d => {
      const value = type === 'sleep' ? d.sleepQuality : d.mood;
      return value !== undefined && value > 0;
    });

    if (relevantData.length < 2) return '';

    const width = 700;
    const height = 180;
    const maxValue = 5;

    const pathData = relevantData.map((point, index) => {
      const value = type === 'sleep' ? point.sleepQuality : point.mood;
      const x = (point.day / daysInMonth) * width;
      const y = height - ((value || 0) / maxValue) * height;
      return `${index === 0 ? 'M' : 'L'} ${x} ${y}`;
    }).join(' ');

    return pathData;
  };

  const getVisibleDays = () => {
    const today = new Date();
    return [
      subDays(today, visibleDaysOffset),
      subDays(today, visibleDaysOffset + 1),
      subDays(today, visibleDaysOffset + 2)
    ];
  };

  const handleEdit = (date: Date) => {
    const day = date.getDate();
    const dayData = getDayData(day, date);

    const normalizedDate = new Date(date);
    normalizedDate.setHours(0, 0, 0, 0);

    setEditingDay(normalizedDate);
    setEditValues({
      quality: dayData.sleepQuality || 0,
      hours: dayData.sleepHours ? String(dayData.sleepHours) : '',
      mood: dayData.mood || 0
    });
  };

  const handleSave = () => {
    if (!editingDay) return;

    const day = editingDay.getDate();
    const hours = editValues.hours ? parseFloat(editValues.hours) : undefined;

    if (editValues.quality > 0) {
      updateSleepQuality(day, editValues.quality, hours, editingDay);
    }
    if (editValues.mood > 0) {
      updateMood(day, editValues.mood, editingDay);
    }

    setEditingDay(null);
  };

  const avgSleepWeek = getAverageSleep('week');
  const avgSleepMonth = getAverageSleep('month');
  const avgMoodWeek = getAverageMood('week');
  const avgMoodMonth = getAverageMood('month');
  const sleepData = getSleepMoodData();

  return (
    <section className="bg-secondary-bg dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 p-6">
      <div className="flex items-center gap-2 mb-6">
        <Moon className="w-5 h-5 text-cyan-600 dark:text-cyan-400" />
        <h2 className="text-xl font-semibold text-slate-800 dark:text-slate-200">Sleep & Mood</h2>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="bg-white dark:bg-slate-800 rounded-lg p-3">
          <div className="text-xs text-slate-500 dark:text-slate-400 mb-1">Avg Sleep</div>
          <div className="text-sm font-semibold text-slate-800 dark:text-slate-200">
            This Week: {avgSleepWeek > 0 ? `${getEmoji(avgSleepWeek)} ${avgSleepWeek}/5` : '--'}
          </div>
          <div className="text-sm font-semibold text-slate-800 dark:text-slate-200 mt-1">
            This Month: {avgSleepMonth > 0 ? `${getEmoji(avgSleepMonth)} ${avgSleepMonth}/5` : '--'}
          </div>
        </div>
        <div className="bg-white dark:bg-slate-800 rounded-lg p-3">
          <div className="text-xs text-slate-500 dark:text-slate-400 mb-1">Avg Mood</div>
          <div className="text-sm font-semibold text-slate-800 dark:text-slate-200">
            This Week: {avgMoodWeek > 0 ? `${getEmoji(avgMoodWeek)} ${avgMoodWeek}/5` : '--'}
          </div>
          <div className="text-sm font-semibold text-slate-800 dark:text-slate-200 mt-1">
            This Month: {avgMoodMonth > 0 ? `${getEmoji(avgMoodMonth)} ${avgMoodMonth}/5` : '--'}
          </div>
        </div>
      </div>

      {/* Chart */}
      <div className="mb-6">
        <div className="relative bg-white dark:bg-slate-800 rounded-lg p-6">
          <svg width="750" height="220" viewBox="0 0 750 220" className="w-full h-auto" preserveAspectRatio="xMidYMid meet">
            {/* Grid lines */}
            {[0, 1, 2, 3, 4, 5].map(rating => (
              <g key={rating}>
                <line
                  x1="40"
                  y1={200 - (rating / 5) * 180}
                  x2="720"
                  y2={200 - (rating / 5) * 180}
                  stroke={isDarkMode ? '#334155' : '#e2e8f0'}
                  strokeWidth="1"
                />
                <text
                  x="30"
                  y={205 - (rating / 5) * 180}
                  fontSize="12"
                  textAnchor="end"
                  fill={isDarkMode ? '#94a3b8' : '#64748b'}
                >
                  {rating}
                </text>
              </g>
            ))}

            {/* Sleep quality line */}
            {sleepData.filter(d => d.sleepQuality).length > 1 && (
              <path
                d={createLinePath([], 'sleep')}
                fill="none"
                stroke={isDarkMode ? '#22d3ee' : '#06b6d4'}
                strokeWidth="3"
                transform="translate(40, 20)"
              />
            )}

            {/* Sleep quality points with hour labels */}
            {sleepData.filter(d => d.sleepQuality).map(point => {
              const x = 40 + (point.day / daysInMonth) * 700;
              const y = 200 - ((point.sleepQuality || 0) / 5) * 180;
              return (
                <g key={`sleep-${point.day}`}>
                  <circle
                    cx={x}
                    cy={y}
                    r="5"
                    fill={isDarkMode ? '#22d3ee' : '#06b6d4'}
                    stroke={isDarkMode ? '#0e7490' : '#0891b2'}
                    strokeWidth="2"
                  />
                  {point.sleepHours && (
                    <text
                      x={x}
                      y={y - 12}
                      fontSize="11"
                      fontWeight="500"
                      fill={isDarkMode ? '#94a3b8' : '#6b7280'}
                      textAnchor="middle"
                    >
                      {point.sleepHours}h
                    </text>
                  )}
                </g>
              );
            })}

            {/* Mood line */}
            {sleepData.filter(d => d.mood).length > 1 && (
              <path
                d={createLinePath([], 'mood')}
                fill="none"
                stroke={isDarkMode ? '#fb923c' : '#f97316'}
                strokeWidth="3"
                transform="translate(40, 20)"
              />
            )}

            {/* Mood points */}
            {sleepData.filter(d => d.mood).map(point => {
              const x = 40 + (point.day / daysInMonth) * 700;
              const y = 200 - ((point.mood || 0) / 5) * 180;
              return (
                <circle
                  key={`mood-${point.day}`}
                  cx={x}
                  cy={y}
                  r="5"
                  fill={isDarkMode ? '#fb923c' : '#f97316'}
                  stroke={isDarkMode ? '#c2410c' : '#ea580c'}
                  strokeWidth="2"
                />
              );
            })}

            {/* Legend */}
            <g transform="translate(280, 210)">
              <circle cx="0" cy="0" r="5" fill={isDarkMode ? '#22d3ee' : '#06b6d4'} />
              <text x="12" y="5" fontSize="13" fontWeight="500" fill={isDarkMode ? '#cbd5e1' : '#475569'}>Sleep Quality</text>
              <circle cx="130" cy="0" r="5" fill={isDarkMode ? '#fb923c' : '#f97316'} />
              <text x="142" y="5" fontSize="13" fontWeight="500" fill={isDarkMode ? '#cbd5e1' : '#475569'}>Mood</text>
            </g>
          </svg>
        </div>
      </div>

      {/* Recent Entries */}
      <div className="space-y-2">
        <h3 className="text-sm font-medium text-slate-600 dark:text-slate-400 mb-3">Recent Entries</h3>
        {getVisibleDays().map((date) => {
          const day = date.getDate();
          const dayData = getDayData(day, date);

          const normalizedDate = new Date(date);
          normalizedDate.setHours(0, 0, 0, 0);
          const isEditing = editingDay?.getTime() === normalizedDate.getTime();
          const isToday = date.toDateString() === new Date().toDateString();

          return (
            <div
              key={date.toISOString()}
              className="bg-white dark:bg-slate-800 rounded-lg p-3 border border-slate-200 dark:border-slate-700"
            >
              {isEditing ? (
                <div className="space-y-3">
                  <div className="font-medium text-slate-800 dark:text-slate-200">
                    {format(date, 'EEEE, MMM d')}
                  </div>

                  <div>
                    <label className="text-xs text-slate-600 dark:text-slate-400">Sleep Quality /5</label>
                    <input
                      type="number"
                      min="0"
                      max="5"
                      step="1"
                      value={editValues.quality}
                      onChange={(e) => setEditValues({...editValues, quality: parseInt(e.target.value) || 0})}
                      className="w-full mt-1 px-3 py-2 border border-slate-300 dark:border-slate-600 dark:bg-slate-900 dark:text-slate-200 rounded focus:ring-2 focus:ring-cyan-500"
                    />
                    <div className="text-xs text-slate-500 dark:text-slate-400 mt-1">5=Excellent, 1=Bad</div>
                  </div>

                  <div>
                    <label className="text-xs text-slate-600 dark:text-slate-400">Hours Slept (optional)</label>
                    <input
                      type="number"
                      min="0"
                      max="12"
                      step="0.5"
                      value={editValues.hours}
                      onChange={(e) => setEditValues({...editValues, hours: e.target.value})}
                      placeholder="e.g., 7.5"
                      className="w-full mt-1 px-3 py-2 border border-slate-300 dark:border-slate-600 dark:bg-slate-900 dark:text-slate-200 rounded focus:ring-2 focus:ring-cyan-500"
                    />
                  </div>

                  <div>
                    <label className="text-xs text-slate-600 dark:text-slate-400">Mood /5</label>
                    <input
                      type="number"
                      min="0"
                      max="5"
                      step="1"
                      value={editValues.mood}
                      onChange={(e) => setEditValues({...editValues, mood: parseInt(e.target.value) || 0})}
                      className="w-full mt-1 px-3 py-2 border border-slate-300 dark:border-slate-600 dark:bg-slate-900 dark:text-slate-200 rounded focus:ring-2 focus:ring-cyan-500"
                    />
                  </div>

                  <div className="flex gap-2">
                    <button
                      onClick={handleSave}
                      className="flex-1 px-4 py-2 bg-cyan-600 text-white rounded-lg hover:bg-cyan-700 transition-colors"
                    >
                      Save
                    </button>
                    <button
                      onClick={() => setEditingDay(null)}
                      className="flex-1 px-4 py-2 bg-slate-200 dark:bg-slate-700 text-slate-800 dark:text-slate-200 rounded-lg hover:bg-slate-300 dark:hover:bg-slate-600 transition-colors"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="font-medium text-slate-800 dark:text-slate-200 mb-1">
                      {isToday ? 'Today' : format(date, 'EEEE')}, {format(date, 'MMM d')}
                    </div>
                    <div className="text-sm text-slate-600 dark:text-slate-400">
                      Sleep: {dayData.sleepQuality ? (
                        <>
                          {getEmoji(dayData.sleepQuality)} {dayData.sleepQuality}/5
                          {dayData.sleepHours && ` (${dayData.sleepHours}h)`}
                        </>
                      ) : '—'}
                    </div>
                    <div className="text-sm text-slate-600 dark:text-slate-400">
                      Mood: {dayData.mood ? `${getEmoji(dayData.mood)} ${dayData.mood}/5` : '—'}
                    </div>
                  </div>
                  <button
                    onClick={() => handleEdit(date)}
                    className="p-2 text-slate-600 dark:text-slate-400 hover:text-cyan-600 dark:hover:text-cyan-400 transition-colors"
                  >
                    {isToday && !dayData.sleepQuality && !dayData.mood ? <Plus className="w-5 h-5" /> : <Edit2 className="w-5 h-5" />}
                  </button>
                </div>
              )}
            </div>
          );
        })}

        {visibleDaysOffset < 87 && (
          <button
            onClick={() => setVisibleDaysOffset(prev => prev + 3)}
            className="w-full py-2 text-sm text-cyan-600 dark:text-cyan-400 hover:text-cyan-700 dark:hover:text-cyan-300 transition-colors"
          >
            Load More Days
          </button>
        )}
      </div>
    </section>
  );
};

export default SleepMoodTracker;
